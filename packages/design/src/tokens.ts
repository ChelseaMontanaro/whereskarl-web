/**
 * Brand design tokens shared across TypeScript clients.
 * Values match the currently approved reference implementation (Web).
 */

export type RgbChannels = { readonly r: number; readonly g: number; readonly b: number };

export const designTokens = {
  navy: { r: 3, g: 11, b: 20 },
  navySoft: { r: 7, g: 22, b: 35 },
  navyGlass: { r: 9, g: 27, b: 42 },
  gold: { r: 242, g: 163, b: 38 },
  goldDeep: { r: 148, g: 92, b: 20 },
} as const satisfies Record<string, RgbChannels>;

/**
 * Format RGB channels as a CSS `rgb()` color.
 *
 * - `css-space` → `rgb(r g b)` (Web / modern CSS)
 * - `css-comma` → `rgb(r, g, b)` (Universal / React Native convention)
 *
 * Defaults to space-separated to match the Web reference implementation.
 * Callers must pick the format that preserves their existing rendered output.
 */
export function rgbToken(
  token: RgbChannels,
  format: "css-space" | "css-comma" = "css-space",
): string {
  if (format === "css-comma") {
    return `rgb(${token.r}, ${token.g}, ${token.b})`;
  }

  return `rgb(${token.r} ${token.g} ${token.b})`;
}

export const cssColorTokens = {
  navy: rgbToken(designTokens.navy),
  navySoft: rgbToken(designTokens.navySoft),
  navyGlass: rgbToken(designTokens.navyGlass),
  gold: rgbToken(designTokens.gold),
  goldDeep: rgbToken(designTokens.goldDeep),
} as const;
