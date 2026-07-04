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

/** Removes cached hero URLs so narrative can hydrate without stale hero imagery. */
export function stripHeroImageryFromIntelligence(
  intelligence: KarlIntelligenceResponse,
): KarlIntelligenceResponse {
  return {
    ...intelligence,
    heroImagery: {
      ...intelligence.heroImagery,
      imageUrl: null,
      fallbackReason:
        intelligence.heroImagery.fallbackReason ?? "pending-refresh",
    },
  };
}

export function lastKnownIntelligenceForHydration(
  intelligence: KarlIntelligenceResponse | undefined,
): KarlIntelligenceResponse | undefined {
  if (!intelligence) {
    return undefined;
  }

  return stripHeroImageryFromIntelligence(intelligence);
}

export function saveLastKnownWeather(data: LastKnownWeather): void {
  if (typeof window === "undefined") {
    return;
  }

  const payload: LastKnownWeather = {
    ...data,
    intelligence: data.intelligence
      ? stripHeroImageryFromIntelligence(data.intelligence)
      : undefined,
  };

  window.localStorage.setItem(
    STORAGE_KEYS.lastKnownWeather,
    JSON.stringify(payload),
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
