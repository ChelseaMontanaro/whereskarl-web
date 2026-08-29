import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  BOTTOM_NAV_ICON_SIZE,
  bottomNavIconDataUri,
  bottomNavIconSvg,
  isBottomNavVectorHref,
} from '@/lib/layout/bottomNavIcons';

const WEB_NAV_LINKS = resolve(
  process.cwd(),
  '../web/components/layout/NavLinks.tsx',
);

const NAV_LINKS = resolve(
  process.cwd(),
  'src/components/layout/NavLinks.tsx',
);

function navSource(): string {
  return readFileSync(NAV_LINKS, 'utf8');
}

/**
 * Root cause of the physical-iPhone mismatch: every tab was a Unicode text
 * glyph, and drawn artwork fills a different fraction of the em box per
 * character. ♥ and ⚙ fill theirs; ⌂ and ⌖ draw roughly half as tall at the same
 * font size, and ⌖ sits off the shared text baseline.
 *
 * Only Home and Map are re-drawn as vectors. Favorites and Settings keep their
 * approved native glyphs.
 */
describe('shared bottom navigation icons', () => {
  it('draws Home and Map from vector artwork instead of the small glyphs', () => {
    const source = navSource();

    // The two undersized/misaligned glyphs are gone.
    expect(source).not.toContain('⌂');
    expect(source).not.toContain('⌖');
    expect(source).toContain('bottomNavIconDataUri');
  });

  /**
   * Favorites and Settings artwork/tint are frozen to the approved
   * pre-Phase-23.1 native implementation: the ♥ / ⚙ text glyphs, and no gold
   * re-tint when the tab is active — the label carries active state. Only
   * their sizes have been re-authorized and re-measured against physical
   * iPhone across the Phase 23 closeout (18 → 20 → 18 for ⚙'s navGlyph
   * fontSize, since it overshoots its own em box; see navGlyphHeart for ♥).
   */
  it('keeps the native Favorites heart and Settings gear artwork/tint (FROZEN)', () => {
    const source = navSource();

    expect(source).toContain('♥');
    expect(source).toContain('⚙');
    expect(source).toMatch(/navGlyph:\s*\{[\s\S]*?fontSize: 18/);
    expect(source).toMatch(/navGlyphPhonePortrait:\s*\{[\s\S]*?fontSize: 20/);

    // No active-state style exists for the glyphs at all.
    expect(source).not.toContain('navGlyphActive');
  });

  /**
   * Physical-iPhone measurement (Phase 23 closeout, final optical
   * calibration): ♥ and ⚙ never track a shared fontSize because ♥'s drawn
   * ink is a smaller fraction of its em box than ⚙'s. After Home/Map settled
   * at 32pt, a shared 20pt overshot both glyphs past Home/Map's weight;
   * independently recalibrating ♥ to 22 and ⚙ (navGlyph) to 18 landed all
   * four tabs at approximately the same perceived height.
   */
  it('calibrates the native heart and gear glyphs independently', () => {
    const source = navSource();

    // A distinct style, applied only from the Text style array — never
    // merged into the shared navGlyph object the gear also reads from.
    expect(source).toMatch(/navGlyphHeart:\s*\{\s*\n\s*fontSize: 22,\s*\n\s*\},/);
    expect(source).toMatch(
      /href === '\/favorites' && !isPhonePortraitWeb && styles\.navGlyphHeart/,
    );
  });

  it('never re-draws Favorites or Settings from mobile-web path data', () => {
    expect(isBottomNavVectorHref('/favorites')).toBe(false);
    expect(isBottomNavVectorHref('/settings')).toBe(false);
    expect(isBottomNavVectorHref('/')).toBe(true);
    expect(isBottomNavVectorHref('/map')).toBe(true);

    const webPaths = [
      ...readFileSync(WEB_NAV_LINKS, 'utf8').matchAll(/<path d="([^"]+)"/g),
    ].map((match) => match[1]);
    const nativeVectorPaths = (['/', '/map'] as const).map(
      (href) => bottomNavIconSvg(href, '#ffffff').match(/d="([^"]+)"/)?.[1],
    );

    // Web ships four paths; native may only reuse the Home and Map two.
    expect(webPaths).toHaveLength(4);
    const reusedWebPaths = webPaths.filter((path) =>
      nativeVectorPaths.includes(path),
    );
    expect(reusedWebPaths).toHaveLength(2);
  });

  it('reuses the mobile-web Home and Map path data verbatim', () => {
    const webPaths = [
      ...readFileSync(WEB_NAV_LINKS, 'utf8').matchAll(/<path d="([^"]+)"/g),
    ].map((match) => match[1]);

    for (const href of ['/', '/map'] as const) {
      const path = bottomNavIconSvg(href, '#ffffff').match(/d="([^"]+)"/)?.[1];

      expect(path, `${href} icon path`).toBeDefined();
      expect(webPaths, `${href} matches a mobile-web path`).toContain(path);
      expect(bottomNavIconSvg(href, '#ffffff')).toContain(
        'viewBox="0 0 24 24"',
      );
    }
  });

  it('sizes the Home and Map artwork to balance Favorites/Settings on device', () => {
    // Physical-iPhone QA found Home/Map still reading one size smaller than
    // the native Favorites ♥ / Settings ⚙ glyphs even after a first bump to
    // 26, because the vector path only fills ~75%/~67-73% of its viewBox.
    // Raised to 32 (the same slot as Home's approved informational icons) so
    // the actual drawn ink is closer in visual weight to the glyphs. A fixed
    // square still keeps weight and vertical centre deterministic.
    expect(BOTTOM_NAV_ICON_SIZE).toBe(32);
    expect(navSource()).toMatch(
      /navIcon:\s*\{[\s\S]*?width: BOTTOM_NAV_ICON_SIZE[\s\S]*?height: BOTTOM_NAV_ICON_SIZE/,
    );
  });

  it('bakes the active/inactive colour into the artwork', () => {
    expect(bottomNavIconSvg('/', '#F2A326')).toContain('fill="#F2A326"');

    const uri = bottomNavIconDataUri('/map', 'rgba(255, 255, 255, 0.72)');
    expect(uri.startsWith('data:image/svg+xml;charset=utf-8,')).toBe(true);
    expect(decodeURIComponent(uri)).toContain('rgba(255, 255, 255, 0.72)');
  });
});
