import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { LiquidGlassSurface } from '@/components/ui/LiquidGlassSurface';
import { Colors } from '@/constants/theme';
import {
  getFogIntensityLabel,
  type FogIntensity,
} from '@/lib/map/locationsDisplay';
import { getPhonePortraitConditionIconDataUri } from '@/lib/map/phonePortraitConditionIcons';

const RAIL_INTENSITIES: FogIntensity[] = [
  'clear',
  'lightFog',
  'foggy',
  'karlTerritory',
];

const RAIL_ICON_SIZE = 28;

type MapPhonePortraitFogRailProps = {
  activeIntensity: FogIntensity | null;
  onSelectIntensity: (intensity: FogIntensity) => void;
};

/**
 * Phone-portrait web fog intensity rail — matches the approved mobile mockup:
 * strong glass panel, stacked FOG INTENSITY title, and four large selectable
 * condition cards with detailed icons and gold selected treatment.
 */
export function MapPhonePortraitFogRail({
  activeIntensity,
  onSelectIntensity,
}: MapPhonePortraitFogRailProps) {
  return (
    <LiquidGlassSurface
      variant="rail"
      style={styles.panel}
      accessibilityLabel="Fog intensity filter">
      <Text style={styles.title}>Fog{'\n'}Intensity</Text>

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
              onPress={() => onSelectIntensity(intensity)}
              style={({ pressed }) => [
                styles.card,
                isActive && styles.cardActive,
                pressed && styles.pressed,
              ]}>
              <Image
                source={{
                  uri: getPhonePortraitConditionIconDataUri(intensity),
                }}
                style={styles.icon}
                resizeMode="contain"
                accessibilityElementsHidden
                alt=""
              />
              <Text
                style={[styles.label, isActive && styles.labelActive]}
                numberOfLines={2}>
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
    width: 72,
    paddingHorizontal: 5,
    paddingVertical: 8,
    gap: 7,
    borderRadius: 16,
    borderColor: 'rgba(150, 175, 200, 0.18)',
    backgroundColor: 'rgba(5, 13, 24, 0.82)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.32,
    shadowRadius: 12,
    elevation: 6,
  },
  title: {
    fontSize: 9,
    lineHeight: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  cards: {
    gap: 6,
  },
  card: {
    alignItems: 'center',
    gap: 4,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(150, 175, 200, 0.13)',
    backgroundColor: 'rgba(16, 28, 44, 0.45)',
    paddingHorizontal: 3,
    paddingVertical: 7,
    minHeight: 60,
    justifyContent: 'center',
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
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '600',
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.85)',
  },
  labelActive: {
    color: Colors.gold,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.88,
  },
});
