import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  getFogIntensityLabel,
  locationMatchesFogIntensityFilter,
  type FogIntensity,
} from '@whereskarl/domain';
import { filterMarkerLocationsByFogLevel } from '@/lib/map/locationsDisplay';
import {
  PHONE_PORTRAIT_FOG_RAIL_HEADING,
  PHONE_PORTRAIT_FOG_RAIL_HEADING_FONT_SIZE,
  PHONE_PORTRAIT_FOG_RAIL_LABEL_FONT_SIZE,
  PHONE_PORTRAIT_FOG_RAIL_MAX_FONT_SCALE,
  phonePortraitFogRailAccessibilityLabel,
  phonePortraitFogRailDisplayLabel,
  phonePortraitFogRailLabelLines,
  phonePortraitFogRailLabelWidth,
} from '@/lib/map/phonePortraitFogRail';
import {
  PHONE_PORTRAIT_INTENSITY_FILTER_MAX_ZOOM,
  PHONE_PORTRAIT_INTENSITY_FILTER_PADDING,
  resolvePhonePortraitIntensityFilterCamera,
} from '@/lib/map/phonePortraitCameraPresets';
import {
  PHONE_PORTRAIT_CHIP_FONT_SIZE,
  PHONE_PORTRAIT_CHIP_LABEL_MAX_FONT_SCALE,
  PHONE_PORTRAIT_CHIP_MIN_HEIGHT,
  PHONE_PORTRAIT_CHIP_MIN_WIDTH,
  estimatePhonePortraitChipWidth,
  phonePortraitChipRowContentWidth,
  phonePortraitChipRowFitsWithoutScrolling,
  phonePortraitLastChipFullyReachable,
  resolvePhonePortraitChipRowJustify,
} from '@/lib/map/phonePortraitRegionChips';
import { BAY_AREA_PRODUCT_REGIONS } from '@/lib/map/regions';

function readSource(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), 'utf8');
}

/** Source with comments removed, so prose can't satisfy a code assertion. */
function codeOnly(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
}

const CONTROLS_SOURCE = 'src/components/map/MapPhonePortraitControls.tsx';
const FOG_RAIL_SOURCE = 'src/components/map/MapPhonePortraitFogRail.tsx';
const SEARCH_BAR_SOURCE = 'src/components/map/MapLocationSearchBar.tsx';
const LAYER_CONTROLS_SOURCE = 'src/components/map/MapLayerControls.tsx';
const MAP_GLASS_SOURCE = 'src/components/map/mapGlassPanel.ts';
const SELECTED_PREVIEW_SOURCE = 'src/components/SelectedLocationPreview.tsx';
const MAP_NATIVE_SOURCE = 'src/components/KarlMap/KarlMap.native.tsx';
const MAP_WEB_SOURCE = 'src/components/KarlMap/KarlMap.web.tsx';
const PRESENTATION_SOURCE = 'src/lib/map/phonePortraitMapPresentation.ts';
const GLASS_TOKENS_SOURCE = 'src/constants/liquidGlass.ts';
const MAP_SCREEN_SOURCE = 'src/app/map.tsx';

/** Golden Rule verification widths. */
const VERIFICATION_WIDTHS = [320, 390, 430, 768, 820, 1024, 1180] as const;

const RAIL_INTENSITIES: FogIntensity[] = [
  'clear',
  'lightFog',
  'foggy',
  'karlTerritory',
];

// ---------------------------------------------------------------------------
// 1. Region chip row — the trailing chip is never clipped out of reach
// ---------------------------------------------------------------------------

