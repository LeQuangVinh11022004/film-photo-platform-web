## Summary

<!-- Briefly describe the changes introduced in this pull request. -->

## Type of Change

- [ ] `feat`: New feature or workflow
- [ ] `fix`: Bug fix
- [ ] `refactor`: Code cleanup or restructuring without changing behavior
- [ ] `docs`: Documentation or community standards update
- [ ] `chore` / `ci`: Build, dependencies, or CI configuration

## Checklist

- [ ] `npm run test:api-contract` passes (and `api-contract/openapi.json` + `api-tests.http` are updated if endpoints changed)
- [ ] `npm run typecheck` passes with 0 errors
- [ ] `npm run lint` passes with 0 errors
- [ ] `npm run build` succeeds
- [ ] No secrets, tokens, or `.env.local` files are included
