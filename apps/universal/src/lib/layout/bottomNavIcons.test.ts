import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  BOTTOM_NAV_ICON_SIZE,
  bottomNavIconDataUri,
  bottomNavIconSvg,
  isBottomNavVectorHref,
} from '@/lib/layout/bottomNavIcons';
import { bottomNavItems, isPrimaryNavActive } from '@/lib/navigation';

const WEB_NAV_LINKS = resolve(
  process.cwd(),
  '../web/components/layout/NavLinks.tsx',
);

const NAV_LINKS = resolve(
  process.cwd(),
  'src/components/layout/NavLinks.tsx',
);

const BOTTOM_NAV_ICONS = resolve(
  process.cwd(),
  'src/lib/layout/bottomNavIcons.ts',
);

const REJECTED_WEB_SETTINGS_PATH =
  'M12 8.5A3.5 3.5 0 1 1 8.5 12 3.5 3.5 0 0 1 12 8.5Zm8.1 3.6 1.6 1.2-1.5 2.6 1.8 1-1 1.7-2.1-.6-.9 1.9-2.2-.3-.3 2.2-.9-1.9-2.1.6-1-1.7 1.8-1-1.5-2.6 1.6-1.2-.3-2.2 2.2-.3.3-2.2.9 1.9 2.1-.6 1 1.7-1.8 1 1.5 2.6-1.6 1.2.3 2.2-2.2.3-.3 2.2Z';

function navSource(): string {
  return readFileSync(NAV_LINKS, 'utf8');
}

function vectorSource(): string {
  return readFileSync(BOTTOM_NAV_ICONS, 'utf8');
}

function webPaths(): string[] {
  return [
    ...readFileSync(WEB_NAV_LINKS, 'utf8').matchAll(/<path d="([^"]+)"/g),
  ].map((match) => match[1]);
}

