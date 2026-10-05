import { WEATHER_STALE_TIME_MS } from '@whereskarl/config';
import type {
  BestSunshineResponse,
  CurrentResponse,
  KarlIntelligenceResponse,
  LocationWeather,
} from '@whereskarl/schemas';

import { isNighttime, resolveKarlLocation } from '@/lib/home/weatherDisplay';

/**
 * Home freshness uses the existing weather TTL. A failed refresh does not
 * move the success clock, so focus and foreground can retry. The due timer
 * waits one full TTL after a failed attempt so a dead endpoint cannot spin.
 */
export const HOME_WEATHER_FRESHNESS_MS = WEATHER_STALE_TIME_MS;

export type HomeWeatherSnapshot = {
  isLoading: boolean;
  isLoadingIntelligence: boolean;
  current: CurrentResponse | null;
  locations: LocationWeather[];
  bestSunshine: BestSunshineResponse | null;
  intelligence: KarlIntelligenceResponse | null;
  hasLiveData: boolean;
  hasLoadedCoreWeather: boolean;
};

export const INITIAL_HOME_WEATHER: HomeWeatherSnapshot = {
  isLoading: true,
  isLoadingIntelligence: false,
  current: null,
  locations: [],
  bestSunshine: null,
  intelligence: null,
  hasLiveData: false,
  hasLoadedCoreWeather: false,
};

export type HomeRefreshDecision = 'start' | 'skip-fresh' | 'skip-inflight';

export function isHomeWeatherFresh(
  lastSuccessAt: number | null,
  now: number,
  ttlMs: number = HOME_WEATHER_FRESHNESS_MS,
): boolean {
  if (lastSuccessAt == null) {
    return false;
  }

  return now - lastSuccessAt < ttlMs;
}

export function shouldStartHomeRefresh(input: {
  lastSuccessAt: number | null;
  now: number;
  inFlight: boolean;
  ttlMs?: number;
}): HomeRefreshDecision {
  if (input.inFlight) {
    return 'skip-inflight';
  }

  if (isHomeWeatherFresh(input.lastSuccessAt, input.now, input.ttlMs)) {
    return 'skip-fresh';
  }

  return 'start';
}

/**
 * Delay until the next single due refresh.
 * Fresh data waits out the remainder of the TTL.
 * A failed attempt waits one full TTL from that attempt without marking
 * the data fresh. The result is never 0, so the timer cannot hot-loop.
 */
export function nextDueDelayMs(input: {
  lastSuccessAt: number | null;
  lastAttemptAt: number | null;
  now: number;
  ttlMs?: number;
}): number {
  const ttlMs = input.ttlMs ?? HOME_WEATHER_FRESHNESS_MS;

  if (input.lastSuccessAt != null) {
    const remaining = input.lastSuccessAt + ttlMs - input.now;
    if (remaining > 0) {
      return remaining;
    }
  }

  if (input.lastAttemptAt != null) {
    const retryIn = input.lastAttemptAt + ttlMs - input.now;
    if (retryIn > 0) {
      return retryIn;
    }
  }

  return ttlMs;
}

export function nextHomeSuccessAt(
  previousSuccessAt: number | null,
  fullySuccessful: boolean,
  completedAt: number,
): number | null {
  return fullySuccessful ? completedAt : previousSuccessAt;
}

export function homeDashboardNightPresentation(date: Date): boolean {
  return isNighttime(date.getHours());
}

export function createHomeRefreshGuard() {
  let generation = 0;

  return {
    issue(): number {
      generation += 1;
      return generation;
    },
    isCurrent(token: number): boolean {
      return token === generation;
    },
  };
}

type Settled<T> = PromiseSettledResult<T>;

function flagsFor(slice: {
  current: CurrentResponse | null;
  locations: LocationWeather[];
  bestSunshine: BestSunshineResponse | null;
}): Pick<HomeWeatherSnapshot, 'hasLiveData' | 'hasLoadedCoreWeather'> {
  return {
    hasLiveData: Boolean(
      slice.current || slice.locations.length > 0 || slice.bestSunshine,
    ),
    hasLoadedCoreWeather: Boolean(slice.current && slice.locations.length > 0),
  };
}

export async function executeHomeRefresh(input: {
  previous: HomeWeatherSnapshot;
  now: Date;
  getCurrent: () => Promise<CurrentResponse>;
  getLocations: () => Promise<{ locations: LocationWeather[] }>;
  getBestSunshine: () => Promise<BestSunshineResponse>;
  getKarlIntelligence: (
    locationId: string | null,
  ) => Promise<KarlIntelligenceResponse>;
  onCore?: (snapshot: HomeWeatherSnapshot) => void;
}): Promise<{
  next: HomeWeatherSnapshot;
  fullySuccessful: boolean;
  isNightPresentation: boolean;
  intelligenceLocationId: string | null;
}> {
  const [currentResult, locationsResult, bestSunshineResult] =
    await Promise.allSettled([
      input.getCurrent(),
      input.getLocations(),
      input.getBestSunshine(),
    ]);

  const current = fulfilledValue(currentResult, input.previous.current);
  const locations = fulfilledLocations(locationsResult, input.previous.locations);
  const bestSunshine = fulfilledValue(
    bestSunshineResult,
    input.previous.bestSunshine,
  );
  const coreFulfilled =
    currentResult.status === 'fulfilled' &&
    locationsResult.status === 'fulfilled' &&
    bestSunshineResult.status === 'fulfilled';

  const coreSnapshot: HomeWeatherSnapshot = {
    ...input.previous,
    current,
    locations,
    bestSunshine,
    intelligence: input.previous.intelligence,
    isLoading: false,
    isLoadingIntelligence: input.previous.intelligence == null,
    ...flagsFor({ current, locations, bestSunshine }),
  };
  input.onCore?.(coreSnapshot);

  const intelligenceLocationId =
    resolveKarlLocation(current, locations)?.id ?? null;

  let intelligence = input.previous.intelligence;
  let intelligenceFulfilled = false;
  try {
    intelligence = await input.getKarlIntelligence(intelligenceLocationId);
    intelligenceFulfilled = true;
  } catch {
    intelligence = input.previous.intelligence;
    intelligenceFulfilled = false;
  }

  const next: HomeWeatherSnapshot = {
    ...coreSnapshot,
    intelligence,
    isLoading: false,
    isLoadingIntelligence: false,
  };

  return {
    next,
    fullySuccessful: coreFulfilled && intelligenceFulfilled,
    isNightPresentation: homeDashboardNightPresentation(input.now),
    intelligenceLocationId,
  };
}

function fulfilledValue<T>(result: Settled<T>, previous: T): T {
  return result.status === 'fulfilled' ? result.value : previous;
}

function fulfilledLocations(
  result: Settled<{ locations: LocationWeather[] }>,
  previous: LocationWeather[],
): LocationWeather[] {
  return result.status === 'fulfilled' ? result.value.locations : previous;
}
