# Where's Karl? Web

Public web product for [whereskarl.live](https://whereskarl.live), built alongside the iOS app. The backend at `https://api.whereskarl.live` is the source of truth for weather, intelligence, and hero-image URLs.

This repository currently contains the **Phase 14 Step 2–3 foundation**:

- Next.js app shell with design tokens and health status
- Typed API client with Zod-validated contracts for weather and intelligence endpoints
- Vitest fixture coverage for every supported response shape

## Requirements

- Node.js 18+
- npm
- [WheresKarl-Backend](../WheresKarl-Backend) running locally for live API checks (optional but recommended)

## Local development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy environment defaults:

   ```bash
   cp .env.example .env.local
   ```

   `.env.local` should contain:

   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

   For production builds, point this at `https://api.whereskarl.live`.

3. Start the backend (in the backend repo):

   ```bash
   npm run dev
   ```

4. Start the web app:

   ```bash
   npm run dev
   ```

   If port 3000 is already used by the backend, run Next on another port:

   ```bash
   npm run dev -- --port 3001
   ```

5. Open the app in your browser (typically [http://localhost:3000](http://localhost:3000) or the port shown in the terminal).

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint` | ESLint |
| `npm test` | Vitest unit tests |

## Supported API contracts

All weather and intelligence data comes from the backend. The web client validates responses with Zod and does not reshape payloads beyond parsing.

| Endpoint | Client function | Schema |
|----------|-----------------|--------|
| `GET /health` | `getHealth()` | `healthResponseSchema` |
| `GET /current` | `getCurrent()` | `currentResponseSchema` |
| `GET /locations` | `getLocations()` | `locationsResponseSchema` |
| `GET /best-sunshine` | `getBestSunshine()` | `bestSunshineResponseSchema` |
| `GET /best-sunshine?lookahead=60` | `getBestSunshine({ lookahead: 60 })` | `bestSunshineResponseSchema` |
| `GET /karl-intelligence` | `getKarlIntelligence()` | `karlIntelligenceResponseSchema` |
| `GET /karl-intelligence?locationId=` | `getKarlIntelligence({ locationId })` | `karlIntelligenceResponseSchema` |

Contract sources:

- Backend route builders in `WheresKarl-Backend/routes/weather.js`, `routes/intelligence.js`, and `services/weatherService.js`
- iOS decoding models in `WeatherModels.swift` and `KarlIntelligenceModels.swift`

## Test coverage

Vitest validates:

- Every JSON fixture under `tests/fixtures/` against its matching Zod schema
- API path construction for `/best-sunshine`, `/best-sunshine?lookahead=60`, `/karl-intelligence`, and `/karl-intelligence?locationId=mill-valley`
- Client fetch URL assembly via mocked `fetch`

Fixtures are generated from backend mock services (`weatherService.getLocations()`, `buildKarlIntelligence()`, etc.) with stable timestamps.

## Project structure

```text
app/                 Next.js App Router pages and layout
components/          Shared UI and providers
lib/
  api/               Typed API client functions
  constants/         Config and design tokens
  schemas/           Zod schemas and inferred TypeScript types
tests/
  fixtures/          Representative backend response JSON
  schemas/           Schema validation tests
  api/               URL and client tests
```

## Architecture notes

- Weather, intelligence, and hero-image URLs come from the backend only.
- The web app does not call Open-Meteo directly.
- Future local persistence will use web-specific keys:
  - `wheresKarl.web.favoriteLocationIDs`
  - `wheresKarl.web.lastKnownWeather`

## Production backend

- API: `https://api.whereskarl.live`
- Local default: `http://localhost:3000`
