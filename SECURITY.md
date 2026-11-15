# Security Policy

## Supported Versions

This repository tracks the active web portal for **FA26SE091 — Film Photo Platform**. Security updates are applied to the `main` branch.

| Version / Branch | Supported          |
| ---------------- | ------------------ |
| `main`           | :white_check_mark: |

## Security Guidelines for Contributors

- **No secrets in source control:** Never commit `.env.local`, real user passwords, JWT tokens, API keys, or OAuth client secrets to the repository.
- **Environment variables:** Only public, non-sensitive configuration may use the `NEXT_PUBLIC_` prefix. Sensitive credentials belong on the backend API server.
- **Manual API testing:** Keep placeholder values in `api-tests.http` when committing changes.

## Reporting a Vulnerability

If you discover a security vulnerability in this project:

1. **Do not** open a public GitHub issue containing exploit details or sensitive credentials.
2. Report the vulnerability privately via [GitHub Private Vulnerability Reporting](https://github.com/LeQuangVinh11022004/film-photo-platform-web/security/advisories/new) or contact the project maintainers directly.
3. Include steps to reproduce, affected routes or components, and potential impact.

We will review and respond to reports as quickly as possible.
