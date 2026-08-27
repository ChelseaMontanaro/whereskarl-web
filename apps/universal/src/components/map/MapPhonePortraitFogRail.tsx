import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { LiquidGlassSurface } from '@/components/ui/LiquidGlassSurface';
import { Colors } from '@/constants/theme';
import { useIsNighttime } from '@/hooks/useIsNighttime';
import {
  getFogIntensityLabel,
  type FogIntensity,
} from '@whereskarl/domain';
import { getPhonePortraitFogRailConditionIconDataUri } from '@/lib/map/phonePortraitConditionIcons';

const RAIL_INTENSITIES: FogIntensity[] = [
  'clear',
  'lightFog',
  'foggy',
  'karlTerritory',
];

const RAIL_ICON_SIZE = 24;

type MapPhonePortraitFogRailProps = {
  activeIntensity: FogIntensity | null;
  onSelectIntensity: (intensity: FogIntensity) => void;
};

/**
 * Compact icon-led fog-intensity rail (mobile Web parity).
 * Uses expo-image so SVG data-URI artwork renders on native.
 * Full state names stay on accessibilityLabel.
 */
export function MapPhonePortraitFogRail({
  activeIntensity,
  onSelectIntensity,
}: MapPhonePortraitFogRailProps) {
  const isNighttime = useIsNighttime();

  return (
    <LiquidGlassSurface
      variant="rail"
      style={styles.panel}
      accessibilityLabel="Fog intensity filter">
      <View style={styles.cards}>
        {RAIL_INTENSITIES.map((intensity) => {
          const isActive = activeIntensity === intensity;
          const label = getFogIntensityLabel(intensity);

          return (
            <Pressable
              key={intensity}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={label}
              hitSlop={4}
              onPress={() => onSelectIntensity(intensity)}
              style={({ pressed }) => [
                styles.card,
                isActive && styles.cardActive,
                pressed && styles.pressed,
              ]}>
              <Image
                source={{
                  uri: getPhonePortraitFogRailConditionIconDataUri(intensity, {
                    isNighttime,
                  }),
                }}
                style={styles.icon}
                contentFit="contain"
                accessibilityElementsHidden
                pointerEvents="none"
              />
            </Pressable>
          );
        })}
      </View>
    </LiquidGlassSurface>
  );
}

const styles = StyleSheet.create({
  panel: {
    width: 48,
    paddingHorizontal: 2,
    paddingVertical: 3,
    gap: 2,
    borderRadius: 12,
    borderColor: 'rgba(150, 175, 200, 0.18)',
    backgroundColor: 'rgba(5, 13, 24, 0.82)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 6,
  },
  cards: {
    gap: 2,
  },
  card: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(150, 175, 200, 0.13)',
    backgroundColor: 'rgba(16, 28, 44, 0.45)',
    minHeight: 44,
    minWidth: 44,
  },
  cardActive: {
    borderColor: Colors.gold,
    backgroundColor: 'rgba(20, 30, 44, 0.9)',
  },
  icon: {
    width: RAIL_ICON_SIZE,
    height: RAIL_ICON_SIZE,
  },
  pressed: {
    opacity: 0.88,
  },
});
