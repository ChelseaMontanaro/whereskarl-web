import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  PHONE_PORTRAIT_MARKER_COLLISION_X,
  PHONE_PORTRAIT_MARKER_COLLISION_Y,
  PHONE_PORTRAIT_FALLBACK_COLLISION_THRESHOLDS,
  PHONE_PORTRAIT_LOW_ZOOM_HIDE_THRESHOLD,
  estimatePhonePortraitZoom,
  resolvePhonePortraitCollisionThresholds,
  resolvePhonePortraitVisibleMetaIds,
} from '@/lib/map/phonePortraitMapPresentation';
import { PHONE_PORTRAIT_FOG_RAIL_HEADING } from '@/lib/map/phonePortraitFogRail';
import {
  regionForCanonicalLocationZoom,
} from '@/lib/map/mapConfig';
import {
  PHONE_SHEET_LABEL_MAX_FONT_SCALE,
  PHONE_SHEET_SURFACE_TAP_ARM_DELAY_MS,
} from '@/lib/map/phoneSelectedSheetLayout';

function readSource(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), 'utf8');
}

const MAP_SCREEN_SOURCE = 'src/app/map.tsx';
const MAP_NATIVE_SOURCE = 'src/components/KarlMap/KarlMap.native.tsx';
const SELECTED_PREVIEW_SOURCE = 'src/components/SelectedLocationPreview.tsx';

/** Marin cluster that the physical-device pass could not identify by label. */
const MARIN = [
  { id: 'novato', latitude: 38.1074, longitude: -122.5697, sunshineScore: 36 },
  { id: 'san-rafael', latitude: 37.9735, longitude: -122.5311, sunshineScore: 36 },
  { id: 'fairfax', latitude: 37.9871, longitude: -122.5889, sunshineScore: 72 },
  {
    id: 'mount-tamalpais',
    latitude: 37.9235,
    longitude: -122.5965,
    sunshineScore: 29,
  },
  { id: 'mill-valley', latitude: 37.906, longitude: -122.5449, sunshineScore: 27 },
  {
    id: 'stinson-beach',
    latitude: 37.9005,
    longitude: -122.6444,
    sunshineScore: 25,
  },
  { id: 'tiburon', latitude: 37.8735, longitude: -122.4566, sunshineScore: 39 },
  { id: 'muir-beach', latitude: 37.8597, longitude: -122.5769, sunshineScore: 26 },
].map((entry) => ({ ...entry, region: 'north-bay' }));

/** Phone viewport zoomed into Marin, as in the physical-device screenshots. */
const MARIN_VIEWPORT = {
  width: 390,
  height: 844,
  latitudeDelta: 0.25,
  longitudeDelta: 0.12,
};

/** Wide all-Bay composition. */
const ALL_BAY_VIEWPORT = {
  width: 390,
  height: 844,
  latitudeDelta: 1.23,
  longitudeDelta: 0.96,
};

