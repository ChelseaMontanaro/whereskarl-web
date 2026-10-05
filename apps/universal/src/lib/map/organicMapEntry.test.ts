import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';

import { buildMapHref } from '@/lib/navigation';
import {
  ORGANIC_MAP_MAX_DISTANCE_METERS,
  buildOrganicMapHref,
  isOrganicMapHref,
  nearestCatalogLocation,
  organicPermissionStep,
  resolveOrganicCatalogSelection,
  shouldStartOrganicMapResolution,
  type CatalogPoint,
  type OrganicPermissionStatus,
} from '@/lib/map/organicMapEntry';

const CATALOG: CatalogPoint[] = [
  { id: 'ocean-beach', latitude: 37.759, longitude: -122.51 },
  { id: 'crissy-field', latitude: 37.803, longitude: -122.466 },
  { id: 'oakland', latitude: 37.805, longitude: -122.27 },
  { id: 'invalid-spot', latitude: Number.NaN, longitude: -122.4 },
];

function permissionReader(status: OrganicPermissionStatus) {
  return vi.fn(async () => status);
}

describe('organic map entry', () => {
  it('identifies a bottom-nav Map tap and leaves explicit routes alone', () => {
    const organic = buildOrganicMapHref('orient-1');

    expect(isOrganicMapHref(organic)).toBe(true);
    expect(organic).toContain('entry=organic');
    expect(organic).toContain('orient=orient-1');
    expect(new URLSearchParams(organic.split('?')[1]).get('selected')).toBe('');
    expect(isOrganicMapHref(buildMapHref('crissy-field'))).toBe(false);
    expect(isOrganicMapHref('/map')).toBe(false);
    expect(isOrganicMapHref(buildMapHref('tiburon', { view: 'map' }))).toBe(false);
  });

  it('starts organic resolution only for a new orient with no explicit selection', () => {
    expect(
      shouldStartOrganicMapResolution({
        entry: 'organic',
        orient: '2',
        lastProcessedOrient: '1',
        explicitSelectedId: null,
      }),
    ).toBe(true);
    expect(
      shouldStartOrganicMapResolution({
        entry: 'organic',
        orient: '2',
        lastProcessedOrient: '2',
        explicitSelectedId: null,
      }),
    ).toBe(false);
    expect(
      shouldStartOrganicMapResolution({
        entry: 'organic',
        orient: '3',
        lastProcessedOrient: null,
        explicitSelectedId: 'baker-beach',
      }),
    ).toBe(false);
    expect(
      shouldStartOrganicMapResolution({
        entry: null,
        orient: null,
        lastProcessedOrient: null,
        explicitSelectedId: 'baker-beach',
      }),
    ).toBe(false);
  });

  it('requests permission only while it is undetermined', () => {
    expect(organicPermissionStep('undetermined')).toBe('request');
    expect(organicPermissionStep('granted')).toBe('acquire');
    expect(organicPermissionStep('denied')).toBe('fallback');
    expect(organicPermissionStep('restricted')).toBe('fallback');
  });

  it('selects the nearest in-range catalog location and keeps ties stable', () => {
    expect(
      nearestCatalogLocation(CATALOG, 37.76, -122.5)?.id,
    ).toBe('ocean-beach');
    expect(
      nearestCatalogLocation(
        [
          { id: 'first', latitude: 37.8, longitude: -122.4 },
          { id: 'second', latitude: 37.8, longitude: -122.4 },
        ],
        37.8,
        -122.4,
      )?.id,
    ).toBe('first');
    expect(nearestCatalogLocation(CATALOG, Number.NaN, -122.4)).toBeNull();
  });

  it('skips invalid coordinates and rejects a fix outside the Bay range', () => {
    expect(
      nearestCatalogLocation(
        [{ id: 'broken', latitude: Number.NaN, longitude: -122 }],
        37.8,
        -122.4,
      ),
    ).toBeNull();
    expect(nearestCatalogLocation(CATALOG, 34.05, -118.24)).toBeNull();
    expect(ORGANIC_MAP_MAX_DISTANCE_METERS).toBe(100_000);
  });

  it('acquires a fix and selects once when permission is already granted', async () => {
    const readPermission = permissionReader('granted');
    const requestPermission = permissionReader('granted');
    const readFix = vi.fn(async () => ({ latitude: 37.76, longitude: -122.5 }));

    const result = await resolveOrganicCatalogSelection({
      locations: CATALOG,
      readPermission,
      requestPermission,
      readFix,
    });

    expect(requestPermission).not.toHaveBeenCalled();
    expect(readFix).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({ type: 'select', locationId: 'ocean-beach' });
  });

  it('requests foreground permission once when it is undetermined, then selects', async () => {
    const readPermission = permissionReader('undetermined');
    const requestPermission = permissionReader('granted');
    const readFix = vi.fn(async () => ({ latitude: 37.8, longitude: -122.27 }));

    const result = await resolveOrganicCatalogSelection({
      locations: CATALOG,
      readPermission,
      requestPermission,
      readFix,
    });

    expect(requestPermission).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({ type: 'select', locationId: 'oakland' });
  });

  it('does not ask again after a denial, restriction, or failed fix', async () => {
    const deniedRequest = permissionReader('granted');
    const denied = await resolveOrganicCatalogSelection({
      locations: CATALOG,
      readPermission: permissionReader('denied'),
      requestPermission: deniedRequest,
      readFix: vi.fn(async () => ({ latitude: 37.76, longitude: -122.5 })),
    });
    expect(denied).toEqual({ type: 'none', reason: 'permission' });
    expect(deniedRequest).not.toHaveBeenCalled();

    const restrictedRequest = permissionReader('granted');
    const restricted = await resolveOrganicCatalogSelection({
      locations: CATALOG,
      readPermission: permissionReader('restricted'),
      requestPermission: restrictedRequest,
      readFix: vi.fn(),
    });
    expect(restricted).toEqual({ type: 'none', reason: 'permission' });
    expect(restrictedRequest).not.toHaveBeenCalled();

    const failed = await resolveOrganicCatalogSelection({
      locations: CATALOG,
      readPermission: permissionReader('granted'),
      requestPermission: permissionReader('granted'),
      readFix: vi.fn(async () => {
        throw new Error('location unavailable');
      }),
    });
    expect(failed).toEqual({ type: 'none', reason: 'fix-failed' });

    const missing = await resolveOrganicCatalogSelection({
      locations: CATALOG,
      readPermission: permissionReader('granted'),
      requestPermission: permissionReader('granted'),
      readFix: vi.fn(async () => null),
    });
    expect(missing).toEqual({ type: 'none', reason: 'fix-missing' });
  });

  it('leaves the map unselected when the fix is outside the catalog range', async () => {
    const result = await resolveOrganicCatalogSelection({
      locations: CATALOG,
      readPermission: permissionReader('granted'),
      requestPermission: permissionReader('granted'),
      readFix: vi.fn(async () => ({ latitude: 34.05, longitude: -118.24 })),
    });

    expect(result).toEqual({ type: 'none', reason: 'out-of-range' });
  });

  it('keeps explicit Favorite, Find Clear Skies, and detail routes off the organic path', () => {
    expect(buildMapHref('crissy-field')).toBe('/map?selected=crissy-field');
    expect(buildMapHref('baker-beach', { view: 'map' })).toBe(
      '/map?view=map&selected=baker-beach',
    );
    expect(isOrganicMapHref(buildMapHref('crissy-field'))).toBe(false);
  });
});

