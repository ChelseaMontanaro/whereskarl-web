import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { presentPollen } from '@whereskarl/domain';
import { phonePortraitFogRailHeadingWidth } from '@/lib/map/phonePortraitFogRail';
import { KARL_MAP_STYLE_OPTIONS } from '@/lib/map/styles';

function readSource(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), 'utf8');
}

const SELECTED_PREVIEW_SOURCE = 'src/components/SelectedLocationPreview.tsx';
const FOG_RAIL_SOURCE = 'src/components/map/MapPhonePortraitFogRail.tsx';
const MAP_NATIVE_SOURCE = 'src/components/KarlMap/KarlMap.native.tsx';

/**
 * Every `name: { ... }` style block in a StyleSheet.create call, keyed by name.
 * Blocks are terminated by the two-space-indented closing brace the file uses
 * for top-level style entries.
 */
function styleBlocks(source: string): Map<string, string> {
  const blocks = new Map<string, string>();
  const pattern = /(\w+):\s*\{(.*?)\n {2}\}/gs;

  for (const match of source.matchAll(pattern)) {
    blocks.set(match[1], match[2]);
  }

  return blocks;
}

function numericStyleValue(block: string, property: string): number | null {
  const match = block.match(new RegExp(`${property}:\\s*([0-9.]+)`));
  return match ? Number(match[1]) : null;
}

/** Value of a module-level numeric constant, e.g. `const FOO = 30;`. */
function moduleConstant(source: string, name: string): number | null {
  const match = source.match(new RegExp(`${name}\\s*=\\s*([0-9.]+)`));
  return match ? Number(match[1]) : null;
}

/** Strips JSX `{/* … *\/}` comments so prose never satisfies a prop assertion. */
function withoutJsxComments(markup: string): string {
  return markup.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
}

describe('Phase 24 — native text line-box contract', () => {
  /**
   * Web writes `leading-none` freely because CSS lets glyphs paint outside the
   * line box. RN maps lineHeight onto NSParagraphStyle and clips to it, so a
   * line box pinned at or below the font size drops ascenders/descenders — and
   * for the 38pt Clear Sky Score inside the fixed 44pt value row it dropped the
   * number entirely on physical iPhone. No style in the selected-location card
   * or the fog rail may pin a line box at or below its own font size.
   */
  it.each([
    ['selected-location card', SELECTED_PREVIEW_SOURCE],
    ['fog intensity rail', FOG_RAIL_SOURCE],
  ])('%s never pins lineHeight at or below fontSize', (_label, sourcePath) => {
    const offenders: string[] = [];

    for (const [name, block] of styleBlocks(readSource(sourcePath))) {
      const fontSize = numericStyleValue(block, 'fontSize');
      const lineHeight = numericStyleValue(block, 'lineHeight');

      if (fontSize !== null && lineHeight !== null && lineHeight <= fontSize) {
        offenders.push(`${name} (fontSize ${fontSize}, lineHeight ${lineHeight})`);
      }
    }

    expect(offenders).toEqual([]);
  });

  it('checks a meaningful number of sized text styles', () => {
    const sized = [...styleBlocks(readSource(SELECTED_PREVIEW_SOURCE)).values()].filter(
      (block) =>
        numericStyleValue(block, 'fontSize') !== null &&
        numericStyleValue(block, 'lineHeight') !== null,
    );

    expect(sized.length).toBeGreaterThanOrEqual(15);
  });
});

