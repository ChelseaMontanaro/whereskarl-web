import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  computeFavoritesSummary,
  resolveFavoriteLocations,
  sanitizeFavoriteIds,
  selectTopSavedLocation,
  shouldPersistSanitizedFavoriteIds,
  sortFavoriteLocations,
} from '@/lib/favorites/favoritesDisplay';
import {
  getFavoriteLocationIds,
  setFavoriteLocationIds,
  subscribeFavoriteChanges,
  toggleFavoriteLocation,
} from '@/lib/storage/favorites';
import { isNighttime } from '@/lib/home/weatherDisplay';
import type { LocationWeather } from '@whereskarl/schemas';

export type FavoritesState = {
  favoriteIds: string[];
  favoriteLocations: LocationWeather[];
  topSavedLocation: LocationWeather | null;
  summary: ReturnType<typeof computeFavoritesSummary>;
  isLoading: boolean;
  refreshFavoriteIds: () => Promise<void>;
  /**
   * Direct unfavorite (Phase 25 §7/§8). Only ever called for a location
   * already present in `favoriteLocations`, so this always removes rather
   * than toggling — reuses the existing storage/pub-sub contract instead of
   * a second favorites architecture. `topSavedLocation`/`summary` recompute
   * automatically once the subscription reloads `favoriteIds`.
   */
  removeFavorite: (locationId: string) => Promise<void>;
};

export function useFavorites(locations: LocationWeather[]): FavoritesState {
  const [favoriteIds, setFavoriteIdsState] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadFavoriteIds = useCallback(async () => {
    const storedIds = await getFavoriteLocationIds();
    const catalogSize = locations.length;
    const sanitized = sanitizeFavoriteIds(
      storedIds,
      locations.map((location) => location.id),
    );

    // Never persist empty-catalog sanitization: that is the physical-iPhone
    // Map→Favorites wipe (heart writes, Favorites mounts with locations=[],
    // storage is overwritten with [], Map subscription unhearts).
    if (
      shouldPersistSanitizedFavoriteIds({
        storedIds,
        sanitizedIds: sanitized,
        catalogSize,
      })
    ) {
      await setFavoriteLocationIds(sanitized);
    }

    setFavoriteIdsState(catalogSize === 0 ? storedIds : sanitized);
    setIsLoading(false);
  }, [locations]);

  useEffect(() => {
    void loadFavoriteIds();
    return subscribeFavoriteChanges(() => {
      void loadFavoriteIds();
    });
  }, [loadFavoriteIds]);

  const favoriteLocations = useMemo(
    () => resolveFavoriteLocations(favoriteIds, locations, locations.map((l) => l.id)),
    [favoriteIds, locations],
  );

  const topSavedLocation = useMemo(
    () => selectTopSavedLocation(favoriteLocations),
    [favoriteLocations],
  );

  const summary = useMemo(
    () =>
      computeFavoritesSummary(
        favoriteLocations,
        isNighttime(new Date().getHours()),
      ),
    [favoriteLocations],
  );

  const removeFavorite = useCallback(async (locationId: string) => {
    await toggleFavoriteLocation(locationId);
  }, []);

  return {
    favoriteIds,
    favoriteLocations: sortFavoriteLocations(favoriteLocations),
    topSavedLocation,
    summary,
    isLoading,
    refreshFavoriteIds: loadFavoriteIds,
    removeFavorite,
  };
}
