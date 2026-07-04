import { describe, expect, it } from "vitest";

import {
  karlMapStyleHasLabelLayer,
  resolveKarlMapStyle,
} from "@/lib/map/styles";

describe("resolveKarlMapStyle", () => {
  it("includes label layers on satellite and hybrid styles", () => {
    expect(karlMapStyleHasLabelLayer("satellite")).toBe(true);
    expect(karlMapStyleHasLabelLayer("hybrid")).toBe(true);
    expect(karlMapStyleHasLabelLayer("standard")).toBe(false);
  });

  it("adds a label raster layer to satellite imagery", () => {
    const style = resolveKarlMapStyle("satellite");

    expect(typeof style).toBe("object");
    if (typeof style === "string") {
      return;
    }

    expect(style.sources).toHaveProperty("karl-labels");
    expect(style.layers?.some((layer) => layer.id === "karl-labels")).toBe(true);
  });

  it("grades satellite imagery toward muted tan/olive without canvas filters", () => {
    const style = resolveKarlMapStyle("satellite");

    expect(typeof style).toBe("object");
    if (typeof style === "string") {
      return;
    }

    const satelliteLayer = style.layers?.find((layer) => layer.id === "karl-satellite");
    expect(satelliteLayer?.paint).toMatchObject({
      "raster-brightness-max": 0.64,
      "raster-contrast": 0.38,
      "raster-saturation": -0.06,
      "raster-hue-rotate": 14,
    });
  });
});
