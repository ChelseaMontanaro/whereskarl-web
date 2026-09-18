import { useCallback, useEffect, useState } from 'react';

import { getLocations } from '@whereskarl/api-client';
import { WEATHER_STALE_TIME_MS } from '@whereskarl/config';
import type { LocationWeather } from '@whereskarl/schemas';

import { getApiBaseUrl, isApiBaseUrlConfigured } from '@/constants/config';

const apiConfig = { getBaseUrl: getApiBaseUrl };

export type LocationsState = {
  isLoading: boolean;
  isRefreshing: boolean;
  locations: LocationWeather[];
  error: string | null;
  hasLiveData: boolean;
  refresh: () => void;
};

const INITIAL_STATE: Omit<LocationsState, 'refresh'> = {
  isLoading: true,
  isRefreshing: false,
  locations: [],
  error: null,
  hasLiveData: false,
};

const UNCONFIGURED_STATE: Omit<LocationsState, 'refresh'> = {
  ...INITIAL_STATE,
  isLoading: false,
  error:
    'API URL is not configured. Set EXPO_PUBLIC_API_URL to load live locations.',
};

type WarmCatalog = {
  locations: LocationWeather[];
  fetchedAt: number;
};

let warmCatalog: WarmCatalog | null = null;

function hasUsableCatalog(
  locations: LocationWeather[] | undefined,
): locations is LocationWeather[] {
  return Array.isArray(locations) && locations.length > 0;
}

function isWarmCatalogFresh(now: number): boolean {
  if (!warmCatalog || !hasUsableCatalog(warmCatalog.locations)) {
    return false;
  }

  return now - warmCatalog.fetchedAt < WEATHER_STALE_TIME_MS;
}

function seedLocationsState(): Omit<LocationsState, 'refresh'> {
  if (hasUsableCatalog(warmCatalog?.locations) && warmCatalog) {
    return {
      isLoading: false,
      isRefreshing: false,
      locations: warmCatalog.locations,
      error: null,
      hasLiveData: true,
    };
  }

  return { ...INITIAL_STATE };
}

function rememberSuccessfulCatalog(
  locations: LocationWeather[],
  now: number,
): void {
  if (!hasUsableCatalog(locations)) {
    warmCatalog = null;
    return;
  }

  warmCatalog = { locations, fetchedAt: now };
}

async function loadCatalog(isRefresh: boolean): Promise<{
  skipped: boolean;
  next: Omit<LocationsState, 'refresh'>;
}> {
  if (!isApiBaseUrlConfigured()) {
    return { skipped: false, next: UNCONFIGURED_STATE };
  }

  if (!isRefresh && isWarmCatalogFresh(Date.now())) {
    return { skipped: true, next: seedLocationsState() };
  }

  try {
    const response = await getLocations(apiConfig);
    rememberSuccessfulCatalog(response.locations, Date.now());
    return {
      skipped: false,
      next: {
        isLoading: false,
        isRefreshing: false,
        locations: response.locations,
        error: null,
        hasLiveData: response.locations.length > 0,
      },
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Unable to load Bay Area locations.';
    const cachedLocations = warmCatalog?.locations;
    const locations = hasUsableCatalog(cachedLocations) ? cachedLocations : [];

    return {
      skipped: false,
      next: {
        isLoading: false,
        isRefreshing: false,
        locations,
        error: message,
        hasLiveData: locations.length > 0,
      },
    };
  }
}

export function useLocations(): LocationsState {
  const [state, setState] = useState<Omit<LocationsState, 'refresh'>>(() =>
    seedLocationsState(),
  );

  const loadLocations = useCallback(async (isRefresh = false) => {
    if (!isApiBaseUrlConfigured()) {
      setState(UNCONFIGURED_STATE);
      return;
    }

    if (!isRefresh && isWarmCatalogFresh(Date.now())) {
      return;
    }

    setState((current) => ({
      ...current,
      isLoading: !isRefresh && current.locations.length === 0,
      isRefreshing: isRefresh,
      error: null,
    }));

    const { skipped, next } = await loadCatalog(isRefresh);
    if (skipped) {
      return;
    }

    setState(next);
  }, []);

  useEffect(() => {
    void loadLocations(false);
  }, [loadLocations]);

  const refresh = useCallback(() => {
    void loadLocations(true);
  }, [loadLocations]);

  return {
    ...state,
    refresh,
  };
}

/** Test-only: clear the process-local catalog session. Not for app use. */
export function __resetLocationsCacheForTests(): void {
  warmCatalog = null;
}

/** Test-only helpers for the module catalog session. Not for app use. */
export const __locationsCatalogTestUtils = {
  reset: __resetLocationsCacheForTests,
  mountSnapshot(now = Date.now()) {
    const seedState = seedLocationsState();
    return {
      ...seedState,
      isBlockingInitialLoad:
        seedState.isLoading && seedState.locations.length === 0,
      shouldFetchOnMount: !isWarmCatalogFresh(now),
      shouldFetchOnRefresh: true,
    };
  },
  expire() {
    if (!hasUsableCatalog(warmCatalog?.locations) || !warmCatalog) {
      return;
    }

    warmCatalog = {
      locations: warmCatalog.locations,
      fetchedAt: Date.now() - WEATHER_STALE_TIME_MS - 1,
    };
  },
  load: loadCatalog,
};
