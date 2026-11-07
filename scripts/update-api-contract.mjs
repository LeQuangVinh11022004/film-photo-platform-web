import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const openApiUrl =
  process.env.API_OPENAPI_URL ?? "http://localhost:5038/swagger/v1/swagger.json";

try {
  const response = await fetch(openApiUrl);
  if (!response.ok) {
    throw new Error(`OpenAPI request failed: HTTP ${response.status} from ${openApiUrl}`);
  }

  const contract = await response.json();
  if (!contract.paths || typeof contract.paths !== "object") {
    throw new Error("The backend response is not a valid OpenAPI document.");
  }

  const destination = path.join(root, "api-contract", "openapi.json");
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, `${JSON.stringify(contract, null, 2)}\n`, "utf8");
  console.log(`Updated API contract from ${openApiUrl} (${Object.keys(contract.paths).length} paths).`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
