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

  it("ranks exact, name prefix, word prefix, then contains matches", () => {
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

  it("prefers display-name prefix over mid-word contains matches", () => {
    const locations: CanonicalSearchableLocation[] = [
      { id: "cupertino", name: "Cupertino" },
      { id: "stinson-beach", name: "Stinson Beach" },
      { id: "tiburon", name: "Tiburon" },
    ];

    expect(
      filterCanonicalLocationsBySearch(locations, "Ti").map((item) => item.name),
    ).toEqual(["Tiburon", "Cupertino", "Stinson Beach"]);
  });

  it("prefers name prefix over later word-prefix matches", () => {
    const locations: CanonicalSearchableLocation[] = [
      { id: "half-moon-bay", name: "Half Moon Bay" },
      { id: "montara", name: "Montara" },
    ];

    expect(
      filterCanonicalLocationsBySearch(locations, "Mon").map((item) => item.name),
    ).toEqual(["Montara"]);

    expect(
      filterCanonicalLocationsBySearch(locations, "Mo").map((item) => item.name),
    ).toEqual(["Montara", "Half Moon Bay"]);
  });

  it("matches when any word in the display name starts with the query", () => {
    expect(
      filterCanonicalLocationsBySearch(
        [{ id: "golden-gate-park", name: "Golden Gate Park" }],
        "Gate",
      ).map((item) => item.id),
    ).toEqual(["golden-gate-park"]);
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
