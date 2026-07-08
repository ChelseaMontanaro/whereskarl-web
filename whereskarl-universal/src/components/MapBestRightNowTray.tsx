import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';
import type { BestRightNowMapItem } from '@/lib/map/mapPanelDisplay';

type MapBestRightNowTrayProps = {
  items: BestRightNowMapItem[];
  selectedLocationId?: string | null;
  onSelectLocation: (locationId: string) => void;
  isLoading?: boolean;
};

export function MapBestRightNowTray({
  items,
  selectedLocationId = null,
  onSelectLocation,
  isLoading = false,
}: MapBestRightNowTrayProps) {
  if (isLoading) {
    return (
      <View style={styles.panel}>
        <Text style={styles.loadingText}>Finding best spots…</Text>
      </View>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <View style={styles.panel} accessibilityLabel="Best right now">
      <Text style={styles.title}>Best Right Now</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}>
        {items.map((item) => {
          const isSelected =
            selectedLocationId != null &&
            item.locationId.trim().toLowerCase() ===
              selectedLocationId.trim().toLowerCase();

          return (
            <Pressable
              key={item.locationId}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`Select ${item.locationName} on map`}
              onPress={() => onSelectLocation(item.locationId)}
              style={({ pressed }) => [
                styles.card,
                isSelected && styles.cardSelected,
                pressed && styles.cardPressed,
              ]}>
              <Text style={styles.cardName} numberOfLines={1}>
                {item.locationName}
              </Text>
              <Text style={styles.cardScore}>{item.score}</Text>
              <Text style={styles.cardDetail} numberOfLines={1}>
                {item.scoreLabel}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: 'rgba(3, 11, 20, 0.88)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    pointerEvents: 'auto',
  },
  title: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: Colors.textMuted,
    paddingHorizontal: 4,
  },
  loadingText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textMuted,
    paddingHorizontal: 4,
  },
  list: {
    gap: Spacing.sm,
    paddingHorizontal: 2,
  },
  card: {
    width: 112,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    gap: 2,
  },
  cardSelected: {
    borderColor: 'rgba(242, 163, 38, 0.35)',
    backgroundColor: 'rgba(242, 163, 38, 0.08)',
  },
  cardPressed: {
    opacity: 0.88,
  },
  cardName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  cardScore: {
    fontSize: 22,
    fontWeight: '300',
    color: Colors.gold,
    lineHeight: 24,
  },
  cardDetail: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textMuted,
  },
});
