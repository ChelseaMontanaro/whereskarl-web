import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { BAY_AREA_LOCATION_ZOOM } from '@/lib/map/mapConfig';
import {
  cameraStepsOnMapReady,
  rememberPreReadyMapFocus,
} from '@/lib/map/mapCameraReadiness';
import { shouldStartOrganicMapResolution } from '@/lib/map/organicMapEntry';

function readSource(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), 'utf8');
}

const nativeMap = readSource('src/components/KarlMap/KarlMap.native.tsx');
const mapScreen = readSource('src/app/map.tsx');

describe('pre-ready map focus', () => {
  it('retains a valid focus requested before readiness', () => {
    expect(rememberPreReadyMapFocus(null, 38.5, -122.3)).toEqual({
      latitude: 38.5,
      longitude: -122.3,
    });
  });

  it('keeps the latest valid pre-ready request', () => {
    const napa = rememberPreReadyMapFocus(null, 38.5, -122.3);
    expect(rememberPreReadyMapFocus(napa, 37.26, -122.03)).toEqual({
      latitude: 37.26,
      longitude: -122.03,
    });
  });

  it('does not replace a held request with invalid coordinates', () => {
    const napa = rememberPreReadyMapFocus(null, 38.5, -122.3);
    expect(rememberPreReadyMapFocus(napa, Number.NaN, -122.03)).toEqual(napa);
    expect(rememberPreReadyMapFocus(napa, 37.26, Number.POSITIVE_INFINITY)).toEqual(
      napa,
    );
  });
});

describe('onMapReady camera order', () => {
  it('fits all-Bay first when nothing is waiting', () => {
    expect(cameraStepsOnMapReady(null)).toEqual([{ type: 'all-bay' }]);
  });

  it('fits all-Bay and then dispatches the remembered focus', () => {
    expect(cameraStepsOnMapReady({ latitude: 38.5, longitude: -122.3 })).toEqual([
      { type: 'all-bay' },
      { type: 'focus', latitude: 38.5, longitude: -122.3 },
    ]);
  });

  it('uses the canonical location zoom and the existing 450ms region animation', () => {
    expect(BAY_AREA_LOCATION_ZOOM).toBe(11.4);
    const focus = nativeMap.slice(
      nativeMap.indexOf('const dispatchCanonicalLocationFocus'),
      nativeMap.indexOf('const handlePhoneMapReady'),
    );
    expect(focus).toContain('regionForCanonicalLocationZoom(');
    expect(focus).toContain('animateToRegion(');
    expect(focus).toContain('450');
  });

  it('clears the remembered focus only after the ready sequence dispatches it', () => {
    const ready = nativeMap.slice(
      nativeMap.indexOf('const handlePhoneMapReady'),
      nativeMap.indexOf('useImperativeHandle(ref'),
    );
    const focusDispatch = ready.indexOf('dispatchCanonicalLocationFocus(');
    const clearPending = ready.indexOf('pendingFocusRef.current = null');
    const markReady = ready.indexOf('mapReadyRef.current = true');

    expect(ready.indexOf("step.type === 'all-bay'")).toBeGreaterThan(-1);
    expect(focusDispatch).toBeGreaterThan(ready.indexOf("step.type === 'all-bay'"));
    expect(clearPending).toBeGreaterThan(focusDispatch);
    expect(markReady).toBeGreaterThan(clearPending);
    expect(ready).not.toContain('setTimeout');
    expect(ready).not.toContain('setInterval');
    expect(ready).not.toContain('requestAnimationFrame');
  });

  it('applies a post-ready focus immediately and does not add a MapView', () => {
    const focusLocation = nativeMap.slice(
      nativeMap.indexOf('focusLocation:'),
      nativeMap.indexOf('fitToIntensityFilter:'),
    );
    expect(focusLocation).toContain('if (phonePortraitWeb && !mapReadyRef.current)');
    expect(focusLocation).toContain('rememberPreReadyMapFocus(');
    expect(focusLocation).toContain('return;');
    expect(focusLocation.lastIndexOf('dispatchCanonicalLocationFocus(')).toBeGreaterThan(
      focusLocation.indexOf('return;'),
    );
    expect(nativeMap.match(/<MapView\n/g)).toHaveLength(1);
  });
});

describe('phone card X reset', () => {
  it('clears selection, calls the existing all-Bay reset, and keeps the search query', () => {
    const dismiss = mapScreen.slice(
      mapScreen.indexOf('function handleClearSelection('),
      mapScreen.indexOf('function handleSearchClearSelection('),
    );

    expect(dismiss).toContain('setSelectedLocationId(null)');
    expect(dismiss).toContain('syncMapRoute(null)');
    expect(dismiss).toContain('mapRef.current?.resetView()');
    expect(dismiss).not.toContain('setSearchQuery');
    expect(dismiss).not.toContain('focusLocation');
    expect(mapScreen).not.toContain('function resetCamera');
  });

  it('does not restart a completed Organic orientation when the card closes', () => {
    expect(
      shouldStartOrganicMapResolution({
        entry: 'organic',
        orient: 'tiburon-orient',
        lastProcessedOrient: 'tiburon-orient',
        explicitSelectedId: null,
      }),
    ).toBe(false);
  });
});
