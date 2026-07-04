// @vitest-environment happy-dom

import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { BestRightNowSection } from "@/components/home/BestRightNowSection";
import type { BestRightNowItem } from "@/lib/home/weatherDisplay";

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
});
