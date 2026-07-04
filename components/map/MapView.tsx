"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import { useQuery } from "@tanstack/react-query";

import { BayAreaMap } from "@/components/map/BayAreaMap";
import { MapBestRightNowTray } from "@/components/map/MapBestRightNowTray";
import { MapConditionsPanel } from "@/components/map/MapConditionsPanel";
import { MapFogLegend } from "@/components/map/MapFogLegend";
import { MapSelectedLocationCard } from "@/components/map/MapSelectedLocationCard";
import { GlassCard } from "@/components/ui/GlassCard";
import { getCurrent, getLocations } from "@/lib/api/weather";
import { WEATHER_STALE_TIME_MS } from "@/lib/constants/config";
import { bestRightNowLocationItems } from "@/lib/home/weatherDisplay";
import { useMinWidth } from "@/lib/hooks/useMinWidth";
import { usePhonePortrait } from "@/lib/hooks/usePhonePortrait";
import type { FogIntensity } from "@/lib/map/conditions";
import { findBayAreaProductRegion, isBayAreaProductRegionId } from "@/lib/map/config";
import {
  intensityFilterTrayItems,
  shouldShowDesktopBestRightNowTray,
  toggleIntensityFilter,
} from "@/lib/map/intensityFilter";
import { resolveMapLocationFocus } from "@/lib/map/locationSelection";
import type { MapMarkerLocation } from "@/lib/map/markers";
import {
  buildMapHref,
  buildMapRegionHref,
  resolveMapQueryState,
} from "@/lib/map/routing";
import type { KarlMapStyleId } from "@/lib/map/styles";
import type { LocationWeather } from "@/lib/schemas/weather";

function initialMapStyle(): KarlMapStyleId {
  if (typeof window === "undefined") {
    return "hybrid";
  }

  return "hybrid";
}

export { initialMapStyle };

function MapQueryWarnings({
  unknownLocationId,
  unknownRegionId,
  variant = "mobile",
}: {
  unknownLocationId: string | null;
  unknownRegionId: string | null;
  variant?: "mobile" | "desktop";
}) {
  if (!unknownLocationId && !unknownRegionId) {
    return null;
  }

  const wrapperClass =
    variant === "desktop"
      ? "pointer-events-auto max-w-xs"
      : undefined;

  return (
    <div className={wrapperClass}>
      {unknownLocationId ? (
        <GlassCard className="px-4 py-3">
          <p className="text-sm text-white/70">
            Couldn&apos;t find{" "}
            <span className="font-semibold text-white">
              {unknownLocationId.replaceAll("-", " ")}
            </span>
            . Showing the Bay Area map instead.
          </p>
        </GlassCard>
      ) : null}
      {unknownRegionId ? (
        <GlassCard className={`px-4 py-3 ${unknownLocationId ? "mt-2" : ""}`}>
          <p className="text-sm text-white/70">
            Couldn&apos;t find region{" "}
            <span className="font-semibold text-white">
              {unknownRegionId.replaceAll("-", " ")}
            </span>
            . Showing the full Bay Area map instead.
          </p>
        </GlassCard>
      ) : null}
    </div>
  );
}

type MapViewModel = {
  mapQuery: ReturnType<typeof resolveMapQueryState>;
  mapStyle: KarlMapStyleId;
  setMapStyle: (styleId: KarlMapStyleId) => void;
  fogLayerEnabled: boolean;
  setFogLayerEnabled: (enabled: boolean) => void;
  locationsQuery: {
    isLoading: boolean;
    data?: Awaited<ReturnType<typeof getLocations>>;
  };
  currentQuery: {
    isLoading: boolean;
    data?: Awaited<ReturnType<typeof getCurrent>>;
  };
  locations: LocationWeather[];
  selectedLocation: LocationWeather | null;
  unknownLocationId: string | null;
  activeRegion: ReturnType<typeof findBayAreaProductRegion>;
  markerLocations: MapMarkerLocation[];
  bestRightNowItems: ReturnType<typeof bestRightNowLocationItems>;
  suppressViewportUpdateRef: MutableRefObject<boolean>;
  handleSelectLocation: (locationId: string) => void;
  handleSelectRegion: (regionId: string) => void;
  handleClearSelectedLocation: () => void;
  handleSelectIntensity: (intensity: FogIntensity) => void;
  intensityFilter: FogIntensity | null;
};

