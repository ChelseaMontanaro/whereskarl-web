"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import { useQuery } from "@tanstack/react-query";

import { BayAreaMap } from "@/components/map/BayAreaMap";
import { MapBestRightNowTray } from "@/components/map/MapBestRightNowTray";
import { MapConditionsPanel } from "@/components/map/MapConditionsPanel";
import { MapFogLegend } from "@/components/map/MapFogLegend";
import { MapLocationList } from "@/components/map/MapLocationList";
import { MapRegionChips } from "@/components/map/MapRegionChips";
import { MapSelectedLocationCard } from "@/components/map/MapSelectedLocationCard";
import { GlassCard } from "@/components/ui/GlassCard";
import { getCurrent, getLocations } from "@/lib/api/weather";
import { WEATHER_STALE_TIME_MS } from "@/lib/constants/config";
import { bestRightNowLocationItems } from "@/lib/home/weatherDisplay";
import { useMinWidth } from "@/lib/hooks/useMinWidth";
import {
  getLocationConditionLabel,
  type FogIntensity,
} from "@/lib/map/conditions";
import { findBayAreaProductRegion, isBayAreaProductRegionId } from "@/lib/map/config";
import {
  intensityFilterTrayItems,
  intensityFilterTrayTitle,
  toggleIntensityFilter,
} from "@/lib/map/intensityFilter";
import { resolveMapLocationFocus } from "@/lib/map/locationSelection";
import type { MapMarkerLocation } from "@/lib/map/markers";
import { getProductRegionNameForLocation } from "@/lib/map/regions";
import {
  buildMapHref,
  buildMapRegionHref,
  resolveMapQueryState,
} from "@/lib/map/routing";
import type { KarlMapStyleId } from "@/lib/map/styles";
import type { LocationWeather } from "@/lib/schemas/weather";

function initialDesktopMapStyle(): KarlMapStyleId {
  if (typeof window === "undefined") {
    return "standard";
  }

  return window.matchMedia("(min-width: 1024px)").matches ? "hybrid" : "standard";
}

function MapLocationCard({
  location,
  isSelected,
}: {
  location: LocationWeather;
  isSelected: boolean;
}) {
  const regionName = getProductRegionNameForLocation(location.id);
  const conditionLabel = getLocationConditionLabel(location);

  return (
    <GlassCard
      className={`px-4 py-4 ${
        isSelected ? "border-karl-gold/35 bg-karl-navy-glass/90" : ""
      }`}
      data-selected={isSelected ? "true" : "false"}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-white/45">
            {isSelected ? "Selected Location" : "Location"}
          </p>
          {regionName ? (
            <p className="mt-1 text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-karl-gold/80">
              {regionName}
            </p>
          ) : null}
          <h2 className="mt-2 text-lg font-semibold text-white">{location.name}</h2>
          <p className="mt-1 text-sm text-white/65">{location.status}</p>
          <p className="mt-1 text-xs font-medium uppercase tracking-[0.1em] text-white/45">
            {conditionLabel}
          </p>
          <p className="mt-2 text-sm text-white/50">
            {location.distanceText} · {location.temperature}°
          </p>
        </div>
        <div className="rounded-full border border-karl-gold/25 px-2.5 py-1.5 text-center">
          <p className="text-lg font-light text-karl-gold">{location.sunshineScore}</p>
          <p className="text-[0.6rem] uppercase tracking-[0.1em] text-white/40">
            Clear
          </p>
        </div>
      </div>
    </GlassCard>
  );
}

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
  bottomTrayItems: ReturnType<typeof bestRightNowLocationItems>;
  bottomTrayTitle: string;
  suppressViewportUpdateRef: MutableRefObject<boolean>;
  handleSelectLocation: (locationId: string) => void;
  handleSelectRegion: (regionId: string) => void;
  handleClearSelectedLocation: () => void;
  handleSelectIntensity: (intensity: FogIntensity) => void;
  handleClearIntensityFilter: () => void;
  intensityFilter: FogIntensity | null;
  statusSentence: string;
};

