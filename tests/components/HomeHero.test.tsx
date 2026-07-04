// @vitest-environment happy-dom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { HomeHero } from "@/components/home/HomeHero";

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

  it("uses loaded position badge and clear skies CTA", () => {
    const { container } = render(
      <HomeHero
        {...heroDefaults}
        headline="Karl is lingering over Mill Valley."
        subheadline="Fog is strongest near the shoreline right now."
        confidenceText="High confidence"
        isLoading={false}
        clearSkiesLocationId="mill-valley"
      />,
    );

    expect(screen.getByText("Karl's current position")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Find Clear Skies" })).toHaveAttribute(
      "href",
      "/map?location=mill-valley",
    );
    expect(container.querySelector(".mt-6")).toBeInTheDocument();
    expect(container.querySelector(".pb-16")).toBeInTheDocument();
  });

  it("does not render a duplicate inline hero image", () => {
    render(
      <HomeHero
        {...heroDefaults}
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
