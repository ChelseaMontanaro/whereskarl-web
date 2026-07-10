import { describe, expect, it } from "vitest";

import {
  locationMatchesFogIntensityFilter,
  resolveLocationFogIntensity,
} from "@/lib/map/conditions";
import { intensityFilterTrayItems } from "@/lib/map/intensityFilter";
import { isMapMarkerVisible } from "@/lib/map/markers";
import {
  filterLocationsByProductRegion,
  getProductRegionIdForLocation,
  resolveBackendRegionId,
  resolveProductRegionId,
} from "@/lib/map/regions";
import {
  locationWeatherSchema,
  locationsResponseSchema,
} from "@/lib/schemas/weather";
import type { LocationWeather } from "@/lib/schemas/weather";

const confidenceFields = {
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
} as const;

function buildPhaseBLocation(
  overrides: Partial<LocationWeather> & Pick<LocationWeather, "id" | "name">,
): LocationWeather {
  return {
    latitude: 37.827,
    longitude: -122.499,
    status: "Karl Territory",
    temperature: 58,
    sunshineScore: 12,
    distanceText: "6 mi",
    cloudCover: 96,
    visibility: 1.2,
    humidity: 88,
    windSpeed: 14,
    windDirection: "W",
    weatherCode: 45,
    iconName: "cloud.fog.fill",
    fogScore: 100,
    karlReason: "Dense fog holding near the headlands.",
    primaryDrivers: ["Marine layer"],
    microclimateFactors: [],
    updatedAt: "2026-07-03T16:00:00.000Z",
    ...confidenceFields,
    ...overrides,
  };
}

const marinHeadlands = buildPhaseBLocation({
  id: "marin-headlands",
  name: "Marin Headlands / Hawk Hill",
  region: "north-bay",
  fogScore: 100,
  sunshineScore: 8,
});

const dalyCity = buildPhaseBLocation({
  id: "daly-city",
  name: "Daly City",
  region: "peninsula",
  latitude: 37.6875,
  longitude: -122.4702,
  fogScore: 72,
  sunshineScore: 24,
  status: "Foggy",
});

const pacifica = buildPhaseBLocation({
  id: "pacifica",
  name: "Pacifica",
  region: "peninsula",
  latitude: 37.6138,
  longitude: -122.4869,
  fogScore: 88,
  sunshineScore: 14,
  status: "Karl Territory",
});

