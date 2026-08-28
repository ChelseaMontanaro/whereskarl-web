import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';

import { KarlMapMarkerView } from '@/components/KarlMap/KarlMapMarkerView';
import { KarlMapOverlayState } from '@/components/KarlMap/KarlMapOverlayState';
import type { KarlMapHandle, KarlMapProps } from '@/components/KarlMap/KarlMap.types';
import { Colors } from '@/constants/theme';
import {
  locationMatchesFogIntensityFilter,
} from '@whereskarl/domain';
import { getMarkerAccessibilityLabel } from '@/lib/map/markerAppearance';
import {
  boundsToRegion,
  getMapBoundsForLayout,
  getMapViewportPaddingForLayout,
  normalizeViewportPadding,
  PHONE_PORTRAIT_MAP_CENTER,
} from '@/lib/map/mapConfig';
import {
  PHONE_PORTRAIT_APPLE_LEGAL_LABEL_INSETS,
  PHONE_PORTRAIT_APPLE_LOGO_INSETS,
  resolvePhonePortraitVisibleMetaIds,
} from '@/lib/map/phonePortraitMapPresentation';
import {
  findBayAreaProductRegion,
  resolveRegionViewportFitOptions,
  type BayAreaVisibleProductRegionId,
} from '@/lib/map/regions';
import type { KarlMapStyleId } from '@/lib/map/styles';

function nativeMapTypeForStyle(
  mapStyle: KarlMapStyleId,
): 'mutedStandard' | 'satellite' | 'hybrid' {
  if (mapStyle === 'satellite' || mapStyle === 'hybrid') {
    return 'satellite';
  }

  return 'mutedStandard';
}

function KarlMapMarker({
  location,
  isSelected,
  layout,
  showMarkerMeta,
  showLocationLabel,
  isFilteredOut,
  isNighttime,
  useSvgIcons,
  onSelect,
}: {
  location: KarlMapProps['locations'][number];
  isSelected: boolean;
  layout: KarlMapProps['layout'];
  showMarkerMeta?: boolean;
  showLocationLabel: boolean;
  isFilteredOut: boolean;
  isNighttime: boolean;
  useSvgIcons: boolean;
  onSelect: (locationId: string) => void;
}) {
  const hasMeta =
    showMarkerMeta !== undefined ? showMarkerMeta : showLocationLabel;

  return (
    <Marker
      identifier={location.id}
      coordinate={{
        latitude: location.latitude,
        longitude: location.longitude,
      }}
      onPress={() => onSelect(location.id)}
      accessibilityLabel={getMarkerAccessibilityLabel(location, isSelected)}
      anchor={hasMeta ? { x: 0.5, y: 0.42 } : { x: 0.5, y: 0.92 }}
      opacity={isFilteredOut ? 0.35 : 1}
      tracksViewChanges={false}>
      <KarlMapMarkerView
        location={location}
        isSelected={isSelected}
        showMarkerMeta={showMarkerMeta}
        showLocationLabel={showLocationLabel}
        size={layout === 'mobile' ? 'compact' : 'regular'}
        isNighttime={isNighttime}
        useSvgIcons={useSvgIcons}
      />
    </Marker>
  );
}

