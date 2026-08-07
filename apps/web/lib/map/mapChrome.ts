/**
 * Shared map chrome spacing for phone-portrait sheets and attribution.
 *
 * BottomNav sits `fixed bottom-0` with ~3.5–4rem content plus safe-area.
 * Phone map sheets (Selected Location, Map Layers, loading stub) and
 * attribution all clear the same nav band so stacked surfaces align.
 *
 * Keep `PHONE_MAP_BOTTOM_NAV_CLEARANCE_REM` in sync with
 * `phone-portrait-map.web.css` (`.karl-map-attrib--phone` /
 * `.maplibregl-ctrl-bottom-right`).
 */
export const PHONE_MAP_BOTTOM_NAV_CLEARANCE_REM = 4.75;

/** Tailwind bottom offset above BottomNav + safe area (phone sheets). */
export const PHONE_MAP_SHEET_BOTTOM_CLASS =
  "bottom-[calc(4.75rem+env(safe-area-inset-bottom))]";

/**
 * Tablet immersive bottom stack (BRN tray + compact selected card).
 * Slightly taller than the phone sheet clearance so the tray breathes
 * above BottomNav without colliding with attribution.
 */
export const TABLET_MAP_BOTTOM_STACK_CLASS =
  "bottom-[calc(5.5rem+env(safe-area-inset-bottom))] md:bottom-[calc(5.25rem+env(safe-area-inset-bottom))]";

/**
 * Shared region-chip presentation tokens.
 * Phone uses a denser filled-gold selected state; panel (tablet/desktop)
 * uses the outline tint. Both share sizing / touch-target floors.
 */
export const MAP_REGION_CHIP_BASE_CLASS =
  "inline-flex min-h-10 min-w-[2.75rem] shrink-0 items-center justify-center whitespace-nowrap rounded-full border px-3 text-center text-xs font-bold leading-none transition-colors motion-reduce:transition-none";

export const MAP_REGION_CHIP_PHONE_SELECTED_CLASS =
  "border-karl-gold/45 bg-karl-gold text-karl-navy";

export const MAP_REGION_CHIP_PHONE_IDLE_CLASS =
  "border-[rgb(150_175_200/0.2)] bg-[rgb(5_13_24/0.78)] text-white/78 hover:opacity-90";

export const MAP_REGION_CHIP_PANEL_SELECTED_CLASS =
  "border-karl-gold/40 bg-karl-gold/14 text-karl-gold";

export const MAP_REGION_CHIP_PANEL_IDLE_CLASS =
  "border-white/10 bg-white/[0.04] text-white/65 hover:border-white/18 hover:text-white/85";
