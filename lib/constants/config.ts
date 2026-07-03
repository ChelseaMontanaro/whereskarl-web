/** Default cache TTL for weather queries (matches iOS 10-minute cache). */
export const WEATHER_STALE_TIME_MS = 10 * 60 * 1000;

export const STORAGE_KEYS = {
  favoriteLocationIDs: "wheresKarl.web.favoriteLocationIDs",
  lastKnownWeather: "wheresKarl.web.lastKnownWeather",
} as const;

export {
  getApiBaseUrl,
  isApiBaseUrlConfigured,
  PRODUCTION_API_BASE_URL,
  PUBLIC_ENV_VARS,
  resolveApiBaseUrl,
} from "@/lib/env/publicEnv";
