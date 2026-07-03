// @vitest-environment happy-dom

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { IntelligenceNarrativeCard } from "@/components/home/IntelligenceNarrativeCard";
import type { KarlIntelligenceResponse } from "@/lib/schemas/intelligence";

const FIXTURES_DIR = join(process.cwd(), "tests/fixtures");

function readFixture<T>(filename: string): T {
  return JSON.parse(readFileSync(join(FIXTURES_DIR, filename), "utf8")) as T;
}

describe("IntelligenceNarrativeCard", () => {
  afterEach(() => {
    cleanup();
  });

  it("links Karl's Read to the map when focusLocationId is available", () => {
    const intelligence = readFixture<KarlIntelligenceResponse>(
      "karl-intelligence-mill-valley.json",
    );

    render(
      <IntelligenceNarrativeCard
        intelligence={intelligence}
        isLoading={false}
        layout="desktop"
      />,
    );

    expect(
      screen.getByRole("link", {
        name: "View Karl's read on map: Marin Headlands / Hawk Hill",
      }),
    ).toHaveAttribute("href", "/map?location=mill-valley");
  });

  it("renders resolved Karl's Read copy when presentation is provided", () => {
    const intelligence = readFixture<KarlIntelligenceResponse>(
      "karl-intelligence-mill-valley.json",
    );

    render(
      <IntelligenceNarrativeCard
        intelligence={intelligence}
        karlReadPresentation={{
          headline: intelligence.narrative.headline,
          summary:
            "Karl is shifting unevenly, with some corridors clearing while others stay gray. Tiburon has the clearest conditions nearby right now.",
        }}
        isLoading={false}
        layout="desktop"
      />,
    );

    expect(
      screen.getByText(/Tiburon has the clearest conditions nearby right now\./i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Berkeley should brighten/i)).not.toBeInTheDocument();
  });

  it("omits the chevron when Karl's Read has no map destination", () => {
    const intelligence = readFixture<KarlIntelligenceResponse>(
      "karl-intelligence-mill-valley.json",
    );
    intelligence.heroImagery = {
      ...intelligence.heroImagery,
      focusLocationId: null,
    };

    const { container } = render(
      <IntelligenceNarrativeCard
        intelligence={intelligence}
        isLoading={false}
        layout="desktop"
      />,
    );

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(container.querySelector("svg path[d='M9 6l6 6-6 6']")).toBeNull();
  });
});
