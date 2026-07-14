# Where's Karl? Web

Public web product for [whereskarl.live](https://whereskarl.live), built alongside the iOS app. The shared Where's Karl backend is the source of truth for weather, Karl intelligence, best-sunshine results, and future CDN hero imagery metadata.

## Requirements

- Node.js 18+
- npm
- [WheresKarl-Backend](../WheresKarl-Backend) running locally for live API checks (optional but recommended)

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create local environment variables:

   ```bash
   cp .env.example .env.local
   ```

3. Set `NEXT_PUBLIC_API_URL` in `.env.local` to your local backend base URL (no trailing slash), for example:

   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

   If the backend already uses port 3000, run Next.js on another port:

   ```bash
   npm run dev -- --port 3001
   ```

4. Start the backend (in the backend repo):

   ```bash
   npm run dev
   ```

5. Start the web app:

   ```bash
   npm run dev
   ```

6. Open the app in your browser at the port shown in the terminal.

## Environment variables

Public variables only. Do not commit `.env.local`.

| Variable | Local | Preview | Production |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Local backend URL, e.g. `http://localhost:3000` | Preview/staging API URL | `https://api.whereskarl.live` |

See `.env.example` for the variable contract. Production and preview hosts must set `NEXT_PUBLIC_API_URL` explicitly. The app does not fall back to localhost or mock data in production builds.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Run production server locally |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm test` | Vitest unit tests |

## Deploying to Vercel

1. Import this repository into Vercel as a Next.js project.
2. Set project environment variables:
   - **Production:** `NEXT_PUBLIC_API_URL=https://api.whereskarl.live`
   - **Preview:** point at your preview/staging API host if different
3. Use the default build settings:
   - Build command: `npm run build`
   - Output: Next.js default
4. Deploy. Vercel production builds fail if `NEXT_PUBLIC_API_URL` is missing.

Before going live, run locally:

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

## Connecting `whereskarl.live`

These steps are manual and depend on your DNS/Vercel setup:

1. Add `whereskarl.live` (and optionally `www.whereskarl.live`) as custom domains in the Vercel project.
2. Create the DNS records Vercel provides at your domain registrar.
3. Wait for DNS propagation and Vercel domain verification.
4. Confirm production environment variables are set on the production deployment target.

Do not assume the domain is connected until verification succeeds in Vercel.

## Supported API contracts

All weather and intelligence data comes from the shared backend. The web client validates responses with Zod and does not reshape payloads beyond parsing.

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

Metadata, sitemap, robots, and canonical URLs use `https://whereskarl.live`. Map styles load from public HTTPS tile/style hosts (CARTO, Esri) in the browser.

## Architecture notes

- Weather, intelligence, and hero-image URLs come from the shared backend only.
- The web app does not call Open-Meteo directly and does not implement a separate scoring model.
- Product regions remain: San Francisco, North Bay, East Bay, South Bay.
- Browser-local persistence uses:
  - `wheresKarl.web.favoriteLocationIDs`
  - `wheresKarl.web.lastKnownWeather`

## Product roadmap (follow-ups)

### Canonical Marine Layer Height & Fog Ceiling Intelligence

Phone Selected Location shows **Marine Layer** and **Fog Ceiling** as **Coming Soon** placeholders. Do not replace them with live feet values until this backend intelligence work lands.

Required before shipping live UI:

1. **Audit reliable upstream sources and station coverage** for marine-layer depth / fog ceiling across catalog locations (NWS/METAR, mesonet, satellite/model candidates).
2. **Define canonical backend contracts** with value, units, provenance, observed time, confidence, and unavailable handling — same surface-agnostic shape style as AQI / UV / Pollen.
3. **Determine whether NWS/METAR `ceilingFt`** (already used internally for scoring, not currently exposed on location payloads) is sufficiently representative for each catalog location, or whether per-pin fusion/gaps must be modeled explicitly.
4. **Develop a defensible marine-layer-height model** rather than deriving height from cloud cover, humidity, visibility, or fog percentage alone.
5. **Validate against observed Bay Area conditions** before replacing Coming Soon placeholders on phone Selected Location (and later native/universal).

Related deferred product metrics (not part of the above): **Karl Health Index (KHI)** remains Coming Soon with no algorithm or score in the client.

## Project structure

```text
app/                 Next.js App Router pages and layout
components/          Shared UI and providers
lib/
  api/               Typed API client functions
  env/               Public environment contract
  site/              SEO metadata and sitemap routes
  constants/         App config and design tokens
  schemas/           Zod schemas and inferred TypeScript types
tests/
  fixtures/          Representative backend response JSON
  env/               Environment configuration tests
```
