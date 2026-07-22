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
    expect(searchBar.parentElement?.className).toContain("mx-1");
    expect(
      screen.getByRole("combobox", { name: "Search locations" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Karl Around the Bay" }),
    ).not.toBeInTheDocument();
    expect(searchBar.className).not.toContain("pointer-events-none");
  });

  it("filters canonical locations by display-name prefix and selects by id", () => {
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
    fireEvent.change(input, { target: { value: "Half" } });

    fireEvent.click(screen.getByRole("option", { name: "Half Moon Bay" }));
    expect(onSelectLocation).toHaveBeenCalledWith("half-moon-bay");
    expect(input).toHaveValue("Half Moon Bay");
    // Overlay close is synchronous — no rAF/timer flush required.
    expect(
      screen.queryByTestId("map-phone-portrait-search-results"),
    ).not.toBeInTheDocument();
  });

  it("closes the search overlay synchronously before invoking selection", () => {
    const onSelectLocation = vi.fn(() => {
      expect(
        screen.queryByTestId("map-phone-portrait-search-results"),
      ).not.toBeInTheDocument();
    });

    render(
      <MapPhonePortraitControls
        selectedRegionId={null}
        onSelectRegion={vi.fn()}
        isPhonePortrait
        locations={[{ id: "napa", name: "Napa" }]}
        onSelectLocation={onSelectLocation}
        onClearSelectedLocation={vi.fn()}
      />,
    );

    const input = screen.getByRole("combobox", { name: "Search locations" });
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "Nap" } });
    expect(
      screen.getByTestId("map-phone-portrait-search-results"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("option", { name: "Napa" }));

    expect(onSelectLocation).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByTestId("map-phone-portrait-search-results"),
    ).not.toBeInTheDocument();
  });

  it("shows a compact empty-state panel on focus without listing locations", () => {
    render(
      <MapPhonePortraitControls
        selectedRegionId={null}
        onSelectRegion={vi.fn()}
        isPhonePortrait
        locations={[
          { id: "tiburon", name: "Tiburon" },
          { id: "sausalito", name: "Sausalito" },
          { id: "santa-rosa", name: "Santa Rosa" },
        ]}
        onSelectLocation={vi.fn()}
        onClearSelectedLocation={vi.fn()}
      />,
    );

    const input = screen.getByRole("combobox", { name: "Search locations" });
    fireEvent.focus(input);

    expect(
      screen.getByTestId("map-phone-portrait-search-empty"),
    ).toHaveTextContent("Start typing to search locations");
    expect(screen.queryByRole("option")).toBeNull();
    expect(screen.queryByText("Tiburon")).not.toBeInTheDocument();
    expect(screen.queryByText("Sausalito")).not.toBeInTheDocument();
  });

  it("reveals prefix results after the first non-whitespace character and restores empty state when cleared", () => {
    render(
      <MapPhonePortraitControls
        selectedRegionId={null}
        onSelectRegion={vi.fn()}
        isPhonePortrait
        locations={[
          { id: "san-francisco", name: "San Francisco" },
          { id: "santa-rosa", name: "Santa Rosa" },
          { id: "sausalito", name: "Sausalito" },
          { id: "tiburon", name: "Tiburon" },
          { id: "cupertino", name: "Cupertino" },
        ]}
        onSelectLocation={vi.fn()}
        onClearSelectedLocation={vi.fn()}
      />,
    );

    const input = screen.getByRole("combobox", { name: "Search locations" });
    fireEvent.focus(input);
    expect(screen.getByTestId("map-phone-portrait-search-empty")).toBeInTheDocument();

    fireEvent.change(input, { target: { value: " " } });
    expect(screen.getByTestId("map-phone-portrait-search-empty")).toBeInTheDocument();
    expect(screen.queryByRole("option")).toBeNull();

    fireEvent.change(input, { target: { value: "S" } });
    expect(screen.queryByTestId("map-phone-portrait-search-empty")).toBeNull();
    expect(
      screen.getAllByRole("option").map((option) => option.textContent),
    ).toEqual(["San Francisco", "Santa Rosa", "Sausalito"]);

    fireEvent.change(input, { target: { value: "Ti" } });
    expect(
      screen.getAllByRole("option").map((option) => option.textContent),
    ).toEqual(["Tiburon"]);
    expect(screen.queryByText("Cupertino")).not.toBeInTheDocument();

    fireEvent.change(input, { target: { value: "" } });
    expect(screen.getByTestId("map-phone-portrait-search-empty")).toBeInTheDocument();
    expect(screen.queryByRole("option")).toBeNull();
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

  it("selecting a result blurs the input and restores chrome before selection", () => {
    const scrollTo = vi.fn();
    window.scrollTo = scrollTo;
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: 844,
    });
    Object.defineProperty(window, "visualViewport", {
      configurable: true,
      value: {
        height: 844,
        offsetTop: 96,
        offsetLeft: 0,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
    });

    const onSelectLocation = vi.fn(() => {
      // Chrome restore (including stale-offset clear) runs before selection.
      expect(scrollTo).toHaveBeenCalled();
      expect(document.activeElement).not.toBe(
        screen.getByRole("combobox", { name: "Search locations" }),
      );
    });

    render(
      <MapPhonePortraitControls
        selectedRegionId={null}
        onSelectRegion={vi.fn()}
        isPhonePortrait
        locations={[{ id: "napa", name: "Napa" }]}
        onSelectLocation={onSelectLocation}
        onClearSelectedLocation={vi.fn()}
      />,
    );

    const input = screen.getByRole("combobox", {
      name: "Search locations",
    }) as HTMLInputElement;
    input.focus();
    fireEvent.change(input, { target: { value: "Nap" } });

    fireEvent.click(screen.getByRole("option", { name: "Napa" }));

    expect(onSelectLocation).toHaveBeenCalledWith("napa");
    expect(document.activeElement).not.toBe(input);
    expect(scrollTo).toHaveBeenCalledWith(0, 96);
    expect(scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it("blurring the search field invokes chrome restore without selecting", () => {
    const onSelectLocation = vi.fn();

    render(
      <MapPhonePortraitControls
        selectedRegionId={null}
        onSelectRegion={vi.fn()}
        isPhonePortrait
        locations={[{ id: "napa", name: "Napa" }]}
        onSelectLocation={onSelectLocation}
        onClearSelectedLocation={vi.fn()}
      />,
    );

    const input = screen.getByRole("combobox", {
      name: "Search locations",
    }) as HTMLInputElement;
    input.focus();
    fireEvent.focus(input);
    fireEvent.blur(input);

    // Settled viewport: restore is a no-op scroll, but selection must not fire.
    expect(onSelectLocation).not.toHaveBeenCalled();
    expect(document.activeElement).not.toBe(input);
  });

  it("clearing search blurs the input and calls the reset handler", () => {
    const onClearSelectedLocation = vi.fn();
    const scrollTo = vi.fn();
    window.scrollTo = scrollTo;
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: 844,
    });
    Object.defineProperty(window, "visualViewport", {
      configurable: true,
      value: {
        height: 844,
        offsetTop: 64,
        offsetLeft: 0,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
    });

    render(
      <MapPhonePortraitControls
        selectedRegionId={null}
        onSelectRegion={vi.fn()}
        isPhonePortrait
        locations={[{ id: "napa", name: "Napa" }]}
        onSelectLocation={vi.fn()}
        onClearSelectedLocation={onClearSelectedLocation}
      />,
    );

    const input = screen.getByRole("combobox", {
      name: "Search locations",
    }) as HTMLInputElement;
    input.focus();
    fireEvent.change(input, { target: { value: "Napa" } });
    fireEvent.click(screen.getByRole("button", { name: "Clear search" }));

    expect(document.activeElement).not.toBe(input);
    expect(onClearSelectedLocation).toHaveBeenCalledTimes(1);
    expect(scrollTo).toHaveBeenCalledWith(0, 64);
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
