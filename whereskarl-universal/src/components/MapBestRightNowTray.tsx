import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';
import type { BestRightNowMapItem } from '@/lib/map/mapPanelDisplay';

type MapBestRightNowTrayProps = {
  items: BestRightNowMapItem[];
  selectedLocationId?: string | null;
  onSelectLocation: (locationId: string) => void;
  isLoading?: boolean;
  variant?: 'desktop' | 'mobile';
};

export function MapBestRightNowTray({
  items,
  selectedLocationId = null,
  onSelectLocation,
  isLoading = false,
  variant = 'desktop',
}: MapBestRightNowTrayProps) {
  const isMobile = variant === 'mobile';

  if (isLoading) {
    return (
      <View style={[styles.panel, isMobile && styles.panelMobile]}>
        <Text style={styles.loadingText}>Finding best spots…</Text>
      </View>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <View
      style={[styles.panel, isMobile && styles.panelMobile]}
      accessibilityLabel="Best right now">
      <Text style={[styles.title, isMobile && styles.titleMobile]}>
        Best Right Now
      </Text>
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
                isMobile && styles.cardMobile,
                isSelected && styles.cardSelected,
                pressed && styles.cardPressed,
              ]}>
              <Text
                style={[styles.cardName, isMobile && styles.cardNameMobile]}
                numberOfLines={1}>
                {item.locationName}
              </Text>
              <Text style={[styles.cardScore, isMobile && styles.cardScoreMobile]}>
                {item.score}
              </Text>
              <Text
                style={[styles.cardDetail, isMobile && styles.cardDetailMobile]}
                numberOfLines={1}>
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
    borderColor: 'rgba(255, 255, 255, 0.14)',
    backgroundColor: 'rgba(3, 11, 20, 0.94)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    pointerEvents: 'auto',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.24,
    shadowRadius: 12,
    elevation: 5,
  },
  panelMobile: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  title: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: Colors.textMuted,
    paddingHorizontal: 4,
  },
  titleMobile: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.52)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    gap: 2,
  },
  cardMobile: {
    width: 104,
    paddingVertical: 10,
  },
  cardSelected: {
    borderColor: 'rgba(242, 163, 38, 0.4)',
    backgroundColor: 'rgba(242, 163, 38, 0.1)',
  },
  cardPressed: {
    opacity: 0.88,
  },
  cardName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  cardNameMobile: {
    fontSize: 13,
  },
  cardScore: {
    fontSize: 22,
    fontWeight: '300',
    color: Colors.gold,
    lineHeight: 24,
  },
  cardScoreMobile: {
    fontSize: 24,
    lineHeight: 26,
  },
  cardDetail: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textMuted,
  },
  cardDetailMobile: {
    fontSize: 11,
  },
});
