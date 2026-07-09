import { describe, expect, it } from "vitest";

import type { FogIntensity } from "@/lib/map/conditions";
import {
  boundsForIntensityLocations,
  intensityFilterTrayItems,
  mapBestRightNowTrayItems,
  phonePortraitBestRightNowTrayItems,
  shouldShowDesktopBestRightNowTray,
  toggleIntensityFilter,
} from "@/lib/map/intensityFilter";
import type { LocationWeather } from "@/lib/schemas/weather";

const baseLocation = {
  latitude: 37.8735,
  longitude: -122.4566,
  status: "Mostly Sunny",
  temperature: 72,
  sunshineScore: 82,
  distanceText: "9 mi",
  cloudCover: 22,
  visibility: 9.5,
  humidity: 58,
  windSpeed: 7,
  windDirection: "W",
  weatherCode: 1,
  iconName: "sun.max.fill",
  karlReason: "Clear conditions.",
  primaryDrivers: [],
  microclimateFactors: [],
  updatedAt: "2026-07-01T16:00:00.000Z",
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
} satisfies Omit<LocationWeather, "id" | "name" | "fogScore">;

describe("boundsForIntensityLocations", () => {
  it("returns bounds that cover matching marker locations", () => {
    const locations = [
      {
        id: "tiburon",
        name: "Tiburon",
        latitude: 37.8735,
        longitude: -122.4566,
        sunshineScore: 82,
        fogScore: 82,
        status: "Mostly Sunny",
      },
      {
        id: "san-jose",
        name: "San Jose",
        latitude: 37.3382,
        longitude: -121.8863,
        sunshineScore: 90,
        fogScore: 10,
        status: "Clear",
      },
    ];

    const bounds = boundsForIntensityLocations(locations, "clear");

    expect(bounds).toEqual([
      [-122.4566, 37.3382],
      [-121.8863, 37.8735],
    ]);
  });
});

describe("intensityFilterTrayItems", () => {
  it("returns matching locations for the selected intensity", () => {
    const locations: LocationWeather[] = [
      {
        ...baseLocation,
        id: "tiburon",
        name: "Tiburon",
        fogScore: 26,
        sunshineScore: 82,
      },
      {
        ...baseLocation,
        id: "sausalito",
        name: "Sausalito",
        fogScore: 41,
        sunshineScore: 74,
      },
      {
        ...baseLocation,
        id: "san-jose",
        name: "San Jose",
        fogScore: 10,
        sunshineScore: 90,
      },
    ];

    const items = intensityFilterTrayItems(locations, "clear", null, 4);

    expect(items).toHaveLength(3);
    expect(items.map((item) => item.locationId)).toEqual([
      "san-jose",
      "tiburon",
      "sausalito",
    ]);
    expect(items[0]?.scoreLabel).toBe("90 clear");
    expect(items[1]?.scoreLabel).toBe("82 clear");
    expect(items[2]?.scoreLabel).toBe("74 clear");
  });

  it("returns moderate light fog locations that are not strong clear-sky spots", () => {
    const locations: LocationWeather[] = [
      {
        ...baseLocation,
        id: "tiburon",
        name: "Tiburon",
        fogScore: 26,
        sunshineScore: 82,
      },
      {
        ...baseLocation,
        id: "sausalito",
        name: "Sausalito",
        fogScore: 41,
        sunshineScore: 74,
      },
      {
        ...baseLocation,
        id: "moderate-fog",
        name: "Moderate Fog",
        fogScore: 35,
        sunshineScore: 55,
      },
      {
        ...baseLocation,
        id: "san-jose",
        name: "San Jose",
        fogScore: 10,
        sunshineScore: 90,
      },
    ];

    const items = intensityFilterTrayItems(locations, "lightFog", null, 4);

    expect(items).toHaveLength(1);
    expect(items.map((item) => item.locationId)).toEqual(["moderate-fog"]);
    expect(items[0]?.scoreLabel).toBe("55 sunshine");
  });
});

