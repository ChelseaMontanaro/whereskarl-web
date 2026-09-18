import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  contentColumnWidth,
  LAYOUT_VERIFICATION_WIDTHS,
} from '@/lib/layout/responsiveWidth';

function readSource(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), 'utf8');
}

const FAVORITES_HEADER = 'src/components/favorites/FavoritesHeader.tsx';
const FAVORITES_SCREEN = 'src/app/favorites.tsx';
const HOME_HERO = 'src/components/home/HomeHero.tsx';
const SETTINGS_BRAND = 'src/lib/settings/settingsBrandTypography.ts';
const SETTINGS_HEADER = 'src/components/settings/SettingsHeader.tsx';
const BOTTOM_NAV = 'src/constants/bottomNav.ts';
const NAV_LINKS = 'src/components/layout/NavLinks.tsx';

/** Body of a single `name: { … }` entry inside a StyleSheet.create block. */
function styleBlock(source: string, name: string): string {
  const match = source.match(
    new RegExp(`\\n  ${name}: \\{\\n([\\s\\S]*?)\\n  \\},`),
  );
  if (!match) {
    throw new Error(`style "${name}" not found`);
  }
  return match[1];
}

function styleNumber(source: string, name: string, prop: string): number {
  const match = styleBlock(source, name).match(
    new RegExp(`\\b${prop}: (\\d+(?:\\.\\d+)?)`),
  );
  if (!match) {
    throw new Error(`style "${name}" has no numeric ${prop}`);
  }
  return Number(match[1]);
}

/**
 * Conservative estimated rendered width for the uppercase Favorites subtitle
 * at a given fontSize + letterSpacing. Same glyph heuristic as Home's
 * `estimateBrandTaglineWidth`.
 */
function estimateFavoritesSubtitleWidth(
  fontSize: number,
  letterSpacing: number,
): number {
  const text = 'YOUR SAVED BAY AREA LOCATIONS';
  const glyphWidth = fontSize * 0.62;
  return text.length * glyphWidth + (text.length - 1) * letterSpacing;
}

