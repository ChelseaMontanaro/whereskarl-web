import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  PHONE_PORTRAIT_MARKER_ICON_PX,
  PHONE_PORTRAIT_MARKER_META_WIDTH,
  resolvePhonePortraitVisibleMetaIds,
} from '@/lib/map/phonePortraitMapPresentation';

function readSource(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), 'utf8');
}

const MAP_NATIVE_SOURCE = 'src/components/KarlMap/KarlMap.native.tsx';
const MARKER_VIEW_SOURCE = 'src/components/KarlMap/KarlMapMarkerView.tsx';
const SELECTED_PREVIEW_SOURCE = 'src/components/SelectedLocationPreview.tsx';

/**
 * North Bay catalog slice used to exercise the declutter pass. Coordinates are
 * the canonical values from the shared location catalog.
 */
const NORTH_BAY = [
  { id: 'santa-rosa', latitude: 38.4404, longitude: -122.7141, sunshineScore: 80 },
  { id: 'napa', latitude: 38.2975, longitude: -122.2869, sunshineScore: 80 },
  { id: 'petaluma', latitude: 38.2324, longitude: -122.6367, sunshineScore: 68 },
  { id: 'novato', latitude: 38.1074, longitude: -122.5697, sunshineScore: 76 },
  { id: 'fairfax', latitude: 37.9871, longitude: -122.5889, sunshineScore: 72 },
  { id: 'san-rafael', latitude: 37.9735, longitude: -122.5311, sunshineScore: 72 },
  {
    id: 'mount-tamalpais',
    latitude: 37.9235,
    longitude: -122.5965,
    sunshineScore: 30,
  },
  { id: 'mill-valley', latitude: 37.906, longitude: -122.5449, sunshineScore: 45 },
  {
    id: 'stinson-beach',
    latitude: 37.9005,
    longitude: -122.6444,
    sunshineScore: 28,
  },
  { id: 'tiburon', latitude: 37.8735, longitude: -122.4566, sunshineScore: 50 },
  { id: 'muir-beach', latitude: 37.8597, longitude: -122.5769, sunshineScore: 25 },
].map((entry) => ({ ...entry, region: 'north-bay' }));