const KarlMapNative = forwardRef<KarlMapHandle, KarlMapProps>(function KarlMapNative(
  {
    locations,
    selectedLocationId,
    onSelectLocation,
    isLoading = false,
    error = null,
    layout = 'mobile',
    showLocationLabels,
    searchQuery = '',
    mapStyle = 'standard',
    intensityFilter = null,
    isNighttime = false,
    useConditionSvgIcons = false,
    phonePortraitWeb = false,
  },
  ref,
) {
  const mapRef = useRef<MapView>(null);
  const viewportOptions = useMemo(
    () => ({ phonePortraitWeb }),
    [phonePortraitWeb],
  );
  const initialRegion = useMemo(() => {
    const boundsRegion = boundsToRegion(
      getMapBoundsForLayout(layout ?? 'mobile', viewportOptions),
    );

    if (!phonePortraitWeb) {
      return boundsRegion;
    }

    return {
      ...boundsRegion,
      latitude: PHONE_PORTRAIT_MAP_CENTER.latitude,
      longitude: PHONE_PORTRAIT_MAP_CENTER.longitude,
    };
  }, [layout, phonePortraitWeb, viewportOptions]);
  const padding = normalizeViewportPadding(
    getMapViewportPaddingForLayout(layout ?? 'mobile', viewportOptions),
  );

  useImperativeHandle(ref, () => ({
    zoomIn: () => undefined,
    zoomOut: () => undefined,
    resetView: () => {
      mapRef.current?.animateToRegion(initialRegion, 350);
    },
    fitToRegion: (regionId: BayAreaVisibleProductRegionId) => {
      const region = findBayAreaProductRegion(regionId);
      if (!region || !mapRef.current) {
        return;
      }

      const fitOptions = resolveRegionViewportFitOptions(
        region,
        layout ?? 'mobile',
        viewportOptions,
      );
      const resolvedPadding = normalizeViewportPadding(fitOptions.padding);
      const edgePadding =
        typeof resolvedPadding === 'number'
          ? {
              top: resolvedPadding,
              right: resolvedPadding,
              bottom: resolvedPadding,
              left: resolvedPadding,
            }
          : resolvedPadding;
      const [[west, south], [east, north]] = region.bounds;

      mapRef.current.fitToCoordinates(
        [
          { latitude: south, longitude: west },
          { latitude: north, longitude: east },
        ],
        {
          edgePadding,
          animated: true,
        },
      );
    },
    locateMe: () => undefined,
  }));

  useEffect(() => {
    if (!selectedLocationId || !mapRef.current) {
      return;
    }

    const selected = locations.find((location) => location.id === selectedLocationId);
    if (!selected) {
      return;
    }

    mapRef.current.animateToRegion(
      {
        // Bias center south so the selected marker stays above the bottom sheet.
        latitude:
          layout === 'mobile'
            ? selected.latitude - (phonePortraitWeb ? 0.028 : 0.035)
            : selected.latitude,
        longitude: selected.longitude,
        latitudeDelta: layout === 'mobile' ? (phonePortraitWeb ? 0.14 : 0.18) : 0.22,
        longitudeDelta: layout === 'mobile' ? (phonePortraitWeb ? 0.14 : 0.18) : 0.22,
      },
      350,
    );
  }, [layout, locations, phonePortraitWeb, selectedLocationId]);

  const overlayMessage = (() => {
    if (isLoading && locations.length === 0) {
      return 'Loading Bay Area locations…';
    }

    if (error && locations.length === 0) {
      return 'Live map data is unavailable right now. Check your API connection and try again.';
    }

    if (locations.length === 0 && searchQuery.trim()) {
      return `No locations match “${searchQuery.trim()}”.`;
    }

    if (locations.length === 0) {
      return 'No monitored locations are available to plot on the map.';
    }

    return null;
  })();

  const mapPadding =
    typeof padding === 'number'
      ? {
          top: padding,
          right: padding,
          bottom: padding,
          left: padding,
        }
      : padding;
  const shouldShowLabels = showLocationLabels ?? layout === 'desktop';
  const phonePortraitMetaIds = useMemo(() => {
    if (!phonePortraitWeb || !shouldShowLabels) {
      return null;
    }

    return resolvePhonePortraitVisibleMetaIds(
      locations.map((location) => ({
        id: location.id,
        latitude: location.latitude,
        longitude: location.longitude,
        sunshineScore: location.sunshineScore,
        region: location.region,
      })),
      selectedLocationId,
    );
  }, [locations, phonePortraitWeb, selectedLocationId, shouldShowLabels]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={initialRegion}
        mapType={nativeMapTypeForStyle(mapStyle)}
        userInterfaceStyle="dark"
        showsCompass={false}
        showsBuildings={false}
        showsTraffic={false}
        mapPadding={mapPadding}
        legalLabelInsets={
          phonePortraitWeb ? PHONE_PORTRAIT_APPLE_LEGAL_LABEL_INSETS : undefined
        }
        appleLogoInsets={
          phonePortraitWeb ? PHONE_PORTRAIT_APPLE_LOGO_INSETS : undefined
        }>
        {locations.map((location) => {
          const isFilteredOut = intensityFilter
            ? !locationMatchesFogIntensityFilter(location, intensityFilter)
            : false;
          const showMarkerMeta = phonePortraitMetaIds
            ? phonePortraitMetaIds.has(location.id)
            : undefined;
          const showLocationLabel = phonePortraitMetaIds
            ? false
            : shouldShowLabels;

          return (
            <KarlMapMarker
              key={location.id}
              location={location}
              isSelected={selectedLocationId === location.id}
              layout={layout}
              showMarkerMeta={showMarkerMeta}
              showLocationLabel={showLocationLabel}
              isFilteredOut={isFilteredOut}
              isNighttime={isNighttime}
              useSvgIcons={useConditionSvgIcons}
              onSelect={onSelectLocation}
            />
          );
        })}
      </MapView>

      {overlayMessage ? (
        <KarlMapOverlayState
          message={overlayMessage}
          isLoading={isLoading && locations.length === 0}
        />
      ) : null}
    </View>
  );
});

export default KarlMapNative;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: Colors.navy,
  },
  map: {
    ...StyleSheet.absoluteFill,
  },
});
