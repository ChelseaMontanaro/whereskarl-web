import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { parseApiResponse } from "@/lib/schemas/parse";
import { isMapMarkerVisible } from "@/lib/map/markers";
import {
  locationWeatherSchema,
  locationsResponseSchema,
} from "@/lib/schemas/weather";

const FIXTURES_DIR = join(process.cwd(), "tests/fixtures");

const confidenceFields = {
  confidenceScore: 81,
  confidenceLabel: "High",
  confidenceExplanation: "High confidence because recent observations agree.",
  confidenceComponents: {
    freshness: 85,
    observationQuality: 75,
    fieldCompleteness: 100,
    sourceReliability: 90,
  },
  prediction: {
    trend: "steady",
    projectedFogScore1h: 32,
    burnOffEstimateLocal: null,
    predictionReason: "Fog may linger over the next hour.",
    predictionConfidenceScore: 42,
    predictionConfidenceLabel: "Low",
    predictionDrivers: ["Mixed fog signals"],
  },
} as const;

function buildProductionLikeLocation(
  overrides: Partial<Record<string, unknown>> & { id: string; name: string },
) {
  return {
    latitude: 37.8735,
    longitude: -122.4566,
    distanceText: "9 mi",
    status: "Partly Sunny",
    temperature: 56,
    sunshineScore: 68,
    cloudCover: 18,
    visibility: 9.6,
    humidity: 93,
    windSpeed: 5,
    windDirection: "WSW",
    weatherCode: 1,
    iconName: "sun.max.fill",
    fogScore: 32,
    updatedAt: "2026-07-04T05:35:00+00:00",
    karlReason: "Patchy conditions — good visibility and low cloud cover.",
    primaryDrivers: ["Good visibility"],
    microclimateFactors: [],
    ...confidenceFields,
    ...overrides,
  };
}

describe("Phase C2 dataStatus regression", () => {
  it("parses /locations payloads that include dataStatus", () => {
    const payload = {
      locations: [
        buildProductionLikeLocation({
          id: "tiburon",
          name: "Tiburon",
          dataStatus: {
            source: "live",
            isDegraded: false,
            lastLiveObservationAt: "2026-07-04T05:35:00+00:00",
            freshnessMinutes: 28,
          },
        }),
        buildProductionLikeLocation({
          id: "sausalito",
          name: "Sausalito",
          dataStatus: {
            source: "live",
            isDegraded: false,
            lastLiveObservationAt: "2026-07-04T05:35:00+00:00",
            freshnessMinutes: 28,
          },
        }),
      ],
    };

    const parsed = parseApiResponse(locationsResponseSchema, payload);

    expect(parsed.locations).toHaveLength(2);
    expect(parsed.locations[0]?.dataStatus).toEqual({
      source: "live",
      isDegraded: false,
      lastLiveObservationAt: "2026-07-04T05:35:00+00:00",
      freshnessMinutes: 28,
    });
  });

  it("parses legacy /locations payloads without dataStatus", () => {
    const payload = JSON.parse(
      readFileSync(join(FIXTURES_DIR, "locations.json"), "utf8"),
    ) as unknown;

    const parsed = parseApiResponse(locationsResponseSchema, payload);

    expect(parsed.locations.length).toBeGreaterThan(0);
    expect(parsed.locations.every((location) => location.dataStatus === undefined)).toBe(
      true,
    );
  });

  it("does not drop degraded location records", () => {
    const liveLocation = buildProductionLikeLocation({
      id: "tiburon",
      name: "Tiburon",
      dataStatus: {
        source: "live",
        isDegraded: false,
        lastLiveObservationAt: "2026-07-04T05:35:00+00:00",
        freshnessMinutes: 12,
      },
    });
    const degradedLocation = buildProductionLikeLocation({
      id: "stinson-beach",
      name: "Stinson Beach",
      fogScore: 88,
      sunshineScore: 12,
      status: "Karl Territory",
      dataStatus: {
        source: "degraded",
        isDegraded: true,
        lastLiveObservationAt: null,
        freshnessMinutes: null,
      },
    });

    const parsed = locationsResponseSchema.parse({
      locations: [liveLocation, degradedLocation],
    });

    expect(parsed.locations.map((location) => location.id)).toEqual([
      "tiburon",
      "stinson-beach",
    ]);
    expect(parsed.locations[1]?.dataStatus).toEqual({
      source: "degraded",
      isDegraded: true,
      lastLiveObservationAt: null,
      freshnessMinutes: null,
    });
    expect(locationWeatherSchema.parse(degradedLocation).id).toBe("stinson-beach");
  });

  it("maps parsed locations with dataStatus into visible map markers", () => {
    const payload = {
      locations: [
        buildProductionLikeLocation({
          id: "tiburon",
          name: "Tiburon",
          region: "north-bay",
          dataStatus: {
            source: "live",
            isDegraded: false,
            lastLiveObservationAt: "2026-07-04T05:35:00+00:00",
            freshnessMinutes: 28,
          },
        }),
        buildProductionLikeLocation({
          id: "daly-city",
          name: "Daly City",
          region: "peninsula",
          latitude: 37.6875,
          longitude: -122.4702,
          dataStatus: {
            source: "degraded",
            isDegraded: true,
            lastLiveObservationAt: null,
            freshnessMinutes: null,
          },
        }),
      ],
    };

    const parsed = parseApiResponse(locationsResponseSchema, payload);
    const markerLocations = parsed.locations.map((location) => ({
      id: location.id,
      name: location.name,
      latitude: location.latitude,
      longitude: location.longitude,
      sunshineScore: location.sunshineScore,
      fogScore: location.fogScore,
      status: location.status,
      region: location.region,
    }));

    expect(markerLocations).toHaveLength(2);
    expect(
      markerLocations.every((location) =>
        isMapMarkerVisible(location, {
          intensityFilter: null,
          selectedRegionId: null,
        }),
      ),
    ).toBe(true);
  });
});
