import { describe, expect, it } from 'vitest';

import {
  PHONE_PORTRAIT_ALL_BAY_CAMERA,
  phonePortraitCameraRegionIds,
  resolvePhonePortraitCameraPreset,
} from '@/lib/map/phonePortraitCameraPresets';

describe('Phase 24 canonical phone-portrait camera presets', () => {
  it('uses the approved all-Bay bounds and padding when no region is active', () => {
    expect(resolvePhonePortraitCameraPreset(null)).toBe(
      PHONE_PORTRAIT_ALL_BAY_CAMERA,
    );
    expect(resolvePhonePortraitCameraPreset(undefined)).toBe(
      PHONE_PORTRAIT_ALL_BAY_CAMERA,
    );

    expect(PHONE_PORTRAIT_ALL_BAY_CAMERA.bounds).toEqual([
      [-122.72, 37.22],
      [-121.76, 38.45],
    ]);
    expect(PHONE_PORTRAIT_ALL_BAY_CAMERA.padding).toEqual({
      top: 136,
      right: 88,
      bottom: 284,
      left: 120,
    });
  });

  it('covers all five canonical product regions', () => {
    expect(phonePortraitCameraRegionIds().sort()).toEqual([
      'east-bay',
      'north-bay',
      'peninsula',
      'san-francisco',
      'south-bay',
    ]);
  });

  it('matches the approved per-region bounds and padding', () => {
    expect(resolvePhonePortraitCameraPreset('san-francisco')).toEqual({
      bounds: [
        [-122.53, 37.703],
        [-122.355, 37.875],
      ],
      padding: { top: 128, right: 28, bottom: 210, left: 100 },
    });

    expect(resolvePhonePortraitCameraPreset('north-bay')).toEqual({
      bounds: [
        [-123.05, 37.78],
        [-122.26, 38.63],
      ],
      padding: { top: 100, right: 24, bottom: 188, left: 52 },
    });

    expect(resolvePhonePortraitCameraPreset('east-bay').padding).toEqual({
      top: 96,
      right: 36,
      bottom: 176,
      left: 72,
    });

    expect(resolvePhonePortraitCameraPreset('south-bay').padding).toEqual({
      top: 112,
      right: 32,
      bottom: 184,
      left: 80,
    });

    expect(resolvePhonePortraitCameraPreset('peninsula').padding).toEqual({
      top: 112,
      right: 36,
      bottom: 200,
      left: 84,
    });
  });

  it('gives every region its own padding rather than one shared value', () => {
    const paddings = phonePortraitCameraRegionIds().map((regionId) =>
      JSON.stringify(resolvePhonePortraitCameraPreset(regionId).padding),
    );

    expect(new Set(paddings).size).toBe(paddings.length);
  });

  it('reserves more bottom padding than top on every preset (sheet clearance)', () => {
    for (const regionId of [null, ...phonePortraitCameraRegionIds()]) {
      const preset = resolvePhonePortraitCameraPreset(regionId);
      expect(preset.padding.bottom).toBeGreaterThan(preset.padding.top);
    }
  });

  it('reserves more left padding than right so pins clear the fog rail', () => {
    for (const regionId of [null, ...phonePortraitCameraRegionIds()]) {
      const preset = resolvePhonePortraitCameraPreset(regionId);
      expect(preset.padding.left).toBeGreaterThan(preset.padding.right);
    }
  });

  it('orders every preset south-west → north-east', () => {
    for (const regionId of [null, ...phonePortraitCameraRegionIds()]) {
      const [[west, south], [east, north]] =
        resolvePhonePortraitCameraPreset(regionId).bounds;
      expect(east).toBeGreaterThan(west);
      expect(north).toBeGreaterThan(south);
    }
  });
});
