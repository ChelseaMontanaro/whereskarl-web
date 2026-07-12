"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  BayAreaMap,
  type BayAreaMapHandle,
} from "@/components/map/BayAreaMap";
import { MapBestRightNowTray } from "@/components/map/MapBestRightNowTray";
import { MapConditionsPanel } from "@/components/map/MapConditionsPanel";
import { MapPhonePortraitControls } from "@/components/map/MapPhonePortraitControls";
import { MapPhonePortraitFogRail } from "@/components/map/MapPhonePortraitFogRail";
import { MapPhonePortraitLayersControl } from "@/components/map/MapLayerControls";
import { MapFogLegend } from "@/components/map/MapFogLegend";
import { MapSelectedLocationCard } from "@/components/map/MapSelectedLocationCard";
import { GlassCard } from "@/components/ui/GlassCard";
import { getBestSunshine, getCurrent, getLocations } from "@/lib/api/weather";
import { WEATHER_STALE_TIME_MS } from "@/lib/constants/config";
import { bestRightNowLocationItems } from "@/lib/home/weatherDisplay";
import { useMinWidth } from "@/lib/hooks/useMinWidth";
import { usePhonePortrait } from "@/lib/hooks/usePhonePortrait";
import type { FogIntensity } from "@/lib/map/conditions";
import {
  findBayAreaProductRegion,
  isBayAreaProductRegionId,
  type BayAreaProductRegionId,
} from "@/lib/map/config";
import {
  mapBestRightNowTrayItems,
  shouldShowDesktopBestRightNowTray,
  toggleIntensityFilter,
} from "@/lib/map/intensityFilter";
import { resolveMapLocationFocus } from "@/lib/map/locationSelection";
import { isMapMarkerVisible, type MapMarkerLocation } from "@/lib/map/markers";
import {
  buildMapHref,
  buildMapRegionHref,
  resolveMapQueryState,
} from "@/lib/map/routing";
import type { KarlMapStyleId } from "@/lib/map/styles";
import { filterLocationsForPhonePortraitSfComposition } from "@/lib/map/phonePortraitMapPresentation";
import { filterLocationsByProductRegion } from "@/lib/map/regions";
import type { LocationWeather } from "@/lib/schemas/weather";

/**
 * Phone-portrait map is selection-driven: when nothing is selected on a clean
 * entry, the camera still frames this region (matching the prior behavior)
 * while the canonical Best Right Now location is auto-selected into the card.
 */
