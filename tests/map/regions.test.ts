import { describe, expect, it } from "vitest";

import {
  filterLocationsByProductRegion,
  getProductRegionIdForLocation,
  getProductRegionNameForLocation,
} from "@/lib/map/regions";

describe("map regions", () => {
  it("maps monitored locations to the five product regions", () => {
    expect(getProductRegionIdForLocation("tiburon")).toBe("north-bay");
    expect(getProductRegionIdForLocation("marin-headlands")).toBe("north-bay");
    expect(getProductRegionIdForLocation("daly-city")).toBe("peninsula");
    expect(getProductRegionIdForLocation("pacifica")).toBe("peninsula");
    expect(getProductRegionIdForLocation("oakland")).toBe("east-bay");
    expect(getProductRegionNameForLocation("san-jose")).toBe("South Bay");
  });

  it("prefers API region fields over fallback assignments", () => {
    expect(
      getProductRegionIdForLocation({
        id: "custom-spot",
        region: "north-bay",
      }),
    ).toBe("north-bay");
  });

  it("filters the location list by active region", () => {
    const locations = [
      { id: "tiburon", name: "Tiburon" },
      { id: "sausalito", name: "Sausalito" },
      { id: "oakland", name: "Oakland" },
    ];

    expect(filterLocationsByProductRegion(locations, "north-bay")).toEqual([
      { id: "tiburon", name: "Tiburon" },
      { id: "sausalito", name: "Sausalito" },
    ]);
  });
});
