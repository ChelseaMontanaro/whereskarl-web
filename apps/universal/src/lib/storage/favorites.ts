import { normalizeLocationId } from '@whereskarl/search';

import {
  readStorageItem,
  writeStorageItem,
} from '@/lib/storage/platformStorage';

const FAVORITE_LOCATION_IDS_KEY = 'wheresKarl.universal.favoriteLocationIDs';

type FavoriteListener = () => void;

const listeners = new Set<FavoriteListener>();

function notifyFavoriteListeners(): void {
  listeners.forEach((listener) => listener());
}

export function subscribeFavoriteChanges(listener: FavoriteListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Canonical favorite identity. Resolves legacy query aliases (e.g.
 * `ocean-beach-sf` → `ocean-beach`) through the same `normalizeLocationId`
 * used by `lib/favorites/favoritesDisplay.ts`, so storage and display share
 * one interpretation of "the same location". Case is preserved for storage
 * (canonical catalog ids are already lowercase-kebab); a separate lowercase
 * comparison key keeps lookups/toggles case-insensitive.
 */
function canonicalFavoriteId(locationId: string): string | null {
  return normalizeLocationId(locationId);
}

function favoriteComparisonKey(locationId: string): string | null {
  const canonical = canonicalFavoriteId(locationId);
  return canonical ? canonical.toLowerCase() : null;
}

async function readFavoriteIds(): Promise<string[]> {
  const raw = await readStorageItem(FAVORITE_LOCATION_IDS_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((value): value is string => typeof value === 'string');
  } catch {
    return [];
  }
}

async function writeFavoriteIds(ids: string[]): Promise<void> {
  await writeStorageItem(FAVORITE_LOCATION_IDS_KEY, JSON.stringify(ids));
  notifyFavoriteListeners();
}

export async function getFavoriteLocationIds(): Promise<string[]> {
  return readFavoriteIds();
}

export async function setFavoriteLocationIds(ids: string[]): Promise<void> {
  await writeFavoriteIds(ids);
}

export async function isFavoriteLocation(locationId: string): Promise<boolean> {
  const key = favoriteComparisonKey(locationId);
  if (!key) {
    return false;
  }

  const ids = await readFavoriteIds();
  return ids.some((id) => favoriteComparisonKey(id) === key);
}

/**
 * Returns whether the location is favorited after the toggle. Invalid/empty
 * ids are a safe no-op (storage is left untouched, returns not-favorited).
 */
export async function toggleFavoriteLocation(
  locationId: string,
): Promise<boolean> {
  const canonical = canonicalFavoriteId(locationId);
  if (!canonical) {
    return false;
  }

  const key = canonical.toLowerCase();
  const current = await readFavoriteIds();
  const exists = current.some((id) => favoriteComparisonKey(id) === key);

  if (exists) {
    await writeFavoriteIds(
      current.filter((id) => favoriteComparisonKey(id) !== key),
    );
    return false;
  }

  await writeFavoriteIds([...current, canonical]);
  return true;
}
