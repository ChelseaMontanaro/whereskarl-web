import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

function readSource(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), 'utf8');
}

const mapScreen = readSource('src/app/map.tsx');
const nativeMap = readSource('src/components/KarlMap/KarlMap.native.tsx');
const webMap = readSource('src/components/KarlMap/KarlMap.web.tsx');
const preview = readSource('src/components/SelectedLocationPreview.tsx');
const chips = readSource('src/components/map/MapPhonePortraitControls.tsx');

describe('Phase 24 — source-aware camera behaviour', () => {
  it('CAM-5: clean Map entry starts all-Bay and never defaults to SF', () => {
    expect(mapScreen).toContain(
      "useState<BayAreaVisibleProductRegionId | null>(null)",
    );
    expect(mapScreen).not.toContain("isPhonePortraitMap ? 'san-francisco' : null");
    // The native initial camera is the canonical all-Bay frame.
    expect(nativeMap).toContain('PHONE_PORTRAIT_ALL_BAY_CAMERA');
  });

  it('CAM-5: the SF chip resolves through canonical product-region membership', () => {
    expect(mapScreen).not.toContain(
      'filterLocationsForPhonePortraitSfComposition',
    );
  });

  it('CAM-1: phone portrait does not reframe on selectedLocationId changes', () => {
    // Both map implementations must gate the selection-driven animate effect.
    expect(nativeMap).toContain(
      'if (phonePortraitWeb || !selectedLocationId || !mapRef.current)',
    );
    expect(webMap).toContain('phonePortraitWebRef.current');
  });

  it('CAM-1: search selection is the only phone source that moves the camera', () => {
    expect(mapScreen).toContain('mapRef.current?.focusLocation(');
    // Marker taps go through handleSelectLocation, which must not focus.
    const markerHandler = mapScreen.slice(
      mapScreen.indexOf('function handleSelectLocation'),
      mapScreen.indexOf('function handleClearSelection'),
    );
    expect(markerHandler).not.toContain('focusLocation');
    expect(markerHandler).not.toContain('fitToRegion');
    expect(markerHandler).not.toContain('resetView');
  });

  it('CAM-3 stays reverted: card dismissal never moves the camera', () => {
    const dismissHandler = mapScreen.slice(
      mapScreen.indexOf('function handleClearSelection'),
      mapScreen.indexOf('function handleSearchClearSelection'),
    );
    expect(dismissHandler).not.toContain('resetView');
    expect(dismissHandler).not.toContain('focusLocation');
    expect(dismissHandler).not.toContain('fitToRegion');
    // Dismissal is not a search clear: it leaves the query alone.
    expect(dismissHandler).not.toContain('setSearchQuery');
  });

  it('CAM-6: dismiss and search clear are distinct handlers', () => {
    expect(mapScreen).toContain('function handleClearSelection');
    expect(mapScreen).toContain('function handleSearchClearSelection');
    // The card keeps the dismiss handler; search gets the clearing one.
    expect(mapScreen).toContain('onDismiss={handleClearSelection}');
    expect(mapScreen).toContain(
      'onClearSelectedLocation={handleSearchClearSelection}',
    );
  });

  it('CAM-6: search clear returns the camera to the all-Bay view', () => {
    const searchClear = mapScreen.slice(
      mapScreen.indexOf('function handleSearchClearSelection'),
    );
    expect(searchClear.slice(0, 600)).toContain('resetView');
    expect(searchClear.slice(0, 600)).toContain('setSearchQuery');
  });

  it('CAM-2: phone portrait fits canonical per-region presets, not one padding', () => {
    expect(nativeMap).toContain('resolvePhonePortraitCameraPreset(regionId)');
    // A persistent mapPadding would double-count every fit's edgePadding.
    expect(nativeMap).toContain('phonePortraitWeb');
    expect(nativeMap).toContain('{ top: 0, right: 0, bottom: 0, left: 0 }');
  });
});

