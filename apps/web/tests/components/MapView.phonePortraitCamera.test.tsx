// @vitest-environment happy-dom

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, waitFor } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MapView } from "@/components/map/MapView";
import * as weatherApi from "@/lib/api/weather";

const FIXTURES_DIR = join(process.cwd(), "tests/fixtures");

const useSearchParamsMock = vi.fn();
const usePhonePortraitMock = vi.fn(() => true);

// Capture the camera region + selected location handed to the map so we can
// prove camera intent is independent of the canonical selection.
const captured: Array<{
  selectedRegionId: string | null;
  selectedLocationId: string | null;
}> = [];

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
  BayAreaMap: ({
    selectedRegionId,
    selectedLocationId,
  }: {
    selectedRegionId: string | null;
    selectedLocationId: string | null;
  }) => {
    captured.push({ selectedRegionId, selectedLocationId });
    return <div data-testid="bay-area-map" />;
  },
}));

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

describe("MapView phone-portrait camera intent", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    captured.length = 0;
    usePhonePortraitMock.mockReturnValue(true);
  });

  beforeEach(() => {
    vi.spyOn(weatherApi, "getLocations").mockResolvedValue(
      JSON.parse(readFileSync(join(FIXTURES_DIR, "locations.json"), "utf8")),
    );
    vi.spyOn(weatherApi, "getCurrent").mockResolvedValue(
      JSON.parse(readFileSync(join(FIXTURES_DIR, "current.json"), "utf8")),
    );
    vi.spyOn(weatherApi, "getBestSunshine").mockResolvedValue(
      JSON.parse(readFileSync(join(FIXTURES_DIR, "best-sunshine.json"), "utf8")),
    );
  });

  it("frames the all-Bay camera (region null) on a clean entry — not San Francisco", async () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams());
    renderMap();

    await waitFor(() => {
      expect(captured.length).toBeGreaterThan(0);
    });

    // Camera intent stays all-Bay: selectedRegionId is null on a clean entry,
    // never silently defaulted to "san-francisco" (audit RC-3). The Best Right
    // Now auto-selection (a selection concern) must not change camera intent.
    for (const frame of captured) {
      expect(frame.selectedRegionId).toBeNull();
    }
  });

  it("frames the requested region camera when a region chip is active", async () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams("region=north-bay"));
    renderMap();

    await waitFor(() => {
      expect(captured.length).toBeGreaterThan(0);
    });

    for (const frame of captured) {
      expect(frame.selectedRegionId).toBe("north-bay");
    }
  });
});
