# Where’s Karl — System Architecture Guide

**Audience:** future contributors
**Status:** permanent reference (post client-monorepo migration)
**Technical baseline commit:** `f364882` (Phase 15 validation workflow)
**Normative long-form decisions:** [`client-monorepo-architecture.md`](./client-monorepo-architecture.md)
**Operations:** [`deployment-and-validation.md`](./deployment-and-validation.md)
**Migration history:** [`../migrations/client-monorepo-completion.md`](../migrations/client-monorepo-completion.md)

This guide describes the **current** client monorepo. It does not redesign the architecture.

---

## Purpose and scope

Where’s Karl is a Bay Area fog / clear-skies product. Clients present backend weather, location catalog, and intelligence results; they do **not** recalculate backend environmental intelligence or canonical scoring.

This repository (`whereskarl-web`) is an npm-workspaces monorepo containing:

- **Web** — Next.js production site (`apps/web`), deployed on Vercel
- **Universal** — Expo / React Native app (`apps/universal`) for iOS, Android, and RN Web
- **Shared packages** — platform-neutral TypeScript libraries under `packages/*`

The architectural goal is **shared canonical client logic** (contracts, transport, search, domain presentation rules, design tokens, shared constants) with **platform-specific application layers** (UI, maps, routing, navigation, env, deployment).

Backend and native Swift iOS remain **separate repositories**. They are not part of this monorepo.

---

## Repository structure

```text
whereskarl-web/
├── apps/
│   ├── web/                 # Next.js (Web)
│   └── universal/           # Expo / React Native (Universal)
├── packages/
│   ├── design/              # @whereskarl/design
│   ├── config/              # @whereskarl/config
│   ├── schemas/             # @whereskarl/schemas
│   ├── api-client/          # @whereskarl/api-client
│   ├── search/              # @whereskarl/search
│   └── domain/              # @whereskarl/domain
├── docs/
│   ├── architecture/
│   └── migrations/
├── package.json             # workspace root scripts
└── package-lock.json        # single root lockfile
```

Install and develop from the **repository root**. Nested app `node_modules` may appear locally; do not add nested lockfiles.

---

## Package ownership matrix

| Package | Owns | Must not own |
|---------|------|--------------|
| `@whereskarl/design` | Design tokens; brand RGB; score/env hex registries; `rgbToken`, `cssColorTokens` | React / RN components; platform branching; env |
| `@whereskarl/config` | Platform-neutral constants: production API URL constant, stale-time defaults, map query param names | Environment-variable resolution; secrets; build-tool config |
| `@whereskarl/schemas` | Zod contracts; API response schemas; inferred types; `parseApiResponse`; contract enums (`BAY_AREA_BACKEND_REGION_IDS`, `CLIMATE_VALUES`) | Fetch; UI; presentation colors; search algorithms |
| `@whereskarl/api-client` | HTTP transport; endpoint requests (`getCurrent`, `getLocations`, `getBestSunshine`, `getHealth`, `getKarlIntelligence`, …); response parsing via schemas; base URL injected by apps | Reading env; React Query / cache stores; UI |
| `@whereskarl/search` | Canonical catalog search; alias matching from backend `search.aliases`; location ID normalization | Network transport; UI; inventing catalog metadata |
| `@whereskarl/domain` | Shared presentation / interpretation rules: Clear Skies Score bands/labels/colors; AQI/UV/pollen/humidity/visibility/climate presenters; fog intensity labels; region catalog membership; confidence / data-status copy | Backend intelligence recalculation; transport; search; React components; map camera / SDK code |
| **Applications** | Env resolution; React / React Native; Next.js / Expo; UI; maps; routing; navigation; app state; platform composition; deployment behavior | Parallel Zod schemas; parallel canonical search/domain presenters |

Public APIs are the package root exports (`packages/*/src/index.ts`). See each package `README.md` for the export list.

---

## Dependency graph

Approved actual graph (not a required linear chain):

```text
apps/web ──────────────┐
apps/universal ────────┤
                       ├──► @whereskarl/domain ──► schemas, design, config
                       ├──► @whereskarl/search ──► schemas
                       ├──► @whereskarl/api-client ──► schemas, config
                       ├──► @whereskarl/schemas ──► zod
                       ├──► @whereskarl/design ──► (none)
                       └──► @whereskarl/config ──► (none)
```

Rules:

- Applications compose packages **directly**; not every flow uses every package.
- Packages **never** import applications.
- Shared packages stay **platform-neutral** (no `next`, `expo`, `react-native`, DOM globals as dependencies).
- Import **package roots only** (`@whereskarl/domain`, not `@whereskarl/domain/src/...`).
- Circular package dependencies are prohibited.
- Prefer **no** `domain ↔ search` edge; apps compose both.

Phase 14 enforcement: root `eslint.config.mjs` (packages) and `apps/web/eslint.config.mjs` ban deep `@whereskarl/*` imports and platform/app imports into packages.

---

## Data flow

### API → presentation

```text
Backend API
  → app-resolved base URL (NEXT_PUBLIC_* / EXPO_PUBLIC_*)
  → @whereskarl/api-client
  → @whereskarl/schemas validation
  → @whereskarl/domain interpretation (when shared rules apply)
  → Web or Universal presentation
```

