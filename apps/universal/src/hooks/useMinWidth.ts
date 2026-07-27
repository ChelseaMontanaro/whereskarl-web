import { useWindowDimensions } from 'react-native';

export function useMinWidth(minWidthPx: number): boolean {
  const { width } = useWindowDimensions();
  return width >= minWidthPx;
}
