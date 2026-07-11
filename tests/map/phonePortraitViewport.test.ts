import { describe, expect, it, vi } from "vitest";

import {
  PHONE_PORTRAIT_PENINSULA_CAMERA,
  PHONE_PORTRAIT_PENINSULA_VIEWPORT_PADDING,
} from "@/lib/map/phonePortraitMapPresentation";
import { fitPhonePortraitRegionViewport } from "@/lib/map/phonePortraitViewport";

describe("fitPhonePortraitRegionViewport", () => {
  it("uses the Peninsula camera preset instead of all-Bay fallback", () => {
    const jumpTo = vi.fn();
    const easeTo = vi.fn();
    const fitBounds = vi.fn();
    const map = {
      jumpTo,
      easeTo,
      fitBounds,
      once: vi.fn(),
    } as unknown as import("maplibre-gl").Map;

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

  it("falls back to all-Bay camera when region is null", () => {
    const jumpTo = vi.fn();
    const map = { jumpTo, easeTo: vi.fn(), fitBounds: vi.fn() } as unknown as import("maplibre-gl").Map;

    fitPhonePortraitRegionViewport(map, null);

    expect(jumpTo).toHaveBeenCalledWith({
      center: [-122.27, 37.58],
      zoom: 8,
    });
  });
});
