import { Image } from 'expo-image';
import { Link, usePathname } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useMemo } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Radius } from '@/constants/theme';
import { usePhonePortrait } from '@/hooks/usePhonePortrait';
import {
  BOTTOM_NAV_ICON_SIZE,
  bottomNavIconDataUri,
  isBottomNavVectorHref,
  type BottomNavVectorHref,
} from '@/lib/layout/bottomNavIcons';
import {
  bottomNavItems,
  isPrimaryNavActive,
  primaryNavItems,
  type PrimaryNavItem,
} from '@/lib/navigation';

const NAV_ICON_COLOR = 'rgba(255, 255, 255, 0.72)';

/**
 * Native Favorites artwork. The Unicode ♥ is deliberately NOT the
 * mobile-web heart path. Phase 27.3 tints it with Colors.gold when active.
 * Settings uses expo-symbols `gearshape.fill` (not Unicode, not the web SVG).
 */
const NAV_GLYPH = {
  '/favorites': '♥',
} as const;

/**
 * Home and Map: mobile-web path data in a fixed square, so their weight and
 * vertical centre come from the layout box instead of per-glyph font metrics
 * (see lib/layout/bottomNavIcons).
 */
function VectorNavIcon({
  href,
  isActive,
}: {
  href: BottomNavVectorHref;
  isActive?: boolean;
}) {
  const uri = useMemo(
    () => bottomNavIconDataUri(href, isActive ? Colors.gold : NAV_ICON_COLOR),
    [href, isActive],
  );

  return (
    <Image
      source={{ uri }}
      style={styles.navIcon}
      contentFit="contain"
      accessibilityElementsHidden
    />
  );
}

function NavIcon({
  href,
  isPhonePortraitWeb,
  isActive,
}: {
  href: PrimaryNavItem['href'];
  isPhonePortraitWeb: boolean;
  isActive?: boolean;
}) {
  if (href === '/settings') {
    return (
      <SymbolView
        name="gearshape.fill"
        type="monochrome"
        tintColor={isActive ? Colors.gold : NAV_ICON_COLOR}
        size={BOTTOM_NAV_ICON_SIZE}
        resizeMode="scaleAspectFit"
        accessibilityElementsHidden
      />
    );
  }

  if (isBottomNavVectorHref(href)) {
    return <VectorNavIcon href={href} isActive={isActive} />;
  }

  return (
    <Text
      style={[
        styles.navGlyph,
        href === '/favorites' && !isPhonePortraitWeb && styles.navGlyphHeart,
        isPhonePortraitWeb && styles.navGlyphPhonePortrait,
        isActive && styles.navGlyphActive,
      ]}>
      {NAV_GLYPH[href]}
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
            <View style={styles.navIconWrapper}>
              <NavIcon
                href={item.href}
                isPhonePortraitWeb={isPhonePortraitWeb}
                isActive={isActive}
              />
            </View>
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
    // Mobile-web: px-3 py-2
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  bottomLinkActive: {},
  bottomLinkInner: {
    alignItems: 'center',
    // Mobile-web: gap-1
    gap: 4,
    maxWidth: 88,
  },
  bottomLabel: {
    // Mobile-web: text-xs
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 14,
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.55)',
  },
  bottomLabelMap: {
    fontSize: 12,
    lineHeight: 14,
    letterSpacing: 0.1,
  },
  bottomLabelPhonePortrait: {
    fontSize: 12,
    lineHeight: 14,
  },
  bottomLabelMapPhonePortrait: {
    fontSize: 12,
    lineHeight: 14,
  },
  bottomLabelActive: {
    color: Colors.gold,
  },
  // Shared structural box for all four tabs. 32 is the smallest size that
  // still contains Home/Map at BOTTOM_NAV_ICON_SIZE without shrinking
  // Favorites (♥ 22) or raising the bar. Glyphs are centered inside; vectors
  // fill it. Gap 4 remains between this box and the label, so all four
  // labels share one baseline.
  navIconWrapper: {
    width: BOTTOM_NAV_ICON_SIZE,
    height: BOTTOM_NAV_ICON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIcon: {
    width: BOTTOM_NAV_ICON_SIZE,
    height: BOTTOM_NAV_ICON_SIZE,
  },
  navGlyph: {
    color: NAV_ICON_COLOR,
  },
  navGlyphActive: {
    color: Colors.gold,
  },
  // 22 is the frozen Favorites optical-size authority.
  navGlyphHeart: {
    fontSize: 22,
  },
  navGlyphPhonePortrait: {
    fontSize: 20,
  },
  pressed: {
    opacity: 0.86,
  },
});
