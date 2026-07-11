// @vitest-environment happy-dom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MapBestRightNowTray } from "@/components/map/MapBestRightNowTray";
import type { BestRightNowItem } from "@/lib/home/weatherDisplay";

describe("MapBestRightNowTray", () => {
  afterEach(() => {
    cleanup();
  });

  it("marks the selected tray card without reordering items", () => {
    const onSelectLocation = vi.fn();
    const items: BestRightNowItem[] = [
      {
        locationId: "san-jose",
        locationName: "San Jose",
        detail: "Mostly clear",
        score: 90,
        rank: 1,
      },
      {
        locationId: "tiburon",
        locationName: "Tiburon",
        detail: "Mostly clear",
        score: 82,
        rank: 2,
      },
    ];

    const { rerender } = render(
      <MapBestRightNowTray
        items={items}
        selectedLocationId="tiburon"
        onSelectLocation={onSelectLocation}
      />,
    );

    expect(screen.getByRole("button", { name: "Select Tiburon on map" })).toHaveAttribute(
      "data-selected",
      "true",
    );
    expect(screen.getByRole("button", { name: "Select San Jose on map" })).toHaveAttribute(
      "data-selected",
      "false",
    );

    rerender(
      <MapBestRightNowTray
        items={items}
        selectedLocationId="san-jose"
        onSelectLocation={onSelectLocation}
      />,
    );

    expect(screen.getByRole("button", { name: "Select San Jose on map" })).toHaveAttribute(
      "data-selected",
      "true",
    );
    expect(screen.getByRole("button", { name: "Select Tiburon on map" })).toHaveAttribute(
      "data-selected",
      "false",
    );
  });

  it("selects the clicked location id instead of a stale selection", () => {
    const onSelectLocation = vi.fn();
    const items: BestRightNowItem[] = [
      {
        locationId: "san-jose",
        locationName: "San Jose",
        detail: "Mostly clear",
        score: 90,
        rank: 1,
      },
      {
        locationId: "oakland",
        locationName: "Oakland",
        detail: "Patchy fog",
        score: 72,
        rank: 2,
      },
    ];

    render(
      <MapBestRightNowTray items={items} onSelectLocation={onSelectLocation} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Select San Jose on map" }));

    expect(onSelectLocation).toHaveBeenCalledTimes(1);
    expect(onSelectLocation).toHaveBeenCalledWith("san-jose");
    expect(onSelectLocation).not.toHaveBeenCalledWith("tiburon");
  });

  it("shows one compact phone portrait card and cycles ranked locations", () => {
    const onSelectLocation = vi.fn();
    const items: BestRightNowItem[] = [
      {
        locationId: "san-jose",
        locationName: "San Jose",
        detail: "Mostly clear",
        score: 90,
        scoreLabel: "90 clear",
        rank: 1,
      },
      {
        locationId: "oakland",
        locationName: "Oakland",
        detail: "Patchy fog",
        score: 72,
        scoreLabel: "72 clear",
        rank: 2,
      },
      {
        locationId: "mountain-view",
        locationName: "Mountain View",
        detail: "Clear skies",
        score: 85,
        scoreLabel: "85 clear",
        rank: 3,
      },
    ];

    render(
      <MapBestRightNowTray
        items={items}
        onSelectLocation={onSelectLocation}
        isPhonePortrait
      />,
    );

    expect(
      screen.getByRole("button", { name: "Select San Jose on map" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Select Oakland on map" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Select Mountain View on map" }),
    ).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Show next Best Right Now location" }),
    );

    expect(
      screen.getByRole("button", { name: "Select Oakland on map" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Select San Jose on map" }),
    ).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Show next Best Right Now location" }),
    );

    expect(
      screen.getByRole("button", { name: "Select Mountain View on map" }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Show next Best Right Now location" }),
    );

    expect(
      screen.getByRole("button", { name: "Select San Jose on map" }),
    ).toBeInTheDocument();
  });

  it("keeps phone portrait location selection separate from cycling", () => {
    const onSelectLocation = vi.fn();
    const items: BestRightNowItem[] = [
      {
        locationId: "san-jose",
        locationName: "San Jose",
        detail: "Mostly clear",
        score: 90,
        rank: 1,
      },
      {
        locationId: "oakland",
        locationName: "Oakland",
        detail: "Patchy fog",
        score: 72,
        rank: 2,
      },
    ];

    render(
      <MapBestRightNowTray
        items={items}
        onSelectLocation={onSelectLocation}
        isPhonePortrait
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Show next Best Right Now location" }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Select Oakland on map" }),
    );

    expect(onSelectLocation).toHaveBeenCalledTimes(1);
    expect(onSelectLocation).toHaveBeenCalledWith("oakland");
  });
});
