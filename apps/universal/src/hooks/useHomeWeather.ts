import { useEffect, useState } from 'react';

import { isApiBaseUrlConfigured } from '@/constants/config';
import { getBestSunshine, getCurrent, getLocations } from '@/services/api';
import type {
  BestSunshineResponse,
  CurrentResponse,
  LocationWeather,
} from '@/types/weather';

export type HomeWeatherState = {
  isLoading: boolean;
  current: CurrentResponse | null;
  locations: LocationWeather[];
  bestSunshine: BestSunshineResponse | null;
  hasLiveData: boolean;
};

const INITIAL_STATE: HomeWeatherState = {
  isLoading: true,
  current: null,
  locations: [],
  bestSunshine: null,
  hasLiveData: false,
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
          getCurrent(),
          getLocations(),
          getBestSunshine(),
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

      setState({
        isLoading: false,
        current,
        locations,
        bestSunshine,
        hasLiveData,
      });
    }

    loadWeather();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
