// @vitest-environment happy-dom

import { readFileSync } from "node:fs";
import { join } from "node:path";
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
import type { BayAreaBackendRegionId } from "@/lib/map/config";
import type { LocationWeather } from "@/lib/schemas/weather";

const FIXTURES_DIR = join(process.cwd(), "tests/fixtures");

const useSearchParamsMock = vi.fn();
const replaceMock = vi.fn();
const useMinWidthMock = vi.fn(() => false);
const usePhonePortraitMock = vi.fn(() => false);

vi.mock("next/navigation", () => ({
  useSearchParams: () => useSearchParamsMock(),
  useRouter: () => ({ replace: replaceMock }),
}));

vi.mock("@/lib/hooks/useMinWidth", () => ({
  useMinWidth: () => useMinWidthMock(),
}));

vi.mock("@/lib/hooks/usePhonePortrait", () => ({
  usePhonePortrait: () => usePhonePortraitMock(),
}));

vi.mock("@/components/map/BayAreaMap", () => ({
  BayAreaMap: () => <div data-testid="bay-area-map" />,
}));

const tiburonTemplate = JSON.parse(
  readFileSync(join(FIXTURES_DIR, "locations.json"), "utf8"),
).locations[0] as LocationWeather;

function createRegionLocation(
  id: string,
  name: string,
  region: BayAreaBackendRegionId,
  sunshineScore: number,
): LocationWeather {
  return {
    ...tiburonTemplate,
    id,
    name,
    region,
    sunshineScore,
    fogScore: Math.max(10, 100 - sunshineScore),
  };
}

const multiRegionLocations = {
  locations: [
    createRegionLocation("ocean-beach", "Ocean Beach", "san-francisco", 85),
    createRegionLocation("presidio", "Presidio", "san-francisco", 80),
    createRegionLocation("tiburon", "Tiburon", "north-bay", 82),
    createRegionLocation("sausalito", "Sausalito", "north-bay", 74),
    createRegionLocation("oakland", "Oakland", "east-bay", 72),
    createRegionLocation("berkeley", "Berkeley", "east-bay", 68),
    createRegionLocation("san-jose", "San Jose", "south-bay", 91),
    createRegionLocation("palo-alto", "Palo Alto", "south-bay", 88),
  ],
};

const bayWideTrayIds = ["san-jose", "palo-alto", "ocean-beach", "tiburon"];

function getTrayLocationIds() {
  return screen
    .getAllByRole("button", { name: /Select .+ on map$/ })
    .map((button) => button.getAttribute("data-location-id"));
}

function renderMap() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const view = render(
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(MapView),
    ),
  );

  return {
    ...view,
    rerenderMap: () =>
      view.rerender(
        createElement(
          QueryClientProvider,
          { client: queryClient },
          createElement(MapView),
        ),
      ),
  };
}

describe("MapView region tray behavior", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    useMinWidthMock.mockReturnValue(false);
    usePhonePortraitMock.mockReturnValue(false);
  });

  beforeEach(() => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams());
    vi.spyOn(weatherApi, "getLocations").mockResolvedValue(multiRegionLocations);
    vi.spyOn(weatherApi, "getCurrent").mockResolvedValue(
      JSON.parse(readFileSync(join(FIXTURES_DIR, "current.json"), "utf8")),
    );
  });

  it.each([
  { region: "san-francisco", chipLabel: "SF" },
  { region: "north-bay", chipLabel: "North Bay" },
  { region: "east-bay", chipLabel: "East Bay" },
  { region: "south-bay", chipLabel: "South Bay" },
  { region: "peninsula", chipLabel: "Peninsula" },
] as const)(
    "keeps Best Right Now bay-wide when $chipLabel is active",
    async ({ region }) => {
      useSearchParamsMock.mockReturnValue(new URLSearchParams(`region=${region}`));

      renderMap();

      await screen.findByLabelText("Best Right Now");
      expect(getTrayLocationIds()).toEqual(bayWideTrayIds);
    },
  );

  it("keeps the bay-wide tray when switching regions", async () => {
    const { rerenderMap } = renderMap();

    await screen.findByLabelText("Best Right Now");
    expect(getTrayLocationIds()).toEqual(bayWideTrayIds);

    fireEvent.click(screen.getByRole("button", { name: "North Bay" }));
    expect(replaceMock).toHaveBeenCalledWith("/map?region=north-bay", {
      scroll: false,
    });

    useSearchParamsMock.mockReturnValue(new URLSearchParams("region=north-bay"));
    rerenderMap();

    await screen.findByRole("button", { name: "Select San Jose on map" });
    expect(getTrayLocationIds()).toEqual(bayWideTrayIds);
  });

  it("does not remove a location from the tray after it is selected", async () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams("location=tiburon"));

    renderMap();

    await screen.findByRole("button", { name: "Select Tiburon on map" });
    expect(getTrayLocationIds()).toContain("tiburon");
    expect(
      screen.getByRole("button", { name: "Select Tiburon on map" }),
    ).toHaveAttribute("data-selected", "true");
  });

  describe("desktop", () => {
    beforeEach(() => {
      useMinWidthMock.mockReturnValue(true);
    });

    it("keeps Best Right Now bay-wide on desktop when a region is active", async () => {
      useSearchParamsMock.mockReturnValue(
        new URLSearchParams("region=south-bay"),
      );

      renderMap();

      await screen.findByLabelText("Best Right Now");
      expect(getTrayLocationIds()).toEqual(bayWideTrayIds);
      expect(getTrayLocationIds()).toContain("tiburon");
    });
  });

  describe("phone portrait (selection-driven)", () => {
    beforeEach(() => {
      usePhonePortraitMock.mockReturnValue(true);
    });

    it("auto-selects the canonical Best Right Now location on a clean entry", async () => {
      // Canonical recommendation (shared with Home) wins over the top score.
      vi.spyOn(weatherApi, "getBestSunshine").mockResolvedValue({
        locationID: "palo-alto",
      } as never);

      renderMap();

      await waitFor(() => {
        expect(replaceMock).toHaveBeenCalledWith("/map?location=palo-alto", {
          scroll: false,
        });
      });
    });

    it("falls back to the top-scored location when no recommendation is available", async () => {
      vi.spyOn(weatherApi, "getBestSunshine").mockRejectedValue(
        new Error("unavailable"),
      );

      renderMap();

      await waitFor(() => {
        expect(replaceMock).toHaveBeenCalledWith("/map?location=san-jose", {
          scroll: false,
        });
      });
    });

    it("does not render a Best Right Now tray on the map", async () => {
      useSearchParamsMock.mockReturnValue(
        new URLSearchParams("location=palo-alto"),
      );

      renderMap();

      expect(
        await screen.findByLabelText("Selected location: Palo Alto"),
      ).toBeInTheDocument();
      expect(screen.queryByLabelText("Best Right Now")).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /Select .+ on map$/ }),
      ).not.toBeInTheDocument();
    });

    it("does not auto-select while explicitly browsing a region", async () => {
      useSearchParamsMock.mockReturnValue(
        new URLSearchParams("region=south-bay"),
      );

      renderMap();

      expect(
        await screen.findByTestId("map-phone-portrait-search-bar"),
      ).toBeInTheDocument();
      expect(
        replaceMock.mock.calls.some(([href]) =>
          String(href).startsWith("/map?location="),
        ),
      ).toBe(false);
    });
  });
});
