import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { KarlLogo } from '@/components/brand/KarlLogo';
import { LiquidGlassSurface } from '@/components/ui/LiquidGlassSurface';
import { LiquidGlassTokens } from '@/constants/liquidGlass';
import { Colors } from '@/constants/theme';
import { useIsNighttime } from '@/hooks/useIsNighttime';
import { type FogIntensity } from '@whereskarl/domain';
import { getPhonePortraitFogRailConditionIconDataUri } from '@/lib/map/phonePortraitConditionIcons';
import {
  PHONE_PORTRAIT_FOG_RAIL_HEADING,
  PHONE_PORTRAIT_FOG_RAIL_HEADING_FONT_SIZE,
  PHONE_PORTRAIT_FOG_RAIL_LABEL_FONT_SIZE,
  PHONE_PORTRAIT_FOG_RAIL_MAX_FONT_SCALE,
  PHONE_PORTRAIT_FOG_RAIL_PADDING_X,
  PHONE_PORTRAIT_FOG_RAIL_WIDTH,
  phonePortraitFogRailAccessibilityLabel,
  phonePortraitFogRailDisplayLabel,
  phonePortraitFogRailLabelLines,
} from '@/lib/map/phonePortraitFogRail';

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
      accessibilityLabel="Fog level filter">
      {/* One word per line, as web splits with an explicit <br />. The shorter
          approved heading copy fits the 42pt rail content box outright, so the
          size is chosen for readability rather than to escape truncation. */}
      <View style={styles.headerBlock} accessibilityElementsHidden>
        {PHONE_PORTRAIT_FOG_RAIL_HEADING.map((word) => (
          <Text
            key={word}
            style={styles.header}
            maxFontSizeMultiplier={1}
            numberOfLines={1}>
            {word}
          </Text>
        ))}
      </View>

      <View style={styles.cards}>
        {RAIL_INTENSITIES.map((intensity) => {
          const isActive = activeIntensity === intensity;
          const label = phonePortraitFogRailDisplayLabel(intensity);

          return (
            <Pressable
              key={intensity}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={phonePortraitFogRailAccessibilityLabel(
                intensity,
              )}
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
              {/* A single-word label gets exactly one line, so it can never
                  break mid-word. The active state is a heavier face (web
                  `font-bold`), which is wider than the resting one, so bounding
                  Dynamic Type and shrinking-instead-of-wrapping is what keeps
                  the selected and unselected line counts identical. */}
              <Text
                style={[styles.label, isActive && styles.labelActive]}
                accessibilityElementsHidden
                maxFontSizeMultiplier={PHONE_PORTRAIT_FOG_RAIL_MAX_FONT_SCALE}
                numberOfLines={phonePortraitFogRailLabelLines(label)}
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
    width: PHONE_PORTRAIT_FOG_RAIL_WIDTH,
    paddingHorizontal: PHONE_PORTRAIT_FOG_RAIL_PADDING_X,
    paddingVertical: 4,
    gap: 4,
    borderRadius: 12,
    borderColor: LiquidGlassTokens.border,
    backgroundColor: LiquidGlassTokens.fill,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 6,
  },
  headerBlock: {
    // Stretch (not shrink-wrap) so adjustsFontSizeToFit measures against the
    // rail's real 42pt content box instead of the text's intrinsic width.
    alignSelf: 'stretch',
    alignItems: 'stretch',
  },
  header: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: PHONE_PORTRAIT_FOG_RAIL_HEADING_FONT_SIZE,
    fontWeight: '800',
    letterSpacing: 0.14,
    // Kept above fontSize so the line box always has ascender/descender room
    // (see the card's value-row contract).
    lineHeight: 11,
    width: '100%',
    textAlign: 'center',
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
    fontSize: PHONE_PORTRAIT_FOG_RAIL_LABEL_FONT_SIZE,
    fontWeight: '600',
    letterSpacing: -0.1,
    lineHeight: 12,
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
