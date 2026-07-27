import { useMemo } from 'react';

import { useLocations } from '@/hooks/useLocations';
import type { LocationWeather } from '@/types/weather';

export type LocationDetailState = {
  locationId: string | null;
  location: LocationWeather | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  hasLiveData: boolean;
  refresh: () => void;
};

function normalizeRouteId(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) {
    return normalizeRouteId(value[0]);
  }

  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function useLocationDetail(
  routeId: string | string[] | undefined,
): LocationDetailState {
  const {
    isLoading,
    isRefreshing,
    locations,
    error,
    hasLiveData,
    refresh,
  } = useLocations();

  const locationId = normalizeRouteId(routeId);

  const location = useMemo(() => {
    if (!locationId) {
      return null;
    }

    return (
      locations.find(
        (item) => item.id.trim().toLowerCase() === locationId.toLowerCase(),
      ) ?? null
    );
  }, [locationId, locations]);

  return {
    locationId,
    location,
    isLoading,
    isRefreshing,
    error,
    hasLiveData,
    refresh,
  };
}
