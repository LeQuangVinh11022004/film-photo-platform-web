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
  errors.push(...reportMissing("Backend OpenAPI operations missing from api-tests.http", backend, testKeys));

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
    console.error(`API contract check failed with ${errors.length} issue(s).`);
    process.exitCode = 1;
  } else {
    console.log(`API contract check passed: ${frontend.size} frontend calls, ${backend.size} backend operations.`);
    console.warn(`${knownUndocumentedRoutes.size} known frontend routes remain undocumented in backend OpenAPI.`);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
