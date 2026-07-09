import { StyleSheet, View } from 'react-native';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LiquidGlassSurface } from '@/components/ui/LiquidGlassSurface';
import { PrimaryNavList } from '@/components/layout/NavLinks';
import { MaxContentWidth } from '@/constants/theme';
import { useMinWidth } from '@/hooks/useMinWidth';
import { usePhonePortrait } from '@/hooks/usePhonePortrait';

export function BottomNav() {
  const insets = useSafeAreaInsets();
  const isDesktop = useMinWidth(1024);
  const isPhonePortraitWeb = Platform.OS === 'web' && usePhonePortrait();

  if (isDesktop) {
    return null;
  }

  return (
    <LiquidGlassSurface
      variant="bottomBar"
      style={[
        styles.nav,
        { paddingBottom: Math.max(insets.bottom, 8) },
        isPhonePortraitWeb && styles.navPhonePortrait,
      ]}>
      <View style={styles.inner}>
        <PrimaryNavList layout="bottom" />
      </View>
    </LiquidGlassSurface>
  );
}

const styles = StyleSheet.create({
  nav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 30,
  },
  inner: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingTop: 8,
    paddingHorizontal: 4,
  },
  navPhonePortrait: {
    paddingTop: 2,
  },
});
