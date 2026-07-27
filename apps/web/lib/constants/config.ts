export const STORAGE_KEYS = {
  favoriteLocationIDs: "wheresKarl.web.favoriteLocationIDs",
  lastKnownWeather: "wheresKarl.web.lastKnownWeather",
} as const;

export {
  getApiBaseUrl,
  isApiBaseUrlConfigured,
  PUBLIC_ENV_VARS,
  resolveApiBaseUrl,
} from "@/lib/env/publicEnv";
