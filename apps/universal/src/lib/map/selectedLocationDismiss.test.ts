import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('selected location dismiss (physical iPhone QA)', () => {
  it('wires dismiss only for an explicit selection and exposes a dismiss control', () => {
    const mapSource = readFileSync(
      resolve(process.cwd(), 'src/app/map.tsx'),
      'utf8',
    );
    const previewSource = readFileSync(
      resolve(process.cwd(), 'src/components/SelectedLocationPreview.tsx'),
      'utf8',
    );

    // After dismiss, do not keep a featured BRN fallback sheet (web parity).
    expect(mapSource).toContain('isPhone && selectedLocation');
    expect(mapSource).not.toContain('featuredPhoneLocation');
    expect(mapSource).toContain('onDismiss={handleClearSelection}');
    expect(mapSource).toContain('phoneBottomInner');
    expect(mapSource).toContain('maxWidth: MaxContentWidth');

    expect(previewSource).toContain('testID="selected-location-dismiss"');
    expect(previewSource).toContain('Environmental Metrics');
    expect(previewSource).toContain('Marine Layer');
    expect(previewSource).toContain('Fog Ceiling');
    expect(previewSource).toContain('presentAirQuality');
    expect(previewSource).toContain('presentUvIndex');
    expect(previewSource).toContain('presentPollen');
    expect(previewSource).toContain('presentHumidity');
    expect(previewSource).toContain('presentVisibility');
    expect(previewSource).toContain('presentClimate');
    expect(previewSource).toContain('maxWidth: MaxContentWidth');
  });

  it('removes View details from the expanded phone sheet only', () => {
    const mapSource = readFileSync(
      resolve(process.cwd(), 'src/app/map.tsx'),
      'utf8',
    );
    const previewSource = readFileSync(
      resolve(process.cwd(), 'src/components/SelectedLocationPreview.tsx'),
      'utf8',
    );

    const phoneSheetStart = previewSource.indexOf(
      'function PhoneSelectedLocationSheet(',
    );
    const phoneSheetEnd = previewSource.indexOf('type EnvironmentalMetricData');
    const phoneSheet = previewSource.slice(phoneSheetStart, phoneSheetEnd);

    expect(phoneSheetStart).toBeGreaterThan(-1);
    expect(phoneSheetEnd).toBeGreaterThan(phoneSheetStart);
    expect(phoneSheet).not.toContain('View details ›');
    expect(phoneSheet).not.toContain('onOpenDetail');
    expect(phoneSheet).not.toContain('Open details for');

    const phonePreviewStart = mapSource.indexOf('const phonePreview =');
    const phonePreviewEnd = mapSource.indexOf('const selectedPreview =');
    const phonePreview = mapSource.slice(phonePreviewStart, phonePreviewEnd);

    expect(phonePreviewStart).toBeGreaterThan(-1);
    expect(phonePreviewEnd).toBeGreaterThan(phonePreviewStart);
    expect(phonePreview).not.toContain('onOpenDetail');

    expect(previewSource).toContain('View details ›');
    expect(mapSource).toContain('onOpenDetail={handleOpenLocationDetail}');
    expect(mapSource).toContain('function handleOpenLocationDetail(');
    expect(mapSource).toContain('handleOpenLocationDetail(locationId)');
  });
});
