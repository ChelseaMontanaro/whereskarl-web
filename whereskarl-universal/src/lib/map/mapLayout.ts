import type { KarlMapLayoutMode } from '@/lib/map/mapConfig';

export type MapScreenLayoutProfile = 'desktop' | 'tablet' | 'phone';

export function resolveMapScreenLayoutProfile(
  width: number,
  isPhonePortrait: boolean,
): MapScreenLayoutProfile {
  if (width >= 1024) {
    return 'desktop';
  }

  if (isPhonePortrait || width < 600) {
    return 'phone';
  }

  return 'tablet';
}

export function mapLayoutModeForProfile(
  profile: MapScreenLayoutProfile,
): KarlMapLayoutMode {
  return profile === 'desktop' ? 'desktop' : 'mobile';
}
