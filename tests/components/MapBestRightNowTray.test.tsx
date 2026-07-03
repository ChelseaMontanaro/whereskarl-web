// @vitest-environment happy-dom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MapBestRightNowTray } from "@/components/map/MapBestRightNowTray";
import type { BestRightNowItem } from "@/lib/home/weatherDisplay";

describe("MapBestRightNowTray", () => {
  afterEach(() => {
    cleanup();
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
});
