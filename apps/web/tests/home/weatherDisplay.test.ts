import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  bestRightNowLocationItems,
  enrichBestRightNowItemsWithLocationWeather,
  heroConfidenceText,
  heroSubheadline,
  isGenericKarlStatusPhrase,
  movementPhrase,
  resolveKarlReadPresentation,
  resolveKarlStatusPhrase,
  sunshineResultTitle,
} from "@/lib/home/weatherDisplay";
import { karlIntelligenceResponseSchema } from "@/lib/schemas/intelligence";
import type { BestSunshineResponse, CurrentResponse } from "@/lib/schemas/weather";

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

describe("bestRightNowLocationItems", () => {
  it("excludes the primary clearest spot and sorts remaining locations by score", () => {
    const items = bestRightNowLocationItems(
      [
        {
          id: "tiburon",
          name: "Tiburon",
          latitude: 0,
          longitude: 0,
          distanceText: "9 mi",
          status: "Mostly Sunny",
          temperature: 72,
          sunshineScore: 82,
          cloudCover: 22,
          visibility: 9,
          humidity: 58,
          windSpeed: 7,
          windDirection: "W",
          weatherCode: 1,
          iconName: "sun.max.fill",
          fogScore: 26,
          karlReason: "Clear",
          primaryDrivers: [],
          microclimateFactors: [],
          updatedAt: "2026-07-01T16:00:00.000Z",
          confidenceScore: 0,
          confidenceLabel: "Unavailable",
          confidenceExplanation: "Unavailable",
          confidenceComponents: {
            freshness: 0,
            observationQuality: 0,
            fieldCompleteness: 0,
            sourceReliability: 0,
          },
          prediction: {
            predictionConfidenceScore: 0,
            predictionConfidenceLabel: "Unavailable",
            predictionReason: "Unavailable",
          },
        },
        {
          id: "sausalito",
          name: "Sausalito",
          latitude: 0,
          longitude: 0,
          distanceText: "7 mi",
          status: "Mostly Sunny",
          temperature: 68,
          sunshineScore: 74,
          cloudCover: 34,
          visibility: 8,
          humidity: 64,
          windSpeed: 9,
          windDirection: "W",
          weatherCode: 2,
          iconName: "cloud.sun.fill",
          fogScore: 41,
          karlReason: "Clearing",
          primaryDrivers: [],
          microclimateFactors: [],
          updatedAt: "2026-07-01T16:00:00.000Z",
          confidenceScore: 0,
          confidenceLabel: "Unavailable",
          confidenceExplanation: "Unavailable",
          confidenceComponents: {
            freshness: 0,
            observationQuality: 0,
            fieldCompleteness: 0,
            sourceReliability: 0,
          },
          prediction: {
            predictionConfidenceScore: 0,
            predictionConfidenceLabel: "Unavailable",
            predictionReason: "Unavailable",
          },
        },
      ],
      "tiburon",
    );

    expect(items).toEqual([
      expect.objectContaining({
        locationId: "sausalito",
        locationName: "Sausalito",
        score: 74,
        detail: "Clearing",
        weatherMetadata: ["Fog: 41%", "Wind: W 9 mph", "68°F"],
      }),
    ]);
  });
});

describe("enrichBestRightNowItemsWithLocationWeather", () => {
  it("attaches fog, wind, and temperature metadata from live location data", () => {
    const items = enrichBestRightNowItemsWithLocationWeather(
      [
        {
          locationId: "tiburon",
          locationName: "Tiburon",
          detail: "Clear skies holding.",
          score: 82,
          rank: 1,
        },
      ],
      [
        {
          id: "tiburon",
          name: "Tiburon",
          latitude: 0,
          longitude: 0,
          distanceText: "9 mi",
          status: "Mostly Sunny",
          temperature: 72,
          sunshineScore: 82,
          cloudCover: 22,
          visibility: 9,
          humidity: 58,
          windSpeed: 7,
          windDirection: "W",
          weatherCode: 1,
          iconName: "sun.max.fill",
          fogScore: 26,
          karlReason: "Clear",
          primaryDrivers: [],
          microclimateFactors: [],
          updatedAt: "2026-07-01T16:00:00.000Z",
          confidenceScore: 0,
          confidenceLabel: "Unavailable",
          confidenceExplanation: "Unavailable",
          confidenceComponents: {
            freshness: 0,
            observationQuality: 0,
            fieldCompleteness: 0,
            sourceReliability: 0,
          },
          prediction: {
            predictionConfidenceScore: 0,
            predictionConfidenceLabel: "Unavailable",
            predictionReason: "Unavailable",
          },
        },
      ],
    );

    expect(items[0]?.weatherMetadata).toEqual([
      "Fog: 26%",
      "Wind: W 7 mph",
      "72°F",
    ]);
  });
});

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

