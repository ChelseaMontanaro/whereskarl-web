// @vitest-environment happy-dom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MapRegionChips } from "@/components/map/MapRegionChips";
import { BAY_AREA_PRODUCT_REGIONS } from "@/lib/map/config";

describe("MapRegionChips", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders exactly the four visible product regions", () => {
    render(
      <MapRegionChips selectedRegionId={null} onSelectRegion={vi.fn()} />,
    );

    for (const region of BAY_AREA_PRODUCT_REGIONS) {
      expect(
        screen.getByRole("button", { name: region.name }),
      ).toBeInTheDocument();
    }

    expect(screen.getAllByRole("button")).toHaveLength(4);
    expect(screen.queryByRole("button", { name: "Peninsula" })).not.toBeInTheDocument();
  });
});
