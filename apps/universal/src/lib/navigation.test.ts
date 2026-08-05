import { describe, expect, it } from 'vitest';

import { buildMapHref, buildMapSearchHref } from '@/lib/navigation';

describe('buildMapHref', () => {
  it('writes normalized canonical ids onto the selected param', () => {
    expect(buildMapHref('ocean-beach-sf')).toBe('/map?selected=ocean-beach');
  });

  it('can open list (search) mode with an optional selection', () => {
    expect(buildMapSearchHref()).toBe('/map?view=list');
    expect(buildMapSearchHref('ocean-beach-sf')).toBe(
      '/map?view=list&selected=ocean-beach',
    );
  });

  it('returns a bare map path when there is no location', () => {
    expect(buildMapHref(null)).toBe('/map');
    expect(buildMapHref('   ')).toBe('/map');
  });
});
