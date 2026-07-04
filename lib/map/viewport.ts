import type { Map } from "maplibre-gl";

import {
  BAY_AREA_DEFAULT_BOUNDS,
  BAY_AREA_DEFAULT_MAX_ZOOM,
  BAY_AREA_DEFAULT_VIEWPORT_PADDING,
  BAY_AREA_IMMERSIVE_MAX_ZOOM,
  BAY_AREA_IMMERSIVE_VIEWPORT_PADDING,
  BAY_AREA_LOCATION_ZOOM,
  type BayAreaProductRegionViewport,
  type MapBounds,
  type ViewportPadding,
} from "@/lib/map/config";

export {
  BAY_AREA_IMMERSIVE_MAX_ZOOM,
  BAY_AREA_IMMERSIVE_MIN_ZOOM,
} from "@/lib/map/config";

export { BAY_AREA_IMMERSIVE_VIEWPORT_PADDING };

export function resolveRegionViewportOptions(
  viewport: BayAreaProductRegionViewport | undefined,
  layout: "mobile" | "desktop" | "immersive",
): { padding?: ViewportPadding; maxZoom?: number } | undefined {
  if (!viewport) {
    return undefined;
  }

  const padding =
    layout === "desktop" && viewport.desktopPadding !== undefined
      ? viewport.desktopPadding
      : layout === "immersive" && viewport.immersivePadding !== undefined
        ? viewport.immersivePadding
        : viewport.padding;

  return {
    padding,
    maxZoom: viewport.maxZoom,
  };
}

function normalizeViewportPadding(
  padding: ViewportPadding | undefined,
  fallback = 48,
): number | { top: number; bottom: number; left: number; right: number } {
  if (padding === undefined) {
    return fallback;
  }

  if (typeof padding === "number") {
    return padding;
  }

  return {
    top: padding.top ?? fallback,
    right: padding.right ?? fallback,
    bottom: padding.bottom ?? fallback,
    left: padding.left ?? fallback,
  };
}

export function fitDefaultBayAreaViewport(
  map: Map,
  padding: ViewportPadding = BAY_AREA_DEFAULT_VIEWPORT_PADDING,
  maxZoom: number = BAY_AREA_DEFAULT_MAX_ZOOM,
): void {
  map.fitBounds(BAY_AREA_DEFAULT_BOUNDS, {
    padding: normalizeViewportPadding(padding, BAY_AREA_DEFAULT_VIEWPORT_PADDING),
    maxZoom,
    essential: true,
  });
}

export function getImmersiveDefaultBayAreaFitOptions(): {
  padding: ViewportPadding;
  maxZoom: number;
} {
  return {
    padding: BAY_AREA_IMMERSIVE_VIEWPORT_PADDING,
    maxZoom: BAY_AREA_IMMERSIVE_MAX_ZOOM,
  };
}

export function fitMapToBounds(
  map: Map,
  bounds: MapBounds,
  options?: { padding?: ViewportPadding; maxZoom?: number },
): void {
  map.fitBounds(bounds, {
    padding: normalizeViewportPadding(options?.padding),
    maxZoom: options?.maxZoom ?? 11,
    essential: true,
  });
}

export function focusMapOnLocation(
  map: Map,
  longitude: number,
  latitude: number,
): void {
  map.flyTo({
    center: [longitude, latitude],
    zoom: BAY_AREA_LOCATION_ZOOM,
    essential: true,
  });
}
