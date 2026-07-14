// @vitest-environment happy-dom

import { fireEvent } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { getProductRegionIdForLocation } from "@/lib/map/regions";
import type { MapMarkerLocation } from "@/lib/map/markers";
import { getPhonePortraitMarkerPriority } from "@/lib/map/phonePortraitMapPresentation";
import {
  applyPhonePortraitMarkerVisibility,
  comparePhonePortraitDeclutterOrder,
  createPhonePortraitMapMarkerElement,
  declutterPhonePortraitMarkers,
  selectPhonePortraitRegionAnchorIds,
  type PhonePortraitDeclutterEntry,
} from "@/lib/map/phonePortraitMarkers";

/**
 * Phase X — canonical marker-presence policy for phone portrait.
 *
 * Proves the extended declutter pass: label collision produces icon-only (never
 * hides the icon), icon collision is the only whole-marker hide, selection wins
 * and restores full identity, and region-anchor priority guarantees one readable
 * labeled representative per product region — all deterministically.
 */

function mapAtZoom(zoom: number) {
  return { getZoom: () => zoom } as unknown as import("maplibre-gl").Map;
}

function location(
  id: string,
  extra?: Partial<MapMarkerLocation>,
): MapMarkerLocation {
  return {
    id,
    name: id,
    latitude: 37.77,
    longitude: -122.42,
    sunshineScore: 70,
    status: "Clear",
    ...extra,
  };
}

function mockRect(
  el: HTMLElement,
  center: { x: number; y: number },
  size = { w: 40, h: 20 },
): void {
  const r = {
    left: center.x - size.w / 2,
    top: center.y - size.h / 2,
    width: size.w,
    height: size.h,
    right: center.x + size.w / 2,
    bottom: center.y + size.h / 2,
    x: center.x - size.w / 2,
    y: center.y - size.h / 2,
  };
  vi.spyOn(el, "getBoundingClientRect").mockReturnValue({
    ...r,
    toJSON: () => r,
  } as DOMRect);
}

type EntryOptions = {
  labelCenter: { x: number; y: number };
  labelSize?: { w: number; h: number };
  iconCenter?: { x: number; y: number };
  iconSize?: { w: number; h: number };
  isSelected?: boolean;
  onSelect?: (id: string) => void;
};

function makeEntry(
  loc: MapMarkerLocation,
  opts: EntryOptions,
): PhonePortraitDeclutterEntry {
  const element = createPhonePortraitMapMarkerElement({
    location: loc,
    isSelected: opts.isSelected ?? false,
    showLocationLabel: true,
    onSelect: opts.onSelect ?? (() => {}),
  });
  document.body.append(element);

  const meta = element.querySelector<HTMLElement>(
    ".karl-universal-map-marker__meta",
  )!;
  mockRect(meta, opts.labelCenter, opts.labelSize ?? { w: 40, h: 20 });

  // Only give the icon real geometry when the test exercises icon or
  // label↔icon collision; otherwise leave it degenerate (0-size) so icon
  // collision is skipped.
  if (opts.iconCenter) {
    const icon = element.querySelector<HTMLElement>(
      ".karl-universal-map-marker",
    )!;
    mockRect(icon, opts.iconCenter, opts.iconSize ?? { w: 36, h: 36 });
  }

  return {
    locationId: loc.id,
    element,
    priority: getPhonePortraitMarkerPriority(loc.id),
    score: loc.sunshineScore,
    isSelected: opts.isSelected ?? false,
    productRegionId: getProductRegionIdForLocation(loc),
  };
}

function visibility(entry: PhonePortraitDeclutterEntry): string | undefined {
  return entry.element.dataset.markerVisibility;
}

afterEach(() => {
  document.body.innerHTML = "";
  vi.restoreAllMocks();
});