### Search

```text
Catalog data (already loaded)
  → @whereskarl/search
  → app-specific search UI composition
  → UI
```

Applications may call schemas, design, or config directly. Caching (e.g. React Query on Web) stays in the application.

---

## Web and Universal boundaries

Platform specialization is **intentional**. Divergence in maps, navigation, and chrome is not automatically duplication to eliminate.

| Concern | Web | Universal |
|---------|-----|-----------|
| Framework | Next.js App Router | Expo Router / React Native |
| Bundler / deploy | Next / Vercel | Metro / Expo tooling |
| Maps | MapLibre (browser) | Native maps + MapLibre on RN Web |
| Navigation | Next routing | Expo Router / native navigation |
| Env | `NEXT_PUBLIC_*` via app env adapters | `EXPO_PUBLIC_*` via app config |
| UI | DOM / Tailwind / CSS | RN StyleSheet / native chrome |
| SEO / SSR | Web-only | N/A |

Shared meaning of backend fields (scores, env metrics, search, contracts) belongs in packages. Shared React component libraries are **out of architecture** unless a future ADR revises that decision.

---

## Where new code belongs

| Change | Put it in |
|--------|-----------|
| New API schema / contract field | `@whereskarl/schemas` |
| New endpoint transport | `@whereskarl/api-client` |
| New search alias / matching rule | `@whereskarl/search` |
| New score or environmental presentation rule | `@whereskarl/domain` |
| New color / design token | `@whereskarl/design` |
| New cross-platform non-secret constant | `@whereskarl/config` |
| New React / RN component | Appropriate application |
| New environment variable reader | Appropriate application |
| New map rendering / camera / SDK behavior | Application (unless architecture review approves shared pure helpers) |

### Ambiguous-case checklist

1. Does **both** Web and Universal need the **same meaning** of a backend field? → shared package (usually `domain` or `schemas`).
2. Does the code require a platform runtime (`next`, `expo`, DOM, map SDK)? → application.
3. Does it read env vars? → application.
4. Is it HTTP to the backend? → `api-client` (+ schema if new shape).
5. Is it catalog string matching / ID identity? → `search`.
6. Would a new package be needed? → rare; meet Package Acceptance Criteria in the long-form architecture spec and record an ADR first.

---

## Public import rules

**Allowed**

```ts
import { presentClearSkiesScore } from "@whereskarl/domain";
import { filterCanonicalLocationsBySearch } from "@whereskarl/search";
```

**Not allowed**

```ts
import { ... } from "@whereskarl/domain/src/...";
import { ... } from "../../../packages/domain/src/...";
// packages importing apps/*
```

Deep imports and package→app imports fail lint under Phase 14 rules.

---

## Development workflow

From the repository root:

| Command | Purpose |
|---------|---------|
| `npm run dev:web` | Next.js Web |
| `npm run dev:universal` | Expo Universal |
| `npm run build` | Web production build (`build:web`) |
| `npm run lint` | Web + all six shared packages (not Universal) |
| `npm run typecheck` | All workspaces with a `typecheck` script |
| `npm run typecheck:universal` | Universal only |
| `npm run test` | All workspaces with a `test` script |
| `npm run validate` | `lint` → `typecheck` → `test` → `build:web` |

**Honest validation note:** Root `validate` stops at the known Web typecheck baseline (**6 × TS1501**). Failures are not masked. After that stop, run `npm test` and `npm run build` separately if you need the full matrix. Universal lint is **not** a trusted green gate today.

Details and baseline numbers: [`deployment-and-validation.md`](./deployment-and-validation.md).

---

## Key decisions (do not casually reverse)

These are summarized here for contributors. Full ADR text lives in [`client-monorepo-architecture.md`](./client-monorepo-architecture.md) §19.

1. **Apps own environment resolution** — shared packages never read `process.env` / `import.meta.env`.
2. **Package-root exports only** — deep imports prohibited; ESLint enforces.
3. **Transport ≠ schemas ≠ domain** — HTTP in `api-client`; contracts in `schemas`; presentation rules in `domain`.
4. **Search stays separate from domain** — catalog matching evolves independently; apps compose both.
5. **UI, maps, routing, navigation stay in applications** — no `@whereskarl/ui` / maps package in v1.
6. **npm workspaces only** — no Turborepo/Nx/pnpm unless a future ADR changes tooling.
7. **Backend owns intelligence and canonical scoring** — clients present; they do not re-score.
8. **Swift and backend stay outside this monorepo.**

---

## Related documents

| Document | Role |
|----------|------|
| [`client-monorepo-architecture.md`](./client-monorepo-architecture.md) | Approved long-form specification + ADRs |
| [`deployment-and-validation.md`](./deployment-and-validation.md) | Deploy / validate runbook |
| [`../migrations/client-monorepo-completion.md`](../migrations/client-monorepo-completion.md) | Migration closeout record |
| [`../migrations/client-monorepo-migration-plan.md`](../migrations/client-monorepo-migration-plan.md) | Historical execution plan |
| [`../migrations/client-monorepo-baseline.md`](../migrations/client-monorepo-baseline.md) | Phase 1 command baseline |
| Package `README.md` files under `packages/*` | Per-package public API notes |
