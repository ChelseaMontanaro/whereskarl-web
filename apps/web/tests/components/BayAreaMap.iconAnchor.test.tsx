// @vitest-environment happy-dom

import { mockMapInstances, mockSetZoom } from "../mocks/maplibre-gl";

import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { BayAreaMap } from "@/components/map/BayAreaMap";
import type { MapMarkerLocation } from "@/lib/map/markers";
import {
  getPhonePortraitMarkerLabelOffset,
  PHONE_PORTRAIT_MARKER_LABEL_OFFSETS,
  resolvePhonePortraitMarkerLabelOffset,
} from "@/lib/map/phonePortraitMapPresentation";

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
    // Ordinary markers (no exceptions) and any future exception location must
    // still anchor the icon with a [0,0] MapLibre marker offset.
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

  it("centers ordinary label/score meta beneath the icon with [0, 0] (CSS owns attachment)", async () => {
    renderPhonePortrait([
      phoneLocation("tiburon", "Tiburon"),
      phoneLocation("oakland", "Oakland"),
      phoneLocation("sausalito", "Sausalito"),
    ]);

    await waitFor(() => {
      expect(root("tiburon")).not.toBeNull();
    });

    for (const id of ["tiburon", "oakland", "sausalito"]) {
      expect(getPhonePortraitMarkerLabelOffset(id)).toEqual([0, 0]);
      const metaEl = root(id)!.querySelector<HTMLElement>(
        ".karl-universal-map-marker__meta",
      )!;
      const icon = root(id)!.querySelector<HTMLElement>(
        ".karl-universal-map-marker",
      )!;
      expect(metaEl.dataset.labelOffsetX).toBe("0");
      expect(metaEl.dataset.labelOffsetY).toBe("0");
      expect(metaEl.style.transform).toBe(
        "translate(calc(-50% + 0px), 0px)",
      );
      expect(icon.style.transform).toBe("");
    }
  });

  it("applies a genuine exception offset to the meta group only, not the icon", async () => {
    PHONE_PORTRAIT_MARKER_LABEL_OFFSETS["__test-exception"] = [8, 12];
    try {
      renderPhonePortrait([
        phoneLocation("__test-exception", "Exception"),
        phoneLocation("oakland", "Oakland"),
      ]);

      await waitFor(() => {
        expect(root("__test-exception")).not.toBeNull();
      });

      const metaEl = root("__test-exception")!.querySelector<HTMLElement>(
        ".karl-universal-map-marker__meta",
      )!;
      const icon = root("__test-exception")!.querySelector<HTMLElement>(
        ".karl-universal-map-marker",
      )!;
      expect(getPhonePortraitMarkerLabelOffset("__test-exception")).toEqual([
        8, 12,
      ]);
      expect(metaEl.dataset.labelOffsetX).toBe("8");
      expect(metaEl.dataset.labelOffsetY).toBe("12");
      expect(metaEl.style.transform).toContain("8px");
      expect(metaEl.style.transform).toContain("12px");
      expect(icon.style.transform).toBe("");
      expect(
        JSON.parse(root("__test-exception")!.dataset.markerOffset ?? "null"),
      ).toEqual([0, 0]);
    } finally {
      delete PHONE_PORTRAIT_MARKER_LABEL_OFFSETS["__test-exception"];
    }
  });

  it("keeps the colliding lower-priority marker as an icon-only marker (label hidden, icon kept)", async () => {
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

      // Label collision never hides the icon: the loser stays as icon-only
      // (root visible, __meta hidden) so its weather icon keeps its presence.
      expect(root("san-francisco")!.style.display).not.toBe("none");
      expect(root("san-francisco")!.dataset.markerVisibility).toBe("full");

      expect(root("berkeley")!.style.display).not.toBe("none");
      expect(root("berkeley")!.dataset.markerVisibility).toBe("icon-only");
      expect(meta("berkeley")!.style.display).toBe("none");

      expect(root("novato")!.style.display).not.toBe("none");
      expect(root("novato")!.dataset.markerVisibility).toBe("full");
    } finally {
      rectSpy.mockRestore();
    }
  });
});

function meta(id: string): HTMLElement | null {
  return (
    root(id)?.querySelector<HTMLElement>(".karl-universal-map-marker__meta") ??
    null
  );
}

