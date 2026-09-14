import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, type Region } from 'react-native-maps';

import { KarlMapMarkerView } from '@/components/KarlMap/KarlMapMarkerView';
import { KarlMapOverlayState } from '@/components/KarlMap/KarlMapOverlayState';
import type { KarlMapHandle, KarlMapProps } from '@/components/KarlMap/KarlMap.types';
import { Colors } from '@/constants/theme';
import { getMarkerAccessibilityLabel } from '@/lib/map/markerAppearance';
import { filterMarkerLocationsByFogLevel } from '@/lib/map/locationsDisplay';
import {
  boundsToRegion,
  getMapBoundsForLayout,
  getMapViewportPaddingForLayout,
  normalizeViewportPadding,
  regionForCanonicalLocationZoom,
} from '@/lib/map/mapConfig';
import {
  PHONE_PORTRAIT_ALL_BAY_CAMERA,
  resolvePhonePortraitCameraPreset,
  resolvePhonePortraitIntensityFilterCamera,
  type PhonePortraitCameraPreset,
} from '@/lib/map/phonePortraitCameraPresets';
import {
  PHONE_PORTRAIT_APPLE_LEGAL_LABEL_INSETS,
  PHONE_PORTRAIT_APPLE_LOGO_INSETS,
  resolvePhonePortraitVisibleMetaIds,
  type PhonePortraitMapViewport,
} from '@/lib/map/phonePortraitMapPresentation';
import {
  findBayAreaProductRegion,
  resolveRegionViewportFitOptions,
  type BayAreaVisibleProductRegionId,
} from '@/lib/map/regions';
import type { KarlMapStyleId } from '@/lib/map/styles';

/**
 * Product map-type semantics, matched to the Apple Maps types react-native-maps
 * exposes (`MKMapType` in ios/AirMaps/RCTConvert+AirMap.m):
 *   standard  → mutedStandard (quiet road map, web `standard` parity)
 *   satellite → satellite     (imagery only, no road/place labels)
 *   hybrid    → hybrid        (imagery plus road/place labels, web `hybrid`
 *                              parity where the MapLibre style layers roads
 *                              and labels over the same imagery)
 * Collapsing hybrid onto `satellite` is what made the two options identical.
 */
function nativeMapTypeForStyle(
  mapStyle: KarlMapStyleId,
): 'mutedStandard' | 'satellite' | 'hybrid' {
  if (mapStyle === 'satellite') {
    return 'satellite';
  }

  if (mapStyle === 'hybrid') {
    return 'hybrid';
  }

  return 'mutedStandard';
}

