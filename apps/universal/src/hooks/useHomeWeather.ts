import { useEffect, useState } from 'react';

import {
  getBestSunshine,
  getCurrent,
  getKarlIntelligence,
  getLocations,
} from '@whereskarl/api-client';
import type {
  BestSunshineResponse,
  CurrentResponse,
  KarlIntelligenceResponse,
  LocationWeather,
} from '@whereskarl/schemas';

import { getApiBaseUrl, isApiBaseUrlConfigured } from '@/constants/config';
import { foggiestKarlLocation } from '@/lib/home/weatherDisplay';

const apiConfig = { getBaseUrl: getApiBaseUrl };

export type HomeWeatherState = {
  isLoading: boolean;
  isLoadingIntelligence: boolean;
  current: CurrentResponse | null;
  locations: LocationWeather[];
  bestSunshine: BestSunshineResponse | null;
  intelligence: KarlIntelligenceResponse | null;
  hasLiveData: boolean;
  hasLoadedCoreWeather: boolean;
};

const INITIAL_STATE: HomeWeatherState = {
  isLoading: true,
  isLoadingIntelligence: false,
  current: null,
  locations: [],
  bestSunshine: null,
  intelligence: null,
  hasLiveData: false,
  hasLoadedCoreWeather: false,
};

export function useHomeWeather(): HomeWeatherState {
  const [state, setState] = useState<HomeWeatherState>(INITIAL_STATE);

  useEffect(() => {
    let cancelled = false;

    async function loadWeather() {
      if (!isApiBaseUrlConfigured()) {
        if (!cancelled) {
          setState({
            ...INITIAL_STATE,
            isLoading: false,
          });
        }
        return;
      }

      const [currentResult, locationsResult, bestSunshineResult] =
        await Promise.allSettled([
          getCurrent(apiConfig),
          getLocations(apiConfig),
          getBestSunshine(apiConfig),
        ]);

      if (cancelled) {
        return;
      }

      const current =
        currentResult.status === 'fulfilled' ? currentResult.value : null;
      const locations =
        locationsResult.status === 'fulfilled'
          ? locationsResult.value.locations
          : [];
      const bestSunshine =
        bestSunshineResult.status === 'fulfilled'
          ? bestSunshineResult.value
          : null;

      const hasLiveData = Boolean(
        current || locations.length > 0 || bestSunshine,
      );
      const hasLoadedCoreWeather = Boolean(current && locations.length > 0);

      setState({
        isLoading: false,
        isLoadingIntelligence: true,
        current,
        locations,
        bestSunshine,
        intelligence: null,
        hasLiveData,
        hasLoadedCoreWeather,
      });

      const focusLocationId = foggiestKarlLocation(locations)?.id ?? null;

      try {
        const intelligence = await getKarlIntelligence(
          apiConfig,
          focusLocationId ? { locationId: focusLocationId } : undefined,
        );

        if (!cancelled) {
          setState((prev) => ({
            ...prev,
            intelligence,
            isLoadingIntelligence: false,
          }));
        }
      } catch {
        if (!cancelled) {
          setState((prev) => ({
            ...prev,
            isLoadingIntelligence: false,
          }));
        }
      }
    }

    loadWeather();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
