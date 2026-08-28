import { describe, expect, it } from 'vitest';

import { HOME_INSIGHT_STACK_ORDER } from '@/lib/home/homeHierarchy';

describe('Home insight stack hierarchy', () => {
  it('keeps Future Outlook after Karl’s Read and Best Right Now', () => {
    expect(HOME_INSIGHT_STACK_ORDER).toEqual([
      'Karl’s Read',
      'Best Right Now',
      'Future Outlook',
    ]);
    expect(HOME_INSIGHT_STACK_ORDER.indexOf('Future Outlook')).toBe(
      HOME_INSIGHT_STACK_ORDER.length - 1,
    );
  });
});
