import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import maplibregl from 'maplibre-gl';
import type { Map as MapLibreMap, Marker as MapLibreMarker } from 'maplibre-gl';

import { KarlMapOverlayState } from '@/components/KarlMap/KarlMapOverlayState';
import type { KarlMapProps } from '@/components/KarlMap/KarlMap.types';
import {
  BAY_AREA_CENTER,
  BAY_AREA_DEFAULT_BOUNDS,
  BAY_AREA_LOCATION_ZOOM,
  BAY_AREA_MAP_STYLE_URL,
  BAY_AREA_MAX_BOUNDS,
} from '@/lib/map/mapConfig';
import {
  getMarkerAccessibilityLabel,
  getMarkerVisualState,
} from '@/lib/map/markerAppearance';
import { Colors } from '@/constants/theme';

import 'maplibre-gl/dist/maplibre-gl.css';
import '@/components/KarlMap/karl-map.web.css';

function createMarkerElement(
  location: KarlMapProps['locations'][number],
  isSelected: boolean,
  showLocationLabel: boolean,
  onSelect: (locationId: string) => void,
): HTMLButtonElement {
  const visual = getMarkerVisualState(location, isSelected);
  const button = document.createElement('button');
  button.type = 'button';
  button.className = [
    'karl-universal-map-marker',
    `karl-universal-map-marker--${visual.intensity}`,
    isSelected ? 'is-selected' : '',
    showLocationLabel ? 'has-label' : '',
  ]
    .filter(Boolean)
    .join(' ');
  button.style.setProperty('--marker-fill', visual.fillColor);
  button.style.setProperty('--marker-border', visual.borderColor);
  button.style.setProperty('--marker-scale', String(visual.scale));
  button.dataset.locationId = location.id;
  button.setAttribute(
    'aria-label',
    getMarkerAccessibilityLabel(location, isSelected),
  );
  button.setAttribute('aria-pressed', isSelected ? 'true' : 'false');

  const dot = document.createElement('span');
  dot.className = 'karl-universal-map-marker__dot';
  button.append(dot);

  if (showLocationLabel) {
    const label = document.createElement('span');
    label.className = 'karl-universal-map-marker__label';
    label.textContent = location.name;
    label.setAttribute('aria-hidden', 'true');
    button.append(label);
  }

  button.addEventListener('click', (event) => {
    event.stopPropagation();
    onSelect(location.id);
  });

  return button;
}

function fitBayAreaBounds(map: MapLibreMap) {
  map.fitBounds(BAY_AREA_DEFAULT_BOUNDS, {
    padding: 36,
    duration: 0,
    maxZoom: 10.2,
  });
}

export default function KarlMap({
  locations,
  selectedLocationId,
  onSelectLocation,
  isLoading = false,
  error = null,
  layout = 'mobile',
  showLocationLabels,
  searchQuery = '',
}: KarlMapProps) {
  const containerRef = useRef<View>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Map<string, MapLibreMarker>>(new Map());
  const onSelectRef = useRef(onSelectLocation);

  onSelectRef.current = onSelectLocation;

  const shouldShowLabels =
    showLocationLabels ?? layout === 'desktop';

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

      map = new maplibregl.Map({
        container: host,
        style: BAY_AREA_MAP_STYLE_URL,
        center: [BAY_AREA_CENTER.longitude, BAY_AREA_CENTER.latitude],
        zoom: 8,
        maxBounds: BAY_AREA_MAX_BOUNDS,
        attributionControl: { compact: true },
      });

      map.addControl(
        new maplibregl.NavigationControl({ showCompass: false }),
        'top-right',
      );

      map.on('load', () => {
        if (cancelled || !map) {
          return;
        }

        fitBayAreaBounds(map);
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
    };
  }, []);

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
      const existing = markersRef.current.get(location.id);

      if (existing) {
        existing.remove();
        markersRef.current.delete(location.id);
      }

      const marker = new maplibregl.Marker({
        element: createMarkerElement(
          location,
          isSelected,
          shouldShowLabels,
          (locationId) => onSelectRef.current(locationId),
        ),
        anchor: shouldShowLabels ? 'center' : 'center',
        offset: shouldShowLabels ? [0, -11] : [0, 0],
      })
        .setLngLat([location.longitude, location.latitude])
        .addTo(map);

      markersRef.current.set(location.id, marker);
    }
  }, [locations, selectedLocationId, shouldShowLabels]);

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
    <View style={styles.container}>
      <View ref={containerRef} style={styles.mapHost} collapsable={false} />

      {overlayMessage ? (
        <KarlMapOverlayState
          message={overlayMessage}
          isLoading={isLoading && locations.length === 0}
        />
      ) : null}
    </View>
  );
}

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
});
