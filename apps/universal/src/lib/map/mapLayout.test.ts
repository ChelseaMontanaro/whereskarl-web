import { describe, expect, it } from 'vitest';

import { resolveMapScreenLayoutProfile } from '@/lib/map/mapLayout';

describe('resolveMapScreenLayoutProfile', () => {
  it('keeps native iPhone portrait on immersive phone chrome', () => {
    expect(
      resolveMapScreenLayoutProfile(390, true, {
        platformOS: 'ios',
        height: 844,
      }),
    ).toBe('phone');
  });

  it('keeps native iPhone landscape on immersive phone chrome', () => {
    expect(
      resolveMapScreenLayoutProfile(844, false, {
        platformOS: 'ios',
        height: 390,
      }),
    ).toBe('phone');
  });

  it('keeps iPad-class widths on tablet when not phone-portrait', () => {
    expect(
      resolveMapScreenLayoutProfile(820, false, {
        platformOS: 'ios',
        height: 1180,
      }),
    ).toBe('tablet');
  });

  it('preserves desktop and tablet breakpoints on web', () => {
    expect(
      resolveMapScreenLayoutProfile(1100, false, { platformOS: 'web' }),
    ).toBe('desktop');
    expect(
      resolveMapScreenLayoutProfile(800, false, { platformOS: 'web' }),
    ).toBe('tablet');
  });
});
