import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const universalSrc = join(here, '../..');

/** Strings that identify the legacy Swift MapView — must never appear in Universal. */
const LEGACY_SWIFT_MAP_STRINGS = [
  'Karl Map',
  'Search Bay Area spots',
  'AROUND THE BAY',
] as const;

const UNIVERSAL_MAP_SOURCE_FILES = [
  'app/map.tsx',
  'components/map/MapPhonePortraitControls.tsx',
  'components/map/MapLocationSearchBar.tsx',
  'components/map/MapConditionsPanel.tsx',
  'components/MapFilterPanel.tsx',
] as const;

describe('Universal Map identity vs legacy WheresKarl-iOS', () => {
  it('does not embed legacy Swift MapView chrome copy', () => {
    for (const relativePath of UNIVERSAL_MAP_SOURCE_FILES) {
      const source = readFileSync(join(universalSrc, relativePath), 'utf8');
      for (const legacy of LEGACY_SWIFT_MAP_STRINGS) {
        expect(source.includes(legacy), `${relativePath} contains “${legacy}”`).toBe(
          false,
        );
      }
    }
  });

  it('marks the immersive Map screen for runtime QA', () => {
    const mapScreen = readFileSync(join(universalSrc, 'app/map.tsx'), 'utf8');
    expect(mapScreen).toContain('testID="universal-map-screen"');
    expect(mapScreen).toContain("accessibilityLabel=\"Where's Karl Universal Map\"");
  });
});
