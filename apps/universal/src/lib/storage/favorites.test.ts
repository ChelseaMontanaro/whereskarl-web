import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  getFavoriteLocationIds,
  isFavoriteLocation,
  setFavoriteLocationIds,
  subscribeFavoriteChanges,
  toggleFavoriteLocation,
} from '@/lib/storage/favorites';
import { sanitizeFavoriteIds, shouldPersistSanitizedFavoriteIds } from '@/lib/favorites/favoritesDisplay';

const storage = new Map<string, string>();

vi.mock('@/lib/storage/platformStorage', () => ({
  readStorageItem: vi.fn(async (key: string) => storage.get(key) ?? null),
  writeStorageItem: vi.fn(async (key: string, value: string) => {
    storage.set(key, value);
  }),
  removeStorageItem: vi.fn(async (key: string) => {
    storage.delete(key);
  }),
}));

describe('favorites storage', () => {
  beforeEach(() => {
    storage.clear();
  });

  it('persists favorite ids between reads', async () => {
    await setFavoriteLocationIds(['berkeley', 'sausalito']);
    await expect(getFavoriteLocationIds()).resolves.toEqual([
      'berkeley',
      'sausalito',
    ]);
  });

  it('toggles favorites and notifies subscribers', async () => {
    const listener = vi.fn();
    const unsubscribe = subscribeFavoriteChanges(listener);

    await toggleFavoriteLocation('berkeley');
    await toggleFavoriteLocation('sausalito');
    await toggleFavoriteLocation('berkeley');

    unsubscribe();

    await expect(getFavoriteLocationIds()).resolves.toEqual(['sausalito']);
    expect(listener).toHaveBeenCalledTimes(3);
  });

  it('normalizes favorite lookups case-insensitively', async () => {
    await setFavoriteLocationIds(['Berkeley']);
    await expect(toggleFavoriteLocation('berkeley')).resolves.toBe(false);
    await expect(getFavoriteLocationIds()).resolves.toEqual([]);
  });

  it('resolves legacy query aliases to the canonical catalog id before persisting', async () => {
    await expect(toggleFavoriteLocation('ocean-beach-sf')).resolves.toBe(true);
    await expect(getFavoriteLocationIds()).resolves.toEqual(['ocean-beach']);

    // Toggling the canonical id again must recognize the alias-resolved entry.
    await expect(toggleFavoriteLocation('ocean-beach')).resolves.toBe(false);
    await expect(getFavoriteLocationIds()).resolves.toEqual([]);
  });

  it('prevents duplicates across case and alias variants of the same location', async () => {
    await toggleFavoriteLocation('Ocean-Beach-SF');
    await toggleFavoriteLocation('ocean-beach');

    // Second toggle of an equivalent id removes the single stored entry
    // rather than adding a duplicate.
    await expect(getFavoriteLocationIds()).resolves.toEqual([]);
  });

  it('treats invalid/empty ids as a safe no-op', async () => {
    await expect(toggleFavoriteLocation('   ')).resolves.toBe(false);
    await expect(getFavoriteLocationIds()).resolves.toEqual([]);
    await expect(isFavoriteLocation('')).resolves.toBe(false);
  });

  it('shares canonical identity with the favoritesDisplay sanitizer', async () => {
    await setFavoriteLocationIds(['ocean-beach-sf']);
    await expect(isFavoriteLocation('Ocean-Beach-SF')).resolves.toBe(true);
    await expect(isFavoriteLocation('ocean-beach')).resolves.toBe(true);
  });

  it('Map heart write survives Favorites hydrating before locations have loaded', async () => {
    await expect(toggleFavoriteLocation('sausalito')).resolves.toBe(true);
    await expect(getFavoriteLocationIds()).resolves.toEqual(['sausalito']);

    const storedIds = await getFavoriteLocationIds();
    const emptyCatalogSanitized = sanitizeFavoriteIds(storedIds, []);
    expect(emptyCatalogSanitized).toEqual([]);
    expect(
      shouldPersistSanitizedFavoriteIds({
        storedIds,
        sanitizedIds: emptyCatalogSanitized,
        catalogSize: 0,
      }),
    ).toBe(false);

    const resolvedCatalogSanitized = sanitizeFavoriteIds(storedIds, [
      'sausalito',
      'berkeley',
    ]);
    expect(resolvedCatalogSanitized).toEqual(['sausalito']);
    expect(await isFavoriteLocation('sausalito')).toBe(true);
  });

  it('repopulates after the final favorite is removed and a new one is added', async () => {
    await toggleFavoriteLocation('tiburon');
    await expect(toggleFavoriteLocation('tiburon')).resolves.toBe(false);
    await expect(getFavoriteLocationIds()).resolves.toEqual([]);

    await expect(toggleFavoriteLocation('sausalito')).resolves.toBe(true);
    await expect(getFavoriteLocationIds()).resolves.toEqual(['sausalito']);
  });
});
