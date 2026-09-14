import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { MapLocationSearchBar } from '@/components/map/MapLocationSearchBar';
import { Colors, Radius, Spacing } from '@/constants/theme';
import {
  PHONE_PORTRAIT_CHIP_FONT_SIZE,
  PHONE_PORTRAIT_CHIP_GAP,
  PHONE_PORTRAIT_CHIP_LABEL_MAX_FONT_SCALE,
  PHONE_PORTRAIT_CHIP_MIN_HEIGHT,
  PHONE_PORTRAIT_CHIP_MIN_WIDTH,
  PHONE_PORTRAIT_CHIP_PADDING_X,
  PHONE_PORTRAIT_CHIP_ROW_INSET,
  resolvePhonePortraitChipRowJustify,
} from '@/lib/map/phonePortraitRegionChips';
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

  // Measured so the chip row can centre only while it fits, exactly like the
  // web reference's `w-max min-w-full justify-center`. Centring an overflowing
  // row is what made the trailing chip unreachable on a physical iPhone.
  const [chipViewportWidth, setChipViewportWidth] = useState(0);
  const [chipContentWidth, setChipContentWidth] = useState(0);
  const chipRowJustify = resolvePhonePortraitChipRowJustify(
    chipViewportWidth,
    chipContentWidth,
  );

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
        nestedScrollEnabled
        style={styles.chipScroll}
        contentContainerStyle={[
          styles.chipRow,
          { justifyContent: chipRowJustify },
        ]}
        onLayout={(event) =>
          setChipViewportWidth(event.nativeEvent.layout.width)
        }
        onContentSizeChange={(width) => setChipContentWidth(width)}
        accessibilityLabel="Bay Area regions">
        {BAY_AREA_PRODUCT_REGIONS.map((region, index) => {
          const isActive = selectedRegionId === region.id;
          const isLast = index === BAY_AREA_PRODUCT_REGIONS.length - 1;

          return (
            <Pressable
              key={region.id}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              onPress={() => onSelectRegion(region.id)}
              style={({ pressed }) => [
                styles.chip,
                !isLast && styles.chipSpacing,
                isActive && styles.chipActive,
                pressed && styles.pressed,
              ]}>
              <Text
                numberOfLines={1}
                // Bound Dynamic Type growth so the five-chip row keeps
                // deterministic width. The web reference uses a fixed CSS px
                // here, so unbounded scaling is what pushed Peninsula off the
                // viewport on a physical iPhone with enlarged text.
                maxFontSizeMultiplier={
                  PHONE_PORTRAIT_CHIP_LABEL_MAX_FONT_SCALE
                }
                style={[styles.chipLabel, isActive && styles.chipLabelActive]}>
                {region.chipLabel}
              </Text>
            </Pressable>
          );
        })}
        {/* Trailing spacer sized to the row inset. RN under-counts
            contentContainerStyle paddingRight on a horizontal ScrollView, so
            the inset is contributed as real content instead — enough to scroll
            the last chip fully into view without inflating content width. */}
        <View style={styles.chipRowTrailing} accessibilityElementsHidden />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    gap: 6,
    alignItems: 'stretch',
    overflow: 'visible',
  },
  chipScroll: {
    // Bleed past map.tsx phoneTopControls paddingHorizontal so the scroll
    // viewport reaches the screen edge and Peninsula is not masked by the
    // parent inset. Leading/trailing content insets restore readable padding.
    marginHorizontal: -Spacing.sm,
    flexGrow: 0,
    overflow: 'visible',
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    // Centre the row when the five chips fit the viewport (web renders
    // `w-max min-w-full justify-center`); pack leading and scroll when they do
    // not. `justifyContent` is resolved from measured widths by the component.
    flexGrow: 1,
    // Prefer per-chip margin over `gap` — gap + paddingRight under-counts
    // content width on iOS physical devices.
    paddingVertical: 0,
    paddingLeft: PHONE_PORTRAIT_CHIP_ROW_INSET,
  },
  chipRowTrailing: {
    width: PHONE_PORTRAIT_CHIP_ROW_INSET,
  },
  chip: {
    flexShrink: 0,
    minHeight: PHONE_PORTRAIT_CHIP_MIN_HEIGHT,
    minWidth: PHONE_PORTRAIT_CHIP_MIN_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(150, 175, 200, 0.2)',
    backgroundColor: 'rgba(5, 13, 24, 0.78)',
    paddingHorizontal: PHONE_PORTRAIT_CHIP_PADDING_X,
    paddingVertical: 8,
  },
  chipSpacing: {
    marginRight: PHONE_PORTRAIT_CHIP_GAP,
  },
  chipActive: {
    borderColor: 'rgba(242, 163, 38, 0.45)',
    backgroundColor: Colors.gold,
  },
  chipLabel: {
    fontSize: PHONE_PORTRAIT_CHIP_FONT_SIZE,
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
