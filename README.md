# Where's Karl? Web

Public web product for [whereskarl.live](https://whereskarl.live), built alongside the iOS app. The backend at `https://api.whereskarl.live` is the source of truth for weather, intelligence, and hero-image URLs.

This repository currently contains the **Phase 14 Step 2 foundation scaffold** only: typed API client, health check, design tokens, and a minimal app shell.

## Requirements

- Node.js 18+
- npm
- [WheresKarl-Backend](../WheresKarl-Backend) running locally for live health checks (optional but recommended)

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

## Project structure

```text
app/                 Next.js App Router pages and layout
components/          Shared UI and providers
lib/
  api/               Typed API client
  constants/         Config and design tokens
  schemas/           Zod schemas (health only for now)
tests/               Vitest tests and fixtures
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
