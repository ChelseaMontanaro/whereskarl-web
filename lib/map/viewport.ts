import type { Map } from "maplibre-gl";

import {
  BAY_AREA_DEFAULT_BOUNDS,
  BAY_AREA_DEFAULT_MAX_ZOOM,
  BAY_AREA_DEFAULT_VIEWPORT_PADDING,
  BAY_AREA_IMMERSIVE_MAX_ZOOM,
  BAY_AREA_IMMERSIVE_PHONE_PORTRAIT_VIEWPORT_PADDING,
  BAY_AREA_IMMERSIVE_VIEWPORT_PADDING,
  BAY_AREA_LOCATION_ZOOM,
  type BayAreaProductRegionViewport,
  type ImmersiveOverlayProfile,
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
  immersiveProfile: ImmersiveOverlayProfile = "tablet",
): { padding?: ViewportPadding; maxZoom?: number } | undefined {
  if (!viewport) {
    return undefined;
  }

  const padding =
    layout === "desktop" && viewport.desktopPadding !== undefined
      ? viewport.desktopPadding
      : layout === "immersive" && immersiveProfile === "phone-portrait"
        ? BAY_AREA_IMMERSIVE_PHONE_PORTRAIT_VIEWPORT_PADDING
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

export function getImmersiveDefaultBayAreaFitOptions(
  immersiveProfile: ImmersiveOverlayProfile = "tablet",
): {
  padding: ViewportPadding;
  maxZoom: number;
} {
  return {
    padding:
      immersiveProfile === "phone-portrait"
        ? BAY_AREA_IMMERSIVE_PHONE_PORTRAIT_VIEWPORT_PADDING
        : BAY_AREA_IMMERSIVE_VIEWPORT_PADDING,
    maxZoom: BAY_AREA_IMMERSIVE_MAX_ZOOM,
  };
}

const immersiveIntensityFilterPadding = {
  top: 132,
  right: 44,
  bottom: 208,
  left: 168,
};

const immersivePhonePortraitIntensityFilterPadding = {
  top: 72,
  right: 44,
  bottom: 208,
  left: 78,
};

export function resolveIntensityFilterFitOptions(
  layout: "mobile" | "desktop" | "immersive",
  immersiveProfile: ImmersiveOverlayProfile = "tablet",
): { padding: ViewportPadding; maxZoom: number } {
  if (layout === "immersive") {
    return {
      padding:
        immersiveProfile === "phone-portrait"
          ? immersivePhonePortraitIntensityFilterPadding
          : immersiveIntensityFilterPadding,
      maxZoom: 10,
    };
  }

  return {
    padding: 80,
    maxZoom: 10.4,
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
