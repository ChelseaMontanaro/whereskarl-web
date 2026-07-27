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
      <Text style={[styles.eyebrow, isMobile && styles.eyebrowMobile]}>
        Karl around the Bay
      </Text>
      <Text style={[styles.status, isMobile && styles.statusMobile]}>
        {statusSummary}
      </Text>

      <View style={styles.section}>
        {!isMobile ? (
          <Text style={styles.sectionLabel}>Regions</Text>
        ) : null}
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
                mobile
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
      </View>

      <View style={styles.section}>
        {!isMobile ? (
          <Text style={styles.sectionLabel}>Conditions</Text>
        ) : null}
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
                mobile
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
      </View>

      <View style={styles.footer}>
        <View style={styles.updatedRow}>
          <View style={styles.statusDot} />
          <Text style={[styles.updatedLabel, isMobile && styles.updatedLabelMobile]}>
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
  mobile?: boolean;
};

function FilterChip({ label, isActive, onPress, mobile = false }: FilterChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        mobile && styles.chipMobile,
        isActive && styles.chipActive,
        pressed && styles.chipPressed,
      ]}>
      <Text
        style={[
          styles.chipLabel,
          mobile && styles.chipLabelMobile,
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
  mobile?: boolean;
};

function ConditionChip({
  label,
  swatchColor,
  isActive,
  onPress,
  mobile = false,
}: ConditionChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.conditionChip,
        mobile && styles.conditionChipMobile,
        isActive && styles.chipActive,
        pressed && styles.chipPressed,
      ]}>
      <View
        style={[
          styles.swatch,
          mobile && styles.swatchMobile,
          { backgroundColor: swatchColor },
        ]}
      />
      <Text
        style={[
          styles.conditionLabel,
          mobile && styles.conditionLabelMobile,
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
    borderColor: 'rgba(255, 255, 255, 0.14)',
    backgroundColor: 'rgba(3, 11, 20, 0.94)',
    pointerEvents: 'auto',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 6,
  },
  panelDesktop: {
    width: 300,
    maxWidth: '100%',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  panelMobile: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: Colors.gold,
  },
  eyebrowMobile: {
    fontSize: 11,
    letterSpacing: 1.5,
  },
  status: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 19,
    color: Colors.textSecondary,
  },
  statusMobile: {
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255, 255, 255, 0.84)',
  },
  section: {
    gap: Spacing.xs,
  },
  sectionLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: Colors.textMuted,
  },
  chipRowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipRowScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 2,
  },
  conditionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: 'rgba(0, 0, 0, 0.32)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 36,
    justifyContent: 'center',
  },
  chipMobile: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 40,
  },
  chipActive: {
    borderColor: 'rgba(242, 163, 38, 0.45)',
    backgroundColor: 'rgba(242, 163, 38, 0.14)',
  },
  chipPressed: {
    opacity: 0.86,
  },
  chipLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  chipLabelMobile: {
    fontSize: 13,
  },
  chipLabelActive: {
    color: Colors.gold,
  },
  conditionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: 'rgba(0, 0, 0, 0.32)',
    paddingHorizontal: 10,
    paddingVertical: 8,
    minHeight: 36,
    minWidth: '47%',
    flexGrow: 1,
  },
  conditionChipMobile: {
    minWidth: 0,
    flexGrow: 0,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 40,
  },
  swatch: {
    width: 11,
    height: 11,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
  },
  swatchMobile: {
    width: 12,
    height: 12,
  },
  conditionLabel: {
    flexShrink: 1,
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  conditionLabelMobile: {
    fontSize: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  updatedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    flex: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: Radius.pill,
    backgroundColor: '#4ADE80',
  },
  updatedLabel: {
    flex: 1,
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  updatedLabelMobile: {
    fontSize: 11,
  },
  countLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
  },
});
