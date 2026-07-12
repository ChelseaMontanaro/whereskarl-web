import { describe, expect, it } from "vitest";

import {
  AIR_QUALITY_COLORS,
  airQualityCategoryLabel,
  presentAirQuality,
  resolveAirQualityBand,
} from "@/lib/weather/airQuality";

describe("airQuality presentation", () => {
  it("bands AQI using canonical categories", () => {
    expect(resolveAirQualityBand(0)).toBe("good");
    expect(resolveAirQualityBand(50)).toBe("good");
    expect(resolveAirQualityBand(51)).toBe("moderate");
    expect(resolveAirQualityBand(100)).toBe("moderate");
    expect(resolveAirQualityBand(101)).toBe("poor");
    expect(resolveAirQualityBand(300)).toBe("poor");
  });

  it("labels each category", () => {
    expect(airQualityCategoryLabel(30)).toBe("Good");
    expect(airQualityCategoryLabel(80)).toBe("Moderate");
    expect(airQualityCategoryLabel(160)).toBe("Unhealthy");
  });

  it("reports availability and canonical color for present data", () => {
    expect(presentAirQuality(42)).toEqual({
      available: true,
      aqi: 42,
      band: "good",
      color: AIR_QUALITY_COLORS.good,
      label: "Good",
    });
  });

  it("reports unavailable without inventing a value when data is missing", () => {
    for (const value of [null, undefined, Number.NaN]) {
      expect(presentAirQuality(value)).toEqual({
        available: false,
        aqi: null,
        band: null,
        color: null,
        label: "Not available",
      });
    }
  });
});
