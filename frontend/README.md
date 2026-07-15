# Product Analytics — Frontend
 
React SPA for the Product Analytics dashboard: order data upload, report building, order-trend charts, and admin tools (orders, users) for a product analytics backend.
 
## Tech stack
 
- **React 19** + **TypeScript**
- **Vite 8** — build tool and dev server
- **TanStack Router** (file-based routing, code-split by default)
- **TanStack Query** — server state, caching, mutations
- **Tailwind CSS 4**
- **Recharts** — order trend charts
- **@hey-api/openapi-ts** — generates a typed API client from the backend's OpenAPI schema
- **axios** — HTTP client (via `@hey-api/client-axios`)
- **sonner** — toast notifications
- **lucide-react** — icons
 
## Prerequisites
 
- Node.js 20+ and npm
- The backend running and reachable (for local dev, typically `http://localhost:8000`)
## Environment variables
 
| Variable | Purpose | Example |
|---|---|---|
| `VITE_API_URL` | Base URL the frontend calls for the API. Baked in at **build time**, not read at runtime. | `http://localhost:8000` (local dev) or empty string (when served behind Caddy, which proxies `/api/*` to the backend on the same origin) |
 
Set this in a `.env` file at the frontend root for local dev, or pass it as a Docker build arg (`--build-arg VITE_API_URL=...`) for containerized builds.
 
## Getting started (local dev)
 
```bash
cd frontend
npm install
npm run dev
```
 
The dev server runs on Vite's default port (`5173`) and expects the backend to be reachable at whatever `VITE_API_URL` resolves to. There is no dev-time proxy configured in `vite.config.ts`. If you're not running behind Caddy, `VITE_API_URL` must point directly at the backend.
 
## Scripts
 
| Command | What it does |
|---|---|
| `npm run dev` | Start the Vite dev server with HMR |
| `npm run build` | Type-check (`tsc -b`) then build for production |
| `npm run preview` | Serve the production build locally, for a quick sanity check without Docker |
| `npm run lint` | Run ESLint |
| `npm run generate-client` | Regenerate `src/client-axios/` from the backend's OpenAPI schema |
 
## Regenerating the API client
 
The entire `src/client-axios/` directory is generated, not hand-written. Whenever a backend route, request body, or response schema changes, regenerate it:
 
```bash
# from the repo root
bash scripts/generate-client.sh
```
 
This imports the FastAPI app directly to produce `openapi.json`, then runs `openapi-ts` (configured in `openapi-ts.config.ts`) to regenerate the client. Commit the resulting diff in `client-axios/` along with your backend change. It is not regenerated automatically as part of the Docker build, so a stale client will silently drift from the backend if this step is skipped.(This is future improvement to add).
 
## Authentication
 
- `client.setConfig(...)` in `main.tsx` attaches the JWT from `localStorage` (`access_token`) to every request via the `auth` callback.
- Any `401` or `403` response from **any** query or mutation clears the token and redirects to `/login` (`handleApiError` in `main.tsx`, wired into `QueryCache`/`MutationCache`). This is intentionally broad — it means any admin-only endpoint (`Orders.deleteOrders`, all of `Users.*`, `Upload.uploadOrders`) must never be called from a screen a non-admin user can reach or they'll be logged out entirely rather than shown a permission error. Admin-only UI is gated by checking `currentUserQuery.data?.is_superuser` before rendering, not just before submitting.
- `isLoggedIn()` (`hooks/useAuth.ts`) is a synchronous check used in route `beforeLoad` guards. It only checks token *presence* in `localStorage`, not validity/expiry. An expired token is only caught on the first API call that returns 401.

## Routes
 
| Path | File | Notes |
|---|---|---|
| `/login` | `routes/login.tsx` | Redirects to `/` if already logged in |
| `/` | `routes/_layout/index.tsx` | Main dashboard: reports list, upload (admin), manage orders (admin) |
| `/reports/$reportId` | `routes/_layout/reports.$reportId.tsx` | Report detail with order-trend chart |
| `/users` | `routes/_layout/users.tsx` | User management — admin only; guarded in-component, not via router `beforeLoad` |
 
`routes/_layout.tsx` is the authenticated shell (top nav, avatar menu). All routes nested under `_layout/` require a token, enforced by its `beforeLoad`.
 
## Key hooks
 
Each hook wraps one resource's TanStack Query usage (queries + mutations), keeping components free of raw `client-axios` calls:
 
- `useAuth` — login/logout
- `useCurrentUser` — fetches the logged-in user via `Login.loginTestToken`; used for role-gating (`is_superuser`) and the avatar initials
- `useFetchOrders` — order listing, filtered preview, bulk delete
- `useReports` / `useCreateReport` — report CRUD
- `useUpload` — CSV upload with per-chunk success/failure status
- `useUsers` — admin user CRUD (list, create, update, delete)

## Charts
 
`components/plotting/ReportChart.tsx` aggregates a report's raw order rows client-side (no separate aggregation endpoint) into daily/weekly/monthly/yearly buckets, toggleable between order count and total quantity, rendered as a line or bar chart via Recharts. Grouping defaults to whichever granularity best fits the report's date range (`recommendGrouping`).
 
## Building and deploying
 
Production build is a two-stage Docker image: Vite build → static files served by Caddy, which also reverse-proxies `/api/*` to the backend container. See `Dockerfile` and `Caddyfile`. `VITE_API_URL` is typically left empty for this setup, since same-origin relative paths are all that's needed once Caddy is in front of both frontend and backend. See the root `docker-compose.yml` for how the two are wired together.
 
## Known gaps / things worth doing next
 
- No frontend test suite yet (backend has pytest coverage; nothing analogous here — consider Vitest + React Testing Library for the hooks and panels, particularly the upload/order-delete flows given how much error-handling logic lives in them).
- The two "Summary Table" boxes on the main dashboard (`routes/_layout/index.tsx`) are still placeholders.
- Route-level guarding for `/users` relies on the component returning early rather than a router `beforeLoad` check. Functionally fine (it prevents the admin-only query from ever firing), but worth revisiting if more admin-only routes get added, so the pattern doesn't have to be re-implemented by hand each time.