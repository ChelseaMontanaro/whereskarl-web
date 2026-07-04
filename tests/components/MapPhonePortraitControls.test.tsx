// @vitest-environment happy-dom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MapPhonePortraitControls } from "@/components/map/MapPhonePortraitControls";

describe("MapPhonePortraitControls", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders a compact header without the descriptive subtitle", () => {
    const { container } = render(
      <MapPhonePortraitControls
        selectedRegionId={null}
        onSelectRegion={vi.fn()}
        activeIntensity={null}
        onSelectIntensity={vi.fn()}
      />,
    );

    expect(screen.getByText("Karl around the Bay")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Bay Area conditions" }))
      .toBeInTheDocument();
    expect(
      screen.queryByText("Explore live fog & clear skies around the Bay."),
    ).not.toBeInTheDocument();
    expect(container.querySelector(".rounded-2xl.border")).toBeNull();
  });

  it("renders compact region pills and a visible 2x2 fog intensity grid", () => {
    const { container } = render(
      <MapPhonePortraitControls
        selectedRegionId="san-francisco"
        onSelectRegion={vi.fn()}
        activeIntensity={null}
        onSelectIntensity={vi.fn()}
      />,
    );

    for (const label of ["SF", "North Bay", "East Bay", "South Bay"]) {
      expect(screen.getByRole("button", { name: label })).toBeInTheDocument();
    }

    expect(screen.getByRole("button", { name: "Karl Territory" })).toBeInTheDocument();
    expect(container.querySelector(".overflow-x-auto")).toBeNull();
    expect(container.querySelector(".grid.grid-cols-2")).toBeTruthy();
  });

  it("keeps region and fog intensity interactions wired", () => {
    const onSelectRegion = vi.fn();
    const onSelectIntensity = vi.fn();

    render(
      <MapPhonePortraitControls
        selectedRegionId={null}
        onSelectRegion={onSelectRegion}
        activeIntensity={null}
        onSelectIntensity={onSelectIntensity}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "East Bay" }));
    fireEvent.click(screen.getByRole("button", { name: "Foggy" }));

    expect(onSelectRegion).toHaveBeenCalledWith("east-bay");
    expect(onSelectIntensity).toHaveBeenCalledWith("foggy");
  });
});
