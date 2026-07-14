import { describe, expect, it } from "vitest";

import {
  locationWeatherSchema,
  pollenSchema,
} from "@/lib/schemas/weather";

const baseLocation = {
  id: "tiburon",
  name: "Tiburon",
  latitude: 37.8735,
  longitude: -122.4566,
  distanceText: "8 mi",
  status: "Mostly Sunny",
  temperature: 68,
  sunshineScore: 82,
  cloudCover: 30,
  visibility: 8,
  humidity: 60,
  windSpeed: 8,
  windDirection: "W",
  weatherCode: 2,
  iconName: "cloud.sun.fill",
  fogScore: 18,
  updatedAt: "2026-07-01T16:00:00.000Z",
  karlReason: "Mostly clear across Tiburon.",
  primaryDrivers: [],
  microclimateFactors: [],
  confidenceScore: 0,
  confidenceLabel: "Unavailable",
  confidenceExplanation: "Confidence unavailable for demo or fallback data.",
  confidenceComponents: {
    freshness: 0,
    observationQuality: 0,
    fieldCompleteness: 0,
    sourceReliability: 0,
  },
  prediction: {
    predictionConfidenceScore: 0,
    predictionConfidenceLabel: "Unavailable",
    predictionReason: "Prediction is unavailable while Karl is using fallback data.",
  },
};

describe("pollen schema", () => {
  it("accepts a valid available pollen object with typed breakdown", () => {
    const parsed = pollenSchema.parse({
      value: 4,
      category: "high",
      colorToken: "pollen.high",
      label: "High",
      description: "Pollen allergy symptoms are likely for sensitive people.",
      dominantType: "grass",
      types: {
        tree: null,
        grass: {
          value: 4,
          category: "high",
          colorToken: "pollen.high",
          label: "High",
          description: null,
          inSeason: true,
        },
        weed: {
          value: 2,
          category: "low",
          colorToken: "pollen.low",
          label: "Low",
          description: null,
          inSeason: true,
        },
      },
      forecastDate: "2026-07-14",
      source: "Google Pollen",
      isAvailable: true,
    });

    expect(parsed.value).toBe(4);
    expect(parsed.category).toBe("high");
    expect(parsed.colorToken).toBe("pollen.high");
    expect(parsed.forecastDate).toBe("2026-07-14");
    expect(parsed.types?.tree).toBeNull();
    expect(parsed.types?.grass?.value).toBe(4);
  });

  it("accepts an unavailable pollen object", () => {
    const parsed = pollenSchema.parse({
      value: null,
      category: null,
      colorToken: "pollen.unavailable",
      label: "Unavailable",
      description: null,
      dominantType: null,
      types: { tree: null, grass: null, weed: null },
      forecastDate: null,
      source: null,
      isAvailable: false,
    });

    expect(parsed.isAvailable).toBe(false);
    expect(parsed.value).toBeNull();
    expect(parsed.colorToken).toBe("pollen.unavailable");
  });

  it("rejects invalid categories and color tokens", () => {
    expect(() =>
      pollenSchema.parse({
        value: 3,
        category: "extreme",
        label: "Extreme",
        isAvailable: true,
      }),
    ).toThrow();

    expect(() =>
      pollenSchema.parse({
        value: 3,
        category: "moderate",
        colorToken: "pollen.extreme",
        label: "Moderate",
        isAvailable: true,
      }),
    ).toThrow();
  });

  it("rejects observedAt-style timestamps as forecastDate", () => {
    expect(() =>
      pollenSchema.parse({
        value: 2,
        category: "low",
        label: "Low",
        forecastDate: "2026-07-14T12:00:00.000Z",
        isAvailable: true,
      }),
    ).toThrow();
  });

  it("allows optional pollen on location weather payloads", () => {
    expect(locationWeatherSchema.parse(baseLocation).pollen).toBeUndefined();

    const withPollen = locationWeatherSchema.parse({
      ...baseLocation,
      pollen: {
        value: 1,
        category: "very-low",
        colorToken: "pollen.very-low",
        label: "Very Low",
        forecastDate: "2026-07-14",
        source: "Google Pollen",
        isAvailable: true,
      },
    });

    expect(withPollen.pollen?.value).toBe(1);
  });
});
