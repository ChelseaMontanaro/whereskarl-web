"use client";

/**
 * Temporary 390px verification gallery for weather-strip + environmental grid
 * with AQI + UV + Pollen. Not linked from product navigation; /dev layout only.
 */

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { MapSelectedLocationCard } from "@/components/map/MapSelectedLocationCard";
import type {
  AirQuality,
  LocationWeather,
  Pollen,
  UltravioletIndex,
} from "@/lib/schemas/weather";

const base: LocationWeather = {
  id: "tiburon",
  name: "Tiburon",
  latitude: 37.8735,
  longitude: -122.4566,
  status: "Partly Cloudy",
  temperature: 66,
  sunshineScore: 48,
  distanceText: "8 mi",
  cloudCover: 48,
  visibility: 6,
  humidity: 72,
  windSpeed: 8,
  windDirection: "WNW",
  weatherCode: 2,
  iconName: "cloud.sun.fill",
  fogScore: 38,
  karlReason:
    "Light marine layer lingering along the shoreline — expect gradual clearing by early afternoon.",
  primaryDrivers: [],
  microclimateFactors: [],
  updatedAt: "2026-07-14T14:00:00.000Z",
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
    trend: "steady",
    projectedFogScore1h: 35,
    burnOffEstimateLocal: null,
    predictionReason: "Holding steady.",
    predictionConfidenceScore: 70,
    predictionConfidenceLabel: "Medium",
    predictionDrivers: [],
  },
};

function withMetrics(
  overrides: Partial<LocationWeather> & {
    airQuality: AirQuality;
    uvIndex: UltravioletIndex;
    pollen: Pollen;
  },
): LocationWeather {
  return { ...base, ...overrides };
}

const CASES: Array<{ id: string; title: string; location: LocationWeather }> = [
  {
    id: "aqi-moderate-uv-low-pollen-low",
    title: "AQI Moderate + UV Low + Pollen Low",
    location: withMetrics({
      id: "marin-headlands",
      name: "Marin Headlands",
      fogScore: 38,
      sunshineScore: 48,
      airQuality: {
        aqi: 64,
        category: "moderate",
        colorToken: "aqi.moderate",
        label: "Moderate",
        description: null,
        pollutant: "PM2.5",
        observedAt: "2026-07-14T14:00:00.000Z",
        source: "Open-Meteo",
        isAvailable: true,
      },
      uvIndex: {
        value: 2,
        category: "low",
        colorToken: "uv.low",
        label: "Low",
        description: null,
        observedAt: "2026-07-14T14:00:00.000Z",
        source: "Open-Meteo",
        isAvailable: true,
      },
      pollen: {
        value: 2,
        category: "low",
        colorToken: "pollen.low",
        label: "Low",
        description: null,
        dominantType: "grass",
        types: {
          tree: null,
          grass: {
            value: 2,
            category: "low",
            colorToken: "pollen.low",
            label: "Low",
            description: null,
            inSeason: true,
          },
          weed: null,
        },
        forecastDate: "2026-07-14",
        source: "Google Pollen",
        isAvailable: true,
      },
    }),
  },
  {
    id: "aqi-sensitive-uv-very-high-pollen-very-high",
    title:
      "AQI Unhealthy for Sensitive Groups + UV Very High + Pollen Very High",
    location: withMetrics({
      id: "stinson-beach",
      name: "Stinson Beach",
      fogScore: 18,
      sunshineScore: 72,
      airQuality: {
        aqi: 125,
        category: "unhealthy-sensitive",
        colorToken: "aqi.unhealthy-sensitive",
        label: "Unhealthy for Sensitive Groups",
        description: "Sensitive groups may experience health effects.",
        pollutant: "Ozone",
        observedAt: "2026-07-14T14:00:00.000Z",
        source: "Open-Meteo",
        isAvailable: true,
      },
      uvIndex: {
        value: 9,
        category: "very-high",
        colorToken: "uv.very-high",
        label: "Very High",
        description: null,
        observedAt: "2026-07-14T14:00:00.000Z",
        source: "Open-Meteo",
        isAvailable: true,
      },
      pollen: {
        value: 5,
        category: "very-high",
        colorToken: "pollen.very-high",
        label: "Very High",
        description: null,
        dominantType: "tree",
        types: {
          tree: {
            value: 5,
            category: "very-high",
            colorToken: "pollen.very-high",
            label: "Very High",
            description: null,
            inSeason: true,
          },
          grass: null,
          weed: null,
        },
        forecastDate: "2026-07-14",
        source: "Google Pollen",
        isAvailable: true,
      },
    }),
  },
  {
    id: "pollen-unavailable",
    title: "Pollen unavailable",
    location: withMetrics({
      id: "tiburon",
      name: "Tiburon",
      fogScore: 18,
      sunshineScore: 82,
      airQuality: {
        aqi: 42,
        category: "good",
        colorToken: "aqi.good",
        label: "Good",
        description: null,
        pollutant: "PM2.5",
        observedAt: "2026-07-14T14:00:00.000Z",
        source: "Open-Meteo",
        isAvailable: true,
      },
      uvIndex: {
        value: 3,
        category: "moderate",
        colorToken: "uv.moderate",
        label: "Moderate",
        description: null,
        observedAt: "2026-07-14T14:00:00.000Z",
        source: "Open-Meteo",
        isAvailable: true,
      },
      pollen: {
        value: null,
        category: null,
        colorToken: "pollen.unavailable",
        label: "Unavailable",
        description: null,
        dominantType: null,
        types: { tree: null, grass: null, weed: null },
        forecastDate: null,
        source: null,
        isAvailable: false,
      },
    }),
  },
];

function MetricsLayoutVerifyContent() {
  const searchParams = useSearchParams();
  const onlyId = searchParams.get("case");
  const cases = onlyId ? CASES.filter((entry) => entry.id === onlyId) : CASES;

  return (
    <main className="min-h-screen bg-[#030B14] px-4 py-8 text-white">
      <h1 className="mb-2 text-center text-lg font-semibold tracking-tight">
        Metrics layout verification (390px)
      </h1>
      <p className="mx-auto mb-8 max-w-md text-center text-sm text-white/55">
        Phone portrait · Weather strip + Environmental Metrics row
        (AQI · UV · Pollen · EHI)
      </p>

      <div className="mx-auto flex max-w-[420px] flex-col gap-10">
        {cases.map(({ id, title, location }) => (
          <section key={id} data-testid={`verify-${id}`} className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-white/55">
              {title}
            </h2>
            <div
              data-testid="verify-phone"
              className="relative h-[640px] w-[390px] overflow-hidden rounded-[1.25rem] border border-white/10 bg-[#030B14]"
            >
              <div className="absolute inset-0 pt-2">
                <MapSelectedLocationCard
                  location={location}
                  phonePortrait
                  showCloseButton={false}
                />
              </div>
            </div>
            <div data-testid="verify-desktop" className="max-w-[28rem]">
              <p className="mb-2 text-[0.65rem] uppercase tracking-wide text-white/40">
                Desktop compact (pollen deferred)
              </p>
              <MapSelectedLocationCard
                location={location}
                showCloseButton={false}
              />
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}

export default function MetricsLayoutVerifyPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#030B14]" />}>
      <MetricsLayoutVerifyContent />
    </Suspense>
  );
}
