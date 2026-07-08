import { StyleSheet, Text, View } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';

type ClearSkiesScoreProps = {
  sunshineScore: number;
  isLoading?: boolean;
};

function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function ClearSkiesScore({
  sunshineScore,
  isLoading = false,
}: ClearSkiesScoreProps) {
  const percent = clampPercent(sunshineScore);

  return (
    <View
      style={[styles.container, isLoading && styles.loading]}
      accessibilityRole="progressbar"
      accessibilityLabel={`Clear skies score ${percent} percent`}
      accessibilityValue={{ min: 0, max: 100, now: percent }}>
      <View style={styles.header}>
        <Text style={styles.title}>Clear Skies Score</Text>
        <Text style={styles.value}>{percent}%</Text>
      </View>

      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percent}%` }]} />
      </View>

      <View style={styles.labels}>
        <Text style={styles.label}>Poor</Text>
        <Text style={styles.label}>Excellent</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    gap: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: Colors.glassBackground,
    padding: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: 'rgba(255, 255, 255, 0.72)',
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.gold,
  },
  track: {
    height: 8,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radius.pill,
    backgroundColor: Colors.gold,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textMuted,
  },
  loading: {
    opacity: 0.72,
  },
});
