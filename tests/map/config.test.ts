import { describe, expect, it } from "vitest";

import {
  BAY_AREA_DEFAULT_BOUNDS,
  BAY_AREA_PRODUCT_REGIONS,
  findBayAreaProductRegion,
  isBayAreaProductRegionId,
} from "@/lib/map/config";

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
});
