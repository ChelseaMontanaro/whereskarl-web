import { describe, expect, it } from "vitest";

import type { AirQuality } from "@/lib/schemas/weather";
import {
  AIR_QUALITY_COLOR_BY_TOKEN,
  formatAirQualityCompact,
  presentAirQuality,
} from "@/lib/weather/airQuality";

function airQualityFixture(
  overrides: Partial<AirQuality> &
    Pick<AirQuality, "aqi" | "category" | "label">,
): AirQuality {
  return {
    description: null,
    pollutant: null,
    observedAt: "2026-07-13T20:00:00.000Z",
    source: "Open-Meteo",
    isAvailable: true,
    colorToken: overrides.category
      ? (`aqi.${overrides.category}` as AirQuality["colorToken"])
      : "aqi.unavailable",
    ...overrides,
  };
}

describe("airQuality presentation", () => {
  it("uses backend colorToken for semantic styling without re-banding", () => {
    const cases: Array<[NonNullable<AirQuality["category"]>, string]> = [
      ["good", "Good"],
      ["moderate", "Moderate"],
      ["unhealthy-sensitive", "Unhealthy for Sensitive Groups"],
      ["unhealthy", "Unhealthy"],
      ["very-unhealthy", "Very Unhealthy"],
      ["hazardous", "Hazardous"],
    ];

    for (const [category, label] of cases) {
      const colorToken = `aqi.${category}` as const;
      const presentation = presentAirQuality(
        airQualityFixture({
          aqi: 42,
          category,
          label,
          colorToken,
        }),
      );

      expect(presentation.available).toBe(true);
      expect(presentation.category).toBe(category);
      expect(presentation.colorToken).toBe(colorToken);
      expect(presentation.label).toBe(label);
      expect(presentation.color).toBe(AIR_QUALITY_COLOR_BY_TOKEN[colorToken]);
    }
  });

  it("reports availability and canonical color for present data", () => {
    expect(
      presentAirQuality(
        airQualityFixture({
          aqi: 42,
          category: "good",
          label: "Good",
          colorToken: "aqi.good",
          description: "Air quality is considered satisfactory.",
        }),
      ),
    ).toEqual({
      available: true,
      aqi: 42,
      category: "good",
      colorToken: "aqi.good",
      color: AIR_QUALITY_COLOR_BY_TOKEN["aqi.good"],
      label: "Good",
      description: "Air quality is considered satisfactory.",
    });
  });

  it("reports unavailable without inventing a value when data is missing", () => {
    for (const value of [
      null,
      undefined,
      {
        aqi: null,
        category: null,
        colorToken: "aqi.unavailable" as const,
        label: "Unavailable",
        description: null,
        pollutant: null,
        observedAt: null,
        source: null,
        isAvailable: false,
      } satisfies AirQuality,
      airQualityFixture({
        aqi: Number.NaN,
        category: "good",
        label: "Good",
        isAvailable: true,
      }),
      airQualityFixture({
        aqi: 42,
        category: null,
        label: "Good",
        isAvailable: true,
      }),
    ]) {
      expect(presentAirQuality(value)).toEqual({
        available: false,
        aqi: null,
        category: null,
        colorToken: "aqi.unavailable",
        color: null,
        label: "Unavailable",
        description: null,
      });
    }
  });

  it("formats compact selected-location copy", () => {
    expect(
      formatAirQualityCompact(
        presentAirQuality(
          airQualityFixture({ aqi: 42, category: "good", label: "Good" }),
        ),
      ),
    ).toBe("42 · Good");

    expect(formatAirQualityCompact(presentAirQuality(null))).toBe("Unavailable");
  });
});