describe("label collision → icon-only", () => {
  it("hides the label/score group, not the weather icon, on collision", () => {
    const a = makeEntry(location("san-francisco"), {
      labelCenter: { x: 100, y: 100 },
    });
    const b = makeEntry(location("berkeley"), {
      labelCenter: { x: 105, y: 105 },
    });

    declutterPhonePortraitMarkers(mapAtZoom(9), [a, b], {
      applyLowZoomHiding: false,
    });

    // Higher-priority SF keeps its full label.
    expect(visibility(a)).toBe("full");
    // Lower-priority Berkeley is icon-only: root visible, __meta hidden.
    expect(visibility(b)).toBe("icon-only");
    expect(b.element.style.display).not.toBe("none");
    const bMeta = b.element.querySelector<HTMLElement>(
      ".karl-universal-map-marker__meta",
    )!;
    expect(bMeta.style.display).toBe("none");
    // The weather icon button is still present.
    expect(
      b.element.querySelector(".karl-universal-map-marker"),
    ).not.toBeNull();
  });

  it("keeps an icon-only marker clickable", () => {
    const onSelect = vi.fn();
    const entry = makeEntry(location("berkeley", { name: "Berkeley" }), {
      labelCenter: { x: 0, y: 0 },
      onSelect,
    });

    applyPhonePortraitMarkerVisibility(entry.element, "icon-only");

    const button = entry.element.querySelector<HTMLButtonElement>(
      ".karl-universal-map-marker",
    )!;
    fireEvent.click(button);
    expect(onSelect).toHaveBeenCalledWith("berkeley");
    // Accessible name (identity) is preserved on the icon button.
    expect(button.getAttribute("aria-label")).toContain("Berkeley");
  });
});

describe("selection precedence", () => {
  it("selected marker always wins and stays full even when its label collides", () => {
    const sf = makeEntry(location("san-francisco"), {
      labelCenter: { x: 100, y: 100 },
    });
    const selected = makeEntry(location("oakland"), {
      labelCenter: { x: 102, y: 102 },
      isSelected: true,
    });

    declutterPhonePortraitMarkers(mapAtZoom(9), [sf, selected], {
      applyLowZoomHiding: false,
    });

    expect(visibility(selected)).toBe("full");
    // The non-selected marker whose label now collides with the selected one is
    // the icon-only loser.
    expect(visibility(sf)).toBe("icon-only");
  });

  it("selecting an icon-only marker restores its full label/score, and the previous selection returns to canonical", () => {
    const build = (selectedId: string | null) => {
      document.body.innerHTML = "";
      vi.restoreAllMocks();
      const a = makeEntry(location("san-francisco"), {
        labelCenter: { x: 100, y: 100 },
        isSelected: selectedId === "san-francisco",
      });
      const b = makeEntry(location("berkeley"), {
        labelCenter: { x: 104, y: 104 },
        isSelected: selectedId === "berkeley",
      });
      return { a, b };
    };

    // No selection: SF (higher priority) full, Berkeley icon-only.
    let { a, b } = build(null);
    declutterPhonePortraitMarkers(mapAtZoom(9), [a, b], {
      applyLowZoomHiding: false,
    });
    expect(visibility(a)).toBe("full");
    expect(visibility(b)).toBe("icon-only");

    // Select the icon-only marker: it becomes full; the previous full marker now
    // collides with the selected one and returns to the canonical icon-only.
    ({ a, b } = build("berkeley"));
    declutterPhonePortraitMarkers(mapAtZoom(9), [a, b], {
      applyLowZoomHiding: false,
    });
    expect(visibility(b)).toBe("full");
    expect(visibility(a)).toBe("icon-only");

    // Clear selection: canonical declutter result is restored.
    ({ a, b } = build(null));
    declutterPhonePortraitMarkers(mapAtZoom(9), [a, b], {
      applyLowZoomHiding: false,
    });
    expect(visibility(a)).toBe("full");
    expect(visibility(b)).toBe("icon-only");
  });
});

