import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { MapLocationSearchBar } from '@/components/map/MapLocationSearchBar';
import { Colors, Radius } from '@/constants/theme';
import {
  BAY_AREA_PRODUCT_REGIONS,
  type BayAreaVisibleProductRegionId,
} from '@/lib/map/regions';
import type { LocationWeather } from '@whereskarl/schemas';

type MapPhonePortraitControlsProps = {
  selectedRegionId: BayAreaVisibleProductRegionId | null;
  onSelectRegion: (regionId: BayAreaVisibleProductRegionId) => void;
  /** Canonical catalog for in-map search (name + aliases). */
  locations?: readonly LocationWeather[];
  onSelectLocation?: (locationId: string) => void;
  onClearSelectedLocation?: () => void;
  isSearchDisabled?: boolean;
};

/**
 * Immersive phone map top chrome (mobile Web hierarchy):
 * floating search pill → compact horizontal region chips.
 * No page title, no “Around the Bay” section labels.
 */
export function MapPhonePortraitControls({
  selectedRegionId,
  onSelectRegion,
  locations = [],
  onSelectLocation,
  onClearSelectedLocation,
  isSearchDisabled = false,
}: MapPhonePortraitControlsProps) {
  const showSearch =
    typeof onSelectLocation === 'function' &&
    typeof onClearSelectedLocation === 'function';

  return (
    <View style={styles.root} accessibilityLabel="Map search and regions">
      {showSearch ? (
        <MapLocationSearchBar
          locations={locations}
          onSelectLocation={onSelectLocation}
          onClearSelectedLocation={onClearSelectedLocation}
          isDisabled={isSearchDisabled}
        />
      ) : null}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.chipRow}
        accessibilityLabel="Bay Area regions">
        {BAY_AREA_PRODUCT_REGIONS.map((region) => {
          const isActive = selectedRegionId === region.id;

          return (
            <Pressable
              key={region.id}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              onPress={() => onSelectRegion(region.id)}
              style={({ pressed }) => [
                styles.chip,
                isActive && styles.chipActive,
                pressed && styles.pressed,
              ]}>
              <Text
                numberOfLines={1}
                style={[styles.chipLabel, isActive && styles.chipLabelActive]}>
                {region.chipLabel}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    gap: 6,
    alignItems: 'stretch',
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 0,
  },
  chip: {
    minHeight: 40,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(150, 175, 200, 0.2)',
    backgroundColor: 'rgba(5, 13, 24, 0.78)',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipActive: {
    borderColor: 'rgba(242, 163, 38, 0.45)',
    backgroundColor: Colors.gold,
  },
  chipLabel: {
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.78)',
    textAlign: 'center',
  },
  chipLabelActive: {
    color: Colors.navy,
  },
  pressed: {
    opacity: 0.88,
  },
});
