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
  const setPadding = vi.fn();
  const map = {
    jumpTo,
    easeTo,
    fitBounds,
    setPadding,
    once: vi.fn(),
  } as unknown as import("maplibre-gl").Map;
  return { map, jumpTo, easeTo, fitBounds, setPadding };
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

  it("resets persistent transform padding before every region application", () => {
    const { map, setPadding } = createMapSpies();

    for (const { id } of FIT_BOUNDS_REGIONS) {
      fitPhonePortraitRegionViewport(map, id);
    }
    fitPhonePortraitRegionViewport(map, "peninsula");
    fitPhonePortraitRegionViewport(map, null);

    // One reset per application (4 fitBounds regions + Peninsula + all-Bay).
    expect(setPadding).toHaveBeenCalledTimes(6);
    for (const call of setPadding.mock.calls) {
      expect(call[0]).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
    }
  });

  it("re-applies each region's canonical camera identically across repeated cycles", () => {
    const { map, fitBounds, jumpTo, setPadding } = createMapSpies();
    const order = [
      "san-francisco",
      "north-bay",
      "east-bay",
      "south-bay",
      "peninsula",
    ] as const;

    // Three full cycles including the Peninsula preset (which sets persistent
    // padding) so any leftover-padding regression would surface on cycle 2+.
    const CYCLES = 3;
    for (let cycle = 0; cycle < CYCLES; cycle += 1) {
      for (const id of order) {
        fitPhonePortraitRegionViewport(map, id, { duration: 450 });
      }
    }

    // Padding is reset once per application (5 regions × 3 cycles).
    expect(setPadding).toHaveBeenCalledTimes(order.length * CYCLES);

    // Each fitBounds region is invoked once per cycle with identical arguments,
    // proving switching away and back reproduces the first selection's camera.
    for (const { id, bounds, padding } of FIT_BOUNDS_REGIONS) {
      const callsForRegion = fitBounds.mock.calls.filter(
        (call) => call[0] === bounds,
      );
      expect(callsForRegion).toHaveLength(CYCLES);
      for (const call of callsForRegion) {
        expect(call[1]).toEqual(
          expect.objectContaining({
            padding: normalizePadding(padding),
            duration: 450,
          }),
        );
      }
      void id;
    }

    // Peninsula keeps its dedicated animated preset every cycle.
    const peninsulaCalls = jumpTo.mock.calls.length; // none (all animated)
    expect(peninsulaCalls).toBe(0);
  });
});
