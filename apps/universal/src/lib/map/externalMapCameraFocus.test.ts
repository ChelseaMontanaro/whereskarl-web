import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  externalSelectedFocusId,
  resolvePendingExternalMapFocus,
} from '@/lib/map/externalMapCameraFocus';

function readSource(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), 'utf8');
}

const NAPA = { id: 'napa', latitude: 38.5, longitude: -122.3 };
const SARATOGA = { id: 'saratoga', latitude: 37.26, longitude: -122.03 };
const LIVERMORE = { id: 'livermore', latitude: 37.68, longitude: -121.77 };

describe('external selected camera focus', () => {
  it('focuses a Favorite, Find Clear Skies, or direct selected id once', () => {
    expect(
      externalSelectedFocusId({
        routeSource: 'external',
        explicitSelectedId: 'napa',
      }),
    ).toBe('napa');
    expect(
      externalSelectedFocusId({
        routeSource: 'external',
        explicitSelectedId: 'livermore',
      }),
    ).toBe('livermore');
  });

  it('focuses each new external id', () => {
    expect(
      externalSelectedFocusId({
        routeSource: 'external',
        explicitSelectedId: 'napa',
      }),
    ).toBe('napa');
    expect(
      externalSelectedFocusId({
        routeSource: 'external',
        explicitSelectedId: 'saratoga',
      }),
    ).toBe('saratoga');
  });

  it('waits until the catalog contains the external id', () => {
    expect(resolvePendingExternalMapFocus('napa', [])).toBeNull();
    expect(resolvePendingExternalMapFocus('napa', [SARATOGA])).toBeNull();
    expect(resolvePendingExternalMapFocus('napa', [SARATOGA, NAPA])).toEqual(NAPA);
    expect(resolvePendingExternalMapFocus('livermore', [LIVERMORE])).toEqual(LIVERMORE);
  });

  it('does not create a focus for marker, search, or Organic route writes', () => {
    expect(
      externalSelectedFocusId({
        routeSource: 'local',
        explicitSelectedId: 'napa',
      }),
    ).toBeNull();
    expect(externalSelectedFocusId({
      routeSource: 'external',
      explicitSelectedId: null,
    })).toBeNull();
  });
});

describe('external selected camera source contract', () => {
  const map = readSource('src/app/map.tsx');
  const hook = readSource('src/hooks/useOrganicMapOrientation.ts');
  const favorites = readSource('src/components/favorites/SavedLocationCard.tsx');
  const clearSkies = readSource('src/components/home/FindClearSkiesCta.tsx');
  const bestRightNow = readSource('src/components/home/BestRightNowSection.tsx');
  const detail = readSource('src/app/location/[id].tsx');

  it('focuses external routes once and phone marker taps through the existing camera', () => {
    const external = map.slice(
      map.indexOf("if (routeSyncSource.current === 'local')"),
      map.indexOf('const markerRegionId'),
    );
    expect(external).toContain("routeSource: 'external'");
    expect(external).toContain('resolvePendingExternalMapFocus');
    expect(external).toContain('focusLocation(');

    const selection = map.slice(
      map.indexOf('function handleSelectLocation('),
      map.indexOf('function handleMarkerSelect('),
    );
    expect(selection).not.toContain('focusLocation');
    expect(selection).not.toContain('setPendingExternalFocusId');
    expect(selection).not.toContain('resolvePendingExternalMapFocus');

    const marker = map.slice(
      map.indexOf('function handleMarkerSelect('),
      map.indexOf('function handleClearSelection('),
    );
    expect(marker).toContain('handleSelectLocation(locationId)');
    expect(marker).toContain('if (!isPhone)');
    expect(marker.match(/focusLocation\(/g)).toHaveLength(1);
    expect(marker).not.toContain('setPendingExternalFocusId');
    expect(marker).not.toContain('resolvePendingExternalMapFocus');
    expect(marker).not.toContain('useEffect');
    expect(map.match(/onSelectLocation=\{handleMarkerSelect\}/g)).toHaveLength(1);
    expect(map).toContain('onSelectLocation: selectOrganicLocation');
    expect(map).toContain('onSelectLocation={handlePhoneSearchSelect}');

    const dismiss = map.slice(
      map.indexOf('function handleClearSelection('),
      map.indexOf('function handleSearchClearSelection('),
    );
    expect(dismiss).not.toContain('focusLocation');

    const search = map.slice(
      map.indexOf('const focusSearchSelection'),
      map.indexOf('const trimmedQuery'),
    );
    expect(search).toContain('focusLocation(');
    expect(hook.match(/focusLocation\(/g)).toHaveLength(1);
  });

  it('keeps explicit destinations on selected routes', () => {
    expect(favorites).toContain('openPrimaryRoute(buildMapHref(location.id)');
    expect(clearSkies).toContain('buildMapHref(locationId)');
    expect(clearSkies).toContain('router.push');
    expect(bestRightNow).toContain('buildMapHref(item.locationId)');
    expect(detail).toContain('buildMapHref(canonicalId');
    expect(detail).toContain('router.push');
  });
});