describe('Phase 24 — region chip clipping', () => {
  it('bounds chip label Dynamic Type growth', () => {
    expect(chips).toContain('maxFontSizeMultiplier');
    expect(chips).toContain('PHONE_PORTRAIT_CHIP_LABEL_MAX_FONT_SCALE');
  });

  it('centres the row when it fits, instead of packing it left', () => {
    expect(chips).toContain("justifyContent: 'center'");
    expect(chips).toContain('flexGrow: 1');
  });

  it('drops the oversized trailing spacer that pushed Peninsula off-screen', () => {
    expect(chips).not.toContain('width: 40');
    expect(chips).toContain('width: PHONE_PORTRAIT_CHIP_ROW_INSET');
  });

  it('keeps all five chips scrollable rather than deleting any', () => {
    expect(chips).toContain('BAY_AREA_PRODUCT_REGIONS.map');
    expect(chips).toContain('horizontal');
  });
});

describe('Phase 24 — selected location card parity', () => {
  it('SL-15: the identity thumbnail matches the reference at 64pt', () => {
    expect(preview).toContain('size={64}');
  });

  it('SL-2: score hero is 38pt with a tinted semibold supporting row', () => {
    expect(preview).toContain('fontSize: 38');
    expect(preview).toContain('coreSupportingHero');
    expect(preview).toContain('supportingColor={score.color}');
  });

  it('SL-2: secondary values are length-responsive, not one fixed size', () => {
    expect(preview).toContain('coreSecondaryValueStyle');
    expect(preview).toContain('fontSize: 23');
    expect(preview).toContain('fontSize: 19');
    expect(preview).toContain('fontSize: 28');
  });

  it('SL-6: environmental metrics use a 3-column grid with inset dividers', () => {
    expect(preview).toContain('envDividerVertical');
    expect(preview).toContain('envDividerHorizontal');
    expect(preview).toContain("left: '33.3333%'");
    expect(preview).toContain("left: '66.6666%'");
    expect(preview).toContain("top: '50%'");
    expect(preview).toContain('minHeight: 102');
    expect(preview).not.toContain('minHeight: 72');
  });

  it('SL-6: every environmental tile carries its canonical icon', () => {
    for (const kind of [
      "'aqi'",
      "'uv'",
      "'pollen'",
      "'humidity'",
      "'visibility'",
    ]) {
      expect(preview).toContain(kind);
    }
    expect(preview).toContain('getClimateMetricIconUri');
    expect(preview).toContain('CLIMATE_ICON_COLOR');
  });

  it('SL-7: Marine Layer / Fog Ceiling are horizontal icon cards', () => {
    expect(preview).toContain('minHeight: 82');
    expect(preview).toContain('maxHeight: 86');
    expect(preview).toContain("iconKind=\"marineLayer\"");
    expect(preview).toContain("iconKind=\"fogCeiling\"");
    expect(preview).toContain('comingSoonCopy');
  });

  it('SL-9: section labels are gold, with a white Hourly Outlook variant', () => {
    expect(preview).toContain("color: 'rgba(242, 163, 38, 0.9)'");
    expect(preview).toContain('sectionLabelWhite');
    expect(preview).toContain('styles.sectionLabelWhite');
  });

  it('exposes Karl’s Read with the canonical Karl logo', () => {
    expect(preview).toContain('KarlLogo');
    expect(preview).toContain('size={56}');
    expect(preview).toContain('karlReadRow');
  });

  it('exposes an Hourly Outlook strip with condition artwork', () => {
    expect(preview).toContain('getPhonePortraitFogRailConditionIconDataUri');
    expect(preview).toContain('period.intensity');
    expect(preview).toContain('period.tempF');
  });

  it('expanded body height comes from the viewport, not a fixed cap', () => {
    expect(preview).toContain('resolvePhoneSheetExpandedMaxHeight');
    expect(preview).toContain('useWindowDimensions');
    expect(preview).toContain('useSafeAreaInsets');
    expect(preview).toContain('maxHeight: expandedMaxHeight');
    // The hardcoded cap that stranded Karl's Read / Hourly Outlook is gone.
    expect(preview).not.toContain('maxHeight: 320');
  });

  it('resets the expanded body to the top when opening', () => {
    expect(preview).toContain('expandedScrollRef');
    expect(preview).toContain('scrollTo({ y: 0');
  });

  it('claims touches so dismiss and expanded scrolling stay reliable', () => {
    expect(preview).toContain("pointerEvents: 'auto'");
    expect(preview).toContain('testID="selected-location-dismiss"');
  });
});
