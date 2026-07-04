import { describe, expect, it, vi } from "vitest";

import {
  BAY_AREA_DEFAULT_BOUNDS,
  BAY_AREA_DEFAULT_MAX_ZOOM,
  BAY_AREA_IMMERSIVE_MAX_ZOOM,
  BAY_AREA_IMMERSIVE_MIN_ZOOM,
  findBayAreaProductRegion,
} from "@/lib/map/config";
import {
  fitDefaultBayAreaViewport,
  getImmersiveDefaultBayAreaFitOptions,
  resolveIntensityFilterFitOptions,
  resolveRegionViewportOptions,
} from "@/lib/map/viewport";

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

  it("uses immersive padding for North Bay on immersive layout", () => {
    const northBay = findBayAreaProductRegion("north-bay");

    expect(resolveRegionViewportOptions(northBay?.viewport, "immersive")).toEqual({
      padding: {
        top: 88,
        right: 28,
        bottom: 148,
        left: 28,
      },
      maxZoom: 11.3,
    });
  });

  it("uses mobile padding for South Bay on mobile layout", () => {
    const southBay = findBayAreaProductRegion("south-bay");

    expect(resolveRegionViewportOptions(southBay?.viewport, "mobile")).toEqual({
      padding: 36,
      maxZoom: 11,
    });
  });

  it("uses reduced desktop left padding for South Bay to keep Half Moon Bay clear of overlay panels", () => {
    const southBay = findBayAreaProductRegion("south-bay");

    expect(resolveRegionViewportOptions(southBay?.viewport, "desktop")).toEqual({
      padding: {
        top: 80,
        right: 80,
        bottom: 128,
        left: 280,
      },
      maxZoom: 11,
    });
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

describe("immersive Bay Area framing", () => {
  it("exposes immersive min and max zoom for wider mobile framing", () => {
    expect(BAY_AREA_IMMERSIVE_MIN_ZOOM).toBeLessThan(BAY_AREA_DEFAULT_MAX_ZOOM);
    expect(BAY_AREA_IMMERSIVE_MAX_ZOOM).toBeLessThan(BAY_AREA_DEFAULT_MAX_ZOOM);
  });

  it("returns immersive fit options with reduced overlay padding", () => {
    expect(getImmersiveDefaultBayAreaFitOptions()).toEqual({
      padding: {
        top: 88,
        right: 28,
        bottom: 148,
        left: 28,
      },
      maxZoom: BAY_AREA_IMMERSIVE_MAX_ZOOM,
    });
  });

  it("returns tighter phone portrait fit options after the compact overlay redesign", () => {
    expect(getImmersiveDefaultBayAreaFitOptions("phone-portrait")).toEqual({
      padding: {
        top: 58,
        right: 28,
        bottom: 148,
        left: 12,
      },
      maxZoom: BAY_AREA_IMMERSIVE_MAX_ZOOM,
    });
  });

  it("fits the default Bay Area viewport with immersive max zoom", () => {
    const fitBounds = vi.fn();
    const map = { fitBounds } as unknown as import("maplibre-gl").Map;

    fitDefaultBayAreaViewport(
      map,
      getImmersiveDefaultBayAreaFitOptions().padding,
      BAY_AREA_IMMERSIVE_MAX_ZOOM,
    );

    expect(fitBounds).toHaveBeenCalledWith(BAY_AREA_DEFAULT_BOUNDS, {
      padding: {
        top: 88,
        right: 28,
        bottom: 148,
        left: 28,
      },
      maxZoom: BAY_AREA_IMMERSIVE_MAX_ZOOM,
      essential: true,
    });
  });
});

describe("resolveIntensityFilterFitOptions", () => {
  it("uses immersive overlay padding for filtered marker framing on mobile map", () => {
    expect(resolveIntensityFilterFitOptions("immersive")).toEqual({
      padding: {
        top: 132,
        right: 44,
        bottom: 208,
        left: 168,
      },
      maxZoom: 10,
    });
  });

  it("preserves desktop intensity filter framing", () => {
    expect(resolveIntensityFilterFitOptions("desktop")).toEqual({
      padding: 80,
      maxZoom: 10.4,
    });
  });

  it("uses lighter phone portrait overlay padding for filtered marker framing", () => {
    expect(resolveIntensityFilterFitOptions("immersive", "phone-portrait")).toEqual({
      padding: {
        top: 88,
        right: 44,
        bottom: 208,
        left: 108,
      },
      maxZoom: 10,
    });
  });
});
