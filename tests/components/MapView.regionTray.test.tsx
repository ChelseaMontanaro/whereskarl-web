// @vitest-environment happy-dom

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
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
    {
      region: "san-francisco",
      chipLabel: "SF",
      expectedIds: ["ocean-beach", "presidio"],
      unexpectedId: "san-jose",
    },
    {
      region: "north-bay",
      chipLabel: "North Bay",
      expectedIds: ["tiburon", "sausalito"],
      unexpectedId: "oakland",
    },
    {
      region: "east-bay",
      chipLabel: "East Bay",
      expectedIds: ["oakland", "berkeley"],
      unexpectedId: "tiburon",
    },
    {
      region: "south-bay",
      chipLabel: "South Bay",
      expectedIds: ["san-jose", "palo-alto"],
      unexpectedId: "tiburon",
    },
  ] as const)(
    "shows $chipLabel location cards in the tray when $region is active",
    async ({ region, expectedIds, unexpectedId }) => {
      useSearchParamsMock.mockReturnValue(new URLSearchParams(`region=${region}`));

      renderMap();

      await screen.findByLabelText("Best Right Now");
      expect(getTrayLocationIds()).toEqual(expectedIds);
      expect(getTrayLocationIds()).not.toContain(unexpectedId);
    },
  );

  it("does not empty the tray when a region with valid locations is selected", async () => {
    const { rerenderMap } = renderMap();

    await screen.findByLabelText("Best Right Now");
    expect(getTrayLocationIds().length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "North Bay" }));
    expect(replaceMock).toHaveBeenCalledWith("/map?region=north-bay", {
      scroll: false,
    });

    useSearchParamsMock.mockReturnValue(new URLSearchParams("region=north-bay"));
    rerenderMap();

    await screen.findByRole("button", { name: "Select Tiburon on map" });
    expect(getTrayLocationIds()).toEqual(["tiburon", "sausalito"]);
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

    it("scopes the tray to the active region on desktop", async () => {
      useSearchParamsMock.mockReturnValue(
        new URLSearchParams("region=south-bay"),
      );

      renderMap();

      await screen.findByLabelText("Best Right Now");
      expect(getTrayLocationIds()).toEqual(["san-jose", "palo-alto"]);
      expect(getTrayLocationIds()).not.toContain("tiburon");
    });
  });

  describe("phone portrait", () => {
    beforeEach(() => {
      usePhonePortraitMock.mockReturnValue(true);
    });

    it("preserves the approved compact controls while scoping the tray to the region", async () => {
      useSearchParamsMock.mockReturnValue(
        new URLSearchParams("region=san-francisco"),
      );

      const { container } = renderMap();

      expect(
        await screen.findByRole("heading", { name: "Bay Area conditions" }),
      ).toBeInTheDocument();
      expect(screen.getByText("Karl around the Bay")).toBeInTheDocument();
      expect(
        screen.queryByText("Explore live fog & clear skies around the Bay."),
      ).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Karl Territory" })).toBeInTheDocument();
      expect(container.querySelector(".grid.grid-cols-2")).toBeNull();
      expect(container.querySelector(".flex.flex-col.gap-1")).toBeTruthy();

      await screen.findByLabelText("Best Right Now");
      expect(getTrayLocationIds()).toEqual(["ocean-beach", "presidio"]);
    });
  });
});
