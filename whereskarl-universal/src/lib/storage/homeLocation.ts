import { STORAGE_KEYS } from '@/constants/storage';
import {
  readStorageItem,
  removeStorageItem,
  writeStorageItem,
} from '@/lib/storage/platformStorage';

type HomeLocationListener = () => void;

const listeners = new Set<HomeLocationListener>();

function notifyHomeLocationListeners(): void {
  listeners.forEach((listener) => listener());
}

export function subscribeHomeLocationChanges(
  listener: HomeLocationListener,
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export async function getHomeLocationId(): Promise<string | null> {
  const value = await readStorageItem(STORAGE_KEYS.homeLocationId);
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export async function setHomeLocationId(locationId: string): Promise<void> {
  const trimmed = locationId.trim();
  if (!trimmed) {
    return;
  }

  await writeStorageItem(STORAGE_KEYS.homeLocationId, trimmed);
  notifyHomeLocationListeners();
}

export async function clearHomeLocationId(): Promise<void> {
  await removeStorageItem(STORAGE_KEYS.homeLocationId);
  notifyHomeLocationListeners();
}
