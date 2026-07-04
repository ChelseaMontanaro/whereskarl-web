import {
  getLocationFogOverlayStyle,
  locationMatchesFogIntensityFilter,
  resolveLocationFogIntensity,
  type FogIntensity,
  type LocationConditionInput,
} from "@/lib/map/conditions";

export const FOG_OVERLAY_SOURCE_ID = "karl-fog-overlays";
export const FOG_OVERLAY_LAYER_ID = "karl-fog-overlays-fill";

/** Merge nearby coastal fog sites into shared atmospheric banks. */
export const FOG_CLUSTER_MERGE_DISTANCE_METERS = 12_000;

/** Expands qualified radii for cinematic marine-layer scale without changing scoring. */
export const FOG_VISUAL_RADIUS_MULTIPLIER = 2.75;

/** Few large feathered banks per cluster instead of per-location blobs. */
export const FOG_BANK_LAYERS = [
  { scale: 2.65, opacityFactor: 0.11, points: 12 },
  { scale: 1.45, opacityFactor: 0.24, points: 14 },
  { scale: 0.82, opacityFactor: 0.42, points: 12 },
] as const;

export type FogOverlayLocation = LocationConditionInput & {
  id: string;
  longitude: number;
  latitude: number;
};

type QualifiedFogSite = {
  location: FogOverlayLocation;
  intensity: FogIntensity;
  overlayStyle: NonNullable<ReturnType<typeof getLocationFogOverlayStyle>>;
};

export type FogOverlayCluster = {
  id: string;
  longitude: number;
  latitude: number;
  visualRadiusMeters: number;
  color: string;
  opacity: number;
  intensity: FogIntensity;
  memberIds: string[];
};

const INTENSITY_RANK: Record<FogIntensity, number> = {
  clear: 0,
  lightFog: 1,
  foggy: 2,
  karlTerritory: 3,
};

function hashSeed(value: string): number {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 1000;
  }

  return hash / 1000;
}

function resolveFogScore(location: LocationConditionInput): number {
  return location.fogScore ?? 0;
}

export function haversineDistanceMeters(
  latitudeA: number,
  longitudeA: number,
  latitudeB: number,
  longitudeB: number,
): number {
  const earthRadius = 6_371_000;
  const deltaLatitude = ((latitudeB - latitudeA) * Math.PI) / 180;
  const deltaLongitude = ((longitudeB - longitudeA) * Math.PI) / 180;
  const latitudeARadians = (latitudeA * Math.PI) / 180;
  const latitudeBRadians = (latitudeB * Math.PI) / 180;
  const haversine =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(latitudeARadians) *
      Math.cos(latitudeBRadians) *
      Math.sin(deltaLongitude / 2) ** 2;

  return 2 * earthRadius * Math.asin(Math.sqrt(haversine));
}

function sitesAreWithinMergeDistance(
  left: QualifiedFogSite,
  right: QualifiedFogSite,
): boolean {
  return (
    haversineDistanceMeters(
      left.location.latitude,
      left.location.longitude,
      right.location.latitude,
      right.location.longitude,
    ) <= FOG_CLUSTER_MERGE_DISTANCE_METERS
  );
}

function buildFogCluster(members: QualifiedFogSite[]): FogOverlayCluster {
  const totalWeight = members.reduce(
    (sum, member) => sum + Math.max(resolveFogScore(member.location), 1),
    0,
  );
  const weightedLatitude =
    members.reduce(
      (sum, member) =>
        sum + member.location.latitude * Math.max(resolveFogScore(member.location), 1),
      0,
    ) / totalWeight;
  const weightedLongitude =
    members.reduce(
      (sum, member) =>
        sum +
        member.location.longitude * Math.max(resolveFogScore(member.location), 1),
      0,
    ) / totalWeight;

  const dominantMember = members.reduce((strongest, member) =>
    INTENSITY_RANK[member.intensity] > INTENSITY_RANK[strongest.intensity]
      ? member
      : strongest,
  );
  const maxQualifiedRadius = Math.max(
    ...members.map((member) => member.overlayStyle.radiusMeters),
  );
  const clusterSpreadMeters = Math.max(
    0,
    ...members.map((member) =>
      haversineDistanceMeters(
        weightedLatitude,
        weightedLongitude,
        member.location.latitude,
        member.location.longitude,
      ),
    ),
  );
  const marineDriftMeters = maxQualifiedRadius * 0.12;

  return {
    id: members
      .map((member) => member.location.id)
      .sort()
      .join("+"),
    longitude:
      weightedLongitude -
      marineDriftMeters /
        (6_371_000 * Math.cos((weightedLatitude * Math.PI) / 180)) *
        (180 / Math.PI),
    latitude: weightedLatitude,
    visualRadiusMeters:
      (maxQualifiedRadius + clusterSpreadMeters * 0.65) *
      FOG_VISUAL_RADIUS_MULTIPLIER,
    color: dominantMember.overlayStyle.color,
    opacity: Math.max(...members.map((member) => member.overlayStyle.opacity)),
    intensity: dominantMember.intensity,
    memberIds: members.map((member) => member.location.id),
  };
}

