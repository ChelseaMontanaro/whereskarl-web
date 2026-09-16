import { useWindowDimensions } from 'react-native';

import {
  brandTaglineLetterSpacing,
  contentHorizontalPadding,
  floatingChromeMaxWidth,
  resolveLayoutWidthBand,
  type LayoutWidthBand,
} from '@/lib/layout/responsiveWidth';

export type ResponsiveLayout = {
  width: number;
  height: number;
  band: LayoutWidthBand;
  horizontalPadding: number;
  taglineLetterSpacing: number;
  chromeMaxWidth: number;
  isNarrow: boolean;
};

/** Viewport-driven layout tokens — width/safe-area only, no device models. */
export function useResponsiveLayout(): ResponsiveLayout {
  const { width, height } = useWindowDimensions();
  const band = resolveLayoutWidthBand(width);

  return {
    width,
    height,
    band,
    horizontalPadding: contentHorizontalPadding(width),
    taglineLetterSpacing: brandTaglineLetterSpacing(width),
    chromeMaxWidth: floatingChromeMaxWidth(width),
    isNarrow: band === 'narrow',
  };
}
