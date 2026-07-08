import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { KarlMap } from '@/components/KarlMap';
import { LocationResultsList } from '@/components/LocationResultsList';
import {
  LocationSearchBar,
  LocationSearchIconButton,
} from '@/components/LocationSearchBar';
import { MapBestRightNowTray } from '@/components/MapBestRightNowTray';
import { MapFilterPanel } from '@/components/MapFilterPanel';
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
  prepareMapLocationResults,
  toggleConditionFilter,
  type FogIntensity,
  type LocationFilterMode,
  type LocationSortMode,
} from '@/lib/map/locationsDisplay';
import {
  getBestRightNowMapItems,
} from '@/lib/map/mapPanelDisplay';
import {
  toggleRegionFilter,
  type BayAreaVisibleProductRegionId,
} from '@/lib/map/regions';

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
  const insets = useSafeAreaInsets();

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
  const [selectedRegionId, setSelectedRegionId] =
    useState<BayAreaVisibleProductRegionId | null>(null);
  const [conditionFilter, setConditionFilter] = useState<FogIntensity | null>(
    null,
  );
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    () => parseSelectedLocationId(params.selected),
  );
  const [isMobileSearchExpanded, setIsMobileSearchExpanded] = useState(false);

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

  const listLocations = useMemo(
    () =>
      prepareLocationResults(locations, {
        query: searchQuery,
        sortMode,
        filterMode,
      }),
    [locations, searchQuery, sortMode, filterMode],
  );

  const mapLocations = useMemo(
    () =>
      prepareMapLocationResults(locations, {
        query: searchQuery,
        regionId: selectedRegionId,
        conditionFilter,
      }),
    [locations, searchQuery, selectedRegionId, conditionFilter],
  );

  const bestRightNowSourceLocations = useMemo(
    () =>
      prepareMapLocationResults(locations, {
        query: searchQuery,
        regionId: selectedRegionId,
        conditionFilter: null,
      }),
    [locations, searchQuery, selectedRegionId],
  );

  const bestRightNowItems = useMemo(
    () =>
      getBestRightNowMapItems(
        bestRightNowSourceLocations,
        4,
        selectedLocationId,
      ),
    [bestRightNowSourceLocations, selectedLocationId],
  );

  const visibleLocations = viewMode === 'list' ? listLocations : mapLocations;

  const selectedLocation = useMemo(
    () =>
      visibleLocations.find((location) => location.id === selectedLocationId) ??
      locations.find((location) => location.id === selectedLocationId) ??
      null,
    [locations, selectedLocationId, visibleLocations],
  );

  const mapLayout = width >= 900 ? 'desktop' : 'mobile';
  const isMapMode = viewMode === 'map';
  const isMobileMap = isMapMode && mapLayout === 'mobile';

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

  useEffect(() => {
    if (!isMobileMap) {
      setIsMobileSearchExpanded(false);
    }
  }, [isMobileMap]);

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

  function handleSelectRegion(regionId: BayAreaVisibleProductRegionId) {
    setSelectedRegionId((current) => toggleRegionFilter(current, regionId));
  }

  function handleSelectCondition(condition: FogIntensity) {
    setConditionFilter((current) => toggleConditionFilter(current, condition));
  }

  function toggleMobileSearch() {
    setIsMobileSearchExpanded((current) => {
      const next = !current;
      if (!next && searchQuery.trim()) {
        setSearchQuery('');
      }
      return next;
    });
  }

  const showCachedHint = Boolean(error && visibleLocations.length > 0);

  const isHomeSelected =
    Boolean(selectedLocationId) &&
    Boolean(homeLocationId) &&
    homeLocationId?.trim().toLowerCase() ===
      selectedLocationId?.trim().toLowerCase();

  const selectedPreview = (
    <SelectedLocationPreview
      location={selectedLocation}
      isSelected={selectedLocationId !== null}
      isHomeLocation={isHomeSelected}
      onDismiss={handleClearSelection}
      onOpenDetail={handleOpenLocationDetail}
      variant={isMobileMap ? 'compact' : 'card'}
    />
  );

  const filterPanel = (
    <MapFilterPanel
      locations={locations}
      isLoading={isLoading}
      locationCount={mapLocations.length}
      selectedRegionId={selectedRegionId}
      onSelectRegion={handleSelectRegion}
      conditionFilter={conditionFilter}
      onSelectCondition={handleSelectCondition}
      variant={isMobileMap ? 'mobile' : 'desktop'}
      showCachedHint={showCachedHint}
    />
  );

  return (
    <View style={styles.root}>
      {!isMobileMap ? <View style={styles.glowTop} /> : null}
      {!isMobileMap ? <View style={styles.vignette} /> : null}

      <SafeAreaView
        style={styles.safeArea}
        edges={isMapMode ? [] : ['top', 'bottom']}>
        <View style={styles.content}>
          {viewMode === 'list' ? (
            <>
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
                    Search live locations and compare clear skies, temperature,
                    and fog conditions.
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

              <LocationResultsList
                locations={listLocations}
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
            </>
          ) : isMobileMap ? (
            <View style={styles.mapPaneFull}>
              <KarlMap
                locations={mapLocations}
                selectedLocationId={selectedLocationId}
                onSelectLocation={handleSelectLocation}
                isLoading={isLoading}
                error={error}
                layout={mapLayout}
                searchQuery={searchQuery}
              />

              <View
                style={[
                  styles.mobileMapOverlayTop,
                  { paddingTop: insets.top + Spacing.xs },
                ]}
                pointerEvents="box-none">
                <View style={styles.mobileMapTopBar}>
                  {isMobileSearchExpanded ? (
                    <>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Close search"
                        onPress={toggleMobileSearch}
                        style={({ pressed }) => [
                          styles.backButton,
                          styles.backButtonCompact,
                          pressed && styles.backButtonPressed,
                        ]}>
                        <Text style={styles.backLabel}>Back</Text>
                      </Pressable>

                      <LocationSearchBar
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        isDisabled={isLoading && locations.length === 0}
                        compact
                        inline
                        placeholder="Search locations"
                      />
                    </>
                  ) : (
                    <>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Go back"
                        onPress={() => router.back()}
                        style={({ pressed }) => [
                          styles.backButton,
                          styles.backButtonCompact,
                          pressed && styles.backButtonPressed,
                        ]}>
                        <Text style={styles.backLabel}>Back</Text>
                      </Pressable>

                      <View style={styles.mobileMapTopBarCenter}>
                        <MapViewModeToggle
                          mode={viewMode}
                          onModeChange={handleViewModeChange}
                          compact
                        />
                      </View>

                      <LocationSearchIconButton
                        onPress={toggleMobileSearch}
                        isActive={Boolean(searchQuery.trim())}
                      />
                    </>
                  )}
                </View>

                {filterPanel}
              </View>

              {bestRightNowItems.length > 0 || selectedLocation ? (
                <View
                  style={[
                    styles.mobileMapBottomStack,
                    { bottom: Math.max(insets.bottom, Spacing.sm) + Spacing.sm },
                  ]}
                  pointerEvents="box-none">
                  {bestRightNowItems.length > 0 ? (
                    <MapBestRightNowTray
                      items={bestRightNowItems}
                      selectedLocationId={selectedLocationId}
                      onSelectLocation={handleSelectLocation}
                      isLoading={isLoading && locations.length === 0}
                      variant="mobile"
                    />
                  ) : null}
                  {selectedLocation ? selectedPreview : null}
                </View>
              ) : null}
            </View>
          ) : (
            <View style={styles.mapPaneFull}>
              <KarlMap
                locations={mapLocations}
                selectedLocationId={selectedLocationId}
                onSelectLocation={handleSelectLocation}
                isLoading={isLoading}
                error={error}
                layout={mapLayout}
                searchQuery={searchQuery}
              />

              <View
                style={[
                  styles.desktopMapOverlayLeft,
                  { paddingTop: insets.top + Spacing.md },
                ]}
                pointerEvents="box-none">
                <View style={styles.desktopMapNavRow}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Go back"
                    onPress={() => router.back()}
                    style={({ pressed }) => [
                      styles.backButton,
                      styles.backButtonCompact,
                      pressed && styles.backButtonPressed,
                    ]}>
                    <Text style={styles.backLabel}>Back</Text>
                  </Pressable>

                  <MapViewModeToggle
                    mode={viewMode}
                    onModeChange={handleViewModeChange}
                    compact
                  />
                </View>

                <View style={styles.desktopSearchWrap}>
                  <LocationSearchBar
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    isDisabled={isLoading && locations.length === 0}
                    compact
                    placeholder="Search locations"
                  />
                </View>

                {filterPanel}

                <MapBestRightNowTray
                  items={bestRightNowItems}
                  selectedLocationId={selectedLocationId}
                  onSelectLocation={handleSelectLocation}
                  isLoading={isLoading && locations.length === 0}
                  variant="desktop"
                />
              </View>

              {selectedLocation ? (
                <View
                  style={[
                    styles.desktopMapPreviewBottom,
                    { paddingBottom: Math.max(insets.bottom, Spacing.lg) },
                  ]}
                  pointerEvents="box-none">
                  <View style={styles.desktopMapPreviewInner}>
                    {selectedPreview}
                  </View>
                </View>
              ) : null}
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
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
  backButtonCompact: {
    paddingHorizontal: 10,
    paddingVertical: 5,
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
  mapPaneFull: {
    flex: 1,
    minHeight: 0,
    position: 'relative',
  },
  mobileMapOverlayTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 4,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  mobileMapTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    backgroundColor: 'rgba(3, 11, 20, 0.92)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    pointerEvents: 'auto',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 5,
  },
  mobileMapTopBarCenter: {
    flex: 1,
    alignItems: 'center',
    minWidth: 0,
  },
  mobileMapBottomStack: {
    position: 'absolute',
    left: Spacing.md,
    right: Spacing.md,
    zIndex: 5,
    gap: Spacing.sm,
    pointerEvents: 'box-none',
  },
  desktopMapOverlayLeft: {
    position: 'absolute',
    top: 0,
    left: Spacing.lg,
    zIndex: 4,
    width: 300,
    maxWidth: '34%',
    gap: Spacing.sm,
    pointerEvents: 'box-none',
  },
  desktopMapNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    pointerEvents: 'auto',
  },
  desktopSearchWrap: {
    pointerEvents: 'auto',
  },
  desktopMapPreviewBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: Spacing.lg,
    zIndex: 4,
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    pointerEvents: 'box-none',
  },
  desktopMapPreviewInner: {
    width: '100%',
    maxWidth: 448,
  },
});
