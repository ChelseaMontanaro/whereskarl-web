import { describe, expect, it } from "vitest";

import {
  BAY_AREA_DEFAULT_BOUNDS,
  BAY_AREA_PRODUCT_REGIONS,
  findBayAreaProductRegion,
  isBayAreaProductRegionId,
  type MapBounds,
} from "@/lib/map/config";

function pointInBounds(
  latitude: number,
  longitude: number,
  bounds: MapBounds,
): boolean {
  const [[west, south], [east, north]] = bounds;
  return (
    longitude >= west &&
    longitude <= east &&
    latitude >= south &&
    latitude <= north
  );
}

describe("Bay Area product regions", () => {
  it("defines the four product regions without a separate Peninsula region", () => {
    expect(BAY_AREA_PRODUCT_REGIONS.map((region) => region.id)).toEqual([
      "san-francisco",
      "north-bay",
      "east-bay",
      "south-bay",
    ]);
    expect(BAY_AREA_PRODUCT_REGIONS.map((region) => region.name)).not.toContain(
      "Peninsula",
    );
  });

  it("recognizes valid product region ids", () => {
    expect(isBayAreaProductRegionId("east-bay")).toBe(true);
    expect(isBayAreaProductRegionId("peninsula")).toBe(false);
    expect(findBayAreaProductRegion("north-bay")?.name).toBe("North Bay");
  });

  it("uses a wide default viewport that spans all four regions", () => {
    const [[west, south], [east, north]] = BAY_AREA_DEFAULT_BOUNDS;

    for (const region of BAY_AREA_PRODUCT_REGIONS) {
      const [[regionWest, regionSouth], [regionEast, regionNorth]] = region.bounds;
      expect(regionWest).toBeGreaterThanOrEqual(west);
      expect(regionEast).toBeLessThanOrEqual(east);
      expect(regionSouth).toBeGreaterThanOrEqual(south);
      expect(regionNorth).toBeLessThanOrEqual(north);
    }
  });

  it("frames North Bay tightly on Marin without including lower Bay or San Francisco", () => {
    const northBay = findBayAreaProductRegion("north-bay");
    expect(northBay).toBeDefined();

    const [[west, south], [east, north]] = northBay!.bounds;

    expect(pointInBounds(37.8735, -122.4566, northBay!.bounds)).toBe(true);
    expect(pointInBounds(37.8591, -122.4853, northBay!.bounds)).toBe(true);
    expect(pointInBounds(37.8439, -122.6437, northBay!.bounds)).toBe(true);
    expect(pointInBounds(37.9061, -122.545, northBay!.bounds)).toBe(true);
    expect(pointInBounds(37.9735, -122.5311, northBay!.bounds)).toBe(true);

    expect(pointInBounds(37.7594, -122.5107, northBay!.bounds)).toBe(false);
    expect(pointInBounds(37.3382, -121.8863, northBay!.bounds)).toBe(false);
    expect(pointInBounds(37.7749, -122.4194, northBay!.bounds)).toBe(false);

    expect(south).toBeGreaterThan(37.78);
    expect(east).toBeLessThan(-122.38);
    expect(west).toBeLessThanOrEqual(-122.65);
    expect(north).toBeGreaterThan(37.94);
    expect(north).toBeLessThanOrEqual(38.02);

    expect(northBay?.viewport).toEqual({
      padding: 36,
      desktopPadding: {
        top: 80,
        right: 80,
        bottom: 128,
        left: 360,
      },
      maxZoom: 11.3,
    });
  });

  it("frames East Bay wide enough for core cities and inland context", () => {
    const eastBay = findBayAreaProductRegion("east-bay");
    expect(eastBay).toBeDefined();

    const [[west, south], [east, north]] = eastBay!.bounds;

    expect(pointInBounds(37.8716, -122.2727, eastBay!.bounds)).toBe(true);
    expect(pointInBounds(37.8044, -122.2712, eastBay!.bounds)).toBe(true);
    expect(pointInBounds(37.9103, -122.0652, eastBay!.bounds)).toBe(true);
    expect(pointInBounds(37.8858, -122.118, eastBay!.bounds)).toBe(true);
    expect(pointInBounds(37.8771, -122.1797, eastBay!.bounds)).toBe(true);
    expect(pointInBounds(37.8502, -122.0322, eastBay!.bounds)).toBe(true);
    expect(pointInBounds(37.8216, -122.0322, eastBay!.bounds)).toBe(true);
    expect(pointInBounds(37.978, -122.0311, eastBay!.bounds)).toBe(true);
    expect(pointInBounds(38.0049, -121.8058, eastBay!.bounds)).toBe(true);
    expect(pointInBounds(37.6819, -121.768, eastBay!.bounds)).toBe(true);

    expect(pointInBounds(37.7749, -122.4194, eastBay!.bounds)).toBe(false);
    expect(pointInBounds(37.8735, -122.4566, eastBay!.bounds)).toBe(false);

    expect(west).toBeGreaterThanOrEqual(-122.42);
    expect(east).toBeLessThanOrEqual(-121.55);
    expect(south).toBeLessThanOrEqual(37.6);
    expect(north).toBeGreaterThanOrEqual(38.0);

    expect(eastBay?.viewport).toEqual({
      padding: 36,
      desktopPadding: {
        top: 80,
        right: 80,
        bottom: 128,
        left: 360,
      },
      maxZoom: 10.0,
    });
  });
});
