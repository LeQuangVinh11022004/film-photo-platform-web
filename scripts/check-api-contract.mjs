import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const methods = new Set(["get", "post", "put", "patch", "delete"]);
const knownUndocumentedRoutes = new Set([
  "POST /api/auth/forgot-password",
  "POST /api/auth/reset-password",
]);
// New backend operations outside the admin/provider workspace do not yet have REST Client examples.
const knownUntestedBackendRoutes = new Set([
  "DELETE /api/community/posts/{id}",
  "DELETE /api/community/posts/{id}/comments/{id}",
  "DELETE /api/community/posts/{id}/like",
  "DELETE /api/expert/articles/{id}",
  "GET /api/articles",
  "GET /api/articles/{id}",
  "GET /api/community/posts",
  "GET /api/community/posts/mine",
  "GET /api/community/posts/{id}",
  "GET /api/community/posts/{id}/comments",
  "GET /api/expert/articles",
  "GET /api/expert/articles/{id}",
  "GET /api/payments/vnpay/ipn",
  "GET /api/payments/vnpay/return",
  "GET /api/photographer/darkrooms/{id}/chemicals",
  "GET /api/photographer/darkrooms/{id}/reviews",
  "GET /api/photographer/equipment/{id}/availability",
  "GET /api/photographer/package-subscriptions",
  "GET /api/photographer/package-subscriptions/{id}",
  "GET /api/photographer/service-packages",
  "GET /api/photographer/spaces/{id}/equipment",
  "GET /api/photographer/studios/{id}/reviews",
  "PATCH /api/expert/articles/{id}/status",
  "POST /api/community/posts",
  "POST /api/community/posts/{id}/comments",
  "POST /api/expert/articles",
  "POST /api/photographer/bookings/{id}/deposit-payment",
  "POST /api/photographer/bookings/{id}/review",
  "POST /api/photographer/service-packages/{id}/purchase",
  "PUT /api/community/posts/{id}",
  "PUT /api/community/posts/{id}/comments/{id}",
  "PUT /api/community/posts/{id}/like",
  "PUT /api/expert/articles/{id}",
]);

function normalizePath(value) {
  return value.replace(/\{[^}]+\}/g, "{id}").replace(/\/+/g, "/");
}

function operationKey(method, route) {
  return `${method.toUpperCase()} ${normalizePath(route)}`;
}

function unwrap(expression) {
  while (
    ts.isAsExpression(expression) ||
    ts.isTypeAssertionExpression(expression) ||
    ts.isParenthesizedExpression(expression) ||
    ts.isSatisfiesExpression(expression)
  ) {
    expression = expression.expression;
  }
  return expression;
}

function propertyPath(expression) {
  if (ts.isIdentifier(expression)) return [expression.text];
  if (ts.isPropertyAccessExpression(expression)) {
    return [...propertyPath(expression.expression), expression.name.text];
  }
  return [];
}

function getPropertyName(name) {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name)) return name.text;
  return undefined;
}

function findEndpointsObject(sourceFile) {
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (ts.isIdentifier(declaration.name) && declaration.name.text === "endpoints" && declaration.initializer) {
        const initializer = unwrap(declaration.initializer);
        if (ts.isObjectLiteralExpression(initializer)) return initializer;
      }
    }
  }
  throw new Error("Could not find the endpoints object in src/services/endpoints.ts.");
}

function resolveEndpointReference(expression, endpointsObject) {
  const segments = propertyPath(expression);
  if (segments[0] !== "endpoints" || segments.length < 2) return undefined;

  let current = endpointsObject;
  for (const segment of segments.slice(1)) {
    if (!ts.isObjectLiteralExpression(current)) return undefined;
    const property = current.properties.find(
      (candidate) =>
        ts.isPropertyAssignment(candidate) &&
        getPropertyName(candidate.name) === segment,
    );
    if (!property || !ts.isPropertyAssignment(property)) return undefined;
    current = unwrap(property.initializer);
  }
  return ts.isStringLiteralLike(current) ? current.text : undefined;
}

