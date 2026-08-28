import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { KarlMap } from '@/components/KarlMap';
import type { KarlMapHandle } from '@/components/KarlMap/KarlMap.types';
import { LocationResultsList } from '@/components/LocationResultsList';
import {
  LocationSearchBar,
  LocationSearchIconButton,
} from '@/components/LocationSearchBar';
import { MapBestRightNowTray } from '@/components/MapBestRightNowTray';
import { MapConditionsPanel } from '@/components/map/MapConditionsPanel';
import { MapFogLegend } from '@/components/map/MapFogLegend';
import { MapLayerControls } from '@/components/map/MapLayerControls';
import { MapPhonePortraitControls } from '@/components/map/MapPhonePortraitControls';
import { MapPhonePortraitFogRail } from '@/components/map/MapPhonePortraitFogRail';
import { MapPhonePortraitFloatingControls } from '@/components/map/MapPhonePortraitFloatingControls';
import {
  MapViewModeToggle,
  type MapScreenViewMode,
} from '@/components/MapViewModeToggle';
import { SelectedLocationPreview } from '@/components/SelectedLocationPreview';
import { Colors, MaxContentWidth, Spacing } from '@/constants/theme';
import { useHomeLocation } from '@/hooks/useHomeLocation';
import { useLocations } from '@/hooks/useLocations';
import { usePhonePortrait } from '@/hooks/usePhonePortrait';
import { useIsNighttime } from '@/hooks/useIsNighttime';
import {
  type FogIntensity,
} from '@whereskarl/domain';
import {
  findStrongSearchMatch,
  prepareLocationResults,
  prepareMapLocationResults,
  toggleConditionFilter,
  type LocationFilterMode,
  type LocationSortMode,
} from '@/lib/map/locationsDisplay';
import {
  mapLayoutModeForProfile,
  resolveMapScreenLayoutProfile,
} from '@/lib/map/mapLayout';
import {
  parseMapSelectedLocationId,
  parseMapViewMode,
} from '@/lib/map/mapRouteParams';
import { getBestRightNowMapItems } from '@/lib/map/mapPanelDisplay';
import { filterLocationsForPhonePortraitSfComposition } from '@/lib/map/phonePortraitMapPresentation';
import {
  toggleRegionFilter,
  type BayAreaVisibleProductRegionId,
} from '@/lib/map/regions';
import type { KarlMapStyleId } from '@/lib/map/styles';
import { useClearSkiesNav } from '@/providers/ClearSkiesNavProvider';

