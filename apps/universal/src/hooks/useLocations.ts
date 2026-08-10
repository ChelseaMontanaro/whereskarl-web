import { useCallback, useEffect, useState } from 'react';

import { getLocations } from '@whereskarl/api-client';

import { getApiBaseUrl, isApiBaseUrlConfigured } from '@/constants/config';
import type { LocationWeather } from '@whereskarl/schemas';

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

const LOCATIONS_UNAVAILABLE_MESSAGE =
  'Live Bay Area locations are unavailable right now. Try again in a moment.';

export function useLocations(): LocationsState {
  const [state, setState] = useState<Omit<LocationsState, 'refresh'>>(
    INITIAL_STATE,
  );

  const loadLocations = useCallback(async (isRefresh = false) => {
    if (!isApiBaseUrlConfigured()) {
      setState({
        ...INITIAL_STATE,
        isLoading: false,
        error: LOCATIONS_UNAVAILABLE_MESSAGE,
      });
      return;
    }

    setState((current) => ({
      ...current,
      isLoading: !isRefresh && current.locations.length === 0,
      isRefreshing: isRefresh,
      error: null,
    }));

    try {
      const response = await getLocations(apiConfig);
      setState({
        isLoading: false,
        isRefreshing: false,
        locations: response.locations,
        error: null,
        hasLiveData: response.locations.length > 0,
      });
    } catch {
      setState((current) => ({
        isLoading: false,
        isRefreshing: false,
        locations: current.locations,
        error: LOCATIONS_UNAVAILABLE_MESSAGE,
        hasLiveData: current.locations.length > 0,
      }));
    }
  }, []);

  useEffect(() => {
    loadLocations(false);
  }, [loadLocations]);

  const refresh = useCallback(() => {
    loadLocations(true);
  }, [loadLocations]);

  return {
    ...state,
    refresh,
  };
}
