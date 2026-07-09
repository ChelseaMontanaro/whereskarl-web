import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import { StyleSheet, View } from 'react-native';
import maplibregl from 'maplibre-gl';
import type { Map as MapLibreMap, Marker as MapLibreMarker } from 'maplibre-gl';

import { KarlMapOverlayState } from '@/components/KarlMap/KarlMapOverlayState';
import type { KarlMapHandle, KarlMapProps } from '@/components/KarlMap/KarlMap.types';
import { Colors } from '@/constants/theme';
import { syncFogOverlayLayer } from '@/lib/map/fogOverlays';
import { locationMatchesFogIntensityFilter } from '@/lib/map/locationsDisplay';
import {
  CLEAR_SUN_COLOR,
  getMarkerAccessibilityLabel,
  getMarkerVisualState,
  getScoreBadgeColor,
} from '@/lib/map/markerAppearance';
import { getMarkerIconMarkup } from '@/lib/map/markerIcons';
import { getPhonePortraitMarkerIconMarkup } from '@/lib/map/phonePortraitConditionIcons';
import {
  BAY_AREA_CENTER,
  BAY_AREA_LOCATION_ZOOM,
  BAY_AREA_MAX_BOUNDS,
  BAY_AREA_MOBILE_CENTER,
  getMapBoundsForLayout,
  getMapDefaultMaxZoomForLayout,
  getMapViewportPaddingForLayout,
  normalizeViewportPadding,
  PHONE_PORTRAIT_MAP_CENTER,
  PHONE_PORTRAIT_MAP_INITIAL_ZOOM,
  type KarlMapLayoutMode,
} from '@/lib/map/mapConfig';
import {
  findBayAreaProductRegion,
  resolveRegionViewportFitOptions,
  type BayAreaVisibleProductRegionId,
} from '@/lib/map/regions';
import {
  getPhonePortraitMarkerMapOffset,
  getPhonePortraitMarkerOffset,
  getPhonePortraitMarkerPriority,
  PHONE_PORTRAIT_LOW_ZOOM_HIDDEN_LOCATION_IDS,
  PHONE_PORTRAIT_LOW_ZOOM_HIDE_THRESHOLD,
  PHONE_PORTRAIT_MARKER_COLLISION_X,
  PHONE_PORTRAIT_MARKER_COLLISION_Y,
} from '@/lib/map/phonePortraitMapPresentation';
import { resolveKarlMapStyle } from '@/lib/map/styles';

import 'maplibre-gl/dist/maplibre-gl.css';
import '@/components/KarlMap/karl-map.web.css';
import '@/components/map/phone-portrait-map.web.css';

type ViewportOptions = {
  phonePortraitWeb?: boolean;
  duration?: number;
};

