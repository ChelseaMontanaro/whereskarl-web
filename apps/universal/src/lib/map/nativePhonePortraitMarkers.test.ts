import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

describe('native phone-portrait map markers', () => {
  it('does not render fog percentage in marker views', () => {
    const markerViewSource = readFileSync(
      resolve(
        process.cwd(),
        'src/components/KarlMap/KarlMapMarkerView.tsx',
      ),
      'utf8',
    );

    expect(markerViewSource).not.toMatch(/fogScore|formatFogPercent|Fog:/);
    expect(markerViewSource).toContain('formatMarkerTemperature');
    expect(markerViewSource).not.toContain('sunshineScore}%');
  });
});
