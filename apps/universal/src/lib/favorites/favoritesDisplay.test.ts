import { describe, expect, it } from 'vitest';

import {
  computeFavoritesSummary,
  locationQualifiesAsKarlFavorite,
  resolveFavoriteLocations,
  resolveFavoritesContentPresentation,
  sanitizeFavoriteIds,
  selectTopSavedLocation,
  shouldPersistSanitizedFavoriteIds,
  sortFavoriteLocations,
} from '@/lib/favorites/favoritesDisplay';
import type { LocationWeather } from '@whereskarl/schemas';

function makeLocation(
  overrides: Partial<LocationWeather> & Pick<LocationWeather, 'id' | 'name'>,
): LocationWeather {
  const { id, name, ...rest } = overrides;
  return {
    id,
    name,
    region: 'san-francisco',
    latitude: 37.7,
    longitude: -122.4,
    temperature: 60,
    humidity: 70,
    windSpeed: 8,
    windDirection: 'W',
    cloudCover: 80,
    visibility: 4,
    sunshineScore: 20,
    fogScore: 80,
    status: 'Foggy',
    distanceText: '5 mi',
    karlReason: null,
    confidenceLabel: 'High',
    confidenceExplanation: null,
    imageUrl: null,
    focalPoint: null,
    localFallbackAsset: null,
    prediction: null,
    updatedAt: new Date().toISOString(),
    ...rest,
  } as LocationWeather;
}

describe('favoritesDisplay', () => {
  it('selects the top saved location by clear-sky score', () => {
    const favorites = [
      makeLocation({ id: 'berkeley', name: 'Berkeley', sunshineScore: 88 }),
      makeLocation({ id: 'sausalito', name: 'Sausalito', sunshineScore: 72 }),
    ];

    expect(selectTopSavedLocation(favorites)?.id).toBe('berkeley');
  });

  it('breaks top saved location ties by name', () => {
    const favorites = [
      makeLocation({ id: 'sausalito', name: 'Sausalito', sunshineScore: 80 }),
      makeLocation({ id: 'berkeley', name: 'Berkeley', sunshineScore: 80 }),
    ];

    expect(selectTopSavedLocation(favorites)?.id).toBe('berkeley');
  });

  it('computes summary counts from canonical clear and Karl intensities', () => {
    const favorites = [
      makeLocation({
        id: 'berkeley',
        name: 'Berkeley',
        sunshineScore: 82,
        fogScore: 18,
      }),
      makeLocation({
        id: 'sausalito',
        name: 'Sausalito',
        sunshineScore: 55,
        fogScore: 45,
      }),
      makeLocation({
        id: 'presidio',
        name: 'Presidio',
        sunshineScore: 18,
        fogScore: 82,
      }),
    ];

    const daySummary = computeFavoritesSummary(favorites, false);
    expect(daySummary.total).toBe(3);
    expect(daySummary.clearCount).toBe(1);
    expect(daySummary.karlCount).toBe(1);
    expect(daySummary.clearLabel).toBe('Sunny');

    const nightSummary = computeFavoritesSummary(favorites, true);
    expect(nightSummary.clearLabel).toBe('Clear');
  });

  it('classifies foggy and Karl Territory as Karl favorites', () => {
    expect(
      locationQualifiesAsKarlFavorite(
        makeLocation({ id: 'a', name: 'A', fogScore: 60, sunshineScore: 40 }),
      ),
    ).toBe(true);
    expect(
      locationQualifiesAsKarlFavorite(
        makeLocation({ id: 'b', name: 'B', fogScore: 80, sunshineScore: 20 }),
      ),
    ).toBe(true);
    expect(
      locationQualifiesAsKarlFavorite(
        makeLocation({ id: 'c', name: 'C', fogScore: 30, sunshineScore: 70 }),
      ),
    ).toBe(false);
  });

  it('resolves stored favorite ids against live locations and sorts by score', () => {
    const locations = [
      makeLocation({ id: 'berkeley', name: 'Berkeley', sunshineScore: 90 }),
      makeLocation({ id: 'sausalito', name: 'Sausalito', sunshineScore: 70 }),
      makeLocation({ id: 'presidio', name: 'Presidio', sunshineScore: 50 }),
    ];

    const resolved = resolveFavoriteLocations(
      ['sausalito', 'berkeley', 'missing-id'],
      locations,
      locations.map((location) => location.id),
    );

    expect(resolved.map((location) => location.id)).toEqual([
      'berkeley',
      'sausalito',
    ]);
    expect(sortFavoriteLocations(resolved).map((location) => location.id)).toEqual([
      'berkeley',
      'sausalito',
    ]);
  });

  it('sanitizes stale favorite ids against the canonical catalog', () => {
    const validIds = ['berkeley', 'sausalito'];
    expect(
      sanitizeFavoriteIds(['berkeley', 'ghost-spot', 'sausalito'], validIds),
    ).toEqual(['berkeley', 'sausalito']);
  });

  it('does not persist sanitization against an empty catalog (Map heart wipe)', () => {
    const storedIds = ['sausalito', 'tiburon'];
    const sanitized = sanitizeFavoriteIds(storedIds, []);

    expect(sanitized).toEqual([]);
    expect(
      shouldPersistSanitizedFavoriteIds({
        storedIds,
        sanitizedIds: sanitized,
        catalogSize: 0,
      }),
    ).toBe(false);
  });

  it('persists stale-id cleanup only after a real catalog is present', () => {
    const storedIds = ['sausalito', 'ghost-spot'];
    const sanitized = sanitizeFavoriteIds(storedIds, ['sausalito', 'berkeley']);

    expect(sanitized).toEqual(['sausalito']);
    expect(
      shouldPersistSanitizedFavoriteIds({
        storedIds,
        sanitizedIds: sanitized,
        catalogSize: 2,
      }),
    ).toBe(true);
    expect(
      shouldPersistSanitizedFavoriteIds({
        storedIds: ['sausalito'],
        sanitizedIds: ['sausalito'],
        catalogSize: 2,
      }),
    ).toBe(false);
  });

  it('joins stored favorite ids with a loaded catalog in one pass', () => {
    const catalog = [
      makeLocation({ id: 'cupertino', name: 'Cupertino', sunshineScore: 70 }),
      makeLocation({ id: 'berkeley', name: 'Berkeley', sunshineScore: 88 }),
      makeLocation({ id: 'sausalito', name: 'Sausalito', sunshineScore: 40 }),
    ];
    const storedIds = ['cupertino', 'berkeley'];

    const first = resolveFavoriteLocations(storedIds, catalog);
    const second = resolveFavoriteLocations(storedIds, catalog);

    expect(first.map((location) => location.id)).toEqual(['berkeley', 'cupertino']);
    expect(second.map((location) => location.id)).toEqual(
      first.map((location) => location.id),
    );
    expect(selectTopSavedLocation(first)?.id).toBe('berkeley');
  });

  it('handles zero favorites gracefully', () => {
    expect(selectTopSavedLocation([])).toBeNull();
    expect(computeFavoritesSummary([], false)).toEqual({
      total: 0,
      clearCount: 0,
      karlCount: 0,
      clearLabel: 'Sunny',
    });
  });

  it('handles exactly one favorite as both the top location and the full list', () => {
    const favorites = [
      makeLocation({ id: 'tiburon', name: 'Tiburon', sunshineScore: 66 }),
    ];

    expect(selectTopSavedLocation(favorites)?.id).toBe('tiburon');
    expect(sortFavoriteLocations(favorites).map((l) => l.id)).toEqual([
      'tiburon',
    ]);
    expect(computeFavoritesSummary(favorites, false).total).toBe(1);
  });

  it('recomputes the top saved location after the current top is removed (Phase 25 §8)', () => {
    const favorites = [
      makeLocation({ id: 'berkeley', name: 'Berkeley', sunshineScore: 90 }),
      makeLocation({ id: 'sausalito', name: 'Sausalito', sunshineScore: 70 }),
      makeLocation({ id: 'presidio', name: 'Presidio', sunshineScore: 50 }),
    ];

    expect(selectTopSavedLocation(favorites)?.id).toBe('berkeley');

    // Removing the current top saved location must promote the next-best
    // remaining favorite, purely by recomputing over the smaller collection —
    // no separate "top location" state to reconcile.
    const afterRemovingTop = favorites.filter(
      (location) => location.id !== 'berkeley',
    );
    expect(selectTopSavedLocation(afterRemovingTop)?.id).toBe('sausalito');

    const afterRemovingAll: typeof favorites = [];
    expect(selectTopSavedLocation(afterRemovingAll)).toBeNull();
  });
});

