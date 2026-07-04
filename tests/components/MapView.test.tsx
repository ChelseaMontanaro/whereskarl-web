// @vitest-environment happy-dom

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MapView } from "@/components/map/MapView";
import * as weatherApi from "@/lib/api/weather";

const FIXTURES_DIR = join(process.cwd(), "tests/fixtures");

const useSearchParamsMock = vi.fn();
const replaceMock = vi.fn();

vi.mock("next/navigation", () => ({
  useSearchParams: () => useSearchParamsMock(),
  useRouter: () => ({ replace: replaceMock }),
}));

vi.mock("@/lib/hooks/useMinWidth", () => ({
  useMinWidth: () => false,
}));

vi.mock("@/components/map/BayAreaMap", () => ({
  BayAreaMap: ({
    onSelectLocation,
  }: {
    onSelectLocation: (locationId: string) => void;
  }) => (
    <div data-testid="bay-area-map">
      <button
        type="button"
        data-testid="map-marker-sausalito"
        onClick={() => onSelectLocation("sausalito")}
      >
        Sausalito marker
      </button>
    </div>
  ),
}));

const multiRegionLocations = {
  locations: [
    JSON.parse(readFileSync(join(FIXTURES_DIR, "locations.json"), "utf8"))
      .locations[0],
    JSON.parse(readFileSync(join(FIXTURES_DIR, "locations.json"), "utf8"))
      .locations[1],
    {
      id: "oakland",
      name: "Oakland",
      latitude: 37.8044,
      longitude: -122.2712,
      status: "Mostly Sunny",
      temperature: 68,
      sunshineScore: 72,
      distanceText: "10 mi",
      cloudCover: 30,
      visibility: 8,
      humidity: 60,
      windSpeed: 8,
      windDirection: "W",
      weatherCode: 2,
      iconName: "cloud.sun.fill",
      fogScore: 30,
      karlReason: "Mostly clear across Oakland.",
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
    },
  ],
};

function renderMap() {
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
      createElement(MapView),
    ),
  );
}

describe("MapView", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  beforeEach(() => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams("location=tiburon"));
    vi.spyOn(weatherApi, "getLocations").mockResolvedValue(multiRegionLocations);
  });

  it("reads the selected location query param and shows the focused location", async () => {
    renderMap();

    expect(
      await screen.findByLabelText("Selected location: Tiburon"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("bay-area-map")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "SF" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "North Bay" })).toBeInTheDocument();
  });

  it("handles unknown selected locations without crashing", async () => {
    useSearchParamsMock.mockReturnValue(
      new URLSearchParams("location=unknown-spot"),
    );

    renderMap();

    expect(await screen.findByText(/Couldn't find/i)).toBeInTheDocument();
    expect(screen.getByText(/unknown spot/i)).toBeInTheDocument();
    expect(
      screen.queryByLabelText(/Selected location:/i),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("bay-area-map")).toBeInTheDocument();
  });

  it("updates the map route when a marker is selected", async () => {
    renderMap();

    fireEvent.click(await screen.findByTestId("map-marker-sausalito"));

    expect(replaceMock).toHaveBeenCalledWith("/map?location=sausalito", {
      scroll: false,
    });
  });

  it("activates the matching region chip when a region param is present", async () => {
    useSearchParamsMock.mockReturnValue(
      new URLSearchParams("region=north-bay"),
    );

    renderMap();

    expect(
      await screen.findByRole("button", { name: "North Bay" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(await screen.findByLabelText("Best Right Now")).toBeInTheDocument();
  });

  it("prioritizes location over region in the UI", async () => {
    useSearchParamsMock.mockReturnValue(
      new URLSearchParams("location=tiburon&region=south-bay"),
    );

    renderMap();

    expect(
      await screen.findByLabelText("Selected location: Tiburon"),
    ).toBeInTheDocument();
    expect(await screen.findByLabelText("Best Right Now")).toBeInTheDocument();
    expect(screen.queryByText("South Bay Locations")).not.toBeInTheDocument();
  });

  it("handles unknown region params without crashing", async () => {
    useSearchParamsMock.mockReturnValue(
      new URLSearchParams("region=unknown-coast"),
    );

    renderMap();

    expect(await screen.findByText(/Couldn't find region/i)).toBeInTheDocument();
    expect(await screen.findByLabelText("Best Right Now")).toBeInTheDocument();
  });

  it("normalizes peninsula region params to San Francisco", async () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams("region=peninsula"));

    renderMap();

    expect(await screen.findByRole("button", { name: "SF" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.queryByText(/Couldn't find region/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Peninsula" })).not.toBeInTheDocument();
  });

  it("selects a location from the Best Right Now tray and updates routing", async () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams("region=north-bay"));

    renderMap();

    fireEvent.click(
      await screen.findByRole("button", { name: "Select Tiburon on map" }),
    );

    expect(replaceMock).toHaveBeenCalledWith("/map?location=tiburon", {
      scroll: false,
    });
  });

  it("frames a region through the shareable region route", async () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams());
    renderMap();

    fireEvent.click(await screen.findByRole("button", { name: "North Bay" }));

    expect(replaceMock).toHaveBeenCalledWith("/map?region=north-bay", {
      scroll: false,
    });
  });
});
