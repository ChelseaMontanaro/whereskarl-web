import {
  readStorageItem,
  writeStorageItem,
} from '@/lib/storage/platformStorage';

const FAVORITE_LOCATION_IDS_KEY = 'wheresKarl.universal.favoriteLocationIDs';

function normalizeId(locationId: string): string {
  return locationId.trim().toLowerCase();
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
}

export async function isFavoriteLocation(locationId: string): Promise<boolean> {
  const normalized = normalizeId(locationId);
  const ids = await readFavoriteIds();
  return ids.some((id) => normalizeId(id) === normalized);
}

/** Returns whether the location is favorited after the toggle. */
export async function toggleFavoriteLocation(
  locationId: string,
): Promise<boolean> {
  const normalized = normalizeId(locationId);
  const current = await readFavoriteIds();
  const exists = current.some((id) => normalizeId(id) === normalized);

  if (exists) {
    await writeFavoriteIds(
      current.filter((id) => normalizeId(id) !== normalized),
    );
    return false;
  }

  await writeFavoriteIds([...current, locationId]);
  return true;
}
