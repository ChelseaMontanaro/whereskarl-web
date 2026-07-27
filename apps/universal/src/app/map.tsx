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
import { LocationSearchBar } from '@/components/LocationSearchBar';
import { MapBestRightNowTray } from '@/components/MapBestRightNowTray';
import { MapConditionsPanel } from '@/components/map/MapConditionsPanel';
import { MapFogLegend } from '@/components/map/MapFogLegend';
import { MapLayerControls } from '@/components/map/MapLayerControls';
import { MapPhonePortraitControls } from '@/components/map/MapPhonePortraitControls';
import { MapPhonePortraitFogRail } from '@/components/map/MapPhonePortraitFogRail';
import { MapPhonePortraitFloatingControls } from '@/components/map/MapPhonePortraitFloatingControls';
import { SelectedLocationPreview } from '@/components/SelectedLocationPreview';
import { Colors, MaxContentWidth, Spacing } from '@/constants/theme';
import { useHomeLocation } from '@/hooks/useHomeLocation';
import { useLocations } from '@/hooks/useLocations';
import { usePhonePortrait } from '@/hooks/usePhonePortrait';
import { useIsNighttime } from '@/hooks/useIsNighttime';
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
  mapLayoutModeForProfile,
  resolveMapScreenLayoutProfile,
} from '@/lib/map/mapLayout';
import { getBestRightNowMapItems } from '@/lib/map/mapPanelDisplay';
import { filterLocationsForPhonePortraitSfComposition } from '@/lib/map/phonePortraitMapPresentation';
import {
  toggleRegionFilter,
  type BayAreaVisibleProductRegionId,
} from '@/lib/map/regions';
import type { KarlMapStyleId } from '@/lib/map/styles';
import { useClearSkiesNav } from '@/providers/ClearSkiesNavProvider';

function parseSelectedLocationId(
  value: string | string[] | undefined,
): string | null {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw?.trim() ? raw : null;
}