describe('phone region chip row reachability', () => {
  const chipWidths = (fontScale: number) =>
    BAY_AREA_PRODUCT_REGIONS.map((region) =>
      estimatePhonePortraitChipWidth(region.chipLabel, fontScale),
    );

  it('centres only while the whole row fits the viewport', () => {
    // Centring an overflowing row pushes its edges outside the ScrollView's
    // content size, which is unreachable by scrolling.
    expect(resolvePhonePortraitChipRowJustify(430, 400)).toBe('center');
    expect(resolvePhonePortraitChipRowJustify(430, 430)).toBe('center');
    expect(resolvePhonePortraitChipRowJustify(390, 440)).toBe('flex-start');
    expect(resolvePhonePortraitChipRowJustify(320, 440)).toBe('flex-start');
  });

  it('falls back to centring before measurement has resolved', () => {
    expect(resolvePhonePortraitChipRowJustify(0, 0)).toBe('center');
  });

  it('keeps the rightmost chip reachable at every verification width', () => {
    for (const fontScale of [1, PHONE_PORTRAIT_CHIP_LABEL_MAX_FONT_SCALE]) {
      const widths = chipWidths(fontScale);
      const contentWidth = phonePortraitChipRowContentWidth(widths);

      for (const viewportWidth of VERIFICATION_WIDTHS) {
        expect(
          phonePortraitLastChipFullyReachable(viewportWidth, widths),
        ).toBe(true);

        // Whenever the row overflows it must pack leading, which is the
        // precondition that makes the reachability guarantee above hold.
        if (contentWidth > viewportWidth) {
          expect(
            resolvePhonePortraitChipRowJustify(viewportWidth, contentWidth),
          ).toBe('flex-start');
        }
      }
    }
  });

  it('includes Peninsula as the trailing canonical chip', () => {
    const labels = BAY_AREA_PRODUCT_REGIONS.map((region) => region.chipLabel);

    expect(labels).toContain('Peninsula');
    expect(labels[labels.length - 1]).toBe('Peninsula');
  });

  it('fits all five chips at phone widths without any scrolling', () => {
    const labels = BAY_AREA_PRODUCT_REGIONS.map((region) => region.chipLabel);

    expect(labels).toHaveLength(5);

    // Real phone widths must show the whole row at rest, so "Peninsula" is
    // readable without dragging. 320pt cannot hold five chips at a readable
    // size and still scrolls, exactly as the web reference does.
    for (const viewportWidth of [390, 430, 768, 820, 1024, 1180]) {
      expect(
        phonePortraitChipRowFitsWithoutScrolling(viewportWidth, labels),
      ).toBe(true);
      expect(
        resolvePhonePortraitChipRowJustify(
          viewportWidth,
          phonePortraitChipRowContentWidth(
            chipWidths(PHONE_PORTRAIT_CHIP_LABEL_MAX_FONT_SCALE),
          ),
        ),
      ).toBe('center');
    }
  });

  it('fits without shrinking the approved label typography', () => {
    // The row's width budget must be met by spacing, never by making the
    // labels smaller — that was explicitly ruled out.
    expect(PHONE_PORTRAIT_CHIP_FONT_SIZE).toBe(12);
    expect(PHONE_PORTRAIT_CHIP_MIN_HEIGHT).toBe(40);
    expect(PHONE_PORTRAIT_CHIP_MIN_WIDTH).toBe(44);

    // Web's `text-xs` is a fixed CSS px, so the row's width must not grow with
    // Dynamic Type or the fit above stops holding on a device.
    expect(PHONE_PORTRAIT_CHIP_LABEL_MAX_FONT_SCALE).toBe(1);
  });

  it('resolves packing from measured layout, never a device model', () => {
    const source = readSource(CONTROLS_SOURCE);

    expect(source).toContain('onContentSizeChange');
    expect(source).toContain('resolvePhonePortraitChipRowJustify');
    expect(source).toContain('justifyContent: chipRowJustify');

    // A hardcoded centre on the row itself is the defect this replaced. (The
    // per-chip style legitimately centres its own label.)
    const chipRow = source.slice(
      source.indexOf('chipRow: {'),
      source.indexOf('chipRowTrailing: {'),
    );
    expect(chipRow).not.toMatch(/^\s*justifyContent:/m);

    expect(codeOnly(source)).not.toMatch(
      /iPhone|Platform\.constants|deviceName/,
    );
  });
});

