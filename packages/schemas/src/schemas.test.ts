import { describe, expect, it } from "vitest";

import {
  airQualitySchema,
  climateSchema,
  currentResponseSchema,
  focalPointSchema,
  healthResponseSchema,
  karlIntelligenceResponseSchema,
  locationSearchSchema,
  locationWeatherSchema,
  locationsResponseSchema,
  parseApiResponse,
  pollenSchema,
  ultravioletIndexSchema,
} from "./index";

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

describe("healthResponseSchema", () => {
  it("accepts a valid health payload", () => {
    const result = healthResponseSchema.safeParse({
      status: "ok",
      service: "wheres-karl-api",
      timestamp: "2026-06-30T12:00:00.000Z",
    });
    expect(result.success).toBe(true);
  });

  it("rejects required-field omission and invalid enums", () => {
    expect(
      healthResponseSchema.safeParse({
        service: "wheres-karl-api",
        timestamp: "2026-06-30T12:00:00.000Z",
      }).success,
    ).toBe(false);
    expect(
      healthResponseSchema.safeParse({
        status: "degraded",
        service: "wheres-karl-api",
        timestamp: "2026-06-30T12:00:00.000Z",
      }).success,
    ).toBe(false);
  });
});

describe("locationWeatherSchema", () => {
  it("parses a valid location and preserves optional omission", () => {
    const parsed = locationWeatherSchema.parse(baseLocation);
    expect(parsed.id).toBe("tiburon");
    expect(parsed.airQuality).toBeUndefined();
    expect(parsed.climate).toBeUndefined();
    expect(parsed.search).toBeUndefined();
  });

  it("rejects incorrect primitive types", () => {
    expect(() =>
      locationWeatherSchema.parse({ ...baseLocation, latitude: "37.8" }),
    ).toThrow();
  });

  it("accepts nullable confidence-adjacent nested nulls via dataStatus", () => {
    const parsed = locationWeatherSchema.parse({
      ...baseLocation,
      dataStatus: {
        source: "degraded",
        isDegraded: true,
        lastLiveObservationAt: null,
        freshnessMinutes: null,
      },
    });
    expect(parsed.dataStatus?.lastLiveObservationAt).toBeNull();
    expect(parsed.dataStatus?.freshnessMinutes).toBeNull();
  });

  it("strips unknown additive pollen fields (default strip behavior)", () => {
    const parsed = pollenSchema.parse({
      value: 2,
      category: "low",
      colorToken: "pollen.low",
      label: "Low",
      isAvailable: true,
      plants: [{ name: "Oak" }],
    });
    expect(parsed).not.toHaveProperty("plants");
  });
});

describe("climateSchema", () => {
  it("accepts approved Climate values and strips invalid via catch", () => {
    expect(climateSchema.parse("Marine")).toBe("Marine");
    expect(
      locationWeatherSchema.parse({ ...baseLocation, climate: "Coastal" })
        .climate,
    ).toBeUndefined();
  });

  it("rejects invalid Climate at the enum boundary", () => {
    expect(() => climateSchema.parse("Valley")).toThrow();
  });
});

describe("environmental nested schemas", () => {
  it("accepts nullable AQI and UV values", () => {
    expect(
      airQualitySchema.parse({
        aqi: null,
        category: null,
        label: "Unavailable",
        isAvailable: false,
      }).aqi,
    ).toBeNull();
    expect(
      ultravioletIndexSchema.parse({
        value: null,
        category: null,
        label: "Unavailable",
        isAvailable: false,
      }).value,
    ).toBeNull();
  });

  it("rejects invalid enum members", () => {
    expect(() =>
      airQualitySchema.parse({
        aqi: 1,
        category: "excellent",
        label: "x",
        isAvailable: true,
      }),
    ).toThrow();
  });

  it("rejects malformed focal points", () => {
    expect(() => focalPointSchema.parse({ x: 1.5, y: 0.5 })).toThrow();
  });

  it("requires search.aliases when search is present", () => {
    expect(() => locationSearchSchema.parse({})).toThrow();
    expect(locationSearchSchema.parse({ aliases: [] })).toEqual({ aliases: [] });
  });
});

describe("response wrappers", () => {
  it("parses locations and current wrappers", () => {
    expect(
      locationsResponseSchema.parse({ locations: [baseLocation] }).locations,
    ).toHaveLength(1);
    expect(
      currentResponseSchema.parse({
        id: "bay-area-current",
        summary: "Clear",
        status: "Clear",
        temperature: 68,
        fogCoverage: 10,
        sunshineScore: 80,
        windSpeed: 8,
        windDirection: "W",
        cloudCover: 20,
        visibility: 10,
        humidity: 55,
        weatherCode: 0,
        iconName: "sun.max.fill",
        updatedAt: "2026-07-01T16:00:00.000Z",
        source: "live",
        confidenceScore: 80,
        confidenceLabel: "High",
        confidenceExplanation: "Fresh",
        confidenceComponents: {
          freshness: 80,
          observationQuality: 80,
          fieldCompleteness: 80,
          sourceReliability: 80,
        },
      }).id,
    ).toBe("bay-area-current");
  });

  it("parseApiResponse throws on invalid payloads", () => {
    expect(() => parseApiResponse(healthResponseSchema, { status: "nope" })).toThrow();
  });
});

describe("karlIntelligenceResponseSchema", () => {
  it("rejects malformed nested narrative objects", () => {
    const result = karlIntelligenceResponseSchema.safeParse({
      narrative: { headline: "x" },
      regionalTrends: {},
      movementAssessment: {},
      clearingPredictions: {},
      bestDestinations: {},
      multiRegionRanking: {},
      heroImagery: {},
      generatedAt: "not-a-date",
      validLocationCount: 0,
      source: "live",
    });
    expect(result.success).toBe(false);
  });
});
