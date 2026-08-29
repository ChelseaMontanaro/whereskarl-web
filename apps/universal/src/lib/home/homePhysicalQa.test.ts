import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  brandTaglineFitsViewport,
  LAYOUT_VERIFICATION_WIDTHS,
} from '@/lib/layout/responsiveWidth';

/** Mirrors HomeHero.resolveHeroMinHeight — mobile-web min(560px, 70vh). */
function resolveHeroMinHeight(windowHeight: number): number {
  return Math.min(560, Math.round(windowHeight * 0.7));
}

const HOME_COMPONENT_DIR = resolve(process.cwd(), 'src/components/home');

function readHomeComponent(fileName: string): string {
  return readFileSync(resolve(HOME_COMPONENT_DIR, `${fileName}.tsx`), 'utf8');
}

/** Body of a single `name: { … }` entry inside a StyleSheet.create block. */
function styleBlock(source: string, name: string): string {
  const match = source.match(
    new RegExp(`\\n  ${name}: \\{\\n([\\s\\S]*?)\\n  \\},`),
  );
  if (!match) {
    throw new Error(`style "${name}" not found`);
  }
  return match[1];
}

function styleNumber(source: string, name: string, prop: string): number {
  const match = styleBlock(source, name).match(
    new RegExp(`\\b${prop}: (\\d+(?:\\.\\d+)?)`),
  );
  if (!match) {
    throw new Error(`style "${name}" has no numeric ${prop}`);
  }
  return Number(match[1]);
}

/**
 * Authorized physical-iPhone Home recovery (golden rule).
 * Protects only the authorized defects + frozen lower-content typography.
 */
