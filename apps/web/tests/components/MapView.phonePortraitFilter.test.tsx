// @vitest-environment happy-dom

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { createElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MapView } from "@/components/map/MapView";
import * as weatherApi from "@/lib/api/weather";
import type { LocationWeather, LocationsResponse } from "@/lib/schemas/weather";

const useSearchParamsMock = vi.fn();
const usePhonePortraitMock = vi.fn(() => true);
const capturedLocationIds: string[][] = [];

vi.mock("next/navigation", () => ({
  useSearchParams: () => useSearchParamsMock(),
  useRouter: () => ({ replace: vi.fn() }),
}));

vi.mock("@/lib/hooks/useMinWidth", () => ({
  useMinWidth: () => false,
}));

vi.mock("@/lib/hooks/usePhonePortrait", () => ({
  usePhonePortrait: () => usePhonePortraitMock(),
}));

// Expose the exact location set handed to the map so we can assert that the
// active fog-intensity filter reaches the rendered marker list.
vi.mock("@/components/map/BayAreaMap", () => ({
  BayAreaMap: ({
    locations,
  }: {
    locations: Array<{ id: string }>;
  }) => {
    capturedLocationIds.push(locations.map((location) => location.id));
    return (
      <div data-testid="bay-area-map">
        {locations.map((location) => (
          <span key={location.id} data-testid={`marker-${location.id}`} />
        ))}
      </div>
    );
  },
}));

const baseLocation = {
  latitude: 37.7749,
  longitude: -122.4194,
  status: "Mostly Sunny",
  temperature: 62,
  distanceText: "2 mi",
  cloudCover: 20,
  visibility: 9,
  humidity: 60,
  windSpeed: 8,
  windDirection: "W",
  weatherCode: 1,
  iconName: "sun.max.fill",
  region: "san-francisco",
  karlReason: "Test location.",
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
    predictionReason:
      "Prediction is unavailable while Karl is using fallback data.",
  },
} satisfies Omit<LocationWeather, "id" | "name" | "fogScore" | "sunshineScore">;

// Each location maps unambiguously to a single fog intensity classification.
const clearLocation: LocationWeather = {
  ...baseLocation,
  id: "clear-spot",
  name: "Clear Spot",
  fogScore: 10,
  sunshineScore: 90,
};
const lightFogLocation: LocationWeather = {
  ...baseLocation,
  id: "light-fog-spot",
  name: "Light Fog Spot",
  fogScore: 35,
  sunshineScore: 40,
};
const foggyLocation: LocationWeather = {
  ...baseLocation,
  id: "foggy-spot",
  name: "Foggy Spot",
  fogScore: 60,
  sunshineScore: 30,
};
const karlLocation: LocationWeather = {
  ...baseLocation,
  id: "karl-spot",
  name: "Karl Spot",
  fogScore: 90,
  sunshineScore: 20,
};

const allLocations = [
  clearLocation,
  lightFogLocation,
  foggyLocation,
  karlLocation,
];

function renderMap() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(MapView),
    ),
  );
}

function renderedMarkerIds(): string[] {
  const map = screen.getByTestId("bay-area-map");
  return within(map)
    .queryAllByTestId(/^marker-/)
    .map((node) => node.getAttribute("data-testid")!.replace("marker-", ""));
}

describe("MapView phone portrait fog intensity filtering", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    capturedLocationIds.length = 0;
    usePhonePortraitMock.mockReturnValue(true);
  });

  beforeEach(() => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams());
    vi.spyOn(weatherApi, "getLocations").mockResolvedValue({
      locations: allLocations,
    } satisfies LocationsResponse);
    vi.spyOn(weatherApi, "getCurrent").mockResolvedValue({
      fogCoverage: 40,
      sunshineScore: 60,
      updatedAt: "2026-07-01T16:00:00.000Z",
    } as never);
  });

  it("passes only matching locations to the map for each fog filter", async () => {
    renderMap();

    // Wait for locations to load: all four markers render with no filter.
    await waitFor(() => {
      expect(renderedMarkerIds().sort()).toEqual(
        ["clear-spot", "foggy-spot", "karl-spot", "light-fog-spot"].sort(),
      );
    });

    const cases: Array<{ button: string; expected: string }> = [
      { button: "Clear", expected: "clear-spot" },
      { button: "Light Fog", expected: "light-fog-spot" },
      { button: "Foggy", expected: "foggy-spot" },
      { button: "Karl Territory", expected: "karl-spot" },
    ];

    for (const { button, expected } of cases) {
      fireEvent.click(screen.getByRole("button", { name: button }));

      await waitFor(() => {
        expect(renderedMarkerIds()).toEqual([expected]);
      });

      // Active state reflects the selected filter.
      expect(
        screen.getByRole("button", { name: button }),
      ).toHaveAttribute("aria-pressed", "true");

      // Toggle the filter back off before selecting the next one so each
      // filter is asserted from a clean (unfiltered) baseline.
      fireEvent.click(screen.getByRole("button", { name: button }));
      await waitFor(() => {
        expect(renderedMarkerIds()).toHaveLength(allLocations.length);
      });
    }
  });
});
