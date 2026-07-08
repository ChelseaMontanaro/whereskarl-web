import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { KarlMap } from '@/components/KarlMap';
import { LocationResultsList } from '@/components/LocationResultsList';
import { LocationSearchBar } from '@/components/LocationSearchBar';
import {
  MapViewModeToggle,
  type MapScreenViewMode,
} from '@/components/MapViewModeToggle';
import { SelectedLocationPreview } from '@/components/SelectedLocationPreview';
import { Colors, Fonts, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useHomeLocation } from '@/hooks/useHomeLocation';
import { useLocations } from '@/hooks/useLocations';
import {
  findStrongSearchMatch,
  prepareLocationResults,
  type LocationFilterMode,
  type LocationSortMode,
} from '@/lib/map/locationsDisplay';

function parseViewMode(value: string | string[] | undefined): MapScreenViewMode {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === 'map' ? 'map' : 'list';
}

function parseSelectedLocationId(
  value: string | string[] | undefined,
): string | null {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw?.trim() ? raw : null;
}

function buildMapRouteParams(options: {
  view: MapScreenViewMode;
  selectedLocationId: string | null;
}) {
  return {
    view: options.view,
    selected: options.selectedLocationId ?? '',
  };
}

export default function MapScreen() {
  const params = useLocalSearchParams<{
    view?: string;
    selected?: string;
  }>();
  const { width } = useWindowDimensions();

  const {
    isLoading,
    isRefreshing,
    locations,
    error,
    refresh,
  } = useLocations();
  const { homeLocationId } = useHomeLocation(locations);

  const [viewMode, setViewMode] = useState<MapScreenViewMode>(() =>
    parseViewMode(params.view),
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<LocationSortMode>('brightest');
  const [filterMode, setFilterMode] =
    useState<LocationFilterMode>('brightest');
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    () => parseSelectedLocationId(params.selected),
  );

  const routeSyncSource = useRef<'local' | 'external'>('external');

  const syncMapRoute = useCallback(
    (next: {
      view: MapScreenViewMode;
      selectedLocationId: string | null;
    }) => {
      routeSyncSource.current = 'local';
      router.setParams(buildMapRouteParams(next));
    },
    [],
  );

  useEffect(() => {
    if (routeSyncSource.current === 'local') {
      routeSyncSource.current = 'external';
      return;
    }

    if (params.view) {
      setViewMode(parseViewMode(params.view));
    }

    if (params.selected !== undefined) {
      setSelectedLocationId(parseSelectedLocationId(params.selected));
    }
  }, [params.view, params.selected]);

  const visibleLocations = useMemo(
    () =>
      prepareLocationResults(locations, {
        query: searchQuery,
        sortMode,
        filterMode,
      }),
    [locations, searchQuery, sortMode, filterMode],
  );

  const selectedLocation = useMemo(
    () =>
      visibleLocations.find((location) => location.id === selectedLocationId) ??
      locations.find((location) => location.id === selectedLocationId) ??
      null,
    [locations, selectedLocationId, visibleLocations],
  );

  const mapLayout = width >= 900 ? 'desktop' : 'mobile';

  useEffect(() => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) {
      return;
    }

    const match = findStrongSearchMatch(visibleLocations, trimmedQuery);
    if (match && match.id !== selectedLocationId) {
      setSelectedLocationId(match.id);
      syncMapRoute({ view: viewMode, selectedLocationId: match.id });
    }
  }, [searchQuery, selectedLocationId, syncMapRoute, viewMode, visibleLocations]);

  function handleViewModeChange(nextMode: MapScreenViewMode) {
    setViewMode(nextMode);
    syncMapRoute({ view: nextMode, selectedLocationId });
  }

  function handleSelectLocation(locationId: string) {
    setSelectedLocationId(locationId);
    syncMapRoute({ view: viewMode, selectedLocationId: locationId });
  }

  function handleClearSelection() {
    setSelectedLocationId(null);
    syncMapRoute({ view: viewMode, selectedLocationId: null });
  }

  function handleOpenLocationDetail(locationId: string) {
    handleSelectLocation(locationId);
    router.push(`/location/${locationId}`);
  }

  function handleListSelectLocation(locationId: string) {
    if (selectedLocationId === locationId) {
      handleOpenLocationDetail(locationId);
      return;
    }

    handleSelectLocation(locationId);
  }

  const mapSummaryText =
    isLoading && visibleLocations.length === 0
      ? 'Checking…'
      : `${visibleLocations.length}`;

  return (
    <View style={styles.root}>
      <View style={styles.glowTop} />
      <View style={styles.vignette} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.headerTopRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Go back"
                onPress={() => router.back()}
                style={({ pressed }) => [
                  styles.backButton,
                  pressed && styles.backButtonPressed,
                ]}>
                <Text style={styles.backLabel}>Back</Text>
              </Pressable>

              <MapViewModeToggle
                mode={viewMode}
                onModeChange={handleViewModeChange}
              />
            </View>

            <View style={styles.titleBlock}>
              <Text style={styles.eyebrow}>Karl around the Bay</Text>
              <Text style={styles.title}>Find Brightest Spot</Text>
              <Text style={styles.subtitle}>
                {viewMode === 'map'
                  ? 'Explore live conditions on the map, then open a location for the full Karl read.'
                  : 'Search live locations and compare clear skies, temperature, and fog conditions.'}
              </Text>
            </View>
          </View>

          <View style={styles.searchBarWrap}>
            <LocationSearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              isDisabled={isLoading && locations.length === 0}
            />
          </View>

          {viewMode === 'list' ? (
            <LocationResultsList
              locations={visibleLocations}
              isLoading={isLoading}
              isRefreshing={isRefreshing}
              error={error}
              searchQuery={searchQuery}
              sortMode={sortMode}
              filterMode={filterMode}
              selectedLocationId={selectedLocationId}
              homeLocationId={homeLocationId}
              onSelectLocation={handleListSelectLocation}
              onSortModeChange={setSortMode}
              onFilterModeChange={setFilterMode}
              onRefresh={refresh}
            />
          ) : (
            <View style={styles.mapPane}>
              <KarlMap
                locations={visibleLocations}
                selectedLocationId={selectedLocationId}
                onSelectLocation={handleSelectLocation}
                isLoading={isLoading}
                error={error}
                layout={mapLayout}
                searchQuery={searchQuery}
              />

              <View
                style={[
                  styles.mapControlsTop,
                  mapLayout === 'desktop' && styles.mapControlsTopDesktop,
                ]}>
                <View style={styles.mapControlsRow}>
                  <MapControlChip
                    label="Brightest"
                    isActive={sortMode === 'brightest'}
                    onPress={() => setSortMode('brightest')}
                  />
                  <MapControlChip
                    label="Warmest"
                    isActive={sortMode === 'temperature'}
                    onPress={() => setSortMode('temperature')}
                  />
                  <MapControlChip
                    label="A–Z"
                    isActive={sortMode === 'name'}
                    onPress={() => setSortMode('name')}
                  />
                  <View style={styles.mapControlsDivider} />
                  <MapControlChip
                    label="Bright"
                    isActive={filterMode === 'brightest'}
                    onPress={() => setFilterMode('brightest')}
                  />
                  <MapControlChip
                    label="All"
                    isActive={filterMode === 'all'}
                    onPress={() => setFilterMode('all')}
                  />
                </View>
                <Text style={styles.mapSummary}>
                  {mapSummaryText} on map
                  {error && visibleLocations.length > 0 ? ' · cached' : ''}
                </Text>
              </View>

              <View
                style={[
                  styles.mapPreviewBottom,
                  mapLayout === 'desktop' && styles.mapPreviewBottomDesktop,
                ]}>
                <SelectedLocationPreview
                  location={selectedLocation}
                  isSelected={selectedLocationId !== null}
                  isHomeLocation={
                    Boolean(selectedLocationId) &&
                    Boolean(homeLocationId) &&
                    homeLocationId?.trim().toLowerCase() ===
                      selectedLocationId?.trim().toLowerCase()
                  }
                  onDismiss={handleClearSelection}
                  onOpenDetail={handleOpenLocationDetail}
                />
              </View>
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

type MapControlChipProps = {
  label: string;
  isActive: boolean;
  onPress: () => void;
};

function MapControlChip({ label, isActive, onPress }: MapControlChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        isActive && styles.chipActive,
        pressed && styles.chipPressed,
      ]}>
      <Text style={[styles.chipLabel, isActive && styles.chipLabelActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.navy,
  },
  glowTop: {
    position: 'absolute',
    top: -100,
    left: '8%',
    right: '8%',
    height: 240,
    borderRadius: 200,
    backgroundColor: Colors.goldDeep,
    opacity: 0.18,
  },
  vignette: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.16)',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    minHeight: 0,
  },
  header: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    gap: Spacing.md,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  backButton: {
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: Colors.glassBackground,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  backButtonPressed: {
    opacity: 0.86,
  },
  backLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  titleBlock: {
    gap: Spacing.xs,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: Colors.gold,
  },
  title: {
    fontFamily: Fonts?.serif,
    fontSize: 28,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    color: Colors.textSecondary,
    maxWidth: '95%',
  },
  searchBarWrap: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    zIndex: 2,
  },
  mapPane: {
    flex: 1,
    minHeight: 0,
    position: 'relative',
  },
  mapControlsTop: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.lg,
    right: Spacing.lg,
    zIndex: 3,
    gap: 4,
    pointerEvents: 'box-none',
  },
  mapControlsTopDesktop: {
    left: 'auto',
    right: Spacing.lg,
    maxWidth: 420,
    alignItems: 'flex-end',
  },
  mapControlsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: 'rgba(3, 11, 20, 0.78)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    pointerEvents: 'auto',
  },
  mapControlsDivider: {
    width: 1,
    height: 16,
    backgroundColor: Colors.glassBorder,
    marginHorizontal: 2,
  },
  mapSummary: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
    color: Colors.textMuted,
    textAlign: 'right',
    pointerEvents: 'none',
  },
  mapPreviewBottom: {
    position: 'absolute',
    left: Spacing.lg,
    right: Spacing.lg,
    bottom: Spacing.lg,
    zIndex: 3,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
    pointerEvents: 'box-none',
  },
  mapPreviewBottomDesktop: {
    left: 'auto',
    right: Spacing.lg,
    width: 340,
    maxWidth: '34%',
  },
  chip: {
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  chipActive: {
    borderColor: 'rgba(242, 163, 38, 0.4)',
    backgroundColor: 'rgba(242, 163, 38, 0.12)',
  },
  chipPressed: {
    opacity: 0.86,
  },
  chipLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  chipLabelActive: {
    color: Colors.gold,
  },
});
