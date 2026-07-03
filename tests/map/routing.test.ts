import { describe, expect, it } from "vitest";

import {
  buildMapHref,
  readMapLocationParam,
} from "@/lib/map/routing";

describe("map routing", () => {
  it("buildMapHref includes the best location when available", () => {
    expect(buildMapHref("tiburon")).toBe("/map?location=tiburon");
  });

  it("buildMapHref falls back to the general map route", () => {
    expect(buildMapHref(null)).toBe("/map");
    expect(buildMapHref("")).toBe("/map");
  });

  it("readMapLocationParam prefers location and accepts selected alias", () => {
    expect(
      readMapLocationParam(new URLSearchParams("location=ocean-beach")),
    ).toBe("ocean-beach");
    expect(
      readMapLocationParam(new URLSearchParams("selected=sausalito")),
    ).toBe("sausalito");
    expect(
      readMapLocationParam({
        location: "tiburon",
        selected: "ignored-when-location-present",
      }),
    ).toBe("tiburon");
  });

  it("readMapLocationParam returns null for missing or blank values", () => {
    expect(readMapLocationParam(new URLSearchParams())).toBeNull();
    expect(readMapLocationParam(new URLSearchParams("location="))).toBeNull();
  });
});