describe('native marker identity', () => {
  it('presses select the marker’s own location id, never a positional index', () => {
    const source = readSource(MAP_NATIVE_SOURCE);

    expect(source).toContain('onPress={() => onSelect(location.id)}');
    expect(source).toContain('identifier={location.id}');
    expect(source).toContain('key={location.id}');
    // A press handler must never resolve its target through list position.
    expect(source).not.toMatch(/onSelect\((?:locations|markerLocations)\[/);
    expect(source).not.toMatch(/onPress=\{\(\) => onSelect\(index\)/);
  });

  it('anchors every marker on its own canonical coordinate', () => {
    const source = readSource(MAP_NATIVE_SOURCE);

    expect(source).toContain('latitude: location.latitude');
    expect(source).toContain('longitude: location.longitude');
  });
});

describe('native marker press geometry', () => {
  it('pins the phone-portrait annotation with centerOffset, not anchor alone', () => {
    const source = readSource(MAP_NATIVE_SOURCE);

    // `anchor` is Google-Maps-only on iOS (react-native-maps MapMarker docs),
    // so Apple Maps needs an explicit centerOffset to stay coordinate-pinned.
    expect(source).toContain('centerOffset={isIconPinned ? { x: 0, y: 0 }');
    expect(source).toContain('{ x: 0.5, y: 0.5 }');
  });

  it('keeps the press target independent of label visibility', () => {
    const source = readSource(MAP_NATIVE_SOURCE);

    // The pinned geometry must be selected by layout + meta capability, never
    // by whether this particular marker currently renders its label.
    expect(source).toContain(
      "const isIconPinned = layout === 'mobile' && showMarkerMeta !== undefined;",
    );

    const anchorExpression = source.slice(
      source.indexOf('anchor={'),
      source.indexOf('centerOffset={'),
    );
    expect(anchorExpression).toContain('isIconPinned');
    // A pinned marker resolves one fixed anchor; only the legacy desktop path
    // may still branch on hasMeta.
    expect(anchorExpression.indexOf('isIconPinned')).toBeLessThan(
      anchorExpression.indexOf('hasMeta'),
    );
  });

  it('renders the icon as the only in-flow marker content on phone portrait', () => {
    const source = readSource(MARKER_VIEW_SOURCE);

    // Root claims exactly the icon box, so the native annotation frame (and
    // therefore its hit target) cannot grow with the label or score.
    expect(source).toContain('usePhonePortraitMeta && {');
    expect(source).toContain('width: iconSize');
    expect(source).toContain('height: iconSize');
  });

  it('takes the label and score group out of flow so icons cannot shift', () => {
    const source = readSource(MARKER_VIEW_SOURCE);

    expect(source).toContain('metaBlockPinned');
    expect(source).toMatch(/metaBlockPinned:\s*\{\s*position:\s*'absolute'/);
    expect(source).toContain('PHONE_PORTRAIT_MARKER_META_WIDTH');
    // The out-of-flow group must never intercept a press.
    expect(source).toContain('pointerEvents="none"');
  });

  it('centres the out-of-flow meta group under the pinned icon', () => {
    expect(PHONE_PORTRAIT_MARKER_ICON_PX).toBe(28);
    expect(PHONE_PORTRAIT_MARKER_META_WIDTH).toBe(136);

    const left =
      (PHONE_PORTRAIT_MARKER_ICON_PX - PHONE_PORTRAIT_MARKER_META_WIDTH) / 2;
    // Group is symmetric about the icon centre, so the icon stays coordinate
    // pinned regardless of how wide the label renders.
    expect(left).toBe(-54);
    expect(left + PHONE_PORTRAIT_MARKER_META_WIDTH).toBe(
      PHONE_PORTRAIT_MARKER_ICON_PX - left,
    );
  });
});

describe('native marker stability across selection', () => {
  it('never changes a marker’s coordinate or identity when selection changes', () => {
    const before = NORTH_BAY.map((entry) => ({ ...entry }));

    for (const selectedId of [
      null,
      'mount-tamalpais',
      'muir-beach',
      'santa-rosa',
    ]) {
      resolvePhonePortraitVisibleMetaIds(NORTH_BAY, selectedId);
    }

    expect(NORTH_BAY).toEqual(before);
  });

  it('always labels the selected location and only known locations', () => {
    const ids = new Set(NORTH_BAY.map((entry) => entry.id));

    for (const selectedId of ['santa-rosa', 'mount-tamalpais', 'muir-beach']) {
      const visible = resolvePhonePortraitVisibleMetaIds(NORTH_BAY, selectedId);

      expect(visible.has(selectedId)).toBe(true);
      for (const id of visible) {
        expect(ids.has(id)).toBe(true);
      }
    }
  });

  it('keeps every marker pressable regardless of label visibility', () => {
    // Declutter only decides label/score visibility. It must never remove a
    // marker, because an unlabelled marker is still an interactive location.
    const visible = resolvePhonePortraitVisibleMetaIds(NORTH_BAY, null);
    const unlabelled = NORTH_BAY.filter((entry) => !visible.has(entry.id));

    expect(unlabelled.length).toBeGreaterThan(0);

    const source = readSource(MAP_NATIVE_SOURCE);
    // Markers are rendered from the full location list; meta ids only feed the
    // `showMarkerMeta` flag, never a render filter.
    expect(source).toContain('showMarkerMeta={showMarkerMeta}');
    expect(source).not.toMatch(/locations\.filter\([^)]*MetaIds/);
  });
});

describe('selected-location card expansion affordance parity', () => {
  it('uses the approved web grab handle rather than a labelled gold row', () => {
    const source = readSource(SELECTED_PREVIEW_SOURCE);

    // Mobile web has no textual expansion affordance at all; expansion is the
    // BottomSheet grab handle (apps/web/components/ui/BottomSheet.tsx).
    expect(source).not.toContain('More conditions');
    expect(source).not.toContain('Show less');
    expect(source).not.toContain('expandToggleLabel');
    expect(source).not.toContain('expandChevron');
  });

  it('matches the web handle geometry, tint and accessible labels', () => {
    const source = readSource(SELECTED_PREVIEW_SOURCE);

    expect(source).toContain('sheetGrabHandle');
    // Web handle button is padded in-flow (pt-2.5 / pb-1.5), not hitSlop-only.
    expect(source).toContain('paddingTop: 10');
    expect(source).toContain('paddingBottom: 6');
    // Web: `h-1 w-9 rounded-full bg-white/30`.
    expect(source).toMatch(
      /sheetGrabHandle:\s*\{\s*width:\s*36,\s*height:\s*4,\s*borderRadius:\s*999,\s*backgroundColor:\s*'rgba\(255, 255, 255, 0\.3\)'/,
    );
    // Web: `aria-label={expanded ? "Collapse details" : "Expand details"}`.
    expect(source).toContain("isExpanded ? 'Collapse details' : 'Expand details'");
  });
});
