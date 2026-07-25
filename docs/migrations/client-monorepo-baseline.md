# Client Monorepo Migration — Phase 1 Baseline

**Branch:** `migration/client-monorepo`  
**Baseline commit:** `bd00a1a`  
**Source:** `main` / `origin/main`  
**Captured:** 2026-07-24  

## Preconditions

- Working tree was clean before validation
- Migration freeze was active
- No application, dependency, configuration, or structural changes were made

## Command results

### 1. Web `npm run typecheck`

- **Result:** FAIL
- **Errors:** 6 × TS1501 in `tests/map/phonePortraitAttributionCss.test.ts`
- **Cause:** regular-expression `s` flag requires ES2018 or later
- **Classification:** known pre-existing baseline failure

### 2. Web `npm test`

- **Result:** FAIL
- **Files:** 90 test files passed / 1 failed
- **Tests:** 747 passed / 5 failed (752 total)
- **Failing file:** `tests/components/BayAreaMap.test.tsx`
- **Classification:** known pre-existing baseline failures

Failing test descriptions:

- phone portrait overlay padding when framing filtered markers
- glass-pill labels for Karl Territory markers (desktop)
- glass-pill labels for Clear markers (desktop)
- glass-pill labels for Light Fog markers (desktop)
- only San Francisco clear markers when SF region + Clear filter active

### 3. Web `npm run build`

- **Result:** PASS
- **Notes:** ESLint warnings only (not fixed)

Warning categories:

- `react-hooks/exhaustive-deps`
- `@next/next/no-img-element`
- unused eslint-disable directive

### 4. Universal `npm run typecheck`

- **Result:** PASS

## Additional notes

- Manual map/home smoke testing was not run
- The migration plan audit referenced commit `0752da5`
- This executable baseline was captured at `bd00a1a`
- The delta between those commits was documentation only

## Baseline rules

- These failures must not be silently fixed or reclassified during the migration
- Any additional failure introduced after this checkpoint is presumed migration-related until investigated