describe('Phase 24 — Clear Sky Score hero value', () => {
  const source = readSource(SELECTED_PREVIEW_SOURCE);
  const blocks = styleBlocks(source);

  it('keeps the hero at its approved 38pt typography', () => {
    const hero = blocks.get('coreValueHero');

    expect(hero).toBeDefined();
    expect(numericStyleValue(hero!, 'fontSize')).toBe(38);
  });

  it('keeps the hero typographically distinct from the secondary values', () => {
    const heroSize = numericStyleValue(blocks.get('coreValueHero')!, 'fontSize')!;

    for (const name of [
      'coreValueRegular',
      'coreValueCompact',
      'coreValuePlaceholder',
    ]) {
      expect(numericStyleValue(blocks.get(name)!, 'fontSize')!).toBeLessThan(
        heroSize,
      );
    }
  });

  it('reserves the shared value row without capping it', () => {
    const row = blocks.get('coreValueRow')!;

    // Web's shared `h-11`, which all four columns bottom-align in. It must be a
    // reserved minimum — a hard height is what let the 38pt hero be clipped out
    // of existence on physical iPhone while the smaller values survived.
    expect(numericStyleValue(row, 'minHeight')).toBe(44);
    expect(row).not.toMatch(/\bheight:\s*\d/);
  });

  it('fits every value line box inside the reserved row height', () => {
    const rowHeight = numericStyleValue(blocks.get('coreValueRow')!, 'minHeight')!;

    for (const name of [
      'coreValueHero',
      'coreValueRegular',
      'coreValueCompact',
      'coreValuePlaceholder',
    ]) {
      const lineHeight = numericStyleValue(blocks.get(name)!, 'lineHeight')!;
      // <= row height keeps all four columns resolving to the same 44pt
      // baseline; > fontSize (asserted above) keeps the glyphs unclipped.
      expect(lineHeight).toBeLessThanOrEqual(rowHeight);
    }
  });

  it('keeps width protection on the value so narrow columns cannot truncate', () => {
    // At 320pt the Wind column is ~53pt wide; "WNW 13" at 19pt only fits
    // because the value can shrink. Dynamic Type is bounded on top of that.
    const valueRow = withoutJsxComments(
      source.slice(
        source.indexOf('<View style={styles.coreValueRow}>'),
        source.indexOf('<View style={styles.coreSupportingRow}>'),
      ),
    );

    expect(valueRow).toContain('adjustsFontSizeToFit');
    expect(valueRow).toContain('maxFontSizeMultiplier');
    expect(valueRow).toContain('numberOfLines={1}');
  });

  it('renders the score value from the canonical presenter, never a literal', () => {
    expect(source).toContain('value={String(score.score)}');
    expect(source).toContain('presentClearSkiesScore(location.sunshineScore)');
  });
});

describe('Phase 24 — environmental grid shares one layout contract', () => {
  const source = readSource(SELECTED_PREVIEW_SOURCE);
  const blocks = styleBlocks(source);

  it('reserves one fixed value height for every cell', () => {
    const slot = blocks.get('envValueSlot');

    expect(slot).toBeDefined();
    expect(slot).toContain('minHeight: ENV_METRIC_VALUE_SLOT_HEIGHT');
    expect(slot).not.toMatch(/\bheight:\s*\d/);
    expect(moduleConstant(source, 'ENV_METRIC_VALUE_SLOT_HEIGHT')).toBe(30);
    // Exactly one slot element, rendered by the cell every metric shares.
    expect(source.match(/styles\.envValueSlot/g)).toHaveLength(1);
  });

  it('fits every value treatment inside the reserved slot', () => {
    const slotHeight = moduleConstant(source, 'ENV_METRIC_VALUE_SLOT_HEIGHT')!;

    for (const name of [
      'envValue',
      'envValueCompact',
      'envValueWordScale',
      'envValueUnavailable',
    ]) {
      const lineHeight = numericStyleValue(blocks.get(name)!, 'lineHeight')!;
      expect(lineHeight).toBeLessThanOrEqual(slotHeight);
    }
  });

  it('offsets the supporting label once, not per metric', () => {
    // Web needs a `mt-[14px]` compensation on Visibility only because its value
    // row is not height-reserved. The reserved slot must remove that need, so a
    // single shared marginTop is the whole contract.
    const supporting = blocks.get('envSupporting');

    expect(numericStyleValue(supporting!, 'marginTop')).toBe(8);
    expect(source).not.toContain('envSupportingAfterCompact');
    expect(source).not.toContain('envSupportingClimate');
  });

  it('renders all six canonical metrics in a 3-column, 2-row grid', () => {
    for (const title of [
      "title: 'AQI'",
      "title: 'UV'",
      "title: 'Pollen'",
      "title: 'Humidity'",
      "title: 'Visibility'",
      "title: 'Climate'",
    ]) {
      expect(source).toContain(title);
    }

    expect(source).toContain('environmentalMetrics.slice(0, 3)');
    expect(source).toContain('environmentalMetrics.slice(3)');
  });
});

