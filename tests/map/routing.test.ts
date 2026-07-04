import { describe, expect, it } from "vitest";

import {
  buildMapHref,
  buildMapRegionHref,
  readMapLocationParam,
  readMapRegionParam,
  resolveMapQueryState,
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

  it("buildMapRegionHref creates a shareable region route", () => {
    expect(buildMapRegionHref("north-bay")).toBe("/map?region=north-bay");
  });

  it("readMapRegionParam reads the region query param", () => {
    expect(
      readMapRegionParam(new URLSearchParams("region=east-bay")),
    ).toBe("east-bay");
  });

  it("resolveMapQueryState gives location priority over region", () => {
    expect(
      resolveMapQueryState(
        new URLSearchParams("location=tiburon&region=south-bay"),
      ),
    ).toEqual({
      requestedLocationId: "tiburon",
      activeRegionId: null,
      unknownLocationId: null,
      unknownRegionId: null,
    });
  });

  it("resolveMapQueryState handles unknown region params gracefully", () => {
    expect(resolveMapQueryState(new URLSearchParams("region=unknown-coast"))).toEqual(
      {
        requestedLocationId: null,
        activeRegionId: null,
        unknownLocationId: null,
        unknownRegionId: "unknown-coast",
      },
    );
  });

  it("resolveMapQueryState accepts peninsula as a product region", () => {
    expect(resolveMapQueryState(new URLSearchParams("region=peninsula"))).toEqual(
      {
        requestedLocationId: null,
        activeRegionId: "peninsula",
        unknownLocationId: null,
        unknownRegionId: null,
      },
    );
  });
});
