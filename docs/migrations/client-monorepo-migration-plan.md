# Where’s Karl — Client Monorepo Migration Execution Plan v1.3

**Status:** Historical — migration executed on `migration/client-monorepo`; technical closeout `f364882`; documentation closeout Phase 16
**Completion record:** [`client-monorepo-completion.md`](./client-monorepo-completion.md)
**Permanent architecture guide:** [`../architecture/system-architecture.md`](../architecture/system-architecture.md)
**Basis:** `docs/architecture/client-monorepo-architecture.md` (WK-CLIENT-ARCH-1.0) + repository audit on `main` @ `0752da5`
**Repo:** `ChelseaMontanaro/whereskarl-web` (do **not** rename as part of this migration)
**Audit date:** 2026-07-24
**Working tree at audit:** clean; branch `main` up to date with `origin/main`
**Changelog vs v1.2:** Architecture Change Gate approval-before-spec-update; “currently approved reference implementation” wording

This document is **preserved as migration history**. Do not treat its “current state” inventory or unchecked Definition of Done boxes as live repository status. Live architecture and operations live in the permanent docs linked above.

Architectural principles, package responsibilities, dependency matrix, and forbidden packages are defined only in [`docs/architecture/client-monorepo-architecture.md`](../architecture/client-monorepo-architecture.md). This plan executed that specification; it does not re-own those rules.

---

# Architecture Authority

- The approved architecture specification ([`client-monorepo-architecture.md`](../architecture/client-monorepo-architecture.md)) is the **canonical architectural authority**.
- This migration plan exists **solely to implement** that architecture.
- If a conflict is discovered between this migration plan and the architecture specification, **implementation must pause**.
- The migration plan must **never silently override or redefine** architectural decisions.
- Any architectural correction must be made in the **architecture specification first**, then this plan updated if needed, before implementation resumes.

**Authority chain:**

```
Architecture Specification
        ↓
Migration Plan
        ↓
Implementation
```

---

# Migration Freeze

During migration, freeze:

| Freeze | Rule |
|--------|------|
| Features | No roadmap feature work |
| Bugs | No unrelated bug fixes (except migration blockers) |
| UI | No redesign / visual cleanup |
| Dependencies | No version upgrades unless a **proven** build/install/runtime blocker |
| Backend | No contract changes |
| Refactors | No opportunistic cleanup beyond approved structure |
| Renames | Only renames required by `apps/*` / `packages/*` moves |
| Behavior | No product behavior changes without separate owner approval |
| Repo | No GitHub repository rename |
| Deploy | No Vercel/EAS config changes until the matching local checkpoint passes |

**Exception process:** If a genuine blocker appears (e.g. Expo cannot resolve workspace packages without a Metro config; Vercel cannot install without Root Directory), document: blocker evidence → minimal fix → owner ack if behavior/deploy surface changes → proceed. Prefer the smallest reversible change. Do not expand scope into “while we’re here.”

### No Temporary Compatibility Shims

Temporary wrapper / forwarding modules must not be introduced unless absolutely necessary.

**Disallowed by default** (examples):

- `export * from "../../packages/api-client"`
- App-local barrels that re-export `@whereskarl/*` solely to preserve old import paths
- “Thin” duplicate modules that forward to packages while leaving old paths in place indefinitely

**If a temporary compatibility layer is unavoidable:**

1. Document why it is required and which imports still depend on it  
2. Define an **explicit removal phase/commit** before migration complete  
3. Never leave it in the final architecture  

Goal: avoid permanent architectural debt created during the move.

---

# 1. Executive Summary

### Current state (observed)

- Next.js 15 web app lives at the **repository root** (`app/`, `components/`, `lib/`, `tests/`, `public/`).
- Expo Universal app lives nested at `whereskarl-universal/` with its **own** `package.json`, `package-lock.json`, and `node_modules/`.
- One parent Git repo; **no nested `.git`** under Universal.
- **No npm workspaces**; root `package.json` has no `workspaces` field.
- Web has Zod-validated API + ~91 Vitest files; Universal uses plain TypeScript types, no Zod, **no automated tests**, Expo defaults (no `metro.config.js`, no `eas.json`, no `babel.config.*`).
- Duplicated client logic already drifts (search, region chips, score presentation, deep-link param writer, schemas vs types).

### Target state

As specified in the architecture document §3:

```
apps/web/          # Next.js
apps/universal/    # Expo
packages/{schemas,api-client,search,domain,design,config}/
package.json       # npm workspaces root
package-lock.json  # single lockfile
```

Backend and native Swift remain separate (architecture ADRs / ownership model).

### Migration strategy

1. **Structural first** — establish workspaces and move apps; restore green builds before extraction.  
2. **Extract shared packages in dependency order** — `design` → `config` → `schemas` → `api-client` → `search` → `domain` (edges per architecture §11).  
3. **Canonicalize from the currently approved reference implementation**, which today is the Web client for the identified shared concerns (Zod, alias search, score bands), **only after** owner approval of known drift resolutions. Web is not permanently privileged—it is today's approved reference implementation for those audited shared concerns.  
4. **Small reversible checkpoints** — one coherent commit per phase; recommended hierarchical phase branches + git tags.  
5. **Deploy config last** among structural concerns — after local workspace + Metro resolution are proven.

### Major risks

- Next.js / Vercel Root Directory + workspace install  
- Expo Metro monorepo package resolution (no Metro config today)  
- Duplicate React / React Native copies after hoisting  
- Hidden behavior change when replacing Universal’s divergent search/regions/score with the currently approved reference implementation  
- Pre-existing Web test failures masking migration regressions  

### Why this ordering is safest

Moving apps without extraction first isolates path/alias/install breakage from semantic extraction breakage. Extracting leaf packages (`design`, `config`, `schemas`) before dependents prevents cycles. Deferring Vercel/EAS until local validation reduces partially deployed states.

---

# 2. Scope

### In scope

- npm workspaces + one root lockfile  
- Move Web → `apps/web`, Universal → `apps/universal`  
- Create and wire `@whereskarl/{schemas,api-client,search,domain,design,config}` per architecture §4  
- Replace duplicated modules with shared imports  
- App-local adapters for env (`NEXT_PUBLIC_*` / `EXPO_PUBLIC_*`) per architecture §9  
- Metro + TypeScript resolution for workspace packages  
- Vercel Root Directory / install/build updates (after local pass)  
- Tests/scripts/docs updates required for the new tree  
- Architecture guardrails (exports, restricted imports) aligning with architecture §11–§16  

### Out of scope

- Backend repo / API contract changes  
- Native Swift iOS repo  
- GitHub repository rename  
- Turborepo / Nx / pnpm / Yarn  
- Packages forbidden in architecture §4.7 (`ui`, analytics, content, maps, etc.)  
- UI redesign, performance work, roadmap features  
- Publishing packages to npm  
- Resolving pre-existing Web test failures **unless** they block migration validation (record as baseline)

### Explicitly deferred

- Unifying map camera/viewport padding profiles across platforms (app-owned per architecture §6 / ADR-012)  
- Sharing map SDK code / KarlMap / BayAreaMap  
- Sharing React components  
- Adding Universal test suite beyond package-level shared tests  
- Analytics enablement  
- React / TypeScript version unification beyond what install requires  
- Product decision to change Universal deep-link writer from `selected` → `location` (or vice versa) — **must be decided before shared routing helpers land**

---

# 3. Current-State Repository Inventory

## 3.1 Repository root (observed)

