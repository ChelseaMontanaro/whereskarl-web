/**
 * Shared map chrome spacing and presentation tokens.
 *
 * Phone, tablet, and desktop keep intentionally different layout trees.
 * These tokens exist so shared surfaces (sheets, slots, chips, attribution)
 * stay aligned without rewriting each form-factor branch.
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
 * Shared glass surface for phone map sheets (Selected Location BottomSheet,
 * Map Layers sheet, loading stub). Bottom offset is composed separately so
 * layers can add max-height / padding without forking the glass treatment.
 */
export const PHONE_MAP_SHEET_SURFACE_CLASS =
  "inset-x-3 mx-auto max-w-[26rem] border border-white/12 bg-black/70 shadow-[0_-8px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl";

/** Scrim behind the phone Map Layers dialog. */
export const PHONE_MAP_SHEET_SCRIM_CLASS =
  "fixed inset-0 z-30 bg-black/55 backdrop-blur-[1px] motion-reduce:transition-none";

/**
 * Phone Selected Location / loading stub sheet container.
 * Rounded top + bottom matches the BottomSheet detent shell.
 */
export const PHONE_MAP_SHEET_CONTAINER_CLASS =
  `pointer-events-auto fixed ${PHONE_MAP_SHEET_SURFACE_CLASS} ${PHONE_MAP_SHEET_BOTTOM_CLASS} z-40 rounded-t-[1.75rem] rounded-b-3xl`;

/**
 * Phone Map Layers dialog shell — same glass/inset as BottomSheet, with
 * scroll + max-height for the denser layers body.
 */
export const PHONE_MAP_LAYERS_SHEET_CLASS =
  `fixed ${PHONE_MAP_SHEET_SURFACE_CLASS} ${PHONE_MAP_SHEET_BOTTOM_CLASS} z-40 max-h-[calc(100dvh-12rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))] overflow-y-auto overscroll-contain rounded-3xl p-4`;

/** Compact circular glass treatment for phone-portrait map control triggers. */
export const PHONE_MAP_CONTROL_BUTTON_CLASS =
  "flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-black/40 shadow-[0_4px_20px_rgba(0,0,0,0.24)] backdrop-blur-md transition-colors hover:border-karl-gold/30 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-karl-gold/50";

/**
 * Tablet immersive bottom stack (BRN tray + compact selected card).
 * Slightly taller than the phone sheet clearance so the tray breathes
 * above BottomNav without colliding with attribution.
 */
export const TABLET_MAP_BOTTOM_STACK_CLASS =
  "bottom-[calc(5.5rem+env(safe-area-inset-bottom))] md:bottom-[calc(5.25rem+env(safe-area-inset-bottom))]";

/** Phone search / region-chip header row. */
export const PHONE_MAP_TOP_CHROME_CLASS =
  "inset-x-3 top-[calc(1.375rem+env(safe-area-inset-top))] gap-0";

/**
 * Phone fog rail + Layers trigger top. Locked to the chip row + search bar
 * height (Phase 16.3C.1a / 18).
 */
export const PHONE_MAP_CONTROL_CLUSTER_TOP_CLASS =
  "top-[calc(7.75rem+env(safe-area-inset-top))]";

/** Tablet top-left conditions stack (hidden while immersive layers panel is open). */
export const TABLET_MAP_TOP_LEFT_CLASS =
  "left-3 top-3 max-w-[min(100%,20rem)] gap-2 sm:left-4 sm:top-4 sm:max-w-xs md:top-[4.5rem]";

/** Desktop top-left conditions stack — clears the app header. */
export const DESKTOP_MAP_TOP_LEFT_CLASS =
  "left-6 top-[5.5rem] w-full max-w-sm gap-2.5";

/** Desktop bottom bar (BRN left + selected location right). */
export const DESKTOP_MAP_BOTTOM_BAR_CLASS =
  "inset-x-6 bottom-6 items-end justify-between gap-5";

/** Desktop layers + zoom cluster — mirrors left inset for alignment. */
export const DESKTOP_MAP_LAYERS_CLASS =
  "absolute right-6 top-[5.5rem] z-10 flex w-[min(100%,17rem)] flex-col items-end gap-2";

/** Tablet immersive layers + zoom cluster. */
export const TABLET_MAP_LAYERS_CLASS =
  "absolute right-3 top-3 z-20 flex w-[min(17rem,calc(100%-0.75rem))] max-w-full flex-col items-stretch gap-1.5 sm:top-4 sm:gap-2 md:top-[4.5rem]";

/** Tablet bottom stack wrapper (absolute positioning + horizontal inset). */
export const TABLET_MAP_BOTTOM_STACK_WRAPPER_CLASS =
  `pointer-events-auto absolute inset-x-3 ${TABLET_MAP_BOTTOM_STACK_CLASS} flex flex-col items-stretch gap-2.5 sm:inset-x-4`;

export const MAP_ATTRIBUTION_PHONE_CLASS =
  "karl-map-attrib karl-map-attrib--phone pointer-events-none absolute z-10";

export const MAP_ATTRIBUTION_TABLET_CLASS =
  "pointer-events-none absolute bottom-[calc(5rem+env(safe-area-inset-bottom))] right-3 z-20 text-[0.6rem] text-white/25 sm:right-4";

export const MAP_ATTRIBUTION_DESKTOP_CLASS =
  "pointer-events-none absolute bottom-2 right-4 z-20 text-[0.6rem] text-white/25";

export const MAP_ATTRIBUTION_COPY =
  "Map data © OpenStreetMap contributors · CARTO";

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

export type MapRegionChipVariant = "phone" | "panel";

export function mapRegionChipClassName(
  variant: MapRegionChipVariant,
  isSelected: boolean,
): string {
  if (variant === "phone") {
    return `${MAP_REGION_CHIP_BASE_CLASS} ${
      isSelected
        ? MAP_REGION_CHIP_PHONE_SELECTED_CLASS
        : MAP_REGION_CHIP_PHONE_IDLE_CLASS
    }`;
  }

  return `${MAP_REGION_CHIP_BASE_CLASS} ${
    isSelected
      ? MAP_REGION_CHIP_PANEL_SELECTED_CLASS
      : MAP_REGION_CHIP_PANEL_IDLE_CLASS
  }`;
}

/**
 * Whether tablet/desktop top chrome should stay visible while the layers
 * panel is open. Phone keeps top chrome mounted; tablet hides it.
 */
export function shouldShowMapTopChrome(
  profile: "phone" | "tablet" | "desktop",
  isLayersPanelOpen: boolean,
): boolean {
  if (profile === "phone" || profile === "desktop") {
    return true;
  }

  return !isLayersPanelOpen;
}