export function clusterFogOverlaySites(
  sites: QualifiedFogSite[],
): FogOverlayCluster[] {
  const clusters: FogOverlayCluster[] = [];
  const assigned = new Set<string>();

  for (const seedSite of sites) {
    if (assigned.has(seedSite.location.id)) {
      continue;
    }

    const members = [seedSite];
    assigned.add(seedSite.location.id);
    let expanded = true;

    while (expanded) {
      expanded = false;

      for (const candidate of sites) {
        if (assigned.has(candidate.location.id)) {
          continue;
        }

        const isNearby = members.some((member) =>
          sitesAreWithinMergeDistance(member, candidate),
        );

        if (isNearby) {
          members.push(candidate);
          assigned.add(candidate.location.id);
          expanded = true;
        }
      }
    }

    clusters.push(buildFogCluster(members));
  }

  return clusters;
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
    Math.sin(angle * 2 + seed * 6.28) * 0.18 +
    Math.cos(angle * 4 + seed * 4.1) * 0.12 +
    Math.sin(angle * 6 + seed * 2.7) * 0.07;

  return 1 + wobble;
}

function marineStretch(angle: number): number {
  const westward = Math.max(0, -Math.cos(angle));
  const eastward = Math.max(0, Math.cos(angle));

  return 1 + westward * 0.34 - eastward * 0.14;
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
  const driftLongitude = Math.sin(seed * 9.4) * radiusMeters * 0.14;
  const driftLatitude = Math.cos(seed * 7.2) * radiusMeters * 0.06;

  for (let index = 0; index <= points; index += 1) {
    const angle = (index / points) * 2 * Math.PI;
    const effectiveRadius =
      radiusMeters * radiusWobble(angle, seed) * marineStretch(angle);
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

function collectQualifiedFogSites(
  locations: FogOverlayLocation[],
  intensityFilter: FogIntensity | null,
): QualifiedFogSite[] {
  const sites: QualifiedFogSite[] = [];

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

    sites.push({
      location,
      intensity: markerIntensity,
      overlayStyle,
    });
  }

  return sites;
}

/**
 * Builds atmospheric fog banks from shared backend fog scores.
 * Geographic fog rasters/polygons can replace this source later without changing controls.
 */
export function buildLocationFogOverlayCollection(
  locations: FogOverlayLocation[],
  intensityFilter: FogIntensity | null = null,
): GeoJSON.FeatureCollection {
  const features: GeoJSON.Feature[] = [];
  const sites = collectQualifiedFogSites(locations, intensityFilter);
  const clusters = clusterFogOverlaySites(sites);

  for (const cluster of clusters) {
    const seed = hashSeed(cluster.id);

    for (const [layerIndex, layer] of FOG_BANK_LAYERS.entries()) {
      features.push({
        type: "Feature",
        id: `${cluster.id}-fog-${layerIndex}`,
        geometry: createOrganicFogPolygon(
          cluster.longitude,
          cluster.latitude,
          cluster.visualRadiusMeters * layer.scale,
          seed + layerIndex * 0.37,
          layer.points,
        ),
        properties: {
          color: cluster.color,
          opacity: cluster.opacity * layer.opacityFactor,
          intensity: cluster.intensity,
          fogLayer: layerIndex,
          memberIds: cluster.memberIds,
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
