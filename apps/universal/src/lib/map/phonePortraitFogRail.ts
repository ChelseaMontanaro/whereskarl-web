import { getFogIntensityLabel, type FogIntensity } from '@whereskarl/domain';

/**
 * Phone-portrait fog rail copy and typography contract.
 *
 * The rail is a 50pt column, so its text budget is small and fixed. Two
 * physical-iPhone defects came out of forcing long copy through it:
 *
 *   1. "FOG INTENSITY" only fit by shrinking the heading to 7pt, which is
 *      smaller than the item labels underneath it and reads as a rendering
 *      error rather than a heading.
 *   2. Item labels had no Dynamic Type bound, so at large accessibility text
 *      sizes single words ("Foggy") wrapped onto a second line — and the
 *      selected state made it worse because the active label is a heavier
 *      weight, and therefore wider, than the resting one.
 *
 * Shorter approved copy ("FOG LEVEL", "Karl") removes the width pressure, which
 * is what lets the typography come back up to a readable size.
 */

/** Rail heading, one word per line. Replaces the previous "FOG INTENSITY". */
export const PHONE_PORTRAIT_FOG_RAIL_HEADING = ['FOG', 'LEVEL'] as const;

/**
 * Visible rail labels. Only `karlTerritory` differs from the canonical domain
 * label: the rail shows "Karl" so it stays on one line at a readable size.
 * The canonical label is still what assistive tech announces, and every other
 * surface (cards, Home, markers) keeps using the domain label unchanged.
 */
const RAIL_DISPLAY_LABEL_OVERRIDES: Partial<Record<FogIntensity, string>> = {
  karlTerritory: 'Karl',
};

/** Copy shown in the rail cell for an intensity. */
export function phonePortraitFogRailDisplayLabel(
  intensity: FogIntensity,
): string {
  return (
    RAIL_DISPLAY_LABEL_OVERRIDES[intensity] ?? getFogIntensityLabel(intensity)
  );
}

/** Copy announced by assistive tech — always the canonical domain label. */
export function phonePortraitFogRailAccessibilityLabel(
  intensity: FogIntensity,
): string {
  return getFogIntensityLabel(intensity);
}

/**
 * Lines a rail label may occupy. A single word must never wrap — mid-word
 * breaks ("Fogg / y") were the reported defect — so only multi-word copy such
 * as "Light Fog" is allowed a second line, and it breaks at its space.
 */
export function phonePortraitFogRailLabelLines(label: string): 1 | 2 {
  return label.trim().includes(' ') ? 2 : 1;
}

/** Heading size. Deliberately close to, and never dwarfed by, the item labels. */
export const PHONE_PORTRAIT_FOG_RAIL_HEADING_FONT_SIZE = 9;
export const PHONE_PORTRAIT_FOG_RAIL_LABEL_FONT_SIZE = 10;

/**
 * Dynamic Type bound for rail text. The rail width is fixed, so unbounded
 * growth is what pushed single-word labels into a second line. Matches the
 * bound already used for the region chip row.
 */
export const PHONE_PORTRAIT_FOG_RAIL_MAX_FONT_SCALE = 1.1;

/** Rail geometry that defines the text budget (see the component styles). */
export const PHONE_PORTRAIT_FOG_RAIL_WIDTH = 50;
export const PHONE_PORTRAIT_FOG_RAIL_PADDING_X = 3;
export const PHONE_PORTRAIT_FOG_RAIL_BORDER = 1;
export const PHONE_PORTRAIT_FOG_RAIL_CARD_BORDER = 1.5;
export const PHONE_PORTRAIT_FOG_RAIL_CARD_PADDING_X = 2;

/** Width available to the heading. */
export function phonePortraitFogRailHeadingWidth(): number {
  return (
    PHONE_PORTRAIT_FOG_RAIL_WIDTH -
    PHONE_PORTRAIT_FOG_RAIL_BORDER * 2 -
    PHONE_PORTRAIT_FOG_RAIL_PADDING_X * 2
  );
}

/**
 * Width available to an item label. Identical in the selected and unselected
 * states: the selected treatment only changes colour, never border width, so
 * selection can never be what makes a label wrap.
 */
export function phonePortraitFogRailLabelWidth(): number {
  return (
    phonePortraitFogRailHeadingWidth() -
    PHONE_PORTRAIT_FOG_RAIL_CARD_BORDER * 2 -
    PHONE_PORTRAIT_FOG_RAIL_CARD_PADDING_X * 2
  );
}
