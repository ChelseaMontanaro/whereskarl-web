import { useWindowDimensions } from 'react-native';

const PHONE_PORTRAIT_MAX_WIDTH = 639;

export function usePhonePortrait(): boolean {
  const { width, height } = useWindowDimensions();
  return width <= PHONE_PORTRAIT_MAX_WIDTH && height >= width;
}
