import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  heroConfidenceText,
  heroSubheadline,
  movementPhrase,
} from "@/lib/home/weatherDisplay";
import { karlIntelligenceResponseSchema } from "@/lib/schemas/intelligence";
import type { CurrentResponse } from "@/lib/schemas/weather";

const FIXTURES_DIR = join(process.cwd(), "tests/fixtures");

const currentFixture: CurrentResponse = {
  id: "bay-area-current",
  summary: "Karl is karl territory near Ocean Beach.",
  status: "Karl is lingering",
  temperature: 58,
  fogCoverage: 56,
  sunshineScore: 44,
  windSpeed: 14,
  windDirection: "W",
  cloudCover: 94,
  visibility: 0.8,
  humidity: 94,
  weatherCode: 45,
  iconName: "cloud.fog.fill",
  updatedAt: "2026-07-01T16:00:00.000Z",
  source: "mock",
  confidenceScore: 0,
  confidenceLabel: "Unavailable",
  confidenceExplanation: "Confidence unavailable for demo or fallback data.",
  confidenceComponents: {
    freshness: 0,
    observationQuality: 0,
    fieldCompleteness: 0,
    sourceReliability: 0,
  },
};

describe("movementPhrase", () => {
  it("returns a stable phrase for a location id", () => {
    expect(movementPhrase("mill-valley")).toBe(movementPhrase("mill-valley"));
    expect(movementPhrase("mill-valley").length).toBeGreaterThan(0);
  });
});

describe("heroSubheadline", () => {
  it("prefers karl reason and wind copy when available", () => {
    expect(
      heroSubheadline({
        current: currentFixture,
        karlLocation: {
          ...currentFixture,
          id: "ocean-beach",
          name: "Ocean Beach",
          distanceText: "2.1 mi",
          status: "Foggy",
          sunshineScore: 12,
          cloudCover: 92,
          fogScore: 88,
          karlReason: "Marine layer is hugging the coast.",
          primaryDrivers: [],
          microclimateFactors: [],
          prediction: {
            trend: "holding",
            burnOffEstimateLocal: undefined,
            predictionReason: undefined,
            predictionConfidenceLabel: "Unavailable",
          },
          latitude: 0,
          longitude: 0,
          windDirection: "W",
        },
        hasLoadedWeather: true,
      }),
    ).toBe("Marine layer is hugging the coast.");

    expect(
      heroSubheadline({
        current: currentFixture,
        karlLocation: null,
        hasLoadedWeather: true,
      }),
    ).toBe("Marine layer nearby with 14 mph coastal wind.");
  });
});

describe("heroConfidenceText", () => {
  it("uses narrative confidence when available", () => {
    const intelligence = karlIntelligenceResponseSchema.parse(
      JSON.parse(
        readFileSync(
          join(FIXTURES_DIR, "karl-intelligence-mill-valley.json"),
          "utf8",
        ),
      ),
    );

    expect(
      heroConfidenceText({
        intelligence,
        karlLocation: null,
        current: currentFixture,
      }),
    ).toContain("confidence");
  });
});
