import { describe, expect, it } from "vitest";

import {
  focalPointSchema,
  locationWeatherSchema,
} from "@/lib/schemas/weather";

const baseLocation = {
  id: "redwood-city",
  name: "Redwood City",
  latitude: 37.4852,
  longitude: -122.2364,
  distanceText: "25 mi",
  status: "Mostly Sunny",
  temperature: 72,
  sunshineScore: 80,
  cloudCover: 20,
  visibility: 10,
  humidity: 55,
  windSpeed: 8,
  windDirection: "W",
  weatherCode: 1,
  iconName: "sun.max.fill",
  fogScore: 15,
  updatedAt: "2026-07-15T20:00:00.000Z",
  karlReason: "Clear inland.",
  primaryDrivers: [],
  microclimateFactors: [],
  confidenceScore: 80,
  confidenceLabel: "High",
  confidenceExplanation: "Fresh fused observations.",
  confidenceComponents: {
    freshness: 80,
    observationQuality: 80,
    fieldCompleteness: 80,
    sourceReliability: 80,
  },
  prediction: {
    predictionConfidenceScore: 70,
    predictionConfidenceLabel: "Medium",
    predictionReason: "Holding steady.",
  },
};

describe("location imagery schema", () => {
  it("accepts imageUrl on location payloads", () => {
    const parsed = locationWeatherSchema.parse({
      ...baseLocation,
      imageUrl: "https://cdn.example.com/assets/hero/redwood-city/day.png",
    });

    expect(parsed.imageUrl).toBe(
      "https://cdn.example.com/assets/hero/redwood-city/day.png",
    );
  });

  it("accepts nullable imageUrl", () => {
    const parsed = locationWeatherSchema.parse({
      ...baseLocation,
      imageUrl: null,
    });

    expect(parsed.imageUrl).toBeNull();
  });

  it("accepts focalPoint on location payloads", () => {
    const parsed = locationWeatherSchema.parse({
      ...baseLocation,
      focalPoint: { x: 0.5, y: 0.52 },
    });

    expect(parsed.focalPoint).toEqual({ x: 0.5, y: 0.52 });
  });

  it("accepts nullable focalPoint", () => {
    const parsed = locationWeatherSchema.parse({
      ...baseLocation,
      focalPoint: null,
    });

    expect(parsed.focalPoint).toBeNull();
  });

  it("allows missing imagery fields on older payloads", () => {
    const parsed = locationWeatherSchema.parse(baseLocation);

    expect(parsed.imageUrl).toBeUndefined();
    expect(parsed.focalPoint).toBeUndefined();
  });

  it("rejects out-of-range focalPoint coordinates", () => {
    expect(() => focalPointSchema.parse({ x: 1.5, y: 0.5 })).toThrow();
    expect(() => focalPointSchema.parse({ x: 0.5, y: -0.1 })).toThrow();
  });

  it("strips unknown keys while keeping imagery fields", () => {
    const parsed = locationWeatherSchema.parse({
      ...baseLocation,
      imageUrl: "https://cdn.example.com/assets/hero/redwood-city/day.png",
      focalPoint: { x: 0.5, y: 0.52 },
      mapImage: "should-not-leak",
      thumbnail: "should-not-leak",
    });

    expect(parsed.imageUrl).toBe(
      "https://cdn.example.com/assets/hero/redwood-city/day.png",
    );
    expect(parsed.focalPoint).toEqual({ x: 0.5, y: 0.52 });
    expect(
      Object.prototype.hasOwnProperty.call(parsed, "mapImage"),
    ).toBe(false);
    expect(
      Object.prototype.hasOwnProperty.call(parsed, "thumbnail"),
    ).toBe(false);
  });
});
