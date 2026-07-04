// @vitest-environment happy-dom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MapRegionChips } from "@/components/map/MapRegionChips";
import { BAY_AREA_PRODUCT_REGIONS } from "@/lib/map/config";

describe("MapRegionChips", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders all Bay Area product regions including Peninsula", () => {
    render(
      <MapRegionChips selectedRegionId={null} onSelectRegion={vi.fn()} />,
    );

    for (const region of BAY_AREA_PRODUCT_REGIONS) {
      expect(
        screen.getByRole("button", { name: region.name }),
      ).toBeInTheDocument();
    }

    expect(screen.getAllByRole("button")).toHaveLength(5);
  });
});
