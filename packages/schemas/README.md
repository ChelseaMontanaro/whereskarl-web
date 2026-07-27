# `@whereskarl/schemas`

Zod contracts and inferred types mirroring backend API responses.

## Public API

Root import only: `@whereskarl/schemas`

- Shared field schemas (`apiSourceSchema`, `dataStatusSchema`, confidence, prediction, …)
- Health, weather/location, and Karl Intelligence response schemas
- Schema-derived TypeScript types (`LocationWeather`, `CurrentResponse`, …)
- `parseApiResponse` pure validation helper
- Contract enums: `BAY_AREA_BACKEND_REGION_IDS`, `CLIMATE_VALUES`

## Dependencies

- `zod` only

No React, React Native, Next.js, Expo, DOM, MapLibre, env access, fetch, or presentation logic.
