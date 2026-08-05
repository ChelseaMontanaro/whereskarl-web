# Where's Karl? Client Monorepo

Public Web product for [whereskarl.live](https://whereskarl.live), plus the Expo Universal app, sharing platform-neutral packages. The shared Where's Karl backend is the source of truth for weather, Karl intelligence, best-sunshine results, and related contracts.

## Requirements

- Node.js 18+
- npm
- [WheresKarl-Backend](../WheresKarl-Backend) running locally for live API checks (optional but recommended)

## Local setup

Install from the **repository root** (npm workspaces). The Next.js app lives at `apps/web`; Expo at `apps/universal`.

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create local environment variables for Web:

   ```bash
   cp apps/web/.env.example apps/web/.env.local
   ```

3. Set `NEXT_PUBLIC_API_URL` in `apps/web/.env.local` to your local backend base URL (no trailing slash), for example:

   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

   If the backend already uses port 3000, run Next.js on another port:

   ```bash
   npm run dev:web -- --port 3001
   ```

4. Start the backend (in the backend repo):

   ```bash
   npm run dev
   ```

5. Start Web:

   ```bash
   npm run dev:web
   ```

6. Start Universal (optional):

   ```bash
   npm run dev:universal
   ```

## Environment variables

Public variables only. Do not commit `.env.local`.

| Variable | Local | Preview | Production |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Local backend URL, e.g. `http://localhost:3000` | Preview/staging API URL | `https://api.whereskarl.live` |

Universal uses `EXPO_PUBLIC_API_URL` (see `apps/universal/.env.example`). Environment resolution stays in applications; shared packages never read env vars.

## Scripts

Run from the repository root:

| Command | Purpose |
| --- | --- |
| `npm run dev:web` | Start Next.js (`apps/web`) |
| `npm run dev:universal` | Start Expo (`apps/universal`) |
| `npm run build` | Web production build |
| `npm run start:web` | Run Web production server locally |
| `npm run lint` | ESLint for Web + shared packages |
| `npm run typecheck` | TypeScript check (workspaces with `typecheck`) |
| `npm run typecheck:universal` | TypeScript check for Universal |
| `npm test` | Vitest across workspaces with tests |
| `npm run validate` | lint → typecheck → test → build:web |

`validate` reports known Web typecheck baseline failures honestly (does not mask them). See [`docs/architecture/deployment-and-validation.md`](docs/architecture/deployment-and-validation.md).

## Deploying to Vercel (Web)

Verified dashboard settings (no committed `vercel.json`):

- Framework: Next.js
- Root Directory: `apps/web`
- Build Command: `npm run build`
- Include files outside root directory: enabled

Set `NEXT_PUBLIC_API_URL` for Production and Preview in the Vercel project. Production builds fail if it is missing.

Full runbook: [`docs/architecture/deployment-and-validation.md`](docs/architecture/deployment-and-validation.md).

## Architecture

Start here:

- [`docs/architecture/system-architecture.md`](docs/architecture/system-architecture.md) — structure, ownership, data flow, where new code belongs
- [`docs/architecture/client-monorepo-architecture.md`](docs/architecture/client-monorepo-architecture.md) — long-form specification + ADRs
- [`docs/migrations/client-monorepo-completion.md`](docs/migrations/client-monorepo-completion.md) — migration closeout

Shared packages: `@whereskarl/design`, `config`, `schemas`, `api-client`, `search`, `domain`.

## Supported API contracts

Clients call the backend through `@whereskarl/api-client` and validate with `@whereskarl/schemas`.

| Endpoint | Client function |
| --- | --- |
| `GET /health` | `getHealth()` |
| `GET /current` | `getCurrent()` |
| `GET /locations` | `getLocations()` |
| `GET /best-sunshine` | `getBestSunshine()` |
| `GET /best-sunshine?lookahead=60` | `getBestSunshine({ lookahead: 60 })` |
| `GET /karl-intelligence` | `getKarlIntelligence()` |
| `GET /karl-intelligence?locationId=` | `getKarlIntelligence({ locationId })` |

## Production URLs

- Site: `https://whereskarl.live`
- API: `https://api.whereskarl.live`

## Project structure

```text
apps/web/              Next.js Web app
apps/universal/        Expo Universal app
packages/design/       Design tokens
packages/config/       Shared non-secret constants
packages/schemas/      Zod API contracts
packages/api-client/   HTTP transport
packages/search/       Catalog search
packages/domain/       Shared presentation rules
docs/architecture/     Permanent architecture docs
docs/migrations/       Migration history
```

## Product roadmap (follow-ups)

### Canonical Marine Layer Height & Fog Ceiling Intelligence

Phone Selected Location shows **Marine Layer** and **Fog Ceiling** as **Coming Soon** placeholders. Do not replace them with live feet values until this backend intelligence work lands.

Required before shipping live UI:

1. **Audit reliable upstream sources and station coverage** for marine-layer depth / fog ceiling across catalog locations (NWS/METAR, mesonet, satellite/model candidates).
2. **Define canonical backend contracts** with value, units, provenance, observed time, confidence, and unavailable handling — same surface-agnostic shape style as AQI / UV / Pollen.
3. **Determine whether NWS/METAR `ceilingFt`** (already used internally for scoring, not currently exposed on location payloads) is sufficiently representative for each catalog location, or whether per-pin fusion/gaps must be modeled explicitly.
4. **Develop a defensible marine-layer-height model** rather than deriving height from cloud cover, humidity, visibility, or fog percentage alone.
5. **Validate against observed Bay Area conditions** before replacing Coming Soon placeholders on phone Selected Location (and later native/universal).

Canonical **Climate** (Marine / Fog Belt / Transition / Sun Belt / Inland) is backend-owned location metadata shown on the phone Map environmental sheet in place of the former KHI placeholder. It is not derived from the live forecast.
