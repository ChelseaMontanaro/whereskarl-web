import { describe, expect, it } from "vitest";

import {
  buildLocationFogOverlayCollection,
  clusterFogOverlaySites,
  createCirclePolygon,
  createOrganicFogPolygon,
  FOG_BANK_LAYERS,
  FOG_CLUSTER_MERGE_DISTANCE_METERS,
  FOG_VISUAL_RADIUS_MULTIPLIER,
  haversineDistanceMeters,
} from "@/lib/map/fogOverlays";
import { getLocationFogOverlayStyle } from "@/lib/map/conditions";

const tiburon = {
  id: "tiburon",
  latitude: 37.8735,
  longitude: -122.4566,
  fogScore: 82,
  sunshineScore: 18,
};

const sausalito = {
  id: "sausalito",
  latitude: 37.8591,
  longitude: -122.4853,
  fogScore: 60,
  sunshineScore: 40,
};

describe("fog overlays", () => {
  it("builds location-based fog circles only for foggy scores", () => {
    const collection = buildLocationFogOverlayCollection([tiburon, sausalito]);

    expect(collection.features).toHaveLength(FOG_BANK_LAYERS.length);
    expect(collection.features[0]?.properties).toMatchObject({
      intensity: "karlTerritory",
      fogLayer: 0,
    });
  });

  it("suppresses fog circles for clear-qualified locations even in the raw Light Fog band", () => {
    const collection = buildLocationFogOverlayCollection([
      {
        id: "tiburon",
        latitude: 37.8735,
        longitude: -122.4566,
        fogScore: 26,
        sunshineScore: 82,
      },
    ]);

    expect(collection.features).toHaveLength(0);
  });

  it("renders light fog circles for moderate fog locations", () => {
    const collection = buildLocationFogOverlayCollection([
      {
        id: "moderate-fog",
        latitude: 37.5,
        longitude: -122.2,
        fogScore: 35,
        sunshineScore: 55,
      },
    ]);

    expect(collection.features).toHaveLength(FOG_BANK_LAYERS.length);
    expect(collection.features[0]?.properties?.intensity).toBe("lightFog");
  });

  it("only renders overlays matching the active intensity filter", () => {
    const locations = [tiburon, sausalito];

    const clearFilter = buildLocationFogOverlayCollection(locations, "clear");
    const karlFilter = buildLocationFogOverlayCollection(
      locations,
      "karlTerritory",
    );

    expect(clearFilter.features).toHaveLength(0);
    expect(karlFilter.features).toHaveLength(FOG_BANK_LAYERS.length);
    expect(karlFilter.features[0]?.properties).toMatchObject({
      intensity: "karlTerritory",
    });
  });

  it("suppresses all fog circles when the clear intensity filter is active", () => {
    const collection = buildLocationFogOverlayCollection(
      [tiburon, sausalito],
      "clear",
    );

    expect(collection.features).toHaveLength(0);
  });

  it("renders light fog overlays when the light fog intensity filter is active", () => {
    const collection = buildLocationFogOverlayCollection(
      [
        {
          id: "sausalito",
          latitude: 37.8591,
          longitude: -122.4853,
          fogScore: 35,
          sunshineScore: 40,
        },
      ],
      "lightFog",
    );

    expect(collection.features).toHaveLength(FOG_BANK_LAYERS.length);
    expect(collection.features[0]?.properties).toMatchObject({
      intensity: "lightFog",
    });
  });

  it("renders foggy overlays when the foggy intensity filter is active", () => {
    const collection = buildLocationFogOverlayCollection(
      [tiburon, sausalito],
      "foggy",
    );

    expect(collection.features).toHaveLength(FOG_BANK_LAYERS.length);
    expect(collection.features[0]?.properties).toMatchObject({
      intensity: "foggy",
    });
  });

  it("creates a closed polygon for overlay rendering", () => {
    const polygon = createCirclePolygon(-122.45, 37.87, 2500, 8);
    const ring = polygon.coordinates[0];

    expect(ring[0]).toEqual(ring[ring.length - 1]);
    expect(ring.length).toBeGreaterThan(4);
  });

  it("builds organic fog bank polygons with soft overlap layers", () => {
    const polygon = createOrganicFogPolygon(-122.45, 37.87, 2500, 0.42, 12);
    const ring = polygon.coordinates[0];

    expect(ring[0]).toEqual(ring[ring.length - 1]);
    expect(ring.length).toBeGreaterThan(8);

    const perfectCircle = createCirclePolygon(-122.45, 37.87, 2500, 12);
    const perfectRing = perfectCircle.coordinates[0];
    const hasIrregularRadius = ring.some((coordinate, index) => {
      if (index === 0 || index === ring.length - 1) {
        return false;
      }

      const perfectCoordinate = perfectRing[index];
      return (
        coordinate[0] !== perfectCoordinate?.[0] ||
        coordinate[1] !== perfectCoordinate?.[1]
      );
    });

    expect(hasIrregularRadius).toBe(true);
  });

  it("uses cinematic bluish-gray fog tones with layered opacity falloff", () => {
    const collection = buildLocationFogOverlayCollection([tiburon]);

    const opacities = collection.features.map(
      (feature) => feature.properties?.opacity as number,
    );

    expect(collection.features[0]?.properties?.color).toBe("rgb(184 214 237)");
    expect(opacities[0]).toBeLessThan(opacities[1] ?? 1);
    expect(opacities[1]).toBeLessThan(opacities[2] ?? 1);
    expect(opacities[2]).toBeGreaterThan(opacities[0] ?? 0);
  });

  it("merges nearby coastal fog sites into one atmospheric bank", () => {
    const distance = haversineDistanceMeters(
      tiburon.latitude,
      tiburon.longitude,
      sausalito.latitude,
      sausalito.longitude,
    );

    expect(distance).toBeLessThan(FOG_CLUSTER_MERGE_DISTANCE_METERS);

    const isolated = buildLocationFogOverlayCollection([tiburon]);
    const merged = buildLocationFogOverlayCollection([tiburon, sausalito]);

    expect(isolated.features).toHaveLength(FOG_BANK_LAYERS.length);
    expect(merged.features).toHaveLength(FOG_BANK_LAYERS.length);
    expect(merged.features[0]?.properties?.memberIds).toEqual(
      expect.arrayContaining(["tiburon", "sausalito"]),
    );
  });

  it("scales qualified radii visually without changing qualification data", () => {
    const overlayStyle = getLocationFogOverlayStyle(tiburon);
    const clusters = clusterFogOverlaySites([
      {
        location: tiburon,
        intensity: "karlTerritory",
        overlayStyle: overlayStyle!,
      },
    ]);

    expect(overlayStyle?.radiusMeters).toBe(2800 + 82 * 58);
    expect(clusters[0]?.visualRadiusMeters).toBeGreaterThan(
      overlayStyle!.radiusMeters,
    );
    expect(clusters[0]?.visualRadiusMeters).toBeGreaterThanOrEqual(
      overlayStyle!.radiusMeters * FOG_VISUAL_RADIUS_MULTIPLIER,
    );
  });

  it("keeps distant fog sites as separate banks instead of blanketing the bay", () => {
    const eastBay = {
      id: "walnut-creek",
      latitude: 37.9101,
      longitude: -122.0652,
      fogScore: 70,
      sunshineScore: 25,
    };

    const collection = buildLocationFogOverlayCollection([tiburon, eastBay]);

    expect(collection.features).toHaveLength(FOG_BANK_LAYERS.length * 2);
    const memberGroups = new Set(
      collection.features.map((feature) =>
        (feature.properties?.memberIds as string[]).join(","),
      ),
    );

    expect(memberGroups.size).toBe(2);
  });
});
