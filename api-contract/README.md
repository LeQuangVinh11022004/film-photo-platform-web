# API contract checks

Run `npm run test:api-contract` to compare frontend `httpClient` calls and the
requests in `api-tests.http` with the checked-in backend OpenAPI document.

When the backend API changes, start the backend and run
`npm run update:api-contract`, then review and commit the updated
`api-contract/openapi.json` together with the corresponding frontend/API test
changes. The CI workflow runs the contract check on every push and pull request.

The contract check does not send requests to the backend or run mutating API
operations. The manually runnable requests in `api-tests.http` remain separate.
Known frontend routes absent from the current backend OpenAPI document are
allowlisted in `scripts/check-api-contract.mjs`; remove an exception when the
backend contract is fixed.
