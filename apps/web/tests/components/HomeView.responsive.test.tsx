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

const useMinWidthMock = vi.hoisted(() => vi.fn(() => false));

vi.mock("@/lib/hooks/useMinWidth", () => ({
  useMinWidth: () => useMinWidthMock(),
}));

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
    useMinWidthMock.mockReturnValue(false);
    vi.spyOn(weatherApi, "getCurrent").mockResolvedValue(readFixture("current.json"));
    vi.spyOn(weatherApi, "getLocations").mockResolvedValue(readFixture("locations.json"));
    vi.spyOn(weatherApi, "getBestSunshine").mockResolvedValue(
      readFixture("best-sunshine.json"),
    );
    vi.spyOn(intelligenceApi, "getKarlIntelligence").mockResolvedValue(
      readFixture("karl-intelligence-mill-valley.json"),
    );
  });

  it("adds a mobile content vignette without excessive bottom spacer", () => {
    const { container } = renderHomeView();

    expect(container.querySelector(".max-sm\\:backdrop-blur-lg")).toBeInTheDocument();
    expect(container.querySelector(".pb-28")).toBeNull();
    expect(container.querySelector(".pb-4")).toBeNull();
    expect(container.querySelector(".max-sm\\:pb-0")).toBeInTheDocument();
    expect(container.querySelector(".pt-3")).toBeInTheDocument();
    expect(container.querySelector(".bg-black\\/26")).toBeInTheDocument();
  });

  it("adds phone portrait breathing room between the hero CTA and metric grid", () => {
    const { container } = renderHomeView();

    const heroCta = container.querySelector(
      "section[aria-label='Karl conditions hero'] .max-sm\\:mb-3\\.5",
    );
    expect(heroCta).toBeTruthy();
    expect(container.querySelector(".max-sm\\:pt-5")).toBeInTheDocument();
  });

  it("omits the Best Clear Skies card from the phone portrait insight stack", async () => {
    const { container } = renderHomeView();

    await screen.findAllByText("Karl's Read");

    const mobileStack = container.querySelector(".flex.flex-col.gap-3\\.5.max-sm\\:gap-4");
    expect(mobileStack).toBeTruthy();
    expect(mobileStack?.textContent).not.toMatch(/BEST CLEAR SKIES/i);
    expect(mobileStack?.textContent).not.toMatch(/Brightest Spot/i);
    expect(
      screen.queryByRole("link", { name: "View brightest spot on map" }),
    ).not.toBeInTheDocument();
  });

  it("orders phone portrait insight cards as Karl's Read, Best Right Now, then Future Outlook", async () => {
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

    await screen.findAllByText(/Karl's Read/i);
    await screen.findAllByText(/6:20 PM/);

    const mobileStack = container.querySelector(".flex.flex-col.gap-3\\.5.max-sm\\:gap-4");
    const children = Array.from(mobileStack?.children ?? []);
    const labels = children.map((child) => child.textContent ?? "");

    const karlReadIndex = labels.findIndex((text) => /Karl's Read/i.test(text));
    const bestRightNowIndex = labels.findIndex((text) => text.includes("Best Right Now"));
    const futureOutlookIndex = labels.findIndex((text) => text.includes("Future Outlook"));

    expect(karlReadIndex).toBe(0);
    expect(bestRightNowIndex).toBeGreaterThan(karlReadIndex);
    expect(futureOutlookIndex).toBeGreaterThan(bestRightNowIndex);
  });

  it("does not mount the desktop Home stack while phone portrait layout is active", () => {
    useMinWidthMock.mockReturnValue(false);
    const { container } = renderHomeView();

    expect(container.querySelector(".mt-5.hidden.flex-col.gap-5.lg\\:flex")).toBeNull();
    expect(container.querySelector(".mt-5.flex.flex-col.gap-5")).toBeNull();
    expect(container.querySelector(".flex.flex-col.gap-3\\.5.max-sm\\:gap-4")).toBeTruthy();
  });

  it("uses subtle mobile insight glass depth without opaque card fills", () => {
    const { container } = renderHomeView();

    const mobileCards = container.querySelector(".flex.flex-col.gap-3\\.5.max-sm\\:gap-4");
    const insightCard = mobileCards?.querySelector(".max-sm\\:backdrop-blur-lg");
    const highlight = mobileCards?.querySelector(".from-white\\/\\[0\\.05\\]");

    expect(insightCard).toBeTruthy();
    expect(highlight).toBeTruthy();
    expect(insightCard?.className).not.toContain("bg-karl-navy");
  });

  it("renders Future Outlook on mobile and desktop layouts", async () => {
    renderHomeView();

    const mobileFutureOutlookLabels = await screen.findAllByText("Future Outlook");
    expect(mobileFutureOutlookLabels.length).toBeGreaterThanOrEqual(1);

    cleanup();
    useMinWidthMock.mockReturnValue(true);
    renderHomeView();

    const desktopFutureOutlookLabels = await screen.findAllByText("Future Outlook");
    expect(desktopFutureOutlookLabels.length).toBeGreaterThanOrEqual(1);
  });

  it("places desktop Future Outlook below Best Right Now", async () => {
    useMinWidthMock.mockReturnValue(true);
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

    const desktopSection = container.querySelector(".mt-5.flex.flex-col.gap-5");
    const children = Array.from(desktopSection?.children ?? []);
    const bestRightNowIndex = children.findIndex((child) =>
      child.classList.contains("grid"),
    );
    const futureOutlookIndex = children.findIndex((child) =>
      child.textContent?.includes("Future Outlook"),
    );

    expect(bestRightNowIndex).toBeGreaterThanOrEqual(0);
    expect(futureOutlookIndex).toBeGreaterThanOrEqual(0);
    expect(bestRightNowIndex).toBeLessThan(futureOutlookIndex);
  });

  it("uses plain gold score text on mobile Best Right Now cards", async () => {
    const { container } = renderHomeView();

    await screen.findAllByText("Best Right Now");

    const mobileCards = container.querySelector(".flex.flex-col.gap-3\\.5.max-sm\\:gap-4");
    expect(mobileCards?.querySelector(".rounded-full.border.border-karl-gold")).toBeNull();
    expect(mobileCards?.querySelector(".text-\\[1\\.75rem\\].text-karl-gold")).toBeTruthy();
  });

  it("uses balanced phone portrait metric tiles without oversized sizing", async () => {
    const { container } = renderHomeView();

    await screen.findByText("Fog Coverage");

    const dashboard = container.querySelector('[aria-label="Bay Area conditions dashboard"]');
    expect(dashboard?.className).toContain("max-sm:gap-3");

    const metricSurfaces = container.querySelectorAll(".max-sm\\:min-h-\\[9\\.25rem\\]");
    expect(metricSurfaces.length).toBe(4);
    expect(container.querySelector(".max-sm\\:text-\\[1\\.95rem\\]")).toBeTruthy();
    expect(container.querySelector(".max-sm\\:min-h-\\[8rem\\]")).toBeNull();
  });

  it("adds phone portrait spacing between mobile insight cards", () => {
    const { container } = renderHomeView();

    const mobileStack = container.querySelector(".max-sm\\:gap-4");
    expect(mobileStack).toBeTruthy();
    expect(mobileStack?.className).toContain("max-sm:mt-5");
  });

  it("avoids stacking duplicate desktop Home sections that inflate scroll height", () => {
    useMinWidthMock.mockReturnValue(false);
    const { container } = renderHomeView();

    expect(container.querySelectorAll(".mt-5.flex.flex-col.gap-5")).toHaveLength(0);
    expect(container.querySelector(".absolute.inset-x-0.-top-20.bottom-0")).toBeNull();
  });
});
