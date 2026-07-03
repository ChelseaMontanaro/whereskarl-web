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
      fogScore: 82,
    });
  });

  it("creates a closed polygon for overlay rendering", () => {
    const polygon = createCirclePolygon(-122.45, 37.87, 2500, 8);
    const ring = polygon.coordinates[0];

    expect(ring[0]).toEqual(ring[ring.length - 1]);
    expect(ring.length).toBeGreaterThan(4);
  });
});
