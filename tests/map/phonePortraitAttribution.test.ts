// @vitest-environment happy-dom

import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { collapsePhonePortraitAttribution } from "@/lib/map/phonePortraitAttribution";

// happy-dom rewrites import.meta.url to a non-file scheme; resolve from the
// vitest root (repo root) instead.
const bayAreaMapSource = readFileSync(
  join(process.cwd(), "components/map/BayAreaMap.tsx"),
  "utf8",
);

function buildCompactAttribution({ expanded }: { expanded: boolean }) {
  const host = document.createElement("div");
  const control = document.createElement("details");
  control.className = expanded
    ? "maplibregl-ctrl maplibregl-ctrl-attrib maplibregl-compact maplibregl-compact-show"
    : "maplibregl-ctrl maplibregl-ctrl-attrib maplibregl-compact";
  control.setAttribute("open", "");

  const button = document.createElement("summary");
  button.className = "maplibregl-ctrl-attrib-button";
  control.append(button);

  const inner = document.createElement("div");
  inner.className = "maplibregl-ctrl-attrib-inner";
  inner.textContent =
    "Esri, Maxar, Earthstar Geographics, and the GIS User Community | © OpenStreetMap contributors © CARTO";
  control.append(inner);

  host.append(control);
  document.body.append(host);
  return { host, control, button };
}

describe("collapsePhonePortraitAttribution", () => {
  it("collapses MapLibre's initially expanded compact control", () => {
    const { host, control } = buildCompactAttribution({ expanded: true });

    expect(collapsePhonePortraitAttribution(host)).toBe(true);

    // Same state MapLibre's own drag minimizer leaves behind: compact class
    // (ⓘ toggle visible) without compact-show (credits row hidden).
    expect(control.classList.contains("maplibregl-compact")).toBe(true);
    expect(control.classList.contains("maplibregl-compact-show")).toBe(false);
  });

  it("keeps the ⓘ toggle and full credits in the DOM (never suppresses attribution)", () => {
    const { host, control, button } = buildCompactAttribution({ expanded: true });

    collapsePhonePortraitAttribution(host);

    expect(control.isConnected).toBe(true);
    expect(button.isConnected).toBe(true);
    expect(control.querySelector(".maplibregl-ctrl-attrib-inner")?.textContent).toContain(
      "OpenStreetMap",
    );
  });

  it("returns false until the expanded control exists, then true exactly once", () => {
    const emptyHost = document.createElement("div");
    expect(collapsePhonePortraitAttribution(emptyHost)).toBe(false);
    expect(collapsePhonePortraitAttribution(null)).toBe(false);

    const { host } = buildCompactAttribution({ expanded: true });
    expect(collapsePhonePortraitAttribution(host)).toBe(true);
    // Already collapsed — a later user ⓘ expansion must not be re-collapsed.
    expect(collapsePhonePortraitAttribution(host)).toBe(false);
  });

  it("does not touch a control the user has not expanded", () => {
    const { host, control } = buildCompactAttribution({ expanded: false });

    expect(collapsePhonePortraitAttribution(host)).toBe(false);
    expect(control.classList.contains("maplibregl-compact")).toBe(true);
  });
});

describe("BayAreaMap phone-portrait attribution wiring contract", () => {
  it("collapses the initial expansion on phone portrait via style/source data events", () => {
    expect(bayAreaMapSource).toMatch(
      /if \(isPhonePortrait\) \{[\s\S]*?collapsePhonePortraitAttribution\(containerRef\.current\)/,
    );
    expect(bayAreaMapSource).toMatch(/map\.on\("styledata", collapseInitialAttribution\)/);
    expect(bayAreaMapSource).toMatch(/map\.on\("sourcedata", collapseInitialAttribution\)/);
    // One-shot: listeners detach after the collapse so ⓘ re-expansion sticks.
    expect(bayAreaMapSource).toMatch(/map\.off\("styledata", collapseInitialAttribution\)/);
    expect(bayAreaMapSource).toMatch(/map\.off\("sourcedata", collapseInitialAttribution\)/);
  });
});
