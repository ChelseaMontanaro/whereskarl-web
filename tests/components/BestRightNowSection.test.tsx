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

    expect(container.querySelector(".rounded-full.border")).toBeNull();
    expect(container.querySelector(".text-xl.font-light.text-karl-gold")).toBeTruthy();
  });
});
