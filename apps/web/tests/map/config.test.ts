import { describe, expect, it } from "vitest";

import {
  BAY_AREA_DEFAULT_BOUNDS,
  BAY_AREA_IMMERSIVE_VIEWPORT_PADDING,
  BAY_AREA_PRODUCT_REGIONS,
  findBayAreaProductRegion,
  isBayAreaBackendRegionId,
  isBayAreaProductRegionId,
  normalizeVisibleMapRegionId,
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
  it("defines the five visible product regions including Peninsula", () => {
    expect(BAY_AREA_PRODUCT_REGIONS.map((region) => region.id)).toEqual([
      "san-francisco",
      "north-bay",
      "east-bay",
      "south-bay",
      "peninsula",
    ]);
    expect(BAY_AREA_PRODUCT_REGIONS.map((region) => region.name)).toContain(
      "Peninsula",
    );
  });

  it("recognizes valid visible and backend region ids", () => {
    expect(isBayAreaProductRegionId("east-bay")).toBe(true);
    expect(isBayAreaProductRegionId("peninsula")).toBe(true);
    expect(isBayAreaBackendRegionId("peninsula")).toBe(true);
    expect(findBayAreaProductRegion("north-bay")?.name).toBe("North Bay");
  });

  it("maps backend peninsula to the Peninsula visible region", () => {
    expect(normalizeVisibleMapRegionId("peninsula")).toBe("peninsula");
    expect(findBayAreaProductRegion("peninsula")?.name).toBe("Peninsula");
  });

  it("uses a wide default viewport that spans all five visible regions", () => {
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
    expect(pointInBounds(37.827, -122.499, northBay!.bounds)).toBe(true);

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
      immersivePadding: BAY_AREA_IMMERSIVE_VIEWPORT_PADDING,
      maxZoom: 11.3,
    });
  });

  it("frames San Francisco with southern Peninsula and light East Bay context", () => {
    const sanFrancisco = findBayAreaProductRegion("san-francisco");
    expect(sanFrancisco).toBeDefined();

    const [[west, south], [east, north]] = sanFrancisco!.bounds;

    expect(pointInBounds(37.6875, -122.4702, sanFrancisco!.bounds)).toBe(true);
    expect(pointInBounds(37.6808, -122.4, sanFrancisco!.bounds)).toBe(true);
    expect(pointInBounds(37.6547, -122.4077, sanFrancisco!.bounds)).toBe(true);
    expect(pointInBounds(37.6769, -122.46, sanFrancisco!.bounds)).toBe(true);
    expect(pointInBounds(37.6309, -122.4111, sanFrancisco!.bounds)).toBe(true);

    expect(pointInBounds(37.7694, -122.4862, sanFrancisco!.bounds)).toBe(true);
    expect(pointInBounds(37.7594, -122.5107, sanFrancisco!.bounds)).toBe(true);
    expect(pointInBounds(37.7989, -122.4662, sanFrancisco!.bounds)).toBe(true);

    expect(pointInBounds(37.8044, -122.2712, sanFrancisco!.bounds)).toBe(true);
    expect(pointInBounds(37.8313, -122.2853, sanFrancisco!.bounds)).toBe(true);
    expect(pointInBounds(37.7652, -122.2416, sanFrancisco!.bounds)).toBe(false);

    expect(pointInBounds(37.3382, -121.8863, sanFrancisco!.bounds)).toBe(false);
    expect(pointInBounds(37.4419, -122.143, sanFrancisco!.bounds)).toBe(false);
    expect(pointInBounds(37.3861, -122.0839, sanFrancisco!.bounds)).toBe(false);
    expect(pointInBounds(37.4636, -122.4286, sanFrancisco!.bounds)).toBe(false);

    expect(south).toBeLessThanOrEqual(37.63);
    expect(south).toBeGreaterThan(37.58);
    expect(west).toBeLessThanOrEqual(-122.52);
    expect(east).toBeGreaterThanOrEqual(-122.27);
    expect(east).toBeLessThanOrEqual(-122.24);
    expect(north).toBeGreaterThanOrEqual(37.8);

    expect(sanFrancisco?.viewport).toEqual({
      padding: 36,
      desktopPadding: {
        top: 80,
        right: 80,
        bottom: 128,
        left: 360,
      },
      immersivePadding: BAY_AREA_IMMERSIVE_VIEWPORT_PADDING,
      maxZoom: 10.6,
    });
  });

  it("frames East Bay so all five monitored catalog locations fit immediately", () => {
    const eastBay = findBayAreaProductRegion("east-bay");
    expect(eastBay).toBeDefined();

    const [[west, south], [east, north]] = eastBay!.bounds;

    // Phase 16.2E East Bay catalog
    expect(pointInBounds(37.8715, -122.273, eastBay!.bounds)).toBe(true); // Berkeley
    expect(pointInBounds(37.8044, -122.2712, eastBay!.bounds)).toBe(true); // Oakland
    expect(pointInBounds(37.7651, -122.2416, eastBay!.bounds)).toBe(true); // Alameda
    expect(pointInBounds(37.6688, -122.0808, eastBay!.bounds)).toBe(true); // Hayward
    expect(pointInBounds(37.5485, -121.9886, eastBay!.bounds)).toBe(true); // Fremont

    // Inland / north context retained from the prior product frame
    expect(pointInBounds(37.9103, -122.0652, eastBay!.bounds)).toBe(true);
    expect(pointInBounds(37.8858, -122.118, eastBay!.bounds)).toBe(true);
    expect(pointInBounds(37.8771, -122.1797, eastBay!.bounds)).toBe(true);
    expect(pointInBounds(37.8502, -122.0322, eastBay!.bounds)).toBe(true);
    expect(pointInBounds(37.8216, -122.0322, eastBay!.bounds)).toBe(true);
    expect(pointInBounds(37.978, -122.0311, eastBay!.bounds)).toBe(true);
    expect(pointInBounds(38.0049, -121.8058, eastBay!.bounds)).toBe(true);

    expect(pointInBounds(37.7749, -122.4194, eastBay!.bounds)).toBe(false);
    expect(pointInBounds(37.8735, -122.4566, eastBay!.bounds)).toBe(false);
    expect(pointInBounds(37.3382, -121.8863, eastBay!.bounds)).toBe(false);
    // East of the product east edge (beyond retained inland/Delta context).
    expect(pointInBounds(37.6819, -121.70, eastBay!.bounds)).toBe(false);

    expect(west).toBe(-122.33);
    expect(east).toBe(-121.72);
    expect(south).toBe(37.52);
    expect(north).toBe(38.02);

    expect(eastBay?.viewport).toEqual({
      padding: 36,
      desktopPadding: {
        top: 80,
        right: 80,
        bottom: 128,
        left: 360,
      },
      immersivePadding: BAY_AREA_IMMERSIVE_VIEWPORT_PADDING,
      maxZoom: 10.5,
    });
  });

  it("frames South Bay with reduced desktop left padding so Half Moon Bay clears overlay panels", () => {
    const southBay = findBayAreaProductRegion("south-bay");
    expect(southBay).toBeDefined();

    const [[west, south], [east, north]] = southBay!.bounds;

    expect(pointInBounds(37.4636, -122.4286, southBay!.bounds)).toBe(true);
    expect(pointInBounds(37.4419, -122.143, southBay!.bounds)).toBe(true);
    expect(pointInBounds(37.3861, -122.0839, southBay!.bounds)).toBe(true);
    expect(pointInBounds(37.3382, -121.8863, southBay!.bounds)).toBe(true);

    expect(pointInBounds(37.7749, -122.4194, southBay!.bounds)).toBe(false);
    expect(pointInBounds(37.8735, -122.4566, southBay!.bounds)).toBe(false);

    expect(west).toBe(-122.5);
    expect(east).toBe(-121.7);
    expect(south).toBe(37.08);
    expect(north).toBe(37.58);

    expect(southBay?.viewport).toEqual({
      padding: 36,
      desktopPadding: {
        top: 80,
        right: 80,
        bottom: 128,
        left: 280,
      },
      immersivePadding: BAY_AREA_IMMERSIVE_VIEWPORT_PADDING,
      maxZoom: 11,
    });
    expect(southBay?.viewport?.desktopPadding).not.toEqual(
      findBayAreaProductRegion("east-bay")?.viewport?.desktopPadding,
    );
  });

  it("frames Peninsula so all six monitored catalog locations fit immediately", () => {
    const peninsula = findBayAreaProductRegion("peninsula");
    expect(peninsula).toBeDefined();

    const [[west, south], [east, north]] = peninsula!.bounds;

    expect(pointInBounds(37.6879, -122.4702, peninsula!.bounds)).toBe(true); // Daly City
    expect(pointInBounds(37.6138, -122.4869, peninsula!.bounds)).toBe(true); // Pacifica
    expect(pointInBounds(37.4636, -122.4286, peninsula!.bounds)).toBe(true); // Half Moon Bay
    expect(pointInBounds(37.563, -122.3255, peninsula!.bounds)).toBe(true); // San Mateo
    expect(pointInBounds(37.4858, -122.228, peninsula!.bounds)).toBe(true); // Redwood City
    expect(pointInBounds(37.4419, -122.143, peninsula!.bounds)).toBe(true); // Palo Alto

    expect(pointInBounds(37.7749, -122.4194, peninsula!.bounds)).toBe(false); // SF
    expect(pointInBounds(37.8044, -122.2712, peninsula!.bounds)).toBe(false); // Oakland
    expect(pointInBounds(37.3382, -121.8863, peninsula!.bounds)).toBe(false); // San Jose

    expect(west).toBe(-122.55);
    expect(east).toBe(-121.95);
    expect(south).toBe(37.28);
    expect(north).toBe(37.74);
  });
});
