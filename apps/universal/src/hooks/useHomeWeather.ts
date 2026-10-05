import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useFocusEffect } from 'expo-router';

import {
  getBestSunshine,
  getCurrent,
  getKarlIntelligence,
  getLocations,
} from '@whereskarl/api-client';

import { getApiBaseUrl, isApiBaseUrlConfigured } from '@/constants/config';
import {
  createHomeRefreshGuard,
  executeHomeRefresh,
  homeDashboardNightPresentation,
  INITIAL_HOME_WEATHER,
  nextDueDelayMs,
  nextHomeSuccessAt,
  shouldStartHomeRefresh,
  type HomeWeatherSnapshot,
} from '@/lib/home/homeWeatherRefresh';

const apiConfig = { getBaseUrl: getApiBaseUrl };

export type HomeWeatherState = HomeWeatherSnapshot & {
  isNightPresentation: boolean;
};

/**
 * One coordinator for mount/focus, foreground, and the due timer.
 *
 * The due timer stays armed while the app is active, including when Home is
 * covered, because that Home instance remains mounted. Background clears it.
 * Returning to active refreshes only when the last full success is at least
 * 10 minutes old. Blur does not cancel the due timer and does not refetch.
 */
export function useHomeWeather(): HomeWeatherState {
  const [snapshot, setSnapshot] = useState<HomeWeatherSnapshot>(INITIAL_HOME_WEATHER);
  const [isNightPresentation, setIsNightPresentation] = useState(() =>
    homeDashboardNightPresentation(new Date()),
  );
  const snapshotRef = useRef(snapshot);
  const lastSuccessAtRef = useRef<number | null>(null);
  const lastAttemptAtRef = useRef<number | null>(null);
  const inFlightRef = useRef(false);
  const appActiveRef = useRef(AppState.currentState === 'active');
  const guardRef = useRef(createHomeRefreshGuard());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const aliveRef = useRef(true);
  const refreshRef = useRef<() => Promise<void>>(async () => {});

  const clearDueTimer = useCallback(() => {
    if (timerRef.current != null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const armDueTimer = useCallback(() => {
    clearDueTimer();
    if (!appActiveRef.current) {
      return;
    }

    const delay = nextDueDelayMs({
      lastSuccessAt: lastSuccessAtRef.current,
      lastAttemptAt: lastAttemptAtRef.current,
      now: Date.now(),
    });
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      void refreshRef.current();
    }, delay);
  }, [clearDueTimer]);

  const refresh = useCallback(async () => {
    if (!isApiBaseUrlConfigured()) {
      if (aliveRef.current) {
        const next = { ...INITIAL_HOME_WEATHER, isLoading: false };
        snapshotRef.current = next;
        setSnapshot(next);
      }
      return;
    }

    const decision = shouldStartHomeRefresh({
      lastSuccessAt: lastSuccessAtRef.current,
      now: Date.now(),
      inFlight: inFlightRef.current,
    });
    if (decision === 'skip-inflight') {
      return;
    }
    if (decision === 'skip-fresh') {
      armDueTimer();
      return;
    }

    clearDueTimer();
    inFlightRef.current = true;
    const token = guardRef.current.issue();

    try {
      const result = await executeHomeRefresh({
        previous: snapshotRef.current,
        now: new Date(),
        getCurrent: () => getCurrent(apiConfig),
        getLocations: () => getLocations(apiConfig),
        getBestSunshine: () => getBestSunshine(apiConfig),
        getKarlIntelligence: (locationId) =>
          getKarlIntelligence(
            apiConfig,
            locationId ? { locationId } : undefined,
          ),
        onCore: (core) => {
          if (!aliveRef.current || !guardRef.current.isCurrent(token)) {
            return;
          }
          snapshotRef.current = core;
          setSnapshot(core);
          setIsNightPresentation(homeDashboardNightPresentation(new Date()));
        },
      });

      if (!aliveRef.current || !guardRef.current.isCurrent(token)) {
        return;
      }

      snapshotRef.current = result.next;
      setSnapshot(result.next);
      setIsNightPresentation(result.isNightPresentation);
      lastSuccessAtRef.current = nextHomeSuccessAt(
        lastSuccessAtRef.current,
        result.fullySuccessful,
        Date.now(),
      );
    } finally {
      if (guardRef.current.isCurrent(token)) {
        inFlightRef.current = false;
        lastAttemptAtRef.current = Date.now();
        if (aliveRef.current) {
          armDueTimer();
        }
      }
    }
  }, [armDueTimer, clearDueTimer]);

  refreshRef.current = refresh;

  useFocusEffect(
    useCallback(() => {
      void refreshRef.current();
      return undefined;
    }, []),
  );

  useEffect(() => {
    aliveRef.current = true;
    const subscription = AppState.addEventListener(
      'change',
      (nextStatus: AppStateStatus) => {
        const active = nextStatus === 'active';
        appActiveRef.current = active;
        if (!active) {
          clearDueTimer();
          return;
        }
        void refreshRef.current();
      },
    );

    return () => {
      aliveRef.current = false;
      clearDueTimer();
      subscription.remove();
    };
  }, [clearDueTimer]);

  return {
    ...snapshot,
    isNightPresentation,
  };
}
