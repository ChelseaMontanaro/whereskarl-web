import { describe, expect, it } from "vitest";

import {
  airQualitySchema,
  locationWeatherSchema,
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

describe("airQuality schema", () => {
  it("accepts a valid available AQI object", () => {
    const parsed = airQualitySchema.parse({
      aqi: 42,
      category: "good",
      colorToken: "aqi.good",
      label: "Good",
      description: "Air quality is considered satisfactory.",
      pollutant: "PM2.5",
      observedAt: "2026-07-13T20:00:00.000Z",
      source: "Open-Meteo",
      isAvailable: true,
    });

    expect(parsed.aqi).toBe(42);
    expect(parsed.category).toBe("good");
    expect(parsed.colorToken).toBe("aqi.good");
  });

  it("accepts an unavailable AQI object", () => {
    const parsed = airQualitySchema.parse({
      aqi: null,
      category: null,
      colorToken: "aqi.unavailable",
      label: "Unavailable",
      description: null,
      pollutant: null,
      observedAt: null,
      source: null,
      isAvailable: false,
    });

    expect(parsed.isAvailable).toBe(false);
    expect(parsed.aqi).toBeNull();
    expect(parsed.colorToken).toBe("aqi.unavailable");
  });

  it("rejects invalid categories", () => {
    expect(() =>
      airQualitySchema.parse({
        aqi: 42,
        category: "excellent",
        label: "Excellent",
        isAvailable: true,
      }),
    ).toThrow();
  });

  it("rejects invalid color tokens", () => {
    expect(() =>
      airQualitySchema.parse({
        aqi: 42,
        category: "good",
        colorToken: "aqi.excellent",
        label: "Good",
        isAvailable: true,
      }),
    ).toThrow();
  });

  it("keeps location payloads compatible when airQuality is omitted", () => {
    expect(locationWeatherSchema.parse(baseLocation).id).toBe("tiburon");
  });

  it("accepts location payloads that include airQuality", () => {
    const parsed = locationWeatherSchema.parse({
      ...baseLocation,
      airQuality: {
        aqi: 85,
        category: "moderate",
        label: "Moderate",
        description: null,
        pollutant: null,
        observedAt: "2026-07-13T20:00:00.000Z",
        source: "Open-Meteo",
        isAvailable: true,
      },
    });

    expect(parsed.airQuality?.aqi).toBe(85);
    expect(parsed.airQuality?.category).toBe("moderate");
  });
});
