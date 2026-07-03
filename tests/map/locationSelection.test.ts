import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { resolveMapLocationFocus } from "@/lib/map/locationSelection";
import { locationsResponseSchema } from "@/lib/schemas/weather";

const FIXTURES_DIR = join(process.cwd(), "tests/fixtures");

describe("resolveMapLocationFocus", () => {
  const locations = locationsResponseSchema.parse(
    JSON.parse(readFileSync(join(FIXTURES_DIR, "locations.json"), "utf8")),
  ).locations;

  it("selects a known location id", () => {
    const focus = resolveMapLocationFocus({
      requestedLocationId: "tiburon",
      locations,
    });

    expect(focus.selectedLocation?.name).toBe("Tiburon");
    expect(focus.unknownLocationId).toBeNull();
  });

  it("handles unknown location ids gracefully", () => {
    const focus = resolveMapLocationFocus({
      requestedLocationId: "unknown-spot",
      locations,
    });

    expect(focus.selectedLocation).toBeNull();
    expect(focus.unknownLocationId).toBe("unknown-spot");
  });
});
