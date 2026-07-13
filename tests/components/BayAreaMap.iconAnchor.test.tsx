// @vitest-environment happy-dom

import "../mocks/maplibre-gl";

import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { BayAreaMap } from "@/components/map/BayAreaMap";
import type { MapMarkerLocation } from "@/lib/map/markers";
import { getPhonePortraitMarkerLabelOffset } from "@/lib/map/phonePortraitMapPresentation";

/**
 * Verifies the phone-portrait marker architecture:
 *   - the weather icon is anchored on the coordinate (MapLibre marker offset is
 *     [0,0]; the per-location declutter offset is NOT passed to MapLibre),
 *   - the per-location offset is applied only to the label/score meta group,
 *   - collision detection uses the rendered label/score group position.
 *
 * Pixel-exact icon centering is verified separately at a real 390x844 viewport;
 * happy-dom cannot lay out the map, so these tests assert the wiring instead.
 */
const phoneLocation = (
  id: string,
  name: string,
  extra?: Partial<MapMarkerLocation>,
): MapMarkerLocation => ({
  id,
  name,
  latitude: 37.77,
  longitude: -122.42,
  sunshineScore: 70,
  fogScore: 20,
  status: "Clear",
  ...extra,
});

const defaultProps = {
  mapStyle: "standard" as const,
  fogLayerEnabled: false,
  onMapStyleChange: vi.fn(),
  onFogLayerChange: vi.fn(),
};

function renderPhonePortrait(locations: MapMarkerLocation[]) {
  return render(
    <BayAreaMap
      locations={locations}
      selectedLocationId={null}
      selectedRegionId="san-francisco"
      onSelectLocation={vi.fn()}
      {...defaultProps}
      layout="immersive"
      immersiveOverlayProfile="phone-portrait"
    />,
  );
}

function root(id: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(
    `.karl-universal-map-marker-root[data-location-id="${id}"]`,
  );
}

describe("BayAreaMap phone-portrait icon anchoring", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = "";
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = "";
  });

  it("never passes the per-location declutter offset to the MapLibre marker (icon stays on coordinate)", async () => {
    // Includes a non-zero-offset location (tiburon [46,-30]) and a zero-offset
    // location (oakland). Both must anchor the icon with a [0,0] marker offset.
    renderPhonePortrait([
      phoneLocation("tiburon", "Tiburon"),
      phoneLocation("oakland", "Oakland"),
    ]);

    await waitFor(() => {
      expect(root("oakland")).not.toBeNull();
    });

    for (const id of ["tiburon", "oakland"]) {
      const applied = JSON.parse(root(id)!.dataset.markerOffset ?? "null");
      expect(applied, `marker offset for ${id}`).toEqual([0, 0]);
    }
  });

  it("applies the per-location offset to the label/score meta group only, not the icon", async () => {
    renderPhonePortrait([
      phoneLocation("tiburon", "Tiburon"),
      phoneLocation("oakland", "Oakland"),
    ]);

    await waitFor(() => {
      expect(root("tiburon")).not.toBeNull();
    });

    // Non-zero location: meta carries the canonical offset; icon has no
    // per-location transform (only the selected-scale CSS variable).
    const tiburonMeta = root("tiburon")!.querySelector<HTMLElement>(
      ".karl-universal-map-marker__meta",
    )!;
    const tiburonIcon = root("tiburon")!.querySelector<HTMLElement>(
      ".karl-universal-map-marker",
    )!;
    const [tx, ty] = getPhonePortraitMarkerLabelOffset("tiburon");
    expect([tx, ty]).toEqual([46, -30]);
    expect(tiburonMeta.dataset.labelOffsetX).toBe("46");
    expect(tiburonMeta.dataset.labelOffsetY).toBe("-30");
    expect(tiburonMeta.style.transform).toContain("46px");
    expect(tiburonMeta.style.transform).toContain("-30px");
    expect(tiburonIcon.style.transform).toBe("");

    // Zero-offset location: meta offset is a no-op (stays centered below icon).
    const oaklandMeta = root("oakland")!.querySelector<HTMLElement>(
      ".karl-universal-map-marker__meta",
    )!;
    expect(oaklandMeta.dataset.labelOffsetX).toBe("0");
    expect(oaklandMeta.dataset.labelOffsetY).toBe("0");
    expect(oaklandMeta.style.transform).toBe("translate(calc(-50% + 0px), 0px)");
  });

  it("hides the lower-priority marker when the rendered label/score groups collide", async () => {
    // Position the label/score groups via getBoundingClientRect: san-francisco
    // (priority 0) and berkeley (priority 1) overlap; novato is far away.
    const metaCenters: Record<string, { x: number; y: number }> = {
      "san-francisco": { x: 120, y: 110 },
      berkeley: { x: 130, y: 120 },
      novato: { x: 400, y: 400 },
    };

    const rectSpy = vi
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(function getBoundingClientRect(this: HTMLElement) {
        const empty = { left: 0, top: 0, width: 0, height: 0, right: 0, bottom: 0, x: 0, y: 0 };
        if (!this.classList.contains("karl-universal-map-marker__meta")) {
          return { ...empty, toJSON: () => empty } as DOMRect;
        }
        const host = this.closest<HTMLElement>(
          ".karl-universal-map-marker-root",
        );
        const c = metaCenters[host?.dataset.locationId ?? ""];
        if (!c) {
          return { ...empty, toJSON: () => empty } as DOMRect;
        }
        const r = { left: c.x - 20, top: c.y - 10, width: 40, height: 20, right: c.x + 20, bottom: c.y + 10, x: c.x - 20, y: c.y - 10 };
        return { ...r, toJSON: () => r } as DOMRect;
      });

    try {
      renderPhonePortrait([
        phoneLocation("san-francisco", "San Francisco"),
        phoneLocation("berkeley", "Berkeley"),
        phoneLocation("novato", "Novato"),
      ]);

      await waitFor(() => {
        expect(root("novato")).not.toBeNull();
      });

      expect(root("san-francisco")!.style.display).not.toBe("none");
      expect(root("berkeley")!.style.display).toBe("none");
      expect(root("novato")!.style.display).not.toBe("none");
    } finally {
      rectSpy.mockRestore();
    }
  });
});
