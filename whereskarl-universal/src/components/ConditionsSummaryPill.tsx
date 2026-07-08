import { StyleSheet, Text, View } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';
import {
  getLocationConditionLabel,
  resolveLocationFogIntensity,
  type FogIntensity,
} from '@/lib/map/locationsDisplay';
import type { LocationWeather } from '@/types/weather';

type ConditionsSummaryPillProps = {
  location: Pick<
    LocationWeather,
    'fogScore' | 'sunshineScore' | 'status' | 'cloudCover'
  >;
};

const INTENSITY_COLORS: Record<FogIntensity, string> = {
  clear: 'rgba(242, 163, 38, 0.18)',
  lightFog: 'rgba(255, 255, 255, 0.08)',
  foggy: 'rgba(184, 214, 237, 0.14)',
  karlTerritory: 'rgba(148, 163, 184, 0.18)',
};

const INTENSITY_BORDER_COLORS: Record<FogIntensity, string> = {
  clear: 'rgba(242, 163, 38, 0.35)',
  lightFog: 'rgba(255, 255, 255, 0.12)',
  foggy: 'rgba(184, 214, 237, 0.28)',
  karlTerritory: 'rgba(148, 163, 184, 0.32)',
};

const INTENSITY_TEXT_COLORS: Record<FogIntensity, string> = {
  clear: Colors.gold,
  lightFog: 'rgba(255, 255, 255, 0.78)',
  foggy: 'rgba(210, 224, 238, 0.92)',
  karlTerritory: 'rgba(203, 213, 225, 0.88)',
};

export function ConditionsSummaryPill({ location }: ConditionsSummaryPillProps) {
  const intensity = resolveLocationFogIntensity(location);
  const label = getLocationConditionLabel(location);
  const cloudText =
    typeof location.cloudCover === 'number' &&
    Number.isFinite(location.cloudCover)
      ? `${Math.round(location.cloudCover)}% clouds`
      : null;

  return (
    <View
      style={[
        styles.pill,
        {
          backgroundColor: INTENSITY_COLORS[intensity],
          borderColor: INTENSITY_BORDER_COLORS[intensity],
        },
      ]}>
      <Text style={[styles.label, { color: INTENSITY_TEXT_COLORS[intensity] }]}>
        {label}
      </Text>
      {cloudText ? <Text style={styles.detail}>{cloudText}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.pill,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  detail: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textMuted,
  },
});
