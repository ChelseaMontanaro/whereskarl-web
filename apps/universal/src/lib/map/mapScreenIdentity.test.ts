import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const universalSrc = join(here, '../..');

/** Strings that identify the legacy Swift MapView — must never appear in Universal UI source. */
const LEGACY_SWIFT_MAP_STRINGS = [
  'Karl Map',
  'Search Bay Area spots',
  'AROUND THE BAY',
] as const;

function listSourceFiles(dir: string): string[] {
  const files: string[] = [];

  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.expo') {
      continue;
    }

    const absolute = join(dir, entry);
    const stats = statSync(absolute);

    if (stats.isDirectory()) {
      files.push(...listSourceFiles(absolute));
      continue;
    }

    if (/\.(tsx|ts|jsx|js)$/.test(entry) && !entry.endsWith('.test.ts') && !entry.endsWith('.test.tsx')) {
      files.push(absolute);
    }
  }

  return files;
}

describe('Universal Map identity vs legacy WheresKarl-iOS', () => {
  it('does not embed legacy Swift MapView chrome copy anywhere in src', () => {
    const files = listSourceFiles(universalSrc);

    for (const absolute of files) {
      const source = readFileSync(absolute, 'utf8');
      const rel = relative(universalSrc, absolute);

      for (const legacy of LEGACY_SWIFT_MAP_STRINGS) {
        expect(source.includes(legacy), `${rel} contains “${legacy}”`).toBe(false);
      }
    }
  });

  it('marks the immersive Map screen for runtime QA', () => {
    const mapScreen = readFileSync(join(universalSrc, 'app/map.tsx'), 'utf8');
    expect(mapScreen).toContain('testID="universal-map-screen"');
    expect(mapScreen).toContain("accessibilityLabel=\"Where's Karl Universal Map\"");
    expect(mapScreen).toContain('MapPhonePortraitControls');
  });
});
