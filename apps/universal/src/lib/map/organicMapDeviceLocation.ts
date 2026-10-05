import * as Location from 'expo-location';

import type {
  DeviceLocationFix,
  OrganicPermissionStatus,
} from '@/lib/map/organicMapEntry';

/** A recent fix can orient the map without waiting on a new sample. */
const LAST_KNOWN_MAX_AGE_MS = 60_000;

/** Stop waiting and leave the all-Bay map in place. */
const CURRENT_FIX_TIMEOUT_MS = 10_000;

export function mapLocationPermissionStatus(
  status: string,
): OrganicPermissionStatus {
  if (status === 'granted') {
    return 'granted';
  }

  if (status === 'undetermined') {
    return 'undetermined';
  }

  if (status === 'restricted') {
    return 'restricted';
  }

  return 'denied';
}

export async function readForegroundPermissionStatus(): Promise<OrganicPermissionStatus> {
  const permission = await Location.getForegroundPermissionsAsync();
  return mapLocationPermissionStatus(permission.status);
}

export async function requestForegroundPermission(): Promise<OrganicPermissionStatus> {
  const permission = await Location.requestForegroundPermissionsAsync();
  return mapLocationPermissionStatus(permission.status);
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('location-timeout'));
    }, timeoutMs);

    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

/**
 * One foreground sample. Coordinates stay in memory for the nearest-location
 * calculation and are not written, logged, or sent anywhere.
 */
export async function readForegroundLocationFix(): Promise<DeviceLocationFix | null> {
  try {
    const lastKnown = await Location.getLastKnownPositionAsync({
      maxAge: LAST_KNOWN_MAX_AGE_MS,
    });
    if (
      lastKnown &&
      Number.isFinite(lastKnown.coords.latitude) &&
      Number.isFinite(lastKnown.coords.longitude)
    ) {
      return {
        latitude: lastKnown.coords.latitude,
        longitude: lastKnown.coords.longitude,
      };
    }
  } catch {
    // A missing last-known fix falls through to one current sample.
  }

  const current = await withTimeout(
    Location.getCurrentPositionAsync({
      accuracy: Location.LocationAccuracy.Balanced,
    }),
    CURRENT_FIX_TIMEOUT_MS,
  );

  if (
    !Number.isFinite(current.coords.latitude) ||
    !Number.isFinite(current.coords.longitude)
  ) {
    return null;
  }

  return {
    latitude: current.coords.latitude,
    longitude: current.coords.longitude,
  };
}
