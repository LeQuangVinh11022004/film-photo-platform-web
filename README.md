# Film Photo Web

Frontend for a creative-space marketplace. App Router route groups separate workspaces without adding the group name to public URLs.

## Project structure

| Path | Responsibility | Example routes |
| --- | --- | --- |
| `src/app/(admin)` | Admin overview, users, reports, and settings | `/admin/dashboard`, `/users`, `/reports`, `/settings/profile` |
| `src/app/(provider)` | Provider workspace | `/dashboard`, `/creative-spaces`, `/equipment`, `/reservations`, `/packages` |
| `src/app/(moderator)` | Moderation and operations workspace | `/moderator/dashboard`, `/moderator/creative-spaces` |
| `src/app/(auth)` | Sign-in, registration, and password recovery | `/login`, `/register`, `/forgot-password`, `/reset-password` |
| `src/app/(errors)` | Error-state examples | `/errors/401`, `/errors/403`, `/errors/404` |
| `src/features` | Domain types and future feature API implementations | Creative spaces, equipment, reservations, service packages |
| `src/services` | API URL configuration, HTTP client, endpoint definitions | `config.ts`, `httpClient.ts`, `endpoints.ts` |
| `src/shared` | Shared UI, role layouts, providers, and admin translations | Sidebar, page headers, EN/VI dictionaries |
| `src/types` | Types shared across domains | IDs, status, pagination |

Admin metrics and provider/moderator screens are sample UI awaiting backend integration. Keep page-specific logic in its route or feature; place code in `shared` only when multiple areas use it.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Run `npm run lint`, `npm run typecheck`, and `npm run build` before handing off changes.

## Authentication API requirements

Set the backend API base URL in `.env.local` using the `NEXT_PUBLIC_API_URL` entry. `.env.example` is the tracked template. If the value is empty, the frontend uses `/api` and expects a same-origin API proxy. Restart the dev server after changing the value.

The backend must provide these routes for the auth screens:

- `GET /auth/google` starts Google OAuth and returns the user to the application after the server validates the callback.
- `POST /auth/forgot-password` accepts `{ "email": "..." }` and sends a time-limited reset link to `/reset-password?token=...`.
- `POST /auth/reset-password` accepts `{ "token": "...", "password": "..." }` and changes the password.

Google OAuth credentials, email delivery, token validation, and reset-token storage must remain configured on the backend; the frontend does not store provider secrets.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.
To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
To learn more about Next.js, take a look at the following resources:
