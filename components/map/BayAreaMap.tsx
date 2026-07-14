"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type MutableRefObject,
} from "react";

import { MapFogLegend } from "@/components/map/MapFogLegend";
import { MapLayerControls } from "@/components/map/MapLayerControls";
import { useIsNighttime } from "@/lib/hooks/useIsNighttime";
import {
  BAY_AREA_CENTER,
  BAY_AREA_DEFAULT_MAX_ZOOM,
  BAY_AREA_IMMERSIVE_MIN_ZOOM,
  BAY_AREA_LOCATION_ZOOM,
  BAY_AREA_MAX_BOUNDS,
  findBayAreaProductRegion,
  type ImmersiveOverlayProfile,
} from "@/lib/map/config";
import { syncFogOverlayLayer } from "@/lib/map/fogOverlays";
import { boundsForIntensityLocations } from "@/lib/map/intensityFilter";
import {
  createMapMarkerElement,
  getMapMarkerPlacementOptions,
  isMapMarkerVisible,
  shouldShowFoggyFilterMarkerLabel,
  type MapMarkerLocation,
} from "@/lib/map/markers";
import type { FogIntensity } from "@/lib/map/conditions";
import {
  getPhonePortraitMarkerPriority,
  PHONE_PORTRAIT_MAP_CENTER,
  PHONE_PORTRAIT_MAP_INITIAL_ZOOM,
} from "@/lib/map/phonePortraitMapPresentation";
import {
  createPhonePortraitMapMarkerElement,
  declutterPhonePortraitMarkers,
  updatePhonePortraitMarkerLabelOffsets,
  type PhonePortraitDeclutterEntry,
} from "@/lib/map/phonePortraitMarkers";
import { getProductRegionIdForLocation } from "@/lib/map/regions";
import {
  fitPhonePortraitRegionViewport,
  locatePhonePortraitMap,
} from "@/lib/map/phonePortraitViewport";
import { resolveKarlMapStyle, type KarlMapStyleId } from "@/lib/map/styles";
import {
  fitDefaultBayAreaViewport,
  fitMapToBounds,
  focusMapOnLocation,
  getImmersiveDefaultBayAreaFitOptions,
  resolveIntensityFilterFitOptions,
  resolveRegionViewportOptions,
} from "@/lib/map/viewport";

export type BayAreaMapHandle = {
  resetView: () => void;
  locateMe: () => void;
};

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
  layout?: "mobile" | "desktop" | "immersive";
  suppressViewportUpdateRef?: MutableRefObject<boolean>;
  intensityFilter?: FogIntensity | null;
  onImmersiveLayersPanelOpenChange?: (isOpen: boolean) => void;
  immersiveOverlayProfile?: ImmersiveOverlayProfile;
};

