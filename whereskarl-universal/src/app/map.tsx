import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
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

const SORT_CHIP_OPTIONS: { id: LocationSortMode; label: string }[] = [
  { id: 'brightest', label: 'Brightest' },
  { id: 'temperature', label: 'Warmest' },
  { id: 'name', label: 'A–Z' },
];

const FILTER_CHIP_OPTIONS: { id: LocationFilterMode; label: string }[] = [
  { id: 'brightest', label: 'Bright' },
  { id: 'all', label: 'All' },
];

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
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    () => parseSelectedLocationId(params.selected),
  );
  const [isMobileSearchExpanded, setIsMobileSearchExpanded] = useState(false);
  const [areMobileMapFiltersExpanded, setAreMobileMapFiltersExpanded] =
    useState(false);

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
  const isMobileMap = viewMode === 'map' && mapLayout === 'mobile';

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
      setAreMobileMapFiltersExpanded(false);
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

  function toggleMobileSearch() {
    setIsMobileSearchExpanded((current) => {
      const next = !current;
      if (!next && searchQuery.trim()) {
        setSearchQuery('');
      }
      return next;
    });
  }

  const mapSummaryText =
    isLoading && visibleLocations.length === 0
      ? 'Checking…'
      : `${visibleLocations.length}`;

  const activeSortLabel =
    SORT_CHIP_OPTIONS.find((option) => option.id === sortMode)?.label ??
    'Sort';
  const activeFilterLabel =
    FILTER_CHIP_OPTIONS.find((option) => option.id === filterMode)?.label ??
    'Filter';

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
      variant={isMobileMap ? 'sheet' : 'card'}
    />
  );

  return (
    <View style={styles.root}>
      <View style={styles.glowTop} />
      <View style={styles.vignette} />

      <SafeAreaView
        style={styles.safeArea}
        edges={isMobileMap ? [] : ['top', 'bottom']}>
        <View style={styles.content}>
          {viewMode === 'map' && mapLayout === 'desktop' ? (
            <View style={styles.mapHeader}>
              <View style={styles.mapHeaderRow}>
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

                <Text style={styles.mapHeaderTitle} numberOfLines={1}>
                  Find Brightest Spot
                </Text>

                <MapViewModeToggle
                  mode={viewMode}
                  onModeChange={handleViewModeChange}
                />
              </View>

              <LocationSearchBar
                value={searchQuery}
                onChangeText={setSearchQuery}
                isDisabled={isLoading && locations.length === 0}
                compact
                placeholder="Search locations"
              />
            </View>
          ) : viewMode === 'list' ? (
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
            </>
          ) : null}

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
          ) : isMobileMap ? (
            <View style={styles.mapPaneFull}>
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

                <View style={styles.mobileMapFiltersWrap} pointerEvents="box-none">
                  {areMobileMapFiltersExpanded ? (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.mobileMapFiltersScroll}
                      keyboardShouldPersistTaps="handled">
                      {SORT_CHIP_OPTIONS.map((option) => (
                        <MapControlChip
                          key={option.id}
                          label={option.label}
                          isActive={sortMode === option.id}
                          onPress={() => setSortMode(option.id)}
                          compact
                        />
                      ))}
                      <View style={styles.mapControlsDivider} />
                      {FILTER_CHIP_OPTIONS.map((option) => (
                        <MapControlChip
                          key={option.id}
                          label={option.label}
                          isActive={filterMode === option.id}
                          onPress={() => setFilterMode(option.id)}
                          compact
                        />
                      ))}
                    </ScrollView>
                  ) : (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Expand sort and filter controls"
                      accessibilityState={{
                        expanded: areMobileMapFiltersExpanded,
                      }}
                      onPress={() => setAreMobileMapFiltersExpanded(true)}
                      style={({ pressed }) => [
                        styles.mobileMapFiltersSummary,
                        pressed && styles.chipPressed,
                      ]}>
                      <Text style={styles.mobileMapFiltersSummaryLabel}>
                        {activeSortLabel} · {activeFilterLabel}
                      </Text>
                      <Text style={styles.mobileMapFiltersSummaryMeta}>
                        {mapSummaryText} on map
                        {error && visibleLocations.length > 0 ? ' · cached' : ''}
                      </Text>
                    </Pressable>
                  )}

                  {areMobileMapFiltersExpanded ? (
                    <View style={styles.mobileMapFiltersFooter}>
                      <Text style={styles.mapSummary}>
                        {mapSummaryText} on map
                        {error && visibleLocations.length > 0 ? ' · cached' : ''}
                      </Text>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Collapse sort and filter controls"
                        onPress={() => setAreMobileMapFiltersExpanded(false)}
                        style={({ pressed }) => [
                          styles.mobileMapFiltersCollapse,
                          pressed && styles.chipPressed,
                        ]}>
                        <Text style={styles.mobileMapFiltersCollapseLabel}>
                          Done
                        </Text>
                      </Pressable>
                    </View>
                  ) : null}
                </View>
              </View>

              {selectedLocation ? (
                <View
                  style={[
                    styles.mobileMapBottomSheet,
                    { paddingBottom: Math.max(insets.bottom, Spacing.sm) },
                  ]}
                  pointerEvents="box-none">
                  {selectedPreview}
                </View>
              ) : null}
            </View>
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
                  styles.mapControlsTopDesktop,
                ]}>
                <View style={styles.mapControlsRow}>
                  {SORT_CHIP_OPTIONS.map((option) => (
                    <MapControlChip
                      key={option.id}
                      label={option.label}
                      isActive={sortMode === option.id}
                      onPress={() => setSortMode(option.id)}
                    />
                  ))}
                  <View style={styles.mapControlsDivider} />
                  {FILTER_CHIP_OPTIONS.map((option) => (
                    <MapControlChip
                      key={option.id}
                      label={option.label}
                      isActive={filterMode === option.id}
                      onPress={() => setFilterMode(option.id)}
                    />
                  ))}
                </View>
                <Text style={styles.mapSummary}>
                  {mapSummaryText} on map
                  {error && visibleLocations.length > 0 ? ' · cached' : ''}
                </Text>
              </View>

              <View style={[styles.mapPreviewBottom, styles.mapPreviewBottomDesktop]}>
                {selectedPreview}
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
  compact?: boolean;
};

