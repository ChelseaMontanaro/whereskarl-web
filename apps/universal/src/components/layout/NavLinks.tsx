import { Image } from 'expo-image';
import { Link, usePathname } from 'expo-router';
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
 * Native Favorites/Settings artwork, frozen. These two glyphs — and their
 * active/inactive treatment — are restored verbatim from the approved
 * pre-Phase-23.1 implementation, and are deliberately NOT the mobile-web
 * heart/gear paths. Only their size was later re-authorized in the Phase 23
 * physical-iPhone closeout, to stay visually balanced once Home/Map grew to
 * 32pt (see lib/layout/bottomNavIcons for that side).
 *
 * The two glyphs don't scale 1:1 with each other at a shared font size: ⚙
 * draws close to (or past) its own em box, while ♥ draws visibly smaller at
 * the same size. `navGlyph.fontSize` (20) already brings ⚙ to parity with
 * Home/Map; `navGlyphHeart` adds a further native-only bump so ♥ reaches the
 * same rendered weight without moving ⚙.
 */
const NAV_GLYPH = {
  '/favorites': '♥',
  '/settings': '⚙',
} as const;

/**
 * Home and Map only: mobile-web path data in a fixed square, so their weight
 * and vertical centre come from the layout box instead of per-glyph font
 * metrics (see lib/layout/bottomNavIcons).
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
  /** Only the vector (Home/Map) tabs use this — see below. */
  isActive?: boolean;
}) {
  if (isBottomNavVectorHref(href)) {
    return <VectorNavIcon href={href} isActive={isActive} />;
  }

  // Frozen: the approved glyph never re-tinted on active — the label carries
  // the active state. Only the two vector tabs follow mobile web's gold icon.
  return (
    <Text
      style={[
        styles.navGlyph,
        // Heart-only, native-only: closes the remaining size gap to ⚙ without
        // touching ⚙ or either tab's phone-portrait-web rendering.
        href === '/favorites' && !isPhonePortraitWeb && styles.navGlyphHeart,
        isPhonePortraitWeb && styles.navGlyphPhonePortrait,
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
            <NavIcon
              href={item.href}
              isPhonePortraitWeb={isPhonePortraitWeb}
              isActive={isActive}
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
  navIcon: {
    // Home / Map vector box — mobile-web: h-5 w-5 (20px)
    width: BOTTOM_NAV_ICON_SIZE,
    height: BOTTOM_NAV_ICON_SIZE,
  },
  navGlyph: {
    // Favorites / Settings native glyphs — artwork/color verbatim
    // pre-Phase-23.1. fontSize (⚙'s effective size) has been re-calibrated
    // twice against physical-iPhone measurements: 18 → 20 (to reach the 32pt
    // Home/Map icons), then 20 → 18 (⚙'s drawn ink overshoots its own em box,
    // so 20 ended up heavier than Home/Map — 18 measured back to parity).
    fontSize: 18,
    color: NAV_ICON_COLOR,
  },
  // Native-only, independent of navGlyph: ♥'s drawn ink is a *smaller*
  // fraction of its em box than ⚙'s, so the two glyphs never track a shared
  // fontSize. Recalibrated 24 → 22 alongside navGlyph's drop, measured
  // against the current physical-iPhone screenshot to land ♥ at the same
  // perceived height as Home/Map/⚙.
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
