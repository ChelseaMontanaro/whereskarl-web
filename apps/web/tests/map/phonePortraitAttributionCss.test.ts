import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

/**
 * Phone-portrait attribution positioning contract.
 *
 * Attribution must stay anchored in the map canvas bottom-right (cleared of
 * the bottom nav only). When a Selected Location sheet opens, the sheet covers
 * the credit in place — CSS must not lift `.karl-map-attrib--phone` or
 * `.maplibregl-ctrl-bottom-right` above the sheet via `body:has(...)` offsets.
 *
 * Pure text contract against the canonical stylesheet (unit layout does not
 * apply external CSS).
 */
const cssPath = fileURLToPath(
  new URL(
    "../../components/map/phone-portrait-map.web.css",
    import.meta.url,
  ),
);
const mapViewPath = fileURLToPath(
  new URL("../../components/map/MapView.tsx", import.meta.url),
);

const phonePortraitCss = readFileSync(cssPath, "utf8");
const mapViewSource = readFileSync(mapViewPath, "utf8");

const SHEET_HAS_SELECTOR =
  /body:has\(\s*\[aria-label\^="Selected location:"\]\s+button\[aria-expanded="(?:false|true)"\]\s*\)/;

describe("phone-portrait attribution positioning contract", () => {
  it("anchors custom phone attribution above the bottom nav only", () => {
    expect(phonePortraitCss).toMatch(
      /\.karl-map-attrib--phone\s*\{[^}]*bottom:\s*calc\(\s*4\.75rem\s*\+\s*env\(safe-area-inset-bottom,\s*0px\)\s*\+\s*5px\s*\)/s,
    );
  });

  it("anchors MapLibre bottom-right control above the bottom nav only", () => {
    expect(phonePortraitCss).toMatch(
      /\.karl-map-phone-portrait-host\s+\.maplibregl-ctrl-bottom-right\s*\{[^}]*bottom:\s*calc\(\s*4\.75rem\s*\+\s*env\(safe-area-inset-bottom,\s*0px\)\s*\)/s,
    );
    // Host wraps canvas — compound `.karl-map-canvas.karl-map-phone-portrait-host`
    // never matches the live DOM and must not be reintroduced.
    expect(phonePortraitCss).not.toMatch(
      /\.karl-map-canvas\.karl-map-phone-portrait-host\s+\.maplibregl-ctrl-bottom-right/,
    );
  });

  it("never lifts attribution when a Selected Location sheet is open", () => {
    // body:has(Selected location) may still style sheet metrics — only forbid
    // selectors that retarget attribution / MapLibre bottom-right controls.
    const sheetHasAttributionLift = new RegExp(
      String.raw`${SHEET_HAS_SELECTOR.source}\s*(?:\.karl-map-attrib--phone|\.karl-map-phone-portrait-host\s+\.maplibregl-ctrl-bottom-right|\.karl-map-canvas\.karl-map-phone-portrait-host\s+\.maplibregl-ctrl-bottom-right)\s*\{`,
      "m",
    );
    expect(phonePortraitCss).not.toMatch(sheetHasAttributionLift);
  });

  it("does not encode collapsed/expanded sheet peek offsets on attribution", () => {
    // Guard the specific lift formula from 9c6d388 so it cannot return quietly.
    expect(phonePortraitCss).not.toMatch(
      /\.karl-map-attrib--phone\s*\{[^}]*12\.5rem/s,
    );
    expect(phonePortraitCss).not.toMatch(
      /\.maplibregl-ctrl-bottom-right\s*\{[^}]*12\.5rem/s,
    );
    expect(phonePortraitCss).not.toMatch(
      /\.karl-map-attrib--phone\s*\{[^}]*62dvh/s,
    );
    expect(phonePortraitCss).not.toMatch(
      /\.maplibregl-ctrl-bottom-right\s*\{[^}]*62dvh/s,
    );
  });

  it("keeps phone attribution under the map overlay stacking context", () => {
    // Overlay is z-20; phone attrib must be z-10 so the Selected Location sheet
    // paints over the credit instead of the credit floating on top of the sheet.
    expect(mapViewSource).toMatch(
      /karl-map-attrib karl-map-attrib--phone pointer-events-none absolute z-10/,
    );
  });
});
