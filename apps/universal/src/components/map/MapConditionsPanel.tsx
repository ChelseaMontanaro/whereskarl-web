import { Pressable, StyleSheet, Text, View } from 'react-native';

import { mapGlassPanel } from '@/components/map/mapGlassPanel';
import { Colors, Radius, Spacing } from '@/constants/theme';
import {
  formatRelativeUpdatedAt,
  getBayAreaStatusSummary,
  getLatestUpdatedAt,
} from '@/lib/map/mapPanelDisplay';
import {
  BAY_AREA_PRODUCT_REGIONS,
  type BayAreaVisibleProductRegionId,
} from '@/lib/map/regions';
import type { LocationWeather } from '@/types/weather';

type MapConditionsPanelProps = {
  locations: LocationWeather[];
  isLoading?: boolean;
  selectedRegionId: BayAreaVisibleProductRegionId | null;
  onSelectRegion: (regionId: BayAreaVisibleProductRegionId) => void;
  compact?: boolean;
};

export function MapConditionsPanel({
  locations,
  isLoading = false,
  selectedRegionId,
  onSelectRegion,
  compact = false,
}: MapConditionsPanelProps) {
  const statusSummary = getBayAreaStatusSummary(locations, isLoading);
  const updatedLabel = formatRelativeUpdatedAt(getLatestUpdatedAt(locations));

  return (
    <View
      style={[
        mapGlassPanel.panel,
        styles.panel,
        compact && styles.panelCompact,
      ]}
      accessibilityLabel="Bay Area map conditions summary">
      <Text style={mapGlassPanel.eyebrow}>Karl around the Bay</Text>

      <View style={styles.statusRow}>
        <Text style={styles.statusIcon} accessibilityElementsHidden>
          ☁
        </Text>
        <Text style={[styles.status, compact && styles.statusCompact]}>
          {statusSummary}
        </Text>
      </View>

      <View style={styles.chipRow}>
        {BAY_AREA_PRODUCT_REGIONS.map((region) => {
          const isActive = selectedRegionId === region.id;

          return (
            <Pressable
              key={region.id}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              onPress={() => onSelectRegion(region.id)}
              style={({ pressed }) => [
                styles.chip,
                compact && styles.chipCompact,
                isActive && styles.chipActive,
                pressed && styles.pressed,
              ]}>
              <Text
                style={[
                  styles.chipLabel,
                  isActive && styles.chipLabelActive,
                ]}>
                {region.chipLabel}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.footer}>
        <View style={styles.liveDot} />
        <Text style={styles.footerText}>{updatedLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    maxWidth: 320,
  },
  panelCompact: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  statusIcon: {
    fontSize: 16,
    lineHeight: 20,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  status: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  statusCompact: {
    fontSize: 12,
    lineHeight: 16,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipCompact: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  chipActive: {
    borderColor: 'rgba(242, 163, 38, 0.4)',
    backgroundColor: Colors.gold,
  },
  chipLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.65)',
  },
  chipLabelActive: {
    color: Colors.navy,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22E36B',
  },
  footerText: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textMuted,
  },
  pressed: {
    opacity: 0.88,
  },
});