function useMapViewState(): MapViewModel {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mapQuery = resolveMapQueryState(searchParams);
  const suppressViewportUpdateRef = useRef(false);
  const [mapStyle, setMapStyle] = useState<KarlMapStyleId>(initialMapStyle);
  const [fogLayerEnabled, setFogLayerEnabled] = useState(true);
  const [intensityFilter, setIntensityFilter] = useState<FogIntensity | null>(
    null,
  );

  const locationsQuery = useQuery({
    queryKey: ["locations"],
    queryFn: getLocations,
    staleTime: WEATHER_STALE_TIME_MS,
  });

  const currentQuery = useQuery({
    queryKey: ["current"],
    queryFn: getCurrent,
    staleTime: WEATHER_STALE_TIME_MS,
  });

  const locations = useMemo(
    () => locationsQuery.data?.locations ?? [],
    [locationsQuery.data?.locations],
  );

  const { selectedLocation, unknownLocationId } = resolveMapLocationFocus({
    requestedLocationId: mapQuery.requestedLocationId,
    locations,
  });

  const activeRegion = mapQuery.activeRegionId
    ? findBayAreaProductRegion(mapQuery.activeRegionId)
    : null;

  const markerLocations = useMemo<MapMarkerLocation[]>(
    () =>
      locations.map((location) => ({
        id: location.id,
        name: location.name,
        latitude: location.latitude,
        longitude: location.longitude,
        sunshineScore: location.sunshineScore,
        fogScore: location.fogScore,
        status: location.status,
        region: location.region,
        dataStatus: location.dataStatus,
      })),
    [locations],
  );

  const bestRightNow = useMemo(
    () => bestRightNowLocationItems(locations, null, 4),
    [locations],
  );

  const bestRightNowItems = useMemo(() => {
    if (!intensityFilter) {
      return bestRightNow;
    }

    if (intensityFilter === "clear") {
      return intensityFilterTrayItems(
        locations,
        "clear",
        null,
        4,
        mapQuery.activeRegionId,
      );
    }

    return bestRightNow;
  }, [bestRightNow, intensityFilter, locations, mapQuery.activeRegionId]);

  const handleSelectLocation = useCallback(
    (locationId: string) => {
      suppressViewportUpdateRef.current = false;
      router.replace(buildMapHref(locationId), { scroll: false });
    },
    [router],
  );

  const handleClearSelectedLocation = useCallback(() => {
    suppressViewportUpdateRef.current = true;
    router.replace("/map", { scroll: false });
  }, [router]);

  const handleSelectIntensity = useCallback((intensity: FogIntensity) => {
    setIntensityFilter((current) => toggleIntensityFilter(current, intensity));
  }, []);

  const handleSelectRegion = useCallback(
    (regionId: string) => {
      suppressViewportUpdateRef.current = false;
      if (!isBayAreaProductRegionId(regionId)) {
        return;
      }

      if (mapQuery.activeRegionId === regionId) {
        router.replace("/map", { scroll: false });
        return;
      }

      router.replace(buildMapRegionHref(regionId), { scroll: false });
    },
    [mapQuery.activeRegionId, router],
  );

  return {
    mapQuery,
    mapStyle,
    setMapStyle,
    fogLayerEnabled,
    setFogLayerEnabled,
    locationsQuery,
    currentQuery,
    locations,
    selectedLocation,
    unknownLocationId,
    activeRegion,
    markerLocations,
    bestRightNowItems,
    suppressViewportUpdateRef,
    handleSelectLocation,
    handleSelectRegion,
    handleClearSelectedLocation,
    handleSelectIntensity,
    intensityFilter,
  };
}

function MobileMapView({ state }: { state: MapViewModel }) {
  const isPhonePortrait = usePhonePortrait();
  const [isLayersPanelOpen, setIsLayersPanelOpen] = useState(false);
  const {
    mapQuery,
    mapStyle,
    setMapStyle,
    fogLayerEnabled,
    setFogLayerEnabled,
    locationsQuery,
    currentQuery,
    selectedLocation,
    unknownLocationId,
    markerLocations,
    bestRightNowItems,
    handleSelectLocation,
    handleSelectRegion,
    handleClearSelectedLocation,
    handleSelectIntensity,
    intensityFilter,
    suppressViewportUpdateRef,
  } = state;

  return (
    <div className="fixed inset-0 z-10">
      <BayAreaMap
        locations={markerLocations}
        selectedLocationId={selectedLocation?.id ?? null}
        selectedRegionId={selectedLocation ? null : mapQuery.activeRegionId}
        onSelectLocation={handleSelectLocation}
        mapStyle={mapStyle}
        fogLayerEnabled={fogLayerEnabled}
        onMapStyleChange={setMapStyle}
        onFogLayerChange={setFogLayerEnabled}
        isLoading={locationsQuery.isLoading}
        layout="immersive"
        suppressViewportUpdateRef={suppressViewportUpdateRef}
        intensityFilter={intensityFilter}
        onImmersiveLayersPanelOpenChange={setIsLayersPanelOpen}
      />

      <div className="pointer-events-none absolute inset-0 z-20">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-karl-navy/42 via-karl-navy/16 to-transparent sm:h-36"
        />

        <div
          className={`pointer-events-auto absolute left-3 top-3 flex max-w-[min(100%,13.5rem)] flex-col gap-1.5 transition-opacity motion-reduce:transition-none sm:left-4 sm:top-4 sm:max-w-xs sm:gap-2 md:top-[4.5rem] md:max-w-xs ${
            isPhonePortrait && isLayersPanelOpen
              ? "pointer-events-none opacity-0"
              : "opacity-100"
          }`}
        >
          <MapConditionsPanel
            compact={isPhonePortrait}
            isLoading={currentQuery.isLoading && !currentQuery.data}
            selectedRegionId={
              selectedLocation ? null : mapQuery.activeRegionId
            }
            onSelectRegion={handleSelectRegion}
          />
          <MapFogLegend
            layout={isPhonePortrait ? "immersive-strip" : "desktop-stack"}
            activeIntensity={intensityFilter}
            onSelectIntensity={handleSelectIntensity}
          />
          <MapQueryWarnings
            unknownLocationId={unknownLocationId}
            unknownRegionId={mapQuery.unknownRegionId}
            variant="desktop"
          />
        </div>

        <div className="pointer-events-auto absolute inset-x-3 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] flex flex-col items-stretch gap-2 sm:inset-x-4 md:bottom-[calc(5.25rem+env(safe-area-inset-bottom))]">
          {shouldShowDesktopBestRightNowTray(intensityFilter) ? (
            <MapBestRightNowTray
              items={bestRightNowItems}
              selectedLocationId={selectedLocation?.id ?? null}
              onSelectLocation={handleSelectLocation}
              isLoading={locationsQuery.isLoading}
            />
          ) : null}

          {selectedLocation ? (
            <MapSelectedLocationCard
              location={selectedLocation}
              onClose={handleClearSelectedLocation}
            />
          ) : null}
        </div>
      </div>

      <p className="pointer-events-none absolute bottom-[calc(5rem+env(safe-area-inset-bottom))] right-3 z-20 text-[0.6rem] text-white/25 sm:right-4">
        Map data © OpenStreetMap contributors · CARTO
      </p>
    </div>
  );
}

