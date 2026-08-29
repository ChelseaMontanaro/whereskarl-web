import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  brandTaglineFitsViewport,
  brandTaglineLetterSpacing,
  CONTENT_COLUMN_MAX_WIDTH,
  contentColumnWidth,
  contentHorizontalPadding,
  estimateBrandTaglineWidth,
  floatingChromeMaxWidth,
  LAYOUT_VERIFICATION_WIDTHS,
  LAYOUT_WIDTH,
  metricCardContentWidth,
  NARROWEST_SUPPORTED_VIEWPORT_WIDTH,
  resolveLayoutWidthBand,
} from '@/lib/layout/responsiveWidth';
import { resolveMapScreenLayoutProfile } from '@/lib/map/mapLayout';

describe('responsive width — narrowest phone + tablet matrix', () => {
  it('treats 320 as the narrowest supported phone floor (not ~390)', () => {
    expect(NARROWEST_SUPPORTED_VIEWPORT_WIDTH).toBe(320);
    expect(LAYOUT_WIDTH.narrowPhone).toBe(320);
    expect(LAYOUT_WIDTH.standardPhone).toBe(390);
    expect(NARROWEST_SUPPORTED_VIEWPORT_WIDTH).toBeLessThan(
      LAYOUT_WIDTH.standardPhone,
    );
  });

  it.each(LAYOUT_VERIFICATION_WIDTHS)(
    'keeps brand tagline within the content column at $name ($width)',
    ({ width }) => {
      expect(brandTaglineFitsViewport(width)).toBe(true);

      const spacing = brandTaglineLetterSpacing(width);
      const estimated = estimateBrandTaglineWidth(spacing);
      const budget = contentColumnWidth(width) - 16;
      expect(estimated).toBeLessThanOrEqual(budget);
    },
  );

  it('uses tighter tagline tracking at 320 than at 390/430', () => {
    expect(brandTaglineLetterSpacing(320)).toBeLessThan(
      brandTaglineLetterSpacing(390),
    );
    expect(brandTaglineLetterSpacing(390)).toBeLessThanOrEqual(
      brandTaglineLetterSpacing(430),
    );
  });

  it.each(LAYOUT_VERIFICATION_WIDTHS)(
    'caps the content column at $name so tablet widths do not full-bleed stretch',
    ({ width }) => {
      const column = contentColumnWidth(width);
      expect(column).toBeLessThanOrEqual(CONTENT_COLUMN_MAX_WIDTH);
      expect(column).toBeLessThanOrEqual(width);

      if (width > CONTENT_COLUMN_MAX_WIDTH) {
        // Tablet / large phone: column stays capped — not viewport-wide.
        expect(column).toBe(CONTENT_COLUMN_MAX_WIDTH);
        expect(column).toBeLessThan(width);
      }
    },
  );

  it.each(LAYOUT_VERIFICATION_WIDTHS)(
    'caps floating map chrome at $name (no tablet full-width sheet)',
    ({ width }) => {
      const chrome = floatingChromeMaxWidth(width);
      expect(chrome).toBeLessThanOrEqual(CONTENT_COLUMN_MAX_WIDTH);
      expect(chrome).toBe(Math.min(CONTENT_COLUMN_MAX_WIDTH, width));

      if (width >= LAYOUT_WIDTH.tabletPortrait) {
        expect(chrome).toBe(CONTENT_COLUMN_MAX_WIDTH);
        expect(chrome).toBeLessThan(width);
      }
    },
  );

  it('keeps two-up metric cards usable at the narrowest phone width', () => {
    const cardWidth = metricCardContentWidth(NARROWEST_SUPPORTED_VIEWPORT_WIDTH);
    // Enough room for label + icon frame without forcing horizontal overflow.
    expect(cardWidth).toBeGreaterThanOrEqual(130);
    expect(cardWidth).toBeLessThan(200);
  });

  it('keeps metric cards from stretching on tablet portrait widths', () => {
    const phoneCard = metricCardContentWidth(LAYOUT_WIDTH.standardPhone);
    const tabletCard = metricCardContentWidth(LAYOUT_WIDTH.tabletPortrait);

    // Tablet column is capped at CONTENT_COLUMN_MAX_WIDTH (not viewport-wide).
    expect(contentColumnWidth(LAYOUT_WIDTH.tabletPortrait)).toBe(
      CONTENT_COLUMN_MAX_WIDTH,
    );
    expect(tabletCard).toBe((CONTENT_COLUMN_MAX_WIDTH - 8) / 2);
    // Phone cards are ≤ tablet capped cards (phone column is smaller after gutters).
    expect(phoneCard).toBeLessThanOrEqual(tabletCard);
  });

  it('applies narrower gutters only below the compact band', () => {
    expect(contentHorizontalPadding(NARROWEST_SUPPORTED_VIEWPORT_WIDTH)).toBe(
      12,
    );
    expect(contentHorizontalPadding(LAYOUT_WIDTH.standardPhone)).toBe(16);
    expect(contentHorizontalPadding(LAYOUT_WIDTH.tabletPortrait)).toBe(24);
    expect(contentHorizontalPadding(LAYOUT_WIDTH.tabletLandscapeWide)).toBe(24);
  });

  it.each(LAYOUT_VERIFICATION_WIDTHS)(
    'resolves map layout profile for $name via width/height only',
    ({ width, height }) => {
      const isPhonePortrait = width <= 639 && height >= width;
      const profile = resolveMapScreenLayoutProfile(width, isPhonePortrait, {
        platformOS: 'ios',
        height,
      });

      if (width >= 1024) {
        expect(profile).toBe('desktop');
      } else if (Math.min(width, height) < 500 || isPhonePortrait || width < 600) {
        expect(profile).toBe('phone');
      } else {
        expect(profile).toBe('tablet');
      }
    },
  );

  it('explicitly covers narrowest phone + both iPad orientations in the matrix', () => {
    const names = LAYOUT_VERIFICATION_WIDTHS.map((entry) => entry.name);
    expect(names).toContain('narrowest-phone');
    expect(names).toContain('tablet-portrait');
    expect(names).toContain('tablet-portrait-wide');
    expect(names).toContain('tablet-landscape');
    expect(names).toContain('tablet-landscape-wide');

    expect(resolveLayoutWidthBand(320)).toBe('narrow');
    expect(resolveLayoutWidthBand(768)).toBe('wide');
    expect(resolveLayoutWidthBand(820)).toBe('wide');
    expect(resolveLayoutWidthBand(1024)).toBe('desktop');
    expect(resolveLayoutWidthBand(1180)).toBe('desktop');
  });

  it('keeps Home/Map/Favorites/BottomNav content capped (no tablet full-bleed)', () => {
    const files = [
      'src/app/index.tsx',
      'src/app/favorites.tsx',
      'src/app/map.tsx',
      'src/components/layout/BottomNav.tsx',
      'src/components/SelectedLocationPreview.tsx',
    ];

    for (const rel of files) {
      const source = readFileSync(resolve(process.cwd(), rel), 'utf8');
      expect(source, `${rel} missing MaxContentWidth cap`).toContain(
        'MaxContentWidth',
      );
      // Guard against accidental hard-coding to a single physical phone width.
      expect(source).not.toMatch(/width:\s*390\b/);
      expect(source).not.toMatch(/minWidth:\s*390\b/);
    }
  });

  it('never references device product names in the responsive helper module', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'src/lib/layout/responsiveWidth.ts'),
      'utf8',
    );

    expect(source).not.toMatch(/iPhone\s*(SE|14|15|16)/i);
    expect(source).not.toMatch(/iPad\s*(mini|Air|Pro)/i);
    expect(source).toContain('never device model');
    expect(source).toContain('narrowest phone');
  });
});
