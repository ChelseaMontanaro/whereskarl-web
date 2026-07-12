import type { Map } from "maplibre-gl";

import { BAY_AREA_LOCATION_ZOOM } from "@/lib/map/config";
import {
  getPhonePortraitCameraPreset,
  PHONE_PORTRAIT_EAST_BAY_REGION_BOUNDS,
  PHONE_PORTRAIT_EAST_BAY_VIEWPORT_PADDING,
  PHONE_PORTRAIT_MAP_MAX_ZOOM,
  PHONE_PORTRAIT_NORTH_BAY_REGION_BOUNDS,
  PHONE_PORTRAIT_NORTH_BAY_VIEWPORT_PADDING,
  PHONE_PORTRAIT_PENINSULA_CAMERA,
  PHONE_PORTRAIT_PENINSULA_VIEWPORT_PADDING,
  PHONE_PORTRAIT_SF_REGION_BOUNDS,
  PHONE_PORTRAIT_SF_VIEWPORT_PADDING,
  PHONE_PORTRAIT_SOUTH_BAY_REGION_BOUNDS,
  PHONE_PORTRAIT_SOUTH_BAY_VIEWPORT_PADDING,
} from "@/lib/map/phonePortraitMapPresentation";

function normalizePhonePortraitPadding(
  padding:
    | typeof PHONE_PORTRAIT_SF_VIEWPORT_PADDING
    | typeof PHONE_PORTRAIT_NORTH_BAY_VIEWPORT_PADDING
    | typeof PHONE_PORTRAIT_EAST_BAY_VIEWPORT_PADDING
    | typeof PHONE_PORTRAIT_PENINSULA_VIEWPORT_PADDING
    | typeof PHONE_PORTRAIT_SOUTH_BAY_VIEWPORT_PADDING,
): { top: number; bottom: number; left: number; right: number } {
  if (typeof padding === "number") {
    return { top: padding, bottom: padding, left: padding, right: padding };
  }

  return {
    top: padding.top ?? 48,
    right: padding.right ?? 48,
    bottom: padding.bottom ?? 48,
    left: padding.left ?? 48,
  };
}

const ZERO_TRANSFORM_PADDING = { top: 0, right: 0, bottom: 0, left: 0 };

export function fitPhonePortraitRegionViewport(
  map: Map,
  regionId: string | null | undefined,
  options?: { duration?: number },
): void {
  const duration = options?.duration ?? 0;

  // MapLibre's `fitBounds` reads the map's persistent transform padding
  // (`tr.padding`) and adds it on top of the padding passed here, but never
  // resets it. The Peninsula preset applies persistent padding via
  // `jumpTo`/`easeTo`, so once it runs every later `fitBounds` region would
  // double-count that leftover padding and reframe incorrectly. Reset to a
  // clean zero baseline first so each region is framed deterministically on
  // every selection, no matter which region was shown before.
  map.setPadding(ZERO_TRANSFORM_PADDING);

  if (regionId === "san-francisco") {
    const padding = normalizePhonePortraitPadding(
      PHONE_PORTRAIT_SF_VIEWPORT_PADDING,
    );

    map.fitBounds(PHONE_PORTRAIT_SF_REGION_BOUNDS, {
      padding,
      maxZoom: PHONE_PORTRAIT_MAP_MAX_ZOOM,
      duration,
      essential: true,
    });
    return;
  }

  if (regionId === "north-bay") {
    const padding = normalizePhonePortraitPadding(
      PHONE_PORTRAIT_NORTH_BAY_VIEWPORT_PADDING,
    );

    map.fitBounds(PHONE_PORTRAIT_NORTH_BAY_REGION_BOUNDS, {
      padding,
      maxZoom: PHONE_PORTRAIT_MAP_MAX_ZOOM,
      duration,
      essential: true,
    });
    return;
  }

  if (regionId === "east-bay") {
    const padding = normalizePhonePortraitPadding(
      PHONE_PORTRAIT_EAST_BAY_VIEWPORT_PADDING,
    );

    map.fitBounds(PHONE_PORTRAIT_EAST_BAY_REGION_BOUNDS, {
      padding,
      maxZoom: PHONE_PORTRAIT_MAP_MAX_ZOOM,
      duration,
      essential: true,
    });
    return;
  }

  if (regionId === "south-bay") {
    const padding = normalizePhonePortraitPadding(
      PHONE_PORTRAIT_SOUTH_BAY_VIEWPORT_PADDING,
    );

    map.fitBounds(PHONE_PORTRAIT_SOUTH_BAY_REGION_BOUNDS, {
      padding,
      maxZoom: PHONE_PORTRAIT_MAP_MAX_ZOOM,
      duration,
      essential: true,
    });
    return;
  }

  if (regionId === "peninsula") {
    const preset = PHONE_PORTRAIT_PENINSULA_CAMERA;
    const padding = normalizePhonePortraitPadding(
      PHONE_PORTRAIT_PENINSULA_VIEWPORT_PADDING,
    );
    const camera = {
      center: [preset.longitude, preset.latitude] as [number, number],
      zoom: preset.zoom,
      padding,
    };

    if (duration > 0) {
      map.easeTo({ ...camera, duration, essential: true });
    } else {
      map.jumpTo(camera);
    }
    return;
  }

  const preset = getPhonePortraitCameraPreset(regionId);
  const camera = {
    center: [preset.longitude, preset.latitude] as [number, number],
    zoom: preset.zoom,
  };

  if (duration > 0) {
    map.easeTo({ ...camera, duration, essential: true });
  } else {
    map.jumpTo(camera);
  }
}

/** @deprecated Use fitPhonePortraitRegionViewport with "san-francisco". */
export function fitPhonePortraitMapViewport(
  map: Map,
  options?: { duration?: number },
): void {
  fitPhonePortraitRegionViewport(map, "san-francisco", options);
}

export function locatePhonePortraitMap(map: Map): void {
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
}
