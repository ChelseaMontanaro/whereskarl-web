import { StyleSheet, Text, View } from 'react-native';

import { ConditionsSummaryPill } from '@/components/ConditionsSummaryPill';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import {
  getLocationConditionHeadline,
  getLocationHeroSummary,
} from '@/lib/location/detailDisplay';
import type { LocationWeather } from '@/types/weather';

type LocationConditionsHeroProps = {
  location: Pick<
    LocationWeather,
    | 'name'
    | 'status'
    | 'sunshineScore'
    | 'fogScore'
    | 'cloudCover'
    | 'temperature'
  >;
  isLoading?: boolean;
};

export function LocationConditionsHero({
  location,
  isLoading = false,
}: LocationConditionsHeroProps) {
  const conditionHeadline = getLocationConditionHeadline(location);
  const summary = getLocationHeroSummary(location);

  return (
    <View style={[styles.card, isLoading && styles.loading]}>
      <View style={styles.topRow}>
        <View style={styles.scoreBlock}>
          <Text style={styles.scoreLabel}>Clear Skies Score</Text>
          <Text style={styles.scoreValue}>
            {Math.round(location.sunshineScore)}%
          </Text>
        </View>

        <View style={styles.conditionBlock}>
          <Text style={styles.conditionLabel}>Right now</Text>
          <Text style={styles.conditionHeadline}>{conditionHeadline}</Text>
          <Text style={styles.temperature}>
            {Math.round(location.temperature)}°
          </Text>
        </View>
      </View>

      <Text style={styles.summary}>{summary}</Text>
      <ConditionsSummaryPill location={location} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: 'stretch',
    gap: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: Colors.navyGlass,
    padding: Spacing.md,
  },
  loading: {
    opacity: 0.72,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: Spacing.md,
  },
  scoreBlock: {
    minWidth: 108,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: Colors.glassBorder,
    paddingRight: Spacing.md,
  },
  scoreLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: Colors.textMuted,
  },
  scoreValue: {
    marginTop: Spacing.xs,
    fontFamily: Fonts?.serif,
    fontSize: 34,
    fontWeight: '600',
    color: Colors.gold,
  },
  conditionBlock: {
    flex: 1,
    gap: 4,
  },
  conditionLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: Colors.textMuted,
  },
  conditionHeadline: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  temperature: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.gold,
  },
  summary: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
    color: Colors.textSecondary,
  },
});
