import { describe, expect, it } from "vitest";

import { normalizeLocationId } from "./normalizeLocationId";

describe("normalizeLocationId", () => {
  it("returns null for empty values", () => {
    expect(normalizeLocationId(null)).toBeNull();
    expect(normalizeLocationId(undefined)).toBeNull();
    expect(normalizeLocationId("")).toBeNull();
    expect(normalizeLocationId("   ")).toBeNull();
  });

  it("trims and preserves non-aliased ids", () => {
    expect(normalizeLocationId("  ocean-beach  ")).toBe("ocean-beach");
    expect(normalizeLocationId("Baker-Beach")).toBe("Baker-Beach");
  });

  it("remaps ocean-beach-sf to canonical ocean-beach", () => {
    expect(normalizeLocationId("ocean-beach-sf")).toBe("ocean-beach");
    expect(normalizeLocationId("Ocean-Beach-SF")).toBe("ocean-beach");
    expect(normalizeLocationId("  ocean-beach-sf  ")).toBe("ocean-beach");
  });

  it("does not remap bare richmond", () => {
    expect(normalizeLocationId("richmond")).toBe("richmond");
  });
});
