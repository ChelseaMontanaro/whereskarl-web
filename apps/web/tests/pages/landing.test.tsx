// @vitest-environment happy-dom

import { cleanup, render, screen, within } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import HomePage from "@/app/page";
import { HERO_MAP_SCREEN_SCALE, MARKETING_SCREENSHOTS } from "@/lib/site/marketingAssets";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: ReactNode;
  }) => createElement("a", { href, ...props }, children),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

describe("marketing landing page", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the approved section copy and screenshot roles", () => {
    render(createElement(HomePage));

    expect(
      screen.getByRole("heading", { level: 1, name: "Find the sun. Know where Karl is." }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/where skies are clearing, and where to go next/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Track Karl" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Find Clear Skies" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Explore the Bay" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Save Favorites" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "A few miles can make all the difference." }),
    ).toBeInTheDocument();
    expect(screen.getByText(/current conditions, fog coverage, air quality/i)).toBeInTheDocument();
    expect(screen.queryByText(/real-time conditions/i)).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "See conditions across the Bay." })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Save your favorite spots." })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Different skies. A brighter day." }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Where's Karl for iPhone" })).not.toBeInTheDocument();
    expect(screen.queryByText("See the Bay Area more clearly.")).not.toBeInTheDocument();
    expect(document.getElementById("about")).toBeTruthy();

    const mapOverviews = screen.getAllByAltText("Where's Karl map overview");
    expect(mapOverviews.map((image) => image.getAttribute("src"))).toEqual([
      MARKETING_SCREENSHOTS.heroMap,
    ]);
    expect(mapOverviews[0]?.getAttribute("style")).toContain(
      `scale(${HERO_MAP_SCREEN_SCALE})`,
    );
    expect(mapOverviews[0]?.parentElement?.className).toContain("overflow-hidden");
    for (const image of [
      screen.getByAltText("Where's Karl home overview"),
      screen.getByAltText("Where's Karl Mill Valley location details"),
      screen.getByAltText("Where's Karl Favorites"),
    ]) {
      expect(image.getAttribute("style")).toBeNull();
      expect(image.parentElement?.className).not.toContain("overflow-hidden");
    }
    expect(screen.getByAltText("Where's Karl home overview")).toHaveAttribute(
      "src",
      MARKETING_SCREENSHOTS.homeOverview,
    );
    expect(document.body.innerHTML).not.toContain(MARKETING_SCREENSHOTS.middleMap);
    expect(screen.getByAltText("Where's Karl Mill Valley location details")).toHaveAttribute(
      "src",
      MARKETING_SCREENSHOTS.millValley,
    );
    expect(screen.getByAltText("Where's Karl Favorites")).toHaveAttribute(
      "src",
      MARKETING_SCREENSHOTS.favorites,
    );

    const siteNav = screen.getByRole("navigation", { name: "Site" });
    expect(within(siteNav).getByRole("link", { name: "About" })).toHaveAttribute(
      "href",
      "/#about",
    );
    expect(within(siteNav).getByRole("link", { name: "Privacy" })).toHaveAttribute(
      "href",
      "/privacy",
    );
    expect(within(siteNav).getByRole("link", { name: "Support" })).toHaveAttribute(
      "href",
      "/support",
    );
    expect(within(siteNav).queryByRole("link", { name: "Map" })).not.toBeInTheDocument();
    expect(screen.getAllByLabelText("Download on the App Store. Listing coming soon.").length).toBeGreaterThan(0);
    for (const badge of screen.getAllByLabelText("Download on the App Store. Listing coming soon.")) {
      expect(badge.tagName).not.toBe("A");
      expect(badge.getAttribute("href")).toBeNull();
    }
    expect(document.body.innerHTML).not.toMatch(/apps\.apple\.com|itunes\.apple\.com/i);
  });
});
