// @vitest-environment happy-dom

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { HomeView } from "@/components/home/HomeView";
import { ConditionsStatusProvider } from "@/components/providers/ConditionsStatusProvider";
import * as intelligenceApi from "@/lib/api/intelligence";
import * as weatherApi from "@/lib/api/weather";
import type { LocationsResponse } from "@/lib/schemas/weather";

const FIXTURES_DIR = join(process.cwd(), "tests/fixtures");

function readFixture<T>(filename: string): T {
  return JSON.parse(readFileSync(join(FIXTURES_DIR, filename), "utf8")) as T;
}

function renderHomeView() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(ConditionsStatusProvider, null, createElement(HomeView)),
    ),
  );
}

describe("HomeView responsive polish", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  beforeEach(() => {
    vi.spyOn(weatherApi, "getCurrent").mockResolvedValue(readFixture("current.json"));
    vi.spyOn(weatherApi, "getLocations").mockResolvedValue(readFixture("locations.json"));
    vi.spyOn(weatherApi, "getBestSunshine").mockResolvedValue(
      readFixture("best-sunshine.json"),
    );
    vi.spyOn(intelligenceApi, "getKarlIntelligence").mockResolvedValue(
      readFixture("karl-intelligence-mill-valley.json"),
    );
  });

  it("adds a mobile content vignette and extra bottom clearance", () => {
    const { container } = renderHomeView();

    expect(
      container.querySelector(".bg-gradient-to-b.from-transparent"),
    ).toBeInTheDocument();
    expect(container.querySelector(".pb-28")).toBeInTheDocument();
    expect(container.querySelector(".pt-3")).toBeInTheDocument();
    expect(container.querySelector(".bg-black\\/26")).toBeInTheDocument();
  });

  it("renders Next Hour on mobile and desktop layouts", async () => {
    renderHomeView();

    const nextHourLabels = await screen.findAllByText("Next Hour");
    expect(nextHourLabels.length).toBeGreaterThanOrEqual(2);
  });

  it("places desktop Next Hour below Best Right Now", async () => {
    const locationsFixture = readFixture<LocationsResponse>("locations.json");
    const sausalito = locationsFixture.locations[1];

    vi.spyOn(weatherApi, "getLocations").mockResolvedValue({
      locations: [
        {
          ...sausalito,
          sunshineScore: 18,
          prediction: {
            trend: "holding",
            predictionReason: "Fog may linger until 18:20.",
            predictionConfidenceLabel: "Medium",
          },
        },
      ],
    });

    const { container } = renderHomeView();

    await screen.findAllByText(/6:20 PM/);

    const desktopSection = container.querySelector(".mt-5.hidden.flex-col.gap-5.lg\\:flex");
    const children = Array.from(desktopSection?.children ?? []);
    const bestRightNowIndex = children.findIndex((child) =>
      child.classList.contains("grid"),
    );
    const nextHourIndex = children.findIndex((child) =>
      child.textContent?.includes("Next Hour"),
    );

    expect(bestRightNowIndex).toBeGreaterThanOrEqual(0);
    expect(nextHourIndex).toBeGreaterThanOrEqual(0);
    expect(bestRightNowIndex).toBeLessThan(nextHourIndex);
  });

  it("uses larger plain gold score text on mobile insight cards", async () => {
    const { container } = renderHomeView();

    await screen.findAllByText("Best Right Now");

    const mobileCards = container.querySelector(".flex.flex-col.gap-3\\.5.lg\\:hidden");
    expect(mobileCards?.querySelector(".rounded-full.border.border-karl-gold")).toBeNull();
    expect(mobileCards?.querySelector(".text-\\[1\\.75rem\\].text-karl-gold")).toBeTruthy();
  });
});
