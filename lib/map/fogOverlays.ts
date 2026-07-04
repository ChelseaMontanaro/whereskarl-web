import {
  getLocationFogOverlayStyle,
  locationMatchesFogIntensityFilter,
  resolveLocationFogIntensity,
  type FogIntensity,
  type LocationConditionInput,
} from "@/lib/map/conditions";

export const FOG_OVERLAY_SOURCE_ID = "karl-fog-overlays";
export const FOG_OVERLAY_LAYER_ID = "karl-fog-overlays-fill";

export type FogOverlayLocation = LocationConditionInput & {
  id: string;
  longitude: number;
  latitude: number;
};

export function createCirclePolygon(
  longitude: number,
  latitude: number,
  radiusMeters: number,
  points = 32,
): GeoJSON.Polygon {
  const coordinates: [number, number][] = [];
  const earthRadius = 6371000;
  const latitudeRadians = (latitude * Math.PI) / 180;

  for (let index = 0; index <= points; index += 1) {
    const angle = (index / points) * 2 * Math.PI;
    const deltaX = radiusMeters * Math.cos(angle);
    const deltaY = radiusMeters * Math.sin(angle);
    const deltaLatitude = deltaY / earthRadius;
    const deltaLongitude = deltaX / (earthRadius * Math.cos(latitudeRadians));

    coordinates.push([
      longitude + (deltaLongitude * 180) / Math.PI,
      latitude + (deltaLatitude * 180) / Math.PI,
    ]);
  }

  return {
    type: "Polygon",
    coordinates: [coordinates],
  };
}

/**
 * Builds location-based fog circles from shared backend fog scores.
 * Geographic fog rasters/polygons can replace this source later without changing controls.
 */
export function buildLocationFogOverlayCollection(
  locations: FogOverlayLocation[],
  intensityFilter: FogIntensity | null = null,
): GeoJSON.FeatureCollection {
  const features: GeoJSON.Feature[] = [];

  for (const location of locations) {
    const markerIntensity = resolveLocationFogIntensity(location);
    const overlayStyle = getLocationFogOverlayStyle(location);

    if (!overlayStyle) {
      continue;
    }

    if (
      intensityFilter &&
      !locationMatchesFogIntensityFilter(location, intensityFilter)
    ) {
      continue;
    }

    features.push({
      type: "Feature",
      id: location.id,
      geometry: createCirclePolygon(
        location.longitude,
        location.latitude,
        overlayStyle.radiusMeters,
      ),
      properties: {
        color: overlayStyle.color,
        opacity: overlayStyle.opacity,
        intensity: markerIntensity,
      },
    });
  }

  return {
    type: "FeatureCollection",
    features,
  };
}

export function removeFogOverlayLayer(map: import("maplibre-gl").Map): void {
  if (map.getLayer(FOG_OVERLAY_LAYER_ID)) {
    map.removeLayer(FOG_OVERLAY_LAYER_ID);
  }

  if (map.getSource(FOG_OVERLAY_SOURCE_ID)) {
    map.removeSource(FOG_OVERLAY_SOURCE_ID);
  }
}

export function syncFogOverlayLayer(
  map: import("maplibre-gl").Map,
  locations: FogOverlayLocation[],
  enabled: boolean,
  intensityFilter: FogIntensity | null = null,
): void {
  removeFogOverlayLayer(map);

  if (!enabled || intensityFilter === "clear") {
    return;
  }

  const collection = buildLocationFogOverlayCollection(
    locations,
    intensityFilter,
  );
  map.addSource(FOG_OVERLAY_SOURCE_ID, {
    type: "geojson",
    data: collection,
  });

  map.addLayer({
    id: FOG_OVERLAY_LAYER_ID,
    type: "fill",
    source: FOG_OVERLAY_SOURCE_ID,
    paint: {
      "fill-color": ["get", "color"],
      "fill-opacity": ["get", "opacity"],
    },
  });
}
