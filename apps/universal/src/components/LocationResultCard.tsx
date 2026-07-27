import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ConditionsSummaryPill } from '@/components/ConditionsSummaryPill';
import { HomeLocationBadge } from '@/components/HomeLocationBadge';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import {
  formatConfidenceLabel,
  getCloudSummary,
} from '@/lib/map/locationsDisplay';
import type { LocationWeather } from '@/types/weather';

type LocationResultCardProps = {
  location: LocationWeather;
  rank?: number;
  onPress?: (locationId: string) => void;
  isSelected?: boolean;
  isHomeLocation?: boolean;
};

export function LocationResultCard({
  location,
  rank,
  onPress,
  isSelected = false,
  isHomeLocation = false,
}: LocationResultCardProps) {
  const confidenceLabel = formatConfidenceLabel(location.confidenceLabel);
  const cloudSummary = getCloudSummary(location);

  const content = (
    <>
      <View style={styles.header}>
        <View style={styles.titleBlock}>
          {typeof rank === 'number' ? (
            <Text style={styles.rank}>#{rank}</Text>
          ) : null}
          <View style={styles.nameBlock}>
            {isHomeLocation ? <HomeLocationBadge /> : null}
            {location.region ? (
              <Text style={styles.region}>{location.region}</Text>
            ) : null}
            <Text style={styles.name}>{location.name}</Text>
          </View>
        </View>
        <Text style={styles.distance}>{location.distanceText}</Text>
      </View>

      <Text style={styles.summary}>{cloudSummary}</Text>

      <View style={styles.metricsRow}>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>
            {Math.round(location.temperature)}°
          </Text>
          <Text style={styles.metricLabel}>Temp</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>
            {Math.round(location.sunshineScore)}%
          </Text>
          <Text style={styles.metricLabel}>Clear skies</Text>
        </View>
      </View>

      <ConditionsSummaryPill location={location} />

      {confidenceLabel ? (
        <Text style={styles.confidence}>{confidenceLabel} confidence</Text>
      ) : null}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${location.name}, ${Math.round(location.sunshineScore)} percent clear skies`}
        accessibilityState={{ selected: isSelected }}
        onPress={() => onPress(location.id)}
        style={({ pressed }) => [
          styles.card,
          isSelected && styles.cardSelected,
          pressed && styles.cardPressed,
        ]}>
        {content}
      </Pressable>
    );
  }

  return (
    <View style={[styles.card, isSelected && styles.cardSelected]}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: 'stretch',
    gap: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: Colors.navyGlass,
    padding: Spacing.md,
  },
  cardSelected: {
    borderColor: 'rgba(242, 163, 38, 0.45)',
    backgroundColor: 'rgba(242, 163, 38, 0.08)',
  },
  cardPressed: {
    opacity: 0.88,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  titleBlock: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  rank: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.gold,
    marginTop: 2,
  },
  nameBlock: {
    flex: 1,
    gap: 2,
  },
  region: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: Colors.textMuted,
  },
  name: {
    fontFamily: Fonts?.serif,
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  distance: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textMuted,
  },
  summary: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  metric: {
    gap: 2,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.gold,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: Colors.textMuted,
  },
  confidence: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textMuted,
  },
});
