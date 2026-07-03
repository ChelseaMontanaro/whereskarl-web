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

const FIXTURES_DIR = join(process.cwd(), "tests/fixtures");

function readFixture<T>(filename: string): T {
  return JSON.parse(readFileSync(join(FIXTURES_DIR, filename), "utf8")) as T;
}

function renderHome() {
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

describe("HomeView", () => {
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

  it("renders the Home loading state before data resolves", () => {
    vi.spyOn(weatherApi, "getCurrent").mockImplementation(
      () => new Promise(() => {}),
    );
    vi.spyOn(weatherApi, "getLocations").mockImplementation(
      () => new Promise(() => {}),
    );
    vi.spyOn(weatherApi, "getBestSunshine").mockImplementation(
      () => new Promise(() => {}),
    );

    renderHome();

    expect(screen.getAllByText("Reading Karl intelligence").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Checking conditions").length).toBeGreaterThan(0);
  });

  it("renders loaded Home content from fixtures", async () => {
    renderHome();

    expect(await screen.findByText("56%")).toBeInTheDocument();
    expect(screen.getByText(/Karl's Read/i)).toBeInTheDocument();
    expect(
      screen.getByText("Karl is picking favorites across the Bay"),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Tiburon").length).toBeGreaterThan(0);
    expect(screen.getByText("BEST SUNSHINE")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Find Clear Skies" }),
    ).toHaveAttribute("href", "/map?location=tiburon");
    expect(
      screen.getByRole("link", { name: "View brightest spot on map" }),
    ).toHaveAttribute("href", "/map?location=tiburon");
  });

  it("falls back to the general map route when best sunshine is unavailable", async () => {
    vi.spyOn(weatherApi, "getBestSunshine").mockRejectedValue(
      new Error("best sunshine unavailable"),
    );

    renderHome();

    expect(await screen.findByText("56%")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Find Clear Skies" }),
    ).toHaveAttribute("href", "/map");
    expect(
      screen.getByRole("link", { name: "View brightest spot on map" }),
    ).toHaveAttribute("href", "/map");
  });
});
