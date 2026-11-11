# Film Photo Platform — Web Portal

[![API Contract](https://github.com/LeQuangVinh11022004/film-photo-platform-web/actions/workflows/api-contract.yml/badge.svg)](https://github.com/LeQuangVinh11022004/film-photo-platform-web/actions/workflows/api-contract.yml)
[![Next.js](https://img.shields.io/badge/Next.js-16.3.8-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

Web portal for **FA26SE091 — Platform Connecting the Film Photography Community with Darkroom and Studio Services**. This capstone project aims to connect film photographers with darkrooms, photography studios, equipment, and related creative services.

> This repository contains the web frontend. The project proposal also describes mobile, backend, and AI components; those are not all implemented in this repository.

## Project information

| | |
| --- | --- |
| Project code | `FA26SE091` |
| English title | Platform Connecting the Film Photography Community with Darkroom and Studio Services |
| Vietnamese title | Nền tảng kết nối cộng đồng nhiếp ảnh phim với các dịch vụ phòng tối và phòng chụp |
| Project period | September 2026 – March 2027 |
| Product in this repository | Next.js web portal for service providers and platform administrators |
| Backend integration | Separate capstone API; local development proxy defaults to `http://localhost:5038` |

### Problem and goals

Film photographers often find darkrooms, studios, equipment, and service information through disconnected channels. Availability checks, pricing, and reservations may be handled manually, while providers manage spaces, equipment, and bookings using separate tools.

The proposed platform brings photographers and providers together, makes creative resources easier to discover and reserve, and gives providers tools to manage their services and operations.

### Roles and proposed capabilities

The capstone proposal describes these roles and product capabilities:

- **Photographer:** discover and compare creative spaces, check availability, reserve resources, manage bookings, and participate in the photography community.
- **Service provider:** manage a business profile, spaces, equipment, service packages, pricing, availability, and reservations.
- **Photography expert:** share educational content, reviews, darkroom techniques, and workshops.
- **Administrator:** manage users and providers, oversee platform content and transactions, handle disputes, and review reports.
- **AI assistant and services:** provide photography-related assistance and support proposed recommendations and resource planning.

The broader proposal also covers payments, reviews, maintenance and resource lifecycle management, business analytics, workshops, community content, and AI-assisted image and booking features. These are project goals, not a claim that every capability is currently available in this web repository.

## Current web portal

The frontend currently provides route groups for authentication, provider workflows, and administration. Route-group names in parentheses are Next.js organization only and are **not** part of the public URL.

| Area | Routes |
| --- | --- |
| Home | `/` |
| Authentication | `/login`, `/register`, `/register-provider`, `/forgot-password`, `/reset-password` |
| Provider workspace | `/provider/dashboard`, `/provider/creative-spaces`, `/provider/equipment`, `/provider/packages`, `/provider/pricing-policy`, `/provider/rating-feedback`, `/provider/reservations`, `/provider/transaction`, `/settings/profile` |
| Administration | `/admin/dashboard`, `/content`, `/disputes`, `/providers`, `/reports`, `/settings`, `/settings/[section]`, `/spaces`, `/transactions`, `/users` |
| Error pages | `/errors`, `/errors/401`, `/errors/403`, `/errors/404` |

API-backed operations that have a backend OpenAPI contract are tracked in `api-contract/openapi.json`. Some screens and proposal capabilities may still use sample UI or await backend integration.

## Technology

- **Framework:** Next.js App Router 16
- **UI:** React 19, Tailwind CSS 4, Lucide React
- **Language:** TypeScript 5
- **HTTP and state:** Axios, Zustand
- **Charts and QR codes:** Recharts, `qrcode.react`
- **API contract checks:** Node.js scripts and GitHub Actions

## Project structure

```text
.
├── .github/
│   └── workflows/
│       └── api-contract.yml       # API contract CI on pushes and pull requests
├── api-contract/
│   ├── openapi.json               # Checked-in backend OpenAPI snapshot
│   └── README.md                  # Contract update instructions
├── public/                        # Static assets and downloadable files
├── scripts/                       # API contract check/update scripts
├── src/
│   ├── app/
│   │   ├── (admin)/               # Admin routes and layout
│   │   ├── (auth)/                # Login, registration, password pages
│   │   ├── (errors)/              # Error pages
│   │   └── (provider)/            # Provider routes and layout
│   ├── features/                  # Feature types, API clients, and UI
│   ├── services/                  # API config, endpoints, HTTP client
│   ├── shared/                    # Shared components, layouts, i18n, utilities
│   ├── store/                     # Shared client state
│   └── types/                     # Shared TypeScript types
├── api-tests.http                 # Manually runnable REST Client requests
├── next.config.ts                 # Local API and upload proxy
└── package.json
```

### Feature modules

`src/features` is organized by product domain, including admin authentication, dashboard, bookings, providers, users, spaces, content and notifications; provider profile and spaces; reservations; creative spaces; equipment; and service packages. Feature API clients use the shared HTTP client and endpoint definitions where implemented.

## Requirements

- Node.js **22 LTS (22.13 or later) or 24 LTS**
- npm (the repository includes `package-lock.json`)
- Backend API for authenticated and API-backed workflows

## Installation and local development

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The development server proxies `/api/*` and `/uploads/*` to the backend. The default proxy target is `http://localhost:5038`. Start the backend separately for API-backed pages; override the target in `.env.local` if it runs elsewhere:

```dotenv
API_PROXY_TARGET=http://localhost:5038
NEXT_PUBLIC_API_URL=
```

Leave `NEXT_PUBLIC_API_URL` empty for local development to use the same-origin proxy. If you set it to a direct backend URL, restart the Next.js server after changing the environment file. Do not commit `.env.local`, credentials, or tokens.

## Common commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run the TypeScript compiler without emitting files |
| `npm run test:api-contract` | Check frontend API calls against the request list and OpenAPI snapshot |
| `npm run update:api-contract` | Fetch the current backend OpenAPI document into the snapshot |

## API testing and CI

The API contract check runs locally with `npm run test:api-contract` and automatically in GitHub Actions on every push and pull request. It checks API methods and routes against the checked-in OpenAPI snapshot; it does not send requests to a running backend.

When the backend API changes:

1. Start the backend locally (default OpenAPI URL: `http://localhost:5038/swagger/v1/swagger.json`).
2. Run `npm run update:api-contract`.
3. Review the changes to `api-contract/openapi.json`, update frontend API requests as needed, and run `npm run test:api-contract`.
4. Commit the reviewed contract and related code changes together.

To fetch the OpenAPI document from another address, set `API_OPENAPI_URL` for the update command. For example, in PowerShell:

```powershell
$env:API_OPENAPI_URL = "http://localhost:5038/swagger/v1/swagger.json"
npm run update:api-contract
```

For individual manual requests, open `api-tests.http` with the VS Code REST Client extension, set its placeholder credentials and IDs, then use **Send Request**. Mutating requests can create, update, or delete backend data, so use a test backend and test accounts.

## Backend integration notes

- The frontend expects a separate backend API. `API_PROXY_TARGET` controls where the local Next.js proxy sends API and upload requests.
- Provider space image uploads use `POST /provider/spaces/{spaceId}/images/upload` with `multipart/form-data`. In local development, `/uploads/*` is proxied to the backend.
- Google OAuth credentials, password reset tokens, email delivery, and other secrets belong on the backend, not in frontend source or public environment variables.

## Documentation

- [API contract update guide](./api-contract/README.md)
- [Next.js documentation](https://nextjs.org/docs)