describe('Phase 27.2 — Favorites branded header lockup matches Home', () => {
  it('applies the Home display title contract at size 32, left aligned', () => {
    const home = readSource(HOME_HERO);
    const header = readSource(FAVORITES_HEADER);
    const title = styleBlock(header, 'title');

    expect(home).toContain('fontFamily: Fonts?.serif');
    expect(styleNumber(home, 'title', 'fontSize')).toBe(32);
    expect(home).toMatch(/title:\s*\{[\s\S]*?fontWeight:\s*'600'/);
    expect(styleNumber(home, 'title', 'letterSpacing')).toBe(0.3);

    expect(title).toContain('fontFamily: Fonts?.serif');
    expect(styleNumber(header, 'title', 'fontSize')).toBe(32);
    expect(title).toContain("fontWeight: '600'");
    expect(styleNumber(header, 'title', 'letterSpacing')).toBe(0.3);
    expect(title).toContain("textAlign: 'left'");
    expect(header).toMatch(/>\s*Favorites\s*</);
    expect(header).toContain('allowFontScaling={false}');

    expect(header).not.toContain('fontSize: 34');
    expect(header).not.toContain("fontWeight: '700'");
    expect(title).not.toContain("textAlign: 'center'");
  });

  it('preserves the existing Favorites title shadow rather than inventing a new one', () => {
    const title = styleBlock(readSource(FAVORITES_HEADER), 'title');

    expect(title).toContain("textShadowColor: 'rgba(0, 0, 0, 0.4)'");
    expect(title).toContain('textShadowOffset: { width: 0, height: 2 }');
    expect(title).toContain('textShadowRadius: 6');
  });

  it('applies the Home tagline contract to the existing subtitle copy', () => {
    const home = readSource(HOME_HERO);
    const header = readSource(FAVORITES_HEADER);
    const subtitle = styleBlock(header, 'subtitle');

    expect(styleNumber(home, 'tagline', 'fontSize')).toBe(12);
    expect(home).toMatch(/tagline:\s*\{[\s\S]*?fontWeight:\s*'800'/);
    expect(styleNumber(home, 'tagline', 'letterSpacing')).toBe(3.2);
    expect(home).toContain("textTransform: 'uppercase'");
    expect(home).toContain('color: Colors.brandTaglineText');

    expect(header).toContain('Your saved Bay Area locations');
    expect(header).not.toContain('YOUR SAVED BAY AREA LOCATIONS');
    expect(subtitle).toContain('fontFamily: Fonts?.serif');
    expect(styleNumber(header, 'subtitle', 'fontSize')).toBe(12);
    expect(subtitle).toContain("fontWeight: '800'");
    expect(styleNumber(header, 'subtitle', 'letterSpacing')).toBe(3.2);
    expect(subtitle).toContain("textTransform: 'uppercase'");
    expect(subtitle).toContain('color: Colors.brandTaglineText');
    expect(subtitle).toContain("textAlign: 'left'");
    expect(header).toContain('numberOfLines={1}');
    expect(header).toContain('adjustsFontSizeToFit');
    expect(header).toContain('minimumFontScale={0.85}');
    expect(subtitle).not.toContain("textAlign: 'center'");
  });

  it('keeps the lockup left aligned and does not center the header', () => {
    const header = readSource(FAVORITES_HEADER);
    const headerStyle = styleBlock(header, 'header');

    expect(headerStyle).toContain("alignItems: 'flex-start'");
    expect(headerStyle).not.toContain("alignItems: 'center'");
    expect(styleBlock(header, 'title')).toContain("textAlign: 'left'");
    expect(styleBlock(header, 'subtitle')).toContain("textAlign: 'left'");
  });

  it('applies Home values locally instead of Settings-owned tokens or Settings size 34', () => {
    const header = readSource(FAVORITES_HEADER);
    const settingsBrand = readSource(SETTINGS_BRAND);
    const settingsHeader = readSource(SETTINGS_HEADER);

    expect(header).not.toContain('settingsBrandTypography');
    expect(header).not.toContain('SETTINGS_BRANDED_DISPLAY');
    expect(header).not.toContain('SETTINGS_BRANDED_TAGLINE');
    expect(header).not.toContain("from '@/lib/settings/");
    expect(header).not.toContain("from '@/components/home/");
    expect(header).not.toContain("from '@/components/settings/");

    expect(settingsHeader).toContain('fontSize: 32');
    expect(settingsHeader).not.toContain('fontSize: 34');
    expect(settingsBrand).toContain('SETTINGS_BRANDED_DISPLAY');
    expect(styleNumber(header, 'title', 'fontSize')).toBe(32);
  });

  it('uses the shared Weather-inspired tagline token and does not add a tagline shadow', () => {
    const theme = readSource('src/constants/theme.ts');
    const home = readSource(HOME_HERO);
    const favorites = readSource(FAVORITES_HEADER);
    const settingsBrand = readSource(SETTINGS_BRAND);
    const homeTagline = styleBlock(home, 'tagline');
    const favoritesSubtitle = styleBlock(favorites, 'subtitle');

    expect(theme).toContain("brandTaglineText: 'rgba(255, 248, 230, 0.96)'");
    expect(theme).toContain('gold: rgbToken(designTokens.gold, \'css-comma\')');
    expect(home).toContain('color: Colors.brandTaglineText');
    expect(favorites).toContain('color: Colors.brandTaglineText');
    expect(settingsBrand).toContain('color: Colors.brandTaglineText');
    expect(homeTagline).not.toContain('textShadowColor');
    expect(favoritesSubtitle).not.toContain('textShadowColor');
  });
});

describe('Phase 27.2 — Favorites subtitle one-line budget', () => {
  it.each(LAYOUT_VERIFICATION_WIDTHS)(
    'keeps the branded subtitle contract one-line-capable at $name ($width)',
    ({ width }) => {
      const header = readSource(FAVORITES_HEADER);
      const column = contentColumnWidth(width);
      const headerInset = 4 * 2; // existing paddingHorizontal: Spacing.xs
      const budget = column - headerInset;
      const unfitted = estimateFavoritesSubtitleWidth(12, 3.2);
      const fitted = estimateFavoritesSubtitleWidth(12 * 0.85, 3.2 * 0.85);

      expect(header).toContain('adjustsFontSizeToFit');
      expect(header).toContain('minimumFontScale={0.85}');
      expect(header).toContain('numberOfLines={1}');
      expect(budget).toBeGreaterThan(200);

      if (width <= 320) {
        expect(unfitted).toBeGreaterThan(budget);
        expect(fitted).toBeLessThanOrEqual(budget);
      } else {
        expect(unfitted).toBeLessThanOrEqual(budget);
      }
    },
  );

  it('does not invent device-model or breakpoint-specific Favorites header sizes', () => {
    const header = readSource(FAVORITES_HEADER);

    expect(header).not.toMatch(/iPhone|iPad|userAgent|Platform\.OS/);
    expect(header).not.toContain('brandTaglineLetterSpacing');
    expect(header).not.toContain('useWindowDimensions');
  });
});

describe('Phase 27.2 — Favorites freeze around the authorized lockup', () => {
  it('has no hard status-bar scrim and still pads content below the inset', () => {
    const screen = readSource(FAVORITES_SCREEN);
    const header = readSource(FAVORITES_HEADER);

    expect(screen).not.toContain('statusBarScrim');
    expect(screen).not.toContain("backgroundColor: 'rgba(0, 0, 0, 0.42)'");
    expect(screen).toContain('<FavoritesAtmosphereBackground');
    expect(screen).toContain('paddingTop: statusBarInset');
    expect(screen).toContain(
      'const statusBarInset = Math.max(insets.top, Spacing.sm)',
    );
    expect(header).not.toContain('statusBarScrim');
    expect(header).not.toContain("rgba(0, 0, 0, 0.42)");
  });

  it('does not touch bottom navigation', () => {
    const header = readSource(FAVORITES_HEADER);
    const screen = readSource(FAVORITES_SCREEN);
    const bottomNav = readSource(BOTTOM_NAV);
    const navLinks = readSource(NAV_LINKS);

    expect(header).not.toContain('NavLinks');
    expect(header).not.toContain('BOTTOM_NAV');
    expect(header).not.toContain('bottomNavItems');
    expect(screen).toContain('BOTTOM_NAV_SCROLL_INSET');
    expect(bottomNav).toContain('BOTTOM_NAV_BAR_HEIGHT = 68');
    expect(navLinks).toContain('BOTTOM_NAV_ICON_SIZE');
  });
});
