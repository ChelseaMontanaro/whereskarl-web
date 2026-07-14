"use client";

/**
 * Temporary visual verification gallery for AQI presentation states.
 * Used for pre-commit screenshots; not linked from product navigation.
 */

import { MapSelectedLocationCard } from "@/components/map/MapSelectedLocationCard";
import type { AirQuality, LocationWeather } from "@/lib/schemas/weather";
import {
  formatAirQualityCompact,
  presentAirQuality,
} from "@/lib/weather/airQuality";

const baseLocation: LocationWeather = {
  id: "tiburon",
  name: "Tiburon",
  latitude: 37.8735,
  longitude: -122.4566,
  status: "Mostly Sunny",
  temperature: 68,
  sunshineScore: 82,
  distanceText: "8 mi",
  cloudCover: 30,
  visibility: 8,
  humidity: 60,
  windSpeed: 8,
  windDirection: "W",
  weatherCode: 2,
  iconName: "cloud.sun.fill",
  fogScore: 18,
  karlReason: "Mostly clear across Tiburon.",
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
    projectedFogScore1h: 20,
    burnOffEstimateLocal: null,
    predictionReason: "Holding steady.",
    predictionConfidenceScore: 70,
    predictionConfidenceLabel: "Medium",
    predictionDrivers: [],
  },
};

function withLocation(
  overrides: Partial<LocationWeather> & { airQuality?: AirQuality },
): LocationWeather {
  return { ...baseLocation, ...overrides };
}

function withAirQuality(airQuality: AirQuality): LocationWeather {
  return withLocation({ airQuality });
}

function UniversalDetailMetrics({ location }: { location: LocationWeather }) {
  const airQuality = presentAirQuality(location.airQuality);
  const metrics = [
    { label: "Temperature", value: `${Math.round(location.temperature)}°` },
    {
      label: "Clear skies",
      value: `${Math.round(location.sunshineScore)}%`,
    },
    { label: "AQI", value: formatAirQualityCompact(airQuality) },
    { label: "Fog score", value: `${Math.round(location.fogScore)}%` },
  ];

  if (airQuality.available && airQuality.description) {
    metrics.push({ label: "Air quality", value: airQuality.description });
  }

  return (
    <ul className="grid grid-cols-2 gap-3">
      {metrics.map((metric) => (
        <li key={metric.label} className="min-w-0">
          <p className="text-[0.65rem] uppercase tracking-wide text-white/45">
            {metric.label}
          </p>
          <p
            className="mt-0.5 text-sm font-medium leading-snug text-white"
            style={
              metric.label === "AQI" && airQuality.color
                ? { color: airQuality.color }
                : undefined
            }
          >
            {metric.value}
          </p>
        </li>
      ))}
    </ul>
  );
}

