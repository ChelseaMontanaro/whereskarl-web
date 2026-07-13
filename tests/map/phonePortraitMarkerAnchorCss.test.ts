import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

/**
 * Canonical positioning contract for phone-portrait marker roots.
 *
 * MapLibre injects the `maplibregl-marker` class (position: absolute; top: 0;
 * left: 0) onto every custom marker element and places it purely via a CSS
 * transform from the pane origin. If our phone-portrait root overrides
 * `position` to `relative`, the roots fall back into normal document flow and
 * visible markers stack vertically — every marker after the first is displaced
 * downward by roughly one marker height, so only the first visible marker lands
 * on its projected coordinate.
 *
 * This is a pure text contract because the external stylesheet is not applied by
 * the unit-test layout engine; it guards the exact one-line regression at the
 * canonical source.
 */
const cssPath = fileURLToPath(
  new URL(
    "../../components/map/phone-portrait-map.web.css",
    import.meta.url,
  ),
);
const baseCssPath = fileURLToPath(
  new URL(
    "../../components/map/karl-universal-map.web.css",
    import.meta.url,
  ),
);

const phonePortraitCss = readFileSync(cssPath, "utf8");
const baseMarkerCss = readFileSync(baseCssPath, "utf8");

/** Extracts the body of the first rule whose selector list matches `selector`. */
function ruleBody(css: string, selector: string): string | null {
  // Escape regex metacharacters in the selector.
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // Match `<selector> {` optionally combined with other selectors before it,
  // capturing the declaration block.
  const re = new RegExp(
    `(^|,|})\\s*${escaped}\\s*\\{([^}]*)\\}`,
    "m",
  );
  const match = re.exec(css);
  return match ? match[2]! : null;
}

describe("phone-portrait marker root positioning contract", () => {
  it("declares the phone-portrait marker root as position: absolute", () => {
    const body = ruleBody(
      phonePortraitCss,
      ".karl-universal-map-marker-root.is-phone-portrait",
    );
    expect(body, "phone-portrait marker root rule must exist").not.toBeNull();
    expect(body).toMatch(/position:\s*absolute\s*;/);
  });

  it("never puts the phone-portrait marker root back into normal flow", () => {
    const body = ruleBody(
      phonePortraitCss,
      ".karl-universal-map-marker-root.is-phone-portrait",
    );
    // A `position: relative` (or static) override is exactly the stacking bug.
    expect(body).not.toMatch(/position:\s*relative\s*;/);
    expect(body).not.toMatch(/position:\s*static\s*;/);
  });

  it("does not re-declare top/left (inherited from maplibregl-marker)", () => {
    // top/left are provided by MapLibre's own `maplibregl-marker` class, so the
    // canonical fix intentionally relies on them rather than duplicating.
    const body =
      ruleBody(
        phonePortraitCss,
        ".karl-universal-map-marker-root.is-phone-portrait",
      ) ?? "";
    expect(body).not.toMatch(/(^|\s)top:/);
    expect(body).not.toMatch(/(^|\s)left:/);
  });

  it("keeps the base (non-phone) marker root out of a normal-flow position override", () => {
    // The non-phone marker roots already rely on maplibregl-marker's absolute
    // positioning; guard that this stays true.
    const body = ruleBody(baseMarkerCss, ".karl-universal-map-marker-root");
    expect(body, "base marker root rule must exist").not.toBeNull();
    expect(body).not.toMatch(/position:\s*relative\s*;/);
    expect(body).not.toMatch(/position:\s*static\s*;/);
  });

  it("keeps the __meta label/score group absolutely positioned relative to the root", () => {
    // The absolute root remains the positioned ancestor for the absolute meta
    // group, so label offsets still anchor to the icon.
    const body = ruleBody(
      phonePortraitCss,
      ".karl-universal-map-marker-root.is-phone-portrait\n  > .karl-universal-map-marker__meta",
    );
    expect(body, "meta group rule must exist").not.toBeNull();
    expect(body).toMatch(/position:\s*absolute\s*;/);
  });
});