describe("icon collision fallback", () => {
  it("fully hides only through the canonical icon-collision fallback", () => {
    // Icons overlap within the tight icon box; labels are far apart.
    const a = makeEntry(location("san-francisco"), {
      labelCenter: { x: 100, y: 100 },
      iconCenter: { x: 200, y: 200 },
    });
    const b = makeEntry(location("berkeley"), {
      labelCenter: { x: 500, y: 500 },
      iconCenter: { x: 205, y: 205 },
    });

    declutterPhonePortraitMarkers(mapAtZoom(9), [a, b], {
      applyLowZoomHiding: false,
    });

    expect(visibility(a)).toBe("full");
    // Berkeley's icon collides with SF's icon → the only whole-marker hide.
    expect(visibility(b)).toBe("hidden");
    expect(b.element.style.display).toBe("none");
  });

  it("never fully hides a selected marker on icon collision", () => {
    const a = makeEntry(location("san-francisco"), {
      labelCenter: { x: 100, y: 100 },
      iconCenter: { x: 200, y: 200 },
    });
    const selected = makeEntry(location("berkeley"), {
      labelCenter: { x: 500, y: 500 },
      iconCenter: { x: 202, y: 202 },
      isSelected: true,
    });

    declutterPhonePortraitMarkers(mapAtZoom(9), [a, selected], {
      applyLowZoomHiding: false,
    });

    expect(visibility(selected)).toBe("full");
    // The non-selected marker whose icon collides with the selected one hides.
    expect(visibility(a)).toBe("hidden");
  });
});

describe("region-anchor priority", () => {
  const catalog: MapMarkerLocation[] = [
    location("san-francisco", { region: "san-francisco", sunshineScore: 80 }),
    location("ocean-beach", { region: "san-francisco", sunshineScore: 30 }),
    location("tiburon", { region: "north-bay", sunshineScore: 60 }),
    location("sausalito", { region: "north-bay", sunshineScore: 55 }),
    location("berkeley", { region: "east-bay", sunshineScore: 84 }),
    location("oakland", { region: "east-bay", sunshineScore: 70 }),
    location("san-jose", { region: "south-bay", sunshineScore: 90 }),
    location("mountain-view", { region: "south-bay", sunshineScore: 88 }),
    location("half-moon-bay", { region: "peninsula", sunshineScore: 65 }),
    location("pacifica", { region: "peninsula", sunshineScore: 40 }),
  ];

  it("selects exactly one deterministic anchor per product region", () => {
    const entries = catalog.map((loc) =>
      makeEntry(loc, { labelCenter: { x: 0, y: 0 } }),
    );
    const anchors = selectPhonePortraitRegionAnchorIds(entries);

    // One per region: product priority wins where present, else highest score.
    expect(anchors.has("san-francisco")).toBe(true); // priority 0
    expect(anchors.has("tiburon")).toBe(true); // priority over sausalito
    expect(anchors.has("berkeley")).toBe(true); // priority 1
    expect(anchors.has("san-jose")).toBe(true); // highest score in south-bay
    expect(anchors.has("half-moon-bay")).toBe(true); // highest score in peninsula
    expect(anchors.size).toBe(5);
  });

  it("gives every eligible region one full labeled anchor at all-Bay low zoom (labels non-colliding)", () => {
    // Spread labels far apart so only low-zoom suppression / anchor promotion
    // decides labels, not collision.
    const spread = [
      { x: 100, y: 100 },
      { x: 100, y: 300 },
      { x: 300, y: 100 },
      { x: 300, y: 300 },
      { x: 500, y: 100 },
      { x: 500, y: 300 },
      { x: 700, y: 100 },
      { x: 700, y: 300 },
      { x: 900, y: 100 },
      { x: 900, y: 300 },
    ];
    const entries = catalog.map((loc, i) =>
      makeEntry(loc, { labelCenter: spread[i]! }),
    );

    declutterPhonePortraitMarkers(mapAtZoom(8), entries, {
      applyLowZoomHiding: true,
    });

    const anchors = selectPhonePortraitRegionAnchorIds(entries);
    // Peninsula anchor is a low-zoom-set member but is promoted to a full label.
    const hmb = entries.find((e) => e.locationId === "half-moon-bay")!;
    expect(anchors.has("half-moon-bay")).toBe(true);
    expect(visibility(hmb)).toBe("full");

    // Every region has at least one full-labeled marker.
    const regions = ["san-francisco", "north-bay", "east-bay", "south-bay", "peninsula"];
    for (const region of regions) {
      const hasFull = entries.some(
        (e) =>
          e.productRegionId === region && visibility(e) === "full",
      );
      expect(hasFull, `region ${region} has a full label`).toBe(true);
    }

    // ocean-beach (low-zoom set, not the SF anchor) is a secondary icon-only.
    const oceanBeach = entries.find((e) => e.locationId === "ocean-beach")!;
    expect(visibility(oceanBeach)).toBe("icon-only");
  });
});