// ---------------------------------------------------------------------------
// 2. Fog rail — approved copy, readable typography, no wrapping
// ---------------------------------------------------------------------------

describe('phone fog rail copy and typography', () => {
  const source = readSource(FOG_RAIL_SOURCE);

  it('uses the approved FOG LEVEL heading', () => {
    expect(PHONE_PORTRAIT_FOG_RAIL_HEADING).toEqual(['FOG', 'LEVEL']);
    expect(PHONE_PORTRAIT_FOG_RAIL_HEADING.join(' ')).toBe('FOG LEVEL');
  });

  it('has retired the FOG INTENSITY copy from the rail', () => {
    expect(PHONE_PORTRAIT_FOG_RAIL_HEADING).not.toContain('INTENSITY');
    expect(source).not.toContain('INTENSITY');
    expect(source).not.toContain('Fog intensity');
  });

  it('shows Karl in the rail while assistive tech keeps the canonical label', () => {
    expect(phonePortraitFogRailDisplayLabel('karlTerritory')).toBe('Karl');
    expect(phonePortraitFogRailAccessibilityLabel('karlTerritory')).toBe(
      getFogIntensityLabel('karlTerritory'),
    );
    expect(phonePortraitFogRailAccessibilityLabel('karlTerritory')).toBe(
      'Karl Territory',
    );
  });

  it('leaves every other intensity on its canonical domain label', () => {
    for (const intensity of RAIL_INTENSITIES) {
      if (intensity === 'karlTerritory') {
        continue;
      }
      expect(phonePortraitFogRailDisplayLabel(intensity)).toBe(
        getFogIntensityLabel(intensity),
      );
    }
  });

  it('never allows a single-word label to wrap', () => {
    expect(phonePortraitFogRailLabelLines('Foggy')).toBe(1);
    expect(phonePortraitFogRailLabelLines('Karl')).toBe(1);
    expect(phonePortraitFogRailLabelLines('Clear')).toBe(1);
    // Only multi-word copy may take a second line, and it breaks at the space.
    expect(phonePortraitFogRailLabelLines('Light Fog')).toBe(2);
  });

  it('gives selected and unselected labels the same usable width', () => {
    // The active treatment is colour + weight only. If selection changed the
    // border width it would shrink the text box and could induce a wrap.
    const width = phonePortraitFogRailLabelWidth();

    expect(width).toBeGreaterThan(0);
    expect(source).toContain('cardActive: {');
    const cardActive = source.slice(
      source.indexOf('cardActive: {'),
      source.indexOf('icon: {'),
    );
    expect(cardActive).not.toContain('borderWidth');
    expect(cardActive).not.toContain('paddingHorizontal');
  });

  it('keeps rail typography readable and proportional', () => {
    // The previous 7pt heading was smaller than the 8pt labels beneath it.
    expect(PHONE_PORTRAIT_FOG_RAIL_HEADING_FONT_SIZE).toBeGreaterThanOrEqual(9);
    expect(PHONE_PORTRAIT_FOG_RAIL_LABEL_FONT_SIZE).toBeGreaterThanOrEqual(10);
    expect(PHONE_PORTRAIT_FOG_RAIL_HEADING_FONT_SIZE).toBeLessThanOrEqual(
      PHONE_PORTRAIT_FOG_RAIL_LABEL_FONT_SIZE,
    );
  });

  it('bounds Dynamic Type on the item labels', () => {
    // Unbounded growth on a fixed-width rail is what wrapped single words.
    expect(source).toContain(
      'maxFontSizeMultiplier={PHONE_PORTRAIT_FOG_RAIL_MAX_FONT_SCALE}',
    );
    expect(PHONE_PORTRAIT_FOG_RAIL_MAX_FONT_SCALE).toBeLessThanOrEqual(1.2);
    expect(source).toContain('phonePortraitFogRailLabelLines(label)');
  });
});