describe('Home physical-iPhone recovery (authorized defects)', () => {
  it('uses soft full-bleed web fades — no hard-edged solid bottomLead slab', () => {
    const bgSource = readHomeComponent('HomeHeroBackground');

    expect(bgSource).toContain('buildAtmosphereUri');
    expect(bgSource).toContain('buildBottomLeadUri');
    expect(bgSource).toContain('BOTTOM_FADE_URI');
    expect(bgSource).toContain('fullBleedOverlay');
    // Former hard slabs that created the gray band.
    expect(bgSource).not.toContain("height: '55%'");
    expect(bgSource).not.toContain("backgroundColor: 'rgba(0,0,0,0.42)'");
  });

  it('matches mobile-web hero min height: min(560, 70% viewport)', () => {
    expect(resolveHeroMinHeight(844)).toBe(560);
    expect(resolveHeroMinHeight(852)).toBe(560);
    expect(resolveHeroMinHeight(700)).toBe(490);
    expect(resolveHeroMinHeight(568)).toBe(398);

    const heroSource = readHomeComponent('HomeHero');
    expect(heroSource).toContain('resolveHeroMinHeight');
    expect(heroSource).toContain('windowHeight * 0.7');
  });

  it('keeps the tagline one line at 12px bold with defensive fitting', () => {
    const heroSource = readHomeComponent('HomeHero');

    expect(styleNumber(heroSource, 'tagline', 'fontSize')).toBe(12);
    expect(heroSource).toMatch(/tagline:\s*\{[\s\S]*?fontWeight:\s*'800'/);
    expect(heroSource).toContain('numberOfLines={1}');
    expect(heroSource).toContain('adjustsFontSizeToFit');
  });

  /**
   * Physical-device root cause: iOS Dynamic Type scaled every Home Text
   * (~1.24x at the xxLarge content size) while mobile web — the approved
   * reference — renders at fixed sizes. Simulator QA runs at the default
   * size, so this only ever surfaced on hardware.
   */
  it('pins every Home text node to the approved fixed type scale', () => {
    const homeComponents = [
      'HomeHero',
      'DashboardGrid',
      'MetricPercentSlider',
      'ClearestSpotMeter',
      'AirQualityMeter',
      'IntelligenceNarrativeCard',
      'BestRightNowSection',
      'NextHourOutlookCard',
    ];

    for (const component of homeComponents) {
      const source = readHomeComponent(component);
      const textOpenings = source.match(/<Text\b/g)?.length ?? 0;
      const pinned = source.match(/allowFontScaling=\{false\}/g)?.length ?? 0;

      expect(textOpenings, `${component} renders Text`).toBeGreaterThan(0);
      expect(pinned, `${component} pins every Text`).toBe(textOpenings);
    }

    // Only the Home CTA is in scope here; the header variant belongs to the
    // shared desktop nav and keeps its own scaling behaviour.
    expect(readHomeComponent('FindClearSkiesCta')).toMatch(
      /styles\.primaryLabel\} allowFontScaling=\{false\}/,
    );
  });

  it('renders the CTA gradient as fill only — pill geometry comes from the view', () => {
    const ctaSource = readHomeComponent('FindClearSkiesCta');

    // Mobile-web gold family: from rgb(255 196 71) via karl-gold to karl-gold-deep.
    expect(ctaSource).toContain('rgb(255,196,71)');
    expect(ctaSource).toContain('rgb(242,163,38)');
    expect(ctaSource).toContain('rgb(148,92,20)');

    // A corner radius inside the 8pt-wide source stretches into the lens shape.
    const gradientRect = ctaSource.match(/<rect[^>]*url\(#g\)[^>]*\/>/)?.[0];
    expect(gradientRect).toBeDefined();
    expect(gradientRect).not.toMatch(/\brx=/);
    expect(gradientRect).not.toMatch(/\bry=/);
    expect(ctaSource).toMatch(/primaryGradient:[\s\S]*?borderRadius: Radius\.pill/);

    // `overflow: hidden` on the shadowing view clips the shadow on iOS.
    expect(styleBlock(ctaSource, 'primaryButton')).not.toMatch(
      /^\s*overflow:/m,
    );
    // Soft natural drop shadow — no rim glow, bevel or oversized halo.
    expect(styleNumber(ctaSource, 'primaryButton', 'shadowRadius')).toBeLessThan(
      16,
    );
    expect(ctaSource).not.toContain('rimGlow');
    expect(ctaSource).not.toContain('borderColor: Colors.gold');
  });

  it('lets metric tiles size honestly — no shrinking region that overlaps siblings', () => {
    const gridSource = readHomeComponent('DashboardGrid');

    // flexShrink on the copy region compressed its box below its own content,
    // which is what collided the value/detail with the bottom-pinned meter.
    expect(styleBlock(gridSource, 'cardTop')).not.toContain('flexShrink');
    expect(gridSource).toContain('gaugePin');
    expect(gridSource).toContain("marginTop: 'auto'");
    // Detail must not use a numberOfLines={1} truncation workaround.
    expect(gridSource).not.toMatch(/cardDetail[\s\S]{0,80}numberOfLines=\{1\}/);
    expect(gridSource).not.toContain('trackWell');
  });

  it('fits the tallest metric tile inside the fixed 148pt card height', () => {
    const gridSource = readHomeComponent('DashboardGrid');
    const sliderSource = readHomeComponent('MetricPercentSlider');
    const meterSource = readHomeComponent('ClearestSpotMeter');

    const contentBudget =
      styleNumber(gridSource, 'card', 'height') -
      styleNumber(gridSource, 'card', 'paddingVertical') * 2 -
      styleNumber(gridSource, 'card', 'borderWidth') * 2;

    const meterHeight = (source: string) =>
      styleNumber(source, 'root', 'paddingTop') +
      styleNumber(source, 'track', 'height') +
      styleNumber(source, 'labels', 'marginTop') +
      styleNumber(source, 'label', 'lineHeight');

    // Worst case: "Clear Skies Score" wraps the label onto two lines.
    const tallestContent =
      styleNumber(gridSource, 'cardLabel', 'lineHeight') * 2 +
      styleNumber(gridSource, 'cardValue', 'marginTop') +
      styleNumber(gridSource, 'cardValue', 'lineHeight') +
      styleNumber(gridSource, 'cardDetail', 'marginTop') +
      styleNumber(gridSource, 'cardDetail', 'lineHeight') +
      meterHeight(sliderSource);

    expect(tallestContent).toBeLessThanOrEqual(contentBudget);
    // Clearest Spot uses its own meter; it must not be taller than the slider.
    expect(meterHeight(meterSource)).toBeLessThanOrEqual(
      meterHeight(sliderSource),
    );
  });

  it('preserves Best Right Now metadata on a single line at the web size (FROZEN)', () => {
    const brnSource = readHomeComponent('BestRightNowSection');

    expect(brnSource).toContain('numberOfLines={1}');
    expect(brnSource).toContain('adjustsFontSizeToFit');
    // Mobile web: max-sm:text-xs / leading-snug.
    expect(styleNumber(brnSource, 'metadata', 'fontSize')).toBe(12);
    expect(styleNumber(brnSource, 'metadata', 'lineHeight')).toBe(16);
  });

  it('keeps Future Outlook confidence at the approved mobile-web size (FROZEN)', () => {
    const outlookSource = readHomeComponent('NextHourOutlookCard');

    // Web: max-sm:text-[0.8125rem] font-semibold uppercase.
    expect(styleNumber(outlookSource, 'confidence', 'fontSize')).toBe(13);
    expect(outlookSource).toMatch(
      /confidence:\s*\{[\s\S]*?fontWeight:\s*'600'/,
    );
  });

  it.each(LAYOUT_VERIFICATION_WIDTHS)(
    'keeps brand tagline readable at $name ($width)',
    ({ width }) => {
      expect(brandTaglineFitsViewport(width)).toBe(true);
    },
  );
});

/** Phase 23 final polish — only the five authorized changes are asserted here. */
describe('Home final polish (authorized changes)', () => {
  it('keeps Home clearly visible behind the metric explanation sheet', () => {
    const sheetSource = readHomeComponent('MetricDetailSheet');
    const backdrop = styleBlock(sheetSource, 'backdrop');
    const alpha = Number(
      backdrop.match(/rgba\(0,0,0,([0-9.]+)\)/)?.[1] ?? 'NaN',
    );

    // Was 0.55, which read as a full-page dark scrim on device.
    expect(alpha).toBeLessThanOrEqual(0.2);
    expect(alpha).toBeGreaterThan(0);

    // The sheet itself is frozen: dimensions, radius and copy are untouched.
    expect(styleNumber(sheetSource, 'sheet', 'borderTopLeftRadius')).toBe(24);
    expect(styleBlock(sheetSource, 'sheet')).toContain(
      "backgroundColor: 'rgba(0,0,0,0.88)'",
    );
    // Tap-outside-to-close semantics preserved.
    expect(sheetSource).toContain('onPress={onClose}');
    expect(sheetSource).toContain('accessibilityViewIsModal');
  });

  it('renders Home informational icons at the web 32pt slot', () => {
    expect(readHomeComponent('DashboardGrid')).toContain(
      'const METRIC_ICON_SIZE = 32',
    );

    for (const component of ['BestRightNowSection', 'NextHourOutlookCard']) {
      const source = readHomeComponent(component);
      expect(styleNumber(source, 'icon', 'width'), component).toBe(32);
      expect(styleNumber(source, 'icon', 'height'), component).toBe(32);
      // Icons still sit inside their existing 48pt frames — no card resizing.
      expect(styleNumber(source, 'iconWrap', 'width'), component).toBe(48);
    }

    // Karl's Read keeps its 48pt frame; only the logo inside it grew.
    const narrative = readHomeComponent('IntelligenceNarrativeCard');
    expect(narrative).toContain('<KarlLogo size={32} />');
    expect(styleNumber(narrative, 'icon', 'width')).toBe(48);

    // Metric icons must still fit their frame without touching card geometry.
    const grid = readHomeComponent('DashboardGrid');
    expect(styleNumber(grid, 'iconFrame', 'width')).toBeGreaterThanOrEqual(32);
    expect(styleNumber(grid, 'card', 'height')).toBe(148);
  });

  /**
   * Native has no `mix-blend-soft-light`, so web's atmosphere alphas landed as
   * flat source-over navy and over-darkened mid/bright tones. Native-only alphas
   * are halved to reproduce the soft-light result (see HomeHeroBackground).
   *
   * Web's `brightness(1.06) contrast(1.1) saturate(1.14)` image grade is still
   * NOT replicated — RN 0.86 cannot apply saturate/contrast on iOS without the
   * experimental SwiftUI filter path, which stays disabled by decision.
   */
  it('compensates the missing soft-light blend without guessed filters', () => {
    const bgSource = readHomeComponent('HomeHeroBackground');

    // Halved from web's 0.5 / 0.34 because native composites source-over.
    expect(bgSource).toContain('topOpacity * 0.25');
    expect(bgSource).toContain('bottomOpacity * 0.17');

    // Gradient shape, stops, image selection and geometry stay frozen.
    expect(bgSource).toContain('buildAtmosphereUri');
    expect(bgSource).toContain('stop-opacity="0.02"');
    expect(bgSource).toContain('offset="42%"');
    expect(bgSource).toContain('activeHeroImageUrl');
    expect(bgSource).toContain('transform: [{ scale: 1.02 }]');

    // No guessed brightness/filter hacks layered onto the image. Matched as
    // style properties, not as prose — the surrounding comments discuss why the
    // web filter grade is deliberately not reproduced.
    const styleCode = bgSource.replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, '');
    expect(styleCode).not.toMatch(/\btintColor\s*:/);
    expect(styleCode).not.toMatch(/\bfilter\s*:/);
    expect(styleCode).not.toMatch(/\bexperimental_\w*[Ff]ilter/);
    expect(styleCode).not.toMatch(/\bmixBlendMode\s*:/);
  });

  /**
   * Physical failure: Future Outlook vanished from Home. Root cause is not a
   * layout regression — `NextHourOutlookCard` returned null whenever the
   * selected Karl pin had no usable hourly prediction, and degraded pins report
   * `predictionConfidenceLabel: "Unavailable"`. The section must always render.
   */
  it('never lets Future Outlook drop out of the Home insight stack', () => {
    const outlookSource = readHomeComponent('NextHourOutlookCard');

    expect(outlookSource).not.toMatch(/^\s*return null;/m);
    expect(outlookSource).not.toMatch(/!isLoading && !summary/);
    // Always renders its heading, whatever the data does.
    expect(outlookSource).toContain('Future Outlook');

    // Still rendered last in the stack, and the stack still declares it.
    const homeScreen = readFileSync(
      resolve(process.cwd(), 'src/app/index.tsx'),
      'utf8',
    );
    expect(homeScreen).toContain('<NextHourOutlookCard');
    expect(homeScreen).toContain('HOME_INSIGHT_STACK_ORDER');
    expect(
      homeScreen.indexOf('<NextHourOutlookCard'),
      'Future Outlook stays after Best Right Now',
    ).toBeGreaterThan(homeScreen.indexOf('<BestRightNowSection'));

    // An "Unavailable" label must not surface as "Unavailable confidence".
    expect(outlookSource).toContain("!== 'unavailable'");
  });

  it('fits the Air Quality tile inside the same 148pt card height', () => {
    const gridSource = readHomeComponent('DashboardGrid');
    const aqiMeterSource = readHomeComponent('AirQualityMeter');
    const sliderSource = readHomeComponent('MetricPercentSlider');

    const contentBudget =
      styleNumber(gridSource, 'card', 'height') -
      styleNumber(gridSource, 'card', 'paddingVertical') * 2 -
      styleNumber(gridSource, 'card', 'borderWidth') * 2;

    const meterHeight = (source: string) =>
      styleNumber(source, 'root', 'paddingTop') +
      styleNumber(source, 'track', 'height') +
      styleNumber(source, 'labels', 'marginTop') +
      styleNumber(source, 'label', 'lineHeight');

    // The AQI meter must not be taller than the meters it sits beside, or the
    // 2×2 grid stops being equal height.
    expect(meterHeight(aqiMeterSource)).toBe(meterHeight(sliderSource));

    // "AIR QUALITY" is a single-line label, so the worst case is a wrapped
    // two-line detail such as "Very Unhealthy across the Bay".
    const airQualityContent =
      styleNumber(gridSource, 'cardLabel', 'lineHeight') +
      styleNumber(gridSource, 'cardValue', 'marginTop') +
      styleNumber(gridSource, 'cardValue', 'lineHeight') +
      styleNumber(gridSource, 'cardDetail', 'marginTop') +
      styleNumber(gridSource, 'cardDetail', 'lineHeight') * 2 +
      meterHeight(aqiMeterSource);

    expect(airQualityContent).toBeLessThanOrEqual(contentBudget);
  });

  it('drops Karl Status from the grid without truncating the AQI card', () => {
    const gridSource = readHomeComponent('DashboardGrid');

    expect(gridSource).toContain('label="Air Quality"');
    expect(gridSource).not.toContain('label="Karl Status"');
    expect(gridSource).not.toContain('resolveKarlStatusPhrase');

    // No truncation workaround on the new detail line.
    expect(gridSource).not.toMatch(/cardDetail[\s\S]{0,80}numberOfLines=\{1\}/);
    // Bay-wide semantics come from the backend aggregate, not client math.
    expect(gridSource).toContain('bayWideAirQuality');

    // Karl's Read — the surface Karl Status duplicated — is untouched.
    expect(readHomeComponent('IntelligenceNarrativeCard')).toContain(
      "Karl&apos;s Read",
    );
  });
});
