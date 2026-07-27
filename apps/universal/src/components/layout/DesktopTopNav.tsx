import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { KarlLogo } from '@/components/brand/KarlLogo';
import { FindClearSkiesCta } from '@/components/home/FindClearSkiesCta';
import { PrimaryNavList } from '@/components/layout/NavLinks';
import { Colors, Fonts } from '@/constants/theme';
import { useClearSkiesNav } from '@/providers/ClearSkiesNavProvider';
import { useMinWidth } from '@/hooks/useMinWidth';

export function DesktopTopNav() {
  const insets = useSafeAreaInsets();
  const isDesktop = useMinWidth(1024);
  const { locationId, isLoading } = useClearSkiesNav();

  if (!isDesktop) {
    return null;
  }

  return (
    <View
      style={[styles.header, { paddingTop: insets.top + 12 }]}
      pointerEvents="box-none">
      <View style={styles.inner}>
        <Link href="/" asChild>
          <Pressable
            accessibilityRole="link"
            style={({ pressed }) => [styles.brand, pressed && styles.pressed]}>
            <KarlLogo size={32} />
            <View style={styles.brandText}>
              <Text style={styles.title}>Where&apos;s Karl?</Text>
              <Text style={styles.subtitle}>Track Karl across the Bay</Text>
            </View>
          </Pressable>
        </Link>

        <View style={styles.navCenter}>
          <PrimaryNavList layout="top" />
        </View>

        <FindClearSkiesCta
          locationId={locationId}
          isLoading={isLoading}
          variant="header"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.42)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    paddingHorizontal: 24,
    paddingBottom: 14,
    maxWidth: 1280,
    width: '100%',
    alignSelf: 'center',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 0,
  },
  brandText: {
    gap: 2,
  },
  title: {
    fontFamily: Fonts?.serif,
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.3,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    color: 'rgba(242, 163, 38, 0.9)',
  },
  navCenter: {
    flex: 1,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.88,
  },
});
