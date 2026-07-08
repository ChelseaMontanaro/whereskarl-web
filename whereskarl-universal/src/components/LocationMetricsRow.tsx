import { StyleSheet, Text, View } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';
import type { LocationMetric } from '@/lib/location/detailDisplay';

type LocationMetricsRowProps = {
  metrics: LocationMetric[];
  isLoading?: boolean;
};

export function LocationMetricsRow({
  metrics,
  isLoading = false,
}: LocationMetricsRowProps) {
  if (metrics.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, isLoading && styles.loading]}>
      <Text style={styles.title}>Conditions</Text>
      <View style={styles.grid}>
        {metrics.map((metric) => (
          <View key={metric.label} style={styles.metric}>
            <Text style={styles.label}>{metric.label}</Text>
            <Text style={styles.value}>{metric.value}</Text>
          </View>
        ))}
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
  loading: {
    opacity: 0.72,
  },
  title: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: Colors.textMuted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  metric: {
    minWidth: '46%',
    flexGrow: 1,
    gap: 2,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: Colors.navyGlass,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: Colors.textMuted,
  },
  value: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
});
