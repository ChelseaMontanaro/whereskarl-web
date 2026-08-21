import type { KarlMapLayoutMode } from '@/lib/map/mapConfig';

export type MapScreenLayoutProfile = 'desktop' | 'tablet' | 'phone';

export function resolveMapScreenLayoutProfile(
  width: number,
  isPhonePortrait: boolean,
  options?: { platformOS?: string; height?: number },
): MapScreenLayoutProfile {
  if (width >= 1024) {
    return 'desktop';
  }

  // Native phones (portrait or landscape) use immersive phone chrome. Classify
  // by shortest side so landscape iPhones never fall into the tablet stack.
  const height = options?.height ?? width;
  const shortestSide = Math.min(width, height);
  const isNativePhone =
    (options?.platformOS === 'ios' || options?.platformOS === 'android') &&
    shortestSide < 500;

  if (isPhonePortrait || width < 600 || isNativePhone) {
    return 'phone';
  }

  return 'tablet';
}

export function mapLayoutModeForProfile(
  profile: MapScreenLayoutProfile,
): KarlMapLayoutMode {
  return profile === 'desktop' ? 'desktop' : 'mobile';
}
