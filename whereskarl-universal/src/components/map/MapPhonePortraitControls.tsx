import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Fonts, Radius } from '@/constants/theme';
import { LiquidGlassTokens } from '@/constants/liquidGlass';
import {
  BAY_AREA_PRODUCT_REGIONS,
  type BayAreaVisibleProductRegionId,
} from '@/lib/map/regions';

type MapPhonePortraitControlsProps = {
  selectedRegionId: BayAreaVisibleProductRegionId | null;
  onSelectRegion: (regionId: BayAreaVisibleProductRegionId) => void;
  isPhonePortrait?: boolean;
};

export function MapPhonePortraitControls({
  selectedRegionId,
  onSelectRegion,
  isPhonePortrait = false,
}: MapPhonePortraitControlsProps) {
  return (
    <View style={styles.root} accessibilityLabel="Bay Area regions">
      <Text
        style={[
          styles.title,
          isPhonePortrait && styles.titlePhonePortrait,
        ]}>
        Karl Around the Bay
      </Text>
      <View style={[styles.chipRow, isPhonePortrait && styles.chipRowPhonePortrait]}>
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
                isPhonePortrait && styles.chipPhonePortrait,
                isActive && styles.chipActive,
                isActive && isPhonePortrait && styles.chipActivePhonePortrait,
                pressed && styles.pressed,
              ]}>
              <Text
                numberOfLines={1}
                style={[
                  styles.chipLabel,
                  isPhonePortrait && styles.chipLabelPhonePortrait,
                  isActive && styles.chipLabelActive,
                ]}>
                {region.chipLabel}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    gap: 6,
    alignItems: 'center',
  },
  title: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: 'rgba(242, 163, 38, 0.92)',
    textAlign: 'center',
  },
  titlePhonePortrait: {
    fontFamily: Fonts.serif,
    fontSize: 19,
    lineHeight: 24,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'none',
    color: Colors.gold,
    marginBottom: 4,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    width: '100%',
  },
  chipRowPhonePortrait: {
    gap: 6,
  },
  chip: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: LiquidGlassTokens.border,
    backgroundColor: LiquidGlassTokens.fillStrong,
    paddingHorizontal: 5,
    paddingVertical: 6,
  },
  chipPhonePortrait: {
    paddingHorizontal: 8,
    paddingVertical: 9,
    backgroundColor: 'rgba(5, 13, 24, 0.78)',
    borderColor: 'rgba(150, 175, 200, 0.2)',
  },
  chipActive: {
    borderColor: 'rgba(242, 163, 38, 0.3)',
    backgroundColor: Colors.gold,
  },
  chipActivePhonePortrait: {
    borderColor: 'rgba(242, 163, 38, 0.45)',
  },
  chipLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.78)',
    textAlign: 'center',
  },
  chipLabelPhonePortrait: {
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
  },
  chipLabelActive: {
    color: Colors.navy,
  },
  pressed: {
    opacity: 0.88,
  },
});