function KarlMapMarker({
  location,
  isSelected,
  layout,
  showMarkerMeta,
  showLocationLabel,
  isNighttime,
  useSvgIcons,
  onSelect,
}: {
  location: KarlMapProps['locations'][number];
  isSelected: boolean;
  layout: KarlMapProps['layout'];
  showMarkerMeta?: boolean;
  showLocationLabel: boolean;
  isNighttime: boolean;
  useSvgIcons: boolean;
  onSelect: (locationId: string) => void;
}) {
  const hasMeta =
    showMarkerMeta !== undefined ? showMarkerMeta : showLocationLabel;
  // Phone portrait renders the icon as the marker's only in-flow content, so
  // the annotation anchors on the icon centre exactly like mobile web. `anchor`
  // is Google-Maps-only on iOS (see react-native-maps MapMarker docs), so Apple
  // Maps needs the equivalent zero `centerOffset` to stay coordinate-pinned.
  const isIconPinned = layout === 'mobile' && showMarkerMeta !== undefined;

  return (
    <Marker
      identifier={location.id}
      coordinate={{
        latitude: location.latitude,
        longitude: location.longitude,
      }}
      onPress={() => onSelect(location.id)}
      accessibilityLabel={getMarkerAccessibilityLabel(location, isSelected, {
        isNighttime,
      })}
      anchor={
        isIconPinned
          ? { x: 0.5, y: 0.5 }
          : hasMeta
            ? { x: 0.5, y: 0.42 }
            : { x: 0.5, y: 0.92 }
      }
      centerOffset={isIconPinned ? { x: 0, y: 0 } : undefined}
      zIndex={isSelected ? 1 : 0}
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
    applyLowZoomLabelHiding = true,
  },
  ref,
) {
  const mapRef = useRef<MapView>(null);
  // Rendered size + current region, so label collision can be evaluated in
  // screen space like mobile web instead of against fixed geographic deltas.
  const mapSizeRef = useRef<{ width: number; height: number } | null>(null);
  const [mapViewport, setMapViewport] =
    useState<PhonePortraitMapViewport | null>(null);
  const viewportOptions = useMemo(
    () => ({ phonePortraitWeb }),
    [phonePortraitWeb],
  );
  // Phone portrait opens on the canonical all-Bay frame (mobile-web parity:
  // clean entry never defaults to one region). Other layouts keep their
  // existing layout-derived bounds.
  const initialRegion = useMemo(() => {
    if (phonePortraitWeb) {
      return boundsToRegion(PHONE_PORTRAIT_ALL_BAY_CAMERA.bounds);
    }

    return boundsToRegion(
      getMapBoundsForLayout(layout ?? 'mobile', viewportOptions),
    );
  }, [layout, phonePortraitWeb, viewportOptions]);

  const handleMapLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (width <= 0 || height <= 0) {
      return;
    }

    mapSizeRef.current = { width, height };
    setMapViewport((current) => {
      if (current) {
        if (current.width === width && current.height === height) {
          return current;
        }

        return { ...current, width, height };
      }

      // Seed deltas from the initial region so collision is never stuck on
      // the all-Bay fallback merely because onRegionChangeComplete raced
      // ahead of onLayout (mapSizeRef was still null).
      return {
        width,
        height,
        latitudeDelta: initialRegion.latitudeDelta,
        longitudeDelta: initialRegion.longitudeDelta,
      };
    });
  }, [initialRegion.latitudeDelta, initialRegion.longitudeDelta]);

  const handleRegionChangeComplete = useCallback((region: Region) => {
    const size = mapSizeRef.current;
    if (!size || size.width <= 0 || size.height <= 0) {
      return;
    }

    setMapViewport((current) => {
      const next = {
        width: size.width,
        height: size.height,
        latitudeDelta: region.latitudeDelta,
        longitudeDelta: region.longitudeDelta,
      };

      // Only re-resolve labels when the scale actually changed; panning at a
      // fixed zoom must not churn the declutter result.
      if (
        current &&
        current.width === next.width &&
        current.height === next.height &&
        Math.abs(current.latitudeDelta - next.latitudeDelta) /
          Math.max(current.latitudeDelta, 1e-9) <
          0.02 &&
        Math.abs(current.longitudeDelta - next.longitudeDelta) /
          Math.max(current.longitudeDelta, 1e-9) <
          0.02
      ) {
        return current;
      }

      return next;
    });
  }, []);
  const padding = normalizeViewportPadding(
    getMapViewportPaddingForLayout(layout ?? 'mobile', viewportOptions),
  );

  const fitCameraPreset = useCallback(
    (preset: PhonePortraitCameraPreset, animated: boolean) => {
      const [[west, south], [east, north]] = preset.bounds;

      mapRef.current?.fitToCoordinates(
        [
          { latitude: south, longitude: west },
          { latitude: north, longitude: east },
        ],
        { edgePadding: preset.padding, animated },
      );
    },
    [],
  );

  useImperativeHandle(ref, () => ({
    zoomIn: () => undefined,
    zoomOut: () => undefined,
    resetView: () => {
      // Phone portrait resets to the canonical all-Bay frame (search clear /
      // region deselect); other layouts keep the layout-derived region.
      if (phonePortraitWeb) {
        fitCameraPreset(PHONE_PORTRAIT_ALL_BAY_CAMERA, true);
        return;
      }

      mapRef.current?.animateToRegion(initialRegion, 350);
    },
    fitToRegion: (regionId: BayAreaVisibleProductRegionId) => {
      if (!mapRef.current) {
        return;
      }

      // Phone portrait uses the canonical per-region bounds + per-region
      // padding rather than one shared padding for all five regions.
      if (phonePortraitWeb) {
        fitCameraPreset(resolvePhonePortraitCameraPreset(regionId), true);
        return;
      }

      const region = findBayAreaProductRegion(regionId);
      if (!region) {
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
    focusLocation: (latitude: number, longitude: number) => {
      // Apple Maps ignores Camera.zoom (Google Maps only). Drive the
      // canonical search zoom through animateToRegion instead.
      mapRef.current?.animateToRegion(
        regionForCanonicalLocationZoom(
          latitude,
          longitude,
          mapSizeRef.current,
        ),
        450,
      );
    },
    fitToIntensityFilter: (intensity) => {
      // Phone-portrait-only: the filter fit is part of the immersive phone
      // camera law. Other layouts keep their existing framing.
      if (!phonePortraitWeb || !mapRef.current) {
        return false;
      }

      // Same helper the rendered marker set goes through, so the frame always
      // contains exactly the markers the filter leaves on the map.
      const preset = resolvePhonePortraitIntensityFilterCamera(
        filterMarkerLocationsByFogLevel(locations, intensity),
        mapSizeRef.current,
      );

      if (!preset) {
        return false;
      }

      fitCameraPreset(preset, true);
      return true;
    },
    locateMe: () => undefined,
  }));

  // Selection-driven reframing is layout-scoped. Phone portrait must NOT move
  // the camera when `selectedLocationId` changes: marker taps, deep links, and
  // sheet dismissal all leave the camera untouched, and search selection
  // reframes explicitly through `focusLocation`. Tablet/desktop keep the
  // existing recenter-on-selection behaviour.
  useEffect(() => {
    if (phonePortraitWeb || !selectedLocationId || !mapRef.current) {
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
          layout === 'mobile' ? selected.latitude - 0.035 : selected.latitude,
        longitude: selected.longitude,
        latitudeDelta: layout === 'mobile' ? 0.18 : 0.22,
        longitudeDelta: layout === 'mobile' ? 0.18 : 0.22,
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

  // Phone portrait drives framing entirely through per-fit `edgePadding` (the
  // canonical camera presets already encode chrome clearance). A persistent
  // `mapPadding` would be added on top of every fit and double-count it — the
  // same trap mobile web avoids by zeroing transform padding before fitBounds.
  const mapPadding = phonePortraitWeb
    ? { top: 0, right: 0, bottom: 0, left: 0 }
    : typeof padding === 'number'
      ? {
          top: padding,
          right: padding,
          bottom: padding,
          left: padding,
        }
      : padding;
  const shouldShowLabels = showLocationLabels ?? layout === 'desktop';

  /**
   * Markers for the active Fog Level. Non-matching locations are absent, not
   * dimmed, so nothing from another category can bleed through.
   *
   * Decluttering has to run over this same set: label slots are awarded by
   * collision, so including filtered-out locations would let a location that is
   * no longer on the map win a slot and suppress the label of one that is.
   */
  const visibleLocations = useMemo(
    () => filterMarkerLocationsByFogLevel(locations, intensityFilter),
    [intensityFilter, locations],
  );

  const phonePortraitMetaIds = useMemo(() => {
    if (!phonePortraitWeb || !shouldShowLabels) {
      return null;
    }

    return resolvePhonePortraitVisibleMetaIds(
      visibleLocations.map((location) => ({
        id: location.id,
        latitude: location.latitude,
        longitude: location.longitude,
        sunshineScore: location.sunshineScore,
        region: location.region,
      })),
      selectedLocationId,
      {
        viewport: mapViewport,
        applyLowZoomHiding: applyLowZoomLabelHiding,
      },
    );
  }, [
    applyLowZoomLabelHiding,
    mapViewport,
    phonePortraitWeb,
    selectedLocationId,
    shouldShowLabels,
    visibleLocations,
  ]);

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
        onLayout={handleMapLayout}
        onRegionChange={handleRegionChangeComplete}
        onRegionChangeComplete={handleRegionChangeComplete}
        onMapReady={
          phonePortraitWeb
            ? () => fitCameraPreset(PHONE_PORTRAIT_ALL_BAY_CAMERA, false)
            : undefined
        }
        mapPadding={mapPadding}
        legalLabelInsets={
          phonePortraitWeb ? PHONE_PORTRAIT_APPLE_LEGAL_LABEL_INSETS : undefined
        }
        appleLogoInsets={
          phonePortraitWeb ? PHONE_PORTRAIT_APPLE_LOGO_INSETS : undefined
        }>
        {visibleLocations.map((location) => {
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