describe("BayAreaMap phone-portrait marker root anchoring (stacking regression)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = "";
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = "";
  });

  // The stacking bug displaced markers because the root fell into normal flow;
  // the *placement contract* is that every marker is anchored purely by MapLibre
  // with a [0,0] marker-level offset, so DOM order can never change placement.
  // (The CSS `position: absolute` contract is covered in
  // tests/map/phonePortraitMarkerAnchorCss.test.ts, since external stylesheet
  // layout is not applied by the unit-test DOM.)
  const anchorSet = [
    "berkeley",
    "oakland",
    "tiburon",
    "sausalito",
    "mill-valley",
    "stinson-beach",
    "san-jose",
  ];

  it("gives every marker a [0,0] MapLibre offset regardless of DOM order", async () => {
    renderPhonePortrait(anchorSet.map((id) => phoneLocation(id, id)));

    await waitFor(() => {
      expect(root("san-jose")).not.toBeNull();
    });

    for (const id of anchorSet) {
      const applied = JSON.parse(root(id)!.dataset.markerOffset ?? "null");
      expect(applied, `marker offset for ${id}`).toEqual([0, 0]);
    }
  });

  it("keeps [0,0] offsets even when the DOM order is reversed", async () => {
    renderPhonePortrait([...anchorSet].reverse().map((id) => phoneLocation(id, id)));

    await waitFor(() => {
      expect(root("berkeley")).not.toBeNull();
    });

    for (const id of anchorSet) {
      const applied = JSON.parse(root(id)!.dataset.markerOffset ?? "null");
      expect(applied, `marker offset for ${id}`).toEqual([0, 0]);
    }
  });

  it("does not change a later marker's placement when an earlier marker is hidden", async () => {
    renderPhonePortrait(anchorSet.map((id) => phoneLocation(id, id)));

    await waitFor(() => {
      expect(root("san-jose")).not.toBeNull();
    });

    const laterIds = ["mill-valley", "stinson-beach", "san-jose"];
    const before = laterIds.map((id) => ({
      offset: root(id)!.dataset.markerOffset,
      transform: root(id)!.style.transform,
    }));

    // Hide an earlier marker in the DOM (what decluttering does).
    root("tiburon")!.style.display = "none";

    laterIds.forEach((id, i) => {
      expect(root(id)!.dataset.markerOffset, `offset ${id}`).toBe(
        before[i]!.offset,
      );
      expect(root(id)!.style.transform, `transform ${id}`).toBe(
        before[i]!.transform,
      );
    });
  });
});

