import { describe, expect, it } from "vitest";

import {
  filterLocationsByProductRegion,
  getProductRegionIdForLocation,
  getProductRegionNameForLocation,
  locationMatchesProductRegion,
  resolveBackendRegionId,
} from "@/lib/map/regions";

describe("map regions", () => {
  it("maps monitored locations from backend region to visible product regions", () => {
    expect(
      getProductRegionIdForLocation({ id: "tiburon", region: "north-bay" }),
    ).toBe("north-bay");
    expect(
      getProductRegionIdForLocation({
        id: "marin-headlands",
        region: "north-bay",
      }),
    ).toBe("north-bay");
    expect(
      getProductRegionIdForLocation({ id: "daly-city", region: "peninsula" }),
    ).toBe("peninsula");
    expect(
      getProductRegionIdForLocation({ id: "pacifica", region: "peninsula" }),
    ).toBe("peninsula");
    expect(
      getProductRegionIdForLocation({ id: "oakland", region: "east-bay" }),
    ).toBe("east-bay");
    expect(
      getProductRegionNameForLocation({ id: "san-jose", region: "south-bay" }),
    ).toBe("South Bay");
  });

  // Phase 16.2A: backend locks Half Moon Bay and Palo Alto on peninsula.
  it("assigns Half Moon Bay and Palo Alto to the Peninsula from backend region", () => {
    expect(
      getProductRegionIdForLocation({
        id: "half-moon-bay",
        region: "peninsula",
      }),
    ).toBe("peninsula");
    expect(
      getProductRegionIdForLocation({ id: "palo-alto", region: "peninsula" }),
    ).toBe("peninsula");
    expect(
      getProductRegionIdForLocation({
        id: "mountain-view",
        region: "south-bay",
      }),
    ).toBe("south-bay");
    expect(
      getProductRegionIdForLocation({ id: "san-jose", region: "south-bay" }),
    ).toBe("south-bay");
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
      expect(
        getProductRegionIdForLocation({ id, region: "san-francisco" }),
      ).toBe("san-francisco");
    }
    // Marin locations are never San Francisco.
    expect(
      getProductRegionIdForLocation({ id: "sausalito", region: "north-bay" }),
    ).not.toBe("san-francisco");
    expect(
      getProductRegionIdForLocation({ id: "tiburon", region: "north-bay" }),
    ).not.toBe("san-francisco");
  });

  it("uses backend region fields as the sole catalog region source", () => {
    expect(
      getProductRegionIdForLocation({
        id: "custom-spot",
        region: "north-bay",
      }),
    ).toBe("north-bay");
    expect(resolveBackendRegionId({ id: "tiburon" })).toBeNull();
    expect(getProductRegionIdForLocation("tiburon")).toBeNull();
    expect(getProductRegionIdForLocation({ id: "half-moon-bay" })).toBeNull();
  });

  it("does not silently resolve bare richmond or ocean-beach-sf as catalog regions", () => {
    expect(resolveBackendRegionId({ id: "richmond" })).toBeNull();
    expect(resolveBackendRegionId({ id: "richmond-district" })).toBeNull();
    expect(resolveBackendRegionId({ id: "richmond-ca" })).toBeNull();
    expect(resolveBackendRegionId({ id: "ocean-beach-sf" })).toBeNull();
  });

  it("filters the location list by active region using backend region", () => {
    const locations = [
      { id: "tiburon", name: "Tiburon", region: "north-bay" },
      { id: "sausalito", name: "Sausalito", region: "north-bay" },
      { id: "oakland", name: "Oakland", region: "east-bay" },
    ];

    expect(filterLocationsByProductRegion(locations, "north-bay")).toEqual([
      { id: "tiburon", name: "Tiburon", region: "north-bay" },
      { id: "sausalito", name: "Sausalito", region: "north-bay" },
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
          {
            id: "tiburon",
            region: "north-bay",
            latitude: 37.8735,
            longitude: -122.4566,
          },
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
