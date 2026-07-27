import { Link, usePathname } from 'expo-router';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Radius } from '@/constants/theme';
import { usePhonePortrait } from '@/hooks/usePhonePortrait';
import {
  bottomNavItems,
  isPrimaryNavActive,
  primaryNavItems,
  type PrimaryNavItem,
} from '@/lib/navigation';

function NavIcon({
  href,
  layout,
  isPhonePortraitWeb,
}: {
  href: PrimaryNavItem['href'];
  layout: NavLayout;
  isPhonePortraitWeb: boolean;
}) {
  const symbol =
    href === '/'
      ? '⌂'
      : href === '/map'
        ? layout === 'bottom'
          ? '⌖'
          : '▣'
        : href === '/favorites'
          ? '♥'
          : '⚙';

  return (
    <Text
      style={[
        styles.navIcon,
        isPhonePortraitWeb && styles.navIconPhonePortrait,
      ]}>
      {symbol}
    </Text>
  );
}

type NavLayout = 'top' | 'bottom';

function PrimaryNavLink({
  item,
  layout,
}: {
  item: PrimaryNavItem;
  layout: NavLayout;
}) {
  const pathname = usePathname();
  const isPhonePortraitWeb = Platform.OS === 'web' && usePhonePortrait();
  const isActive = isPrimaryNavActive(pathname, item.href);

  return (
    <Link href={item.href} asChild>
      <Pressable
        accessibilityRole="link"
        accessibilityState={{ selected: isActive }}
        style={({ pressed }) => [
          layout === 'top' ? styles.topLink : styles.bottomLink,
          isActive && (layout === 'top' ? styles.topLinkActive : styles.bottomLinkActive),
          pressed && styles.pressed,
        ]}>
        {layout === 'bottom' ? (
          <View style={styles.bottomLinkInner}>
            <NavIcon
              href={item.href}
              layout={layout}
              isPhonePortraitWeb={isPhonePortraitWeb}
            />
            <Text
              numberOfLines={2}
              style={[
                styles.bottomLabel,
                item.href === '/map' && styles.bottomLabelMap,
                isPhonePortraitWeb && styles.bottomLabelPhonePortrait,
                item.href === '/map' &&
                  isPhonePortraitWeb &&
                  styles.bottomLabelMapPhonePortrait,
                isActive && styles.bottomLabelActive,
              ]}>
              {item.shortLabel}
            </Text>
          </View>
        ) : (
          <Text style={[styles.topLabel, isActive && styles.topLabelActive]}>
            {item.label}
          </Text>
        )}
      </Pressable>
    </Link>
  );
}

export function PrimaryNavList({ layout }: { layout: NavLayout }) {
  const items = layout === 'bottom' ? bottomNavItems : primaryNavItems;

  return (
    <View style={layout === 'top' ? styles.topList : styles.bottomList}>
      {items.map((item) => (
        <PrimaryNavLink key={item.href} item={item} layout={layout} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  topList: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bottomList: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-around',
    width: '100%',
  },
  topLink: {
    borderRadius: Radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  topLinkActive: {
    borderWidth: 1,
    borderColor: 'rgba(242, 163, 38, 0.25)',
    backgroundColor: 'rgba(242, 163, 38, 0.12)',
  },
  topLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.72)',
  },
  topLabelActive: {
    color: Colors.gold,
  },
  bottomLink: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  bottomLinkActive: {},
  bottomLinkInner: {
    alignItems: 'center',
    gap: 2,
    maxWidth: 88,
  },
  bottomLabel: {
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 12,
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.55)',
  },
  bottomLabelMap: {
    fontSize: 9,
    lineHeight: 11,
    letterSpacing: 0.1,
  },
  bottomLabelPhonePortrait: {
    fontSize: 11,
    lineHeight: 13,
  },
  bottomLabelMapPhonePortrait: {
    fontSize: 10,
    lineHeight: 12,
  },
  bottomLabelActive: {
    color: Colors.gold,
  },
  navIcon: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.72)',
  },
  navIconPhonePortrait: {
    fontSize: 20,
  },
  pressed: {
    opacity: 0.86,
  },
});