describe("BayAreaMap phone-portrait zoom-scaled label offsets", () => {
  const EXCEPTION_ID = "__test-geographic-exception";

  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = "";
    mockSetZoom(10.5);
    delete PHONE_PORTRAIT_MARKER_LABEL_OFFSETS[EXCEPTION_ID];
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = "";
    mockSetZoom(10.5);
    delete PHONE_PORTRAIT_MARKER_LABEL_OFFSETS[EXCEPTION_ID];
  });

  it("keeps ordinary markers at [0, 0] rendered offsets at every zoom", async () => {
    mockSetZoom(9.3);
    renderPhonePortrait([
      phoneLocation("stinson-beach", "Stinson Beach"),
      phoneLocation("oakland", "Oakland"),
    ]);

    await waitFor(() => {
      expect(meta("stinson-beach")).not.toBeNull();
    });

    for (const id of ["stinson-beach", "oakland"]) {
      const el = meta(id)!;
      expect(el.dataset.labelOffsetX).toBe("0");
      expect(el.dataset.labelOffsetY).toBe("0");
      expect(el.dataset.renderedOffsetX).toBe("0");
      expect(el.dataset.renderedOffsetY).toBe("0");
      expect(el.style.transform).toBe("translate(calc(-50% + 0px), 0px)");
    }
  });

  it("renders full configured exception offsets at the reference zoom (>= 10.3)", async () => {
    PHONE_PORTRAIT_MARKER_LABEL_OFFSETS[EXCEPTION_ID] = [6, 4];
    mockSetZoom(10.5);
    renderPhonePortrait([
      phoneLocation(EXCEPTION_ID, "Exception"),
      phoneLocation("oakland", "Oakland"),
    ]);

    await waitFor(() => {
      expect(meta(EXCEPTION_ID)).not.toBeNull();
    });

    const exception = meta(EXCEPTION_ID)!;
    expect(exception.dataset.labelOffsetX).toBe("6");
    expect(exception.dataset.labelOffsetY).toBe("4");
    expect(exception.dataset.renderedOffsetX).toBe("6");
    expect(exception.dataset.renderedOffsetY).toBe("4");
    expect(exception.style.transform).toContain("6px");
    expect(exception.style.transform).toContain("4px");
  });

  it("renders proportionally reduced exception offsets at mid zoom (9.3)", async () => {
    PHONE_PORTRAIT_MARKER_LABEL_OFFSETS[EXCEPTION_ID] = [6, 4];
    mockSetZoom(9.3);
    renderPhonePortrait([phoneLocation(EXCEPTION_ID, "Exception")]);

    await waitFor(() => {
      expect(meta(EXCEPTION_ID)).not.toBeNull();
    });

    const [rx, ry] = resolvePhonePortraitMarkerLabelOffset(EXCEPTION_ID, 9.3);
    const exception = meta(EXCEPTION_ID)!;
    expect(exception.dataset.labelOffsetX).toBe("6");
    expect(exception.dataset.labelOffsetY).toBe("4");
    expect(Number(exception.dataset.renderedOffsetX)).toBeCloseTo(rx, 5);
    expect(Number(exception.dataset.renderedOffsetY)).toBeCloseTo(ry, 5);
    expect(Number(exception.dataset.renderedOffsetX)).toBeCloseTo(6 * 0.6, 5);
  });

  it("renders strongly reduced exception offsets at low zoom (8.3)", async () => {
    PHONE_PORTRAIT_MARKER_LABEL_OFFSETS[EXCEPTION_ID] = [-4, 4];
    mockSetZoom(8.3);
    renderPhonePortrait([phoneLocation(EXCEPTION_ID, "Exception")]);

    await waitFor(() => {
      expect(meta(EXCEPTION_ID)).not.toBeNull();
    });

    const exception = meta(EXCEPTION_ID)!;
    expect(Number(exception.dataset.renderedOffsetX)).toBeCloseTo(-4 * 0.2, 5);
    expect(Number(exception.dataset.renderedOffsetY)).toBeCloseTo(4 * 0.2, 5);
  });

  it("keeps the icon anchored at [0,0] and untransformed regardless of zoom", async () => {
    PHONE_PORTRAIT_MARKER_LABEL_OFFSETS[EXCEPTION_ID] = [6, 4];
    mockSetZoom(8);
    renderPhonePortrait([
      phoneLocation(EXCEPTION_ID, "Exception"),
      phoneLocation("oakland", "Oakland"),
    ]);

    await waitFor(() => {
      expect(root(EXCEPTION_ID)).not.toBeNull();
    });

    for (const id of [EXCEPTION_ID, "oakland"]) {
      const applied = JSON.parse(root(id)!.dataset.markerOffset ?? "null");
      expect(applied, `marker offset for ${id}`).toEqual([0, 0]);
      const icon = root(id)!.querySelector<HTMLElement>(
        ".karl-universal-map-marker",
      )!;
      expect(icon.style.transform).toBe("");
    }
  });

  it("uses the same scaled offset for rendering and collision measurement", async () => {
    mockSetZoom(9.3);
    const rectSpy = vi
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(function getBoundingClientRect(this: HTMLElement) {
        const empty = {
          left: 0,
          top: 0,
          width: 0,
          height: 0,
          right: 0,
          bottom: 0,
          x: 0,
          y: 0,
        };
        if (this.classList.contains("karl-universal-map-marker__meta")) {
          const r = {
            left: 100,
            top: 100,
            width: 40,
            height: 20,
            right: 140,
            bottom: 120,
            x: 100,
            y: 100,
          };
          return { ...r, toJSON: () => r } as DOMRect;
        }
        return { ...empty, toJSON: () => empty } as DOMRect;
      });

    try {
      renderPhonePortrait([
        phoneLocation("san-francisco", "San Francisco"),
        phoneLocation("berkeley", "Berkeley"),
      ]);

      await waitFor(() => {
        expect(root("berkeley")).not.toBeNull();
      });

      const [sfx, sfy] = resolvePhonePortraitMarkerLabelOffset(
        "san-francisco",
        9.3,
      );
      expect(sfx).toBe(0);
      expect(sfy).toBe(0);
      expect(Number(meta("san-francisco")!.dataset.renderedOffsetX)).toBeCloseTo(
        sfx,
        5,
      );
      expect(Number(meta("san-francisco")!.dataset.renderedOffsetY)).toBeCloseTo(
        sfy,
        5,
      );
      expect(root("san-francisco")!.style.display).not.toBe("none");
      expect(root("san-francisco")!.dataset.markerVisibility).toBe("full");
      expect(root("berkeley")!.style.display).not.toBe("none");
      expect(root("berkeley")!.dataset.markerVisibility).toBe("icon-only");
    } finally {
      rectSpy.mockRestore();
    }
  });

  it("registers exactly one zoom listener and removes it on unmount", async () => {
    mockSetZoom(10.5);
    const { unmount } = renderPhonePortrait([
      phoneLocation("tiburon", "Tiburon"),
    ]);

    await waitFor(() => {
      expect(root("tiburon")).not.toBeNull();
    });

    const mapInstance = mockMapInstances.at(-1)!;
    const zoomOnCalls = mapInstance.on.mock.calls.filter(
      (call: unknown[]) => call[0] === "zoom",
    );
    expect(zoomOnCalls).toHaveLength(1);

    unmount();

    const zoomOffCalls = mapInstance.off.mock.calls.filter(
      (call: unknown[]) => call[0] === "zoom",
    );
    expect(zoomOffCalls).toHaveLength(1);
    expect(zoomOffCalls[0]![1]).toBe(zoomOnCalls[0]![1]);
  });
});
