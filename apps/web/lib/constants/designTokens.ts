/**
 * iOS visual identity tokens from HomeView.swift and related views.
 * Values are stored as 0–255 RGB for clarity and converted to CSS as needed.
 */
export const designTokens = {
  navy: { r: 3, g: 11, b: 20 },
  navySoft: { r: 7, g: 22, b: 35 },
  navyGlass: { r: 9, g: 27, b: 42 },
  gold: { r: 242, g: 163, b: 38 },
  goldDeep: { r: 148, g: 92, b: 20 },
} as const;

export function rgbToken(token: { r: number; g: number; b: number }): string {
  return `rgb(${token.r} ${token.g} ${token.b})`;
}

export const cssColorTokens = {
  navy: rgbToken(designTokens.navy),
  navySoft: rgbToken(designTokens.navySoft),
  navyGlass: rgbToken(designTokens.navyGlass),
  gold: rgbToken(designTokens.gold),
  goldDeep: rgbToken(designTokens.goldDeep),
} as const;