describe('search selection camera law', () => {
  it('routes every search-driven selection through one focus helper', () => {
    const source = readSource(MAP_SCREEN_SOURCE);

    // Typing a strong match auto-selects; that path previously bypassed the
    // focus entirely, which is why searching Tiburon never moved the camera.
    expect(source).toContain('focusSearchSelection(match.id)');
    expect(source).toContain('focusSearchSelection(locationId)');
    expect(source).toContain('mapRef.current?.focusLocation(');

    // focusLocation must be reachable only through the search helper.
    const focusCalls = source.match(/focusLocation\(/g) ?? [];
    expect(focusCalls).toHaveLength(1);
  });

  it('applies search focus via Apple Maps region span, not Camera.zoom', () => {
    const source = readSource(MAP_NATIVE_SOURCE);

    expect(source).toContain('regionForCanonicalLocationZoom(');
    expect(source).toContain('animateToRegion(');
    // Camera.zoom is Google Maps only; Apple Maps never reads it.
    expect(source).not.toContain('animateCamera(');
    expect(source).not.toContain('zoom: BAY_AREA_LOCATION_ZOOM');
  });

  it('converts the canonical search zoom into a tighter-than-all-Bay region', () => {
    const focused = regionForCanonicalLocationZoom(37.8735, -122.4566, {
      width: 390,
      height: 720,
    });

    expect(focused.latitude).toBe(37.8735);
    expect(focused.longitude).toBe(-122.4566);
    expect(focused.longitudeDelta).toBeLessThan(0.3);
    expect(focused.latitudeDelta).toBeLessThan(0.6);
    expect(focused.longitudeDelta).toBeGreaterThan(0.05);
  });

  it('leaves marker taps, deep links and card dismiss without camera motion', () => {
    const source = readSource(MAP_SCREEN_SOURCE);

    const markerHandler = source.slice(
      source.indexOf('function handleSelectLocation('),
      source.indexOf('function handleClearSelection('),
    );
    expect(markerHandler).not.toContain('focusSearchSelection');
    expect(markerHandler).not.toContain('focusLocation');
    expect(markerHandler).not.toContain('resetView');
    expect(markerHandler).not.toContain('fitToRegion');

    const dismissHandler = source.slice(
      source.indexOf('function handleClearSelection('),
      source.indexOf('function handleSearchClearSelection('),
    );
    expect(dismissHandler).not.toContain('resetView');
    expect(dismissHandler).not.toContain('focusLocation');
  });

  it('keeps search clear on the canonical all-Bay reset', () => {
    const source = readSource(MAP_SCREEN_SOURCE);
    const searchClear = source.slice(
      source.indexOf('function handleSearchClearSelection('),
      source.indexOf('function handleOpenLocationDetail('),
    );

    expect(searchClear).toContain('mapRef.current?.resetView()');
    expect(searchClear).toContain("setSearchQuery('')");
  });

  it('keeps phone-portrait selection free of the layout recenter effect', () => {
    const source = readSource(MAP_NATIVE_SOURCE);

    expect(source).toContain(
      'if (phonePortraitWeb || !selectedLocationId || !mapRef.current)',
    );
  });
});

describe('label declutter collision geometry', () => {
  it('expresses web’s pixel collision box in degrees for the live viewport', () => {
    const thresholds = resolvePhonePortraitCollisionThresholds(MARIN_VIEWPORT);

    expect(thresholds.latitude).toBeCloseTo(
      (MARIN_VIEWPORT.latitudeDelta / MARIN_VIEWPORT.height) *
        PHONE_PORTRAIT_MARKER_COLLISION_Y,
      10,
    );
    expect(thresholds.longitude).toBeCloseTo(
      (MARIN_VIEWPORT.longitudeDelta / MARIN_VIEWPORT.width) *
        PHONE_PORTRAIT_MARKER_COLLISION_X,
      10,
    );
  });

  it('shrinks its geographic reach as the map zooms in, like web', () => {
    const wide = resolvePhonePortraitCollisionThresholds(ALL_BAY_VIEWPORT);
    const zoomed = resolvePhonePortraitCollisionThresholds(MARIN_VIEWPORT);

    expect(zoomed.latitude).toBeLessThan(wide.latitude);
    expect(zoomed.longitude).toBeLessThan(wide.longitude);
  });

  it('falls back to the tuned constants until the map reports a viewport', () => {
    for (const invalid of [
      undefined,
      null,
      { width: 0, height: 844, latitudeDelta: 0.25, longitudeDelta: 0.12 },
      { width: 390, height: 844, latitudeDelta: 0, longitudeDelta: 0.12 },
      {
        width: 390,
        height: Number.NaN,
        latitudeDelta: 0.25,
        longitudeDelta: 0.12,
      },
    ]) {
      expect(resolvePhonePortraitCollisionThresholds(invalid)).toEqual(
        PHONE_PORTRAIT_FALLBACK_COLLISION_THRESHOLDS,
      );
    }
  });

  it('identifies Mount Tamalpais and its neighbour once zoomed into Marin', () => {
    // The physical-device complaint: zooming in to find Mount Tamalpais still
    // showed unlabelled icons because collision was zoom-invariant.
    const zoomed = resolvePhonePortraitVisibleMetaIds(MARIN, null, {
      viewport: MARIN_VIEWPORT,
    });

    expect(zoomed.has('mount-tamalpais')).toBe(true);
    expect(zoomed.has('mill-valley')).toBe(true);
    expect(zoomed.has('muir-beach')).toBe(true);
    expect(zoomed.has('stinson-beach')).toBe(true);
  });

  it('still declutters the same cluster at the wide all-Bay composition', () => {
    const wide = resolvePhonePortraitVisibleMetaIds(MARIN, null, {
      viewport: ALL_BAY_VIEWPORT,
    });

    expect(wide.size).toBeLessThan(
      resolvePhonePortraitVisibleMetaIds(MARIN, null, {
        viewport: MARIN_VIEWPORT,
      }).size,
    );
  });

  it('stops selection from changing the label set once nothing collides', () => {
    // Web keeps `isSelected` in its declutter ordering, so Universal keeps it
    // too. Ordering only matters when markers actually collide, so at a zoom
    // where the Marin cluster is separated the visible set must be identical
    // for every selection — which is what removes the observed label churn.
    const sets = [null, 'mount-tamalpais', 'muir-beach', 'mill-valley'].map(
      (selectedId) =>
        [
          ...resolvePhonePortraitVisibleMetaIds(MARIN, selectedId, {
            viewport: MARIN_VIEWPORT,
          }),
        ].sort(),
    );

    for (const set of sets) {
      expect(set).toEqual(sets[0]);
    }
  });

  it('always labels the selected location and never mutates coordinates', () => {
    const before = MARIN.map((entry) => ({ ...entry }));

    for (const selectedId of ['mount-tamalpais', 'muir-beach']) {
      const visible = resolvePhonePortraitVisibleMetaIds(MARIN, selectedId, {
        viewport: MARIN_VIEWPORT,
      });
      expect(visible.has(selectedId)).toBe(true);
    }

    expect(MARIN).toEqual(before);
  });

  it('feeds the live rendered viewport into the native declutter', () => {
    const source = readSource(MAP_NATIVE_SOURCE);

    expect(source).toContain('onLayout={handleMapLayout}');
    expect(source).toContain(
      'onRegionChangeComplete={handleRegionChangeComplete}',
    );
    expect(source).toContain('onRegionChange={handleRegionChangeComplete}');
    expect(source).toContain('viewport: mapViewport');
    expect(source).toContain('applyLowZoomHiding: applyLowZoomLabelHiding');
    // Panning at a fixed scale must not re-resolve labels.
    expect(source).toContain('current.longitudeDelta - next.longitudeDelta');
  });

  it('stops suppressing coastal labels once zoomed past the web threshold', () => {
    expect(estimatePhonePortraitZoom(MARIN_VIEWPORT)).toBeGreaterThan(
      PHONE_PORTRAIT_LOW_ZOOM_HIDE_THRESHOLD,
    );
    expect(estimatePhonePortraitZoom(ALL_BAY_VIEWPORT)).toBeLessThan(
      PHONE_PORTRAIT_LOW_ZOOM_HIDE_THRESHOLD,
    );
  });

  it('matches web: a region chip disables all-Bay low-zoom label suppression', () => {
    const source = readSource(MAP_SCREEN_SOURCE);

    expect(source).toContain('applyLowZoomLabelHiding={!selectedRegionId}');
  });
});

describe('selected-location card expansion interaction', () => {
  it('offers both web expand paths: grab handle and collapsed surface tap', () => {
    const source = readSource(SELECTED_PREVIEW_SOURCE);

    expect(source).toContain('onPress={handleToggleExpanded}');
    expect(source).toContain('onPress={handleSurfacePress}');
    expect(source).toContain('styles.phoneSheetSurface');
  });

  it('makes surface tap expand-only, with the handle owning collapse', () => {
    const source = readSource(SELECTED_PREVIEW_SOURCE);
    const surfacePress = source.slice(
      source.indexOf('function handleSurfacePress('),
      source.indexOf('return (', source.indexOf('function handleSurfacePress(')),
    );

    // Web: "Never collapses on surface tap (the grab handle and drag remain the
    // collapse affordances)."
    expect(surfacePress).toContain('if (isExpanded || !surfaceExpandArmed)');
    expect(surfacePress).toContain('return;');
  });

  it('arms surface tap only after the opening tap can no longer fall through', () => {
    expect(PHONE_SHEET_SURFACE_TAP_ARM_DELAY_MS).toBe(400);

    const source = readSource(SELECTED_PREVIEW_SOURCE);
    expect(source).toContain('setSurfaceExpandArmed(false)');
    expect(source).toContain('PHONE_SHEET_SURFACE_TAP_ARM_DELAY_MS');
    expect(source).toContain('}, [location.id]);');
  });

  it('keeps the handle announced and the surface non-announcing', () => {
    const source = readSource(SELECTED_PREVIEW_SOURCE);

    expect(source).toContain(
      "isExpanded ? 'Collapse details' : 'Expand details'",
    );
    expect(source).toContain('accessible={false}');
  });

  it('never reintroduces the non-parity gold expansion row', () => {
    const source = readSource(SELECTED_PREVIEW_SOURCE);

    expect(source).not.toContain('More conditions');
    expect(source).not.toContain('Show less');
    expect(source).not.toContain('expandToggleLabel');
    expect(source).not.toContain('expandChevron');
  });

  it('leaves the expanded scroll outside the surface press target', () => {
    const source = readSource(SELECTED_PREVIEW_SOURCE);

    // The closing surface Pressable must precede the expanded ScrollView so a
    // scroll gesture is never contested by the expand press.
    expect(source.indexOf('</Pressable>\n\n      {isExpanded ? (')).
      toBeGreaterThan(source.indexOf('onPress={handleSurfacePress}'));
  });
});

describe('collapsed card layout contract', () => {
  /**
   * Conservative width estimate for uppercase semibold text. Deliberately
   * generous per character so the assertion fails before a device would clip.
   */
  function estimateUppercaseWidth(
    text: string,
    fontSize: number,
    letterSpacing: number,
  ): number {
    return text.length * (fontSize * 0.62 + letterSpacing);
  }

  /** Core Weather strip cell width at a given phone viewport width. */
  function heroCellWidth(viewportWidth: number): number {
    const outerInset = 8;
    const sheetPadding = 12;
    const cellPadding = 4;
    const flexTotal = 2.2 + 1.25 + 1 + 1.25;
    const content = viewportWidth - outerInset * 2 - sheetPadding * 2;

    return (content * 2.2) / flexTotal - cellPadding * 2;
  }

  it('fits the long Clear Sky Score title at the web reference width', () => {
    // Web comment: tokens are tuned "so the long Clear Sky Score label fits at
    // 390px without a score-only shrink or wrap".
    const bounded =
      estimateUppercaseWidth('CLEAR SKY SCORE', 11, 0.4) *
      PHONE_SHEET_LABEL_MAX_FONT_SCALE;

    expect(bounded).toBeLessThan(heroCellWidth(390));
  });

  it('would have overflowed at unbounded iOS Dynamic Type', () => {
    // The physical device showed "CLEAR SKY SC…" at enlarged text.
    const unbounded = estimateUppercaseWidth('CLEAR SKY SCORE', 11, 0.4) * 1.33;

    expect(unbounded).toBeGreaterThan(heroCellWidth(390));
  });

  it('bounds Dynamic Type growth without pinning it to web’s fixed px', () => {
    expect(PHONE_SHEET_LABEL_MAX_FONT_SCALE).toBeGreaterThan(1);
    expect(PHONE_SHEET_LABEL_MAX_FONT_SCALE).toBeLessThanOrEqual(1.2);
  });

  it('shrinks rather than truncates the fixed-geometry labels', () => {
    const source = readSource(SELECTED_PREVIEW_SOURCE);

    for (const marker of [
      'maxFontSizeMultiplier={PHONE_SHEET_LABEL_MAX_FONT_SCALE}',
      'minimumFontScale={0.85}',
    ]) {
      expect(source).toContain(marker);
    }

    // Title, subtitle/timestamp and supporting labels all bounded.
    const bounded =
      source.match(
        /maxFontSizeMultiplier=\{PHONE_SHEET_LABEL_MAX_FONT_SCALE\}/g,
      ) ?? [];
    expect(bounded.length).toBeGreaterThanOrEqual(4);
  });

  it('precomposes uppercase titles so iOS does not measure mixed-case then clip', () => {
    const source = readSource(SELECTED_PREVIEW_SOURCE);

    expect(source).toContain('title="CLEAR SKY SCORE"');
    expect(source).toContain('title="FOG"');
    expect(source).toContain('title="TEMP"');
    expect(source).toContain('title="WIND"');
    const coreTitle = source.slice(
      source.indexOf('coreTitle: {'),
      source.indexOf('coreValueRow: {'),
    );
    expect(coreTitle).not.toContain("textTransform: 'uppercase'");
    expect(source).toContain('coreTitleRow');
    expect(source).toContain('height: 20');
    // The value row reserves web's h-11 budget rather than capping at it; a hard
    // cap clipped the 38pt Clear Sky Score out of existence on device. See
    // phase24CardAndLayerParity.test.ts for the full row/line-box contract.
    expect(source).toContain('minHeight: 44');
  });

  it('keeps the collapsed title readable at the narrowest supported width', () => {
    // 320pt is narrower than web's tuned 390pt, so the title relies on
    // adjustsFontSizeToFit; verify the shrink floor is enough.
    const needed = estimateUppercaseWidth('CLEAR SKY SCORE', 11, 0.4) * 0.85;

    expect(needed).toBeLessThanOrEqual(heroCellWidth(320));
  });

  it('uses web’s three-row metric column with a shared supporting baseline', () => {
    const source = readSource(SELECTED_PREVIEW_SOURCE);

    expect(source).toContain('coreTitleRow');
    expect(source).toContain('coreValueRow');
    expect(source).toContain('coreCellDivider');
    expect(source).toContain("showDivider={false}");
    expect(source).toContain("{supporting ?? '\\u00A0'}");
    expect(source).toContain("marginTop: 'auto'");
    expect(source).toContain("justifyContent: 'center'");
  });

  it('omits unfinished Marine Layer and Fog Ceiling cards', () => {
    const source = readSource(SELECTED_PREVIEW_SOURCE);

    expect(source).not.toContain('MARINE LAYER');
    expect(source).not.toContain('FOG CEILING');
    expect(source).not.toContain('ComingSoonMetric');
    expect(source).toContain('title="CLEAR SKY SCORE"');
    expect(source).toContain('title="FOG"');
    expect(source).toContain('title="TEMP"');
    expect(source).toContain('title="WIND"');
    expect(source).toContain('Environmental Metrics');
    expect(source).toContain('Karl’s Read');
    expect(source).toContain('Hourly Outlook');
  });
});

describe('fog level rail heading', () => {
  it('renders the heading as pinned single lines, never a wrapping string', () => {
    const source = readSource(
      'src/components/map/MapPhonePortraitFogRail.tsx',
    );

    expect(PHONE_PORTRAIT_FOG_RAIL_HEADING).toEqual(['FOG', 'LEVEL']);
    expect(source).toContain('PHONE_PORTRAIT_FOG_RAIL_HEADING.map');
    expect(source).toContain('maxFontSizeMultiplier={1}');
    expect(source).toContain('numberOfLines={1}');
    expect(source).toContain('PHONE_PORTRAIT_FOG_RAIL_WIDTH');
  });
});