export default function MapScreen() {
  const params = useLocalSearchParams<{
    view?: string;
    selected?: string;
    location?: string;
  }>();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isPhonePortrait = usePhonePortrait();
  const isNighttime = useIsNighttime();
  const mapRef = useRef<KarlMapHandle>(null);
  const { setClearSkiesNav } = useClearSkiesNav();

  const {
    isLoading,
    isRefreshing,
    locations,
    error,
    refresh,
  } = useLocations();
  const { homeLocationId } = useHomeLocation(locations);

  const layoutProfile = resolveMapScreenLayoutProfile(width, isPhonePortrait, {
    platformOS: Platform.OS,
    height,
  });
  const mapLayout = mapLayoutModeForProfile(layoutProfile);
  const isDesktop = layoutProfile === 'desktop';
  const isPhone = layoutProfile === 'phone';
  // Phone Map uses the same map-first presentation on native and web.
  const isPhonePortraitMap = isPhone;

  const showListMode = parseMapViewMode(params.view) === 'list';

  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<LocationSortMode>('brightest');
  const [filterMode, setFilterMode] =
    useState<LocationFilterMode>('brightest');
  // Approved phone-portrait layout opens on the SF region tab.
  const [selectedRegionId, setSelectedRegionId] =
    useState<BayAreaVisibleProductRegionId | null>(() =>
      isPhonePortraitMap ? 'san-francisco' : null,
    );
  const [conditionFilter, setConditionFilter] = useState<FogIntensity | null>(
    null,
  );
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    () => parseMapSelectedLocationId(params),
  );
  const [mapStyle, setMapStyle] = useState<KarlMapStyleId>('hybrid');
  const [fogLayerEnabled, setFogLayerEnabled] = useState(true);
  const [isLayersPanelOpen, setIsLayersPanelOpen] = useState(false);
  /** Phone sheet dismiss latch — matches mobile Web BRN auto-select behavior. */
  const sheetDismissedRef = useRef(false);

  const routeSyncSource = useRef<'local' | 'external'>('external');

  useEffect(() => {
    if (!__DEV__) {
      return;
    }

    console.log('[Phase22 Universal Map]', {
      layoutProfile,
      isPhone,
      isPhonePortraitMap,
      width,
      height,
      platform: Platform.OS,
      chrome:
        isPhone
          ? 'MapPhonePortraitControls (search + chips)'
          : isDesktop
            ? 'MapConditionsPanel desktop'
            : 'MapConditionsPanel tablet',
    });
  }, [
    height,
    isDesktop,
    isPhone,
    isPhonePortraitMap,
    layoutProfile,
    width,
  ]);

  const syncMapRoute = useCallback(
    (
      nextSelectedLocationId: string | null,
      viewMode: MapScreenViewMode = showListMode ? 'list' : 'map',
    ) => {
      routeSyncSource.current = 'local';
      router.setParams({
        selected: nextSelectedLocationId ?? '',
        view: viewMode,
      });
    },
    [showListMode],
  );

  useEffect(() => {
    if (routeSyncSource.current === 'local') {
      routeSyncSource.current = 'external';
      return;
    }

    if (params.selected !== undefined || params.location !== undefined) {
      setSelectedLocationId(parseMapSelectedLocationId(params));
    }
  }, [params.location, params.selected]);

  const markerLocations = useMemo(() => {
    // Phone SF tab keeps the approved Marin/central Bay composition: plot
    // every monitored location inside the approved bounds instead of
    // narrowing to backend SF-region locations only.
    if (isPhonePortraitMap && selectedRegionId === 'san-francisco') {
      return filterLocationsForPhonePortraitSfComposition(
        prepareMapLocationResults(locations, {
          query: searchQuery,
          regionId: null,
          conditionFilter: null,
        }),
      );
    }

    return prepareMapLocationResults(locations, {
      query: searchQuery,
      regionId: selectedRegionId,
      conditionFilter: null,
    });
  }, [isPhonePortraitMap, locations, searchQuery, selectedRegionId]);

  const listLocations = useMemo(
    () =>
      prepareLocationResults(locations, {
        query: searchQuery,
        sortMode,
        filterMode,
      }),
    [locations, searchQuery, sortMode, filterMode],
  );

  const bestRightNowItems = useMemo(
    () =>
      getBestRightNowMapItems(
        prepareMapLocationResults(locations, {
          query: searchQuery,
          regionId: selectedRegionId,
          conditionFilter: null,
        }),
        4,
        selectedLocationId,
      ),
    [locations, searchQuery, selectedRegionId, selectedLocationId],
  );

  useEffect(() => {
    setClearSkiesNav({
      locationId: bestRightNowItems[0]?.locationId ?? null,
      isLoading: isLoading && locations.length === 0,
    });
  }, [bestRightNowItems, isLoading, locations.length, setClearSkiesNav]);

  // Phone map: auto-select Best Right Now into the bottom sheet (mobile Web parity).
  useEffect(() => {
    if (!isPhone || showListMode || sheetDismissedRef.current) {
      return;
    }

    if (selectedLocationId || locations.length === 0) {
      return;
    }

    const bestLocation = [...locations].sort(
      (left, right) => right.sunshineScore - left.sunshineScore,
    )[0];

    if (!bestLocation) {
      return;
    }

    setSelectedLocationId(bestLocation.id);
    syncMapRoute(bestLocation.id);
  }, [
    isPhone,
    locations,
    selectedLocationId,
    showListMode,
    syncMapRoute,
  ]);

  const selectedLocation = useMemo(
    () =>
      // Prefer the full locations payload so canonical imageUrl/focalPoint are
      // never dropped by map marker result shaping.
      locations.find((location) => location.id === selectedLocationId) ??
      markerLocations.find((location) => location.id === selectedLocationId) ??
      null,
    [locations, markerLocations, selectedLocationId],
  );

  useEffect(() => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery || showListMode) {
      return;
    }

    const match = findStrongSearchMatch(markerLocations, trimmedQuery);
    if (match && match.id !== selectedLocationId) {
      setSelectedLocationId(match.id);
      syncMapRoute(match.id);
    }
  }, [markerLocations, searchQuery, selectedLocationId, showListMode, syncMapRoute]);

  function handleSelectLocation(locationId: string) {
    sheetDismissedRef.current = false;
    setSelectedLocationId(locationId);
    syncMapRoute(locationId);
  }

  function handleClearSelection() {
    if (isPhone) {
      sheetDismissedRef.current = true;
    }
    setSelectedLocationId(null);
    setSearchQuery('');
    syncMapRoute(null);
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

    setSearchQuery('');
    setSelectedLocationId(locationId);
    // Selection from search list focuses the map with that canonical id.
    syncMapRoute(locationId, 'map');
  }

  function handleViewModeChange(mode: MapScreenViewMode) {
    syncMapRoute(selectedLocationId, mode);
  }

  function handleOpenSearch() {
    syncMapRoute(selectedLocationId, 'list');
  }

  function handlePhoneSearchSelect(locationId: string) {
    sheetDismissedRef.current = false;
    setSelectedLocationId(locationId);
    syncMapRoute(locationId);
  }

  function handleSelectRegion(regionId: BayAreaVisibleProductRegionId) {
    const nextRegionId = toggleRegionFilter(selectedRegionId, regionId);
    setSelectedRegionId(nextRegionId);

    if (isPhone) {
      if (nextRegionId) {
        mapRef.current?.fitToRegion(nextRegionId);
      } else {
        mapRef.current?.resetView();
      }
    }
  }

  function handleSelectCondition(condition: FogIntensity) {
    setConditionFilter((current) => toggleConditionFilter(current, condition));
  }

  const isHomeSelected =
    Boolean(selectedLocationId) &&
    Boolean(homeLocationId) &&
    homeLocationId?.trim().toLowerCase() ===
      selectedLocationId?.trim().toLowerCase();

  // Phone map always shows a selected-location sheet: explicit selection, or
  // the current Best Right Now spot (mobile Web product hierarchy).
  const featuredPhoneLocation = useMemo(() => {
    if (selectedLocation) {
      return selectedLocation;
    }

    const topLocationId = bestRightNowItems[0]?.locationId;
    if (!topLocationId) {
      return null;
    }

    return locations.find((location) => location.id === topLocationId) ?? null;
  }, [bestRightNowItems, locations, selectedLocation]);

  const phonePreview = isPhone && featuredPhoneLocation ? (
    <SelectedLocationPreview
      location={featuredPhoneLocation}
      isSelected={selectedLocationId !== null}
      isHomeLocation={isHomeSelected}
      onDismiss={selectedLocationId ? handleClearSelection : undefined}
      onOpenDetail={handleOpenLocationDetail}
      variant="compact"
      phonePortrait
    />
  ) : null;

  const selectedPreview = selectedLocation ? (
    <SelectedLocationPreview
      location={selectedLocation}
      isSelected={selectedLocationId !== null}
      isHomeLocation={isHomeSelected}
      onDismiss={handleClearSelection}
      onOpenDetail={handleOpenLocationDetail}
      variant={isPhone ? 'compact' : 'card'}
    />
  ) : null;

  const layerControls = (
    <MapLayerControls
      mapStyle={mapStyle}
      fogLayerEnabled={fogLayerEnabled}
      onMapStyleChange={setMapStyle}
      onFogLayerChange={setFogLayerEnabled}
      onZoomIn={() => mapRef.current?.zoomIn()}
      onZoomOut={() => mapRef.current?.zoomOut()}
      onResetView={() => mapRef.current?.resetView()}
      onLocateMe={() => mapRef.current?.locateMe()}
      layout={isDesktop ? 'desktop' : isPhone ? 'compact' : 'immersive'}
      isPanelOpen={isLayersPanelOpen}
      onPanelOpenChange={setIsLayersPanelOpen}
    />
  );

  if (showListMode) {
    return (
      <View style={styles.root}>
        <View style={styles.glowTop} />
        <View style={styles.vignette} />
        <View style={[styles.listContent, { paddingTop: insets.top + Spacing.md }]}>
          <View style={styles.listHeader}>
            <View style={styles.listHeaderRow}>
              <Text style={styles.listTitle}>Find Brightest Spot</Text>
              <MapViewModeToggle
                mode="list"
                onModeChange={handleViewModeChange}
                compact
              />
            </View>
            <Text style={styles.listSubtitle}>
              Search live locations and compare clear skies, temperature, and fog
              conditions.
            </Text>
          </View>

          <LocationSearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            isDisabled={isLoading && locations.length === 0}
          />

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
        </View>
      </View>
    );
  }

  const bottomInset = Math.max(insets.bottom, Spacing.sm);
  const desktopHeaderOffset = 88;

  return (
    <View
      style={styles.root}
      testID="universal-map-screen"
      accessibilityLabel="Where's Karl Universal Map">
      <View
        style={[
          styles.mapGradientTop,
          isPhone && styles.mapGradientTopMobile,
        ]}
        pointerEvents="none"
      />

      <KarlMap
        ref={mapRef}
        locations={markerLocations}
        selectedLocationId={selectedLocationId}
        onSelectLocation={handleSelectLocation}
        isLoading={isLoading}
        error={error}
        layout={mapLayout}
        showLocationLabels={isPhone}
        phonePortraitWeb={isPhonePortraitMap}
        searchQuery={searchQuery}
        mapStyle={mapStyle}
        fogLayerEnabled={fogLayerEnabled}
        intensityFilter={conditionFilter}
        isNighttime={isPhone ? isNighttime : false}
        useConditionSvgIcons={isPhone}
      />

      <View style={styles.overlayRoot} pointerEvents="box-none">
        {isDesktop ? (
          <>
            <View
              style={[
                styles.desktopTopLeft,
                { top: desktopHeaderOffset + insets.top },
              ]}
              pointerEvents="box-none">
              <View style={styles.searchEntryRow}>
                <LocationSearchIconButton onPress={handleOpenSearch} />
              </View>
              <MapConditionsPanel
                locations={locations}
                isLoading={isLoading}
                selectedRegionId={selectedRegionId}
                onSelectRegion={handleSelectRegion}
              />
            </View>

            <View
              style={[
                styles.desktopRight,
                { top: desktopHeaderOffset + insets.top },
              ]}
              pointerEvents="box-none">
              {layerControls}
            </View>

            {bestRightNowItems.length > 0 ? (
              <View
                style={[
                  styles.desktopBottomLeft,
                  { bottom: bottomInset + (selectedLocation ? 132 : 12) },
                ]}
                pointerEvents="box-none">
                <MapBestRightNowTray
                  items={bestRightNowItems}
                  selectedLocationId={selectedLocationId}
                  onSelectLocation={handleSelectLocation}
                  isLoading={isLoading && locations.length === 0}
                  variant="desktop"
                />
              </View>
            ) : null}

            {selectedLocation ? (
              <View
                style={[
                  styles.desktopBottomWide,
                  { paddingBottom: bottomInset + Spacing.sm },
                ]}
                pointerEvents="box-none">
                {selectedPreview}
              </View>
            ) : null}
          </>
        ) : isPhone ? (
          <>
            <View
              style={[
                styles.phoneTopControls,
                {
                  top: insets.top + 8,
                  paddingHorizontal: Spacing.sm,
                },
              ]}
              pointerEvents="box-none">
              <MapPhonePortraitControls
                selectedRegionId={selectedRegionId}
                onSelectRegion={handleSelectRegion}
                locations={locations}
                onSelectLocation={handlePhoneSearchSelect}
                onClearSelectedLocation={handleClearSelection}
                isSearchDisabled={isLoading && locations.length === 0}
              />
            </View>

            <View
              style={[
                styles.phoneFogRail,
                { top: insets.top + 96 },
              ]}
              pointerEvents="box-none">
              <MapPhonePortraitFogRail
                activeIntensity={conditionFilter}
                onSelectIntensity={handleSelectCondition}
              />
            </View>

            <View
              style={[
                styles.phoneFloatingControls,
                { top: insets.top + 96 },
              ]}
              pointerEvents="box-none">
              {!isLayersPanelOpen ? (
                <MapPhonePortraitFloatingControls
                  onOpenLayers={() => setIsLayersPanelOpen(true)}
                />
              ) : (
                <View style={styles.phoneLayersPopover} pointerEvents="box-none">
                  {layerControls}
                </View>
              )}
            </View>

            <View
              style={[
                styles.phoneBottom,
                { bottom: bottomInset + 64 },
              ]}
              pointerEvents="box-none">
              {phonePreview}
            </View>
          </>
        ) : (
          <>
            {!isLayersPanelOpen ? (
              <View
                style={[
                  styles.tabletTopLeft,
                  { top: insets.top + Spacing.md },
                ]}
                pointerEvents="box-none">
                <View style={styles.searchEntryRow}>
                  <LocationSearchIconButton onPress={handleOpenSearch} />
                </View>
                <MapConditionsPanel
                  locations={locations}
                  isLoading={isLoading}
                  selectedRegionId={selectedRegionId}
                  onSelectRegion={handleSelectRegion}
                  compact
                />
                <MapFogLegend
                  layout="desktop-stack"
                  activeIntensity={conditionFilter}
                  onSelectIntensity={handleSelectCondition}
                />
              </View>
            ) : null}

            <View
              style={[
                styles.tabletLayers,
                { top: insets.top + Spacing.md },
              ]}
              pointerEvents="box-none">
              {layerControls}
            </View>

            <View
              style={[
                styles.tabletBottom,
                { bottom: bottomInset + 72 },
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
              {selectedPreview}
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.navy,
    minHeight: 0,
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
  mapGradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    zIndex: 2,
    backgroundColor: 'rgba(3, 11, 20, 0.42)',
  },
  mapGradientTopMobile: {
    height: 56,
    backgroundColor: 'rgba(3, 11, 20, 0.18)',
  },
  overlayRoot: {
    ...StyleSheet.absoluteFill,
    zIndex: 4,
  },
  desktopTopLeft: {
    position: 'absolute',
    left: Spacing.lg,
    maxWidth: 320,
  },
  desktopRight: {
    position: 'absolute',
    right: Spacing.lg,
    alignItems: 'flex-end',
  },
  desktopBottomLeft: {
    position: 'absolute',
    left: Spacing.lg,
    maxWidth: 380,
  },
  desktopBottomWide: {
    position: 'absolute',
    left: Spacing.lg,
    right: Spacing.lg,
    bottom: 0,
    alignItems: 'stretch',
  },
  phoneTopControls: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'stretch',
  },
  phoneFogRail: {
    position: 'absolute',
    left: Spacing.sm,
  },
  phoneLayers: {
    position: 'absolute',
    left: Spacing.sm,
    right: Spacing.sm,
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
  },
  phoneLayersPopover: {
    width: 272,
    maxWidth: '100%',
    alignItems: 'stretch',
  },
  phoneFloatingControls: {
    position: 'absolute',
    right: Spacing.sm,
    alignItems: 'flex-end',
    gap: 8,
  },
  phoneBottom: {
    position: 'absolute',
    left: Spacing.sm,
    right: Spacing.sm,
    gap: 8,
    alignItems: 'stretch',
  },
  tabletTopLeft: {
    position: 'absolute',
    left: Spacing.md,
    gap: Spacing.sm,
    maxWidth: 280,
  },
  tabletLayers: {
    position: 'absolute',
    right: Spacing.md,
    alignItems: 'flex-end',
  },
  tabletBottom: {
    position: 'absolute',
    left: Spacing.md,
    right: Spacing.md,
    gap: Spacing.sm,
  },
  listContent: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  listHeader: {
    gap: Spacing.xs,
  },
  listHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  listTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  listSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  searchEntryRow: {
    alignSelf: 'flex-start',
    marginBottom: Spacing.sm,
  },
});
