import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ConditionIcon } from '@/components/conditions/ConditionIcon';
import { LiquidGlassSurface } from '@/components/ui/LiquidGlassSurface';
import { mapGlassPanel } from '@/components/map/mapGlassPanel';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { LiquidGlassTokens } from '@/constants/liquidGlass';
import { useIsNighttime } from '@/hooks/useIsNighttime';
import {
  getFogIntensityLabel,
  type FogIntensity,
} from '@/lib/map/locationsDisplay';

const LEGEND_ITEMS: Array<{
  intensity: FogIntensity;
  swatchColor: string;
}> = [
  { intensity: 'clear', swatchColor: Colors.gold },
  { intensity: 'lightFog', swatchColor: '#9A9590' },
  { intensity: 'foggy', swatchColor: '#F0F4F8' },
  { intensity: 'karlTerritory', swatchColor: '#B8D4EA' },
];

type MapFogLegendProps = {
  layout?: 'desktop-stack' | 'phone-rail' | 'phone-compact';
  activeIntensity?: FogIntensity | null;
  onSelectIntensity?: (intensity: FogIntensity) => void;
  isPhonePortrait?: boolean;
};

function LegendSwatch({ color }: { color: string }) {
  return (
    <View
      style={[styles.swatch, { backgroundColor: color }]}
      accessibilityElementsHidden
    />
  );
}

export function MapFogLegend({
  layout = 'desktop-stack',
  activeIntensity = null,
  onSelectIntensity,
  isPhonePortrait = false,
}: MapFogLegendProps) {
  const isInteractive = Boolean(onSelectIntensity);
  const isPhoneRail = layout === 'phone-rail';
  const isNighttime = useIsNighttime();

  if (isPhoneRail) {
    const railIconSize = isPhonePortrait ? 22 : 16;

    return (
      <LiquidGlassSurface
        variant="rail"
        style={[
          styles.panelRail,
          isPhonePortrait && styles.panelRailPhonePortrait,
        ]}
        accessibilityLabel="Fog intensity legend">
        <Text
          style={[
            styles.eyebrowRail,
            isPhonePortrait && styles.eyebrowRailPhonePortrait,
          ]}>
          Fog Intensity
        </Text>
        <View style={[styles.listRail, isPhonePortrait && styles.listRailPhonePortrait]}>
          {LEGEND_ITEMS.map((item) => {
            const isActive = activeIntensity === item.intensity;
            const label = getFogIntensityLabel(item.intensity);

            if (isInteractive) {
              return (
                <Pressable
                  key={item.intensity}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                  accessibilityLabel={label}
                  onPress={() => onSelectIntensity?.(item.intensity)}
                  style={({ pressed }) => [
                    styles.itemRail,
                    isPhonePortrait && styles.itemRailPhonePortrait,
                    isActive && styles.itemActive,
                    pressed && styles.pressed,
                  ]}>
                  <ConditionIcon
                    intensity={item.intensity}
                    isNighttime={isNighttime}
                    size={railIconSize}
                  />
                  <Text
                    style={[
                      styles.labelRail,
                      isPhonePortrait && styles.labelRailPhonePortrait,
                      isActive && styles.labelActive,
                    ]}>
                    {label}
                  </Text>
                </Pressable>
              );
            }

            return (
              <View
                key={item.intensity}
                style={[
                  styles.itemRail,
                  isPhonePortrait && styles.itemRailPhonePortrait,
                ]}>
                <ConditionIcon
                  intensity={item.intensity}
                  isNighttime={isNighttime}
                  size={railIconSize}
                />
                <Text
                  style={[
                    styles.labelRail,
                    isPhonePortrait && styles.labelRailPhonePortrait,
                  ]}>
                  {label}
                </Text>
              </View>
            );
          })}
        </View>
      </LiquidGlassSurface>
    );
  }

  return (
    <View
      style={[mapGlassPanel.panel, styles.panelStack]}
      accessibilityLabel="Fog intensity legend">
      <Text style={mapGlassPanel.eyebrow}>Fog Intensity</Text>

      <View style={styles.listStack}>
        {LEGEND_ITEMS.map((item) => {
          const isActive = activeIntensity === item.intensity;
          const label = getFogIntensityLabel(item.intensity);

          if (isInteractive) {
            return (
              <Pressable
                key={item.intensity}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                accessibilityLabel={label}
                onPress={() => onSelectIntensity?.(item.intensity)}
                style={({ pressed }) => [
                  styles.itemStack,
                  isActive && styles.itemActive,
                  pressed && styles.pressed,
                ]}>
                <LegendSwatch color={item.swatchColor} />
                <Text
                  style={[
                    styles.labelStack,
                    isActive && styles.labelActive,
                  ]}>
                  {label}
                </Text>
              </Pressable>
            );
          }

          return (
            <View key={item.intensity} style={styles.itemStack}>
              <LegendSwatch color={item.swatchColor} />
              <Text style={styles.labelStack}>{label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panelStack: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    maxWidth: 280,
  },
  panelRail: {
    width: 62,
    paddingHorizontal: 3,
    paddingVertical: 5,
    gap: 3,
  },
  panelRailPhonePortrait: {
    width: 78,
    paddingHorizontal: 5,
    paddingVertical: 8,
    gap: 5,
  },
  eyebrowRail: {
    fontSize: 7,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.42)',
  },
  eyebrowRailPhonePortrait: {
    fontSize: 8,
    letterSpacing: 1.2,
    color: 'rgba(255, 255, 255, 0.48)',
  },
  listStack: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  listRail: {
    gap: 3,
    marginTop: 1,
  },
  listRailPhonePortrait: {
    gap: 5,
    marginTop: 2,
  },
  itemStack: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: Radius.sm,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  itemRail: {
    alignItems: 'center',
    gap: 2,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: LiquidGlassTokens.borderSubtle,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    paddingHorizontal: 3,
    paddingVertical: 4,
  },
  itemRailPhonePortrait: {
    gap: 3,
    paddingHorizontal: 4,
    paddingVertical: 6,
    borderRadius: Radius.md,
  },
  itemActive: {
    borderColor: 'rgba(242, 163, 38, 0.28)',
    backgroundColor: 'rgba(242, 163, 38, 0.08)',
  },
  swatch: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  labelStack: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.58)',
  },
  labelRail: {
    fontSize: 7,
    lineHeight: 10,
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.58)',
  },
  labelRailPhonePortrait: {
    fontSize: 9,
    lineHeight: 11,
  },
  labelActive: {
    color: Colors.gold,
  },
  pressed: {
    opacity: 0.88,
  },
});
