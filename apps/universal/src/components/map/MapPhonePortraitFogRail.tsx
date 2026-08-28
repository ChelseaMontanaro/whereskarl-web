import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { KarlLogo } from '@/components/brand/KarlLogo';
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
 * Compact fog-intensity rail with icon-led cells and subordinate text labels
 * (mobile-web MapPhonePortraitFogRail parity).
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
      <Text style={styles.header} accessibilityElementsHidden>
        Fog{'\n'}Intensity
      </Text>

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
              {intensity === 'karlTerritory' ? (
                <KarlLogo size={RAIL_ICON_SIZE} />
              ) : (
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
              )}
              <Text
                style={[styles.label, isActive && styles.labelActive]}
                accessibilityElementsHidden
                numberOfLines={2}
                adjustsFontSizeToFit
                minimumFontScale={0.85}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </LiquidGlassSurface>
  );
}

const styles = StyleSheet.create({
  panel: {
    width: 50,
    paddingHorizontal: 3,
    paddingVertical: 4,
    gap: 4,
    borderRadius: 12,
    borderColor: 'rgba(150, 175, 200, 0.18)',
    backgroundColor: 'rgba(5, 13, 24, 0.82)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 6,
  },
  header: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 7,
    fontWeight: '800',
    // Keep INTENSITY on one line inside the 50px rail without widening it.
    letterSpacing: 0,
    lineHeight: 9,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  cards: {
    gap: 4,
  },
  card: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(150, 175, 200, 0.13)',
    backgroundColor: 'rgba(16, 28, 44, 0.45)',
    gap: 2,
    minHeight: 48,
    paddingHorizontal: 2,
    paddingVertical: 4,
  },
  cardActive: {
    borderColor: Colors.gold,
    backgroundColor: 'rgba(20, 30, 44, 0.9)',
  },
  icon: {
    width: RAIL_ICON_SIZE,
    height: RAIL_ICON_SIZE,
  },
  label: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 8,
    fontWeight: '600',
    letterSpacing: -0.1,
    lineHeight: 9,
    textAlign: 'center',
  },
  labelActive: {
    color: Colors.gold,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.88,
  },
});
