// @vitest-environment happy-dom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MapFogLegend } from "@/components/map/MapFogLegend";

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
        onClearIntensity={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Clear" }));

    expect(onSelectIntensity).toHaveBeenCalledWith("clear");
  });

  it("shows a reset control when an intensity filter is active", () => {
    const onClearIntensity = vi.fn();

    render(
      <MapFogLegend
        layout="desktop-stack"
        activeIntensity="foggy"
        onSelectIntensity={vi.fn()}
        onClearIntensity={onClearIntensity}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Clear intensity filter" }));

    expect(onClearIntensity).toHaveBeenCalledTimes(1);
  });
});