describe("sunshineResultTitle", () => {
  it("uses clear-skies wording for score-based recommendation labels", () => {
    expect(sunshineResultTitle(82, false)).toBe("BEST CLEAR SKIES");
    expect(sunshineResultTitle(82, true)).toBe("CLEAREST NIGHT");
    expect(sunshineResultTitle(30, false)).toBe("BEST BREAK IN THE FOG");
    expect(sunshineResultTitle(10, false)).toBe("NO CLEAR SKIES NEARBY");
  });

  it("uses clear-skies wording for strong clear-sky locations in the Light Fog band", () => {
    expect(
      sunshineResultTitle(82, false, { fogScore: 26, sunshineScore: 82 }),
    ).toBe("BEST CLEAR SKIES");
  });

  it("uses break-in-the-fog title for moderate fog below the Clear sunshine threshold", () => {
    expect(
      sunshineResultTitle(55, false, { fogScore: 35, sunshineScore: 55 }),
    ).toBe("BEST BREAK IN THE FOG");
  });
});

describe("resolveKarlStatusPhrase", () => {
  const intelligence = karlIntelligenceResponseSchema.parse(
    JSON.parse(
      readFileSync(
        join(FIXTURES_DIR, "karl-intelligence-mill-valley.json"),
        "utf8",
      ),
    ),
  );

  it("prefers intelligence headline over the generic current status fallback", () => {
    expect(
      resolveKarlStatusPhrase({
        current: { ...currentFixture, status: "Karl is here" },
        intelligence,
      }),
    ).toBe("Karl is picking favorites across the Bay");
  });

  it("uses a non-generic current status when intelligence is unavailable", () => {
    expect(
      resolveKarlStatusPhrase({
        current: { ...currentFixture, status: "Karl is lingering" },
        intelligence: null,
      }),
    ).toBe("Karl is lingering");
  });

  it("keeps the generic fallback only when no richer status is available", () => {
    expect(
      resolveKarlStatusPhrase({
        current: { ...currentFixture, status: "Karl is here" },
        intelligence: null,
      }),
    ).toBe("Karl is here");
  });

  it("detects the generic Karl is here fallback phrase", () => {
    expect(isGenericKarlStatusPhrase("Karl is here")).toBe(true);
    expect(isGenericKarlStatusPhrase("Karl is lingering")).toBe(false);
  });
});

describe("resolveKarlReadPresentation", () => {
  const intelligence = karlIntelligenceResponseSchema.parse(
    JSON.parse(
      readFileSync(
        join(FIXTURES_DIR, "karl-intelligence-mill-valley.json"),
        "utf8",
      ),
    ),
  );
  const bestSunshine = JSON.parse(
    readFileSync(join(FIXTURES_DIR, "best-sunshine.json"), "utf8"),
  ) as BestSunshineResponse;
  const locations = JSON.parse(
    readFileSync(join(FIXTURES_DIR, "locations.json"), "utf8"),
  ).locations;

  it("replaces a lower-ranked clearing location with the current clearest spot", () => {
    const presentation = resolveKarlReadPresentation({
      intelligence,
      bestSunshine,
      locations,
      bestRightNow: bestRightNowLocationItems(locations, bestSunshine.locationID),
    });

    expect(presentation?.summary).toContain(
      "Karl is shifting unevenly, with some corridors clearing while others stay gray.",
    );
    expect(presentation?.summary).toContain(
      "Tiburon has the clearest conditions nearby right now.",
    );
    expect(presentation?.summary).not.toContain("Berkeley should brighten");
  });

  it("keeps the backend narrative when the clearing location matches the clearest spot", () => {
    const alignedIntelligence = {
      ...intelligence,
      narrative: {
        ...intelligence.narrative,
        summary:
          "Karl is shifting unevenly, with some corridors clearing while others stay gray. Tiburon has the clearest conditions nearby right now.",
        clearingNarratives: intelligence.narrative.clearingNarratives.map(
          (entry) =>
            entry.locationId === "berkeley"
              ? {
                  ...entry,
                  locationId: "tiburon",
                  locationName: "Tiburon",
                  clearingStatus: "clear-now",
                  narrative:
                    "Tiburon has the clearest conditions nearby right now.",
                }
              : entry,
        ),
      },
    };

    const presentation = resolveKarlReadPresentation({
      intelligence: alignedIntelligence,
      bestSunshine,
      locations,
    });

    expect(presentation?.summary).toBe(alignedIntelligence.narrative.summary);
  });
});
