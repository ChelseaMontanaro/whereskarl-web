import { useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { LiquidGlassSurface } from '@/components/ui/LiquidGlassSurface';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { LiquidGlassTokens } from '@/constants/liquidGlass';
import { filterCanonicalLocationsBySearch } from '@whereskarl/search';
import type { LocationWeather } from '@whereskarl/schemas';

/** Gap between the search pill and its results dropdown. */
const OVERLAY_GAP = 6;

type MapLocationSearchBarProps = {
  locations: readonly LocationWeather[];
  onSelectLocation: (locationId: string) => void;
  onClearSelectedLocation: () => void;
  isDisabled?: boolean;
};

/**
 * Immersive phone map search pill — floats over the map like mobile Web.
 * Canonical catalog matching only (name + aliases); no local search algorithm.
 */
export function MapLocationSearchBar({
  locations,
  onSelectLocation,
  onClearSelectedLocation,
  isDisabled = false,
}: MapLocationSearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  /**
   * Set once the current query text has been resolved into a selection (or
   * cleared). The results panel stays closed while this holds, regardless of
   * focus.
   *
   * Focus alone cannot be the source of truth for results visibility on native.
   * `onFocus` opens the overlay, and iOS re-delivers a focus event to the field
   * as first-responder status settles after `blur()` inside the result tap. That
   * arrives after the close, flipping `isOverlayOpen` back to true — and because
   * selecting a result leaves its name in the field, the query still matches, so
   * the dropdown re-rendered showing the location the user had just chosen. That
   * is the reported defect: the panel never disappeared.
   *
   * Editing the query is the only thing that clears this, which is also the only
   * moment results should reopen, so subsequent searches behave normally.
   */
  const [isQueryResolved, setIsQueryResolved] = useState(false);
  const [pillHeight, setPillHeight] = useState(0);
  const inputRef = useRef<TextInput>(null);

  const results = useMemo(() => {
    if (query.trim().length === 0) {
      return [];
    }

    return filterCanonicalLocationsBySearch(locations, query);
  }, [locations, query]);

  /**
   * Resolving the search state is the one place the keyboard must go away: both
   * exits from the results overlay (picking a result, clearing the field) end
   * the user's typing session. Blurring the field is what actually relinquishes
   * first-responder status — `Keyboard.dismiss()` alone can leave the input
   * focused, so a subsequent re-focus would raise the keyboard again.
   */
  function endSearchEditing() {
    setIsOverlayOpen(false);
    setIsQueryResolved(true);
    inputRef.current?.blur();
    Keyboard.dismiss();
  }

  function handleSelectResult(location: LocationWeather) {
    setQuery(location.name);
    endSearchEditing();
    onSelectLocation(location.id);
  }

  function handleClear() {
    setQuery('');
    endSearchEditing();
    onClearSelectedLocation();
  }

  const hasQuery = query.length > 0;
  const showOverlay =
    isOverlayOpen && !isQueryResolved && query.trim().length > 0;

  return (
    <View style={styles.root} accessibilityLabel="Search locations">
      <View
        style={styles.pill}
        onLayout={(event) => setPillHeight(event.nativeEvent.layout.height)}>
        <Text style={styles.magnifier} accessibilityElementsHidden>
          ⌕
        </Text>
        <TextInput
          ref={inputRef}
          value={query}
          onChangeText={(value) => {
            setQuery(value);
            // A genuine edit starts a new search, so results become live again.
            setIsQueryResolved(false);
            setIsOverlayOpen(true);
          }}
          onFocus={() => setIsOverlayOpen(true)}
          placeholder="Search locations…"
          placeholderTextColor="rgba(255, 255, 255, 0.42)"
          editable={!isDisabled}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          accessibilityLabel="Search locations"
          style={[styles.input, isDisabled && styles.inputDisabled]}
        />
        {hasQuery ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            onPress={handleClear}
            hitSlop={8}
            style={({ pressed }) => [
              styles.clearButton,
              pressed && styles.pressed,
            ]}>
            <Text style={styles.clearLabel}>×</Text>
          </Pressable>
        ) : null}
      </View>

      {showOverlay ? (
        /* Dropdown anchored to the field, out of normal flow. While this sat in
           flow it consumed vertical space in the top-chrome column and pushed
           the region-chip row down the screen every time results appeared. */
        <LiquidGlassSurface
          variant="panel"
          style={[styles.overlay, { top: pillHeight + OVERLAY_GAP }]}>
          {results.length === 0 ? (
            <Text style={styles.emptyLabel}>
              No locations match “{query.trim()}”
            </Text>
          ) : (
            <FlatList
              data={results}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              style={styles.resultsList}
              renderItem={({ item }) => (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${item.name}`}
                  onPress={() => handleSelectResult(item)}
                  style={({ pressed }) => [
                    styles.resultRow,
                    pressed && styles.pressed,
                  ]}>
                  <Text style={styles.resultName} numberOfLines={1}>
                    {item.name}
                  </Text>
                </Pressable>
              )}
            />
          )}
        </LiquidGlassSurface>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    zIndex: 6,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 38,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(150, 175, 200, 0.22)',
    backgroundColor: 'rgba(5, 13, 24, 0.78)',
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  magnifier: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: -1,
  },
  input: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 1,
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  inputDisabled: {
    opacity: 0.6,
  },
  clearButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
  },
  clearLabel: {
    fontSize: 20,
    lineHeight: 22,
    color: 'rgba(255, 255, 255, 0.55)',
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    // Above the chip row, which is the next sibling in the top-chrome column.
    zIndex: 2,
    maxHeight: 200,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: LiquidGlassTokens.border,
    backgroundColor: LiquidGlassTokens.fill,
    paddingVertical: 4,
    overflow: 'hidden',
  },
  resultsList: {
    maxHeight: 192,
  },
  resultRow: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 11,
  },
  resultName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  emptyLabel: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  pressed: {
    opacity: 0.88,
  },
});
