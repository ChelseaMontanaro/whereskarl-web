import { describe, expect, it } from "vitest";

import {
  filterLocationsByProductRegion,
  getProductRegionIdForLocation,
  getProductRegionNameForLocation,
  locationMatchesProductRegion,
} from "@/lib/map/regions";

describe("map regions", () => {
  it("maps monitored locations to visible product regions", () => {
    expect(getProductRegionIdForLocation("tiburon")).toBe("north-bay");
    expect(getProductRegionIdForLocation("marin-headlands")).toBe("north-bay");
    expect(getProductRegionIdForLocation("daly-city")).toBe("peninsula");
    expect(getProductRegionIdForLocation("pacifica")).toBe("peninsula");
    expect(getProductRegionIdForLocation("oakland")).toBe("east-bay");
    expect(getProductRegionNameForLocation("san-jose")).toBe("South Bay");
  });

  // Audit RC-8: Half Moon Bay is a coastal Peninsula town, not South Bay.
  it("assigns Half Moon Bay to the Peninsula (coastal), not South Bay", () => {
    expect(getProductRegionIdForLocation("half-moon-bay")).toBe("peninsula");
  });

  // Audit RC-6: the SF chip resolves to the four SF product-region locations
  // through the one canonical resolver (no Marin/East Bay, includes Ocean Beach).
  it("resolves the San Francisco product region to its four members", () => {
    for (const id of [
      "san-francisco",
      "golden-gate-park",
      "ocean-beach",
      "presidio",
    ]) {
      expect(getProductRegionIdForLocation(id)).toBe("san-francisco");
    }
    // Marin locations are never San Francisco.
    expect(getProductRegionIdForLocation("sausalito")).not.toBe(
      "san-francisco",
    );
    expect(getProductRegionIdForLocation("tiburon")).not.toBe("san-francisco");
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

  // Audit RC-2 / RC-7: an unassigned backend location must still appear in the
  // geographically correct region via the canonical coordinate fallback, so no
  // future backend location silently disappears from region views.
  describe("canonical coordinate fallback for unassigned locations", () => {
    const unassignedInSf = {
      id: "future-sf-spot",
      latitude: 37.7749,
      longitude: -122.4194,
    };

    it("matches an unassigned location to a region by coordinates", () => {
      expect(locationMatchesProductRegion(unassignedInSf, "san-francisco")).toBe(
        true,
      );
      expect(locationMatchesProductRegion(unassignedInSf, "east-bay")).toBe(
        false,
      );
    });

    it("never leaks a location with a known (different) region by geometry", () => {
      // Tiburon resolves to North Bay; even though its coordinates fall inside
      // the wide SF desktop bounds, a known region wins and it never leaks.
      expect(
        locationMatchesProductRegion(
          { id: "tiburon", latitude: 37.8735, longitude: -122.4566 },
          "san-francisco",
        ),
      ).toBe(false);
    });

    it("includes unassigned coordinate-only locations in filtered results", () => {
      const locations = [unassignedInSf, { id: "oakland" }];
      expect(
        filterLocationsByProductRegion(locations, "san-francisco"),
      ).toEqual([unassignedInSf]);
    });
  });
});