function createMarkerElement(
  location: KarlMapProps['locations'][number],
  isSelected: boolean,
  layout: KarlMapLayoutMode,
  showLocationLabel: boolean,
  isFilteredOut: boolean,
  isNighttime: boolean,
  phonePortraitWeb: boolean,
  onSelect: (locationId: string) => void,
): HTMLDivElement {
  const visual = getMarkerVisualState(location, isSelected);
  const score = Math.round(location.sunshineScore);
  const scoreColor = getScoreBadgeColor(score);
  const isPortable = layout === 'mobile' && !phonePortraitWeb;
  const isPhonePortrait = phonePortraitWeb;

  const root = document.createElement('div');
  root.className = [
    'karl-universal-map-marker-root',
    showLocationLabel ? 'has-label' : '',
    isPortable ? 'is-portable' : '',
    isPhonePortrait ? 'is-phone-portrait' : '',
    isSelected ? 'is-selected' : '',
  ]
    .filter(Boolean)
    .join(' ');
  root.dataset.locationId = location.id;

  const button = document.createElement('button');
  button.type = 'button';
  button.className = [
    'karl-universal-map-marker',
    `karl-universal-map-marker--${visual.intensity}`,
    isPortable ? 'karl-universal-map-marker--portable' : '',
    isPhonePortrait ? 'karl-universal-map-marker--phone-portrait' : '',
    isSelected ? 'is-selected' : '',
    isFilteredOut ? 'is-filtered-out' : '',
  ]
    .filter(Boolean)
    .join(' ');
  button.style.setProperty('--marker-fill', visual.fillColor);
  button.style.setProperty('--marker-border', visual.borderColor);
  button.style.setProperty(
    '--marker-scale',
    String(isPhonePortrait ? (isSelected ? 1.06 : 1) : visual.scale),
  );
  button.style.setProperty(
    '--score-color',
    isPortable || isPhonePortrait ? CLEAR_SUN_COLOR : scoreColor,
  );
  if (visual.intensity === 'clear') {
    button.style.setProperty('--clear-sun-color', CLEAR_SUN_COLOR);
  }
  button.dataset.locationId = location.id;
  button.setAttribute(
    'aria-label',
    getMarkerAccessibilityLabel(location, isSelected),
  );
  button.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
  button.innerHTML = isPhonePortrait
    ? getPhonePortraitMarkerIconMarkup(visual.intensity)
    : getMarkerIconMarkup(visual.intensity, { isNighttime });

  const scoreBadge = document.createElement('span');
  scoreBadge.className = 'karl-universal-map-marker__score';
  scoreBadge.textContent = String(score);
  scoreBadge.setAttribute('aria-hidden', 'true');

  button.addEventListener('click', (event) => {
    event.stopPropagation();
    onSelect(location.id);
  });

  root.append(button);

  if (showLocationLabel) {
    const label = document.createElement('span');
    label.className = 'karl-universal-map-marker__label';
    label.textContent = location.name;
    label.setAttribute('aria-hidden', 'true');
    root.append(label);
  }

  root.append(scoreBadge);

  return root;
}

/**
 * Single source of truth for the default camera. Phone-portrait web uses the
 * fixed approved Marin-centered composition (center + zoom); other layouts
 * fit their configured bounds.
 */
function fitMapViewport(
  map: MapLibreMap,
  layout: KarlMapLayoutMode,
  options?: ViewportOptions,
) {
  if (options?.phonePortraitWeb) {
    const camera = {
      center: [
        PHONE_PORTRAIT_MAP_CENTER.longitude,
        PHONE_PORTRAIT_MAP_CENTER.latitude,
      ] as [number, number],
      zoom: PHONE_PORTRAIT_MAP_INITIAL_ZOOM,
    };
    const duration = options?.duration ?? 0;

    if (duration > 0) {
      map.easeTo({ ...camera, duration, essential: true });
    } else {
      map.jumpTo(camera);
    }

    return;
  }

  const viewportOptions = { phonePortraitWeb: options?.phonePortraitWeb };

  map.fitBounds(getMapBoundsForLayout(layout, viewportOptions), {
    padding: normalizeViewportPadding(
      getMapViewportPaddingForLayout(layout, viewportOptions),
    ),
    duration: options?.duration ?? 0,
    maxZoom: getMapDefaultMaxZoomForLayout(layout, viewportOptions),
  });
}

type DeclutterEntry = {
  locationId: string;
  element: HTMLElement;
  longitude: number;
  latitude: number;
  offset: [number, number];
  priority: number;
  score: number;
  isSelected: boolean;
};

/**
 * Phone-portrait presentation pass: hide markers whose footprint collides
 * with a higher-priority marker so the composition stays readable. Approved
 * SF-composition locations and the selected marker always win.
 */
