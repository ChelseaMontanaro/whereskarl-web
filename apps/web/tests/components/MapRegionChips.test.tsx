// @vitest-environment happy-dom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MapRegionChips } from "@/components/map/MapRegionChips";
import { BAY_AREA_PRODUCT_REGIONS } from "@/lib/map/config";

describe("MapRegionChips", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders all visible product regions", () => {
    render(
      <MapRegionChips selectedRegionId={null} onSelectRegion={vi.fn()} />,
    );

    for (const region of BAY_AREA_PRODUCT_REGIONS) {
      expect(
        screen.getByRole("button", { name: region.chipLabel }),
      ).toBeInTheDocument();
    }

    expect(screen.getAllByRole("button")).toHaveLength(5);
    expect(screen.getByRole("button", { name: "Peninsula" })).toBeInTheDocument();
  });

  it("uses a consistent 40px touch floor on every chip", () => {
    render(
      <MapRegionChips selectedRegionId={null} onSelectRegion={vi.fn()} />,
    );

    for (const button of screen.getAllByRole("button")) {
      expect(button.className).toContain("min-h-10");
      expect(button.className).toContain("px-3");
    }
  });

  it("keeps phone and panel chips on one filled-gold selected language", () => {
    const { rerender } = render(
      <MapRegionChips
        selectedRegionId="san-francisco"
        onSelectRegion={vi.fn()}
        variant="phone"
      />,
    );

    expect(screen.getByRole("button", { name: "SF" }).className).toContain(
      "bg-karl-gold",
    );

    rerender(
      <MapRegionChips
        selectedRegionId="san-francisco"
        onSelectRegion={vi.fn()}
        variant="panel"
      />,
    );

    expect(screen.getByRole("button", { name: "SF" }).className).toContain(
      "bg-karl-gold",
    );
    expect(screen.getByRole("button", { name: "SF" }).className).not.toContain(
      "bg-karl-gold/14",
    );
  });
});
