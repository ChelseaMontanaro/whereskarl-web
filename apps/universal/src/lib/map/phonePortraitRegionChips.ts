/**
 * Phone-portrait region chip row geometry.
 *
 * Physical-iPhone defect this encodes (Phase 24): the chip row rendered wider
 * than the viewport and the trailing chip ("Peninsula") was permanently cut off
 * at rest. Two causes, measured against the approved mobile-web reference:
 *
 *   1. React Native `<Text>` honours the iOS Dynamic Type setting, while the
 *      web reference's `text-xs` is a fixed CSS px. On a device with enlarged
 *      text the same nominal 12pt label rendered ~33% wider, pushing the five
 *      chips past the viewport. Bounding the multiplier makes the row geometry
 *      deterministic without any device-model branching.
 *   2. A 40pt artificial trailing spacer had been added to work around RN
 *      under-counting `contentContainerStyle` padding. It inflated content
 *      width far beyond what reachability needs, worsening the resting clip.
 *
 * The row still scrolls when content genuinely exceeds the viewport (the web
 * reference does the same at narrow widths) — it simply must never present
 * unreachable content, and must centre like web when everything fits.
 *
 * Phase 24 closure raised the bar: all five canonical chips must fit
 * simultaneously at real phone widths, with no scrolling needed to read
 * "Peninsula", and without shrinking the labels. The metrics below are what
 * satisfy that; {@link phonePortraitChipRowFitsWithoutScrolling} states it as a
 * contract so the widths stay honest. At 320pt the row still cannot fit five
 * chips at a readable size and scrolls, exactly as the web reference does.
 */

/**
 * Approved chip metrics. Height, width floor and typography are the web
 * reference values verbatim (`min-h-10 min-w-[2.75rem] px-3 text-xs font-bold`);
 * only the two spacing values below are reduced, and only by the amount needed
 * to absorb the difference between web's fixed CSS px text and iOS's SF Pro
 * rendering of the same nominal size. Typography is deliberately untouched —
 * shrinking the labels was ruled out.
 */
export const PHONE_PORTRAIT_CHIP_MIN_HEIGHT = 40;
export const PHONE_PORTRAIT_CHIP_MIN_WIDTH = 44;
export const PHONE_PORTRAIT_CHIP_PADDING_X = 10;
export const PHONE_PORTRAIT_CHIP_GAP = 5;
export const PHONE_PORTRAIT_CHIP_FONT_SIZE = 12;

/**
 * Symmetric leading/trailing inset of the chip content. Matches the web row's
 * `px-0.5`; the previous 8pt was a native-only invention that spent 12pt of the
 * viewport and was a direct contributor to the resting overflow.
 */
export const PHONE_PORTRAIT_CHIP_ROW_INSET = 2;

/**
 * Upper bound on Dynamic Type growth for chip labels: exact web parity, because
 * the reference's `text-xs` is a fixed CSS px that never scales. Allowing any
 * growth here is what pushed the row past the viewport on a device with
 * enlarged text — the row has a hard width budget and five labels to fit in it,
 * so its width must be deterministic.
 */
export const PHONE_PORTRAIT_CHIP_LABEL_MAX_FONT_SCALE = 1;

/**
 * Average per-character advance for the 12pt bold system label, calibrated
 * from the approved mobile-web chip row (five chips measuring ~370pt of chip
 * width at a 430pt viewport). Used for layout assertions only — never for
 * rendering, which measures text natively.
 */
export const PHONE_PORTRAIT_CHIP_LABEL_CHAR_ADVANCE = 6.6;

/** Estimated rendered width of one chip at a given Dynamic Type scale. */
export function estimatePhonePortraitChipWidth(
  label: string,
  fontScale = 1,
): number {
  const labelWidth =
    label.length * PHONE_PORTRAIT_CHIP_LABEL_CHAR_ADVANCE * fontScale;

  return Math.max(
    PHONE_PORTRAIT_CHIP_MIN_WIDTH,
    Math.ceil(labelWidth) + PHONE_PORTRAIT_CHIP_PADDING_X * 2,
  );
}

