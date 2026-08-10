"use client";

import { PHONE_MAP_SHEET_SCRIM_CLASS } from "@/lib/map/mapChrome";

type MapChromeCloseButtonSize = "sheet" | "panel" | "compact" | "ghost";

const CLOSE_BUTTON_SIZE_CLASS: Record<MapChromeCloseButtonSize, string> = {
  sheet:
    "flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/[0.05] text-base leading-none text-white/60 transition-colors hover:border-white/25 hover:text-white motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-karl-gold/50",
  panel:
    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/[0.06] text-base text-white/70 transition-colors hover:border-white/25 hover:text-white motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-karl-gold/50",
  compact:
    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/[0.04] text-sm text-white/65 transition-colors hover:border-white/20 hover:text-white motion-reduce:transition-none",
  ghost:
    "absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full text-base leading-none text-white/45 transition-colors hover:bg-white/[0.06] hover:text-white/75 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-karl-gold/50",
};

type MapChromeCloseButtonProps = {
  label: string;
  onClick: () => void;
  size?: MapChromeCloseButtonSize;
  className?: string;
};

/**
 * Shared × dismiss affordance for map chrome. Size variants preserve the
 * intentional denser phone sheet target vs compact desktop/panel controls.
 */
export function MapChromeCloseButton({
  label,
  onClick,
  size = "panel",
  className = "",
}: MapChromeCloseButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`${CLOSE_BUTTON_SIZE_CLASS[size]} ${className}`.trim()}
    >
      ×
    </button>
  );
}

type MapChromeScrimProps = {
  label: string;
  onDismiss: () => void;
};

/** Full-bleed dismiss scrim for phone map dialogs (e.g. Map Layers). */
export function MapChromeScrim({ label, onDismiss }: MapChromeScrimProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className={PHONE_MAP_SHEET_SCRIM_CLASS}
      onClick={onDismiss}
    />
  );
}
