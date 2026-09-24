import {
  locationQualifiesAsClearIntensity,
  resolveRawLocationFogIntensity,
} from '@whereskarl/domain';
import { normalizeLocationId } from '@whereskarl/search';
import type { LocationWeather } from '@whereskarl/schemas';

export type FavoritesSummary = {
  total: number;
  clearCount: number;
  karlCount: number;
  clearLabel: 'Sunny' | 'Clear';
};

/**
 * Favorites card descriptive copy only.
 * An empty result preserves each card's existing condition fallback.
 */
export function presentFavoritesDescriptiveStatus(status: string): string {
  const trimmed = status.trim();
  if (trimmed === 'Mostly Sunny') {
    return 'Mostly Clear';
  }
  return trimmed;
}

function compareSunshineScore(
  left: LocationWeather,
  right: LocationWeather,
): number {
  const scoreDelta = right.sunshineScore - left.sunshineScore;
  if (scoreDelta !== 0) {
    return scoreDelta;
  }

  return left.name.localeCompare(right.name);
}

export function sortFavoriteLocations(
  favorites: LocationWeather[],
): LocationWeather[] {
  return [...favorites].sort(compareSunshineScore);
}

/** Highest clear-sky score among saved locations; stable name tie-break. */
export function selectTopSavedLocation(
  favorites: LocationWeather[],
): LocationWeather | null {
  if (favorites.length === 0) {
    return null;
  }

  return favorites.reduce<LocationWeather | null>((best, location) => {
    if (!best) {
      return location;
    }

    return compareSunshineScore(best, location) <= 0 ? best : location;
  }, null);
}

export function locationQualifiesAsKarlFavorite(
  location: Pick<LocationWeather, 'fogScore' | 'sunshineScore' | 'status'>,
): boolean {
  const intensity = resolveRawLocationFogIntensity(location);
  return intensity === 'foggy' || intensity === 'karlTerritory';
}

export function computeFavoritesSummary(
  favorites: LocationWeather[],
  isNighttime: boolean,
): FavoritesSummary {
  return {
    total: favorites.length,
    clearCount: favorites.filter(locationQualifiesAsClearIntensity).length,
    karlCount: favorites.filter(locationQualifiesAsKarlFavorite).length,
    clearLabel: isNighttime ? 'Clear' : 'Sunny',
  };
}

export function resolveFavoriteLocations(
  favoriteIds: string[],
  locations: LocationWeather[],
  validLocationIds?: Iterable<string>,
): LocationWeather[] {
  const validIds = validLocationIds
    ? new Set(
        [...validLocationIds]
          .map((id) => normalizeLocationId(id))
          .filter((id): id is string => Boolean(id)),
      )
    : null;

  const locationsById = new Map(
    locations.map((location) => [
      normalizeLocationId(location.id) ?? location.id.trim().toLowerCase(),
      location,
    ]),
  );

  const seen = new Set<string>();
  const resolved: LocationWeather[] = [];

  for (const favoriteId of favoriteIds) {
    const normalized = normalizeLocationId(favoriteId);
    if (!normalized || seen.has(normalized)) {
      continue;
    }

    if (validIds && !validIds.has(normalized)) {
      continue;
    }

    const location = locationsById.get(normalized);
    if (!location) {
      continue;
    }

    seen.add(normalized);
    resolved.push(location);
  }

  return sortFavoriteLocations(resolved);
}

/**
 * Whether in-memory sanitization may be written back to canonical storage.
 *
 * An empty location catalog (Favorites mount / useLocations still hydrating)
 * makes every stored id look stale. Persisting that result wipes Map hearts
 * that were just written. Display can still filter unknown ids; storage must
 * not be rewritten until a real catalog is present.
 */
export function shouldPersistSanitizedFavoriteIds(input: {
  storedIds: readonly string[];
  sanitizedIds: readonly string[];
  catalogSize: number;
}): boolean {
  if (input.catalogSize <= 0) {
    return false;
  }

  return input.sanitizedIds.length !== input.storedIds.length;
}

export type FavoritesContentPresentation = 'hydrating' | 'empty' | 'populated';

/**
 * Distinguishes catalog/ID hydration from a genuine first-run empty Favorites
 * screen. A temporarily empty join (`favoriteLocations === []` while the
 * catalog is still loading) is not proof the user has no saved favorites.
 */
export function resolveFavoritesContentPresentation(input: {
  favoriteLocationsCount: number;
  favoriteIdsCount: number;
  isLoadingFavoriteIds: boolean;
  catalogSize: number;
  isLoadingCatalog: boolean;
}): FavoritesContentPresentation {
  if (input.favoriteLocationsCount > 0) {
    return 'populated';
  }

  if (input.isLoadingFavoriteIds) {
    return 'hydrating';
  }

  if (input.favoriteIdsCount === 0) {
    return 'empty';
  }

  const catalogReady = input.catalogSize > 0;
  if (!catalogReady) {
    return 'hydrating';
  }

  return 'empty';
}

export function sanitizeFavoriteIds(
  favoriteIds: string[],
  validLocationIds: Iterable<string>,
): string[] {
  const validIds = new Set(
    [...validLocationIds]
      .map((id) => normalizeLocationId(id))
      .filter((id): id is string => Boolean(id)),
  );

  const seen = new Set<string>();
  const sanitized: string[] = [];

  for (const favoriteId of favoriteIds) {
    const normalized = normalizeLocationId(favoriteId);
    if (!normalized || seen.has(normalized) || !validIds.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    sanitized.push(favoriteId.trim());
  }

  return sanitized;
}
