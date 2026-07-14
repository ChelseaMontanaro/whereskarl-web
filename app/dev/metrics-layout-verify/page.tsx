"use client";

/**
 * Temporary 390px verification gallery for the weather-strip + environmental
 * grid layout. Not linked from product navigation; guarded by /dev layout.
 */

import { MapSelectedLocationCard } from "@/components/map/MapSelectedLocationCard";
import type { AirQuality, LocationWeather } from "@/lib/schemas/weather";

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
  karlReason: "Light marine layer lingering.",
  primaryDrivers: [],
  microclimateFactors: [],
  updatedAt: "2026-07-13T20:00:00.000Z",
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

function withAq(
  overrides: Partial<LocationWeather> & { airQuality: AirQuality },
): LocationWeather {
  return { ...base, ...overrides };
}

const CASES: Array<{ id: string; title: string; location: LocationWeather }> = [
  {
    id: "marin-moderate",
    title: "Marin Headlands · Light Fog · AQI Moderate",
    location: withAq({
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
        observedAt: "2026-07-13T20:00:00.000Z",
        source: "Open-Meteo",
        isAvailable: true,
      },
    }),
  },
  {
    id: "marin-sensitive",
    title: "Marin Headlands · Light Fog · Unhealthy for Sensitive Groups",
    location: withAq({
      id: "marin-headlands",
      name: "Marin Headlands",
      fogScore: 38,
      sunshineScore: 48,
      airQuality: {
        aqi: 125,
        category: "unhealthy-sensitive",
        colorToken: "aqi.unhealthy-sensitive",
        label: "Unhealthy for Sensitive Groups",
        description: "Sensitive groups may experience health effects.",
        pollutant: "Ozone",
        observedAt: "2026-07-13T20:00:00.000Z",
        source: "Open-Meteo",
        isAvailable: true,
      },
    }),
  },
  {
    id: "stinson-moderate",
    title: "Stinson Beach · Clear · AQI Moderate",
    location: withAq({
      id: "stinson-beach",
      name: "Stinson Beach",
      fogScore: 12,
      sunshineScore: 82,
      status: "Mostly Sunny",
      karlReason: "Mostly clear near Stinson Beach.",
      airQuality: {
        aqi: 57,
        category: "moderate",
        colorToken: "aqi.moderate",
        label: "Moderate",
        description: null,
        pollutant: "PM2.5",
        observedAt: "2026-07-13T20:00:00.000Z",
        source: "Open-Meteo",
        isAvailable: true,
      },
    }),
  },
  {
    id: "unavailable",
    title: "Tiburon · Clear · AQI Unavailable",
    location: withAq({
      id: "tiburon",
      name: "Tiburon",
      fogScore: 18,
      sunshineScore: 82,
      airQuality: {
        aqi: null,
        category: null,
        colorToken: "aqi.unavailable",
        label: "Unavailable",
        description: null,
        pollutant: null,
        observedAt: null,
        source: null,
        isAvailable: false,
      },
    }),
  },
];

export default function MetricsLayoutVerifyPage() {
  return (
    <main className="min-h-screen bg-[#030B14] px-4 py-8 text-white">
      <h1 className="mb-2 text-center text-lg font-semibold tracking-tight">
        Metrics layout verification (390px)
      </h1>
      <p className="mx-auto mb-8 max-w-md text-center text-sm text-white/55">
        Weather strip + environmental grid. UV not shown in product UI.
      </p>

      <div className="mx-auto flex max-w-[420px] flex-col gap-10">
        {CASES.map(({ id, title, location }) => (
          <section key={id} data-testid={`verify-${id}`} className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-white/55">
              {title}
            </h2>
            <div
              data-testid="verify-phone"
              className="relative h-[360px] w-[390px] overflow-hidden rounded-[1.25rem] border border-white/10 bg-[#030B14]"
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
                Desktop compact
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