const FIXTURES: Array<{ title: string; location: LocationWeather }> = [
  {
    title: "Good (short label)",
    location: withAirQuality({
      aqi: 42,
      category: "good",
      colorToken: "aqi.good",
      label: "Good",
      description: "Air quality is considered satisfactory.",
      pollutant: "PM2.5",
      observedAt: "2026-07-13T20:00:00.000Z",
      source: "Open-Meteo",
      isAvailable: true,
    }),
  },
  {
    title: "Moderate (short label)",
    location: withAirQuality({
      aqi: 78,
      category: "moderate",
      colorToken: "aqi.moderate",
      label: "Moderate",
      description:
        "Air quality is acceptable; some pollutants may be a concern for a small number of people.",
      pollutant: "PM2.5",
      observedAt: "2026-07-13T20:00:00.000Z",
      source: "Open-Meteo",
      isAvailable: true,
    }),
  },
  {
    title: "Marin Headlands · Light Fog · Moderate (crowd stress)",
    location: withLocation({
      id: "marin-headlands",
      name: "Marin Headlands",
      fogScore: 35,
      sunshineScore: 48,
      status: "Light Fog",
      karlReason: "Light fog lingering near Marin Headlands.",
      airQuality: {
        aqi: 64,
        category: "moderate",
        colorToken: "aqi.moderate",
        label: "Moderate",
        description: "Air quality is acceptable.",
        pollutant: "PM2.5",
        observedAt: "2026-07-13T20:00:00.000Z",
        source: "Open-Meteo",
        isAvailable: true,
      },
    }),
  },
  {
    title: "Marin Headlands · Light Fog · Unhealthy for Sensitive Groups",
    location: withLocation({
      id: "marin-headlands",
      name: "Marin Headlands",
      fogScore: 35,
      sunshineScore: 48,
      status: "Light Fog",
      karlReason: "Light fog lingering near Marin Headlands.",
      airQuality: {
        aqi: 125,
        category: "unhealthy-sensitive",
        colorToken: "aqi.unhealthy-sensitive",
        label: "Unhealthy for Sensitive Groups",
        description: "Members of sensitive groups may experience health effects.",
        pollutant: "Ozone",
        observedAt: "2026-07-13T20:00:00.000Z",
        source: "Open-Meteo",
        isAvailable: true,
      },
    }),
  },
  {
    title: "Unhealthy for Sensitive Groups (longest label)",
    location: withAirQuality({
      aqi: 125,
      category: "unhealthy-sensitive",
      colorToken: "aqi.unhealthy-sensitive",
      label: "Unhealthy for Sensitive Groups",
      description: "Members of sensitive groups may experience health effects.",
      pollutant: "Ozone",
      observedAt: "2026-07-13T20:00:00.000Z",
      source: "Open-Meteo",
      isAvailable: true,
    }),
  },
  {
    title: "Unhealthy",
    location: withAirQuality({
      aqi: 168,
      category: "unhealthy",
      colorToken: "aqi.unhealthy",
      label: "Unhealthy",
      description: "Everyone may begin to experience health effects.",
      pollutant: "PM2.5",
      observedAt: "2026-07-13T20:00:00.000Z",
      source: "Open-Meteo",
      isAvailable: true,
    }),
  },
  {
    title: "Unavailable",
    location: withAirQuality({
      aqi: null,
      category: null,
      colorToken: "aqi.unavailable",
      label: "Unavailable",
      description: null,
      pollutant: null,
      observedAt: null,
      source: null,
      isAvailable: false,
    }),
  },
];

export default function AqiGalleryPage() {
  return (
    <main className="min-h-screen bg-[#030B14] px-4 py-8 text-white">
      <h1 className="mb-6 text-center text-lg font-semibold tracking-tight">
        AQI visual verification gallery
      </h1>

      <div className="mx-auto flex max-w-5xl flex-col gap-10">
        {FIXTURES.map(({ title, location }) => (
          <section
            key={title}
            data-testid={`aqi-gallery-${location.airQuality?.category ?? "unavailable"}`}
            className="space-y-4"
          >
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-white/55">
              {title}
            </h2>

            <div
              data-testid="gallery-phone"
              className="relative mx-auto h-[340px] w-[390px] overflow-hidden rounded-[1.25rem] border border-white/10 bg-[#030B14]"
            >
              <p className="absolute left-3 top-2 z-20 text-[0.65rem] uppercase tracking-wide text-white/40">
                Phone portrait card
              </p>
              <div className="absolute inset-0 pt-6">
                <MapSelectedLocationCard
                  location={location}
                  phonePortrait
                  showCloseButton={false}
                />
              </div>
            </div>

            <div data-testid="gallery-desktop" className="mx-auto max-w-[28rem]">
              <p className="mb-2 text-[0.65rem] uppercase tracking-wide text-white/40">
                Desktop card
              </p>
              <MapSelectedLocationCard
                location={location}
                showCloseButton={false}
              />
            </div>

            <div
              data-testid="gallery-universal-detail"
              className="mx-auto max-w-[28rem] rounded-2xl border border-white/10 bg-[#091B2A]/90 p-4"
            >
              <p className="mb-3 text-[0.65rem] uppercase tracking-wide text-white/40">
                Universal detail metrics
              </p>
              <UniversalDetailMetrics location={location} />
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