// ---------------------------------------------------------------------------
// 3. Fog-level filter visibility
// ---------------------------------------------------------------------------

describe('fog-level filter marker visibility', () => {
  const bayLocation = (
    id: string,
    fogScore: number,
    sunshineScore: number,
  ) => ({
    id,
    latitude: 37.8,
    longitude: -122.4,
    fogScore,
    sunshineScore,
  });

  /**
   * Fixtures chosen so each one lands in a different canonical category via
   * `locationMatchesFogIntensityFilter` — the classification is the domain's,
   * not this test's.
   */
  const catalog = [
    bayLocation('clear-a', 4, 96),
    bayLocation('clear-b', 8, 90),
    bayLocation('light-a', 32, 58),
    bayLocation('foggy-a', 62, 30),
    bayLocation('karl-a', 88, 8),
  ];

  const idsFor = (intensity: FogIntensity | null) =>
    filterMarkerLocationsByFogLevel(catalog, intensity).map(
      (location) => location.id,
    );

  const canonicalMembers = (intensity: FogIntensity) =>
    catalog
      .filter((location) =>
        locationMatchesFogIntensityFilter(location, intensity),
      )
      .map((location) => location.id);

  it('spans all four rail categories', () => {
    // Guard: without a genuine member per category the bleed-through
    // assertions below would pass while proving nothing.
    expect(idsFor('clear')).toEqual(['clear-a', 'clear-b']);
    expect(idsFor('lightFog')).toEqual(['light-a']);
    expect(idsFor('foggy')).toEqual(['foggy-a']);
    expect(idsFor('karlTerritory')).toEqual(['karl-a']);
  });

  it('shows the complete marker set when no level is selected', () => {
    expect(idsFor(null)).toEqual(catalog.map((location) => location.id));
  });

  it('shows only the selected category, with no bleed-through', () => {
    for (const intensity of RAIL_INTENSITIES) {
      const visible = idsFor(intensity);
      const expected = canonicalMembers(intensity);

      expect(visible).toEqual(expected);

      // Every other category must be absent from the set entirely — the
      // physical-iPhone defect was Karl markers surviving a Foggy selection.
      for (const other of RAIL_INTENSITIES.filter(
        (candidate) => candidate !== intensity,
      )) {
        for (const id of canonicalMembers(other)) {
          if (!expected.includes(id)) {
            expect(visible).not.toContain(id);
          }
        }
      }
    }
  });

  it('cannot retain markers when switching between levels', () => {
    // Each selection is derived fresh from the catalog, so nothing can carry
    // over from the previously selected level.
    const sequence = RAIL_INTENSITIES.map((intensity) => idsFor(intensity));

    sequence.forEach((visible, index) => {
      expect(visible).toEqual(canonicalMembers(RAIL_INTENSITIES[index]));
    });

    expect(idsFor(null)).toEqual(catalog.map((location) => location.id));
  });

  it('removes non-matching markers instead of de-emphasising them', () => {
    const presentation = readSource(PRESENTATION_SOURCE);

    // A filtered-out marker no longer exists, so no opacity treatment for one
    // may come back: dimming both washed out the map and let other categories
    // stay readable underneath.
    expect(presentation).not.toContain('resolveMapMarkerFilterOpacity');
    expect(presentation).not.toContain('MAP_MARKER_FILTERED_OUT_OPACITY');
  });

  it('renders the filtered set on both platforms', () => {
    for (const relativePath of [MAP_NATIVE_SOURCE, MAP_WEB_SOURCE]) {
      const source = readSource(relativePath);

      expect(source).toContain('filterMarkerLocationsByFogLevel');
      expect(codeOnly(source)).not.toContain('isFilteredOut');
    }

    const native = readSource(MAP_NATIVE_SOURCE);
    expect(native).toContain('{visibleLocations.map((location) => {');
  });

  it('declutters over the filtered set so visible labels keep their slots', () => {
    // Label slots are won by collision. Including a filtered-out location would
    // let a marker that is off the map suppress the label of one that is on it.
    const native = readSource(MAP_NATIVE_SOURCE);

    expect(native).toContain('visibleLocations.map((location) => ({');

    const web = readSource(MAP_WEB_SOURCE);
    expect(web).toContain(
      'const entries: DeclutterEntry[] = visibleLocations.flatMap',
    );
  });

  it('frames exactly the markers it leaves on the map', () => {
    // Same helper for the rendered set and the camera fit, so the two can never
    // disagree and there is only one classification in play.
    for (const relativePath of [MAP_NATIVE_SOURCE, MAP_WEB_SOURCE]) {
      const source = readSource(relativePath);
      const fit = source.slice(source.indexOf('fitToIntensityFilter:'));

      expect(fit.slice(0, 600)).toContain('filterMarkerLocationsByFogLevel');
    }
  });
});

