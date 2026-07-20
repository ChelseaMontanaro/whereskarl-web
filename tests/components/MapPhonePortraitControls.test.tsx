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
    const scrollTo = vi.fn();
    Object.defineProperty(HTMLElement.prototype, "scrollTo", {
      configurable: true,
      value: scrollTo,
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

    expect(scrollTo).toHaveBeenCalled();
  });

  it("replaces the phone portrait title with an interactive canonical search bar", () => {
    render(
      <MapPhonePortraitControls
        selectedRegionId={null}
        onSelectRegion={vi.fn()}
        isPhonePortrait
        locations={[
          { id: "tiburon", name: "Tiburon" },
          { id: "sausalito", name: "Sausalito" },
        ]}
        onSelectLocation={vi.fn()}
        onClearSelectedLocation={vi.fn()}
      />,
    );

    const searchBar = screen.getByTestId("map-phone-portrait-search-bar");
    expect(searchBar).toBeInTheDocument();
    expect(
      screen.getByRole("combobox", { name: "Search locations" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Karl Around the Bay" }),
    ).not.toBeInTheDocument();
    expect(searchBar.className).not.toContain("pointer-events-none");
  });

  it("filters canonical locations and selects by id", () => {
    const onSelectLocation = vi.fn();

    render(
      <MapPhonePortraitControls
        selectedRegionId={null}
        onSelectRegion={vi.fn()}
        isPhonePortrait
        locations={[
          { id: "half-moon-bay", name: "Half Moon Bay" },
          { id: "santa-rosa", name: "Santa Rosa" },
          { id: "sausalito", name: "Sausalito" },
        ]}
        onSelectLocation={onSelectLocation}
        onClearSelectedLocation={vi.fn()}
      />,
    );

    const input = screen.getByRole("combobox", { name: "Search locations" });
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "moon" } });

    fireEvent.click(screen.getByRole("option", { name: "Half Moon Bay" }));
    expect(onSelectLocation).toHaveBeenCalledWith("half-moon-bay");
    expect(input).toHaveValue("Half Moon Bay");
  });

  it("clearing search calls the existing reset handler", () => {
    const onClearSelectedLocation = vi.fn();

    render(
      <MapPhonePortraitControls
        selectedRegionId={null}
        onSelectRegion={vi.fn()}
        isPhonePortrait
        locations={[{ id: "tiburon", name: "Tiburon" }]}
        onSelectLocation={vi.fn()}
        onClearSelectedLocation={onClearSelectedLocation}
      />,
    );

    const input = screen.getByRole("combobox", { name: "Search locations" });
    fireEvent.change(input, { target: { value: "Tiburon" } });
    fireEvent.click(screen.getByRole("button", { name: "Clear search" }));

    expect(onClearSelectedLocation).toHaveBeenCalledTimes(1);
    expect(input).toHaveValue("");
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
