/** Default cache TTL for weather queries in later phases (matches iOS 10-minute cache). */
export const WEATHER_STALE_TIME_MS = 10 * 60 * 1000;

export const STORAGE_KEYS = {
  favoriteLocationIDs: "wheresKarl.web.favoriteLocationIDs",
  lastKnownWeather: "wheresKarl.web.lastKnownWeather",
} as const;

export function getApiBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;

  if (!url) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }

  return url.replace(/\/$/, "");
}