| Item | Observed |
|------|----------|
| Git | `main` @ `0752da5` (“docs: add client monorepo architecture specification”); clean WT |
| Remote | `https://github.com/ChelseaMontanaro/whereskarl-web.git` |
| Root `package.json` | `name: whereskarl-web`, scripts: `dev/build/start/lint/typecheck/test`, **no workspaces** |
| Lockfile | `package-lock.json` (lockfileVersion 3) — Web only |
| Node modules | Root `node_modules/` + `whereskarl-universal/node_modules/` |
| TS | `tsconfig.json` — `@/*` → `./*`; **excludes** `whereskarl-universal` |
| Next | `next.config.ts` — remote hero blob host; prod requires `NEXT_PUBLIC_API_URL` |
| ESLint | `eslint.config.mjs` — Next core-web-vitals; does **not** ignore Universal |
| Vitest | `vitest.config.ts` — `tests/**/*.test.{ts,tsx}`, alias `@` → `.` |
| Env | `.env.example` (`NEXT_PUBLIC_API_URL`); `.env.local` present locally, gitignored |
| Vercel | `.vercel/project.json` (local); **no** committed `vercel.json` |
| Docs | `docs/architecture/client-monorepo-architecture.md` only |
| Misc | Empty `main` file; `outputs/`, `tmp/`, `.audit-screenshots/` (gitignored artifacts) |
| `.gitignore` | `/node_modules` (root-only pattern); Universal ignored via its own `.gitignore` |

**Root dependencies (Web):** Next `^15.5.20`, React `19.2.4`, Zod `^4.4.3`, MapLibre `^5.24.0`, TanStack Query, Tailwind 4, Vitest 4.

## 3.2 Web application inventory

**Routes (`app/`):** `/`, `/map`, `/favorites`, `/settings`, `/privacy`, `/support`, `/dev/*` (aqi-gallery, metrics audits), `robots.ts`, `sitemap.ts`, `error.tsx`, `globals.css`.

**Key `lib/` clusters:**

| Cluster | Paths |
|---------|-------|
| API | `lib/api/{client,weather,health,intelligence}.ts` |
| Schemas | `lib/schemas/{parse,shared,weather,health,intelligence}.ts` |
| Search | `lib/map/locationSearch.ts` |
| Score | `lib/score/clearSkiesScore.ts` |
| Weather presentation | `lib/weather/{airQuality,uvIndex,pollen,humidity,visibility,climate,environmentalDisplay,dataStatus}.ts` |
| Regions / routing | `lib/map/{config,regions,routing,locationSelection,conditions,intensityFilter}.ts` |
| Design | `lib/constants/designTokens.ts` |
| Config / env | `lib/constants/config.ts`, `lib/env/publicEnv.ts`, `lib/site/*` |
| Maps (app-owned) | `lib/map/{markers,fogOverlays,viewport,styles,phonePortrait*}.ts` |
| Home | `lib/home/*` |
| Storage | `lib/storage/*` |

**Tests:** 91 files under `tests/`; fixture JSON under `tests/fixtures/`.  
**Baseline at audit:** `90 passed / 1 failed` file — `tests/components/BayAreaMap.test.tsx` has **5 failing tests** (phone-portrait padding + glass-pill marker visibility). Treat as **known pre-existing**, not migration regressions, once reconfirmed on the migration branch tip before Phase 1 starts.

**Alias assumption:** imports use `@/...` mapped to **repo root**.

## 3.3 Universal application inventory

| Item | Observed |
|------|----------|
| Path | `whereskarl-universal/` |
| Package | `whereskarl-universal` v1.0.0; Expo ~57; React `19.2.3` (**≠ Web 19.2.4**); TS `~6.0.3` (**≠ Web ^5**); **no Zod** |
| Lockfile | Own `package-lock.json` |
| Router | Expo Router under `src/app/` — `index`, `map`, `favorites`, `settings`, `location/[id]` |
| Alias | `@/*` → `./src/*` |
| Config | `app.json` only; **no** `metro.config.js`, **no** `eas.json`, **no** babel config file |
| API | `src/services/api.ts` — fetch helpers + `getCurrent/getLocations/getBestSunshine` (**no** health/intelligence; **no** Zod parse) |
| Types | `src/types/{weather,shared}.ts` — plain types; **no `search.aliases`**, **no `climate`** on `LocationWeather` |
| Search | `filterLocationsBySearch` in `src/lib/map/locationsDisplay.ts` — substring on name/region/id; empty query returns **all** locations |
| Score UI | `src/components/ClearSkiesScore.tsx` — clamp + gold bar; **no** band colors/labels |
| Regions | `src/lib/map/regions.ts` — **4** visible chips; `peninsula` → **`san-francisco`** |
| Env | `EXPO_PUBLIC_API_URL` via `src/constants/config.ts` |
| Assets | `assets/images/*`, `assets/expo.icon/*` |
| Tests | **None** |
| Typecheck | `tsc --noEmit` exits 0 at audit |

**Version drift (observed):** React 19.2.4 vs 19.2.3; TypeScript ^5 vs ~6.0.3; Zod present only on Web.

## 3.4 Critical behavior drift (must not be silently “fixed” during move)

| Concern | Web (currently approved reference implementation for these concerns) | Universal | Migration implication |
|---------|-----------------------------------------------|-----------|------------------------|
| Search | Prefix on name + `search.aliases`; empty → `[]` | Substring name/region/id; empty → all | **Owner decision** before `@whereskarl/search` adoption |
| Region chips | 5 visible incl. **Peninsula** | 4 visible; peninsula maps to SF | **Owner decision** before domain regions extract |
| Clear Skies bands | `lib/score/clearSkiesScore.ts` (75/50 thresholds, colors, labels) | Clamp only; gold UI | Sharing approved bands **changes Universal UI** → approval |
| Deep-link write | `buildMapHref` → `?location=` | `buildMapHref` → `?selected=` | Both **read** `location`/`selected` on Web; Uni writes `selected` only |
| Contracts | Zod + parse | Plain types, no validate | Extracting schemas **adds** fail-closed validation to Uni |
| SF bounds | Tighter SF chip bounds | Wider SF bounds (comments cite phone composition) | Keep viewport math **app-local**; share membership carefully |

---

# 4. Target-State Mapping

