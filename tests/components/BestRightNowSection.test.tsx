// @vitest-environment happy-dom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { BestRightNowSection } from "@/components/home/BestRightNowSection";
import type { BestRightNowItem } from "@/lib/home/weatherDisplay";
import { DEGRADED_BEST_RIGHT_NOW_LABEL } from "@/lib/weather/dataStatus";

const items: BestRightNowItem[] = [
  {
    locationId: "tiburon",
    locationName: "Tiburon",
    detail: "Clear skies holding.",
    score: 82,
    rank: 1,
  },
  {
    locationId: "oakland",
    locationName: "Oakland",
    detail: "Mostly clear near Oakland.",
    score: 99,
    rank: 2,
  },
  {
    locationId: "san-jose",
    locationName: "San Jose",
    detail: "San Jose is one of the clearest spots right now.",
    score: 76,
    rank: 3,
  },
];

describe("BestRightNowSection", () => {
  afterEach(() => {
    cleanup();
  });

  it("uses a moon icon at night on desktop cards", () => {
    const { container } = render(
      <BestRightNowSection
        items={items}
        isNightPresentation
        layout="desktop"
      />,
    );

    const tiburonCard = screen.getByText("Tiburon").closest(".rounded-2xl");
    expect(
      tiburonCard?.querySelector('svg path[fill="#8CB8D8"]'),
    ).toBeTruthy();
    expect(container.querySelector('a[href*="/map"]')).toBeNull();
  });

  it("uses a sun icon during the day on desktop cards", () => {
    render(
      <BestRightNowSection
        items={items}
        isNightPresentation={false}
        layout="desktop"
      />,
    );

    const tiburonCard = screen.getByText("Tiburon").closest(".rounded-2xl");
    expect(tiburonCard?.querySelector("svg circle")).toBeTruthy();
    expect(
      tiburonCard?.querySelector('svg path[fill="#8CB8D8"]'),
    ).toBeNull();
  });

  it("shows fallback text on degraded Best Right Now cards", () => {
    const degradedItems: BestRightNowItem[] = [
      {
        ...items[0],
        isDegraded: true,
      },
    ];

    render(
      <BestRightNowSection
        items={degradedItems}
        isNightPresentation={false}
        layout="desktop"
      />,
    );

    expect(screen.getByText(DEGRADED_BEST_RIGHT_NOW_LABEL)).toBeInTheDocument();
  });

  it("keeps live Best Right Now cards unchanged", () => {
    render(
      <BestRightNowSection
        items={items}
        isNightPresentation={false}
        layout="desktop"
      />,
    );

    expect(screen.getByText("Tiburon")).toBeInTheDocument();
    expect(screen.getByText("Clear skies holding.")).toBeInTheDocument();
    expect(
      screen.queryByText(DEGRADED_BEST_RIGHT_NOW_LABEL),
    ).not.toBeInTheDocument();
  });

  it("uses plain gold score text on mobile cards", () => {
    const { container } = render(
      <BestRightNowSection
        items={items}
        isNightPresentation={false}
        layout="mobile"
      />,
    );

    expect(
      container.querySelector(".rounded-full.border.border-karl-gold\\/28.bg-black\\/28"),
    ).toBeNull();
    expect(container.querySelector(".text-\\[1\\.75rem\\].text-karl-gold")).toBeTruthy();
  });

  it("uses gold sun icons on mobile Best Right Now rows", () => {
    const { container } = render(
      <BestRightNowSection
        items={items}
        isNightPresentation={false}
        layout="mobile"
      />,
    );

    const sunIcons = container.querySelectorAll("ul li svg.text-karl-gold");
    expect(sunIcons.length).toBe(3);
  });

  it("adds vertical spacing between mobile Best Right Now rows without dividers", () => {
    const { container } = render(
      <BestRightNowSection
        items={items}
        isNightPresentation={false}
        layout="mobile"
      />,
    );

    const list = container.querySelector("ul");
    expect(list?.className).toContain("space-y-2");

    const listItems = container.querySelectorAll("ul li");
    for (const listItem of listItems) {
      expect(listItem.className).not.toContain("border-t");
    }
  });

  it("renders a weather icon for every mobile Best Right Now list item", () => {
    const { container } = render(
      <BestRightNowSection
        items={items}
        isNightPresentation={false}
        layout="mobile"
      />,
    );

    const listItems = container.querySelectorAll("ul li");
    const plainIconFrames = container.querySelectorAll(
      'ul li [data-testid="insight-plain-icon"]',
    );

    expect(listItems.length).toBe(3);
    expect(plainIconFrames.length).toBe(3);
    expect(container.querySelectorAll("ul li svg").length).toBe(3);
    expect(
      container.querySelectorAll('ul li [data-testid="insight-plain-icon"].rounded-full'),
    ).toHaveLength(0);
  });

  it("does not render circular icon wrappers on mobile Best Right Now rows", () => {
    const { container } = render(
      <BestRightNowSection
        items={items}
        isNightPresentation={false}
        layout="mobile"
      />,
    );

    const iconWrappers = container.querySelectorAll(
      'ul li [data-testid="insight-plain-icon"]',
    );

    for (const iconWrapper of iconWrappers) {
      expect(iconWrapper.className).not.toContain("rounded-full");
      expect(iconWrapper.className).not.toContain("border");
      expect(iconWrapper.className).not.toContain("bg-black");
    }
  });

  it("shows fog, wind, and temperature metadata when weather data is available", () => {
    const itemsWithWeather: BestRightNowItem[] = [
      {
        ...items[0],
        weatherMetadata: ["Fog: 26%", "Wind: W 7 mph", "72°F"],
      },
    ];

    render(
      <BestRightNowSection
        items={itemsWithWeather}
        isNightPresentation={false}
        layout="mobile"
      />,
    );

    expect(screen.getByText("Fog: 26% • Wind: W 7 mph • 72°F")).toBeInTheDocument();
  });

  it("does not render Best Right Now location names as map links or anchors", () => {
    const { container } = render(
      <BestRightNowSection
        items={items}
        isNightPresentation={false}
        layout="mobile"
      />,
    );

    expect(screen.getByText("San Jose")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /San Jose/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /View .* on map/i })).not.toBeInTheDocument();
    expect(container.querySelector('a[href*="/map"]')).toBeNull();
    expect(container.querySelector('a[href*="google"]')).toBeNull();

    const sanJoseName = screen.getByText("San Jose");
    expect(sanJoseName.tagName).toBe("P");
    expect(sanJoseName.closest("a")).toBeNull();
  });

  it("disables iOS location auto-linking on Best Right Now text rows", () => {
    const { container } = render(
      <BestRightNowSection
        items={items}
        isNightPresentation={false}
        layout="mobile"
      />,
    );

    const autoLinkGuard = container.querySelector('[x-apple-data-detectors="false"]');
    expect(autoLinkGuard).toBeTruthy();
    expect(autoLinkGuard?.contains(screen.getByText("San Jose"))).toBe(true);
  });
});
