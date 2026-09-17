import { BOTTOM_NAV_SCROLL_INSET } from '@/constants/bottomNav';
import { contentColumnWidth } from '@/lib/layout/responsiveWidth';

/** Settings glass card inner horizontal padding. */
export const SETTINGS_CARD_PADDING_X = 16;

/** Circular row-icon well. */
export const SETTINGS_ICON_WELL_SIZE = 36;

/** Compact °F / °C visual cluster (non-interactive). */
export const SETTINGS_UNIT_CONTROL_WIDTH = 92;

/** Coming Soon chip reserve so copy does not collide. */
export const SETTINGS_COMING_SOON_WIDTH = 88;

export const SETTINGS_CHEVRON_WIDTH = 14;

export const SETTINGS_ROW_GAP = 12;

function cardInnerWidth(viewportWidth: number): number {
  return Math.max(
    0,
    contentColumnWidth(viewportWidth) - SETTINGS_CARD_PADDING_X * 2,
  );
}

/**
 * Remaining width for Temperature Unit title + supporting copy after the
 * icon well and the °F/°C cluster.
 */
export function settingsTemperatureCopyBudget(viewportWidth: number): number {
  return (
    cardInnerWidth(viewportWidth) -
    SETTINGS_ICON_WELL_SIZE -
    SETTINGS_ROW_GAP -
    SETTINGS_UNIT_CONTROL_WIDTH
  );
}

/**
 * Remaining width for About title + supporting copy after the icon well
 * and chevron.
 */
export function settingsAboutRowCopyBudget(viewportWidth: number): number {
  return (
    cardInnerWidth(viewportWidth) -
    SETTINGS_ICON_WELL_SIZE -
    SETTINGS_ROW_GAP -
    SETTINGS_CHEVRON_WIDTH
  );
}

/**
 * Remaining width for Coming Soon support rows after the icon well and chip.
 */
export function settingsComingSoonRowCopyBudget(viewportWidth: number): number {
  return (
    cardInnerWidth(viewportWidth) -
    SETTINGS_ICON_WELL_SIZE -
    SETTINGS_ROW_GAP -
    SETTINGS_COMING_SOON_WIDTH
  );
}

export type SettingsVerticalRhythm = {
  contentPaddingTop: number;
  stackGap: number;
  sectionGap: number;
};

/**
 * Height-based (not device-model) vertical rhythm for the fixed Settings
 * screen. Compact below 700pt so short viewports can hold the approved
 * composition without scrolling.
 */
export function resolveSettingsVerticalRhythm(
  viewportHeight: number,
): SettingsVerticalRhythm {
  if (viewportHeight < 700) {
    return {
      contentPaddingTop: 8,
      stackGap: 8,
      sectionGap: 4,
    };
  }

  return {
    contentPaddingTop: 16,
    stackGap: 8,
    sectionGap: 6,
  };
}

/**
 * Body height remaining after status-bar and frozen bottom-nav insets.
 * Used for layout-budget verification — not runtime rendering.
 */
export function settingsAvailableBodyHeight(input: {
  viewportHeight: number;
  topInset: number;
  bottomInset: number;
}): number {
  return Math.max(
    0,
    input.viewportHeight -
      Math.max(input.topInset, 8) -
      BOTTOM_NAV_SCROLL_INSET -
      Math.max(input.bottomInset, 8),
  );
}