function DesktopMapView({ state }: { state: MapViewModel }) {
  const {
    mapQuery,
    mapStyle,
    setMapStyle,
    fogLayerEnabled,
    setFogLayerEnabled,
    locationsQuery,
    currentQuery,
    selectedLocation,
    unknownLocationId,
    markerLocations,
    bestRightNowItems,
    handleSelectLocation,
    handleSelectRegion,
    handleClearSelectedLocation,
    handleSelectIntensity,
    intensityFilter,
    suppressViewportUpdateRef,
  } = state;

  return (
    <div className="fixed inset-0 z-10">
      <BayAreaMap
        locations={markerLocations}
        selectedLocationId={selectedLocation?.id ?? null}
        selectedRegionId={selectedLocation ? null : mapQuery.activeRegionId}
        onSelectLocation={handleSelectLocation}
        mapStyle={mapStyle}
        fogLayerEnabled={fogLayerEnabled}
        onMapStyleChange={setMapStyle}
        onFogLayerChange={setFogLayerEnabled}
        isLoading={locationsQuery.isLoading}
        layout="desktop"
        suppressViewportUpdateRef={suppressViewportUpdateRef}
        intensityFilter={intensityFilter}
      />

      <div className="pointer-events-none absolute inset-0 z-20">
        <div className="pointer-events-auto absolute left-6 top-[5.5rem] flex max-w-xs flex-col gap-2">
          <MapConditionsPanel
            isLoading={currentQuery.isLoading && !currentQuery.data}
            selectedRegionId={
              selectedLocation ? null : mapQuery.activeRegionId
            }
            onSelectRegion={handleSelectRegion}
          />
          <MapFogLegend
            layout="desktop-stack"
            activeIntensity={intensityFilter}
            onSelectIntensity={handleSelectIntensity}
          />
          <MapQueryWarnings
            unknownLocationId={unknownLocationId}
            unknownRegionId={mapQuery.unknownRegionId}
            variant="desktop"
          />
        </div>

        <div className="pointer-events-auto absolute inset-x-6 bottom-6 flex items-end justify-between gap-6">
          {shouldShowDesktopBestRightNowTray(intensityFilter) ? (
            <div className="max-w-xl shrink-0">
              <MapBestRightNowTray
                items={bestRightNowItems}
                selectedLocationId={selectedLocation?.id ?? null}
                onSelectLocation={handleSelectLocation}
                isLoading={locationsQuery.isLoading}
              />
            </div>
          ) : null}

          {selectedLocation ? (
            <div className="shrink-0">
              <MapSelectedLocationCard
                location={selectedLocation}
                onClose={handleClearSelectedLocation}
              />
            </div>
          ) : null}
        </div>
      </div>

      <p className="pointer-events-none absolute bottom-2 right-4 z-20 text-[0.6rem] text-white/25">
        Map data © OpenStreetMap contributors · CARTO
      </p>
    </div>
  );
}

export function MapView() {
  const isDesktop = useMinWidth(1024);
  const state = useMapViewState();

  if (isDesktop) {
    return <DesktopMapView state={state} />;
  }

  return <MobileMapView state={state} />;
}
