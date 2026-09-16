import { StyleSheet, Text, View } from 'react-native';

import { Radius } from '@/constants/theme';
import {
  getFogIntensityLabel,
  resolveLocationFogIntensity,
  type FogIntensity,
} from '@whereskarl/domain';
import type { LocationWeather } from '@whereskarl/schemas';

type FavoritesConditionChipProps = {
  location: Pick<LocationWeather, 'fogScore' | 'sunshineScore' | 'status'>;
};

const CHIP: Record<
  FogIntensity,
  { backgroundColor: string; borderColor: string; color: string }
> = {
  clear: {
    backgroundColor: 'rgba(52, 199, 89, 0.22)',
    borderColor: 'rgba(52, 199, 89, 0.42)',
    color: 'rgba(198, 255, 214, 0.96)',
  },
  lightFog: {
    backgroundColor: 'rgba(148, 180, 204, 0.22)',
    borderColor: 'rgba(148, 180, 204, 0.38)',
    color: 'rgba(226, 236, 246, 0.94)',
  },
  foggy: {
    backgroundColor: 'rgba(90, 164, 220, 0.24)',
    borderColor: 'rgba(90, 164, 220, 0.42)',
    color: 'rgba(210, 232, 255, 0.96)',
  },
  karlTerritory: {
    backgroundColor: 'rgba(155, 138, 220, 0.28)',
    borderColor: 'rgba(155, 138, 220, 0.44)',
    color: 'rgba(232, 224, 255, 0.96)',
  },
};

function chipLabel(intensity: FogIntensity): string {
  if (intensity === 'karlTerritory') {
    return 'Karl';
  }
  return getFogIntensityLabel(intensity);
}

export function FavoritesConditionChip({ location }: FavoritesConditionChipProps) {
  const intensity = resolveLocationFogIntensity(location);
  const tone = CHIP[intensity];

  return (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: tone.backgroundColor,
          borderColor: tone.borderColor,
        },
      ]}>
      <Text style={[styles.label, { color: tone.color }]} numberOfLines={1}>
        {chipLabel(intensity)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexShrink: 0,
    borderRadius: Radius.pill,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
  },
});
