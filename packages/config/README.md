# `@whereskarl/config`

Shared non-secret product configuration constants.

## Public API

- `PRODUCTION_API_BASE_URL` — documented production backend URL
- `WEATHER_STALE_TIME_MS` — default weather query stale time (milliseconds)
- `INTELLIGENCE_STALE_TIME_MS` — default Karl Intelligence query stale time (milliseconds)
- `MAP_LOCATION_QUERY_PARAM` — canonical map location query param (`location`)
- `MAP_LOCATION_ALIAS_QUERY_PARAM` — alternate map location query param (`selected`)
- `MAP_REGION_QUERY_PARAM` — map region query param (`region`)

No environment reads, React, React Native, DOM, or runtime dependencies.
Environment resolution stays in applications.