// ---------------------------------------------------------------------------
// 4. Search interaction contract
// ---------------------------------------------------------------------------

describe('phone map search interaction contract', () => {
  const source = readSource(SEARCH_BAR_SOURCE);

  it('ends editing on both exits from the results overlay', () => {
    const selectHandler = source.slice(
      source.indexOf('function handleSelectResult'),
      source.indexOf('const hasQuery'),
    );

    expect(selectHandler).toContain('endSearchEditing()');
    expect(selectHandler).toContain('onSelectLocation(location.id)');
    expect(selectHandler).toContain('onClearSelectedLocation()');
  });

  it('relinquishes focus as well as hiding the keyboard', () => {
    const endEditing = source.slice(
      source.indexOf('function endSearchEditing'),
      source.indexOf('function handleSelectResult'),
    );

    expect(endEditing).toContain('inputRef.current?.blur()');
    expect(endEditing).toContain('Keyboard.dismiss()');
    expect(endEditing).toContain('setIsOverlayOpen(false)');
  });

  it('confines keyboard dismissal to the search-state handlers', () => {
    // Scattering dismissals through typing/focus handlers would fight the user.
    expect(source.match(/Keyboard\.dismiss\(\);/g)).toHaveLength(1);
    const typing = source.slice(
      source.indexOf('onChangeText'),
      source.indexOf('placeholder='),
    );
    expect(typing).not.toContain('Keyboard');
  });

  it('renders results as an overlay that cannot reflow the chip row', () => {
    const overlay = source.slice(
      source.indexOf('overlay: {'),
      source.indexOf('resultsList: {'),
    );

    expect(overlay).toContain("position: 'absolute'");
    expect(overlay).toContain('left: 0');
    expect(overlay).toContain('right: 0');
    expect(overlay).toContain('zIndex');
    // `marginTop` in normal flow is what pushed the chips down.
    expect(overlay).not.toContain('marginTop');
    expect(source).toContain('top: pillHeight + OVERLAY_GAP');
  });

  it('keeps the results surface on the approved glass language', () => {
    const overlay = source.slice(
      source.indexOf('overlay: {'),
      source.indexOf('resultsList: {'),
    );

    expect(source).toContain('<LiquidGlassSurface');
    expect(overlay).toContain('LiquidGlassTokens.fill');
    expect(overlay).toContain('LiquidGlassTokens.border');
    expect(overlay).not.toContain('rgba(6, 15, 27, 0.94)');
  });

  it('still keeps taps working while the keyboard is up', () => {
    expect(source).toContain('keyboardShouldPersistTaps="handled"');
  });

  it('closes the results panel once the query has been resolved', () => {
    // A focus event cannot be what keeps the panel open: iOS re-delivers focus
    // to the field as first-responder status settles after the result tap, which
    // is what left the dropdown showing the location just chosen.
    expect(source).toContain(
      'isOverlayOpen && !isQueryResolved && query.trim().length > 0',
    );

    const endEditing = source.slice(
      source.indexOf('function endSearchEditing'),
      source.indexOf('function handleSelectResult'),
    );
    expect(endEditing).toContain('setIsQueryResolved(true)');
  });

  it('lets a later search reopen results normally', () => {
    // Editing the query is the only thing that clears the resolved latch, and
    // it is also the only moment results should come back — so selecting one
    // result can never permanently disable search.
    const typing = source.slice(
      source.indexOf('onChangeText'),
      source.indexOf('onFocus='),
    );

    expect(typing).toContain('setIsQueryResolved(false)');
    expect(typing).toContain('setIsOverlayOpen(true)');
  });

  it('keeps the approved select and clear transactions intact', () => {
    const selectHandler = source.slice(
      source.indexOf('function handleSelectResult'),
      source.indexOf('function handleClear'),
    );
    const clearHandler = source.slice(
      source.indexOf('function handleClear'),
      source.indexOf('const hasQuery'),
    );

    // Selection keeps the chosen name in the field (web parity) and still
    // delegates the canonical selection + camera focus to the map screen.
    expect(selectHandler).toContain('setQuery(location.name)');
    expect(selectHandler).toContain('onSelectLocation(location.id)');
    expect(selectHandler).not.toContain('resetView');

    expect(clearHandler).toContain("setQuery('')");
    expect(clearHandler).toContain('onClearSelectedLocation()');
  });
});

