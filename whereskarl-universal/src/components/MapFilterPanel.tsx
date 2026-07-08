import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';
import {
  formatRelativeUpdatedAt,
  getBayAreaStatusSummary,
  getLatestUpdatedAt,
} from '@/lib/map/mapPanelDisplay';
import {
  getFogIntensityLabel,
  type FogIntensity,
} from '@/lib/map/locationsDisplay';
import {
  BAY_AREA_PRODUCT_REGIONS,
  type BayAreaVisibleProductRegionId,
} from '@/lib/map/regions';
import type { LocationWeather } from '@/types/weather';

const CONDITION_OPTIONS: Array<{
  id: FogIntensity;
  swatchColor: string;
}> = [
  { id: 'clear', swatchColor: Colors.gold },
  { id: 'lightFog', swatchColor: '#D8E8F4' },
  { id: 'foggy', swatchColor: '#C5DDF0' },
  { id: 'karlTerritory', swatchColor: '#8CB8D8' },
];

type MapFilterPanelProps = {
  locations: LocationWeather[];
  isLoading?: boolean;
  locationCount: number;
  selectedRegionId: BayAreaVisibleProductRegionId | null;
  onSelectRegion: (regionId: BayAreaVisibleProductRegionId) => void;
  conditionFilter: FogIntensity | null;
  onSelectCondition: (condition: FogIntensity) => void;
  variant?: 'desktop' | 'mobile';
  showCachedHint?: boolean;
};

export function MapFilterPanel({
  locations,
  isLoading = false,
  locationCount,
  selectedRegionId,
  onSelectRegion,
  conditionFilter,
  onSelectCondition,
  variant = 'desktop',
  showCachedHint = false,
}: MapFilterPanelProps) {
  const isMobile = variant === 'mobile';
  const statusSummary = getBayAreaStatusSummary(locations, isLoading);
  const updatedLabel = formatRelativeUpdatedAt(getLatestUpdatedAt(locations));

  return (
    <View
      style={[
        styles.panel,
        isMobile ? styles.panelMobile : styles.panelDesktop,
      ]}
      accessibilityLabel="Bay Area map filters">
      <Text style={styles.eyebrow}>Karl around the Bay</Text>
      <Text style={[styles.status, isMobile && styles.statusMobile]}>
        {statusSummary}
      </Text>

      {isMobile ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRowScroll}
          keyboardShouldPersistTaps="handled">
          {BAY_AREA_PRODUCT_REGIONS.map((region) => (
            <FilterChip
              key={region.id}
              label={region.chipLabel}
              isActive={selectedRegionId === region.id}
              onPress={() => onSelectRegion(region.id)}
              compact
            />
          ))}
        </ScrollView>
      ) : (
        <View style={styles.chipRowWrap}>
          {BAY_AREA_PRODUCT_REGIONS.map((region) => (
            <FilterChip
              key={region.id}
              label={region.chipLabel}
              isActive={selectedRegionId === region.id}
              onPress={() => onSelectRegion(region.id)}
            />
          ))}
        </View>
      )}

      {isMobile ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRowScroll}
          keyboardShouldPersistTaps="handled">
          {CONDITION_OPTIONS.map((option) => (
            <ConditionChip
              key={option.id}
              label={getFogIntensityLabel(option.id)}
              swatchColor={option.swatchColor}
              isActive={conditionFilter === option.id}
              onPress={() => onSelectCondition(option.id)}
              compact
            />
          ))}
        </ScrollView>
      ) : (
        <View style={styles.conditionGrid}>
          {CONDITION_OPTIONS.map((option) => (
            <ConditionChip
              key={option.id}
              label={getFogIntensityLabel(option.id)}
              swatchColor={option.swatchColor}
              isActive={conditionFilter === option.id}
              onPress={() => onSelectCondition(option.id)}
            />
          ))}
        </View>
      )}

      <View style={styles.footer}>
        <View style={styles.updatedRow}>
          <View style={styles.statusDot} />
          <Text style={styles.updatedLabel}>
            {updatedLabel}
            {showCachedHint ? ' · cached' : ''}
          </Text>
        </View>
        {!isMobile ? (
          <Text style={styles.countLabel}>
            {isLoading && locationCount === 0
              ? 'Checking…'
              : `${locationCount} on map`}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

type FilterChipProps = {
  label: string;
  isActive: boolean;
  onPress: () => void;
  compact?: boolean;
};

function FilterChip({ label, isActive, onPress, compact = false }: FilterChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        compact && styles.chipCompact,
        isActive && styles.chipActive,
        pressed && styles.chipPressed,
      ]}>
      <Text
        style={[
          styles.chipLabel,
          compact && styles.chipLabelCompact,
          isActive && styles.chipLabelActive,
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

type ConditionChipProps = {
  label: string;
  swatchColor: string;
  isActive: boolean;
  onPress: () => void;
  compact?: boolean;
};

function ConditionChip({
  label,
  swatchColor,
  isActive,
  onPress,
  compact = false,
}: ConditionChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.conditionChip,
        compact && styles.conditionChipCompact,
        isActive && styles.chipActive,
        pressed && styles.chipPressed,
      ]}>
      <View
        style={[
          styles.swatch,
          compact && styles.swatchCompact,
          { backgroundColor: swatchColor },
        ]}
      />
      <Text
        style={[
          styles.conditionLabel,
          compact && styles.conditionLabelCompact,
          isActive && styles.chipLabelActive,
        ]}
        numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: 'rgba(3, 11, 20, 0.88)',
    pointerEvents: 'auto',
  },
  panelDesktop: {
    width: 300,
    maxWidth: '100%',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  panelMobile: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: Colors.gold,
  },
  status: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  statusMobile: {
    fontSize: 11,
    lineHeight: 15,
  },
  chipRowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chipRowScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 2,
  },
  conditionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
    paddingHorizontal: 10,
    paddingVertical: 7,
    minHeight: 34,
    justifyContent: 'center',
  },
  chipCompact: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    minHeight: 36,
  },
  chipActive: {
    borderColor: 'rgba(242, 163, 38, 0.4)',
    backgroundColor: 'rgba(242, 163, 38, 0.12)',
  },
  chipPressed: {
    opacity: 0.86,
  },
  chipLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  chipLabelCompact: {
    fontSize: 12,
  },
  chipLabelActive: {
    color: Colors.gold,
  },
  conditionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
    paddingHorizontal: 8,
    paddingVertical: 7,
    minHeight: 34,
    minWidth: '47%',
    flexGrow: 1,
  },
  conditionChipCompact: {
    minWidth: 0,
    flexGrow: 0,
    paddingHorizontal: 10,
    paddingVertical: 8,
    minHeight: 36,
  },
  swatch: {
    width: 10,
    height: 10,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  swatchCompact: {
    width: 9,
    height: 9,
  },
  conditionLabel: {
    flexShrink: 1,
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  conditionLabelCompact: {
    fontSize: 11,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  updatedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: Radius.pill,
    backgroundColor: '#4ADE80',
  },
  updatedLabel: {
    flex: 1,
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  countLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
  },
});
