"use client";

import { useEffect, useRef, useState } from "react";

import { MapFogLegend } from "@/components/map/MapFogLegend";
import { MapLayerControls } from "@/components/map/MapLayerControls";
import {
  BAY_AREA_CENTER,
  BAY_AREA_MAX_BOUNDS,
  findBayAreaProductRegion,
} from "@/lib/map/config";
import { syncFogOverlayLayer } from "@/lib/map/fogOverlays";
import {
  createMapMarkerElement,
  type MapMarkerLocation,
} from "@/lib/map/markers";
import { resolveKarlMapStyle, type KarlMapStyleId } from "@/lib/map/styles";
import {
  fitDefaultBayAreaViewport,
  fitMapToBounds,
  focusMapOnLocation,
} from "@/lib/map/viewport";

type BayAreaMapProps = {
  locations: MapMarkerLocation[];
  selectedLocationId: string | null;
  selectedRegionId: string | null;
  onSelectLocation: (locationId: string) => void;
  mapStyle: KarlMapStyleId;
  fogLayerEnabled: boolean;
  onMapStyleChange: (styleId: KarlMapStyleId) => void;
  onFogLayerChange: (enabled: boolean) => void;
  isLoading?: boolean;
};

export function BayAreaMap({
  locations,
  selectedLocationId,
  selectedRegionId,
  onSelectLocation,
  mapStyle,
  fogLayerEnabled,
  onMapStyleChange,
  onFogLayerChange,
  isLoading = false,
}: BayAreaMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("maplibre-gl").Map | null>(null);
  const markersRef = useRef<Map<string, import("maplibre-gl").Marker>>(new Map());
  const onSelectRef = useRef(onSelectLocation);
  const [mapReady, setMapReady] = useState(false);

  onSelectRef.current = onSelectLocation;

  useEffect(() => {
    let cancelled = false;

    async function setupMap() {
      const maplibregl = (await import("maplibre-gl")).default;
      if (cancelled || !containerRef.current) {
        return;
      }

      const map = new maplibregl.Map({
        container: containerRef.current,
        style: resolveKarlMapStyle(mapStyle),
        center: BAY_AREA_CENTER,
        zoom: 8,
        maxBounds: BAY_AREA_MAX_BOUNDS,
        attributionControl: { compact: true },
      });

      map.addControl(
        new maplibregl.NavigationControl({ showCompass: false }),
        "top-right",
      );

      map.on("load", () => {
        if (cancelled) {
          return;
        }

        fitDefaultBayAreaViewport(map);
        syncFogOverlayLayer(map, locations, fogLayerEnabled);
        setMapReady(true);
      });

      mapRef.current = map;
    }

    setupMap();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      setMapReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- map initializes once
  }, []);

  const appliedStyleRef = useRef(mapStyle);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || appliedStyleRef.current === mapStyle) {
      return;
    }

    appliedStyleRef.current = mapStyle;
    const nextStyle = resolveKarlMapStyle(mapStyle);

    const applyStyle = () => {
      syncFogOverlayLayer(map, locations, fogLayerEnabled);

      if (selectedLocationId) {
        const location = locations.find((item) => item.id === selectedLocationId);
        if (location) {
          focusMapOnLocation(map, location.longitude, location.latitude);
        }
        return;
      }

      const region = findBayAreaProductRegion(selectedRegionId);
      if (region) {
        fitMapToBounds(map, region.bounds);
        return;
      }

      fitDefaultBayAreaViewport(map);
    };

    map.once("style.load", applyStyle);
    map.setStyle(nextStyle);
  }, [
    fogLayerEnabled,
    locations,
    mapReady,
    mapStyle,
    selectedLocationId,
    selectedRegionId,
  ]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) {
      return;
    }

    let cancelled = false;

    async function syncMarkers() {
      const maplibregl = (await import("maplibre-gl")).default;
      if (cancelled || !mapRef.current) {
        return;
      }

      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current.clear();

      for (const location of locations) {
        const element = createMapMarkerElement({
          location,
          isSelected: location.id === selectedLocationId,
          fogLayerEnabled,
          onSelect: (locationId) => onSelectRef.current(locationId),
        });

        const marker = new maplibregl.Marker({ element, anchor: "center" })
          .setLngLat([location.longitude, location.latitude])
          .addTo(mapRef.current);

        markersRef.current.set(location.id, marker);
      }
    }

    syncMarkers();

    return () => {
      cancelled = true;
      // Marker refs are managed imperatively by MapLibre, not React DOM.
      // eslint-disable-next-line react-hooks/exhaustive-deps -- cleanup must read latest marker refs
      const markers = markersRef.current;
      markers.forEach((marker) => marker.remove());
      markers.clear();
    };
  }, [fogLayerEnabled, locations, mapReady, selectedLocationId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) {
      return;
    }

    syncFogOverlayLayer(map, locations, fogLayerEnabled);
  }, [fogLayerEnabled, locations, mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) {
      return;
    }

    if (selectedLocationId) {
      const location = locations.find((item) => item.id === selectedLocationId);
      if (location) {
        focusMapOnLocation(map, location.longitude, location.latitude);
      }
      return;
    }

    const region = findBayAreaProductRegion(selectedRegionId);
    if (region) {
      fitMapToBounds(map, region.bounds);
      return;
    }

    fitDefaultBayAreaViewport(map);
  }, [locations, mapReady, selectedLocationId, selectedRegionId]);

  return (
    <div className="relative h-full min-h-[360px] w-full">
      <div
        ref={containerRef}
        data-testid="bay-area-map"
        className="karl-map-canvas h-full min-h-[360px] w-full"
      />
      <MapLayerControls
        mapStyle={mapStyle}
        fogLayerEnabled={fogLayerEnabled}
        onMapStyleChange={onMapStyleChange}
        onFogLayerChange={onFogLayerChange}
      />
      {fogLayerEnabled ? <MapFogLegend /> : null}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-karl-navy/70 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-karl-navy/80 to-transparent"
      />
      {isLoading || !mapReady ? (
        <div className="absolute inset-0 flex items-center justify-center bg-karl-navy/55 px-6 text-center text-sm text-white/60 backdrop-blur-[1px]">
          {isLoading ? "Loading Bay Area locations…" : "Preparing Bay Area map…"}
        </div>
      ) : null}
    </div>
  );
}
