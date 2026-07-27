import { useCallback, useEffect, useState } from 'react';

import { isApiBaseUrlConfigured } from '@/constants/config';
import { getLocations } from '@/services/api';
import type { LocationWeather } from '@/types/weather';

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

export function useLocations(): LocationsState {
  const [state, setState] = useState<Omit<LocationsState, 'refresh'>>(
    INITIAL_STATE,
  );

  const loadLocations = useCallback(async (isRefresh = false) => {
    if (!isApiBaseUrlConfigured()) {
      setState({
        ...INITIAL_STATE,
        isLoading: false,
        error: 'API URL is not configured. Set EXPO_PUBLIC_API_URL to load live locations.',
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
      const response = await getLocations();
      setState({
        isLoading: false,
        isRefreshing: false,
        locations: response.locations,
        error: null,
        hasLiveData: response.locations.length > 0,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to load Bay Area locations.';

      setState((current) => ({
        isLoading: false,
        isRefreshing: false,
        locations: current.locations,
        error: message,
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
