import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { LiquidGlassSurface } from '@/components/ui/LiquidGlassSurface';
import { mapGlassPanel } from '@/components/map/mapGlassPanel';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { LiquidGlassTokens } from '@/constants/liquidGlass';
import type { BestRightNowMapItem } from '@/lib/map/mapPanelDisplay';

type MapBestRightNowTrayProps = {
  items: BestRightNowMapItem[];
  selectedLocationId?: string | null;
  onSelectLocation: (locationId: string) => void;
  isLoading?: boolean;
  variant?: 'desktop' | 'mobile';
  isPhonePortrait?: boolean;
};

export function MapBestRightNowTray({
  items,
  selectedLocationId = null,
  onSelectLocation,
  isLoading = false,
  variant = 'desktop',
  isPhonePortrait = false,
}: MapBestRightNowTrayProps) {
  const isMobile = variant === 'mobile';

  if (isLoading) {
    const loadingPanel = (
      <Text style={styles.loadingText}>Finding best spots…</Text>
    );

    if (isMobile) {
      return (
        <LiquidGlassSurface variant="panel" style={[styles.panel, styles.panelMobile]}>
          {loadingPanel}
        </LiquidGlassSurface>
      );
    }

    return (
      <View style={[mapGlassPanel.panel, styles.panel, styles.panelMobile]}>
        {loadingPanel}
      </View>
    );
  }

  if (items.length === 0) {
    return null;
  }

  const trayContent = (
    <>
      <Text style={[styles.title, isPhonePortrait && styles.titlePhonePortrait]}>
        Best Right Now
      </Text>
      <View style={styles.row}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.list}>
          {items.map((item, index) => {
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
                  isPhonePortrait && styles.cardPhonePortrait,
                  isSelected && styles.cardSelected,
                  pressed && styles.cardPressed,
                ]}>
                <Text
                  style={[
                    styles.cardName,
                    isMobile && styles.cardNameMobile,
                    isPhonePortrait && styles.cardNamePhonePortrait,
                  ]}
                  numberOfLines={1}>
                  {item.locationName}
                </Text>
                <Text
                  style={[
                    styles.cardScore,
                    isMobile && styles.cardScoreMobile,
                    isPhonePortrait && styles.cardScorePhonePortrait,
                  ]}>
                  {item.score}
                </Text>
                {index === 0 || item.scoreLabel ? (
                  <Text
                    style={[
                      styles.cardDetail,
                      isMobile && styles.cardDetailMobile,
                      isPhonePortrait && styles.cardDetailPhonePortrait,
                    ]}
                    numberOfLines={1}>
                    {item.scoreLabel ?? (index === 0 ? 'Clearest' : '')}
                  </Text>
                ) : null}
              </Pressable>
            );
          })}
        </ScrollView>
        <View
          style={[
            styles.chevron,
            isMobile && styles.chevronMobile,
            isPhonePortrait && styles.chevronPhonePortrait,
          ]}
          accessibilityElementsHidden>
          <Text style={styles.chevronLabel}>›</Text>
        </View>
      </View>
    </>
  );

  if (isMobile) {
    return (
      <LiquidGlassSurface
        variant="panel"
        style={[
          styles.panel,
          styles.panelMobile,
          isPhonePortrait && styles.panelPhonePortrait,
        ]}
        accessibilityLabel="Best right now">
        {trayContent}
      </LiquidGlassSurface>
    );
  }

  return (
    <View
      style={[mapGlassPanel.panel, styles.panel]}
      accessibilityLabel="Best right now">
      {trayContent}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
    maxWidth: 360,
  },
  panelMobile: {
    maxWidth: '100%',
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 3,
  },
  /** Approved phone-portrait tray: darker navy glass, clearly lifted off the map. */
  panelPhonePortrait: {
    paddingHorizontal: 12,
    paddingVertical: 11,
    gap: 6,
    borderRadius: 16,
    borderColor: 'rgba(160, 185, 210, 0.24)',
    backgroundColor: 'rgba(6, 15, 27, 0.92)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 10,
  },
  titlePhonePortrait: {
    fontSize: 11,
    letterSpacing: 1.6,
  },
  title: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: 'rgba(242, 163, 38, 0.9)',
    paddingHorizontal: 2,
  },
  loadingText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textMuted,
    paddingHorizontal: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  list: {
    gap: 6,
    paddingHorizontal: 2,
  },
  card: {
    width: 108,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 8,
    gap: 2,
  },
  cardMobile: {
    width: 84,
    paddingHorizontal: 6,
    paddingVertical: 5,
    gap: 1,
    borderColor: LiquidGlassTokens.borderSubtle,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  cardPhonePortrait: {
    width: 96,
    paddingHorizontal: 8,
    paddingVertical: 7,
    gap: 2,
  },
  cardSelected: {
    borderColor: 'rgba(242, 163, 38, 0.28)',
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
  cardNameMobile: {
    fontSize: 11,
    lineHeight: 13,
  },
  cardNamePhonePortrait: {
    fontSize: 12,
    lineHeight: 14,
  },
  cardScore: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.gold,
    lineHeight: 18,
  },
  cardScoreMobile: {
    fontSize: 13,
    lineHeight: 15,
  },
  cardScorePhonePortrait: {
    fontSize: 15,
    lineHeight: 17,
  },
  cardDetail: {
    fontSize: 10,
    fontWeight: '500',
    color: Colors.textMuted,
  },
  cardDetailMobile: {
    fontSize: 9,
    lineHeight: 11,
  },
  cardDetailPhonePortrait: {
    fontSize: 10,
    lineHeight: 12,
  },
  chevron: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronMobile: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderColor: LiquidGlassTokens.borderSubtle,
  },
  chevronPhonePortrait: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  chevronLabel: {
    fontSize: 18,
    lineHeight: 20,
    color: Colors.textMuted,
  },
});