function useMapViewState(): MapViewModel {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mapQuery = resolveMapQueryState(searchParams);
  const suppressViewportUpdateRef = useRef(false);
  const [mapStyle, setMapStyle] = useState<KarlMapStyleId>(initialDesktopMapStyle);
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
      })),
    [locations],
  );

  const bestRightNow = useMemo(
    () =>
      bestRightNowLocationItems(
        locations,
        selectedLocation?.id ?? null,
        4,
      ),
    [locations, selectedLocation?.id],
  );

  const bottomTrayItems = useMemo(() => {
    if (intensityFilter) {
      return intensityFilterTrayItems(
        locations,
        intensityFilter,
        selectedLocation?.id ?? null,
        4,
      );
    }

    return bestRightNow;
  }, [bestRightNow, intensityFilter, locations, selectedLocation?.id]);

  const bottomTrayTitle = intensityFilter
    ? intensityFilterTrayTitle(intensityFilter)
    : "Best Right Now";

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

  const handleClearIntensityFilter = useCallback(() => {
    setIntensityFilter(null);
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

  const statusSentence =
    currentQuery.data?.summary?.trim() ||
    currentQuery.data?.status?.trim() ||
    "Explore live fog and sunshine across the Bay.";

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
    bestRightNowItems: bestRightNow,
    bottomTrayItems,
    bottomTrayTitle,
    suppressViewportUpdateRef,
    handleSelectLocation,
    handleSelectRegion,
    handleClearSelectedLocation,
    handleSelectIntensity,
    handleClearIntensityFilter,
    intensityFilter,
    statusSentence,
  };
}

function MobileMapView({ state }: { state: MapViewModel }) {
  const {
    mapQuery,
    mapStyle,
    setMapStyle,
    fogLayerEnabled,
    setFogLayerEnabled,
    locationsQuery,
    locations,
    selectedLocation,
    unknownLocationId,
    activeRegion,
    markerLocations,
    handleSelectLocation,
    handleSelectRegion,
  } = state;

  const headerCopy = selectedLocation
    ? `Focused on ${selectedLocation.name}.`
    : activeRegion
      ? `Framing ${activeRegion.name} across the Bay.`
      : "Explore conditions across San Francisco, North Bay, East Bay, and South Bay.";

  return (
    <div className="mx-auto flex w-full max-w-[430px] flex-col gap-4 px-4 py-6 sm:py-8">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-karl-gold">
          Where&apos;s Karl?
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-white">Map</h1>
        <p className="text-base text-white/70">{headerCopy}</p>
      </header>

      <MapRegionChips
        selectedRegionId={selectedLocation ? null : mapQuery.activeRegionId}
        onSelectRegion={handleSelectRegion}
      />

      <GlassCard className="relative aspect-[4/5] overflow-hidden px-0 py-0">
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
          layout="mobile"
        />
      </GlassCard>

      <MapQueryWarnings
        unknownLocationId={unknownLocationId}
        unknownRegionId={mapQuery.unknownRegionId}
      />

      {selectedLocation ? (
        <MapLocationCard location={selectedLocation} isSelected />
      ) : null}

      <MapLocationList
        locations={locations}
        selectedLocationId={selectedLocation?.id ?? null}
        activeRegionId={selectedLocation ? null : mapQuery.activeRegionId}
        onSelectLocation={handleSelectLocation}
        isLoading={locationsQuery.isLoading}
      />

      <p className="text-center text-[0.65rem] text-white/30">
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
    bottomTrayItems,
    bottomTrayTitle,
    handleSelectLocation,
    handleSelectRegion,
    handleClearSelectedLocation,
    handleSelectIntensity,
    handleClearIntensityFilter,
    intensityFilter,
    suppressViewportUpdateRef,
    statusSentence,
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
            statusSentence={statusSentence}
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
            onClearIntensity={handleClearIntensityFilter}
          />
          <MapQueryWarnings
            unknownLocationId={unknownLocationId}
            unknownRegionId={mapQuery.unknownRegionId}
            variant="desktop"
          />
        </div>

        <div className="pointer-events-auto absolute bottom-6 left-6 max-w-xl">
          <MapBestRightNowTray
            items={bottomTrayItems}
            title={bottomTrayTitle}
            onSelectLocation={handleSelectLocation}
            isLoading={locationsQuery.isLoading}
          />
        </div>

        {selectedLocation ? (
          <div className="pointer-events-auto absolute bottom-6 left-1/2 w-[min(100%,42rem)] -translate-x-1/2 px-6">
            <MapSelectedLocationCard
              location={selectedLocation}
              onClose={handleClearSelectedLocation}
            />
          </div>
        ) : null}
      </div>

      <p className="pointer-events-none absolute bottom-2 right-4 z-20 text-[0.6rem] text-white/25">
        Map data © OpenStreetMap contributors · CARTO
      </p>
    </div>
  );
}

export function MapView() {
  const state = useMapViewState();
  const isDesktop = useMinWidth(1024);

  if (isDesktop) {
    return <DesktopMapView state={state} />;
  }

  return <MobileMapView state={state} />;
}
