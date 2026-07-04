// @vitest-environment happy-dom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MapFogLegend } from "@/components/map/MapFogLegend";
import { toggleIntensityFilter } from "@/lib/map/intensityFilter";
import type { FogIntensity } from "@/lib/map/conditions";

function ToggleableFogLegend() {
  const [activeIntensity, setActiveIntensity] = useState<FogIntensity | null>(
    null,
  );

  return (
    <>
      <MapFogLegend
        layout="desktop-stack"
        activeIntensity={activeIntensity}
        onSelectIntensity={(intensity) =>
          setActiveIntensity((current) => toggleIntensityFilter(current, intensity))
        }
      />
      <p data-testid="active-intensity">{activeIntensity ?? "none"}</p>
    </>
  );
}

describe("MapFogLegend", () => {
  afterEach(() => {
    cleanup();
  });

  it("filters intensity when a desktop legend item is clicked", () => {
    const onSelectIntensity = vi.fn();

    render(
      <MapFogLegend
        layout="desktop-stack"
        onSelectIntensity={onSelectIntensity}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Clear" }));

    expect(onSelectIntensity).toHaveBeenCalledWith("clear");
  });

  it("toggles the same intensity off when clicked again", () => {
    render(<ToggleableFogLegend />);

    const clearButton = screen.getByRole("button", { name: "Clear" });

    fireEvent.click(clearButton);
    expect(screen.getByTestId("active-intensity")).toHaveTextContent("clear");
    expect(clearButton).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(clearButton);
    expect(screen.getByTestId("active-intensity")).toHaveTextContent("none");
    expect(clearButton).toHaveAttribute("aria-pressed", "false");
  });

  it("toggles Light Fog, Foggy, and Karl Territory on and off", () => {
    render(<ToggleableFogLegend />);

    for (const label of ["Light Fog", "Foggy", "Karl Territory"]) {
      const button = screen.getByRole("button", { name: label });

      fireEvent.click(button);
      expect(button).toHaveAttribute("aria-pressed", "true");

      fireEvent.click(button);
      expect(button).toHaveAttribute("aria-pressed", "false");
      expect(screen.getByTestId("active-intensity")).toHaveTextContent("none");
    }
  });

  it("does not show a separate reset control", () => {
    render(
      <MapFogLegend
        layout="desktop-stack"
        activeIntensity="foggy"
        onSelectIntensity={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole("button", { name: "Clear intensity filter" }),
    ).not.toBeInTheDocument();
  });

  it("renders all four immersive legend filters in a grid without horizontal scrolling", () => {
    const { container } = render(
      <MapFogLegend
        layout="immersive-strip"
        onSelectIntensity={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Karl Territory" })).toBeInTheDocument();
    expect(container.querySelector(".overflow-x-auto")).toBeNull();
    expect(container.querySelector(".grid.grid-cols-2")).toBeTruthy();
  });

  it("renders the phone-compact fog legend without a glass card wrapper", () => {
    const { container } = render(
      <MapFogLegend
        layout="phone-compact"
        onSelectIntensity={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Karl Territory" })).toBeInTheDocument();
    expect(container.querySelector(".rounded-2xl.border")).toBeNull();
    expect(container.querySelector(".grid.grid-cols-2")).toBeTruthy();
  });
});
