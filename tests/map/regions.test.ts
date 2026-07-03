import { describe, expect, it } from "vitest";

import {
  filterLocationsByProductRegion,
  getProductRegionIdForLocation,
  getProductRegionNameForLocation,
} from "@/lib/map/regions";

describe("map regions", () => {
  it("maps monitored locations to the four product regions", () => {
    expect(getProductRegionIdForLocation("tiburon")).toBe("north-bay");
    expect(getProductRegionIdForLocation("oakland")).toBe("east-bay");
    expect(getProductRegionNameForLocation("san-jose")).toBe("South Bay");
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
