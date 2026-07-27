import { describe, expect, it } from "vitest";

import {
  AIR_QUALITY_COLOR_BY_TOKEN,
  CLEAR_SKIES_SCORE_COLORS,
  cssColorTokens,
  designTokens,
  POLLEN_COLOR_BY_TOKEN,
  rgbToken,
  UV_INDEX_COLOR_BY_TOKEN,
} from "./index";

describe("@whereskarl/design tokens", () => {
  it("exposes exact brand RGB channels", () => {
    expect(designTokens).toEqual({
      navy: { r: 3, g: 11, b: 20 },
      navySoft: { r: 7, g: 22, b: 35 },
      navyGlass: { r: 9, g: 27, b: 42 },
      gold: { r: 242, g: 163, b: 38 },
      goldDeep: { r: 148, g: 92, b: 20 },
    });
  });

  it("formats rgb() with space-separated channels by default", () => {
    expect(rgbToken(designTokens.navy)).toBe("rgb(3 11 20)");
    expect(rgbToken(designTokens.gold)).toBe("rgb(242 163 38)");
  });

  it("formats rgb() with comma-separated channels when requested", () => {
    expect(rgbToken(designTokens.navy, "css-comma")).toBe("rgb(3, 11, 20)");
    expect(rgbToken(designTokens.gold, "css-comma")).toBe("rgb(242, 163, 38)");
  });

  it("exposes cssColorTokens matching space-separated brand colors", () => {
    expect(cssColorTokens).toEqual({
      navy: "rgb(3 11 20)",
      navySoft: "rgb(7 22 35)",
      navyGlass: "rgb(9 27 42)",
      gold: "rgb(242 163 38)",
      goldDeep: "rgb(148 92 20)",
    });
  });

  it("exposes exact Clear Skies Score hex palette", () => {
    expect(CLEAR_SKIES_SCORE_COLORS).toEqual({
      clear: "#22E36B",
      moderate: "#F5A623",
      poor: "#FF5A5F",
    });
  });

  it("exposes exact environmental colorToken hex registries", () => {
    expect(AIR_QUALITY_COLOR_BY_TOKEN).toEqual({
      "aqi.good": "#22E36B",
      "aqi.moderate": "#F5A623",
      "aqi.unhealthy-sensitive": "#F97316",
      "aqi.unhealthy": "#FF5A5F",
      "aqi.very-unhealthy": "#A855F7",
      "aqi.hazardous": "#7F1D1D",
      "aqi.unavailable": null,
    });

    expect(UV_INDEX_COLOR_BY_TOKEN).toEqual({
      "uv.low": "#22E36B",
      "uv.moderate": "#F5A623",
      "uv.high": "#F97316",
      "uv.very-high": "#FF5A5F",
      "uv.extreme": "#A855F7",
      "uv.unavailable": null,
    });

    expect(POLLEN_COLOR_BY_TOKEN).toEqual({
      "pollen.none": "#22E36B",
      "pollen.very-low": "#84CC16",
      "pollen.low": "#F5A623",
      "pollen.moderate": "#F97316",
      "pollen.high": "#FF5A5F",
      "pollen.very-high": "#A855F7",
      "pollen.unavailable": null,
    });
  });
});