describe('Phase 24 — canonical pollen semantics', () => {
  /**
   * Pollen is entirely backend-supplied (`pollenSchema` is optional on
   * `locationWeatherSchema`) and both clients call the same presenter, so the
   * card must not add any availability rule of its own.
   */
  it('shows the numeric value and label whenever the backend reports it', () => {
    const pollen = presentPollen({
      value: 1,
      category: 'very-low',
      colorToken: 'pollen.very-low',
      label: 'Very Low',
      isAvailable: true,
    });

    expect(pollen.available).toBe(true);
    expect(pollen.value).toBe(1);
    expect(pollen.label).toBe('Very Low');
  });

  it('preserves the canonical unavailable state when the backend omits pollen', () => {
    expect(presentPollen(undefined).available).toBe(false);
    expect(presentPollen({ isAvailable: false } as never).available).toBe(false);
  });

  it('derives the tile value straight from the presenter', () => {
    const source = readSource(SELECTED_PREVIEW_SOURCE);

    expect(source).toContain('const pollen = presentPollen(location.pollen);');
    expect(source).toContain(
      "value: pollen.available ? String(pollen.value) : 'Unavailable',",
    );
    expect(source).toContain('supporting: pollen.available ? pollen.label : undefined,');
  });
});

describe('Phase 24 — fog intensity rail heading', () => {
  const source = readSource(FOG_RAIL_SOURCE);
  const blocks = styleBlocks(source);

  it('renders the heading one word per line and never truncates it', () => {
    const heading = source.slice(
      source.indexOf('<View style={styles.headerBlock}'),
      source.indexOf('<View style={styles.cards}>'),
    );

    expect(heading).toContain('PHONE_PORTRAIT_FOG_RAIL_HEADING.map');
    expect(heading).toContain('numberOfLines={1}');
    expect(heading).not.toContain('ellipsizeMode');
  });

  it('measures the heading against the rail content box, not its intrinsic width', () => {
    const headerBlock = blocks.get('headerBlock')!;
    const header = blocks.get('header')!;

    expect(headerBlock).toContain("alignSelf: 'stretch'");
    expect(header).toContain("width: '100%'");
    expect(header).toContain("textAlign: 'center'");
  });

  it('keeps the approved rail geometry that defines the width budget', () => {
    const panel = blocks.get('panel')!;

    // 50 rail − 2×1 border − 2×3 padding = the same 42pt box web gives it.
    expect(panel).toContain('PHONE_PORTRAIT_FOG_RAIL_WIDTH');
    expect(panel).toContain('PHONE_PORTRAIT_FOG_RAIL_PADDING_X');
    expect(phonePortraitFogRailHeadingWidth()).toBe(42);
  });
});

describe('Phase 24 — map layers map to distinct Apple Maps types', () => {
  const source = readSource(MAP_NATIVE_SOURCE);

  it('offers exactly the three canonical style options', () => {
    expect(KARL_MAP_STYLE_OPTIONS.map((option) => option.id)).toEqual([
      'standard',
      'satellite',
      'hybrid',
    ]);
  });

  it('resolves each style option to a different native map type', () => {
    const mapping = source.slice(
      source.indexOf('function nativeMapTypeForStyle'),
      source.indexOf('function KarlMapMarker'),
    );

    // `hybrid` collapsing onto `satellite` is what made the two identical.
    expect(mapping).toMatch(/mapStyle === 'satellite'[\s\S]*?return 'satellite'/);
    expect(mapping).toMatch(/mapStyle === 'hybrid'[\s\S]*?return 'hybrid'/);
    expect(mapping).toContain("return 'mutedStandard'");

    const returned = [...mapping.matchAll(/return '(\w+)'/g)].map(
      (match) => match[1],
    );

    expect(returned).toHaveLength(3);
    expect(new Set(returned).size).toBe(3);
  });

  it('drives MapView from the resolved map type', () => {
    expect(source).toContain('mapType={nativeMapTypeForStyle(mapStyle)}');
  });
});