function MapControlChip({
  label,
  isActive,
  onPress,
  compact = false,
}: MapControlChipProps) {
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
  mapHeader: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xs,
    gap: Spacing.xs,
    zIndex: 2,
  },
  mapHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  mapHeaderTitle: {
    flex: 1,
    fontFamily: Fonts?.serif,
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
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
  mapPane: {
    flex: 1,
    minHeight: 0,
    position: 'relative',
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
    paddingHorizontal: Spacing.sm,
    gap: Spacing.xs,
  },
  mobileMapTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: 'rgba(3, 11, 20, 0.82)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    pointerEvents: 'auto',
  },
  mobileMapTopBarCenter: {
    flex: 1,
    alignItems: 'center',
    minWidth: 0,
  },
  mobileMapFiltersWrap: {
    gap: 4,
    pointerEvents: 'box-none',
  },
  mobileMapFiltersScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: 'rgba(3, 11, 20, 0.78)',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  mobileMapFiltersSummary: {
    alignSelf: 'flex-start',
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: 'rgba(3, 11, 20, 0.78)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    gap: 2,
    pointerEvents: 'auto',
  },
  mobileMapFiltersSummaryLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  mobileMapFiltersSummaryMeta: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  mobileMapFiltersFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    paddingHorizontal: 4,
    pointerEvents: 'box-none',
  },
  mobileMapFiltersCollapse: {
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: Colors.glassBackground,
    paddingHorizontal: 10,
    paddingVertical: 4,
    pointerEvents: 'auto',
  },
  mobileMapFiltersCollapseLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  mobileMapBottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 4,
    pointerEvents: 'box-none',
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
  chipCompact: {
    paddingHorizontal: 7,
    paddingVertical: 3,
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
  chipLabelCompact: {
    fontSize: 10,
  },
  chipLabelActive: {
    color: Colors.gold,
  },
});