export default function MapScreen() {
  const params = useLocalSearchParams<{
    view?: string;
    selected?: string;
  }>();
  const { width } = useWindowDimensions();
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

  const layoutProfile = resolveMapScreenLayoutProfile(width, isPhonePortrait);
  const mapLayout = mapLayoutModeForProfile(layoutProfile);
  const isDesktop = layoutProfile === 'desktop';
  const isPhone = layoutProfile === 'phone';
  const isPhonePortraitWeb = isPhone && Platform.OS === 'web';

  const showListMode = params.view === 'list';

  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<LocationSortMode>('brightest');
  const [filterMode, setFilterMode] =
    useState<LocationFilterMode>('brightest');
  // Approved phone-portrait layout opens on the SF region tab.
  const [selectedRegionId, setSelectedRegionId] =
    useState<BayAreaVisibleProductRegionId | null>(() =>
      isPhonePortraitWeb ? 'san-francisco' : null,
    );
  const [conditionFilter, setConditionFilter] = useState<FogIntensity | null>(
    null,
  );
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    () => parseSelectedLocationId(params.selected),
  );
  const [mapStyle, setMapStyle] = useState<KarlMapStyleId>('hybrid');
  const [fogLayerEnabled, setFogLayerEnabled] = useState(true);
  const [isLayersPanelOpen, setIsLayersPanelOpen] = useState(false);

  const routeSyncSource = useRef<'local' | 'external'>('external');

  const syncMapRoute = useCallback((selectedLocationId: string | null) => {
    routeSyncSource.current = 'local';
    router.setParams({
      selected: selectedLocationId ?? '',
      view: showListMode ? 'list' : 'map',
    });
  }, [showListMode]);

  useEffect(() => {
    if (routeSyncSource.current === 'local') {
      routeSyncSource.current = 'external';
      return;
    }

    if (params.selected !== undefined) {
      setSelectedLocationId(parseSelectedLocationId(params.selected));
    }
  }, [params.selected]);

  const markerLocations = useMemo(() => {
    // Phone-portrait web SF tab keeps the approved Marin/central Bay
    // composition: plot every monitored location inside the approved bounds
    // instead of narrowing to backend SF-region locations only.
    if (isPhonePortraitWeb && selectedRegionId === 'san-francisco') {
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
  }, [isPhonePortraitWeb, locations, searchQuery, selectedRegionId]);

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

  const selectedLocation = useMemo(
    () =>
      markerLocations.find((location) => location.id === selectedLocationId) ??
      locations.find((location) => location.id === selectedLocationId) ??
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
    setSelectedLocationId(locationId);
    syncMapRoute(locationId);
  }

  function handleClearSelection() {
    setSelectedLocationId(null);
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

    handleSelectLocation(locationId);
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

  // Approved phone-portrait layout always shows a location card below the
  // Best Right Now tray: the explicit selection, or the current best spot.
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

  const phonePreview =
    isPhonePortraitWeb && featuredPhoneLocation ? (
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
            <Text style={styles.listTitle}>Find Brightest Spot</Text>
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
    <View style={styles.root}>
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
        phonePortraitWeb={isPhonePortraitWeb}
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
            {!isLayersPanelOpen ? (
              <>
                <View
                  style={[
                    styles.phoneTopControls,
                    {
                      top: insets.top + (isPhonePortraitWeb ? 22 : 4),
                      paddingLeft: Spacing.sm,
                      paddingRight: isPhonePortraitWeb ? Spacing.sm : 56,
                    },
                  ]}
                  pointerEvents="box-none">
                  <MapPhonePortraitControls
                    selectedRegionId={selectedRegionId}
                    onSelectRegion={handleSelectRegion}
                    isPhonePortrait={isPhonePortraitWeb}
                  />
                </View>

                <View
                  style={[
                    styles.phoneFogRail,
                    { top: insets.top + (isPhonePortraitWeb ? 112 : 64) },
                  ]}
                  pointerEvents="box-none">
                  {isPhonePortraitWeb ? (
                    <MapPhonePortraitFogRail
                      activeIntensity={conditionFilter}
                      onSelectIntensity={handleSelectCondition}
                    />
                  ) : (
                    <MapFogLegend
                      layout="phone-rail"
                      activeIntensity={conditionFilter}
                      onSelectIntensity={handleSelectCondition}
                    />
                  )}
                </View>
              </>
            ) : null}

            {!isLayersPanelOpen ? (
              <View
                style={[
                  styles.phoneFloatingControls,
                  { top: insets.top + (isPhonePortraitWeb ? 120 : 132) },
                ]}
                pointerEvents="box-none">
                <MapPhonePortraitFloatingControls
                  onOpenLayers={() => setIsLayersPanelOpen(true)}
                  onLocateMe={() => mapRef.current?.locateMe()}
                  onResetView={() => mapRef.current?.resetView()}
                />
              </View>
            ) : (
              <View
                style={[
                  styles.phoneLayers,
                  { top: insets.top + Spacing.sm },
                ]}
                pointerEvents="box-none">
                {layerControls}
              </View>
            )}

            <View
              style={[
                styles.phoneBottom,
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
                  isPhonePortrait={isPhonePortraitWeb}
                />
              ) : null}
              {isPhonePortraitWeb ? phonePreview : selectedPreview}
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
    height: 96,
    backgroundColor: 'rgba(3, 11, 20, 0.38)',
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
    alignItems: 'center',
  },
  phoneFogRail: {
    position: 'absolute',
    left: Spacing.sm,
  },
  phoneLayers: {
    position: 'absolute',
    right: Spacing.sm,
    alignItems: 'flex-end',
  },
  phoneFloatingControls: {
    position: 'absolute',
    right: Spacing.sm,
    alignItems: 'flex-end',
  },
  phoneBottom: {
    position: 'absolute',
    left: Spacing.sm,
    right: Spacing.sm,
    gap: 10,
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
  listTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  listSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
});
