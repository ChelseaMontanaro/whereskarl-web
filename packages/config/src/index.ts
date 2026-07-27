/**
 * Shared non-secret product configuration constants.
 *
 * Environment resolution stays in applications (NEXT_PUBLIC_* / EXPO_PUBLIC_*).
 * This package must not read process.env or import.meta.env.
 */

/** Documented production backend URL — set via public env vars in deploy hosts. */
export const PRODUCTION_API_BASE_URL = "https://api.whereskarl.live";

/** Default cache TTL for weather queries (matches iOS 10-minute cache). Milliseconds. */
export const WEATHER_STALE_TIME_MS = 10 * 60 * 1000;

/** Intelligence refreshes sooner so hero stabilityKey/daypart updates are not held for 10 minutes. Milliseconds. */
export const INTELLIGENCE_STALE_TIME_MS = 0;

/** Canonical deep-link query param for map location selection. */
export const MAP_LOCATION_QUERY_PARAM = "location";

/** Legacy / alternate deep-link query param for map location selection. */
export const MAP_LOCATION_ALIAS_QUERY_PARAM = "selected";

/** Deep-link query param for map region selection. */
export const MAP_REGION_QUERY_PARAM = "region";
