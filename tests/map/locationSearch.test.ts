import { describe, expect, it } from "vitest";

import {
  filterCanonicalLocationsBySearch,
  type CanonicalSearchableLocation,
} from "@/lib/map/locationSearch";

const CATALOG: CanonicalSearchableLocation[] = [
  { id: "san-francisco", name: "San Francisco" },
  { id: "san-rafael", name: "San Rafael" },
  { id: "san-ramon", name: "San Ramon" },
  { id: "santa-rosa", name: "Santa Rosa" },
  { id: "sausalito", name: "Sausalito" },
  { id: "half-moon-bay", name: "Half Moon Bay" },
  { id: "tiburon", name: "Tiburon" },
];

describe("filterCanonicalLocationsBySearch", () => {
  it("returns the same object references from the input catalog", () => {
    const results = filterCanonicalLocationsBySearch(CATALOG, "sa");
    expect(results.length).toBeGreaterThan(0);
    for (const result of results) {
      expect(CATALOG).toContain(result);
    }
  });

  it("matches case-insensitively with partial display names", () => {
    expect(
      filterCanonicalLocationsBySearch(CATALOG, "sa").map((item) => item.name),
    ).toEqual([
      "San Francisco",
      "San Rafael",
      "San Ramon",
      "Santa Rosa",
      "Sausalito",
    ]);

    expect(
      filterCanonicalLocationsBySearch(CATALOG, "ROSA").map((item) => item.id),
    ).toEqual(["santa-rosa"]);

    expect(
      filterCanonicalLocationsBySearch(CATALOG, "moon").map((item) => item.id),
    ).toEqual(["half-moon-bay"]);
  });

  it("ranks exact, prefix, then contains matches before alphabetical ties", () => {
    const locations: CanonicalSearchableLocation[] = [
      { id: "bay", name: "Bay" },
      { id: "half-moon-bay", name: "Half Moon Bay" },
      { id: "bayview", name: "Bayview" },
      { id: "embarcadero", name: "Embarcadero" },
    ];

    expect(
      filterCanonicalLocationsBySearch(locations, "bay").map((item) => item.id),
    ).toEqual(["bay", "bayview", "half-moon-bay"]);
  });

  it("uses canonical aliases only when already present on the location", () => {
    const locations: CanonicalSearchableLocation[] = [
      { id: "san-francisco", name: "San Francisco", aliases: ["SF", "City"] },
      { id: "sausalito", name: "Sausalito" },
    ];

    expect(
      filterCanonicalLocationsBySearch(locations, "sf").map((item) => item.id),
    ).toEqual(["san-francisco"]);

    expect(
      filterCanonicalLocationsBySearch(locations, "city").map((item) => item.id),
    ).toEqual(["san-francisco"]);

    // Without aliases on the object, display-name-only search must not invent matches.
    expect(
      filterCanonicalLocationsBySearch(
        [{ id: "san-francisco", name: "San Francisco" }],
        "sf",
      ),
    ).toEqual([]);
  });

  it("ranks alias prefix ahead of alias contains", () => {
    const locations: CanonicalSearchableLocation[] = [
      { id: "a", name: "Alpha", aliases: ["north gate"] },
      { id: "b", name: "Beta", aliases: ["gate"] },
    ];

    expect(
      filterCanonicalLocationsBySearch(locations, "gate").map((item) => item.id),
    ).toEqual(["b", "a"]);
  });

  it("returns an empty list when nothing matches", () => {
    expect(filterCanonicalLocationsBySearch(CATALOG, "xyzzy")).toEqual([]);
  });

  it("returns the full catalog alphabetically for an empty query", () => {
    expect(
      filterCanonicalLocationsBySearch(CATALOG, "  ").map((item) => item.name),
    ).toEqual([
      "Half Moon Bay",
      "San Francisco",
      "San Rafael",
      "San Ramon",
      "Santa Rosa",
      "Sausalito",
      "Tiburon",
    ]);
  });
});
