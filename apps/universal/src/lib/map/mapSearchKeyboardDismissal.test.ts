import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  consumeSearchFocus,
  dismissMapSearchFromMapTap,
} from '@/lib/map/mapSearchKeyboardDismissal';

function readSource(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), 'utf8');
}

describe('map search keyboard dismissal', () => {
  it.each(['', 'Liv', 'Livermore'])(
    'keeps the query %j and does not submit or clear it',
    (query) => {
      expect(dismissMapSearchFromMapTap(query)).toEqual({
        query,
        isOverlayOpen: false,
        submitted: false,
        cleared: false,
        selectionChanged: false,
      });
    },
  );

  it('ignores one focus after a map tap and lets a later field press clear the latch', () => {
    expect(
      consumeSearchFocus({
        ignorePendingDismissFocus: true,
        fromFieldPress: false,
      }),
    ).toEqual({
      openOverlay: false,
      ignorePendingDismissFocus: false,
    });

    expect(
      consumeSearchFocus({
        ignorePendingDismissFocus: true,
        fromFieldPress: true,
      }),
    ).toEqual({
      openOverlay: false,
      ignorePendingDismissFocus: false,
    });

    expect(
      consumeSearchFocus({
        ignorePendingDismissFocus: false,
        fromFieldPress: false,
      }),
    ).toEqual({
      openOverlay: true,
      ignorePendingDismissFocus: false,
    });
  });
});

describe('map search keyboard source contract', () => {
  const search = readSource('src/components/map/MapLocationSearchBar.tsx');
  const map = readSource('src/components/KarlMap/KarlMap.native.tsx');
  const screen = readSource('src/app/map.tsx');
  const card = readSource('src/components/SelectedLocationPreview.tsx');
  const nav = readSource('src/components/layout/NavLinks.tsx');

  it('dismisses from a map tap without submitting or clearing the query', () => {
    const handler = search.slice(
      search.indexOf('function dismissKeyboardFromMap'),
      search.indexOf('const hasQuery'),
    );

    expect(handler).toContain('dismissMapSearchFromMapTap(query)');
    expect(handler).toContain('inputRef.current?.blur()');
    expect(handler).toContain('Keyboard.dismiss()');
    expect(handler).toContain('setIsOverlayOpen(dismissal.isOverlayOpen)');
    expect(handler).toContain('ignoreMapDismissFocusRef.current = true');
    expect(handler).not.toContain('setIsQueryResolved');
    expect(handler).not.toContain('setQuery');
    expect(handler).not.toContain('onSelectLocation');
    expect(handler).not.toContain('onClearSelectedLocation');
    expect(search).toContain('returnKeyType="search"');
    expect(search).not.toContain('onSubmitEditing');
  });

  it('dismisses on an empty-map tap and still selects a marker by its own id', () => {
    const mapPress = map.slice(map.indexOf('<MapView'), map.indexOf('onLayout='));
    const markerPress = map.slice(
      map.indexOf('<Marker'),
      map.indexOf('accessibilityLabel={getMarkerAccessibilityLabel'),
    );

    expect(mapPress).toContain('onPress={() => {');
    expect(mapPress).toContain('onMapPress?.()');
    expect(mapPress).not.toContain('onSelect');
    expect(markerPress).toContain('onMapPress?.()');
    expect(markerPress).toContain('onSelect(location.id)');
    expect(map).not.toMatch(/onSelect\(index\)/);
    expect(map).not.toContain('onPanDrag');
  });

  it('wires the phone map to the search dismissal and leaves the card and nav alone', () => {
    expect(screen).toContain('onMapPress={dismissMapSearchKeyboard}');
    expect(screen).toContain('dismissKeyboardFromMap()');
    expect(card).not.toContain('Keyboard.dismiss');
    expect(nav).not.toContain('Keyboard');
  });
});