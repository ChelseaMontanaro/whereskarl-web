import { router, type Href } from 'expo-router';

import {
  decidePrimaryNavigation,
  type PrimaryRoute,
} from '@/lib/navigation/primaryRouteHistory';

const PRIMARY_ROUTE_NAMES = new Set(['index', 'map', 'favorites', 'settings']);

type NavigationSnapshot = {
  index?: number;
  routes?: Array<{
    name: string;
    params?: Record<string, unknown>;
    state?: NavigationSnapshot;
  }>;
};

function readParam(params: Record<string, unknown> | undefined, key: string): string | undefined {
  const value = params?.[key];
  if (typeof value === 'string' && value.trim().length > 0) {
    return value;
  }

  if (Array.isArray(value) && typeof value[0] === 'string' && value[0].trim().length > 0) {
    return value[0];
  }

  return undefined;
}

function snapshotHasPrimaryScreens(state: NavigationSnapshot): boolean {
  return (state.routes ?? []).some((route) => PRIMARY_ROUTE_NAMES.has(route.name));
}

/**
 * The root navigator owns Home, Map, Favorites, and Settings. If a parent
 * state is returned first, follow the focused child until those screens appear.
 */
export function readPrimaryRoutes(state: NavigationSnapshot | null | undefined): PrimaryRoute[] {
  if (!state?.routes?.length) {
    return [];
  }

  if (!snapshotHasPrimaryScreens(state)) {
    const index = state.index ?? state.routes.length - 1;
    return readPrimaryRoutes(state.routes[index]?.state);
  }

  return state.routes.map((route) => ({
    name: route.name,
    params: {
      selected: readParam(route.params, 'selected'),
      entry: readParam(route.params, 'entry'),
      orient: readParam(route.params, 'orient'),
    },
  }));
}

/**
 * Opens a primary screen or a Map selection without appending duplicates.
 * A missing navigation state falls through to push so the first open still works.
 */
export function openPrimaryRoute(href: string, state?: unknown): void {
  const decision = decidePrimaryNavigation(
    readPrimaryRoutes(state as NavigationSnapshot | null | undefined),
    href,
  );
  if (decision.type === 'none') {
    return;
  }

  const destination = decision.href as Href;
  if (decision.type === 'push') {
    router.push(destination);
    return;
  }

  router.dismissTo(destination);
}
