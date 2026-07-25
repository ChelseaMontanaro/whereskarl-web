import { describe, expect, it } from "vitest";

import {
  locationSearchSchema,
  locationWeatherSchema,
} from "@/lib/schemas/weather";

const baseLocation = {
  id: "mount-tamalpais",
  name: "Mount Tamalpais",
  latitude: 37.9235,
  longitude: -122.5965,
  distanceText: "14 mi",
  status: "Partly Sunny",
  temperature: 62,
  sunshineScore: 58,
  cloudCover: 55,
  visibility: 6.5,
  humidity: 74,
  windSpeed: 12,
  windDirection: "W",
  weatherCode: 3,
  iconName: "cloud.sun.fill",
  fogScore: 52,
  updatedAt: "2026-07-15T16:00:00.000Z",
  karlReason: "Transition ridge conditions.",
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

describe("location search schema", () => {
  it("accepts search.aliases from the catalog payload", () => {
    const search = {
      aliases: ["mt tam", "mount tam", "tamalpais"],
    };

    expect(locationSearchSchema.parse(search)).toEqual(search);
    expect(
      locationWeatherSchema.parse({ ...baseLocation, search }).search,
    ).toEqual(search);
  });

  it("accepts empty aliases arrays", () => {
    const search = { aliases: [] };

    expect(
      locationWeatherSchema.parse({ ...baseLocation, search }).search,
    ).toEqual(search);
  });

  it("allows missing search on older location payloads", () => {
    expect(locationWeatherSchema.parse(baseLocation).search).toBeUndefined();
  });

  it("rejects malformed search metadata", () => {
    expect(() => locationSearchSchema.parse({})).toThrow();
    expect(() => locationSearchSchema.parse({ aliases: "mt tam" })).toThrow();
    expect(() =>
      locationWeatherSchema.parse({
        ...baseLocation,
        search: { aliases: [1] },
      }),
    ).toThrow();
  });
});
