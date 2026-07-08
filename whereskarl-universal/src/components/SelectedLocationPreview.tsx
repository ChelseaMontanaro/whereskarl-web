import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ConditionsSummaryPill } from '@/components/ConditionsSummaryPill';
import { HomeLocationBadge } from '@/components/HomeLocationBadge';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { getCloudSummary } from '@/lib/map/locationsDisplay';
import type { LocationWeather } from '@/types/weather';

type SelectedLocationPreviewProps = {
  location: LocationWeather | null;
  isSelected?: boolean;
  isHomeLocation?: boolean;
  onOpenDetail?: (locationId: string) => void;
  onDismiss?: () => void;
};

export function SelectedLocationPreview({
  location,
  isSelected = true,
  isHomeLocation = false,
  onOpenDetail,
  onDismiss,
}: SelectedLocationPreviewProps) {
  if (!location) {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        isSelected && styles.containerSelected,
      ]}>
      <View style={styles.header}>
        <View style={styles.titleBlock}>
          {isHomeLocation ? <HomeLocationBadge /> : null}
          {location.region ? (
            <Text style={styles.region}>{location.region}</Text>
          ) : null}
          <Text style={styles.name}>{location.name}</Text>
        </View>

        {onDismiss ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear selected location"
            onPress={onDismiss}
            style={({ pressed }) => [
              styles.dismissButton,
              pressed && styles.buttonPressed,
            ]}>
            <Text style={styles.dismissLabel}>Clear</Text>
          </Pressable>
        ) : null}
      </View>

      <Text style={styles.summary}>{getCloudSummary(location)}</Text>

      <View style={styles.metricsRow}>
        <Text style={styles.metric}>
          {Math.round(location.temperature)}° ·{' '}
          {Math.round(location.sunshineScore)}% clear skies
        </Text>
      </View>

      <ConditionsSummaryPill location={location} />

      {onOpenDetail ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Open details for ${location.name}`}
          onPress={() => onOpenDetail(location.id)}
          style={({ pressed }) => [
            styles.detailButton,
            pressed && styles.buttonPressed,
          ]}>
          <Text style={styles.detailButtonLabel}>View location details</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: Colors.navyGlass,
    padding: Spacing.md,
    pointerEvents: 'auto',
  },
  containerSelected: {
    borderColor: 'rgba(242, 163, 38, 0.45)',
    backgroundColor: 'rgba(242, 163, 38, 0.08)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  titleBlock: {
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
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  dismissButton: {
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: Colors.glassBackground,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  dismissLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  summary: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  metricsRow: {
    flexDirection: 'row',
  },
  metric: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.gold,
  },
  detailButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
    backgroundColor: Colors.gold,
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.xs,
  },
  detailButtonLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.navy,
  },
  buttonPressed: {
    opacity: 0.88,
  },
});
