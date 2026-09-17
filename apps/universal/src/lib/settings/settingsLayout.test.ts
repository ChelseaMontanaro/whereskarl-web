import { describe, expect, it } from 'vitest';

import {
  CONTENT_COLUMN_MAX_WIDTH,
  LAYOUT_VERIFICATION_WIDTHS,
  contentColumnWidth,
} from '@/lib/layout/responsiveWidth';
import {
  settingsAboutRowCopyBudget,
  settingsAvailableBodyHeight,
  settingsComingSoonRowCopyBudget,
  settingsTemperatureCopyBudget,
  resolveSettingsVerticalRhythm,
} from '@/lib/settings/settingsLayout';

describe('Phase 26 — Settings responsive layout budgets', () => {
  it.each(LAYOUT_VERIFICATION_WIDTHS)(
    'caps the Settings content column at $name so tablet does not full-bleed stretch',
    ({ width }) => {
      const column = contentColumnWidth(width);
      expect(column).toBeLessThanOrEqual(CONTENT_COLUMN_MAX_WIDTH);
      expect(column).toBeLessThanOrEqual(width);
    },
  );

  it.each(LAYOUT_VERIFICATION_WIDTHS)(
    'keeps Temperature Unit copy from colliding with °F/°C at $name ($width)',
    ({ width }) => {
      expect(settingsTemperatureCopyBudget(width)).toBeGreaterThan(72);
    },
  );

  it.each(LAYOUT_VERIFICATION_WIDTHS)(
    'keeps About and Coming Soon rows usable at $name ($width)',
    ({ width }) => {
      expect(settingsAboutRowCopyBudget(width)).toBeGreaterThan(96);
      expect(settingsComingSoonRowCopyBudget(width)).toBeGreaterThan(72);
    },
  );

  it('narrowest phone (320) still leaves positive copy width', () => {
    expect(settingsTemperatureCopyBudget(320)).toBeGreaterThan(80);
    expect(settingsAboutRowCopyBudget(320)).toBeGreaterThan(100);
    expect(settingsComingSoonRowCopyBudget(320)).toBeGreaterThan(80);
  });

  it('uses compact vertical rhythm below 700pt and standard rhythm at phone heights', () => {
    expect(resolveSettingsVerticalRhythm(568)).toEqual({
      contentPaddingTop: 8,
      stackGap: 8,
      sectionGap: 4,
    });
    expect(resolveSettingsVerticalRhythm(844)).toEqual({
      contentPaddingTop: 16,
      stackGap: 8,
      sectionGap: 6,
    });
  });

  it.each(LAYOUT_VERIFICATION_WIDTHS)(
    'leaves a positive fixed-layout body budget at $name ($height)',
    ({ height }) => {
      const topInset = height < 700 ? 20 : 47;
      const bottomInset = height < 700 ? 0 : 34;
      expect(
        settingsAvailableBodyHeight({
          viewportHeight: height,
          topInset,
          bottomInset,
        }),
      ).toBeGreaterThan(360);
    },
  );
});
