# Contributing to Film Photo Platform — Web Portal

Thank you for contributing to **FA26SE091 — Film Photo Platform Web Portal**! This document outlines the workflow, standards, and checks required when proposing changes.

## Prerequisites

- **Node.js:** 22 LTS (`>=22.13`) or 24 LTS
- **npm:** Included with Node.js (`package-lock.json` is tracked in git)
- **Backend API:** Required when developing or testing authenticated and live API workflows (defaults to `http://localhost:5038` / `https://localhost:7104`)

## Local Development Setup

1. Install dependencies using the lockfile:
   ```powershell
   npm ci
   ```
2. Create a local environment file from the template:
   ```powershell
   Copy-Item .env.example .env.local
   ```
3. Start the Next.js development server:
   ```powershell
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000).

## API Contract Synchronization

All frontend API calls (`httpClient.get/post/put/patch/delete`), backend OpenAPI operations (`api-contract/openapi.json`), and manual test requests (`api-tests.http`) are verified in CI via `npm run test:api-contract`.

Whenever a backend endpoint is added, updated, or removed:

1. Start the backend locally so Swagger is available.
2. Update the OpenAPI snapshot:
   ```powershell
   npm run update:api-contract
   ```
3. Update `src/services/endpoints.ts`, feature API modules in `src/features/`, and `api-tests.http` to match.
4. Verify the contract check passes:
   ```powershell
   npm run test:api-contract
   ```

## Quality Checks Before Submitting a Pull Request

Run all checks locally before opening a pull request:

```powershell
npm run test:api-contract
npm run typecheck
npm run lint
npm run build
```

## Commit and Pull Request Guidelines

- Use clear, descriptive commit messages (e.g., Conventional Commits: `feat(api): ...`, `fix(provider): ...`, `docs: ...`).
- Never commit `.env.local`, credentials, JWT tokens, or private keys.
- Fill out the pull request template with a summary of changes and verification steps.