describe('organic map source contract', () => {
  const mapScreen = readFileSync(resolve(process.cwd(), 'src/app/map.tsx'), 'utf8');
  const hook = readFileSync(
    resolve(process.cwd(), 'src/hooks/useOrganicMapOrientation.ts'),
    'utf8',
  );
  const device = readFileSync(
    resolve(process.cwd(), 'src/lib/map/organicMapDeviceLocation.ts'),
    'utf8',
  );
  const entry = readFileSync(
    resolve(process.cwd(), 'src/lib/map/organicMapEntry.ts'),
    'utf8',
  );
  const appJson = readFileSync(resolve(process.cwd(), 'app.json'), 'utf8');

  it('does not auto-select the highest sunshine score on Map entry', () => {
    expect(mapScreen).not.toContain('right.sunshineScore - left.sunshineScore');
    expect(mapScreen).not.toContain('auto-select Best Right Now');
  });

  it('resolves location after the Map renders and focuses the camera once', () => {
    expect(hook).toContain('useEffect');
    expect(hook).toContain('resolveOrganicCatalogSelection');
    expect(hook).toContain('mapRef.current?.focusLocation');
    expect(hook.match(/focusLocation/g)).toHaveLength(1);
    expect(mapScreen).toContain('useOrganicMapOrientation');
    expect(mapScreen).toContain('<KarlMap');
  });

  it('uses one foreground sample and does not store or send coordinates', () => {
    expect(device).toContain('getForegroundPermissionsAsync');
    expect(device).toContain('requestForegroundPermissionsAsync');
    expect(device).toContain('getCurrentPositionAsync');
    expect(device).toContain('LocationAccuracy.Balanced');
    expect(device).not.toContain('watchPositionAsync');
    expect(device).not.toContain('BestForNavigation');
    expect(device).not.toContain('AsyncStorage');
    expect(device).not.toContain('console.');
    expect(entry).not.toContain('AsyncStorage');
    expect(entry).not.toContain('getLocations');
    expect(entry).not.toContain('fetch(');
    expect(hook).not.toContain('watchPositionAsync');
    expect(appJson).toContain('locationWhenInUsePermission');
    expect(appJson).toContain('nearest Bay Area weather spot');
    expect(appJson).toContain('"locationAlwaysPermission": false');
    expect(appJson).toContain('"locationAlwaysAndWhenInUsePermission": false');
    expect(appJson).toContain('"isIosBackgroundLocationEnabled": false');
    expect(appJson).toContain('"isAndroidBackgroundLocationEnabled": false');
    expect(appJson).toContain('"motionUsagePermission": false');
    expect(appJson).not.toContain('NSLocationAlwaysUsageDescription');
    expect(appJson).not.toContain('NSMotionUsageDescription');
  });
});