function declutterPhonePortraitMarkers(
  map: MapLibreMap,
  entries: DeclutterEntry[],
) {
  const placed: Array<{ x: number; y: number }> = [];
  const ordered = [...entries].sort((a, b) => {
    if (a.isSelected !== b.isSelected) {
      return a.isSelected ? -1 : 1;
    }
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    return b.score - a.score;
  });

  const zoom = map.getZoom();

  for (const entry of ordered) {
    if (
      !entry.isSelected &&
      zoom < PHONE_PORTRAIT_LOW_ZOOM_HIDE_THRESHOLD &&
      PHONE_PORTRAIT_LOW_ZOOM_HIDDEN_LOCATION_IDS.has(entry.locationId)
    ) {
      entry.element.style.display = 'none';
      continue;
    }

    const projected = map.project([entry.longitude, entry.latitude]);
    const x = projected.x + entry.offset[0];
    const y = projected.y + entry.offset[1];

    const collides = placed.some(
      (other) =>
        Math.abs(other.x - x) < PHONE_PORTRAIT_MARKER_COLLISION_X &&
        Math.abs(other.y - y) < PHONE_PORTRAIT_MARKER_COLLISION_Y,
    );

    if (collides && !entry.isSelected) {
      entry.element.style.display = 'none';
    } else {
      entry.element.style.display = '';
      placed.push({ x, y });
    }
  }
}

function fitMapToProductRegion(
  map: MapLibreMap,
  regionId: BayAreaVisibleProductRegionId,
  layout: KarlMapLayoutMode,
  options?: ViewportOptions,
) {
  if (options?.phonePortraitWeb && regionId === 'san-francisco') {
    fitMapViewport(map, layout, options);
    return;
  }

  const region = findBayAreaProductRegion(regionId);
  if (!region) {
    return;
  }

  const fitOptions = resolveRegionViewportFitOptions(region, layout, {
    phonePortraitWeb: options?.phonePortraitWeb,
  });
  map.fitBounds(region.bounds, {
    padding: normalizeViewportPadding(fitOptions.padding),
    maxZoom: fitOptions.maxZoom,
    duration: options?.duration ?? 450,
    essential: true,
  });
}

