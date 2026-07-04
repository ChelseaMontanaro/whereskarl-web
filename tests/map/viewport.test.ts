import { describe, expect, it } from "vitest";

import { findBayAreaProductRegion } from "@/lib/map/config";
import { resolveRegionViewportOptions } from "@/lib/map/viewport";

describe("resolveRegionViewportOptions", () => {
  it("uses mobile padding for North Bay on mobile layout", () => {
    const northBay = findBayAreaProductRegion("north-bay");

    expect(resolveRegionViewportOptions(northBay?.viewport, "mobile")).toEqual({
      padding: 36,
      maxZoom: 11.3,
    });
  });

  it("uses desktop padding for North Bay on desktop layout", () => {
    const northBay = findBayAreaProductRegion("north-bay");

    expect(resolveRegionViewportOptions(northBay?.viewport, "desktop")).toEqual({
      padding: {
        top: 80,
        right: 80,
        bottom: 128,
        left: 360,
      },
      maxZoom: 11.3,
    });
  });

  it("returns undefined when a region has no viewport config", () => {
    const sanFrancisco = findBayAreaProductRegion("san-francisco");

    expect(resolveRegionViewportOptions(sanFrancisco?.viewport, "desktop")).toBeUndefined();
  });
});