function resolvePathExpression(expression, endpointsObject) {
  expression = unwrap(expression);
  if (ts.isStringLiteralLike(expression)) return expression.text;
  if (ts.isNoSubstitutionTemplateLiteral(expression)) return expression.text;

  const endpoint = resolveEndpointReference(expression, endpointsObject);
  if (endpoint !== undefined) return endpoint;

  if (ts.isTemplateExpression(expression)) {
    let result = expression.head.text;
    for (const span of expression.templateSpans) {
      const staticPart = resolveEndpointReference(span.expression, endpointsObject);
      result += staticPart ?? "{id}";
      result += span.literal.text;
    }
    return result;
  }

  if (
    ts.isCallExpression(expression) ||
    ts.isIdentifier(expression) ||
    ts.isPropertyAccessExpression(expression)
  ) {
    return "{id}";
  }

  throw new Error(`Unsupported API URL expression: ${expression.getText()}`);
}

async function findTypeScriptFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await findTypeScriptFiles(entryPath)));
    } else if (/\.(ts|tsx)$/.test(entry.name) && !entry.name.endsWith(".d.ts")) {
      files.push(entryPath);
    }
  }
  return files;
}

async function collectFrontendOperations() {
  const endpointsPath = path.join(root, "src", "services", "endpoints.ts");
  const endpointsFile = ts.createSourceFile(
    endpointsPath,
    await readFile(endpointsPath, "utf8"),
    ts.ScriptTarget.Latest,
    true,
  );
  const endpointsObject = findEndpointsObject(endpointsFile);
  const operations = new Map();

  for (const file of await findTypeScriptFiles(path.join(root, "src"))) {
    const source = await readFile(file, "utf8");
    const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);

    function visit(node) {
      if (
        ts.isCallExpression(node) &&
        ts.isPropertyAccessExpression(node.expression) &&
        ts.isIdentifier(node.expression.expression) &&
        node.expression.expression.text === "httpClient" &&
        methods.has(node.expression.name.text.toLowerCase()) &&
        node.arguments.length > 0
      ) {
        const method = node.expression.name.text.toUpperCase();
        const route = resolvePathExpression(node.arguments[0], endpointsObject);
        const key = operationKey(method, `/api${route}`);
        const position = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
        operations.set(key, `${path.relative(root, file)}:${position.line + 1}`);
      }
      ts.forEachChild(node, visit);
    }

    visit(sourceFile);
  }

  return operations;
}

async function collectTestOperations() {
  const contents = await readFile(path.join(root, "api-tests.http"), "utf8");
  const operations = new Set();
  for (const line of contents.split(/\r?\n/)) {
    const match = line.match(/^(GET|POST|PUT|PATCH|DELETE)\s+\{\{baseUrl\}\}(\S+)/);
    if (!match) continue;
    const route = match[2].replace(/\{\{[^}]+\}\}/g, "{id}").split("?")[0];
    operations.add(operationKey(match[1], `/api${route}`));
  }
  return operations;
}

function collectContractOperations(contract) {
  if (!contract.paths || typeof contract.paths !== "object") {
    throw new Error("The API contract has no paths object.");
  }

  const operations = new Set();
  for (const [route, pathItem] of Object.entries(contract.paths)) {
    for (const method of methods) {
      if (pathItem[method]) operations.add(operationKey(method, route));
    }
  }
  return operations;
}

function reportMissing(label, expected, actual) {
  const missing = [...expected].filter((operation) => !actual.has(operation)).sort();
  if (missing.length === 0) return [];
  console.error(`${label}:`);
  for (const operation of missing) console.error(`  - ${operation}`);
  return missing;
}

