import { StyleSheet, Text, View } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';
import type { LocationForecastPreviewItem } from '@/lib/location/detailDisplay';

type LocationForecastPreviewProps = {
  items: LocationForecastPreviewItem[];
  isLoading?: boolean;
  emptyMessage?: string;
};

export function LocationForecastPreview({
  items,
  isLoading = false,
  emptyMessage = 'Forecast trend details will appear here when Karl has enough signal for this location.',
}: LocationForecastPreviewProps) {
  return (
    <View style={[styles.card, isLoading && styles.loading]}>
      <Text style={styles.title}>Forecast preview</Text>

      {items.length > 0 ? (
        <View style={styles.items}>
          {items.map((item) => (
            <View key={`${item.title}-${item.detail}`} style={styles.item}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemDetail}>{item.detail}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.empty}>{emptyMessage}</Text>
      )}
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
  items: {
    gap: Spacing.sm,
  },
  item: {
    gap: 2,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: Colors.navyGlass,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  itemTitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: Colors.gold,
  },
  itemDetail: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  empty: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    color: Colors.textMuted,
  },
});