describe('Phase 27.2 — Favorites content presentation vs catalog hydration', () => {
  it('does not treat persisted IDs + an empty/loading catalog as genuine empty', () => {
    expect(
      resolveFavoritesContentPresentation({
        favoriteLocationsCount: 0,
        favoriteIdsCount: 2,
        isLoadingFavoriteIds: false,
        catalogSize: 0,
        isLoadingCatalog: true,
      }),
    ).toBe('hydrating');

    expect(
      resolveFavoritesContentPresentation({
        favoriteLocationsCount: 0,
        favoriteIdsCount: 2,
        isLoadingFavoriteIds: true,
        catalogSize: 0,
        isLoadingCatalog: true,
      }),
    ).toBe('hydrating');
  });

  it('selects genuine empty only after favorite IDs have hydrated to []', () => {
    expect(
      resolveFavoritesContentPresentation({
        favoriteLocationsCount: 0,
        favoriteIdsCount: 0,
        isLoadingFavoriteIds: false,
        catalogSize: 0,
        isLoadingCatalog: true,
      }),
    ).toBe('empty');

    expect(
      resolveFavoritesContentPresentation({
        favoriteLocationsCount: 0,
        favoriteIdsCount: 0,
        isLoadingFavoriteIds: false,
        catalogSize: 8,
        isLoadingCatalog: false,
      }),
    ).toBe('empty');
  });

  it('selects populated when the catalog join has resolved saved locations', () => {
    expect(
      resolveFavoritesContentPresentation({
        favoriteLocationsCount: 2,
        favoriteIdsCount: 2,
        isLoadingFavoriteIds: false,
        catalogSize: 8,
        isLoadingCatalog: false,
      }),
    ).toBe('populated');
  });
});
