// @vitest-environment happy-dom

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MapView } from "@/components/map/MapView";
import * as weatherApi from "@/lib/api/weather";

const FIXTURES_DIR = join(process.cwd(), "tests/fixtures");

const useSearchParamsMock = vi.fn();
const usePhonePortraitMock = vi.fn(() => true);

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

vi.mock("@/components/map/BayAreaMap", () => ({
  BayAreaMap: () => <div data-testid="bay-area-map" />,
}));

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

describe("MapView phone portrait", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    usePhonePortraitMock.mockReturnValue(true);
  });

  beforeEach(() => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams());
    vi.spyOn(weatherApi, "getLocations").mockResolvedValue(
      JSON.parse(readFileSync(join(FIXTURES_DIR, "locations.json"), "utf8")),
    );
    vi.spyOn(weatherApi, "getCurrent").mockResolvedValue(
      JSON.parse(readFileSync(join(FIXTURES_DIR, "current.json"), "utf8")),
    );
  });

  it("uses the compact phone portrait header instead of the large conditions card", async () => {
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
  });
});