| Current path | Target path | Action | Notes |
|--------------|-------------|--------|-------|
| `app/` | `apps/web/app/` | Move | Next App Router |
| `components/` | `apps/web/components/` | Move | Web-only UI |
| `lib/` (app adapters remaining) | `apps/web/lib/` | Move then thin | Env, storage, map SDK helpers stay |
| `public/` | `apps/web/public/` | Move | |
| `tests/` | `apps/web/tests/` | Move | Package tests move with packages |
| `package.json` (web deps) | `apps/web/package.json` | Split | Root becomes workspace orchestrator |
| `package-lock.json` (root) | regenerate root lock | Replace | Single lockfile |
| `next.config.ts` | `apps/web/next.config.ts` | Move | May need `transpilePackages` |
| `tsconfig.json` | `apps/web/tsconfig.json` | Move | `@/*` → app root; extend optional `tsconfig.base.json` |
| `eslint.config.mjs` | `apps/web/eslint.config.mjs` | Move | |
| `vitest.config.ts` | `apps/web/vitest.config.ts` | Move | |
| `postcss.config.mjs` | `apps/web/postcss.config.mjs` | Move | |
| `.env.example` | root + `apps/web/.env.example` | Split/docs | Root documents both prefixes |
| `README.md` | root README rewrite; optional `apps/web/README.md` | Update | |
| `AGENTS.md` / `CLAUDE.md` | stay root; Uni keeps own | Keep | Update paths |
| `docs/architecture/*` | unchanged | Keep | Canonical architecture remains here |
| `whereskarl-universal/**` | `apps/universal/**` | Move | Preserve `src/`, `assets/`, `app.json` |
| `whereskarl-universal/package-lock.json` | **delete** after unified install | Remove | |
| `whereskarl-universal/node_modules` | delete locally; never commit | Remove | |
| `lib/schemas/*` | `packages/schemas/src/*` | Extract | Break deps on `map/config` & `weather/climate` |
| `lib/api/*` | `packages/api-client/src/*` | Extract | Inject base URL; no `process.env` (arch §4.2 / §9) |
| `lib/map/locationSearch.ts` | `packages/search/src/*` | Extract | |
| `lib/score/clearSkiesScore.ts` + weather presenters + fog label rules + region catalog | `packages/domain/src/*` | Extract | Split viewport from catalog (arch §4.4 / §6) |
| `lib/constants/designTokens.ts` (+ token hex registries) | `packages/design/src/*` | Extract | Uni `Fonts`/`Platform` stay in app (arch §4.5) |
| `PRODUCTION_API_BASE_URL`, query param names, stale times | `packages/config/src/*` | Extract | Env readers stay in apps (arch §4.6 / §9) |
| `lib/env/publicEnv.ts` | `apps/web/lib/env/publicEnv.ts` | Stay | DOM/Next-specific |
| `whereskarl-universal/src/constants/config.ts` env readers | `apps/universal/src/lib/env` (or keep constants) | Stay/adapt | Expo-specific |
| Map SDK / phone portrait / fog overlays | stay in each app | Keep | Architecture §6 / ADR-012 |
| Components | stay in each app | Keep | No UI package (arch §4.7) |

---

# 5. Shared-Package Extraction Map

Package purposes, allowed/forbidden contents, and dependency edges are normative in architecture §4 and §11. Below is the **migration extraction map only** (current paths → packages).

## 5.1 `@whereskarl/design`

| Field | Detail |
|-------|--------|
| **Files to extract** | `lib/constants/designTokens.ts` (`designTokens`, `rgbToken`, brand RGB). Status/env hex maps currently in `lib/weather/*` and `lib/score/clearSkiesScore.ts` — **token values** move here; presenters stay in `domain` importing tokens. |
| **Currently approved reference implementation** | Web `designTokens` (matches Uni brand RGB). |
| **Not extracted** | Uni `Fonts` (`Platform.select`), glass text colors, `liquidGlass.ts`. Spacing/Radius **may** move if numeric-only and shared; if Uni-only StyleSheet convenience, keep in app. **Recommendation:** move brand RGB + shared env/score hex registries; keep `Fonts`/`Colors` RN wrappers in `apps/universal`. |
| **Consumers** | Web CSS/Tailwind mapping; Uni theme; `@whereskarl/domain` |
| **Deps** | none (arch §11) |
| **Public exports** | `designTokens`, `rgbToken`, score/env color registries |
| **Tests** | Unit tests for token shape / hex stability (new, small) |
| **Drift** | Web `rgb()` uses CSS space-separated `rgb(r g b)`; Uni uses commas — **normalize in design helper**; apps may wrap |
| **Acceptance** | Both apps import brand tokens from package; no parallel navy/gold RGB |

## 5.2 `@whereskarl/config`

| Field | Detail |
|-------|--------|
| **Files** | `PRODUCTION_API_BASE_URL`; `WEATHER_STALE_TIME_MS` / `INTELLIGENCE_STALE_TIME_MS`; map query param **names** (`location`, `selected`, `region`) from `lib/map/routing.ts`; feature-flag keys if any (analytics keys stay app-local until multi-app) |
| **Currently approved reference implementation** | Web constants + routing param names |
| **Not extracted** | `getApiBaseUrl` / DOM injection / `EXPO_PUBLIC_*` readers |
| **Consumers** | api-client (path defaults only), apps, optionally search/domain |
| **Deps** | none preferred (arch §11) |
| **Exports** | URL constant, timeouts, `MAP_*_QUERY_PARAM` names |
| **Tests** | Constant export smoke tests |
| **Drift** | Storage key namespaces differ by app — **keep app-local** (`wheresKarl.web.*` vs `whereskarl.homeLocationId`) |
| **Acceptance** | Apps resolve env → pass URL into api-client; packages never read env |

## 5.3 `@whereskarl/schemas`

| Field | Detail |
|-------|--------|
| **Files** | `lib/schemas/{parse,shared,weather,health,intelligence}.ts` |
| **Currently approved reference implementation** | Web Zod schemas (Universal types are incomplete mirrors) |
| **Consumers** | api-client, domain, search, both apps |
| **Deps** | `zod` only (arch §4.1) |
| **Structural fix required** | Today `weather.ts` imports `BAY_AREA_BACKEND_REGION_IDS` from `lib/map/config` and `CLIMATE_VALUES` from `lib/weather/climate`. On extract: **inline/own** backend region enum + climate enum in schemas (contracts). Domain owns presentation descriptors (`CLIMATE_DESCRIPTOR`, icon colors). |
| **Public exports** | All schemas, inferred types, `parseApiResponse` |
| **Tests to move** | `tests/schemas/*`, fixtures under `tests/fixtures/` (or `packages/schemas/tests/`) |
| **Drift** | Uni lacks `search`, `climate`; no runtime validation |
| **Acceptance** | Uni depends on Zod via workspace; plain `src/types/*` deleted after cutover; no parallel type modules |

## 5.4 `@whereskarl/api-client`

| Field | Detail |
|-------|--------|
| **Files** | `lib/api/client.ts`, `weather.ts`, `health.ts`, `intelligence.ts` + Uni endpoint equivalents |
| **Currently approved reference implementation** | Web (validated). Refactor: **inject** `getBaseUrl` / `baseUrl` option — remove direct `getApiBaseUrl()` import from app config (arch §4.2 / §10) |
| **Consumers** | both apps |
| **Deps** | `@whereskarl/schemas`, `@whereskarl/config` |
| **Exports** | `ApiError`, `apiFetch`, `buildApiPath`, `getCurrent`, `getLocations`, `getBestSunshine`, `getHealth`, `getKarlIntelligence`, client factory |
| **Tests** | `tests/api/client.test.ts` (+ add parse integration) |
| **Drift** | Uni missing health/intelligence endpoints — **adding them is OK** (transport only) if unused until wired; do not wire new UI |
| **Acceptance** | Both apps call package; no app-local `apiFetch` duplicate; **no permanent forwarding shims** |

## 5.5 `@whereskarl/search`

| Field | Detail |
|-------|--------|
| **Files** | `lib/map/locationSearch.ts`; location ID compat aliases from `lib/map/routing.ts` (`ocean-beach-sf` → `ocean-beach`) — prefer **search** for identity matching (arch §4.3 / §7) |
| **Currently approved reference implementation** | Web alias-aware prefix search |
| **Consumers** | Web `MapPhonePortraitControls`; Uni map search (after approval) |
| **Deps** | `@whereskarl/schemas` (types), optionally `@whereskarl/config`; no `domain ↔ search` cycle (arch §11) |
| **Exports** | `filterCanonicalLocationsBySearch`, `normalizeLocationId`, types |
| **Tests** | `tests/map/locationSearch.test.ts`, `tests/schemas/locationSearch.test.ts`, `tests/map/routing.test.ts` (alias cases) |
| **Drift** | Uni substring search + empty-query semantics — **product decision required** |
| **Acceptance** | One implementation; Uni deletes `filterLocationsBySearch` body in favor of package |