/**
 * Total scrollable content width: leading inset + chips + inter-chip gaps +
 * trailing inset. The trailing inset is contributed by an explicit spacer view
 * rather than `paddingRight`, because RN under-counts content-container
 * padding on a horizontal ScrollView — but it is sized to the inset, not to an
 * arbitrary 40pt, so it never inflates the resting layout.
 */
export function phonePortraitChipRowContentWidth(
  chipWidths: readonly number[],
): number {
  if (chipWidths.length === 0) {
    return PHONE_PORTRAIT_CHIP_ROW_INSET * 2;
  }

  const chips = chipWidths.reduce((total, width) => total + width, 0);
  const gaps = (chipWidths.length - 1) * PHONE_PORTRAIT_CHIP_GAP;

  return PHONE_PORTRAIT_CHIP_ROW_INSET * 2 + chips + gaps;
}

/** True when the whole row fits the viewport and should centre (web parity). */
export function phonePortraitChipRowFits(
  viewportWidth: number,
  chipWidths: readonly number[],
): boolean {
  return phonePortraitChipRowContentWidth(chipWidths) <= viewportWidth;
}

/**
 * Whether a full set of chip labels fits a viewport with no scrolling, at the
 * bounded Dynamic Type scale the row actually renders at.
 *
 * This is the Phase 24 closure contract for the region selector: the labels are
 * fixed canonical product copy and the type size is frozen, so the only way the
 * row fits is if the geometry above leaves room for it. Asserting it here keeps
 * a future spacing change from silently reintroducing the clip.
 */
export function phonePortraitChipRowFitsWithoutScrolling(
  viewportWidth: number,
  labels: readonly string[],
): boolean {
  return phonePortraitChipRowFits(
    viewportWidth,
    labels.map((label) =>
      estimatePhonePortraitChipWidth(
        label,
        PHONE_PORTRAIT_CHIP_LABEL_MAX_FONT_SCALE,
      ),
    ),
  );
}

/**
 * Cross-axis packing for the chip content container.
 *
 * The web reference is `flex w-max min-w-full items-center justify-center`
 * inside `overflow-x-auto`: `w-max` sizes the row to its content, so
 * `justify-center` only ever has free space to distribute when the chips
 * actually fit — when they overflow, the row packs from the leading edge and
 * every chip is reachable by scrolling.
 *
 * React Native has no `w-max`. `justifyContent: 'center'` on a horizontal
 * ScrollView's content container centres the children even when they overflow
 * it, which pushes the leading and trailing chips outside the scrollable
 * content size. That overflow cannot be scrolled to, which is why "Peninsula"
 * stayed clipped at the viewport edge on a physical iPhone no matter how far
 * the row was dragged.
 *
 * Resolving the packing from measured widths reproduces `w-max` exactly: centre
 * while everything fits, pack leading once it does not. Both inputs come from
 * layout measurement, so there is no device-model branching.
 */
export function resolvePhonePortraitChipRowJustify(
  viewportWidth: number,
  contentWidth: number,
): 'center' | 'flex-start' {
  if (viewportWidth <= 0 || contentWidth <= 0) {
    return 'center';
  }

  return contentWidth <= viewportWidth ? 'center' : 'flex-start';
}

/**
 * True when the trailing chip can be scrolled fully into view. Content width
 * includes the trailing inset, so max scroll offset always exposes the last
 * chip completely plus its inset — no chip is ever unreachable.
 *
 * This only holds while the row packs from the leading edge; see
 * {@link resolvePhonePortraitChipRowJustify}.
 */
export function phonePortraitLastChipFullyReachable(
  viewportWidth: number,
  chipWidths: readonly number[],
): boolean {
  if (chipWidths.length === 0) {
    return true;
  }

  const contentWidth = phonePortraitChipRowContentWidth(chipWidths);
  const maxScroll = Math.max(0, contentWidth - viewportWidth);
  const lastChipRightEdge = contentWidth - PHONE_PORTRAIT_CHIP_ROW_INSET;

  return lastChipRightEdge <= viewportWidth + maxScroll;
}
