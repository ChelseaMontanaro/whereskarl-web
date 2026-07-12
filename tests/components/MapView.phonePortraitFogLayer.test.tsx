// @vitest-environment happy-dom

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { createElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MapView } from "@/components/map/MapView";
import * as weatherApi from "@/lib/api/weather";
import type { LocationWeather, LocationsResponse } from "@/lib/schemas/weather";

const useSearchParamsMock = vi.fn();
const usePhonePortraitMock = vi.fn(() => true);
const useMinWidthMock = vi.fn(() => false);

vi.mock("next/navigation", () => ({
  useSearchParams: () => useSearchParamsMock(),
  useRouter: () => ({ replace: vi.fn() }),
}));

vi.mock("@/lib/hooks/useMinWidth", () => ({
  useMinWidth: () => useMinWidthMock(),
}));

vi.mock("@/lib/hooks/usePhonePortrait", () => ({
  usePhonePortrait: () => usePhonePortraitMock(),
}));

// The Fog Layer trigger under test lives in MapView's overlay, not in the map
// itself, so a lightweight BayAreaMap stub keeps the assertions focused on
// overlay placement and guarantees the map never renders a second trigger.
vi.mock("@/components/map/BayAreaMap", () => ({
  BayAreaMap: () => <div data-testid="bay-area-map" />,
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

const sfLocation: LocationWeather = {
  ...baseLocation,
  id: "clear-spot",
  name: "Clear Spot",
  fogScore: 10,
  sunshineScore: 90,
};

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

describe("MapView phone-portrait Map Layers placement", () => {
  beforeEach(() => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams());
    usePhonePortraitMock.mockReturnValue(true);
    useMinWidthMock.mockReturnValue(false);
    vi.spyOn(weatherApi, "getLocations").mockResolvedValue({
      locations: [sfLocation],
    } satisfies LocationsResponse);
    vi.spyOn(weatherApi, "getCurrent").mockResolvedValue({
      fogCoverage: 40,
      sunshineScore: 60,
      updatedAt: "2026-07-01T16:00:00.000Z",
    } as never);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    usePhonePortraitMock.mockReturnValue(true);
    useMinWidthMock.mockReturnValue(false);
  });

  it("renders exactly one Map Layers trigger in the top-right overlay, separate from the rail", () => {
    renderMap();

    const triggers = screen.getAllByRole("button", { name: "Open map layers" });
    expect(triggers).toHaveLength(1);

    const trigger = triggers[0];
    const rail = screen.getByLabelText("Fog intensity filter");

    // The Map Layers control is a global control, deliberately separate from
    // the Fog Intensity rail — they must not share a control-group wrapper.
    const group = trigger.closest("div.absolute");
    expect(group?.className).toContain("right-3");
    expect(group?.className).not.toContain("left-3");
    expect(group?.contains(rail)).toBe(false);
  });

  it("uses a stacked-layers icon and no hamburger for the trigger", () => {
    renderMap();

    const trigger = screen.getByRole("button", { name: "Open map layers" });
    const iconPath = trigger.querySelector("svg path");
    expect(iconPath?.getAttribute("d")).toContain("18.54");
    expect(iconPath?.getAttribute("d")).not.toContain("M4 6h16");
    expect(trigger.textContent).toBe("");
  });

  it("opens a phone Map Layers sheet while keeping the Fog Intensity rail mounted", () => {
    renderMap();

    const trigger = screen.getByRole("button", { name: "Open map layers" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveAttribute("aria-controls", "map-layer-sheet-phone");

    fireEvent.click(trigger);
    expect(
      screen.getByRole("button", { name: "Open map layers" }),
    ).toHaveAttribute("aria-expanded", "true");

    const sheet = screen.getByRole("dialog", { name: "Map Layers" });
    expect(sheet).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Satellite" })).toBeInTheDocument();

    // The rail stays mounted (and unchanged) while the sheet is open; the
    // backdrop simply dims it along with the map.
    expect(screen.getByLabelText("Fog intensity filter")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Close map layers" }));
    expect(
      screen.getByRole("button", { name: "Open map layers" }),
    ).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Fog intensity filter")).toBeInTheDocument();
  });

  it("anchors the phone Map Layers sheet above the bottom navigation", () => {
    renderMap();

    fireEvent.click(screen.getByRole("button", { name: "Open map layers" }));

    const sheet = screen.getByRole("dialog", { name: "Map Layers" });
    // Fixed, near-full-width, and lifted above the bottom nav via a bottom
    // offset that respects the safe area — never rendered under the nav.
    expect(sheet.className).toContain("fixed");
    expect(sheet.className).toContain("inset-x-3");
    expect(sheet.className).toContain("bottom-[calc(5.5rem+env(safe-area-inset-bottom))]");
    expect(sheet.className).toContain("overflow-y-auto");
  });

  it("does not render the phone Map Layers trigger for desktop", async () => {
    useMinWidthMock.mockReturnValue(true);
    renderMap();

    await waitFor(() => {
      expect(screen.getByTestId("bay-area-map")).toBeInTheDocument();
    });

    // Desktop renders its own controls inside BayAreaMap (stubbed here), so the
    // phone-portrait trigger must be absent.
    expect(
      screen.queryByRole("button", { name: "Open map layers" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText("Fog intensity filter"),
    ).not.toBeInTheDocument();
  });
});
