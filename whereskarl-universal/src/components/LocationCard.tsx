import { StyleSheet, Text, View } from 'react-native';

import { HomeLocationBadge } from '@/components/HomeLocationBadge';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';

type LocationCardProps = {
  name: string;
  status: string;
  temperature: number;
  distanceText?: string;
  sunshineScore?: number;
  isHomeLocation?: boolean;
  isPlaceholder?: boolean;
  isLoading?: boolean;
};

export function LocationCard({
  name,
  status,
  temperature,
  distanceText,
  sunshineScore,
  isHomeLocation = false,
  isPlaceholder = false,
  isLoading = false,
}: LocationCardProps) {
  return (
    <View
      style={[
        styles.card,
        isPlaceholder && styles.placeholder,
        isLoading && styles.loading,
      ]}>
      {isHomeLocation ? <HomeLocationBadge /> : null}

      <View style={styles.header}>
        <Text style={styles.name}>{name}</Text>
        {distanceText ? (
          <Text style={styles.distance}>{distanceText}</Text>
        ) : null}
      </View>

      <Text style={styles.status}>{status}</Text>

      <View style={styles.metrics}>
        <Text style={styles.temperature}>{Math.round(temperature)}°</Text>
        {typeof sunshineScore === 'number' ? (
          <Text style={styles.score}>{Math.round(sunshineScore)}% clear</Text>
        ) : null}
      </View>

      {isPlaceholder ? (
        <Text style={styles.placeholderHint}>
          {isLoading
            ? 'Loading brightest spot…'
            : 'Showing sample conditions while the API is unavailable'}
        </Text>
      ) : null}
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
  placeholder: {
    borderStyle: 'dashed',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  name: {
    flex: 1,
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
  status: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  metrics: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.md,
  },
  temperature: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.gold,
  },
  score: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  placeholderHint: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },
  loading: {
    opacity: 0.72,
  },
});