async function validateLoginContract(contract) {
  const schema = contract.components?.schemas?.LoginRequestDTO;
  if (!schema?.properties || !Array.isArray(schema.required)) {
    return ["OpenAPI login request schema is missing or invalid."];
  }
  const file = await readFile(path.join(root, "src", "features", "admin-auth", "types.ts"), "utf8");
  const source = ts.createSourceFile("types.ts", file, ts.ScriptTarget.Latest, true);
  const request = source.statements.find(
    (statement) => ts.isTypeAliasDeclaration(statement) && statement.name.text === "AdminLoginRequest",
  );
  if (!request || !ts.isTypeLiteralNode(request.type)) {
    return ["AdminLoginRequest type is missing or invalid."];
  }
  const errors = [];
  const properties = new Map(
    request.type.members.filter(ts.isPropertySignature).map((member) => [getPropertyName(member.name), member]),
  );
  for (const required of schema.required) {
    const property = properties.get(required);
    if (!property || property.questionToken || property.type?.kind !== ts.SyntaxKind.StringKeyword ||
        schema.properties[required]?.type !== "string") {
      errors.push(`AdminLoginRequest does not match required OpenAPI login property: ${required}`);
    }
  }
  for (const name of properties.keys()) {
    if (!(name in schema.properties)) errors.push(`AdminLoginRequest has a property absent from OpenAPI: ${name}`);
  }

  const manualRequests = await readFile(path.join(root, "api-tests.http"), "utf8");
  const requests = [...manualRequests.matchAll(/POST\s+\{\{baseUrl\}\}\/auth\/login\s*\r?\nContent-Type:\s*application\/json\s*\r?\n\s*\r?\n(\{[^}]*?(?:\}\}[^}]*?)*\})/g)];
  if (requests.length !== 3) {
    errors.push("Expected three manual login requests in api-tests.http.");
  } else {
    for (const [index, match] of requests.entries()) {
      const body = JSON.parse(match[1]);
      for (const required of schema.required) {
        if (typeof body[required] !== "string") errors.push(`Manual login request ${index + 1} is missing ${required}.`);
      }
      for (const name of Object.keys(body)) {
        if (!(name in schema.properties)) errors.push(`Manual login request ${index + 1} has an unknown property: ${name}`);
      }
    }
  }
  return errors;
}

try {
  const contract = JSON.parse(await readFile(path.join(root, "api-contract", "openapi.json"), "utf8"));
  const frontend = await collectFrontendOperations();
  const tests = await collectTestOperations();
  const backend = collectContractOperations(contract);
  const errors = [];
  const frontendKeys = new Set(frontend.keys());
  const undocumentedFrontend = new Set([...frontendKeys].filter((operation) => !backend.has(operation)));
  const testKeys = tests;
  const frontendOperationsRequiringTests = new Set(
    [...frontendKeys].filter((operation) => !knownUndocumentedRoutes.has(operation)),
  );

  errors.push(
    ...reportMissing("Frontend API calls missing from api-tests.http", frontendOperationsRequiringTests, testKeys),
  );
  errors.push(...reportMissing("Backend OpenAPI operations missing from api-tests.http",
    new Set([...backend].filter((operation) => !knownUntestedBackendRoutes.has(operation))), testKeys));
  for (const operation of knownUntestedBackendRoutes) {
    if (!backend.has(operation) || testKeys.has(operation)) {
      errors.push(`Remove resolved or obsolete untested backend exception: ${operation}`);
    }
  }
  errors.push(...await validateLoginContract(contract));

  for (const operation of undocumentedFrontend) {
    if (!knownUndocumentedRoutes.has(operation)) {
      console.error(`Frontend API call is not in the backend OpenAPI contract: ${operation} (${frontend.get(operation)})`);
      errors.push(operation);
    }
  }

  for (const operation of knownUndocumentedRoutes) {
    if (!frontendKeys.has(operation) || backend.has(operation)) {
      console.error(`Remove resolved or unused API contract exception: ${operation}`);
      errors.push(operation);
    }
  }

  for (const operation of tests) {
    if (!backend.has(operation) && !knownUndocumentedRoutes.has(operation)) {
      console.error(`api-tests.http contains an operation missing from OpenAPI: ${operation}`);
      errors.push(operation);
    }
  }

  if (errors.length > 0) {
    for (const error of errors) console.error(error);
    console.error(`API contract check failed with ${errors.length} issue(s).`);
    process.exitCode = 1;
  } else {
    console.log(`API contract check passed: ${frontend.size} frontend calls, ${backend.size} backend operations.`);
    console.warn(`${knownUndocumentedRoutes.size} known frontend routes remain undocumented in backend OpenAPI.`);
    console.warn(`${knownUntestedBackendRoutes.size} backend operations outside admin/provider have no manual examples.`);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