describe("Phase B location integration", () => {
  it("normalizes new backend locations from the API without dropping them", () => {
    const payload = {
      locations: [marinHeadlands, dalyCity, pacifica],
    };

    const parsed = locationsResponseSchema.parse(payload);

    expect(parsed.locations.map((location) => location.id)).toEqual([
      "marin-headlands",
      "daly-city",
      "pacifica",
    ]);
    expect(parsed.locations[0]?.region).toBe("north-bay");
    expect(parsed.locations[1]?.region).toBe("peninsula");
  });

  it("accepts locations individually through locationWeatherSchema", () => {
    for (const location of [marinHeadlands, dalyCity, pacifica]) {
      expect(locationWeatherSchema.parse(location).id).toBe(location.id);
    }
  });

  it("preserves backend peninsula regions as the Peninsula visible region", () => {
    expect(resolveBackendRegionId(marinHeadlands)).toBe("north-bay");
    expect(resolveBackendRegionId(dalyCity)).toBe("peninsula");
    expect(resolveBackendRegionId(pacifica)).toBe("peninsula");

    expect(resolveProductRegionId(marinHeadlands)).toBe("north-bay");
    expect(resolveProductRegionId(dalyCity)).toBe("peninsula");
    expect(resolveProductRegionId(pacifica)).toBe("peninsula");
  });

  it("falls back to catalog assignments when region is omitted", () => {
    const withoutRegion = { ...marinHeadlands };
    delete withoutRegion.region;

    expect(getProductRegionIdForLocation(withoutRegion)).toBe("north-bay");
    expect(getProductRegionIdForLocation({ id: "daly-city" })).toBe("peninsula");
    expect(getProductRegionIdForLocation({ id: "pacifica" })).toBe("peninsula");
  });

  it("includes Marin Headlands for North Bay + Karl Territory markers", () => {
    expect(locationMatchesFogIntensityFilter(marinHeadlands, "karlTerritory")).toBe(
      true,
    );
    expect(resolveLocationFogIntensity(marinHeadlands)).toBe("karlTerritory");

    expect(
      isMapMarkerVisible(
        {
          id: marinHeadlands.id,
          name: marinHeadlands.name,
          latitude: marinHeadlands.latitude,
          longitude: marinHeadlands.longitude,
          sunshineScore: marinHeadlands.sunshineScore,
          fogScore: marinHeadlands.fogScore,
          status: marinHeadlands.status,
          region: marinHeadlands.region,
        },
        {
          intensityFilter: "karlTerritory",
          selectedRegionId: "north-bay",
        },
      ),
    ).toBe(true);
  });

  it("includes Marin Headlands for North Bay + Foggy using the shared intensity contract", () => {
    const foggyMarinHeadlands = {
      ...marinHeadlands,
      fogScore: 60,
      sunshineScore: 35,
      status: "Foggy",
    };

    expect(
      locationMatchesFogIntensityFilter(foggyMarinHeadlands, "foggy"),
    ).toBe(true);
    expect(
      locationMatchesFogIntensityFilter(foggyMarinHeadlands, "karlTerritory"),
    ).toBe(false);

    expect(
      isMapMarkerVisible(
        {
          id: foggyMarinHeadlands.id,
          name: foggyMarinHeadlands.name,
          latitude: foggyMarinHeadlands.latitude,
          longitude: foggyMarinHeadlands.longitude,
          sunshineScore: foggyMarinHeadlands.sunshineScore,
          fogScore: foggyMarinHeadlands.fogScore,
          status: foggyMarinHeadlands.status,
          region: foggyMarinHeadlands.region,
        },
        {
          intensityFilter: "foggy",
          selectedRegionId: "north-bay",
        },
      ),
    ).toBe(true);
  });

  it("includes only San Francisco locations in San Francisco filtered trays", () => {
    const foggyDalyCity = {
      ...dalyCity,
      fogScore: 80,
      sunshineScore: 18,
      status: "Karl Territory",
    };
    const oceanBeach = buildPhaseBLocation({
      id: "ocean-beach",
      name: "Ocean Beach",
      region: "san-francisco",
      latitude: 37.7594,
      longitude: -122.5107,
      fogScore: 96,
      sunshineScore: 12,
    });

    const trayItems = intensityFilterTrayItems(
      [marinHeadlands, oceanBeach, foggyDalyCity, pacifica],
      "karlTerritory",
      null,
      4,
      "san-francisco",
    );

    expect(trayItems.map((item) => item.locationId)).toEqual(["ocean-beach"]);
  });

  it("includes Daly City and Pacifica in Peninsula filtered trays", () => {
    const foggyDalyCity = {
      ...dalyCity,
      fogScore: 80,
      sunshineScore: 18,
      status: "Karl Territory",
    };
    const oceanBeach = buildPhaseBLocation({
      id: "ocean-beach",
      name: "Ocean Beach",
      region: "san-francisco",
      latitude: 37.7594,
      longitude: -122.5107,
      fogScore: 96,
      sunshineScore: 12,
    });

    const trayItems = intensityFilterTrayItems(
      [marinHeadlands, oceanBeach, foggyDalyCity, pacifica],
      "karlTerritory",
      null,
      4,
      "peninsula",
    );

    expect(trayItems.map((item) => item.locationId)).toEqual([
      "daly-city",
      "pacifica",
    ]);
  });

  it("scopes Karl Territory tray items to North Bay when the region is active", () => {
    const millValley = buildPhaseBLocation({
      id: "mill-valley",
      name: "Mill Valley",
      region: "north-bay",
      fogScore: 96,
      sunshineScore: 10,
    });
    const oceanBeach = buildPhaseBLocation({
      id: "ocean-beach",
      name: "Ocean Beach",
      region: "san-francisco",
      latitude: 37.7594,
      longitude: -122.5107,
      fogScore: 96,
      sunshineScore: 12,
    });

    const trayItems = intensityFilterTrayItems(
      [marinHeadlands, millValley, oceanBeach, dalyCity],
      "karlTerritory",
      null,
      4,
      "north-bay",
    );

    expect(trayItems.map((item) => item.locationId)).toEqual([
      "mill-valley",
      "marin-headlands",
    ]);
  });

  it("groups peninsula backend locations under Peninsula in visible filters", () => {
    const locations = [marinHeadlands, dalyCity, pacifica];

    expect(filterLocationsByProductRegion(locations, "peninsula")).toEqual([
      dalyCity,
      pacifica,
    ]);
    expect(filterLocationsByProductRegion(locations, "north-bay")).toEqual([
      marinHeadlands,
    ]);
    expect(filterLocationsByProductRegion(locations, "san-francisco")).toEqual([]);
  });
});
