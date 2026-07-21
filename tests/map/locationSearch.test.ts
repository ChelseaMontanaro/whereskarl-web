import { describe, expect, it } from "vitest";

import {
  filterCanonicalLocationsBySearch,
  type CanonicalSearchableLocation,
} from "@/lib/map/locationSearch";

const CATALOG: CanonicalSearchableLocation[] = [
  { id: "san-francisco", name: "San Francisco" },
  { id: "san-jose", name: "San Jose" },
  { id: "san-rafael", name: "San Rafael" },
  { id: "san-ramon", name: "San Ramon" },
  { id: "santa-clara", name: "Santa Clara" },
  { id: "santa-rosa", name: "Santa Rosa" },
  { id: "saratoga", name: "Saratoga" },
  { id: "sausalito", name: "Sausalito" },
  { id: "half-moon-bay", name: "Half Moon Bay" },
  { id: "tiburon", name: "Tiburon" },
  { id: "cupertino", name: "Cupertino" },
  { id: "stinson-beach", name: "Stinson Beach" },
  { id: "treasure-island", name: "Treasure Island" },
];

describe("filterCanonicalLocationsBySearch", () => {
  it("returns the same object references from the input catalog", () => {
    const results = filterCanonicalLocationsBySearch(CATALOG, "sa");
    expect(results.length).toBeGreaterThan(0);
    for (const result of results) {
      expect(CATALOG).toContain(result);
    }
  });

  it("matches case-insensitively on display-name prefixes only", () => {
    expect(
      filterCanonicalLocationsBySearch(CATALOG, "sa").map((item) => item.name),
    ).toEqual([
      "San Francisco",
      "San Jose",
      "San Rafael",
      "San Ramon",
      "Santa Clara",
      "Santa Rosa",
      "Saratoga",
      "Sausalito",
    ]);

    expect(
      filterCanonicalLocationsBySearch(CATALOG, "TI").map((item) => item.name),
    ).toEqual(["Tiburon"]);

    expect(
      filterCanonicalLocationsBySearch(CATALOG, "  Sa  ").map((item) => item.id),
    ).toEqual([
      "san-francisco",
      "san-jose",
      "san-rafael",
      "san-ramon",
      "santa-clara",
      "santa-rosa",
      "saratoga",
      "sausalito",
    ]);
  });

  it("does not return contains or later-word matches", () => {
    expect(
      filterCanonicalLocationsBySearch(
        [
          { id: "tiburon", name: "Tiburon" },
          { id: "cupertino", name: "Cupertino" },
          { id: "stinson-beach", name: "Stinson Beach" },
        ],
        "Ti",
      ).map((item) => item.name),
    ).toEqual(["Tiburon"]);

    expect(
      filterCanonicalLocationsBySearch(CATALOG, "Moon").map((item) => item.id),
    ).toEqual([]);

    expect(
      filterCanonicalLocationsBySearch(
        [{ id: "golden-gate-park", name: "Golden Gate Park" }],
        "Gate",
      ),
    ).toEqual([]);
  });

  it("returns prefix matches for a single letter alphabetically", () => {
    expect(
      filterCanonicalLocationsBySearch(CATALOG, "T").map((item) => item.name),
    ).toEqual(["Tiburon", "Treasure Island"]);
  });

  it("does not invent alias matches when aliases are absent from the catalog", () => {
    expect(
      filterCanonicalLocationsBySearch(
        [{ id: "san-francisco", name: "San Francisco" }],
        "sf",
      ),
    ).toEqual([]);
  });

  it("returns an empty list when nothing matches", () => {
    expect(filterCanonicalLocationsBySearch(CATALOG, "xyzzy")).toEqual([]);
  });

  it("returns an empty list for an empty or whitespace-only query", () => {
    expect(filterCanonicalLocationsBySearch(CATALOG, "")).toEqual([]);
    expect(filterCanonicalLocationsBySearch(CATALOG, "  ")).toEqual([]);
  });
});
