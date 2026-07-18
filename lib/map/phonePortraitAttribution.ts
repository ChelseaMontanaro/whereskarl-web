/**
 * MapLibre's compact AttributionControl initializes *expanded*
 * (`maplibregl-compact-show`) and only minimizes after the user's first map
 * drag or ⓘ tap. On phone portrait the control is anchored above the bottom
 * nav, so that initial expanded state reads as a full-width credit strip at
 * 390×844. Collapse it programmatically — the identical state MapLibre's own
 * drag handler (`_updateCompactMinimize`) applies — so the credits live behind
 * the standard ⓘ toggle instead. The attribution is never removed or hidden:
 * the ⓘ button stays visible and tap-to-expand shows the full credits, which
 * satisfies OSM/CARTO/Esri attribution requirements for space-constrained
 * mobile maps.
 *
 * @returns true once the expanded compact control was found and collapsed.
 */
export function collapsePhonePortraitAttribution(
  host: HTMLElement | null,
): boolean {
  const attribution = host?.querySelector(
    ".maplibregl-ctrl-attrib.maplibregl-compact-show",
  );

  if (!attribution) {
    return false;
  }

  attribution.classList.remove("maplibregl-compact-show");
  return true;
}
