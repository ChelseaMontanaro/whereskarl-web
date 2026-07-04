import { describe, expect, it } from "vitest";

import {
  getKarlMapStyleLayerIds,
  getKarlMapStyleLayerPaint,
  HYBRID_LABEL_OPACITY_BASELINE,
  HYBRID_ROAD_OPACITY_BASELINE,
  hybridLabelPaint,
  hybridMajorRoadPaint,
  karlMapStyleHasLabelLayer,
  karlMapStyleHasRoadLayer,
  resolveKarlMapStyle,
} from "@/lib/map/styles";

describe("resolveKarlMapStyle", () => {
  it("exposes labels and roads only on hybrid, not satellite or standard", () => {
    expect(karlMapStyleHasLabelLayer("hybrid")).toBe(true);
    expect(karlMapStyleHasRoadLayer("hybrid")).toBe(true);
    expect(karlMapStyleHasLabelLayer("satellite")).toBe(false);
    expect(karlMapStyleHasRoadLayer("satellite")).toBe(false);
    expect(karlMapStyleHasLabelLayer("standard")).toBe(false);
    expect(karlMapStyleHasRoadLayer("standard")).toBe(false);
  });

  it("keeps satellite imagery-only with no label or road layers", () => {
    const style = resolveKarlMapStyle("satellite");

    expect(typeof style).toBe("object");
    if (typeof style === "string") {
      return;
    }

    expect(style.sources).not.toHaveProperty("karl-labels");
    expect(style.sources).not.toHaveProperty("karl-roads");
    expect(getKarlMapStyleLayerIds("satellite")).toEqual(["karl-satellite"]);
  });

  it("adds readable label and tiered road raster layers on top of satellite imagery for hybrid", () => {
    const style = resolveKarlMapStyle("hybrid");

    expect(typeof style).toBe("object");
    if (typeof style === "string") {
      return;
    }

    expect(style.sources).toHaveProperty("karl-labels");
    expect(style.sources).toHaveProperty("karl-roads");
    expect(getKarlMapStyleLayerIds("hybrid")).toEqual([
      "karl-satellite",
      "karl-roads-minor",
      "karl-roads-major",
      "karl-labels",
    ]);
  });

  it("uses different layer visibility between satellite and hybrid", () => {
    const satelliteLayers = getKarlMapStyleLayerIds("satellite");
    const hybridLayers = getKarlMapStyleLayerIds("hybrid");

    expect(satelliteLayers).not.toEqual(hybridLayers);
    expect(hybridLayers).toEqual(
      expect.arrayContaining([
        "karl-labels",
        "karl-roads-minor",
        "karl-roads-major",
      ]),
    );
    expect(satelliteLayers).not.toEqual(
      expect.arrayContaining(["karl-labels", "karl-roads"]),
    );
  });

  it("boosts hybrid label and major-road paint above the previous faded baseline", () => {
    expect(hybridLabelPaint["raster-opacity"]).toBeGreaterThan(
      HYBRID_LABEL_OPACITY_BASELINE,
    );
    expect(hybridMajorRoadPaint["raster-opacity"]).toBeGreaterThan(
      HYBRID_ROAD_OPACITY_BASELINE,
    );
    expect(hybridMajorRoadPaint["raster-opacity"]).toBeGreaterThan(
      getKarlMapStyleLayerPaint("hybrid", "karl-roads-minor")?.[
        "raster-opacity"
      ] ?? 0,
    );
    expect(getKarlMapStyleLayerPaint("hybrid", "karl-labels")).toMatchObject({
      "raster-opacity": hybridLabelPaint["raster-opacity"],
      "raster-contrast": hybridLabelPaint["raster-contrast"],
    });
    expect(getKarlMapStyleLayerPaint("hybrid", "karl-roads-major")).toMatchObject({
      "raster-hue-rotate": hybridMajorRoadPaint["raster-hue-rotate"],
    });
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
