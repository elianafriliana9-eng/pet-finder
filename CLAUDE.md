# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

StreetPet Rescue & Adoption — mobile-first PWA for reporting stray street animals (Indonesia, UI copy is Bahasa Indonesia), spatial discovery, community street-feeding check-ins, shelter verification, and adoption screening. Non-profit; "Zero Commercial Policy" (no animal sales) is a product rule enforced by community flagging.

`prd.md` = requirements (features reference PRD section numbers in code comments). `update.md` = running changelog + seeded test accounts; append to it when finishing significant work.

Two independent apps, no monorepo tooling: `backend/` (Laravel 13 API) and `frontend/` (React 19 + Vite).

## Commands

```bash
# Backend — must run on 8001 (frontend proxy targets it; 8000 is used by another local app)
cd backend && php artisan serve --port=8001
cd backend && php artisan migrate:fresh --seed   # reset MySQL `pet_finder` + test accounts
cd backend && composer test                       # or: php artisan test --filter=TestName
cd backend && ./vendor/bin/pint                   # PHP formatting

# Frontend
cd frontend && npm run dev      # :5173, proxies /api and /storage to 127.0.0.1:8001
cd frontend && npm run build    # tsc -b && vite build
cd frontend && npm run lint     # oxlint
```

DB is MySQL (not the Laravel-default sqlite) — spatial queries depend on it. `php artisan storage:link` must exist for uploaded images to resolve.

`phpunit.xml` pins tests to sqlite `:memory:`, so anything touching `ST_Distance_Sphere` (i.e. `scopeWithinDistance`) cannot run under the default test config — point such tests at MySQL explicitly. `tests/` currently holds only the Laravel `ExampleTest` stubs; there is no existing suite to follow.

## Architecture

**API surface**: all routes in `backend/routes/api.php`, thin controllers under `app/Http/Controllers/Api/` — no form requests, services, or resources; validation and response shaping live inline in controllers. Auth is Sanctum bearer tokens (`statefulApi()` middleware in `bootstrap/app.php`); every JSON response uses `{ status: 'success'|'error', ... }`.

**Roles** (`users.role`): `admin`, `shelter`, `reporter`. `reporter` is the unified "Warga / Citizen" role — it can report, adopt, check-in, and chat; there is no separate adopter role. Check via `User::isAdmin()/isShelter()/isReporter()`. Admin routes are grouped under `/api/admin` but authorization is asserted inside `ModerationController`, not by middleware.

**Spatial discovery**: `Report::scopeWithinDistance()` uses MySQL `ST_Distance_Sphere(POINT(lng, lat), ...)` and appends a `distance_meters` column; `scopeVisible()` filters `is_hidden`. `GET /api/reports` falls back to `latest()` when no lat/lng is passed. Frontend passes lat/lng/radius from the ExplorePage slider (1–50 km).

**Location masking** (PRD 4.2): when a *verified* shelter creates a report, `ReportController::store()` jitters the coordinates ~±500m and sets `is_masked` — the raw point is never stored. Shelters separately keep `raw_lat/lng` vs `masked_lat/lng` on `shelter_profiles`, exposed through `ShelterProfile::getPublicCoordinatesAttribute()`. Never expose raw shelter coordinates in public payloads.

**PII**: `ReportController::formatReportForResponse()` strips `user.phone` and `user.email` from every report payload. Any new endpoint returning a report must route through it — contact happens only via in-app messaging.

**Images**: uploaded via multipart, converted to WebP (max 1200px, q80) with Intervention Image + GD, falling back to raw `storeAs` on failure. Stored under `storage/app/public/{reports,activities}`; `ReportImage` appends `image_url`/`thumbnail_url` accessors. The client also pre-compresses with `browser-image-compression` (≤800 KB) before upload.

**P2P care timeline**: `report_activities` records citizen actions (`fed`, `sighted`, `treated`, `secured`, `adopted`, `moved_location`). `recordActivity()` can mutate the parent report — it moves GPS coordinates and auto-advances status (`secured` → `rescued`, `adopted` → `adopted`). This is the main deviation from "status only changes via updateStatus".

**Moderation**: `ModerationController::flagReport()` increments `report_flags_count` and auto-hides at ≥ 3 flags. Admins can unhide via `PATCH /api/admin/reports/{id}/moderate`.

**Frontend**: `App.tsx` holds all routes flat (no route guards — pages check auth themselves via `AuthContext`). Data fetching is React Query; `src/api/client.ts` is the single axios instance (baseURL `/api`, injects `localStorage.token`, clears it on 401). Shared types in `src/types/index.ts` mirror the API payloads by hand — update both sides together.

**Styling**: Tailwind v4 (`@tailwindcss/vite`, no config file). Palette lives in the `@theme` block of `src/index.css` as `brand-*` (sky `#47acd7`) and `lilac-*` (`#c4adf5`) scales on a pure-white canvas — there is no green in the product anymore. On top sits a hand-written claymorphism layer: `.clay-card`, `.clay-card-soft`, `.clay-card-lilac`, `.clay-card-emerald` (legacy name, now a flat sky fill), `.clay-btn-primary`, `.clay-btn-lilac`, `.clay-btn-secondary`, `.clay-input`, `.clay-badge`, `.clay-lift`, plus atmosphere helpers `.clay-blob`, `.grain-overlay`, `.dot-grid`, `.text-accent-brand`, `.ticker-track`. Use these rather than inventing new shadow stacks. Two rules: clay shadows are blue-tinted, not neutral grey, and fills are flat — no color gradients anywhere (depth comes from shadow only). Fonts: Fraunces (display, via `.font-display`) + Plus Jakarta Sans (body), loaded in `index.html`.

**Sponsorship ads**: `Advertisement` + `AdvertisementController` power a separate, non-animal commercial surface — public `GET /api/ads` and `POST /api/ads/{id}/click` (impression/click counters on the row), admin CRUD under `/api/admin/ads`, rendered by `SponsoredBanner.tsx` keyed on `placement`. The Zero Commercial Policy bans animal sales, not sponsor banners; keep the two straight.

**PWA**: `vite-plugin-pwa` (`registerType: 'autoUpdate'`, dev-enabled) owns the manifest and Workbox config inline in `frontend/vite.config.ts` — there is no separate manifest file, and icons listed under `includeAssets` must exist in `frontend/public/`. Runtime caching is CacheFirst for OSM/Carto tiles and Google Fonts, and **NetworkFirst with a 15-minute expiry for `/api/(reports|shelters|ads)`** — so a stale API response in the browser is often the service worker, not the backend; unregister it before chasing a "caching bug".

**In-app navigation**: `src/utils/routing.ts` calls public OSRM demo servers (`routed-car` vs `routed-bike` to model toll avoidance) — an external, unauthenticated dependency with no key and no SLA. `src/utils/liveNavigation.ts` layers turn-by-turn tracking on top with Haversine distance and Indonesian `speechSynthesis` voice prompts. `useSEO` mutates document title/meta/JSON-LD imperatively per page (no helmet library).

**Deployment**: backend to Railway via either `backend/Dockerfile` (php:8.4-cli-alpine) or `nixpacks.toml` — both run `migrate --force && storage:link && artisan serve`; PHP must be 8.4. Frontend to Vercel; `vercel.json` rewrites everything to `/index.html` for the flat SPA routes. In production the Vite proxy is gone: `VITE_API_URL` overrides the `/api` baseURL in `client.ts`, and the origin must match `config/cors.php` (`FRONTEND_URL` env plus a `*.vercel.app` pattern).

**No emoji** anywhere in the codebase or UI (0-emoji policy) — use Lucide icons or inline SVG.
