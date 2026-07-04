// @vitest-environment happy-dom

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MapView, initialMapStyle } from "@/components/map/MapView";
import * as weatherApi from "@/lib/api/weather";

const FIXTURES_DIR = join(process.cwd(), "tests/fixtures");
const useSearchParamsMock = vi.fn();
const replaceMock = vi.fn();

vi.mock("next/navigation", () => ({
  useSearchParams: () => useSearchParamsMock(),
  useRouter: () => ({ replace: replaceMock }),
}));

vi.mock("@/components/map/BayAreaMap", () => ({
  BayAreaMap: () => <div data-testid="bay-area-map" />,
}));

vi.mock("@/lib/hooks/useMinWidth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/hooks/useMinWidth")>();
  return {
    ...actual,
    useMinWidth: () => true,
  };
});

const tiburon = JSON.parse(
  readFileSync(join(FIXTURES_DIR, "locations.json"), "utf8"),
).locations[0];

const sausalito = JSON.parse(
  readFileSync(join(FIXTURES_DIR, "locations.json"), "utf8"),
).locations[1];

const trayLocations = [
  tiburon,
  {
    ...tiburon,
    id: "san-jose",
    name: "San Jose",
    latitude: 37.3382,
    longitude: -121.8863,
    sunshineScore: 91,
    fogScore: 12,
    status: "Mostly Sunny",
    distanceText: "42 mi",
  },
  sausalito,
];

const expectedTrayOrder = ["san-jose", "tiburon", "sausalito"];

function getTrayLocationIds() {
  return screen
    .getAllByRole("button", { name: /Select .+ on map$/ })
    .map((button) => button.getAttribute("data-location-id"));
}

function renderDesktopMap() {
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
    rerenderDesktopMap: () =>
      view.rerender(
        createElement(
          QueryClientProvider,
          { client: queryClient },
          createElement(MapView),
        ),
      ),
  };
}

describe("MapView desktop", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it("defaults desktop map style to hybrid", () => {
    vi.spyOn(window, "matchMedia").mockReturnValue({
      matches: true,
      media: "(min-width: 1024px)",
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    } as MediaQueryList);

    expect(initialMapStyle()).toBe("hybrid");
  });

  beforeEach(() => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams("location=tiburon"));
    vi.spyOn(weatherApi, "getLocations").mockResolvedValue({
      locations: trayLocations,
    });
    vi.spyOn(weatherApi, "getCurrent").mockResolvedValue(
      JSON.parse(readFileSync(join(FIXTURES_DIR, "current.json"), "utf8")),
    );
  });

  it("keeps the score-ranked Best Right Now tray stable across selections", async () => {
    const { rerenderDesktopMap } = renderDesktopMap();

    await screen.findByRole("button", { name: "Select San Jose on map" });
    expect(getTrayLocationIds()).toEqual(expectedTrayOrder);

    useSearchParamsMock.mockReturnValue(new URLSearchParams("location=tiburon"));
    rerenderDesktopMap();
    await screen.findByRole("button", { name: "Select Tiburon on map" });
    expect(getTrayLocationIds()).toEqual(expectedTrayOrder);
    expect(
      screen.getByRole("button", { name: "Select Tiburon on map" }),
    ).toHaveAttribute("data-selected", "true");
    expect(
      screen.getByRole("button", { name: "Select San Jose on map" }),
    ).toHaveAttribute("data-selected", "false");

    useSearchParamsMock.mockReturnValue(new URLSearchParams("location=san-jose"));
    rerenderDesktopMap();
    await screen.findByRole("button", { name: "Select San Jose on map" });
    expect(getTrayLocationIds()).toEqual(expectedTrayOrder);
    expect(
      screen.getByRole("button", { name: "Select San Jose on map" }),
    ).toHaveAttribute("data-selected", "true");
    expect(
      screen.getByRole("button", { name: "Select Tiburon on map" }),
    ).toHaveAttribute("data-selected", "false");

    useSearchParamsMock.mockReturnValue(
      new URLSearchParams("location=sausalito"),
    );
    rerenderDesktopMap();
    await screen.findByRole("button", { name: "Select Sausalito on map" });
    expect(getTrayLocationIds()).toEqual(expectedTrayOrder);
    expect(
      screen.getByRole("button", { name: "Select Sausalito on map" }),
    ).toHaveAttribute("data-selected", "true");
  });

  it("routes Best Right Now clicks to the clicked location id", async () => {
    renderDesktopMap();

    fireEvent.click(
      await screen.findByRole("button", { name: "Select San Jose on map" }),
    );

    expect(replaceMock).toHaveBeenCalledWith("/map?location=san-jose", {
      scroll: false,
    });
    expect(replaceMock).not.toHaveBeenCalledWith("/map?location=tiburon", {
      scroll: false,
    });
  });

  describe("desktop tray intensity behavior", () => {
    beforeEach(() => {
      useSearchParamsMock.mockReturnValue(new URLSearchParams());
    });

    it("shows the Best Right Now tray when no intensity filter is selected", async () => {
      renderDesktopMap();

      expect(
        await screen.findByLabelText("Best Right Now"),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Select San Jose on map" }),
      ).toBeInTheDocument();
    });

    it("shows the Best Right Now tray when Clear is selected", async () => {
      renderDesktopMap();

      fireEvent.click(await screen.findByRole("button", { name: "Clear" }));

      expect(
        await screen.findByLabelText("Best Right Now"),
      ).toBeInTheDocument();
      expect(screen.queryByLabelText("Clear Locations")).not.toBeInTheDocument();
    });

    it.each(["Light Fog", "Foggy", "Karl Territory"] as const)(
      "hides the tray when %s is selected",
      async (label) => {
        renderDesktopMap();

        fireEvent.click(await screen.findByRole("button", { name: label }));

        expect(screen.queryByLabelText("Best Right Now")).not.toBeInTheDocument();
        expect(screen.queryByLabelText("Clear Locations")).not.toBeInTheDocument();
        expect(
          screen.queryByRole("button", { name: /Select .+ on map$/ }),
        ).not.toBeInTheDocument();
      },
    );

    it("keeps the Best Right Now tray visible when Clear and a region filter are active", async () => {
      useSearchParamsMock.mockReturnValue(new URLSearchParams("region=north-bay"));

      renderDesktopMap();

      fireEvent.click(await screen.findByRole("button", { name: "Clear" }));

      expect(
        await screen.findByLabelText("Best Right Now"),
      ).toBeInTheDocument();
      expect(screen.queryByLabelText("Clear Locations")).not.toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Select Tiburon on map" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Select Sausalito on map" }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Select San Jose on map" }),
      ).not.toBeInTheDocument();
    });

    it("hides the tray for fog filters even when a region filter is active", async () => {
      useSearchParamsMock.mockReturnValue(new URLSearchParams("region=north-bay"));

      renderDesktopMap();

      fireEvent.click(await screen.findByRole("button", { name: "Foggy" }));

      expect(screen.queryByLabelText("Clear Locations")).not.toBeInTheDocument();
      expect(screen.queryByLabelText("Best Right Now")).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /Select .+ on map$/ }),
      ).not.toBeInTheDocument();
    });
  });
});