## 5.6 `@whereskarl/domain`

| Field | Detail |
|-------|--------|
| **Files (from Web)** | `lib/score/clearSkiesScore.ts`; `lib/weather/{airQuality,uvIndex,pollen,humidity,visibility,climate,environmentalDisplay,dataStatus}.ts`; fog intensity **labels/classification** from `lib/map/conditions.ts` (pure score→band/label — not MapLibre); product region **catalog** (ids, names, chipLabels, membership bounds, backend→visible mapping) split out of `lib/map/config.ts` + `lib/map/regions.ts` |
| **Currently approved reference implementation** | Web for presenters/score; **region catalog visibility is disputed** — see Open Questions |
| **Not extracted** | MapLibre overlays, phone portrait camera, marker DOM/RN views, `intensityFilter` tray UI assembly if tightly UI-coupled (pure filter helpers may move) |
| **Consumers** | both apps |
| **Deps** | schemas, design, config (arch §11) |
| **Exports** | presenters, score bands, fog labels, region catalog helpers |
| **Tests** | `tests/score/*`, `tests/weather/*`, relevant `tests/map/conditions.test.ts`, `tests/map/regions.test.ts`, climate tests |
| **Drift** | Uni fog labels lack nighttime “Clear Night”; Uni peninsula→SF; Uni score UI ignores bands; `locationMetadata` wind/temp rounding differs |
| **Acceptance** | No parallel presenter modules; apps only render; domain does not reimplement backend intelligence (arch §2 / §4.4) |

### Extraction source-of-truth summary

