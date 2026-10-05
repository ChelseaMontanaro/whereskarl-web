import { haversineDistanceMeters } from '@/lib/map/fogOverlays';

/** Query flag for a bottom-nav Map tap. Explicit `selected` routes omit it. */
export const ORGANIC_MAP_ENTRY = 'organic';

/**
 * A catalog spot farther than this is not "where you are."
 * 100 km covers the Bay Area catalog from a point inside the region and
 * rejects a fix from well outside it, such as Los Angeles.
 */
export const ORGANIC_MAP_MAX_DISTANCE_METERS = 100_000;

export type OrganicPermissionStatus =
  | 'granted'
  | 'undetermined'
  | 'denied'
  | 'restricted';

export type OrganicPermissionStep = 'acquire' | 'request' | 'fallback';

export type CatalogPoint = {
  id: string;
  latitude: number;
  longitude: number;
};

export type DeviceLocationFix = {
  latitude: number;
  longitude: number;
};

export type OrganicMapResolution =
  | {
      type: 'select';
      locationId: string;
      latitude: number;
      longitude: number;
    }
  | {
      type: 'none';
      reason:
        | 'permission'
        | 'fix-failed'
        | 'fix-missing'
        | 'out-of-range';
    };

let organicOrientSequence = 0;

/** A new token for every bottom-nav Map tap, including two taps in the same millisecond. */
export function nextOrganicMapOrient(): string {
  organicOrientSequence += 1;
  return `${Date.now()}-${organicOrientSequence}`;
}

export function buildOrganicMapHref(orient: string): string {
  const params = new URLSearchParams();
  params.set('entry', ORGANIC_MAP_ENTRY);
  params.set('orient', orient);
  params.set('selected', '');
  return `/map?${params.toString()}`;
}

export function isOrganicMapHref(href: string): boolean {
  const query = href.split('?')[1] ?? '';
  return new URLSearchParams(query).get('entry') === ORGANIC_MAP_ENTRY;
}

export function organicPermissionStep(
  status: OrganicPermissionStatus,
): OrganicPermissionStep {
  if (status === 'granted') {
    return 'acquire';
  }

  if (status === 'undetermined') {
    return 'request';
  }

  return 'fallback';
}

export function shouldStartOrganicMapResolution(input: {
  entry: string | null | undefined;
  orient: string | null | undefined;
  lastProcessedOrient: string | null;
  explicitSelectedId: string | null;
}): boolean {
  if (input.entry !== ORGANIC_MAP_ENTRY) {
    return false;
  }

  if (!input.orient || input.orient === input.lastProcessedOrient) {
    return false;
  }

  if (input.explicitSelectedId) {
    return false;
  }

  return true;
}

export function nearestCatalogLocation(
  locations: readonly CatalogPoint[],
  latitude: number,
  longitude: number,
  maxDistanceMeters = ORGANIC_MAP_MAX_DISTANCE_METERS,
): CatalogPoint | null {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  let nearest: { location: CatalogPoint; distance: number } | null = null;

  for (const location of locations) {
    if (!Number.isFinite(location.latitude) || !Number.isFinite(location.longitude)) {
      continue;
    }

    const distance = haversineDistanceMeters(
      latitude,
      longitude,
      location.latitude,
      location.longitude,
    );
    if (!Number.isFinite(distance)) {
      continue;
    }

    if (nearest && distance >= nearest.distance) {
      continue;
    }

    nearest = { location, distance };
  }

  if (!nearest || nearest.distance > maxDistanceMeters) {
    return null;
  }

  return nearest.location;
}

export async function resolveOrganicCatalogSelection(input: {
  locations: readonly CatalogPoint[];
  readPermission: () => Promise<OrganicPermissionStatus>;
  requestPermission: () => Promise<OrganicPermissionStatus>;
  readFix: () => Promise<DeviceLocationFix | null>;
  maxDistanceMeters?: number;
}): Promise<OrganicMapResolution> {
  let step = organicPermissionStep(await input.readPermission());
  if (step === 'request') {
    step = organicPermissionStep(await input.requestPermission());
    if (step === 'request') {
      step = 'fallback';
    }
  }

  if (step !== 'acquire') {
    return { type: 'none', reason: 'permission' };
  }

  let fix: DeviceLocationFix | null;
  try {
    fix = await input.readFix();
  } catch {
    return { type: 'none', reason: 'fix-failed' };
  }

  if (
    !fix ||
    !Number.isFinite(fix.latitude) ||
    !Number.isFinite(fix.longitude)
  ) {
    return { type: 'none', reason: 'fix-missing' };
  }

  const nearest = nearestCatalogLocation(
    input.locations,
    fix.latitude,
    fix.longitude,
    input.maxDistanceMeters,
  );
  if (!nearest) {
    return { type: 'none', reason: 'out-of-range' };
  }

  return {
    type: 'select',
    locationId: nearest.id,
    latitude: nearest.latitude,
    longitude: nearest.longitude,
  };
}
