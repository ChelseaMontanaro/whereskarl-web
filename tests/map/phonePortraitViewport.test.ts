import { describe, expect, it, vi } from "vitest";

import {
  PHONE_PORTRAIT_ALL_BAY_CAMERA,
  PHONE_PORTRAIT_EAST_BAY_REGION_BOUNDS,
  PHONE_PORTRAIT_EAST_BAY_VIEWPORT_PADDING,
  PHONE_PORTRAIT_NORTH_BAY_REGION_BOUNDS,
  PHONE_PORTRAIT_NORTH_BAY_VIEWPORT_PADDING,
  PHONE_PORTRAIT_PENINSULA_CAMERA,
  PHONE_PORTRAIT_PENINSULA_VIEWPORT_PADDING,
  PHONE_PORTRAIT_SF_REGION_BOUNDS,
  PHONE_PORTRAIT_SF_VIEWPORT_PADDING,
  PHONE_PORTRAIT_SOUTH_BAY_REGION_BOUNDS,
  PHONE_PORTRAIT_SOUTH_BAY_VIEWPORT_PADDING,
} from "@/lib/map/phonePortraitMapPresentation";
import { fitPhonePortraitRegionViewport } from "@/lib/map/phonePortraitViewport";

function createMapSpies() {
  const jumpTo = vi.fn();
  const easeTo = vi.fn();
  const fitBounds = vi.fn();
  const map = {
    jumpTo,
    easeTo,
    fitBounds,
    once: vi.fn(),
  } as unknown as import("maplibre-gl").Map;
  return { map, jumpTo, easeTo, fitBounds };
}

function normalizePadding(padding: unknown) {
  if (typeof padding === "number") {
    return { top: padding, right: padding, bottom: padding, left: padding };
  }
  const p = padding as {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  return {
    top: p.top ?? 48,
    right: p.right ?? 48,
    bottom: p.bottom ?? 48,
    left: p.left ?? 48,
  };
}

const FIT_BOUNDS_REGIONS = [
  {
    id: "san-francisco",
    bounds: PHONE_PORTRAIT_SF_REGION_BOUNDS,
    padding: PHONE_PORTRAIT_SF_VIEWPORT_PADDING,
  },
  {
    id: "north-bay",
    bounds: PHONE_PORTRAIT_NORTH_BAY_REGION_BOUNDS,
    padding: PHONE_PORTRAIT_NORTH_BAY_VIEWPORT_PADDING,
  },
  {
    id: "east-bay",
    bounds: PHONE_PORTRAIT_EAST_BAY_REGION_BOUNDS,
    padding: PHONE_PORTRAIT_EAST_BAY_VIEWPORT_PADDING,
  },
  {
    id: "south-bay",
    bounds: PHONE_PORTRAIT_SOUTH_BAY_REGION_BOUNDS,
    padding: PHONE_PORTRAIT_SOUTH_BAY_VIEWPORT_PADDING,
  },
] as const;

describe("fitPhonePortraitRegionViewport", () => {
  it.each(FIT_BOUNDS_REGIONS)(
    "frames $id with its dedicated phone-portrait bounds",
    ({ bounds, padding, id }) => {
      const { map, fitBounds, jumpTo, easeTo } = createMapSpies();

      fitPhonePortraitRegionViewport(map, id);

      expect(fitBounds).toHaveBeenCalledTimes(1);
      expect(fitBounds).toHaveBeenCalledWith(
        bounds,
        expect.objectContaining({
          padding: normalizePadding(padding),
          duration: 0,
        }),
      );
      // No region may fall back to the all-Bay camera preset.
      expect(jumpTo).not.toHaveBeenCalled();
      expect(easeTo).not.toHaveBeenCalled();
    },
  );

  it("uses the Peninsula camera preset instead of the all-Bay fallback", () => {
    const { map, jumpTo, fitBounds } = createMapSpies();

    fitPhonePortraitRegionViewport(map, "peninsula");

    expect(fitBounds).not.toHaveBeenCalled();
    expect(jumpTo).toHaveBeenCalledWith({
      center: [
        PHONE_PORTRAIT_PENINSULA_CAMERA.longitude,
        PHONE_PORTRAIT_PENINSULA_CAMERA.latitude,
      ],
      zoom: PHONE_PORTRAIT_PENINSULA_CAMERA.zoom,
      padding: PHONE_PORTRAIT_PENINSULA_VIEWPORT_PADDING,
    });
  });

  it("uses the same canonical region target on direct load and on chip switch", () => {
    for (const { id, bounds } of FIT_BOUNDS_REGIONS) {
      const load = createMapSpies();
      const switchTo = createMapSpies();

      // Direct URL load path (duration 0 → jump).
      fitPhonePortraitRegionViewport(load.map, id);
      // Chip switch path (animated).
      fitPhonePortraitRegionViewport(switchTo.map, id, { duration: 450 });

      expect(load.fitBounds.mock.calls[0]?.[0]).toEqual(bounds);
      expect(switchTo.fitBounds.mock.calls[0]?.[0]).toEqual(bounds);
      // Same geographic bounds regardless of animation duration.
      expect(switchTo.fitBounds.mock.calls[0]?.[0]).toEqual(
        load.fitBounds.mock.calls[0]?.[0],
      );
    }

    // Peninsula shares its preset across both paths (jump vs ease).
    const peninsulaLoad = createMapSpies();
    const peninsulaSwitch = createMapSpies();
    fitPhonePortraitRegionViewport(peninsulaLoad.map, "peninsula");
    fitPhonePortraitRegionViewport(peninsulaSwitch.map, "peninsula", {
      duration: 450,
    });
    const expectedCenter = [
      PHONE_PORTRAIT_PENINSULA_CAMERA.longitude,
      PHONE_PORTRAIT_PENINSULA_CAMERA.latitude,
    ];
    expect(peninsulaLoad.jumpTo.mock.calls[0]?.[0]?.center).toEqual(
      expectedCenter,
    );
    expect(peninsulaSwitch.easeTo.mock.calls[0]?.[0]?.center).toEqual(
      expectedCenter,
    );
  });

  it("falls back to the all-Bay camera only when no region is selected", () => {
    const { map, jumpTo, fitBounds } = createMapSpies();

    fitPhonePortraitRegionViewport(map, null);

    expect(fitBounds).not.toHaveBeenCalled();
    expect(jumpTo).toHaveBeenCalledWith({
      center: [
        PHONE_PORTRAIT_ALL_BAY_CAMERA.longitude,
        PHONE_PORTRAIT_ALL_BAY_CAMERA.latitude,
      ],
      zoom: PHONE_PORTRAIT_ALL_BAY_CAMERA.zoom,
    });
  });
});
