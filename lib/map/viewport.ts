import type { Map } from "maplibre-gl";

import {
  BAY_AREA_DEFAULT_BOUNDS,
  BAY_AREA_DEFAULT_MAX_ZOOM,
  BAY_AREA_DEFAULT_VIEWPORT_PADDING,
  BAY_AREA_LOCATION_ZOOM,
  type MapBounds,
} from "@/lib/map/config";

export function fitDefaultBayAreaViewport(
  map: Map,
  padding = BAY_AREA_DEFAULT_VIEWPORT_PADDING,
): void {
  map.fitBounds(BAY_AREA_DEFAULT_BOUNDS, {
    padding,
    maxZoom: BAY_AREA_DEFAULT_MAX_ZOOM,
    essential: true,
  });
}

export function fitMapToBounds(
  map: Map,
  bounds: MapBounds,
  options?: { padding?: number; maxZoom?: number },
): void {
  map.fitBounds(bounds, {
    padding: options?.padding ?? 48,
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