describe("deterministic priority ordering", () => {
  it("is independent of DOM / input order", () => {
    const catalog: MapMarkerLocation[] = [
      location("san-jose", { region: "south-bay", sunshineScore: 90 }),
      location("berkeley", { region: "east-bay", sunshineScore: 84 }),
      location("san-francisco", { region: "san-francisco", sunshineScore: 50 }),
      location("oakland", { region: "east-bay", sunshineScore: 70 }),
    ];

    const forward = catalog.map((loc) =>
      makeEntry(loc, { labelCenter: { x: 0, y: 0 } }),
    );
    const anchorsF = selectPhonePortraitRegionAnchorIds(forward);
    const orderF = [...forward]
      .sort((a, b) => comparePhonePortraitDeclutterOrder(a, b, anchorsF))
      .map((e) => e.locationId);

    document.body.innerHTML = "";
    vi.restoreAllMocks();

    const reversed = [...catalog]
      .reverse()
      .map((loc) => makeEntry(loc, { labelCenter: { x: 0, y: 0 } }));
    const anchorsR = selectPhonePortraitRegionAnchorIds(reversed);
    const orderR = [...reversed]
      .sort((a, b) => comparePhonePortraitDeclutterOrder(a, b, anchorsR))
      .map((e) => e.locationId);

    expect(orderF).toEqual(orderR);
  });
});

/**
 * Label ↔ other retained icon (GGP / Ocean Beach acceptance geometry from
 * production SF @ 390×844). Icons stay geographically anchored; only visibility
 * changes. No location-specific exceptions.
 */
