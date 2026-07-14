"use client";

/**
 * Development-only verification gallery for the two-layer Selected Location
 * metrics architecture (weather strip + environmental grid).
 *
 * Guarded by `app/dev/layout.tsx` — returns 404 in production builds.
 * Not linked from product navigation.
 *
 * BottomSheet is position:fixed, so only ONE card mounts at a time via
 * `?case=<id>`.
 */

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { MapSelectedLocationCard } from "@/components/map/MapSelectedLocationCard";
import type { AirQuality, LocationWeather } from "@/lib/schemas/weather";

const baseLocation: LocationWeather = {
  id: "tiburon",
  name: "Tiburon",
  latitude: 37.8735,
  longitude: -122.4566,
  status: "Partly Cloudy",
  temperature: 66,
  sunshineScore: 42,
  distanceText: "8 mi",
  cloudCover: 48,
  visibility: 6,
  humidity: 72,
  windSpeed: 8,
  windDirection: "WNW",
  weatherCode: 2,
  iconName: "cloud.sun.fill",
  fogScore: 38,
  karlReason: "Light marine layer lingering across Tiburon.",
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

function fixture(overrides: {
  name?: string;
  id?: string;
  airQuality?: AirQuality;
}): LocationWeather {
  return { ...baseLocation, ...overrides };
}

const CASES: Array<{ id: string; title: string; location: LocationWeather }> = [
  {
    id: "light-fog-aqi-moderate",
    title: "Light Fog + AQI Moderate",
    location: fixture({
      airQuality: {
        aqi: 78,
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
    id: "light-fog-aqi-sensitive",
    title: "Light Fog + AQI Unhealthy for Sensitive Groups",
    location: fixture({
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
    id: "marin-headlands-moderate",
    title: "Marin Headlands · Light Fog · AQI Moderate",
    location: fixture({
      name: "Marin Headlands",
      id: "marin-headlands",
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
    id: "stinson-sensitive",
    title: "Stinson Beach · Light Fog · AQI Sensitive Groups",
    location: fixture({
      name: "Stinson Beach",
      id: "stinson-beach",
      airQuality: {
        aqi: 125,
        category: "unhealthy-sensitive",
        colorToken: "aqi.unhealthy-sensitive",
        label: "Unhealthy for Sensitive Groups",
        description: null,
        pollutant: "Ozone",
        observedAt: "2026-07-13T20:00:00.000Z",
        source: "Open-Meteo",
        isAvailable: true,
      },
    }),
  },
  {
    id: "aqi-unavailable",
    title: "AQI Unavailable",
    location: fixture({
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

export default function MetricsLayoutAuditPage() {
  const searchParams = useSearchParams();
  const active = useMemo(() => {
    const requested = searchParams.get("case");
    return CASES.find((entry) => entry.id === requested) ?? CASES[0] ?? null;
  }, [searchParams]);

  if (!active) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#030B14] px-4 py-8 text-white">
      <div className="mx-auto mb-6 max-w-[420px] text-center">
        <h1 className="text-lg font-semibold tracking-tight">
          Two-layer metrics verification
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-white/55">
          Dev only · Phone portrait · Weather strip + AQI environmental grid
          (UV not shipped).
        </p>
        <nav
          className="mt-4 flex flex-wrap justify-center gap-2"
          aria-label="Verification cases"
        >
          {CASES.map((entry) => {
            const isActive = entry.id === active.id;
            return (
              <a
                key={entry.id}
                href={`/dev/metrics-layout-audit?case=${entry.id}`}
                className={`rounded-full px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.08em] ${
                  isActive
                    ? "bg-white/15 text-white"
                    : "bg-white/5 text-white/55 hover:bg-white/10 hover:text-white/80"
                }`}
              >
                {entry.id}
              </a>
            );
          })}
        </nav>
      </div>

      <section
        data-testid={`metrics-verify-${active.id}`}
        className="mx-auto max-w-[420px] space-y-3"
      >
        <h2 className="text-center text-xs font-semibold uppercase tracking-[0.14em] text-white/55">
          {active.title}
        </h2>
        <div
          data-testid={`metrics-verify-phone-${active.id}`}
          className="relative h-[390px] w-[390px] overflow-hidden rounded-[1.25rem] border border-white/10 bg-[#030B14]"
        >
          <div className="absolute inset-0">
            <MapSelectedLocationCard
              key={active.id}
              location={active.location}
              phonePortrait
              showCloseButton={false}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
