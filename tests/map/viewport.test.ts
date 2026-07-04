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
    const southBay = findBayAreaProductRegion("south-bay");

    expect(resolveRegionViewportOptions(southBay?.viewport, "desktop")).toBeUndefined();
  });

  it("uses mobile padding for San Francisco on mobile layout", () => {
    const sanFrancisco = findBayAreaProductRegion("san-francisco");

    expect(resolveRegionViewportOptions(sanFrancisco?.viewport, "mobile")).toEqual({
      padding: 36,
      maxZoom: 10.6,
    });
  });

  it("uses desktop padding for San Francisco on desktop layout", () => {
    const sanFrancisco = findBayAreaProductRegion("san-francisco");

    expect(resolveRegionViewportOptions(sanFrancisco?.viewport, "desktop")).toEqual({
      padding: {
        top: 80,
        right: 80,
        bottom: 128,
        left: 360,
      },
      maxZoom: 10.6,
    });
  });

  it("uses mobile padding for East Bay on mobile layout", () => {
    const eastBay = findBayAreaProductRegion("east-bay");

    expect(resolveRegionViewportOptions(eastBay?.viewport, "mobile")).toEqual({
      padding: 36,
      maxZoom: 10.5,
    });
  });

  it("uses desktop padding for East Bay on desktop layout", () => {
    const eastBay = findBayAreaProductRegion("east-bay");

    expect(resolveRegionViewportOptions(eastBay?.viewport, "desktop")).toEqual({
      padding: {
        top: 80,
        right: 80,
        bottom: 128,
        left: 360,
      },
      maxZoom: 10.5,
    });
  });
});
