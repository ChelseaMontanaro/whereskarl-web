/**
 * Primary-screen navigation for the single root stack.
 *
 * Home, Map, Favorites, and Settings are sibling stack routes, not tabs.
 * `router.push` and a plain `Link` both append another copy. This module
 * chooses push or dismiss-to so those four screens cannot pile up, and so
 * Map ↔ Favorites keeps the existing Map mounted.
 *
 * `router.dismissTo` pops to a screen that already exists. If that screen
 * sits underneath Map, the pop would destroy the Map. Returning to Favorites
 * in that case pushes one Favorites screen above Map instead. The next
 * Favorite selection dismisses back to that same Map.
 */

export type PrimaryRoute = {
  name: string;
  params?: {
    selected?: string;
  };
};

export type PrimaryNavigationDecision =
  | { type: 'none' }
  | { type: 'push'; href: string }
  | { type: 'dismissTo'; href: string };

const PRIMARY_SCREEN_BY_PATH: Record<string, string> = {
  '/': 'index',
  '/map': 'map',
  '/favorites': 'favorites',
  '/settings': 'settings',
};

export function primaryScreenNameFromHref(href: string): string | null {
  const path = href.split('?')[0] ?? href;
  return PRIMARY_SCREEN_BY_PATH[path] ?? null;
}

function queryParams(href: string): { selected?: string } {
  const query = href.split('?')[1];
  if (!query) {
    return {};
  }

  const selected = new URLSearchParams(query).get('selected') ?? undefined;
  return selected ? { selected } : {};
}

function findLastIndex(routes: PrimaryRoute[], name: string): number {
  for (let index = routes.length - 1; index >= 0; index -= 1) {
    if (routes[index]?.name === name) {
      return index;
    }
  }

  return -1;
}

/**
 * A bare `/map` visit must not wipe a selection already on the Map screen.
 * Favorite opens pass `selected` explicitly and replace it.
 */
function hrefPreservingMapSelection(routes: PrimaryRoute[], href: string): string {
  if (primaryScreenNameFromHref(href) !== 'map') {
    return href;
  }

  if (queryParams(href).selected) {
    return href;
  }

  const map = routes[findLastIndex(routes, 'map')];
  const selected = map?.params?.selected;
  if (!selected) {
    return href;
  }

  const params = new URLSearchParams(href.split('?')[1] ?? '');
  params.set('selected', selected);
  return `/map?${params.toString()}`;
}

export function decidePrimaryNavigation(
  routes: PrimaryRoute[],
  href: string,
): PrimaryNavigationDecision {
  const resolvedHref = hrefPreservingMapSelection(routes, href);
  const name = primaryScreenNameFromHref(resolvedHref);
  if (!name) {
    return { type: 'push', href: resolvedHref };
  }

  const current = routes[routes.length - 1];
  if (current?.name === name) {
    if (
      name === 'map' &&
      (current.params?.selected ?? '') !== (queryParams(resolvedHref).selected ?? '')
    ) {
      return { type: 'dismissTo', href: resolvedHref };
    }

    return { type: 'none' };
  }

  const targetIndex = findLastIndex(routes, name);
  if (targetIndex < 0) {
    return { type: 'push', href: resolvedHref };
  }

  const mapIndex = findLastIndex(routes, 'map');
  const popWouldUnmountMap =
    name === 'favorites' && mapIndex > targetIndex;

  if (popWouldUnmountMap) {
    return { type: 'push', href: resolvedHref };
  }

  return { type: 'dismissTo', href: resolvedHref };
}

/**
 * Applies the same push / dismiss-to result the root stack router produces:
 * push appends; dismiss-to keeps the target and drops every screen above it.
 */
export function applyPrimaryNavigation(
  routes: PrimaryRoute[],
  href: string,
): PrimaryRoute[] {
  const decision = decidePrimaryNavigation(routes, href);
  if (decision.type === 'none') {
    return routes;
  }

  const name = primaryScreenNameFromHref(decision.href);
  if (!name) {
    return routes;
  }

  const params = queryParams(decision.href);
  if (decision.type === 'push') {
    return [...routes, { name, params }];
  }

  const targetIndex = findLastIndex(routes, name);
  if (targetIndex < 0) {
    return [...routes, { name, params }];
  }

  return routes.slice(0, targetIndex + 1).map((route, index) => {
    if (index !== targetIndex || !decision.href.includes('?')) {
      return route;
    }

    return {
      name: route.name,
      params: {
        ...route.params,
        ...params,
      },
    };
  });
}

export function countRoutesNamed(routes: PrimaryRoute[], name: string): number {
  return routes.filter((route) => route.name === name).length;
}
