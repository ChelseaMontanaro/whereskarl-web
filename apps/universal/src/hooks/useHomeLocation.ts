import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  getHomeLocationId,
  setHomeLocationId as persistHomeLocationId,
  subscribeHomeLocationChanges,
} from '@/lib/storage/homeLocation';
import type { LocationWeather } from '@/types/weather';

export type HomeLocationState = {
  homeLocationId: string | null;
  homeLocation: LocationWeather | null;
  isLoading: boolean;
  setHomeLocationId: (locationId: string) => Promise<void>;
};

export function useHomeLocation(
  locations: LocationWeather[],
): HomeLocationState {
  const [homeLocationId, setHomeLocationIdState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadHomeLocationId = useCallback(async () => {
    const storedId = await getHomeLocationId();
    setHomeLocationIdState(storedId);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadHomeLocationId();
    return subscribeHomeLocationChanges(() => {
      loadHomeLocationId();
    });
  }, [loadHomeLocationId]);

  const homeLocation = useMemo(() => {
    if (!homeLocationId) {
      return null;
    }

    return (
      locations.find(
        (location) =>
          location.id.trim().toLowerCase() === homeLocationId.trim().toLowerCase(),
      ) ?? null
    );
  }, [homeLocationId, locations]);

  const setHomeLocationId = useCallback(async (locationId: string) => {
    await persistHomeLocationId(locationId);
    setHomeLocationIdState(locationId.trim());
  }, []);

  return {
    homeLocationId,
    homeLocation,
    isLoading,
    setHomeLocationId,
  };
}
