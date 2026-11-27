# Film Photo Platform — Web Portal

[![API Contract](https://github.com/LeQuangVinh11022004/film-photo-platform-web/actions/workflows/api-contract.yml/badge.svg)](https://github.com/LeQuangVinh11022004/film-photo-platform-web/actions/workflows/api-contract.yml)
[![Next.js](https://img.shields.io/badge/Next.js-16.3.8-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

Web portal for **FA26SE091 — Platform Connecting the Film Photography Community with Darkroom and Studio Services**. This capstone project connects film photographers with darkrooms, photography studios, analog equipment, darkroom chemicals, and related creative services.

> This repository contains the **Next.js web portal** for **Service Providers** and **Platform Administrators** (plus public landing and account registration). Photographer mobile workflows are delivered via the companion Android app ([film-photo-platform-mobile](https://github.com/LeQuangVinh11022004/film-photo-platform-mobile/releases)).

## Project information

| | |
| --- | --- |
| Project code | `FA26SE091` (`GFA26SE169_FA26SE091`) |
| English title | Platform Connecting the Film Photography Community with Darkroom and Studio Services |
| Vietnamese title | Nền tảng kết nối cộng đồng nhiếp ảnh phim với các dịch vụ phòng tối và phòng chụp |
| Project period | September 2026 – March 2027 |
| Product in this repository | Next.js web portal for service providers and platform administrators |
| Backend integration | Capstone ASP.NET Core Web API (`https://localhost:7104` locally / Azure App Service in production) |
| Mobile app releases | [GitHub Releases — film-photo-platform-mobile](https://github.com/LeQuangVinh11022004/film-photo-platform-mobile/releases) |

### Problem and goals

Film photographers often find darkrooms, studios, equipment, and service information through disconnected channels. Availability checks, pricing, and reservations are frequently handled manually, while providers manage spaces, equipment, chemicals, maintenance, and bookings using separate tools.

The platform brings photographers and providers together, makes creative resources easier to discover and reserve, and gives providers and administrators a unified workspace to manage operations.

## Web portal routes & capabilities

Route-group names in parentheses (`(auth)`, `(provider)`, `(admin)`, `(errors)`) are for Next.js layout organization only and are **not** part of the public URL. Protected routes are guarded on the client by `RoleGuard` and `httpClient` auth interceptors.

| Area | Route | Key API-Backed Capabilities |
| --- | --- | --- |
| **Home** | `/` | Landing page + dynamic QR code & direct download button fetching the latest Android `.apk` release from GitHub Releases |
| **Authentication** | `/login` | Sign in for Admin and Provider accounts (`POST /api/auth/login`) |
| | `/register` | Photographer account registration (`POST /api/auth/register/photographer`) |
| | `/register-provider` | Provider business registration (`POST /api/auth/register/provider`) |
| | `/forgot-password`, `/reset-password` | Explain that password recovery is not available in the current backend |
| **Provider Workspace** | `/provider/dashboard` | Backend metrics and booking analytics (booking charts use at most the first 100 records) |
| | `/provider/creative-spaces` | Studio & darkroom CRUD, device image uploads, and single/bulk availability slot management (`/api/provider/spaces`, `/images`, `/availability`) |
| | `/provider/equipment` | **3 tabs:**<br>1. **Equipment:** CRUD studio/darkroom gear (`/api/provider/equipment`)<br>2. **Darkroom Chemicals:** CRUD consumables, low-stock alerts, and stock movement adjustments (`/api/provider/chemicals`, `/stock-adjustments`)<br>3. **Maintenance Schedule:** CRUD maintenance logs for studios, darkrooms, and equipment (`/api/provider/maintenance`) |
| | `/provider/packages` | **2 tabs:**<br>1. **Service Packages:** CRUD packages and attach/remove package items across `STUDIO`, `DARKROOM`, `EQUIPMENT`, `CHEMICAL`, and `SERVICE` (`/api/provider/service-packages`, `/{id}/items`)<br>2. **Standalone Services:** CRUD add-on services (`/api/provider/services`) |
| | `/provider/reservations` | Reservation queue, booking approval/rejection (`PATCH /decision`), resource schedule allocations, and slot reallocation (`/api/provider/bookings`, `/{id}/allocations`) |
| | `/provider/settings` | Provider business profile management (`GET / PUT /api/provider/account`), theme & language settings |
| **Administration** | `/admin/dashboard` | Platform-wide live metrics and operational summary (`GET /api/admin/dashboard`) |
| | `/users` | User management CRUD and status toggle across `PHOTOGRAPHER`, `PROVIDER`, `EXPERT`, and `ADMIN` (`/api/admin/users`) |
| | `/providers` | Provider account CRUD, profile inspection, and approval workflow (`APPROVED` / `REJECTED`) (`/api/admin/providers`) |
| | `/spaces` | Creative space listing, creation, deletion and `ACTIVE` / `INACTIVE` status toggle (`/api/admin/spaces`). Editing is disabled until the admin API exposes the full details needed to preserve them. |
| | `/transactions` | Platform booking & payment inspection and `No-Show` resolution (`PATCH /api/admin/bookings/{id}/no-show`) |
| | `/settings`, `/settings/[section]` | Admin workspace preferences (`profile`, `account`, `appearance`); unsupported sections redirect to profile |
| **Error Pages** | `/errors/401`, `/errors/403`, `/errors/404` | Dedicated `401 Unauthorized`, `403 Forbidden`, and `404 Not Found` status pages |

## Technology stack

- **Framework:** Next.js 16.3.8 (App Router, Turbopack)
- **UI:** React 19.2.8, Tailwind CSS 4, Lucide React
- **Language:** TypeScript 5
- **HTTP & State:** Axios, Zustand
- **Charts & QR Codes:** Recharts, `qrcode.react`
- **API Contract & E2E Verification:** Node.js verification scripts, OpenAPI 3.0 snapshot, and GitHub Actions CI

## Project structure

```text
.
├── .github/
│   └── workflows/
│       └── api-contract.yml         # API contract CI on pushes and pull requests
├── api-contract/
│   ├── openapi.json                 # Checked-in backend OpenAPI snapshot
│   └── README.md                    # Contract update instructions
├── public/                          # Static assets and branding images
├── scripts/
│   ├── check-api-contract.mjs       # Verifies frontend calls & api-tests.http against openapi.json
│   ├── update-api-contract.mjs      # Syncs openapi.json from a running backend Swagger endpoint
│   └── generate-api-test-log.mjs    # Automated 83-step live API E2E test runner & log generator
├── src/
│   ├── app/
│   │   ├── (admin)/                 # Admin workspace routes (/admin/dashboard, /users, /providers, /spaces, /transactions, /settings)
│   │   ├── (auth)/                  # Authentication routes (/login, /register, /register-provider, /forgot-password, /reset-password)
│   │   ├── (errors)/                # Error status pages (/errors/401, /errors/403, /errors/404)
│   │   └── (provider)/              # Provider workspace routes (/provider/dashboard, /creative-spaces, /equipment, /packages, /reservations, /settings)
│   ├── features/                    # Domain modules (types, API clients, and feature components)
│   │   ├── admin-auth/
│   │   ├── admin-booking/
│   │   ├── admin-dashboard/
│   │   ├── admin-notification/
│   │   ├── admin-provider/
│   │   ├── admin-space/
│   │   ├── admin-user/
│   │   ├── creative-space/
│   │   ├── equipment/
│   │   ├── provider-account/
│   │   ├── provider-chemical/
│   │   ├── provider-dashboard/
│   │   ├── provider-maintenance/
│   │   ├── provider-service/
│   │   ├── provider-space/
│   │   ├── reservation/
│   │   └── service-package/
│   ├── services/                    # API base URL resolver, endpoint constants, Axios client, auth token helpers
│   ├── shared/                      # Shared UI components, workspace shells, RoleGuard, i18n (EN/VI), utilities
│   ├── store/                       # Zustand auth & session store
│   └── types/                       # Shared TypeScript pagination & common types
├── api-test.log                     # Auto-generated execution log from npm run test:api-log
├── api-tests.http                   # Manually runnable REST Client requests covering all 82 backend operations
├── next.config.ts                   # API and upload rewrite proxy configuration
└── package.json
```

## Requirements

- Node.js **22 LTS (22.13 or later) or 24 LTS**
- npm (uses `package-lock.json`)
- Capstone Backend API (`GFA26SE169_FA26SE091_API`) for authenticated workflows

## Installation and local development

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Sign in with a username and password. Google sign-in and password recovery are
not available in the current backend. Admins can set usernames when creating
or editing users. Providers can check in or check out eligible booking segments
and cancel eligible bookings from Reservations; cancellations may create a
pending refund or restore a package use.

Admin dashboard booking value sums confirmed, in-progress and completed
bookings; it is not collected revenue. Charts use up to 1,000 records per
list and indicate when the sample is incomplete. Provider-name charts group
by the name returned by the API, not a unique provider ID.

### Environment configuration (`.env.local`)

The Next.js app supports either **proxying requests** through `/api/*` and `/uploads/*` via `next.config.ts` or calling `NEXT_PUBLIC_API_URL` directly:

- **Local Development (with local backend running on `https://localhost:7104`):**
  ```dotenv
  NEXT_PUBLIC_APK_DOWNLOAD_URL=https://github.com/LeQuangVinh11022004/film-photo-platform-mobile/releases/latest/download/app-release.apk
  NEXT_PUBLIC_API_URL=https://localhost:7104/api
  API_PROXY_TARGET=https://localhost:7104
  ```
- **Production / Deployed Backend (Azure App Service):**
  ```dotenv
  NEXT_PUBLIC_APK_DOWNLOAD_URL=https://github.com/LeQuangVinh11022004/film-photo-platform-mobile/releases/latest/download/app-release.apk
  NEXT_PUBLIC_API_URL=https://filmbooking-api-h7bghwcydwb8eecn.japaneast-01.azurewebsites.net/api
  API_PROXY_TARGET=https://filmbooking-api-h7bghwcydwb8eecn.japaneast-01.azurewebsites.net
  ```
  *(Note: `src/services/config.ts` automatically normalizes `NEXT_PUBLIC_API_URL` so it always ends with `/api`, and `next.config.ts` automatically strips any accidental trailing `/api` from `API_PROXY_TARGET` and defaults to the Azure backend when `NODE_ENV === "production"`).*

## Common commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local Next.js development server |
| `npm run build` | Create an optimized production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint across the project |
| `npm run typecheck` | Run the TypeScript compiler (`tsc --noEmit`) |
| `npm run test:api-contract` | Compare frontend routes, manual requests and selected request fields against `api-contract/openapi.json` |
| `npm run test:dashboard` | Check admin booking-value and trend aggregation |
| `npm run test:api-log` | Run the live API integration test suite and generate `api-test.log` |
| `npm run update:api-contract` | Fetch the latest backend OpenAPI document into `api-contract/openapi.json` |

## API testing, logging, and CI

### 1. Static API contract check (`npm run test:api-contract`)
Runs locally and in GitHub Actions on every push and pull request. It compares frontend `httpClient` calls and manual requests with the checked-in OpenAPI routes, checks the login request and selected registration, chemical and package request fields. `npm run test:dashboard` also runs in CI. These checks do not replace integration tests of backend behavior. Explicitly listed exceptions cover backend operations outside the admin/provider workspace without manual examples; the checker reports their counts.

When the backend API changes:
1. Start the backend locally (`http://localhost:5038/swagger/v1/swagger.json`).
2. Run `npm run update:api-contract`.
3. Update frontend API calls and `api-tests.http`, then verify with `npm run test:api-contract`.

### 2. Automated live API test suite & log generator (`npm run test:api-log`)
With the test backend running on `https://localhost:7104`, set its URL and test account credentials in the current PowerShell session:

```powershell
$env:TEST_API_BASE_URL = "https://localhost:7104/api"
$env:TEST_ADMIN_USERNAME = "<admin username>"
$env:TEST_ADMIN_PASSWORD = "<admin password>"
$env:TEST_PROVIDER_USERNAME = "<provider username>"
$env:TEST_PROVIDER_PASSWORD = "<provider password>"
npm run test:api-log
```

This executes API requests across **Auth**, **Admin**, and **Provider**, including create, update and delete operations, and writes a timestamped execution report to [`api-test.log`](./api-test.log). Use a dedicated test database: failures can leave temporary records behind. Refresh the OpenAPI snapshot when the backend contract changes. Apart from the login request fields, the static check does not validate request or response schemas.

### 3. Manual REST Client requests (`api-tests.http`)
Open [`api-tests.http`](./api-tests.http) with the VS Code **REST Client** extension to run individual requests interactively against the backend.

## Documentation

- [API contract update guide](./api-contract/README.md)
- [Contributing guide](./CONTRIBUTING.md)
- [Code of Conduct](./CODE_OF_CONDUCT.md)
- [Security policy](./SECURITY.md)
- [License (MIT)](./LICENSE)
