import { describe, expect, it } from "vitest";

import {
  locationWeatherSchema,
  ultravioletIndexSchema,
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

describe("uvIndex schema", () => {
  it("accepts a valid available UV Index object", () => {
    const parsed = ultravioletIndexSchema.parse({
      value: 8,
      category: "very-high",
      colorToken: "uv.very-high",
      label: "Very High",
      description: "Sun protection is strongly recommended.",
      observedAt: "2026-07-13T20:00:00.000Z",
      source: "Open-Meteo",
      isAvailable: true,
    });

    expect(parsed.value).toBe(8);
    expect(parsed.category).toBe("very-high");
    expect(parsed.colorToken).toBe("uv.very-high");
  });

  it("accepts an unavailable UV Index object", () => {
    const parsed = ultravioletIndexSchema.parse({
      value: null,
      category: null,
      colorToken: "uv.unavailable",
      label: "Unavailable",
      description: null,
      observedAt: null,
      source: null,
      isAvailable: false,
    });

    expect(parsed.isAvailable).toBe(false);
    expect(parsed.value).toBeNull();
    expect(parsed.colorToken).toBe("uv.unavailable");
  });

  it("rejects invalid categories", () => {
    expect(() =>
      ultravioletIndexSchema.parse({
        value: 8,
        category: "severe",
        label: "Severe",
        isAvailable: true,
      }),
    ).toThrow();
  });

  it("rejects invalid color tokens", () => {
    expect(() =>
      ultravioletIndexSchema.parse({
        value: 8,
        category: "high",
        colorToken: "uv.severe",
        label: "High",
        isAvailable: true,
      }),
    ).toThrow();
  });

  it("keeps location payloads compatible when uvIndex is omitted", () => {
    expect(locationWeatherSchema.parse(baseLocation).id).toBe("tiburon");
  });

  it("accepts location payloads that include uvIndex", () => {
    const parsed = locationWeatherSchema.parse({
      ...baseLocation,
      uvIndex: {
        value: 5,
        category: "moderate",
        colorToken: "uv.moderate",
        label: "Moderate",
        description: null,
        observedAt: "2026-07-13T20:00:00.000Z",
        source: "Open-Meteo",
        isAvailable: true,
      },
    });

    expect(parsed.uvIndex?.value).toBe(5);
    expect(parsed.uvIndex?.category).toBe("moderate");
  });
});
