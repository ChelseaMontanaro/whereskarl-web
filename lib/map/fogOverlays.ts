import {
  getLocationFogOverlayStyle,
  locationMatchesFogIntensityFilter,
  resolveLocationFogIntensity,
  type FogIntensity,
  type LocationConditionInput,
} from "@/lib/map/conditions";

export const FOG_OVERLAY_SOURCE_ID = "karl-fog-overlays";
export const FOG_OVERLAY_LAYER_ID = "karl-fog-overlays-fill";

/** Organic fog bank layers per location for soft cinematic overlap. */
export const FOG_BANK_LAYERS = [
  { scale: 0.52, opacityFactor: 1, points: 20 },
  { scale: 0.78, opacityFactor: 0.62, points: 22 },
  { scale: 1, opacityFactor: 0.34, points: 24 },
] as const;

export type FogOverlayLocation = LocationConditionInput & {
  id: string;
  longitude: number;
  latitude: number;
};

function hashSeed(value: string): number {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 1000;
  }

  return hash / 1000;
}

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

function radiusWobble(angle: number, seed: number): number {
  const wobble =
    Math.sin(angle * 3 + seed * 6.28) * 0.14 +
    Math.cos(angle * 5 + seed * 4.1) * 0.09 +
    Math.sin(angle * 7 + seed * 2.7) * 0.05;

  return 1 + wobble;
}

/**
 * Builds a soft, cloud-like fog bank polygon instead of a perfect geodesic circle.
 */
export function createOrganicFogPolygon(
  longitude: number,
  latitude: number,
  radiusMeters: number,
  seed: number,
  points = 24,
): GeoJSON.Polygon {
  const coordinates: [number, number][] = [];
  const earthRadius = 6371000;
  const latitudeRadians = (latitude * Math.PI) / 180;
  const driftLongitude = Math.sin(seed * 9.4) * radiusMeters * 0.08;
  const driftLatitude = Math.cos(seed * 7.2) * radiusMeters * 0.08;

  for (let index = 0; index <= points; index += 1) {
    const angle = (index / points) * 2 * Math.PI;
    const effectiveRadius = radiusMeters * radiusWobble(angle, seed);
    const deltaX = effectiveRadius * Math.cos(angle) + driftLongitude;
    const deltaY = effectiveRadius * Math.sin(angle) + driftLatitude;
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
 * Builds location-based fog banks from shared backend fog scores.
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

    const seed = hashSeed(location.id);

    for (const [layerIndex, layer] of FOG_BANK_LAYERS.entries()) {
      features.push({
        type: "Feature",
        id: `${location.id}-fog-${layerIndex}`,
        geometry: createOrganicFogPolygon(
          location.longitude,
          location.latitude,
          overlayStyle.radiusMeters * layer.scale,
          seed + layerIndex * 0.37,
          layer.points,
        ),
        properties: {
          color: overlayStyle.color,
          opacity: overlayStyle.opacity * layer.opacityFactor,
          intensity: markerIntensity,
          fogLayer: layerIndex,
        },
      });
    }
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
      "fill-antialias": true,
    },
  });
}
