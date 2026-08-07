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
});