describe("mapBestRightNowTrayItems", () => {
  const locations: LocationWeather[] = [
    {
      ...baseLocation,
      id: "ocean-beach",
      name: "Ocean Beach",
      region: "san-francisco",
      fogScore: 20,
      sunshineScore: 85,
    },
    {
      ...baseLocation,
      id: "tiburon",
      name: "Tiburon",
      region: "north-bay",
      fogScore: 26,
      sunshineScore: 82,
    },
    {
      ...baseLocation,
      id: "oakland",
      name: "Oakland",
      region: "east-bay",
      fogScore: 30,
      sunshineScore: 72,
    },
    {
      ...baseLocation,
      id: "san-jose",
      name: "San Jose",
      region: "south-bay",
      fogScore: 12,
      sunshineScore: 91,
    },
  ];

  it("returns bay-wide Best Right Now items regardless of region", () => {
    expect(
      mapBestRightNowTrayItems(locations, null, null, 4).map(
        (item) => item.locationId,
      ),
    ).toEqual(["san-jose", "ocean-beach", "tiburon", "oakland"]);
  });

  it("returns bay-wide clear-filter tray items regardless of region", () => {
    expect(
      mapBestRightNowTrayItems(locations, "clear", null, 4).map(
        (item) => item.locationId,
      ),
    ).toEqual(["san-jose", "ocean-beach", "tiburon", "oakland"]);
  });
});

describe("phonePortraitBestRightNowTrayItems", () => {
  const locations: LocationWeather[] = [
    {
      ...baseLocation,
      id: "ocean-beach",
      name: "Ocean Beach",
      region: "san-francisco",
      fogScore: 20,
      sunshineScore: 88,
    },
    {
      ...baseLocation,
      id: "presidio",
      name: "Presidio",
      region: "san-francisco",
      fogScore: 20,
      sunshineScore: 85,
    },
    {
      ...baseLocation,
      id: "tiburon",
      name: "Tiburon",
      region: "north-bay",
      fogScore: 26,
      sunshineScore: 82,
    },
    {
      ...baseLocation,
      id: "sausalito",
      name: "Sausalito",
      region: "north-bay",
      fogScore: 30,
      sunshineScore: 48,
    },
    {
      ...baseLocation,
      id: "oakland",
      name: "Oakland",
      region: "east-bay",
      fogScore: 30,
      sunshineScore: 72,
    },
    {
      ...baseLocation,
      id: "foggy-spot",
      name: "Foggy Spot",
      region: "san-francisco",
      fogScore: 10,
      sunshineScore: 45,
    },
  ];

  it("returns only score-ranked locations with sunshine score at least 70", () => {
    expect(
      phonePortraitBestRightNowTrayItems(locations).map((item) => ({
        id: item.locationId,
        score: item.score,
      })),
    ).toEqual([
      { id: "ocean-beach", score: 88 },
      { id: "presidio", score: 85 },
      { id: "tiburon", score: 82 },
      { id: "oakland", score: 72 },
    ]);
  });

  it("does not backfill with low-score locations when fewer than three qualify", () => {
    const northBayOnlyQualifying = locations.filter(
      (location) => location.id !== "oakland" && location.id !== "presidio",
    );

    expect(
      phonePortraitBestRightNowTrayItems(northBayOnlyQualifying).map(
        (item) => item.locationId,
      ),
    ).toEqual(["ocean-beach", "tiburon"]);
  });
});

describe("desktop best-right-now tray visibility", () => {
  it("shows the tray only when no filter or Clear is active", () => {
    expect(shouldShowDesktopBestRightNowTray(null)).toBe(true);
    expect(shouldShowDesktopBestRightNowTray("clear")).toBe(true);
    expect(shouldShowDesktopBestRightNowTray("lightFog")).toBe(false);
    expect(shouldShowDesktopBestRightNowTray("foggy")).toBe(false);
    expect(shouldShowDesktopBestRightNowTray("karlTerritory")).toBe(false);
  });
});

describe("toggleIntensityFilter", () => {
  const intensities: FogIntensity[] = [
    "clear",
    "lightFog",
    "foggy",
    "karlTerritory",
  ];

  it.each(intensities)("activates %s when no filter is active", (intensity) => {
    expect(toggleIntensityFilter(null, intensity)).toBe(intensity);
  });

  it.each(intensities)(
    "deactivates %s when the same intensity is clicked again",
    (intensity) => {
      expect(toggleIntensityFilter(intensity, intensity)).toBeNull();
    },
  );

  it("switches from one intensity to another without requiring Reset", () => {
    expect(toggleIntensityFilter("clear", "foggy")).toBe("foggy");
    expect(toggleIntensityFilter("karlTerritory", "lightFog")).toBe("lightFog");
  });
});
