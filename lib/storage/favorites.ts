import { STORAGE_KEYS } from "@/lib/constants/config";

function readFavoriteIds(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.favoriteLocationIDs);
    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((value): value is string => typeof value === "string");
  } catch {
    return [];
  }
}

function writeFavoriteIds(ids: string[]): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    STORAGE_KEYS.favoriteLocationIDs,
    JSON.stringify(ids),
  );
}

export function isFavoriteLocation(locationId: string): boolean {
  const normalized = locationId.trim().toLowerCase();
  return readFavoriteIds().some(
    (id) => id.trim().toLowerCase() === normalized,
  );
}

export function toggleFavoriteLocation(locationId: string): boolean {
  const normalized = locationId.trim().toLowerCase();
  const current = readFavoriteIds();
  const exists = current.some((id) => id.trim().toLowerCase() === normalized);

  if (exists) {
    writeFavoriteIds(
      current.filter((id) => id.trim().toLowerCase() !== normalized),
    );
    return false;
  }

  writeFavoriteIds([...current, locationId]);
  return true;
}