const KarlMapWeb = forwardRef<KarlMapHandle, KarlMapProps>(function KarlMapWeb(
  {
    locations,
    selectedLocationId,
    onSelectLocation,
    isLoading = false,
    error = null,
    layout = 'mobile',
    showLocationLabels,
    searchQuery = '',
    mapStyle = 'hybrid',
    fogLayerEnabled = true,
    intensityFilter = null,
    isNighttime = false,
    phonePortraitWeb = false,
  },
  ref,
) {
  const containerRef = useRef<View>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Map<string, MapLibreMarker>>(new Map());
  const onSelectRef = useRef(onSelectLocation);
  const layoutRef = useRef(layout);
  const phonePortraitWebRef = useRef(phonePortraitWeb);
  const mapReadyRef = useRef(false);

  onSelectRef.current = onSelectLocation;
  layoutRef.current = layout;
  phonePortraitWebRef.current = phonePortraitWeb;

  const shouldShowLabels = showLocationLabels ?? layout === 'desktop';

  useImperativeHandle(ref, () => ({
    zoomIn: () => {
      mapRef.current?.zoomIn({ duration: 250 });
    },
    zoomOut: () => {
      mapRef.current?.zoomOut({ duration: 250 });
    },
    resetView: () => {
      const map = mapRef.current;
      if (!map) {
        return;
      }

      fitMapViewport(map, layoutRef.current, {
        phonePortraitWeb: phonePortraitWebRef.current,
        duration: 450,
      });
    },
    fitToRegion: (regionId) => {
      const map = mapRef.current;
      if (!map) {
        return;
      }

      fitMapToProductRegion(map, regionId, layoutRef.current, {
        phonePortraitWeb: phonePortraitWebRef.current,
      });
    },
    locateMe: () => {
      if (!navigator.geolocation || !mapRef.current) {
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          mapRef.current?.flyTo({
            center: [position.coords.longitude, position.coords.latitude],
            zoom: BAY_AREA_LOCATION_ZOOM,
            duration: 450,
            essential: true,
          });
        },
        () => undefined,
        { enableHighAccuracy: true, timeout: 10000 },
      );
    },
  }));

  useEffect(() => {
    const host = containerRef.current as unknown as HTMLDivElement | null;
    if (!host || mapRef.current) {
      return;
    }

    let cancelled = false;
    let resizeObserver: ResizeObserver | null = null;
    let map: MapLibreMap | null = null;

    function ensureHostSize(target: HTMLDivElement) {
      target.style.width = '100%';
      target.style.height = '100%';
      target.style.minHeight = '100%';
      target.style.position = 'relative';
    }

    function initMap() {
      if (cancelled || mapRef.current || !host) {
        return;
      }

      ensureHostSize(host);

      if (host.clientHeight < 120) {
        requestAnimationFrame(initMap);
        return;
      }

      const initialLayout = layoutRef.current;
      const isPhonePortrait = phonePortraitWebRef.current;
      const initialCenter = isPhonePortrait
        ? PHONE_PORTRAIT_MAP_CENTER
        : initialLayout === 'mobile'
          ? BAY_AREA_MOBILE_CENTER
          : BAY_AREA_CENTER;

      map = new maplibregl.Map({
        container: host,
        style: resolveKarlMapStyle(mapStyle, { phonePortraitWeb: isPhonePortrait }),
        center: [initialCenter.longitude, initialCenter.latitude],
        zoom: isPhonePortrait
          ? PHONE_PORTRAIT_MAP_INITIAL_ZOOM
          : initialLayout === 'mobile'
            ? 10.2
            : 8,
        maxBounds: BAY_AREA_MAX_BOUNDS,
        attributionControl: { compact: true },
      });

      map.on('load', () => {
        if (cancelled || !map) {
          return;
        }

        mapReadyRef.current = true;
        fitMapViewport(map, initialLayout, {
          phonePortraitWeb: isPhonePortrait,
        });
        // Approved phone-portrait design has no fog polygon overlays.
        syncFogOverlayLayer(
          map,
          locations,
          fogLayerEnabled && !isPhonePortrait,
          intensityFilter,
        );
        map.resize();
      });

      mapRef.current = map;

      const resizeMap = () => {
        if (!host) {
          return;
        }

        ensureHostSize(host);
        map?.resize();
      };

      resizeObserver = new ResizeObserver(() => {
        resizeMap();
      });
      resizeObserver.observe(host);
      requestAnimationFrame(resizeMap);
    }

    initMap();

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current.clear();
      map?.remove();
      mapRef.current = null;
      mapReadyRef.current = false;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReadyRef.current) {
      return;
    }

    const styleSpec = resolveKarlMapStyle(mapStyle, {
      phonePortraitWeb: phonePortraitWebRef.current,
    });
    map.setStyle(styleSpec);

    map.once('style.load', () => {
      if (!mapRef.current) {
        return;
      }

      fitMapViewport(mapRef.current, layout, {
        phonePortraitWeb: phonePortraitWebRef.current,
      });
      syncFogOverlayLayer(
        mapRef.current,
        locations,
        fogLayerEnabled && !phonePortraitWebRef.current,
        intensityFilter,
      );
    });
  }, [mapStyle]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReadyRef.current) {
      return;
    }

    const refit = () =>
      fitMapViewport(map, layout, {
        phonePortraitWeb: phonePortraitWebRef.current,
      });

    if (map.isStyleLoaded()) {
      refit();
      return;
    }

    map.once('load', refit);
  }, [layout, phonePortraitWeb]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReadyRef.current) {
      return;
    }

    syncFogOverlayLayer(
      map,
      locations,
      fogLayerEnabled && !phonePortraitWeb,
      intensityFilter,
    );
  }, [fogLayerEnabled, intensityFilter, locations, phonePortraitWeb]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    const nextIds = new Set(locations.map((location) => location.id));

    markersRef.current.forEach((marker, locationId) => {
      if (!nextIds.has(locationId)) {
        marker.remove();
        markersRef.current.delete(locationId);
      }
    });

    for (const location of locations) {
      const isSelected = selectedLocationId === location.id;
      const isFilteredOut = intensityFilter
        ? !locationMatchesFogIntensityFilter(location, intensityFilter)
        : false;
      const existing = markersRef.current.get(location.id);

      if (existing) {
        existing.remove();
        markersRef.current.delete(location.id);
      }

      const baseOffset = phonePortraitWeb
        ? getPhonePortraitMarkerMapOffset(shouldShowLabels)
        : shouldShowLabels
          ? layout === 'mobile'
            ? [0, -30]
            : [0, -16]
          : [0, -4];
      const placementOffset = phonePortraitWeb
        ? ([
            baseOffset[0] + getPhonePortraitMarkerOffset(location.id)[0],
            baseOffset[1] + getPhonePortraitMarkerOffset(location.id)[1],
          ] as [number, number])
        : (baseOffset as [number, number]);

      const marker = new maplibregl.Marker({
        element: createMarkerElement(
          location,
          isSelected,
          layout,
          shouldShowLabels,
          isFilteredOut,
          isNighttime,
          phonePortraitWeb,
          (locationId) => onSelectRef.current(locationId),
        ),
        anchor: 'center',
        offset: placementOffset,
      })
        .setLngLat([location.longitude, location.latitude])
        .addTo(map);

      markersRef.current.set(location.id, marker);
    }

    if (!phonePortraitWeb) {
      return;
    }

    const entries: DeclutterEntry[] = locations.flatMap((location) => {
      const marker = markersRef.current.get(location.id);
      if (!marker) {
        return [];
      }

      return [
        {
          locationId: location.id,
          element: marker.getElement(),
          longitude: location.longitude,
          latitude: location.latitude,
          offset: getPhonePortraitMarkerOffset(location.id),
          priority: getPhonePortraitMarkerPriority(location.id),
          score: location.sunshineScore,
          isSelected: selectedLocationId === location.id,
        },
      ];
    });

    const runDeclutter = () => declutterPhonePortraitMarkers(map, entries);

    runDeclutter();
    map.on('moveend', runDeclutter);

    return () => {
      map.off('moveend', runDeclutter);
    };
  }, [
    intensityFilter,
    isNighttime,
    layout,
    locations,
    phonePortraitWeb,
    selectedLocationId,
    shouldShowLabels,
  ]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedLocationId) {
      return;
    }

    const selected = locations.find(
      (location) => location.id === selectedLocationId,
    );
    if (!selected) {
      return;
    }

    map.flyTo({
      center: [selected.longitude, selected.latitude],
      zoom: BAY_AREA_LOCATION_ZOOM,
      duration: 450,
      essential: true,
    });
  }, [locations, selectedLocationId]);

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

  return (
    <View
      style={styles.container}
      className={phonePortraitWeb ? 'karl-map-phone-portrait-host' : undefined}>
      <View ref={containerRef} style={styles.mapHost} collapsable={false} />

      {phonePortraitWeb ? (
        <View
          className="karl-map-phone-portrait-vignette"
          style={styles.vignette}
          pointerEvents="none"
        />
      ) : null}

      {overlayMessage ? (
        <KarlMapOverlayState
          message={overlayMessage}
          isLoading={isLoading && locations.length === 0}
        />
      ) : null}
    </View>
  );
});

export default KarlMapWeb;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
    backgroundColor: Colors.navy,
    position: 'relative',
  },
  mapHost: {
    flex: 1,
    width: '100%',
    height: '100%',
    minHeight: 0,
  },
  vignette: {
    ...StyleSheet.absoluteFill,
    zIndex: 1,
  },
});