export const BayAreaMap = forwardRef<BayAreaMapHandle, BayAreaMapProps>(
  function BayAreaMap(
    {
      locations,
      selectedLocationId,
      selectedRegionId,
      onSelectLocation,
      mapStyle,
      fogLayerEnabled,
      onMapStyleChange,
      onFogLayerChange,
      isLoading = false,
      layout = "mobile",
      suppressViewportUpdateRef,
      intensityFilter = null,
      onImmersiveLayersPanelOpenChange,
      immersiveOverlayProfile = "tablet",
    },
    ref,
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<import("maplibre-gl").Map | null>(null);
    const markersRef = useRef<Map<string, import("maplibre-gl").Marker>>(
      new Map(),
    );
    const onSelectRef = useRef(onSelectLocation);
    const phonePortraitWebRef = useRef(
      immersiveOverlayProfile === "phone-portrait",
    );
    const phonePortraitStyleAppliedRef = useRef(
      immersiveOverlayProfile === "phone-portrait",
    );
    const [mapReady, setMapReady] = useState(false);
    const isDesktop = layout === "desktop";
    const isImmersive = layout === "immersive";
    const isFullBleed = isDesktop || isImmersive;
    const isPhonePortraitWeb = immersiveOverlayProfile === "phone-portrait";
    const isNighttime = useIsNighttime();

    onSelectRef.current = onSelectLocation;
    phonePortraitWebRef.current = isPhonePortraitWeb;
    const selectedRegionIdRef = useRef(selectedRegionId);
    selectedRegionIdRef.current = selectedRegionId;
    const selectedLocationIdRef = useRef(selectedLocationId);
    selectedLocationIdRef.current = selectedLocationId;

    const handleZoomIn = useCallback(() => {
      mapRef.current?.zoomIn({ duration: 250 });
    }, []);

    const handleZoomOut = useCallback(() => {
      mapRef.current?.zoomOut({ duration: 250 });
    }, []);

    const resetView = useCallback(() => {
      const map = mapRef.current;
      if (!map) {
        return;
      }

      if (phonePortraitWebRef.current) {
        fitPhonePortraitRegionViewport(
          map,
          selectedRegionIdRef.current,
          { duration: 450 },
        );
        return;
      }

      const immersiveFit = isImmersive
        ? getImmersiveDefaultBayAreaFitOptions(immersiveOverlayProfile)
        : null;
      fitDefaultBayAreaViewport(
        map,
        immersiveFit?.padding,
        immersiveFit?.maxZoom ?? BAY_AREA_DEFAULT_MAX_ZOOM,
      );
    }, [immersiveOverlayProfile, isImmersive]);

    const locateMe = useCallback(() => {
      const map = mapRef.current;
      if (!map) {
        return;
      }

      if (phonePortraitWebRef.current) {
        locatePhonePortraitMap(map);
        return;
      }

      if (!navigator.geolocation) {
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          map.flyTo({
            center: [position.coords.longitude, position.coords.latitude],
            zoom: BAY_AREA_LOCATION_ZOOM,
            duration: 450,
            essential: true,
          });
        },
        () => undefined,
        { enableHighAccuracy: true, timeout: 10000 },
      );
    }, []);

    useImperativeHandle(ref, () => ({ resetView, locateMe }), [
      locateMe,
      resetView,
    ]);

    useEffect(() => {
      let cancelled = false;

      async function setupMap() {
        const maplibregl = (await import("maplibre-gl")).default;
        if (cancelled || !containerRef.current) {
          return;
        }

        const isPhonePortrait = phonePortraitWebRef.current;
        const initialCenter = isPhonePortrait
          ? [PHONE_PORTRAIT_MAP_CENTER.longitude, PHONE_PORTRAIT_MAP_CENTER.latitude]
          : BAY_AREA_CENTER;

        const map = new maplibregl.Map({
          container: containerRef.current,
          style: resolveKarlMapStyle(mapStyle, {
            phonePortraitWeb: isPhonePortrait,
          }),
          center: initialCenter as [number, number],
          zoom: isPhonePortrait ? PHONE_PORTRAIT_MAP_INITIAL_ZOOM : 8,
          minZoom: isImmersive ? BAY_AREA_IMMERSIVE_MIN_ZOOM : undefined,
          maxBounds: BAY_AREA_MAX_BOUNDS,
          attributionControl: { compact: true },
        });

        if (!isFullBleed && !isPhonePortrait) {
          map.addControl(
            new maplibregl.NavigationControl({ showCompass: false }),
            "top-right",
          );
        }

        map.on("load", () => {
          if (cancelled) {
            return;
          }

          const phonePortrait = phonePortraitWebRef.current;

          if (phonePortrait) {
            fitPhonePortraitRegionViewport(
              map,
              selectedRegionIdRef.current,
            );
          } else {
            const immersiveFit = isImmersive
              ? getImmersiveDefaultBayAreaFitOptions(immersiveOverlayProfile)
              : null;
            fitDefaultBayAreaViewport(
              map,
              immersiveFit?.padding,
              immersiveFit?.maxZoom ?? BAY_AREA_DEFAULT_MAX_ZOOM,
            );
          }

          syncFogOverlayLayer(
            map,
            locations,
            fogLayerEnabled,
            intensityFilter,
          );
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
      const nextStyle = resolveKarlMapStyle(mapStyle, {
        phonePortraitWeb: phonePortraitWebRef.current,
      });

      const applyStyle = () => {
        syncFogOverlayLayer(
          map,
          locations,
          fogLayerEnabled,
          intensityFilter,
        );

        if (isPhonePortraitWeb) {
          if (!selectedLocationId) {
            fitPhonePortraitRegionViewport(
              map,
              selectedRegionId,
            );
          }
          return;
        }

        if (selectedLocationId) {
          const location = locations.find(
            (item) => item.id === selectedLocationId,
          );
          if (location) {
            focusMapOnLocation(map, location.longitude, location.latitude);
          }
          return;
        }

        const region = findBayAreaProductRegion(selectedRegionId);
        if (region) {
          fitMapToBounds(
            map,
            region.bounds,
            resolveRegionViewportOptions(
              region.viewport,
              layout,
              immersiveOverlayProfile,
            ),
          );
          return;
        }

        const immersiveFit = isImmersive
          ? getImmersiveDefaultBayAreaFitOptions(immersiveOverlayProfile)
          : null;
        fitDefaultBayAreaViewport(
          map,
          immersiveFit?.padding,
          immersiveFit?.maxZoom ?? BAY_AREA_DEFAULT_MAX_ZOOM,
        );
      };

      map.once("style.load", applyStyle);
      map.setStyle(nextStyle);
    }, [
      fogLayerEnabled,
      immersiveOverlayProfile,
      intensityFilter,
      isImmersive,
      isPhonePortraitWeb,
      layout,
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
      let declutterHandler: (() => void) | null = null;
      let labelOffsetHandler: (() => void) | null = null;
      // Capture the exact map instance we attach listeners to so cleanup can
      // detach from it even after the init effect has cleared mapRef.current.
      let listenerMap: import("maplibre-gl").Map | null = null;

      async function syncMarkers() {
        const maplibregl = (await import("maplibre-gl")).default;
        if (cancelled || !mapRef.current) {
          return;
        }

        markersRef.current.forEach((marker) => marker.remove());
        markersRef.current.clear();

        const showLocationLabel = isPhonePortraitWeb
          ? true
          : shouldShowFoggyFilterMarkerLabel(
              layout,
              intensityFilter,
              false,
            );

        for (const location of locations) {
          const isVisible = isMapMarkerVisible(location, {
            intensityFilter,
            selectedRegionId: isPhonePortraitWeb ? null : selectedRegionId,
          });

          if (!isVisible && !isPhonePortraitWeb) {
            continue;
          }

          const element = isPhonePortraitWeb
            ? createPhonePortraitMapMarkerElement({
                location,
                isSelected: location.id === selectedLocationId,
                intensityFilter,
                showLocationLabel,
                isNighttime,
                onSelect: (locationId) => onSelectRef.current(locationId),
              })
            : createMapMarkerElement({
                location,
                isSelected: location.id === selectedLocationId,
                fogLayerEnabled,
                intensityFilter,
                selectedRegionId,
                layout,
                showLocationLabel,
                onSelect: (locationId) => onSelectRef.current(locationId),
              });

          // Phone-portrait anchors the weather icon directly on the coordinate
          // (zero marker offset); its per-location declutter offset lives on the
          // label/score group inside the marker DOM, never on the icon. Non-phone
          // markers keep their existing placement offset.
          const markerOffset = (
            isPhonePortraitWeb
              ? [0, 0]
              : getMapMarkerPlacementOptions(showLocationLabel).offset ?? [0, 0]
          ) as [number, number];

          const marker = new maplibregl.Marker({
            element,
            anchor: "center",
            offset: markerOffset,
          })
            .setLngLat([location.longitude, location.latitude])
            .addTo(mapRef.current);

          markersRef.current.set(location.id, marker);
        }

        if (!isPhonePortraitWeb || !mapRef.current) {
          return;
        }

        const mapInstance = mapRef.current;
        listenerMap = mapInstance;
        const entries: PhonePortraitDeclutterEntry[] = locations.flatMap(
          (location) => {
            const marker = markersRef.current.get(location.id);
            if (!marker) {
              return [];
            }

            return [
              {
                locationId: location.id,
                element: marker.getElement(),
                priority: getPhonePortraitMarkerPriority(location.id),
                score: location.sunshineScore,
                isSelected: selectedLocationId === location.id,
                // Canonical product-region resolver (backend region first,
                // then fallback assignment) — no second location-to-region map.
                productRegionId: getProductRegionIdForLocation(location),
              },
            ];
          },
        );

        // Single map-level zoom handler updates every mounted label/score
        // group's scaled offset — no per-marker listeners, no React re-render
        // per zoom frame. `zoom` fires continuously during a zoom gesture so
        // the offsets scale smoothly toward the icon.
        labelOffsetHandler = () =>
          updatePhonePortraitMarkerLabelOffsets(mapInstance, entries);
        labelOffsetHandler();
        mapInstance.on("zoom", labelOffsetHandler);

        // Low-zoom hiding of the SF/coastal cluster only applies in the all-Bay
        // composition (no active region). In a region camera the region's own
        // members stay eligible so a region never hides its own locations
        // (audit RC-4); collision alone declutters them.
        const applyLowZoomHiding = !selectedRegionId;

        // Declutter runs on move end and re-applies the same zoom-scaled offset
        // before measuring, so collision detection matches the rendered labels.
        declutterHandler = () =>
          declutterPhonePortraitMarkers(mapInstance, entries, {
            applyLowZoomHiding,
          });
        declutterHandler();
        mapInstance.on("moveend", declutterHandler);
      }

      syncMarkers();

      return () => {
        cancelled = true;
        if (listenerMap) {
          if (labelOffsetHandler) {
            listenerMap.off("zoom", labelOffsetHandler);
          }
          if (declutterHandler) {
            listenerMap.off("moveend", declutterHandler);
          }
        }
        const markers = markersRef.current;
        markers.forEach((marker) => marker.remove());
        markers.clear();
      };
    }, [
      fogLayerEnabled,
      immersiveOverlayProfile,
      intensityFilter,
      isPhonePortraitWeb,
      isNighttime,
      layout,
      locations,
      mapReady,
      selectedLocationId,
      selectedRegionId,
    ]);

    useEffect(() => {
      const map = mapRef.current;
      if (!map || !mapReady) {
        return;
      }

      syncFogOverlayLayer(
        map,
        locations,
        fogLayerEnabled,
        intensityFilter,
      );
    }, [
      fogLayerEnabled,
      intensityFilter,
      isPhonePortraitWeb,
      locations,
      mapReady,
    ]);

    useEffect(() => {
      const map = mapRef.current;
      if (!map || !mapReady) {
        return;
      }

      if (suppressViewportUpdateRef?.current) {
        suppressViewportUpdateRef.current = false;
        return;
      }

      if (isPhonePortraitWeb) {
        if (selectedLocationId) {
          return;
        }

        fitPhonePortraitRegionViewport(map, selectedRegionId, {
          duration: 450,
        });
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
        fitMapToBounds(
          map,
          region.bounds,
          resolveRegionViewportOptions(
            region.viewport,
            layout,
            immersiveOverlayProfile,
          ),
        );
        return;
      }

      if (intensityFilter) {
        const bounds = boundsForIntensityLocations(locations, intensityFilter);
        if (bounds) {
          fitMapToBounds(
            map,
            bounds,
            resolveIntensityFilterFitOptions(layout, immersiveOverlayProfile),
          );
          return;
        }
      }

      const immersiveFit = isImmersive
        ? getImmersiveDefaultBayAreaFitOptions(immersiveOverlayProfile)
        : null;
      fitDefaultBayAreaViewport(
        map,
        immersiveFit?.padding,
        immersiveFit?.maxZoom ?? BAY_AREA_DEFAULT_MAX_ZOOM,
      );
    }, [
      immersiveOverlayProfile,
      intensityFilter,
      isImmersive,
      isPhonePortraitWeb,
      layout,
      locations,
      mapReady,
      selectedLocationId,
      selectedRegionId,
      suppressViewportUpdateRef,
    ]);

    useEffect(() => {
      const map = mapRef.current;
      if (!map || !mapReady) {
        return;
      }

      const phonePortrait = phonePortraitWebRef.current;
      if (phonePortraitStyleAppliedRef.current === phonePortrait) {
        return;
      }

      phonePortraitStyleAppliedRef.current = phonePortrait;

      const nextStyle = resolveKarlMapStyle(mapStyle, {
        phonePortraitWeb: phonePortrait,
      });

      const applyPhonePortraitViewport = () => {
        if (!phonePortraitWebRef.current || selectedLocationIdRef.current) {
          return;
        }

        fitPhonePortraitRegionViewport(map, selectedRegionIdRef.current);
      };

      const applyStyle = () => {
        syncFogOverlayLayer(
          map,
          locations,
          fogLayerEnabled,
          intensityFilter,
        );

        if (phonePortraitWebRef.current) {
          applyPhonePortraitViewport();
          map.once("idle", applyPhonePortraitViewport);
          return;
        }

        if (selectedLocationIdRef.current) {
          const location = locations.find(
            (item) => item.id === selectedLocationIdRef.current,
          );
          if (location) {
            focusMapOnLocation(map, location.longitude, location.latitude);
          }
        }
      };

      map.once("style.load", applyStyle);
      map.setStyle(nextStyle);
    }, [fogLayerEnabled, intensityFilter, isPhonePortraitWeb, locations, mapReady, mapStyle]);

    return (
      <div
        className={`relative w-full ${
          isFullBleed ? "h-full min-h-screen" : "h-full min-h-[360px]"
        } ${isPhonePortraitWeb ? "karl-map-phone-portrait-host" : ""}`}
      >
        <div
          ref={containerRef}
          data-testid="bay-area-map"
          className={`karl-map-canvas w-full ${
            isFullBleed ? "h-full min-h-screen" : "h-full min-h-[360px]"
          }`}
        />
        {isPhonePortraitWeb ? (
          <div
            aria-hidden
            className="karl-map-phone-portrait-vignette pointer-events-none absolute inset-0 z-[1]"
          />
        ) : null}
        {/* Phone-portrait renders the canonical Fog Layer trigger inside
            MapView's shared control group (above the Fog Intensity rail), so
            skip the in-map control here to avoid a duplicate trigger. */}
        {isPhonePortraitWeb ? null : (
          <MapLayerControls
            layout={layout}
            mapStyle={mapStyle}
            fogLayerEnabled={fogLayerEnabled}
            onMapStyleChange={onMapStyleChange}
            onFogLayerChange={onFogLayerChange}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onImmersivePanelOpenChange={onImmersiveLayersPanelOpenChange}
          />
        )}
        {!isFullBleed && fogLayerEnabled && !isPhonePortraitWeb ? (
          <MapFogLegend layout="mobile" />
        ) : null}
        {!isFullBleed && !isPhonePortraitWeb ? (
          <>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-karl-navy/70 to-transparent"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-karl-navy/80 to-transparent"
            />
          </>
        ) : null}
        {isLoading || !mapReady ? (
          <div className="absolute inset-0 flex items-center justify-center bg-karl-navy/55 px-6 text-center text-sm text-white/60 backdrop-blur-[1px]">
            {isLoading
              ? "Loading Bay Area locations…"
              : "Preparing Bay Area map…"}
          </div>
        ) : null}
      </div>
    );
  },
);