| Package | Currently approved reference implementation | Counterpart |
|---------|-----------------------------------|-------------|
| design | Web tokens | Uni theme (partial; Platform-tainted) |
| config | Web | Uni URL constant duplicate |
| schemas | Web only | Uni types incomplete |
| api-client | Web | Uni services/api.ts |
| search | Web only | Uni locationsDisplay search |
| domain | Web presenters/score | Uni weather/* + locationsDisplay fog + regions |

---

# 6. Migration Sequence

### Phase Branch Strategy (recommended, not required)

Prefer a hierarchical branch layout so each structural concern stays reviewable and revertible:

```
main
 └── migration/client-monorepo          # integration branch
     ├── phase-01-web                   # Phases 2–3 (workspace + move web)
     ├── phase-02-universal             # Phases 4–5
     ├── phase-03-packages              # Phases 6–13
     └── phase-04-enforcement           # Phases 14–20 (guardrails, scripts, Metro, Vercel, cleanup)
```

- Each **phase branch** merges into `migration/client-monorepo` after its checkpoint + Architecture Conformance Check pass.  
- `migration/client-monorepo` is the **integration branch**.  
- `main` stays protected until the full migration meets Definition of Done.  

This is a **recommendation only**. A single `migration/client-monorepo` branch with sequenced commits remains acceptable if the team prefers lower process overhead.

### Git Checkpoints

Recommend lightweight annotated or lightweight Git tags at major milestones on the integration branch (after the relevant phase merges):

| Tag | Typical after |
|-----|----------------|
| `migration-baseline` | Phase 1 |
| `workspace-established` | Phase 2–3 (root workspaces + `apps/web`) |
| `apps-moved` | Phase 5 (both apps restored) |
| `packages-extracted` | Phase 13 (duplicates removed) |
| `migration-complete` | Phase 20 |

These tags provide stable **rollback and comparison** points (`git diff migration-baseline..HEAD`, `git checkout migration-baseline`) without rewriting history.

### Migration Stop Conditions

**Pause immediately** (do not “push through”) if any of the following occur:

- Web build cannot be restored after structural moves.  
- Expo cannot resolve workspace packages after the agreed Metro configuration.  
- Shared package extraction introduces unexplained behavioral regressions.  
- Continuing would require violating the approved architecture specification.  
- Rollback is safer than continuing.  

Migration must never push through architectural uncertainty. Prefer stop → document → owner decision → resume or revert to the last Git checkpoint tag.

### Architecture Change Gate

If implementation reveals that the **approved architecture itself** requires modification:

1. **Pause** migration.  
2. **Document** the proposed architectural change.  
3. **Review and approve** the architectural change.  
4. **Update** the architecture specification.  
5. **Update** the migration plan if required.  
6. **Resume** implementation only after both documents are synchronized.  

Implementation must never evolve the architecture by accident. Architecture changes are **design decisions**, not implementation decisions. See Architecture Authority.

---

Work on integration branch: **`migration/client-monorepo`** (recommended). Do not merge to `main` until Definition of Done.

---

### Phase 0 — Preflight & freeze acknowledgment

- **Objective:** Confirm architecture checklist ownership (architecture §18); record baseline.  
- **Changes:** None (docs-only notes in PR description / plan approval).  
- **Prereqs:** Spec accepted; this plan approved; Open Questions answered for search/regions/score/deeplink.  
- **Commands:** `npm test`, `npm run typecheck`, `npm run build` (web); `cd whereskarl-universal && npm run typecheck`.  
- **Validation:** Capture pass/fail counts including known `BayAreaMap` failures.  
- **Git:** no commit required (or docs-only “approve plan” later).  
- **Rollback:** N/A.  
- **Exit:** Owners signed off on freeze + drift decisions.  
- **Architecture Conformance Check:** Confirm implementation remains unauthorized until §18 + this plan are acknowledged; no structural edits yet.

---

### Phase 1 — Capture pre-migration baseline

- **Objective:** Freeze observable commands and known defects.  
- **Changes:** Optional `docs/migrations/baseline-notes.md` **only if owner wants it in-repo**; otherwise keep in PR. Prefer minimal.  
- **Commands:** full Web test/typecheck/build; Uni typecheck; smoke manual map/home if API available.  
- **Expected status:** clean or docs-only.  
- **Commit:** `chore: record client monorepo migration baseline` (if file added)  
- **Tag (recommended):** `migration-baseline`  
- **Rollback:** revert commit / return to pre-baseline tip.  
- **Exit:** Baseline numbers recorded; freeze active.  
- **Architecture Conformance Check:** Baseline only; confirm no premature package/app tree changes.

---

### Phase 2 — Establish npm workspace root (apps not moved yet)

- **Objective:** Introduce workspaces scaffolding without breaking current Web root install.  
- **Safer variant (recommended):** create empty `apps/` + `packages/` placeholders and root workspace config **in the same commit as first move**, OR:  
  - Add root `workspaces: ["apps/*","packages/*"]` only after dirs exist.  
- **Practical approach used in this plan:** Phase 2 creates directory stubs + root package.json workspace field **together with** Phase 3/4 moves in tightly sequenced commits (2→3→4), not a half-broken intermediate on `main`.  
- **Files:** root `package.json`, `.gitignore` (ensure `node_modules` ignores all workspaces; fix `/node_modules` → `node_modules/` or add `**/node_modules`).  
- **Validation:** `npm install` at root succeeds after apps land.  
- **Commit boundary:** combined with Phase 3 or standalone stub commit.  
- **Rollback:** revert.  
- **Exit:** workspace field ready for apps.  
- **Architecture Conformance Check:** Workspaces-only; no forbidden packages; no shims.

---

### Phase 3 — Move Web → `apps/web`

- **Objective:** Web builds from `apps/web` under workspaces.  
- **Changes:** `git mv` app sources/configs into `apps/web/`; create `apps/web/package.json` with current Web deps/scripts; root `package.json` becomes private workspace root with `dev:web`, `build:web`, `test`, `lint`, `typecheck` orchestrators; update `@/*` paths; update Vitest/ESLint/Next paths; exclude Universal still.  
- **Likely affected:** everything currently root Next-related; CI/docs/README; `.gitignore`.  
- **Prereqs:** Phase 1.  
- **Commands:** from root `npm install`; `npm run typecheck -w apps/web` (or equivalent); `npm run test -w ...`; `npm run build -w ...`.  
- **Validation:** Web typecheck/test/build; `@/` imports resolve; public assets load.  
- **Expected Git:** large rename commit, no semantic edits beyond path fixes.  
- **Commit:** `refactor: move Next.js web app into apps/web`  
- **Tag (recommended after 2–3):** `workspace-established`  
- **Rollback:** `git revert` that commit (or reset phase branch to `migration-baseline`).  
- **Exit:** Web green at new path **with same known BayAreaMap failures only**.  
- **Stop if:** Web build cannot be restored.  
- **Architecture Conformance Check:** Tree progressing toward arch §3; no packages yet; no compatibility shims for old root paths beyond required config updates.

---

### Phase 4 — Move Universal → `apps/universal`

- **Objective:** Universal lives at `apps/universal`; still installable.  
- **Changes:** `git mv whereskarl-universal apps/universal`; update workspace membership; delete nested lockfile **after** successful root install (Phase 19 may finish cleanup); update Uni README paths.  
- **Prereqs:** Phase 3 green.  
- **Commands:** root `npm install`; `npm run typecheck -w apps/universal`; `npx expo start` smoke (optional).  
- **Validation:** Expo resolves; assets paths in `app.json` still valid relative to app.  
- **Commit:** `refactor: move Expo universal app into apps/universal`  
- **Rollback:** revert.  
- **Exit:** Both apps present under `apps/`; Uni typecheck passes.  
- **Architecture Conformance Check:** Both deployable apps under `apps/` per §3; still no shared package debt/shims.

---

### Phase 5 — Restore both applications before extraction

- **Objective:** Fix any move fallout (scripts, ignores, AGENTS paths, Next exclude lists, ESLint ignores for `.expo`/`dist`).  
- **Changes:** path-only / config-only.  
- **Commands:** full Web suite + Uni typecheck.  
- **Commit:** `fix: restore web and universal after monorepo moves` (only if needed)  
- **Tag (recommended):** `apps-moved`  
- **Rollback:** revert.  
- **Exit:** Behavior parity with pre-move baseline (same known failures).  
- **Architecture Conformance Check:** Structure matches apps half of §3; dependency matrix N/A until packages exist; no duplicate canonical extraction yet.

---

### Phase 6 — Shared package scaffolding

- **Objective:** Create six packages with `package.json` (`name: @whereskarl/...`, `private: true`, `exports`), `tsconfig`, empty `src/index.ts`.  
- **Deps:** declare workspace deps per architecture §11; add `zod` to schemas.  
- **Do not** extract logic yet.  
- **Commit:** `chore: scaffold @whereskarl shared packages`  
- **Validation:** `npm install`; packages typecheck empty entrypoints.  
- **Rollback:** revert.  
- **Exit:** packages exist; apps not yet depending (or depend without imports).  
- **Architecture Conformance Check:** Package list matches §4 exactly; no extra packages; empty packages contain no platform imports.

---

### Phase 7 — Extract `@whereskarl/design`

- **Objective:** Brand + shared hex registries.  
- **Changes:** move tokens; update Web + Uni imports; strip `Platform` from anything moved.  
- **Commands:** package tests; Web tests touching tokens; Uni typecheck.  
- **Commit:** `refactor: extract @whereskarl/design tokens`  
- **Rollback:** revert.  
- **Exit:** no duplicate brand RGB.  
- **Architecture Conformance Check:** design has no deps; no RN/DOM; apps import public export only; no shims.

---

### Phase 8 — Extract `@whereskarl/config`

- **Objective:** Non-secret shared constants.  
- **Commit:** `refactor: extract @whereskarl/config constants`  
- **Exit:** env adapters remain app-local; constants shared.  
- **Architecture Conformance Check:** config does not read `process.env`; no platform imports; edges match §11.

---

### Phase 9 — Extract `@whereskarl/schemas`

- **Objective:** Zod contracts single-sourced; break map/climate import cycles.  
- **Changes:** move schemas; relocate climate **enum** into schemas; climate **presentation** stays for domain phase; update Web imports; Uni may still use old types until Phase 10–11.  
- **Tests:** move schema tests + fixtures.  
- **Commit:** `refactor: extract @whereskarl/schemas`  
- **Exit:** Web validates via package; schema tests pass.  
- **Architecture Conformance Check:** schemas depend on zod only; no fetch/UI; no duplicate schema modules left in Web paths being migrated; Uni plain types may remain until later phases but must be tracked for Phase 13 audit.

---

### Phase 10 — Extract `@whereskarl/api-client`

- **Objective:** Shared HTTP + validation; inject base URL.  
- **Changes:** refactor client to accept `baseUrl` or `getBaseUrl`; Web/Uni adapters pass resolved URL; remove duplicate `services/api.ts` fetch core. Prefer direct `@whereskarl/api-client` imports — **no temporary re-export shims**.  
- **Commit:** `refactor: extract @whereskarl/api-client`  
- **Exit:** both apps fetch through package; Web API tests pass.  
- **Architecture Conformance Check:** api-client → schemas + config only; no env reads; no React Query; no shims left undocumented.

---

### Phase 11 — Extract `@whereskarl/search`

- **Objective:** One catalog search implementation.  
- **Prereq:** Open Question on search semantics answered.  
- **Changes:** move Web search; replace Uni `filterLocationsBySearch`; ensure Uni location type includes `search.aliases` via schemas.  
- **Commit:** `refactor: extract @whereskarl/search`  
- **Exit:** search tests pass; Uni behavior matches **approved** semantics (expect Universal UX change if adopting the currently approved reference implementation for search).  
- **Stop if:** unexplained search regressions vs approved semantics.  
- **Architecture Conformance Check:** search has no network/UI; no domain cycle; one search implementation path.

---

### Phase 12 — Extract `@whereskarl/domain`

- **Objective:** Presenters, score bands, fog labels, region catalog.  
- **Prereq:** region-chip + score-band decisions.  
- **Changes:** extract; leave viewport padding in apps; update both apps.  
- **Commit:** `refactor: extract @whereskarl/domain presentation rules`  
- **Exit:** no parallel presenters; intentional deferred inconsistencies documented if any remain.  
- **Stop if:** unexplained presentation regressions or pressure to put platform/UI into domain.  
- **Architecture Conformance Check:** domain edges match §11; no React/RN; no backend intelligence reimplementation; no junk-drawer dumping.

---

### Phase 13 — Remove duplicate modules (+ Duplicate Removal Audit)

- **Objective:** Delete obsolete Uni types, Web `lib/schemas`, `lib/api`, etc. leftover shims. Ensure duplicated logic is **completely removed**, not abandoned.  
- **Commit:** `refactor: remove duplicated client modules after package extraction`  
- **Tag (recommended):** `packages-extracted`  
- **Exit:** `rg` shows no parallel canonical logic; deep imports of package internals gone; audit table complete.  
- **Architecture Conformance Check:** arch §16 “no duplicated schemas/presentation rules”; no remaining forwarding shims; public exports only.

#### Duplicate Removal Audit (required for this phase)

For **every** removed duplicated module, record:

| Field | Required content |
|-------|------------------|
| Original location | Exact pre-deletion path |
| Replacement package | e.g. `@whereskarl/schemas` |
| Consumers updated | Files/apps switched to package imports |
| Tests passing | Which suites/commands verified |
| No remaining imports | Confirmation (`rg`/typecheck) that nothing references the deleted implementation |

Maintain this as a checklist in the Phase 13 PR description (or a short audit note). Incomplete audit = phase not done.

---

### Phase 14 — Package exports & dependency enforcement

- **Objective:** Hard `exports` maps; ESLint `no-restricted-imports` blocking platform/app imports in packages; ban deep `@whereskarl/*/src/*` — aligning with architecture §11–§12.  
- **Commit:** `chore: enforce shared package boundaries`  
- **Exit:** lint fails on illegal imports.  
- **Architecture Conformance Check:** Enforcement matches §11 absolute forbids; no shim exceptions.

---

### Phase 15 — Tests & workspace scripts

- **Objective:** Root scripts: `dev:web`, `dev:universal`, `test`, `typecheck`, `lint`, `build:web` (architecture §14 intent); package unit tests runnable.  
- **Commit:** `chore: wire monorepo scripts and package tests`  
- **Exit:** documented commands work from root.  
- **Architecture Conformance Check:** Scripts do not imply Turborepo or extra packages.

---

### Phase 16 — Update Vercel configuration

- **Objective:** Production/preview install from monorepo (architecture §15).  
- **Prereq:** Phases 3–5 green locally; preview first.  
- **Changes (dashboard and/or `apps/web/vercel.json` if needed):** Root Directory `apps/web`; Install `npm install` from repo root (validate against current Vercel UI; do not guess blindly in prod). Build: `npm run build` in app or `npm run build -w apps/web`.  
- **Env:** keep `NEXT_PUBLIC_API_URL` unchanged.  
- **Commit:** `chore: configure Vercel for apps/web workspace` (if file-based)  
- **Exit:** Preview deployment healthy; then production cutover.  
- **Architecture Conformance Check:** Deploy unit remains `apps/web` only; backend still separate.

---

### Phase 17 — Update Expo / Metro configuration

- **Objective:** Metro watches repo root and resolves `packages/*`.  
- **Changes:** add `apps/universal/metro.config.js` using `expo/metro-config` + monorepo `watchFolders` / `nodeModulesPaths` / `disableHierarchicalLookup` as required by Expo 57 docs; ensure package `exports` compatible with Metro.  
- **No EAS file today** — only add `eas.json` if already used elsewhere; do not invent store pipeline.  
- **Commit:** `fix: configure Metro for npm workspace packages`  
- **Exit:** Expo iOS sim / web can import `@whereskarl/*`.  
- **Stop if:** Expo cannot resolve workspace packages after the agreed Metro configuration.  
- **Architecture Conformance Check:** Metro config stays in app; packages remain platform-agnostic.

---

### Phase 18 — Full regression verification

- **Objective:** Execute Validation Matrix (§8).  
- **Commit:** none, or `test: record monorepo regression results` if artifacts committed (prefer not).  
- **Exit:** matrix checked; failures classified (migration vs pre-existing vs deferred).  
- **Stop if:** unexplained behavioral regressions from shared extraction.  
- **Architecture Conformance Check:** Full pass against §3–§11 / §16; document any intentionally deferred inconsistencies.

---

### Phase 19 — Remove obsolete lockfiles / node_modules assumptions

- **Objective:** Only root `package-lock.json`; nested lock deleted; docs say install from root only; Uni `.gitignore` retained for local `.expo`.  
- **Commit:** `chore: remove nested lockfile and document root install`  
- **Exit:** `find . -name package-lock.json` → only root.  
- **Architecture Conformance Check:** Single install graph per arch §13; no nested workspace lock.

---

### Phase 20 — Final architecture conformance audit

- **Objective:** Tree matches spec; dependency matrix holds; docs updated; DoD checklist complete.  
- **Commit:** `docs: complete client monorepo migration conformance notes`  
- **Tag (recommended):** `migration-complete`  
- **Exit:** ready to merge to `main`.  
- **Architecture Conformance Check:** Formal end-to-end audit vs architecture §3–§16 and this plan’s DoD; confirm zero temporary shims remain.

---

# 7. Commit Strategy

| Phase | Proposed commit message | Required checks |
|-------|-------------------------|-----------------|
| 1 | `chore: record client monorepo migration baseline` | Baseline commands captured; conformance |
| 2–3 | `refactor: move Next.js web app into apps/web` | Web typecheck/test/build; conformance |
| 4 | `refactor: move Expo universal app into apps/universal` | Uni typecheck; root install; conformance |
| 5 | `fix: restore web and universal after monorepo moves` | Same as 3–4; tag `apps-moved` |
| 6 | `chore: scaffold @whereskarl shared packages` | `npm install`; conformance |
| 7 | `refactor: extract @whereskarl/design tokens` | design tests; both typecheck; conformance |
| 8 | `refactor: extract @whereskarl/config constants` | typecheck; conformance |
| 9 | `refactor: extract @whereskarl/schemas` | schema tests; conformance |
| 10 | `refactor: extract @whereskarl/api-client` | api tests; both apps fetch; no shims; conformance |
| 11 | `refactor: extract @whereskarl/search` | search tests; approved semantics; conformance |
| 12 | `refactor: extract @whereskarl/domain presentation rules` | domain tests; conformance |
| 13 | `refactor: remove duplicated client modules after package extraction` | Duplicate Removal Audit complete; conformance; tag `packages-extracted` |
| 14 | `chore: enforce shared package boundaries` | lint restricted imports; conformance |
| 15 | `chore: wire monorepo scripts and package tests` | root scripts; conformance |
| 16 | `chore: configure Vercel for apps/web workspace` | preview deploy; conformance |
| 17 | `fix: configure Metro for npm workspace packages` | Expo resolve packages; conformance |
| 19 | `chore: remove nested lockfile and document root install` | single lockfile; conformance |
| 20 | `docs: complete client monorepo migration conformance notes` | DoD; tag `migration-complete` |

Each commit: one concern; revertible; must pass its checkpoint **and** Architecture Conformance Check.

**Phase branches (recommended):** merge `phase-01-web` … `phase-04-enforcement` into `migration/client-monorepo` after the corresponding phase group passes—not into `main`.

---

# 8. Validation Matrix

### Repository

| Check | Pass criteria |
|-------|---------------|
| One root lockfile | Only `./package-lock.json` |
| npm workspaces install | `npm install` at root links apps + packages |
| No nested Git | No `apps/*/.git` |
| No committed node_modules | gitignore covers all |
| Dependency graph | Matches architecture §11; no cycles (`madge` or `dpdm` optional) |

### Web

| Check | Pass criteria |
|-------|---------------|
| Dev | `npm run dev:web` serves home/map |
| Typecheck / lint / test / build | Pass except **recorded** pre-existing BayAreaMap failures |
| Routes | `/`, `/map`, `/favorites`, `/settings`, `/privacy`, `/support` |
| Map | MapLibre loads; region chips; selection; fog layer |
| Env | `NEXT_PUBLIC_API_URL` required; no silent prod localhost |
| API | `/current`, `/locations`, `/best-sunshine`, `/health`, `/karl-intelligence` |
| Search | Approved alias/prefix behavior |
| Deep links | `?location=` & `?selected=` read; writer per approval |
| Imagery | Hero remote patterns; circular images |

### Universal

| Check | Pass criteria |
|-------|---------------|
| Expo start | Metro starts; `@whereskarl/*` resolves |
| iOS / Android / RN Web | Smoke as practical |
| Nav | Home/Map/Favorites/Settings/location detail |
| API | current/locations/best-sunshine via api-client |
| Search / maps / assets / env | Per approved shared semantics; `EXPO_PUBLIC_API_URL` |

### Shared packages

| Check | Pass criteria |
|-------|---------------|
| Unit tests | Schemas/search/domain/api critical paths |
| Public imports only | No deep `src` imports from apps |
| No platform imports | ESLint ban (arch §2.3) |
| No app imports | ESLint ban |
| No circular deps | Tooling or manual graph |
| No duplicated canonical logic | `rg` audit + Phase 13 audit table |
| No temporary shims | No forwarding wrappers remain |

### Deployment

| Check | Pass criteria |
|-------|---------------|
| Vercel preview | Builds with Root Directory `apps/web` |
| Prod settings | Env continuity; rollback plan ready |
| Expo/EAS | Metro compatible; identifiers unchanged (`slug`, scheme) |
| Backend URLs | Unchanged semantics |

---

# 9. Regression Inventory Requirements

Record **before** Phase 3 (screenshots/notes OK outside git):

| Area | Capture |
|------|---------|
| Web routes | List + smoke |
| Universal screens | index, map, favorites, settings, location/[id] |
| Map views | desktop + phone portrait web |
| Camera | default bounds, region chip framing, selected location zoom |
| Selection | marker tap → card; unknown id behavior |
| Search | queries: `ocean`, `sf`, alias cases, empty focus |
| Search ordering | alphabetical vs current Uni order |
| Clear Skies display | Web card colors/bands vs Uni gold bar |
| AQI/UV/pollen/humidity/visibility | sample locations |
| Region chips | Web 5 vs Uni 4 — document |
| API endpoints | Web full set vs Uni subset |
| Imagery | hero + circular focal points |
| Query/deep links | `location` vs `selected` writers |
| Commands | exact npm scripts + known BayAreaMap 5 fails |
| Known issues | BayAreaMap test fails; Uni no Zod; React/TS version drift |

**Classification labels for every difference found during migration:**

1. **Migration regression** — must fix before merge  
2. **Known pre-existing defect** — e.g. BayAreaMap tests  
3. **Intentionally deferred inconsistency** — requires owner list (e.g. map camera profiles)

---

# 10. Risk Register

| Risk | Probability | Impact | Detection | Mitigation | Rollback |
|------|-------------|--------|-----------|------------|----------|
| Broken root-relative / `@/` imports | High | High | typecheck | Fix tsconfig paths per app | Revert move commit / tag |
| Next workspace transpilation | Medium | High | build | `transpilePackages: ['@whereskarl/...']` | Revert package wiring |
| Vercel Root Directory / install | High | High | preview deploy | Validate preview before prod; install from repo root | Revert Vercel settings |
| Expo Metro workspace resolution | High | High | Expo start import error | Add metro.config watchFolders | Revert Metro; stop if unresolved |
| Duplicate React / RN | High | High | runtime invalid hook / peer warnings | Align versions carefully **only if blocker**; npm overrides last resort | Revert lockfile |
| Zod missing on Uni | Medium | Medium | first schemas import | Add zod via schemas workspace dep | Revert schemas consumer |
| Asset path breakage | Medium | Medium | missing images | Keep assets relative to app root | Revert move |
| Env var changes | Low | High | blank API | Do not rename semantic vars | Restore env |
| Package `exports` mistakes | Medium | Medium | resolve failures | Start with broad exports, tighten Phase 14 | Loosen exports |
| Lockfile churn | High | Low | noisy diffs | One install per phase; no drive-by upgrades | Revert lockfile |
| Test path changes | Medium | Medium | vitest miss | Update include paths | Fix config |
| Hidden behavior drift on extract | High | High | regression inventory | Owner decisions first; Stop Conditions | Revert extraction / tag |
| Circular dependencies | Medium | High | tsc / madge | Extract enums into schemas first | Revert |
| Deep imports | Medium | Medium | lint | exports + eslint | Fix imports |
| Temporary shims become permanent | Medium | High | Phase 13/20 audit | No Temporary Compatibility Shims rule | Delete shim; fix imports |
| Plan/spec drift during implementation | Medium | High | Architecture Authority / Change Gate | Pause; update architecture first | Resume only when synchronized |
| Deploy after local success | Medium | High | preview | Never skip preview | Redeploy previous |

---

# 11. Rollback Strategy

- **Per checkpoint:** `git revert <phase-commit>` (prefer revert over reset on shared branches); or reset a phase branch to the parent integration tip / prior **Git Checkpoint** tag.  
- **When to revert:** checkpoint validation fails and fix is not a one-liner path correction; or any **Migration Stop Condition** is met.  
- **When to stop migration:** see Migration Stop Conditions; also pause if product cannot approve drift decisions — after Phase 5 (structure only) only if explicitly approved as an interim. If the architecture itself must change, use the **Architecture Change Gate**.  
- **Production stability:** no Vercel Root Directory change until Phase 5+ local green; preview → prod. Keep previous Vercel settings documented.  
- **Branch:** use `migration/client-monorepo` (+ optional phase branches); do not land half-extracted packages on `main`.  
- **Avoid partial deploy:** change Vercel only when `apps/web` is the served app and the corresponding local checkpoint has passed.  
- **Tags:** prefer rolling back to `apps-moved` or `packages-extracted` over ad-hoc commit hunting when large ranges must be undone.

---

# 12. Deployment Transition Plan

### Vercel (do not change until Phase 16)

| Topic | Current (observed) | Target |
|-------|--------------------|--------|
| Root assumptions | App at repo root; default Next build | Root Directory = `apps/web` |
| Install | `npm install` at root = app | Install workspaces from **repository root** |
| Build | `npm run build` | `npm run build` in app or workspace-filtered |
| Output | Next default | unchanged |
| Env | `NEXT_PUBLIC_API_URL` | **same names/values** |
| Validation | — | Preview first |
| Cutover | — | After preview matrix |
| Rollback | — | Restore prior Root Directory + prior deployment |

**Assumption requiring validation:** exact Vercel UI knobs for npm workspaces on this project (no committed `vercel.json` today). Confirm on a preview branch before production.

### Expo (do not change until Phase 17)

| Topic | Current | Target |
|-------|---------|--------|
| App location | `whereskarl-universal/` | `apps/universal/` |
| Metro | Expo defaults | Explicit monorepo `metro.config.js` |
| Babel/TS | Expo base tsconfig | Keep; ensure package paths |
| Assets | `./assets/...` in app.json | unchanged relative paths after move |
| EAS | **no eas.json observed** | Do not invent; if EAS linked by slug, verify project continuity after path move |
| Identifiers | `slug: whereskarl-universal`, scheme `whereskarluniversal` | **do not change** |
| Rollback | — | Revert Metro/path commits; reinstall |

---

# 13. Tooling and Architectural Enforcement

Minimal set (no Turborepo — architecture ADR-011 / §14):

1. **Root scripts** orchestrating workspaces  
2. **`tsconfig.base.json`** (optional) — prefer bundler resolution via package `exports`  
3. **Package `exports`** pointing to `src/index.ts` (TypeScript-first; no build step required initially if Next/Metro transpile)  
4. **ESLint** in packages + apps: `no-restricted-imports` for platform/app imports per architecture §2.3 / §11  
5. **Ban deep imports:** restrict `@whereskarl/*/*` beyond public entry  
6. **Circular check:** `npx madge --circular packages` optional in Phase 14  
7. **Package unit tests** via smallest Vitest setup that covers package pure logic  

---

# 14. Migration Decision Log

This log records **implementation decisions** made during migration that:

- do **not** change architecture (architecture changes use the Architecture Change Gate / ADRs in the architecture specification)  
- affect **execution sequencing** or operational choices  
- improve **historical traceability**

Do **not** convert these rows into Architecture Decision Records.

The table remains **empty in the canonical plan until migration begins**. Example rows below illustrate format only and are **not** pre-filled decisions.

| Phase | Decision | Reason | Approved By | Date |
|-------|----------|--------|-------------|------|
| | | | | |

**Format examples (not recorded until migration):**

| Phase | Decision | Reason | Approved By | Date |
|-------|----------|--------|-------------|------|
| 3 | Moved Web before Universal | Reduced deployment risk | *(example)* | *(example)* |
| 9 | Extracted Schemas before API | Reduced dependency complexity | *(example)* | *(example)* |

---

# 15. Definition of Success

Technical completion (Definition of Done) is necessary but not sufficient. Migration succeeds when the long-term product and engineering outcomes hold:

- Both applications preserve expected behavior except for **explicitly approved** convergence.  
- Shared client logic exists **only once**.  
- The repository is **easier to understand** than before migration.  
- New contributors can understand the repository from **documentation alone**.  
- Future features require **minimal duplication**.  
- Architecture is enforced through **tooling** rather than tribal knowledge.  
- Future expansion can occur **without restructuring** the repository (architecture §20).  

---

# 16. Definition of Done

Migration complete only when **all** are true:

- [ ] Tree matches approved `apps/*` + `packages/*` (architecture §3)  
- [ ] Both apps run locally  
- [ ] Both apps typecheck; Web builds; Uni Metro resolves packages  
- [ ] Shared logic has one implementation for schemas/api/search/domain/design/config  
- [ ] Obsolete duplicates removed **and** Phase 13 Duplicate Removal Audit complete  
- [ ] No temporary compatibility shims remain  
- [ ] One root `package-lock.json`  
- [ ] Public package exports used (no deep imports)  
- [ ] Vercel preview validated; prod settings updated safely  
- [ ] Production web behavior preserved (modulo approved shared semantics)  
- [ ] Universal behavior preserved **or** intentionally converged per owner decisions  
- [ ] Architecture guardrails pass; final Architecture Conformance Check vs architecture spec complete  
- [ ] Architecture specification and this migration plan remain synchronized (no unresolved authority conflicts)  
- [ ] README/AGENTS reflect final install/dev commands  
- [ ] Clean git status on migration branch  
- [ ] Recommended tags applied through `migration-complete` (if using tags)  
- [ ] Pre-existing BayAreaMap failures still classified (not “fixed” silently unless separate approval)

---

# 17. Open Questions and Decisions Required

These cannot be answered by inspection alone:

### Q1 — Search semantics (Universal vs Web)

- **Why:** Architecture requires one client standard; apps diverge today.  
- **Recommended:** Adopt the currently approved reference implementation (`filterCanonicalLocationsBySearch`: prefix + aliases; empty → `[]`).  
- **If deferred:** Cannot complete Phase 11 without leaving forbidden duplication.

### Q2 — Peninsula region chip visibility

- **Why:** Web shows Peninsula chip; Universal maps `peninsula` → `san-francisco`. Spec examples mention SF mapping, but Web product currently treats Peninsula as visible.  
- **Recommended:** Confirm product intent — if Web is correct, Universal converges to 5 chips + identity mapping; if Uni is correct, Web must change (**behavior change** — needs explicit approval).  
- **If deferred:** Domain region catalog extraction blocked or ships with documented dual behavior (violates “presentation rules once”).

### Q3 — Clear Skies Score band presentation on Universal

- **Why:** Sharing `presentClearSkiesScore` changes Uni gold-only UI.  
- **Recommended:** Adopt the currently approved reference implementation for bands/colors/labels in shared domain; update Uni UI to consume colors (minimal visual change, still a product-visible change).  
- **If deferred:** Score presentation remains duplicated / drifted.

### Q4 — Canonical deep-link writer (`location` vs `selected`)

- **Why:** Web writes `location=`; Uni writes `selected=`; Web reads both.  
- **Recommended:** Canonical write `location=`; keep reading `selected=` as alias (matches Web `routing.ts`). Update Uni `buildMapHref`.  
- **If deferred:** Shared routing helpers cannot land cleanly.

### Q5 — Vercel install command details for this org

- **Why:** No `vercel.json`; dashboard-owned settings.  
- **Recommended:** Owner confirms preview settings during Phase 16; document exact Install/Build commands in conformance notes.  
- **If deferred:** Local monorepo can merge, but production web cutover waits.

### Q6 — Architecture §18 checklist formal sign-off

- **Why:** Spec says implementation not authorized until checklist complete.  
- **Recommended:** Explicit owner ack of §18 items + this plan.  
- **If deferred:** Do not start Phase 3.

---

# 18. Recommended Next Action

1. Owner reviews this plan + answers **Q1–Q4** (and Q6).  
2. Save approved plan to `docs/migrations/client-monorepo-migration-plan.md` (separate approval).  
3. Create integration branch `migration/client-monorepo` from `main` (optionally use hierarchical phase branches).  
4. Tag `migration-baseline` after Phase 1.  
5. Execute Phase 1 → Phase 5 (structure only) before any package extraction; stop on Stop Conditions; use Architecture Change Gate if the architecture itself must change.  
6. Only then extract packages in order Phases 6–13 with Duplicate Removal Audit.  
7. Metro + Vercel last among structural concerns (17 then 16, or 16 immediately after Web restore if Universal Metro is independent — **prefer Metro before relying on Uni+packages in CI**, Vercel after `apps/web` stable).  
8. Tag `migration-complete` only after Phase 20 / DoD / Definition of Success review; then merge integration branch to `main`.

---

## End-of-plan deliverables

### 1. Recommended migration sequence (concise)

Baseline → workspace + move `apps/web` → move `apps/universal` → restore → scaffold packages → extract **design → config → schemas → api-client → search → domain** → delete duplicates (with audit) → enforce boundaries/scripts → Metro → Vercel preview/prod → remove nested lockfile → conformance audit.

### 2. Highest-risk three checkpoints

1. **Move Web to `apps/web` + Vercel Root Directory** — install/build path breakage.  
2. **Metro monorepo resolution for `apps/universal`** — no Metro config today.  
3. **Search / regions / score extraction** — high chance of intentional product-visible convergence; easy to mislabel as “no behavior change.”

### 3. Owner decisions required before implementation

- Search standard (Q1)  
- Peninsula chip model (Q2)  
- Clear Skies band adoption on Universal (Q3)  
- Deep-link canonical writer (Q4)  
- Formal §18 + freeze ack (Q6)  
- Vercel exact install/build confirmation at Phase 16 (Q5)

### 4. Confirmation: no files were modified

This revision was returned **in chat only**. No repository files were written or modified. No commit or push was performed.

### 5. Proposed path for the approved document

`docs/migrations/client-monorepo-migration-plan.md`

**Not saved yet** — awaiting approval to write the file.
