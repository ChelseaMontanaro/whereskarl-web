import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';
import { LiquidGlassTokens } from '@/constants/liquidGlass';
import { filterCanonicalLocationsBySearch } from '@whereskarl/search';
import type { LocationWeather } from '@whereskarl/schemas';

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

  const results = useMemo(() => {
    if (query.trim().length === 0) {
      return [];
    }

    return filterCanonicalLocationsBySearch(locations, query);
  }, [locations, query]);

  function handleSelectResult(location: LocationWeather) {
    setQuery(location.name);
    setIsOverlayOpen(false);
    onSelectLocation(location.id);
  }

  function handleClear() {
    setQuery('');
    setIsOverlayOpen(false);
    onClearSelectedLocation();
  }

  const hasQuery = query.length > 0;
  const showOverlay = isOverlayOpen && query.trim().length > 0;

  return (
    <View style={styles.root} accessibilityLabel="Search locations">
      <View style={styles.pill}>
        <Text style={styles.magnifier} accessibilityElementsHidden>
          ⌕
        </Text>
        <TextInput
          value={query}
          onChangeText={(value) => {
            setQuery(value);
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
        <View style={styles.overlay}>
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
        </View>
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
    marginTop: 6,
    maxHeight: 200,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: LiquidGlassTokens.border,
    backgroundColor: 'rgba(6, 15, 27, 0.94)',
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
