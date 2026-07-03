import { STORAGE_KEYS } from "@/lib/constants/config";
import type { KarlIntelligenceResponse } from "@/lib/schemas/intelligence";
import type {
  BestSunshineResponse,
  CurrentResponse,
  LocationsResponse,
} from "@/lib/schemas/weather";

export type LastKnownWeather = {
  current: CurrentResponse;
  locations: LocationsResponse;
  bestSunshine: BestSunshineResponse;
  intelligence?: KarlIntelligenceResponse;
  savedAt: string;
};

export function saveLastKnownWeather(data: LastKnownWeather): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    STORAGE_KEYS.lastKnownWeather,
    JSON.stringify(data),
  );
}

export function loadLastKnownWeather(): LastKnownWeather | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEYS.lastKnownWeather);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as LastKnownWeather;
  } catch {
    return null;
  }
}
