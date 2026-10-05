import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  PHONE_SHEET_GRABBER_SWIPE_THRESHOLD,
  locationCardGrabberShouldClaimSwipe,
  nextLocationCardExpanded,
  resolveLocationCardGrabberSwipe,
} from '@/lib/map/locationCardGrabberSwipe';

function readSource(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), 'utf8');
}

describe('phone sheet grabber swipe threshold', () => {
  it('uses the same 28-point snap as the mobile-web grab handle', () => {
    expect(PHONE_SHEET_GRABBER_SWIPE_THRESHOLD).toBe(28);
  });

  it('expands on an upward move of 28 points or more', () => {
    expect(resolveLocationCardGrabberSwipe(0, -28)).toBe('EXPAND');
    expect(resolveLocationCardGrabberSwipe(0, -29)).toBe('EXPAND');
    expect(resolveLocationCardGrabberSwipe(0, -80)).toBe('EXPAND');
  });

  it('collapses on a downward move of 28 points or more', () => {
    expect(resolveLocationCardGrabberSwipe(0, 28)).toBe('COLLAPSE');
    expect(resolveLocationCardGrabberSwipe(0, 29)).toBe('COLLAPSE');
    expect(resolveLocationCardGrabberSwipe(0, 80)).toBe('COLLAPSE');
  });

  it('ignores movement below the threshold', () => {
    expect(resolveLocationCardGrabberSwipe(0, -27)).toBe('NONE');
    expect(resolveLocationCardGrabberSwipe(0, 27)).toBe('NONE');
    expect(resolveLocationCardGrabberSwipe(0, 0)).toBe('NONE');
    expect(resolveLocationCardGrabberSwipe(4, -6)).toBe('NONE');
  });

  it('ignores mostly horizontal movement', () => {
    expect(resolveLocationCardGrabberSwipe(40, 0)).toBe('NONE');
    expect(resolveLocationCardGrabberSwipe(-40, 10)).toBe('NONE');
    expect(resolveLocationCardGrabberSwipe(50, -40)).toBe('NONE');
  });

  it('ignores a small diagonal movement', () => {
    expect(resolveLocationCardGrabberSwipe(8, -6)).toBe('NONE');
    expect(resolveLocationCardGrabberSwipe(-12, 10)).toBe('NONE');
  });

  it('treats an equal vertical component at the threshold as a swipe', () => {
    expect(resolveLocationCardGrabberSwipe(28, -28)).toBe('EXPAND');
    expect(resolveLocationCardGrabberSwipe(-28, 28)).toBe('COLLAPSE');
  });
});

describe('phone sheet grabber swipe result', () => {
  it('expands a collapsed sheet and leaves an expanded sheet open', () => {
    expect(nextLocationCardExpanded(false, 0, -28)).toBe(true);
    expect(nextLocationCardExpanded(true, 0, -40)).toBe(true);
  });

  it('collapses an expanded sheet and leaves a collapsed sheet closed', () => {
    expect(nextLocationCardExpanded(true, 0, 28)).toBe(false);
    expect(nextLocationCardExpanded(false, 0, 40)).toBe(false);
  });

  it('does not change the sheet for a short or sideways move', () => {
    expect(nextLocationCardExpanded(false, 0, -27)).toBe(false);
    expect(nextLocationCardExpanded(true, 0, 10)).toBe(true);
    expect(nextLocationCardExpanded(false, 40, 0)).toBe(false);
    expect(nextLocationCardExpanded(true, -50, 10)).toBe(true);
  });

  it('claims a qualifying swipe, including sideways, and leaves a tap alone', () => {
    expect(locationCardGrabberShouldClaimSwipe(0, -28)).toBe(true);
    expect(locationCardGrabberShouldClaimSwipe(0, 28)).toBe(true);
    expect(locationCardGrabberShouldClaimSwipe(40, 0)).toBe(true);
    expect(locationCardGrabberShouldClaimSwipe(0, -10)).toBe(false);
    expect(locationCardGrabberShouldClaimSwipe(0, 0)).toBe(false);
    expect(locationCardGrabberShouldClaimSwipe(8, -6)).toBe(false);
  });
});

describe('phone sheet grabber swipe source contract', () => {
  const sheet = readSource('src/components/SelectedLocationPreview.tsx');
  const map = readSource('src/app/map.tsx');
  const karlMap = readSource('src/components/KarlMap/KarlMap.native.tsx');

  it('keeps the grabber tap and attaches the responder only to the grabber', () => {
    expect(sheet).toContain('onPress={handleToggleExpanded}');
    expect(sheet).toContain('onPress={handleSurfacePress}');
    expect(sheet).toContain('{...grabberPanResponder.panHandlers}');
    expect(sheet).toContain('accessibilityRole="button"');
    expect(sheet).toContain(
      "isExpanded ? 'Collapse details' : 'Expand details'",
    );
    expect(sheet).toContain('accessibilityState={{ expanded: isExpanded }}');

    const grabber = sheet.slice(
      sheet.indexOf('grabberPanResponder'),
      sheet.indexOf('onPress={handleSurfacePress}'),
    );
    expect(grabber).toContain('panHandlers');

    const scroll = sheet.slice(sheet.indexOf('{isExpanded ? ('));
    expect(scroll).not.toContain('panHandlers');
    expect(scroll).not.toContain('PanResponder');
    expect(sheet).not.toContain("from 'react-native-gesture-handler'");
    expect(sheet).not.toContain("from 'react-native-reanimated'");
    expect(sheet).toContain('PanResponder');
  });

  it('swallows a recognized swipe so the trailing tap cannot reverse it', () => {
    const toggle = sheet.slice(
      sheet.indexOf('function handleToggleExpanded('),
      sheet.indexOf('function handleSurfacePress('),
    );

    expect(toggle).toContain('grabberSwipeAppliedRef.current');
    expect(toggle).toContain('return;');
    expect(toggle).toContain('const next = !current');
  });

  it('sets the existing expanded flag from the swipe and does not dismiss', () => {
    const grant = sheet.slice(
      sheet.indexOf('onPanResponderGrant:'),
      sheet.indexOf('onPanResponderRelease:'),
    );

    expect(grant).toContain('resolveLocationCardGrabberSwipe');
    expect(grant).toContain('nextLocationCardExpanded');
    expect(grant).not.toContain('onDismiss');
    expect(grant).not.toContain('setSelected');
  });

  it('still collapses when the selected location changes', () => {
    expect(sheet).toContain('setIsExpanded(false)');
    expect(sheet).toContain('}, [location.id]);');
  });

  it('leaves the body tap expand-only and the expanded scroller in place', () => {
    const surfacePress = sheet.slice(
      sheet.indexOf('function handleSurfacePress('),
      sheet.indexOf('return (', sheet.indexOf('function handleSurfacePress(')),
    );

    expect(surfacePress).toContain('if (isExpanded || !surfaceExpandArmed)');
    expect(sheet).toContain('nestedScrollEnabled');
    expect(sheet.indexOf('</Pressable>\n\n      {isExpanded ? (')).toBeGreaterThan(
      sheet.indexOf('onPress={handleSurfacePress}'),
    );
  });

  it('does not put the grabber responder on the map', () => {
    expect(map).not.toContain('grabberPanResponder');
    expect(map).not.toContain('locationCardGrabberSwipe');
    expect(karlMap).not.toContain('PanResponder');
    expect(karlMap).not.toContain('onPanDrag');
  });
});