const PHONE_PORTRAIT_DEFAULT_CAMERA_REGION: BayAreaProductRegionId =
  "san-francisco";

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
  bestRightNowItems: ReturnType<typeof mapBestRightNowTrayItems>;
  /** Canonical Best Right Now location id (matches Home's recommendation). */
  bestRightNowLocationId: string | null;
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

  // Canonical Best Right Now recommendation, shared with the Home page.
  const bestSunshineQuery = useQuery({
    queryKey: ["best-sunshine"],
    queryFn: () => getBestSunshine(),
    staleTime: WEATHER_STALE_TIME_MS,
  });

  const locations = useMemo(
    () => locationsQuery.data?.locations ?? [],
    [locationsQuery.data?.locations],
  );

  const bestSunshinePending = bestSunshineQuery.isPending;
  const bestRightNowLocationId = useMemo(() => {
    const recommendedId = bestSunshineQuery.data?.locationID;
    if (recommendedId && locations.some((item) => item.id === recommendedId)) {
      return recommendedId;
    }

    // Wait for the canonical recommendation (or its failure) before falling
    // back so we don't briefly auto-select the top-scored spot and then swap.
    if (bestSunshinePending || locations.length === 0) {
      return null;
    }

    // Fall back to the top-scored location so the map can still auto-select a
    // Best Right Now spot when the recommendation endpoint is unavailable.
    return bestRightNowLocationItems(locations, null, 1)[0]?.locationId ?? null;
  }, [bestSunshineQuery.data?.locationID, bestSunshinePending, locations]);

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

  const bestRightNowItems = useMemo(
    () => mapBestRightNowTrayItems(locations, intensityFilter, null, 4),
    [intensityFilter, locations],
  );

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
    bestRightNowLocationId,
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
  const mapRef = useRef<BayAreaMapHandle>(null);
  const [isLayersPanelOpen, setIsLayersPanelOpen] = useState(false);
  const router = useRouter();
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
    bestRightNowLocationId,
    handleSelectLocation,
    handleSelectRegion,
    handleClearSelectedLocation,
    handleSelectIntensity,
    intensityFilter,
    suppressViewportUpdateRef,
  } = state;

  // Region that frames the phone-portrait camera. It stays independent of the
  // canonical selection so auto-selecting Best Right Now on entry keeps the
  // exact same camera as before (default: San Francisco framing).
  const phonePortraitCameraRegionId =
    mapQuery.activeRegionId ?? PHONE_PORTRAIT_DEFAULT_CAMERA_REGION;
  // Markers are region-scoped only while explicitly browsing a region; once a
  // location is selected we show every marker so the selected one is always
  // visible. This intentionally does NOT use the SF camera default so an
  // unscoped map still renders every marker (matching prior behavior).
  const phonePortraitFilterRegionId = selectedLocation
    ? null
    : mapQuery.activeRegionId;

  // Selection-driven entry: on a clean map open (no explicit location/region),
  // auto-select the canonical Best Right Now location so the card immediately
  // becomes the selected-location experience. The camera is unaffected.
  useEffect(() => {
    if (
      !isPhonePortrait ||
      mapQuery.requestedLocationId ||
      mapQuery.activeRegionId ||
      mapQuery.unknownRegionId ||
      !bestRightNowLocationId
    ) {
      return;
    }

    suppressViewportUpdateRef.current = false;
    router.replace(buildMapHref(bestRightNowLocationId), { scroll: false });
  }, [
    bestRightNowLocationId,
    isPhonePortrait,
    mapQuery.activeRegionId,
    mapQuery.requestedLocationId,
    mapQuery.unknownRegionId,
    router,
    suppressViewportUpdateRef,
  ]);

  const phonePortraitMarkerLocations = useMemo(() => {
    if (!isPhonePortrait) {
      return markerLocations;
    }

    const regionFiltered =
      phonePortraitFilterRegionId === "san-francisco"
        ? filterLocationsForPhonePortraitSfComposition(markerLocations)
        : phonePortraitFilterRegionId
          ? filterLocationsByProductRegion(
              markerLocations,
              isBayAreaProductRegionId(phonePortraitFilterRegionId)
                ? phonePortraitFilterRegionId
                : null,
            )
          : markerLocations;

    if (!intensityFilter) {
      return regionFiltered;
    }

    // Phone-portrait markers are never hidden by CSS or BayAreaMap, so the
    // active intensity filter has to be applied to the rendered list here,
    // reusing the same visibility logic as the desktop map. The selected
    // location stays visible so tapping a marker still works with a filter on.
    return regionFiltered.filter(
      (location) =>
        location.id === selectedLocation?.id ||
        isMapMarkerVisible(location, { intensityFilter }),
    );
  }, [
    intensityFilter,
    isPhonePortrait,
    markerLocations,
    phonePortraitFilterRegionId,
    selectedLocation?.id,
  ]);

  const mapLocations = isPhonePortrait
    ? phonePortraitMarkerLocations
    : markerLocations;

  return (
    <div className="fixed inset-0 z-10">
      <BayAreaMap
        ref={mapRef}
        locations={mapLocations}
        selectedLocationId={selectedLocation?.id ?? null}
        selectedRegionId={
          isPhonePortrait
            ? phonePortraitCameraRegionId
            : selectedLocation
              ? null
              : mapQuery.activeRegionId
        }
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
        immersiveOverlayProfile={isPhonePortrait ? "phone-portrait" : "tablet"}
      />

      <div className="pointer-events-none absolute inset-0 z-20">
        <div
          aria-hidden="true"
          className={`absolute inset-x-0 top-0 bg-gradient-to-b from-karl-navy/42 via-karl-navy/16 to-transparent ${
            isPhonePortrait ? "h-24" : "h-32 sm:h-36"
          }`}
        />

        {!isLayersPanelOpen || isPhonePortrait ? (
          <div
            className={`pointer-events-auto absolute flex flex-col transition-opacity motion-reduce:transition-none ${
              isPhonePortrait
                ? "inset-x-3 top-[calc(1.375rem+env(safe-area-inset-top))] gap-0"
                : "left-3 top-3 max-w-[min(100%,13.5rem)] gap-1.5 sm:left-4 sm:top-4 sm:max-w-xs md:top-[4.5rem] md:max-w-xs"
            } opacity-100`}
          >
            {isPhonePortrait ? (
              <MapPhonePortraitControls
                selectedRegionId={mapQuery.activeRegionId}
                onSelectRegion={handleSelectRegion}
                isPhonePortrait
              />
            ) : (
              <>
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
              </>
            )}
            <MapQueryWarnings
              unknownLocationId={unknownLocationId}
              unknownRegionId={mapQuery.unknownRegionId}
              variant="desktop"
            />
          </div>
        ) : null}

        {isPhonePortrait ? (
          <>
            {/* Fog Intensity rail — global filter, left side, vertically
                centered. Stays mounted (and unchanged) while the Map Layers
                sheet is open; the sheet's backdrop dims it along with the map. */}
            <div className="pointer-events-none absolute left-3 top-[calc(6rem+env(safe-area-inset-top))] bottom-[calc(9.5rem+env(safe-area-inset-bottom))] flex flex-col justify-center">
              <div className="pointer-events-auto flex flex-col items-start gap-2">
                <MapPhonePortraitFogRail
                  activeIntensity={intensityFilter}
                  onSelectIntensity={handleSelectIntensity}
                />
              </div>
            </div>

            {/* Map Layers — global map control, top-right below the region
                chips, deliberately separate from the Fog Intensity rail. */}
            <div className="pointer-events-auto absolute right-3 top-[calc(6rem+env(safe-area-inset-top))] flex flex-col items-end">
              <MapPhonePortraitLayersControl
                mapStyle={mapStyle}
                fogLayerEnabled={fogLayerEnabled}
                onMapStyleChange={setMapStyle}
                onFogLayerChange={setFogLayerEnabled}
                onOpenChange={setIsLayersPanelOpen}
              />
            </div>
          </>
        ) : null}

        <div
          className={`pointer-events-auto absolute inset-x-3 flex flex-col items-stretch sm:inset-x-4 ${
            isPhonePortrait
              ? "bottom-[calc(4.5rem+env(safe-area-inset-bottom))] gap-0"
              : "bottom-[calc(5.5rem+env(safe-area-inset-bottom))] gap-2.5 md:bottom-[calc(5.25rem+env(safe-area-inset-bottom))]"
          }`}
        >
          {isPhonePortrait ? (
            selectedLocation ? (
              <MapSelectedLocationCard
                location={selectedLocation}
                phonePortrait
                showCloseButton={false}
              />
            ) : locationsQuery.isLoading ? (
              <div className="w-full rounded-2xl border border-white/12 bg-[rgb(6_15_27/0.55)] px-4 py-3 backdrop-blur-md">
                <p className="text-xs text-white/50">
                  Finding the clearest spot…
                </p>
              </div>
            ) : null
          ) : (
            <>
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
            </>
          )}
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
