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

  it("renders compact region pills without fog controls", () => {
    render(
      <MapPhonePortraitControls
        selectedRegionId="san-francisco"
        onSelectRegion={vi.fn()}
      />,
    );

    for (const label of ["SF", "North Bay", "East Bay", "South Bay", "Peninsula"]) {
      expect(screen.getByRole("button", { name: label })).toBeInTheDocument();
    }

    expect(screen.queryByRole("button", { name: "Foggy" })).not.toBeInTheDocument();
  });

  it("scrolls the selected phone portrait chip into view", () => {
    const scrollIntoView = vi.fn();
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: scrollIntoView,
    });
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: vi.fn().mockReturnValue({ matches: false }),
    });

    render(
      <MapPhonePortraitControls
        selectedRegionId="peninsula"
        onSelectRegion={vi.fn()}
        isPhonePortrait
      />,
    );

    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  });

  it("keeps region chip interactions wired", () => {
    const onSelectRegion = vi.fn();

    render(
      <MapPhonePortraitControls
        selectedRegionId={null}
        onSelectRegion={onSelectRegion}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "East Bay" }));

    expect(onSelectRegion).toHaveBeenCalledWith("east-bay");
  });
});