// ---------------------------------------------------------------------------
// 5. Map floating surfaces share the approved glass language
// ---------------------------------------------------------------------------

describe('map floating surface glass consistency', () => {
  it('builds the shared Map panel from the approved tokens', () => {
    const source = readSource(MAP_GLASS_SOURCE);

    expect(source).toContain('LiquidGlassTokens.fill');
    expect(source).toContain('LiquidGlassTokens.border');
    expect(source).not.toContain('rgba(3, 11, 20, 0.94)');
  });

  it('renders the Map Layers panel through the shared glass surface', () => {
    const source = readSource(LAYER_CONTROLS_SOURCE);

    expect(source).toContain('<LiquidGlassSurface');
    expect(source).toContain('variant="panel"');
    expect(source).toContain('</LiquidGlassSurface>');
  });

  it('keeps the selected-location card on the token fill', () => {
    const source = readSource(SELECTED_PREVIEW_SOURCE);
    const phoneSheet = source.slice(
      source.indexOf('phoneSheet: {'),
      source.indexOf('phoneSheetGrabber'),
    );

    expect(phoneSheet).toContain('LiquidGlassTokens.fill');
    expect(phoneSheet).toContain('LiquidGlassTokens.border');
    expect(phoneSheet).not.toContain('rgba(6, 15, 27, 0.92)');
  });

  it('uses a translucent fill so map imagery reads through', () => {
    const tokens = readSource(GLASS_TOKENS_SOURCE);
    const fill = tokens.match(/fill:\s*'rgba\([^)]*?([\d.]+)\)'/)?.[1];
    const fillAlpha = Number(fill);

    expect(fill).toBeDefined();
    expect(fillAlpha).toBeGreaterThan(0);
    expect(fillAlpha).toBeLessThan(0.8);
  });

  it('leaves the frozen card layout and interaction contract alone', () => {
    const source = readSource(SELECTED_PREVIEW_SOURCE);

    // Glass is a fill/border change only — geometry, grab handle, controls and
    // expansion behaviour must be untouched.
    expect(source).toContain('sheetGrabHandle');
    expect(source).toContain('sheetGrabHandleHitArea');
    expect(source).toContain('borderRadius: 18');
    expect(source).toContain("maxWidth: MaxContentWidth");
    expect(source).toContain("alignSelf: 'center'");
  });
});
