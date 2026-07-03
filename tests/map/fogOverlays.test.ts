import { describe, expect, it } from "vitest";

import {
  buildLocationFogOverlayCollection,
  createCirclePolygon,
} from "@/lib/map/fogOverlays";

describe("fog overlays", () => {
  it("builds location-based fog circles only for foggy scores", () => {
    const collection = buildLocationFogOverlayCollection([
      {
        id: "tiburon",
        latitude: 37.8735,
        longitude: -122.4566,
        fogScore: 82,
        sunshineScore: 18,
      },
      {
        id: "sausalito",
        latitude: 37.8591,
        longitude: -122.4853,
        fogScore: 10,
        sunshineScore: 90,
      },
    ]);

    expect(collection.features).toHaveLength(1);
    expect(collection.features[0]?.properties).toMatchObject({
      intensity: "karlTerritory",
    });
  });

  it("skips fog circles for high Clear Skies Score locations", () => {
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

  it("only renders overlays matching the active intensity filter", () => {
    const locations = [
      {
        id: "tiburon",
        latitude: 37.8735,
        longitude: -122.4566,
        fogScore: 82,
        sunshineScore: 18,
      },
      {
        id: "sausalito",
        latitude: 37.8591,
        longitude: -122.4853,
        fogScore: 60,
        sunshineScore: 40,
      },
    ];

    const clearFilter = buildLocationFogOverlayCollection(locations, "clear");
    const karlFilter = buildLocationFogOverlayCollection(
      locations,
      "karlTerritory",
    );

    expect(clearFilter.features).toHaveLength(0);
    expect(karlFilter.features).toHaveLength(1);
    expect(karlFilter.features[0]?.properties).toMatchObject({
      intensity: "karlTerritory",
    });
  });

  it("creates a closed polygon for overlay rendering", () => {
    const polygon = createCirclePolygon(-122.45, 37.87, 2500, 8);
    const ring = polygon.coordinates[0];

    expect(ring[0]).toEqual(ring[ring.length - 1]);
    expect(ring.length).toBeGreaterThan(4);
  });
});
