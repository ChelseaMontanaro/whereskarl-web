// @vitest-environment happy-dom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MapConditionsPanel } from "@/components/map/MapConditionsPanel";

const DYNAMIC_CURRENT_SUMMARY = "Karl is karl territory near Ocean Beach.";

describe("MapConditionsPanel", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the static regional map subtitle", () => {
    render(<MapConditionsPanel />);

    expect(
      screen.getByText("Explore live fog & sunshine across the Bay Area."),
    ).toBeInTheDocument();
    expect(screen.queryByText(DYNAMIC_CURRENT_SUMMARY)).not.toBeInTheDocument();
  });

  it("does not render live Karl status copy in the panel subtitle", () => {
    render(
      <MapConditionsPanel
        selectedRegionId="san-francisco"
        onSelectRegion={vi.fn()}
      />,
    );

    expect(screen.getByRole("heading", { name: "Bay Area conditions" }))
      .toBeInTheDocument();
    expect(screen.queryByText(/Karl is/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Ocean Beach/i)).not.toBeInTheDocument();
  });

  it("shows a loading message until conditions data is available", () => {
    render(<MapConditionsPanel isLoading />);

    expect(screen.getByText("Checking live conditions…")).toBeInTheDocument();
    expect(
      screen.queryByText("Explore live fog & sunshine across the Bay Area."),
    ).not.toBeInTheDocument();
  });

  it("keeps region chip filtering behavior unchanged", () => {
    const onSelectRegion = vi.fn();

    render(
      <MapConditionsPanel
        selectedRegionId="north-bay"
        onSelectRegion={onSelectRegion}
      />,
    );

    const northBayChip = screen.getByRole("button", { name: "North Bay" });

    expect(northBayChip).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(screen.getByRole("button", { name: "East Bay" }));

    expect(onSelectRegion).toHaveBeenCalledWith("east-bay");
  });
});