describe('shared bottom navigation icons', () => {
  it('draws Home and Map from vector artwork instead of the small glyphs', () => {
    const source = navSource();

    expect(source).not.toContain('⌂');
    expect(source).not.toContain('⌖');
    expect(source).toContain('bottomNavIconDataUri');
  });

  it('keeps the native Favorites heart artwork', () => {
    const source = navSource();

    expect(source).toContain("'/favorites': '♥'");
    expect(source).toMatch(/navGlyphHeart:\s*\{\s*\n\s*fontSize: 22,\s*\n\s*\},/);
    expect(source).toMatch(
      /href === '\/favorites' && !isPhonePortraitWeb && styles\.navGlyphHeart/,
    );
    expect(source).not.toContain('⚙');
    expect(source).not.toContain('\\uFE0E');
  });

  it('classifies Home and Map as vectors and Favorites/Settings as not', () => {
    expect(isBottomNavVectorHref('/')).toBe(true);
    expect(isBottomNavVectorHref('/map')).toBe(true);
    expect(isBottomNavVectorHref('/favorites')).toBe(false);
    expect(isBottomNavVectorHref('/settings')).toBe(false);
  });

  it('renders Settings as a native gearshape.fill SymbolView', () => {
    const source = navSource();

    expect(source).toContain("from 'expo-symbols'");
    expect(source).toContain('href === \'/settings\'');
    expect(source).toContain('<SymbolView');
    expect(source).toContain('name="gearshape.fill"');
    expect(source).toContain('type="monochrome"');
    expect(source).toContain('resizeMode="scaleAspectFit"');
    expect(source).toContain('size={BOTTOM_NAV_ICON_SIZE}');
    expect(source).toContain(
      'tintColor={isActive ? Colors.gold : NAV_ICON_COLOR}',
    );
    expect(source).toContain('accessibilityElementsHidden');
    expect(BOTTOM_NAV_ICON_SIZE).toBe(32);
  });

  it('does not keep the rejected web Settings SVG path in Universal vectors', () => {
    expect(vectorSource()).not.toContain(REJECTED_WEB_SETTINGS_PATH);
    expect(vectorSource()).not.toContain("'/settings'");
  });

  it('tints every active bottom-nav icon and label with Colors.gold', () => {
    const source = navSource();

    expect(source).toContain('isActive ? Colors.gold : NAV_ICON_COLOR');
    expect(source).toContain('isActive && styles.navGlyphActive');
    expect(source).toMatch(/navGlyphActive:\s*\{[\s\S]*?color: Colors\.gold/);
    expect(source).toMatch(/bottomLabelActive:\s*\{[\s\S]*?color: Colors\.gold/);
  });

  it('tints the Favorites heart through navGlyphActive Colors.gold', () => {
    const source = navSource();

    expect(source).toContain("'/favorites': '♥'");
    expect(source).toContain('isActive && styles.navGlyphActive');
    expect(source).toMatch(/navGlyphActive:\s*\{[\s\S]*?color: Colors\.gold/);
    expect(isBottomNavVectorHref('/favorites')).toBe(false);
  });

  it('preserves inactive icon and label colors', () => {
    const source = navSource();

    expect(source).toContain(
      "const NAV_ICON_COLOR = 'rgba(255, 255, 255, 0.72)'",
    );
    expect(source).toMatch(/navGlyph:\s*\{[\s\S]*?color: NAV_ICON_COLOR/);
    expect(source).toMatch(
      /bottomLabel:\s*\{[\s\S]*?color: 'rgba\(255, 255, 255, 0\.55\)'/,
    );
  });

  it('wraps every bottom-nav icon in a shared centered box', () => {
    const source = navSource();

    expect(source).toContain('styles.navIconWrapper');
    expect(source).toMatch(
      /navIconWrapper:\s*\{[\s\S]*?width: BOTTOM_NAV_ICON_SIZE[\s\S]*?height: BOTTOM_NAV_ICON_SIZE[\s\S]*?alignItems: 'center'[\s\S]*?justifyContent: 'center'/,
    );
  });

  it('keeps the shared label geometry and icon-to-label gap', () => {
    const source = navSource();

    expect(source).toMatch(/bottomLinkInner:\s*\{[\s\S]*?gap: 4/);
    expect(source).toMatch(
      /bottomLabel:\s*\{[\s\S]*?fontSize: 12[\s\S]*?fontWeight: '500'[\s\S]*?lineHeight: 14/,
    );
    expect(source).toMatch(
      /bottomLabelMap:\s*\{[\s\S]*?fontSize: 12[\s\S]*?lineHeight: 14[\s\S]*?letterSpacing: 0\.1/,
    );
  });

  it('never re-draws Favorites or Settings from mobile-web path data', () => {
    expect(isBottomNavVectorHref('/favorites')).toBe(false);
    expect(isBottomNavVectorHref('/settings')).toBe(false);

    const nativeVectorPaths = (['/', '/map'] as const).map(
      (href) => bottomNavIconSvg(href, '#ffffff').match(/d="([^"]+)"/)?.[1],
    );
    const webHeart = webPaths()[2];
    const webGear = webPaths()[3];

    expect(webPaths()).toHaveLength(4);
    expect(nativeVectorPaths).not.toContain(webHeart);
    expect(nativeVectorPaths).not.toContain(webGear);
  });

  it('reuses the mobile-web Home and Map path data verbatim', () => {
    const paths = webPaths();

    for (const href of ['/', '/map'] as const) {
      const path = bottomNavIconSvg(href, '#ffffff').match(/d="([^"]+)"/)?.[1];

      expect(path, `${href} icon path`).toBeDefined();
      expect(paths, `${href} matches a mobile-web path`).toContain(path);
      expect(bottomNavIconSvg(href, '#ffffff')).toContain(
        'viewBox="0 0 24 24"',
      );
    }
  });

  it('keeps Home and Map vectors at 32', () => {
    expect(BOTTOM_NAV_ICON_SIZE).toBe(32);
    expect(navSource()).toMatch(
      /navIcon:\s*\{[\s\S]*?width: BOTTOM_NAV_ICON_SIZE[\s\S]*?height: BOTTOM_NAV_ICON_SIZE/,
    );
  });

  it('bakes the active/inactive colour into the Home and Map artwork', () => {
    expect(bottomNavIconSvg('/', '#F2A326')).toContain('fill="#F2A326"');
    expect(bottomNavIconSvg('/', 'rgb(242, 163, 38)')).toContain(
      'fill="rgb(242, 163, 38)"',
    );
    expect(bottomNavIconSvg('/map', 'rgb(242, 163, 38)')).toContain(
      'fill="rgb(242, 163, 38)"',
    );

    const uri = bottomNavIconDataUri('/map', 'rgba(255, 255, 255, 0.72)');
    expect(uri.startsWith('data:image/svg+xml;charset=utf-8,')).toBe(true);
    expect(decodeURIComponent(uri)).toContain('rgba(255, 255, 255, 0.72)');
  });

  it('does not change bottom-nav routes or active matching', () => {
    const source = navSource();

    expect(bottomNavItems.map((item) => item.href)).toEqual([
      '/',
      '/map',
      '/favorites',
      '/settings',
    ]);
    expect(source).toContain('isPrimaryNavActive(pathname, item.href)');
    expect(source).toContain('href={item.href}');
    expect(isPrimaryNavActive('/', '/')).toBe(true);
    expect(isPrimaryNavActive('/map', '/')).toBe(false);
    expect(isPrimaryNavActive('/map', '/map')).toBe(true);
    expect(isPrimaryNavActive('/favorites/extra', '/favorites')).toBe(true);
    expect(isPrimaryNavActive('/settings', '/settings')).toBe(true);
  });
});
