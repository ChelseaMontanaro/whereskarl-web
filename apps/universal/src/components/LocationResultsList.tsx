import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { ReactElement } from 'react';

import { LocationResultCard } from '@/components/LocationResultCard';
import { Colors, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import type {
  LocationFilterMode,
  LocationSortMode,
} from '@/lib/map/locationsDisplay';
import type { LocationWeather } from '@/types/weather';

type LocationResultsListProps = {
  locations: LocationWeather[];
  isLoading: boolean;
  isRefreshing?: boolean;
  error?: string | null;
  searchQuery: string;
  sortMode: LocationSortMode;
  filterMode: LocationFilterMode;
  selectedLocationId?: string | null;
  homeLocationId?: string | null;
  onSelectLocation?: (locationId: string) => void;
  onSortModeChange?: (mode: LocationSortMode) => void;
  onFilterModeChange?: (mode: LocationFilterMode) => void;
  onRefresh?: () => void;
  ListHeaderComponent?: ReactElement | null;
};

const SORT_OPTIONS: { id: LocationSortMode; label: string }[] = [
  { id: 'brightest', label: 'Brightest' },
  { id: 'temperature', label: 'Warmest' },
  { id: 'name', label: 'A–Z' },
];

const FILTER_OPTIONS: { id: LocationFilterMode; label: string }[] = [
  { id: 'brightest', label: 'Bright spots' },
  { id: 'all', label: 'All locations' },
];

export function LocationResultsList({
  locations,
  isLoading,
  isRefreshing = false,
  error = null,
  searchQuery,
  sortMode,
  filterMode,
  selectedLocationId = null,
  homeLocationId = null,
  onSelectLocation,
  onSortModeChange,
  onFilterModeChange,
  onRefresh,
  ListHeaderComponent = null,
}: LocationResultsListProps) {
  const showInitialLoading = isLoading && locations.length === 0;

  const emptyMessage = (() => {
    if (showInitialLoading) {
      return 'Loading Bay Area locations…';
    }

    if (error && locations.length === 0) {
      return error;
    }

    if (searchQuery.trim()) {
      return `No locations match “${searchQuery.trim()}”.`;
    }

    if (filterMode === 'brightest') {
      return 'No bright spots meet the clear-skies threshold right now.';
    }

    return 'No monitored locations available right now.';
  })();

  return (
    <FlatList
      data={locations}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshing={isRefreshing}
      onRefresh={onRefresh}
      ListHeaderComponent={
        <>
          {ListHeaderComponent}
          <View style={styles.controls}>
            <View style={styles.controlGroup}>
              <Text style={styles.controlLabel}>Sort</Text>
              <View style={styles.chips}>
                {SORT_OPTIONS.map((option) => (
                  <FilterChip
                    key={option.id}
                    label={option.label}
                    isActive={sortMode === option.id}
                    onPress={
                      onSortModeChange
                        ? () => onSortModeChange(option.id)
                        : undefined
                    }
                  />
                ))}
              </View>
            </View>
            <View style={styles.controlGroup}>
              <Text style={styles.controlLabel}>Filter</Text>
              <View style={styles.chips}>
                {FILTER_OPTIONS.map((option) => (
                  <FilterChip
                    key={option.id}
                    label={option.label}
                    isActive={filterMode === option.id}
                    onPress={
                      onFilterModeChange
                        ? () => onFilterModeChange(option.id)
                        : undefined
                    }
                  />
                ))}
              </View>
            </View>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>
              {showInitialLoading
                ? 'Checking live conditions…'
                : `${locations.length} location${locations.length === 1 ? '' : 's'}`}
            </Text>
            {error && locations.length > 0 ? (
              <Text style={styles.errorHint}>Showing last loaded results</Text>
            ) : null}
          </View>
        </>
      }
      ListEmptyComponent={
        <View style={styles.emptyState}>
          {showInitialLoading ? (
            <ActivityIndicator color={Colors.gold} />
          ) : null}
          <Text style={styles.emptyText}>{emptyMessage}</Text>
        </View>
      }
      renderItem={({ item, index }) => (
        <LocationResultCard
          location={item}
          rank={sortMode === 'brightest' ? index + 1 : undefined}
          isSelected={selectedLocationId === item.id}
          isHomeLocation={
            Boolean(homeLocationId) &&
            homeLocationId?.trim().toLowerCase() === item.id.trim().toLowerCase()
          }
          onPress={onSelectLocation}
        />
      )}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  );
}

type FilterChipProps = {
  label: string;
  isActive: boolean;
  onPress?: () => void;
};

function FilterChip({ label, isActive, onPress }: FilterChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: isActive, disabled: !onPress }}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        isActive && styles.chipActive,
        !onPress && styles.chipDisabled,
        pressed && onPress && styles.chipPressed,
      ]}>
      <Text style={[styles.chipLabel, isActive && styles.chipLabelActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
  },
  controls: {
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  controlGroup: {
    gap: Spacing.xs,
  },
  controlLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: Colors.textMuted,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  chip: {
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: Colors.glassBackground,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipActive: {
    borderColor: 'rgba(242, 163, 38, 0.4)',
    backgroundColor: 'rgba(242, 163, 38, 0.12)',
  },
  chipDisabled: {
    opacity: 0.95,
  },
  chipPressed: {
    opacity: 0.86,
  },
  chipLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  chipLabelActive: {
    color: Colors.gold,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  summaryText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  errorHint: {
    flex: 1,
    textAlign: 'right',
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(242, 163, 38, 0.85)',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: Colors.navyGlass,
    padding: Spacing.lg,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  separator: {
    height: Spacing.sm,
  },
});