describe("label ↔ retained-icon collision", () => {
  // Production-inspired boxes (icon 36×36; GGP meta ~93×31 covers Ocean icon).
  const ggpIcon = { x: 168, y: 438 };
  const ggpMeta = { x: 166, y: 478 };
  const ggpMetaSize = { w: 93, h: 31 };
  const oceanIcon = { x: 125, y: 460 };
  const oceanMeta = { x: 115, y: 500 };
  const oceanMetaSize = { w: 70, h: 31 };

  function makePair(scores: { ggp: number; ocean: number }, selectedId?: string) {
    const ggp = makeEntry(
      location("golden-gate-park", {
        region: "san-francisco",
        sunshineScore: scores.ggp,
        name: "Golden Gate Park",
      }),
      {
        labelCenter: ggpMeta,
        labelSize: ggpMetaSize,
        iconCenter: ggpIcon,
        isSelected: selectedId === "golden-gate-park",
      },
    );
    const ocean = makeEntry(
      location("ocean-beach", {
        region: "san-francisco",
        sunshineScore: scores.ocean,
        name: "Ocean Beach",
      }),
      {
        labelCenter: oceanMeta,
        labelSize: oceanMetaSize,
        iconCenter: oceanIcon,
        isSelected: selectedId === "ocean-beach",
      },
    );
    return { ggp, ocean };
  }

  it("downgrades a full label that covers another retained icon to icon-only", () => {
    // Far-apart labels alone would allow both full; GGP meta covers Ocean icon.
    const claimant = makeEntry(location("golden-gate-park", { sunshineScore: 90 }), {
      labelCenter: ggpMeta,
      labelSize: ggpMetaSize,
      iconCenter: ggpIcon,
    });
    const covered = makeEntry(location("ocean-beach", { sunshineScore: 40 }), {
      // Push Ocean's label far away so only label↔icon decides.
      labelCenter: { x: 800, y: 800 },
      labelSize: oceanMetaSize,
      iconCenter: oceanIcon,
    });

    declutterPhonePortraitMarkers(mapAtZoom(10.5), [claimant, covered], {
      applyLowZoomHiding: false,
    });

    expect(visibility(claimant)).toBe("icon-only");
    expect(visibility(covered)).toBe("full");
    // Covered icon remains geographically present (not hidden).
    expect(covered.element.style.display).not.toBe("none");
    expect(
      covered.element.querySelector(".karl-universal-map-marker"),
    ).not.toBeNull();
  });

  it("when GGP has the higher score, GGP cannot stay full over Ocean Beach's icon", () => {
    const { ggp, ocean } = makePair({ ggp: 80, ocean: 30 });
    declutterPhonePortraitMarkers(mapAtZoom(10.5), [ocean, ggp], {
      applyLowZoomHiding: false,
    });

    expect(visibility(ggp)).toBe("icon-only");
    expect(visibility(ocean)).not.toBe("hidden");
    expect(ocean.element.style.display).not.toBe("none");
  });

  it("when Ocean Beach has the higher score, it may stay full if its meta misses GGP's icon", () => {
    const { ggp, ocean } = makePair({ ggp: 30, ocean: 80 });
    declutterPhonePortraitMarkers(mapAtZoom(10.5), [ggp, ocean], {
      applyLowZoomHiding: false,
    });

    expect(visibility(ocean)).toBe("full");
    expect(visibility(ggp)).toBe("icon-only");
  });

  it("selected marker stays full and only the covered secondary icon is hidden", () => {
    const { ggp, ocean } = makePair(
      { ggp: 80, ocean: 30 },
      "golden-gate-park",
    );
    // Unrelated marker whose icon is far from GGP meta — must stay visible.
    const far = makeEntry(location("berkeley", { sunshineScore: 70 }), {
      labelCenter: { x: 700, y: 700 },
      iconCenter: { x: 700, y: 650 },
    });

    declutterPhonePortraitMarkers(mapAtZoom(10.5), [far, ocean, ggp], {
      applyLowZoomHiding: false,
    });

    expect(visibility(ggp)).toBe("full");
    expect(visibility(ocean)).toBe("hidden");
    expect(ocean.element.style.display).toBe("none");
    expect(visibility(far)).not.toBe("hidden");
  });

  it("clearing selection restores the covered secondary marker's canonical state", () => {
    let { ggp, ocean } = makePair(
      { ggp: 80, ocean: 30 },
      "golden-gate-park",
    );
    declutterPhonePortraitMarkers(mapAtZoom(10.5), [ocean, ggp], {
      applyLowZoomHiding: false,
    });
    expect(visibility(ggp)).toBe("full");
    expect(visibility(ocean)).toBe("hidden");

    document.body.innerHTML = "";
    vi.restoreAllMocks();
    ({ ggp, ocean } = makePair({ ggp: 80, ocean: 30 }));
    declutterPhonePortraitMarkers(mapAtZoom(10.5), [ocean, ggp], {
      applyLowZoomHiding: false,
    });
    expect(visibility(ggp)).toBe("icon-only");
    expect(visibility(ocean)).not.toBe("hidden");
  });

  it("resolves deterministically regardless of input order", () => {
    const forward = makePair({ ggp: 80, ocean: 30 });
    declutterPhonePortraitMarkers(
      mapAtZoom(10.5),
      [forward.ocean, forward.ggp],
      { applyLowZoomHiding: false },
    );
    const forwardResult = {
      ggp: visibility(forward.ggp),
      ocean: visibility(forward.ocean),
    };

    document.body.innerHTML = "";
    vi.restoreAllMocks();

    const reverse = makePair({ ggp: 80, ocean: 30 });
    declutterPhonePortraitMarkers(
      mapAtZoom(10.5),
      [reverse.ggp, reverse.ocean],
      { applyLowZoomHiding: false },
    );
    expect(visibility(reverse.ggp)).toBe(forwardResult.ggp);
    expect(visibility(reverse.ocean)).toBe(forwardResult.ocean);
  });
});
