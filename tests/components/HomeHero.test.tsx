// @vitest-environment happy-dom

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { HomeHero } from "@/components/home/HomeHero";
import { resolveHeroPresentation } from "@/lib/home/heroPresentation";
import { karlIntelligenceResponseSchema } from "@/lib/schemas/intelligence";

const FIXTURES_DIR = join(process.cwd(), "tests/fixtures");
const fallbackPresentation = resolveHeroPresentation(null);

const heroDefaults = {
  clearSkiesLocationId: null as string | null,
  isFindingClearSkies: false,
};

describe("HomeHero", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the brand lockup and loading hero copy", () => {
    render(
      <HomeHero
        {...heroDefaults}
        presentation={fallbackPresentation}
        headline="Reading Karl intelligence"
        subheadline="Checking conditions"
        confidenceText={null}
        isLoading
        isFindingClearSkies
      />,
    );

    expect(screen.getByText("Where's Karl?")).toBeInTheDocument();
    expect(screen.getByText("Track Karl across the Bay")).toBeInTheDocument();
    expect(screen.getByText("Finding clear skies…")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Reading Karl intelligence",
    );
  });

  it("uses remote hero alt text and loaded position badge", () => {
    const fixture = karlIntelligenceResponseSchema.parse(
      JSON.parse(
        readFileSync(
          join(FIXTURES_DIR, "karl-intelligence-mill-valley.json"),
          "utf8",
        ),
      ),
    );
    const presentation = resolveHeroPresentation(fixture.heroImagery);

    render(
      <HomeHero
        {...heroDefaults}
        presentation={presentation}
        headline="Karl is lingering over Mill Valley."
        subheadline="Fog is strongest near the shoreline right now."
        confidenceText="High confidence"
        isLoading={false}
        clearSkiesLocationId="mill-valley"
      />,
    );

    expect(
      screen.getByAltText(fixture.heroImagery.altText ?? ""),
    ).toBeInTheDocument();
    expect(screen.getByText("Karl's current position")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Find Clear Skies" })).toHaveAttribute(
      "href",
      "/map?location=mill-valley",
    );
  });

  it("falls back to gradient when imageUrl is unavailable", () => {
    render(
      <HomeHero
        {...heroDefaults}
        presentation={fallbackPresentation}
        headline="Karl is hanging offshore."
        subheadline="Karl is lighter across most of the Bay."
        confidenceText={null}
        isLoading={false}
      />,
    );

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Karl is hanging offshore.",
    );
  });
});
