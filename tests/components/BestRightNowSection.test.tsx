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
    locationId: "palo-alto",
    locationName: "Palo Alto",
    detail: "Mostly clear near Palo Alto.",
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

    expect(
      container.querySelector('[aria-label="View Tiburon on map"] svg path[fill="#8CB8D8"]'),
    ).toBeTruthy();
  });

  it("uses a sun icon during the day on desktop cards", () => {
    const { container } = render(
      <BestRightNowSection
        items={items}
        isNightPresentation={false}
        layout="desktop"
      />,
    );

    expect(
      container.querySelector('[aria-label="View Tiburon on map"] svg circle'),
    ).toBeTruthy();
    expect(
      container.querySelector('[aria-label="View Tiburon on map"] svg path[fill="#8CB8D8"]'),
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

  it("renders a weather icon for every mobile Best Right Now list item", () => {
    const { container } = render(
      <BestRightNowSection
        items={items}
        isNightPresentation={false}
        layout="mobile"
      />,
    );

    const listItems = container.querySelectorAll("ul li");
    const iconFrames = container.querySelectorAll("ul li .rounded-full");

    expect(listItems.length).toBe(3);
    expect(iconFrames.length).toBe(3);
    expect(container.querySelectorAll("ul li svg").length).toBe(3);
  });
});
