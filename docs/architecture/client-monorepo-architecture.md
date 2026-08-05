# Where’s Karl Client Monorepo Architecture Specification

**Version:** 1.0
**Status:** Approved and implemented (client monorepo migration complete through Phase 15; Phase 16 documentation)
**Spec ID:** WK-CLIENT-ARCH-1.0
**Scope:** Client applications monorepo (Web + Universal)
**Out of scope:** Backend repository, Native Swift iOS repository

This document is the **normative long-form architecture** and Architecture Decision Log for Where’s Karl TypeScript clients. For day-to-day contributor guidance, start with [`system-architecture.md`](./system-architecture.md). For deploy/validate operations, see [`deployment-and-validation.md`](./deployment-and-validation.md). Migration closeout: [`../migrations/client-monorepo-completion.md`](../migrations/client-monorepo-completion.md).

Do not casually reverse §19 ADRs or the dependency rules in §11. Amending this specification still requires an ADR and a version bump.

---

# 1. Executive Summary

Where’s Karl clients are organized as a **single TypeScript monorepo** containing:

- `apps/web` — Next.js production web application  
- `apps/universal` — Expo React Native application (iOS, Android, React Native Web)  
- `packages/*` — platform-agnostic shared libraries for contracts, API access, product presentation rules, search, design foundations, and shared configuration  

The **backend remains a separate repository** and is the sole source of truth for environmental intelligence, weather models, **canonical scoring**, location catalog, search metadata, and API contracts. The **native Swift iOS app remains a separate repository** and consumes backend APIs directly; it does not consume TypeScript packages.

Clients **never** calculate their own version of backend intelligence or canonical scores. Clients present backend results consistently across TypeScript applications.

### Why this architecture

1. **One product, two runtimes.** Web and Universal must present the same environmental truth, vocabulary, search behavior, and score presentation. Duplicating those presentation rules has already produced measurable drift (schemas vs plain types, alias-aware vs substring search, Clear Skies Score display bands present on web only).
2. **Contracts live once.** Zod schemas and inferred types become the client-side expression of backend contracts—never redefined per app.
3. **Rendering stays local.** Browser DOM/Tailwind and React Native/StyleSheet are legitimately different. Platform-specific rendering remains application-owned unless there is compelling evidence that sharing reduces long-term complexity. Forcing a shared UI kit maximizes abstraction cost without guaranteeing product quality.
4. **Five-year stability.** Package boundaries follow durable product concerns (contracts, transport, presentation rules, search, design, config)—not today’s folder convenience.

### Alternatives rejected

| Alternative | Why rejected |
|-------------|--------------|
| Keep nested Universal inside web root without workspaces | Informal coupling; duplicated installs; encourages copy-paste “alignment comments” instead of shared ownership |
| Folder-only monorepo now, shared packages later | Guarantees a second migration; violates “presentation rules once” |
| Maximal shared UI via React Native Web | Couples Next.js to RN constraints; maps, sheets, nav, and desktop layouts are not portable without loss; technical feasibility alone is not justification |
| Publish packages to npm for Swift reuse | Swift cannot consume TS; false sharing; versioning overhead |
| Merge backend into client monorepo | Mixes deploy units, ownership, and scaling concerns; backend must remain independently deployable |
| Micro-frontends / separate client repos with published packages | Higher release friction for a small team; presentation rules would still drift between web and universal |
| Turborepo / Nx as a day-one requirement | Orchestration before package graph stability; unnecessary complexity for two apps |

---

# 2. Architecture Principles

### 2.1 Source of truth

| Concern | Authority |
|---------|-----------|
| Environmental intelligence, weather models, Karl Intelligence, location catalog, search metadata, **canonical scoring**, and API contracts | **Backend** |
| HTTP/API contracts as consumed by TypeScript clients | **`packages/schemas`** (must mirror backend; never invent fields) |
| Consistent **presentation** of backend results (formatting, token→color mapping, labels, client-side catalog filtering) | **Shared packages** (`domain`, `search`, etc.) |
| Visual rendering, navigation chrome, maps, platform storage | **Applications** |

Clients **never** redefine backend contracts. If the client needs a field the backend does not provide, the backend changes first.

Clients **never** calculate their own version of backend intelligence or canonical scores. Clients do not reinterpret, re-derive, or substitute alternate intelligence. They present backend results consistently across TypeScript applications.

### 2.2 Ownership

- **Backend team / backend repo:** APIs, persistence, intelligence, catalog, **canonical scoring**, contract versioning.  
- **Client monorepo:** TypeScript apps + shared packages that validate and present backend data.  
- **Swift repo:** Native iOS experience; parallel consumer of the same backend contracts (documented, not code-shared).

### 2.3 Package boundaries

Shared packages contain **pure, platform-agnostic TypeScript** (plus Zod where validation is required).

**Platform independence:** Shared packages must **never** know which application is consuming them. They must remain completely unaware of Web, Universal, or any future TypeScript client.

They must not import or depend on:

- `next/*`
- `react-native` / `expo-*`
- `Platform.OS` / React Native `Platform`
- `isWeb` (or equivalent app/runtime branching)
- DOM APIs and browser globals (`window`, `document`, etc.) as hard dependencies
- MapLibre / `react-native-maps` as hard dependencies in core packages

### 2.4 Dependency direction

```
apps/web ──────────────┐
                       ├──► packages/* ──► (external libs: zod, etc.)
apps/universal ────────┘

packages/* must NOT depend on apps/*
packages must NOT depend upward on richer packages that create cycles
```

Allowed package → package edges are defined in §11.

### 2.5 Client responsibilities

- Fetch and validate backend responses  
- Present backend results consistently  
- Own UX, navigation, maps, accessibility, and platform integration  
- Never become a second backend  
- Never recalculate or reinterpret backend intelligence or canonical scoring  

### 2.6 Backend responsibilities

- Own all environmental intelligence  
- Own canonical scoring  
- Own all contracts  
- Own persistence, catalog, and API versioning  
- Emit presentation tokens (e.g. AQI/UV/pollen `colorToken`) so clients map tokens—not invent alternate intelligence  

### 2.7 Platform-specific rendering

**Platform-specific rendering remains application-owned** unless there is compelling evidence that sharing reduces long-term complexity.

Technical feasibility alone (e.g. React Native Web) is not sufficient justification for a shared UI package or shared component. Prefer duplicated presentational UI over a shared abstraction that couples divergent platforms.

---

# 3. Repository Structure

```
whereskarl-clients/                    # logical monorepo name (GitHub rename optional later)
│
├── apps/
│   ├── web/                           # Next.js App Router production web
│   │   ├── app/                       # routes, layouts, metadata, SEO
│   │   ├── components/                # web-only UI
│   │   ├── lib/                       # web adapters (env, storage, Next helpers)
│   │   ├── public/                    # static assets
│   │   ├── tests/                     # web + package-consuming tests
│   │   ├── package.json
│   │   ├── next.config.ts
│   │   ├── tsconfig.json
│   │   ├── eslint.config.*
│   │   └── vitest.config.ts
│   │
│   └── universal/                     # Expo Router (iOS / Android / RN Web)
│       ├── src/
│       │   ├── app/                   # Expo Router screens
│       │   ├── components/            # RN / RN Web UI
│       │   ├── hooks/                 # app data hooks
│       │   ├── lib/                   # universal adapters (storage, map layout)
│       │   ├── providers/
│       │   └── constants/             # app-local constants only when not shareable
│       ├── assets/
│       ├── app.json                   # or app.config.*
│       ├── package.json
│       ├── tsconfig.json
│       ├── metro.config.js            # monorepo resolution
│       └── tests/                     # introduced as Universal matures
│
├── packages/
│   ├── schemas/                       # Zod contracts + inferred types
│   ├── api-client/                    # HTTP transport + endpoint functions
│   ├── domain/                        # presentation rules for backend results
│   ├── search/                        # catalog search / matching rules
│   ├── design/                        # design tokens (not components)
│   └── config/                        # shared non-secret product configuration
│
├── package.json                       # npm workspaces root
├── package-lock.json                  # single lockfile
├── tsconfig.base.json                 # shared compiler defaults (optional but recommended)
├── .env.example                       # documents required public env vars (no secrets)
├── README.md
├── AGENTS.md                          # agent/tooling notes
└── docs/
    └── architecture/
        └── client-monorepo-architecture.md    # this specification (canonical)
```

### Top-level folder rationale

| Folder | Purpose |
|--------|---------|
| `apps/` | Deployable products. May use platform frameworks freely. |
| `packages/` | Reusable, testable, platform-agnostic libraries. |
| `docs/architecture/` | Normative architecture documents; not product copy. |
| Root `package.json` | Workspace membership and developer entry scripts only. |

**Not present by design:** `packages/ui`, `packages/analytics`, `packages/content` (see §4). Backend and Swift remain outside this tree forever under this specification.

---

# 4. Package Responsibilities

Package names use the scope `@whereskarl/<name>`.

Shared packages must remain completely unaware of which application consumes them (see §2.3).

---

### 4.1 `@whereskarl/schemas`

**Purpose:** Single TypeScript expression of backend API contracts.

**Responsibilities**
- Zod schemas for responses and shared fields  
- Inferred TypeScript types  
- Parse helpers (`parseApiResponse` or equivalent)  
- Contract enums/unions that mirror backend (regions, color tokens, climate values, data status, confidence fields)

**Allowed**
- Zod schemas, types, pure refinements, fixture-oriented schema exports  
- Documentation comments linking to backend endpoints

**Forbidden**
- `fetch`, React, UI, MapLibre, env reads, scoring presentation colors, search algorithms  
- Inventing fields not present in backend contracts  
- Platform conditionals or application awareness  
- Recalculating backend intelligence or canonical scores  

**Consumers:** `api-client`, `domain`, `search`, both apps (types only when needed)

**Dependencies:** `zod` only (prefer keeping transitive surface minimal)

**Future evolution:** Version schemas in lockstep with backend API versions; additive optional fields preferred over breaking changes. If GraphQL arrives, this package may gain GraphQL document types—or a sibling package—without changing apps’ ownership model.

---

### 4.2 `@whereskarl/api-client`

**Purpose:** Own all HTTP communication with the Where’s Karl backend for TypeScript clients.

**Responsibilities**
- Base URL injection interface (apps provide resolved URL)  
- Path/query builders  
- `ApiError` and request lifecycle  
- Endpoint functions (`getCurrent`, `getLocations`, `getBestSunshine`, `getHealth`, `getKarlIntelligence`, …)  
- Response validation via `@whereskarl/schemas`

**Allowed**
- Isomorphic `fetch` usage  
- Timeout/retry policy as pure functions (see §10)  
- Endpoint modules grouped by resource

**Forbidden**
- Reading `process.env` directly  
- React Query / SWR / cache stores  
- UI error components  
- Backend URL hardcoding as the only resolution path (constants may live in `config`, resolution in apps)  
- Platform or application branching  

**Consumers:** both apps (and future TS clients)

**Dependencies:** `@whereskarl/schemas`, `@whereskarl/config` (for path constants / defaults only)

**Future evolution:** Add auth headers, idempotency keys, or API version headers without leaking into UI packages.

---

### 4.3 `@whereskarl/search`

**Purpose:** Own client-side location search over the already-loaded catalog.

**Responsibilities**
- Query normalization  
- Matching rules (prefix vs contains—**product-defined once**)  
- Alias matching against backend-provided `search.aliases`  
- Result ordering  
- Empty-query semantics  
- Location ID normalization / deep-link compat aliases that affect identity matching

**Allowed**
- Pure functions over location-like objects typed from schemas  
- Tests as the behavioral contract

**Forbidden**
- Fetching from network  
- Maintaining a parallel frontend alias table that invents catalog metadata  
- UI overlays, virtualized lists, focus management  
- Platform or application branching  

**Consumers:** both apps’ map/search UIs; optionally `domain` only if needed for composition (prefer apps composing `search` + `domain`)

**Dependencies:** `@whereskarl/schemas` (types only; avoid circular domain coupling)

**Future evolution:** Ranking, recent searches, and typo tolerance may extend this package—still without owning UI. Server-side search, if introduced, remains backend-owned; this package would then wrap client filtering or call an api-client search endpoint without duplicating backend ranking.

---

### 4.4 `@whereskarl/domain`

**Purpose:** Own client-side **presentation rules** for backend results that must be identical across TypeScript clients—formatting, band labels, color-token mapping, and catalog-derived UI helpers. This package does **not** own environmental intelligence or canonical scoring; those remain backend-owned. Clients never recalculate backend intelligence here.

> Naming note: Prefer **`domain`** over `product` or `core`. It signals “rules about presenting the product world,” not “UI kit” and not “backend intelligence.” Backend remains the intelligence and canonical scoring authority.

**Responsibilities**
- Clear Skies Score **presentation** (clamping for display, band labels, colors) derived from backend-provided score values—not independent score calculation  
- Environmental **presentation** (AQI, UV, pollen, humidity, visibility) mapping backend `colorToken` → platform-neutral color values  
- Fog intensity **labels/classification for UI** based on backend-provided fog/sunshine fields—not a parallel intelligence model  
- Region resolution from backend `location.region` + product region catalog constants used for chips/membership  
- Confidence label formatting rules  
- Shared product vocabulary constants that are behavioral (e.g. intensity label strings tied to display bands)  
- Deep-link identity helpers that are not search-specific (if not housed in `search`)  
- Climate presentation helpers when they are pure mappings of backend climate enums  

**Allowed**
- Pure functions and constants  
- Dependencies on schemas and design tokens  

**Forbidden**
- React components  
- Reinterpreting or re-deriving backend intelligence or canonical scores  
- Map camera math that is layout-specific (phone-portrait padding profiles may live in apps until intentionally unified)  
- MapLibre layer mutation  
- Storage, navigation routers, analytics providers  
- Platform or application branching  

**Consumers:** both apps

**Dependencies:** `@whereskarl/schemas`, `@whereskarl/design` (for token references where presentation needs hex/RGB)

**Future evolution:** New environmental metrics follow the same pattern: backend emits canonical fields + tokens (and any canonical scores); domain maps tokens and formats compact strings for consistent presentation.

**Governance:** If `@whereskarl/domain` begins collecting unrelated responsibilities, it **must be split through a future ADR** rather than continuing to grow indefinitely. Do not use `domain` as a default dumping ground for any shared TypeScript.

---

### 4.5 `@whereskarl/design`

**Purpose:** Own design foundations (tokens), not components.

**Responsibilities**
- Brand color tokens (navy, gold, …)  
- Status / score / environmental palette registries used across clients  
- Spacing, radius, elevation token scales (numeric / CSS-variable-friendly)  
- Typography token *names and roles* (not platform font loading)  
- Motion duration/easing tokens (values only)  
- Icon *names / semantic keys* if shared; not SVG React components that assume DOM  

**Allowed**
- JSON/TS token objects  
- Helpers like `rgbToken()` that are pure  

**Forbidden**
- React / RN components (`Button`, `Card`, `BottomSheet`)  
- `Platform.select` from React Native  
- Application awareness (`isWeb`, etc.)  
- Tailwind class strings as the only representation (tokens must be framework-agnostic; apps may map tokens → Tailwind or StyleSheet)  

**Consumers:** `domain`, both apps

**Dependencies:** none (or negligible)

**Future evolution:** Token formats may gain Style Dictionary / CSS variable exporters; still no shared component library until a deliberate ADR revises this spec.

---

### 4.6 `@whereskarl/config`

**Purpose:** Own shared **non-secret** product configuration constants.

**Responsibilities**
- Documented production API base URL constant  
- API path constants if not colocated in api-client  
- Shared timeouts, stale-time defaults for weather queries  
- Public query parameter names (`location`, `selected`, `region`)  
- Feature flag *keys* and default values (boolean defaults only; resolution stays in apps)  
- CDN/public asset host constants when shared  

**Allowed**
- Immutable constants and small pure resolvers that do not touch `process.env`  

**Forbidden**
- Reading environment variables  
- Secrets, API keys, private tokens  
- Build-tool configuration (Next/Expo config files stay in apps)  
- Platform or application branching  

**Consumers:** `api-client`, apps, occasionally `domain`/`search`

**Dependencies:** none preferred

**Future evolution:** Feature flags may later resolve via a remote config service; the package still owns keys and types, apps own providers.

---

### 4.7 Packages that must NOT exist (v1 normative)

| Package | Why forbidden now |
|---------|-------------------|
| `@whereskarl/ui` | Premature; locks divergent platforms into one abstraction. Share tokens and presentation rules, not components. Platform-specific rendering stays application-owned unless sharing demonstrably reduces long-term complexity. |
| `@whereskarl/analytics` | Analytics is disabled/stubbed; providers differ by platform. Introduce only when a real multi-app provider exists. |
| `@whereskarl/content` | Copy is thin and screen-contextual; a junk drawer risks becoming a second CMS. Prefer domain vocabulary constants or app-local copy. |
| `@whereskarl/maps` | Map engines differ (MapLibre DOM vs RN Maps vs RN Web). Shared pure geo helpers may live in `domain`; map SDKs stay in apps. |
| `@whereskarl/native-bridge` | No shared native module strategy required for Web + Expo. |

A new package requires satisfying **Package Acceptance Criteria** (§16.0) and an Architecture Decision Log entry (§19 process).

---

# 5. Application Responsibilities

### 5.1 `apps/web`

**Owns**
- Next.js App Router, layouts, metadata, sitemap, robots  
- Vercel deployment configuration and `NEXT_PUBLIC_*` env wiring  
- DOM UI (Tailwind/CSS), BottomSheet, desktop chrome, SEO pages  
- MapLibre browser map integration and web-only CSS  
- React Query (or successor) caching wired to api-client  
- Web storage adapters  
- Web analytics provider wiring (when enabled)  
- Web-only tests for components and Next integration  

**Must consume shared packages for:** schemas, API calls, search, domain presentation, design tokens, shared config constants.

**Must not:** duplicate Zod schemas, reimplement Clear Skies display bands, invent alias tables, fork environmental color maps, or recalculate backend intelligence / canonical scores.

---

### 5.2 `apps/universal`

**Owns**
- Expo Router screens and navigation  
- React Native / RN Web UI, liquid glass / native chrome  
- `KarlMap` platform splits (`.native` / `.web`)  
- AsyncStorage / platform storage  
- `EXPO_PUBLIC_*` env wiring  
- EAS/Metro/app.json configuration  
- Universal-specific hooks composing api-client  

**Must consume the same shared packages as web for consistent presentation of backend results.**

**Must not:** maintain parallel type definitions of API payloads, divergent search semantics, alternate score presentation thresholds, or recalculate backend intelligence / canonical scores.

---

# 6. Platform Boundaries

The following remain **application-owned** by default. Shared rendering is exceptional and requires an ADR demonstrating that sharing **reduces** long-term complexity—not merely that sharing is possible.

| Concern | Why permanent boundary |
|---------|------------------------|
| Maps & markers rendering | Different SDKs and gesture models |
| Navigation containers | Next App Router vs Expo Router |
| Bottom sheets / modals | DOM pointer/ARIA vs RN modal/gesture-handler |
| Responsive desktop layouts | CSS grid/media queries vs RN layout |
| Animations / transitions | CSS/WAAPI vs Reanimated |
| Storage | `localStorage` vs AsyncStorage / SecureStore |
| Image handling | `next/image` vs `expo-image` |
| Font loading | `next/font` vs `expo-font` |
| Safe area / system UI | CSS env insets vs `react-native-safe-area-context` |
| Platform permissions | Browser geolocation vs native permission APIs |
| Push notifications / widgets / watch | Native-only surfaces |
| SEO / SSR / metadata | Web-only |
| Splash screens / app icons | Universal-only |

**Rule:** If removing the platform runtime would make the module meaningless, it belongs in an app—not a shared package.

**Rule:** Do not create shared UI simply because it is technically possible.

---

# 7. Shared Domain Rules

These categories **must exist exactly once** in shared packages (primarily `domain`, `search`, `schemas`, `config`). They govern **consistent presentation and client interaction** with backend results—not alternate intelligence.

| Category | Home | Notes |
|----------|------|-------|
| API response shapes | `schemas` | Mirror backend; never fork |
| Request path construction | `api-client` | Single endpoint map |
| Catalog search & alias matching | `search` | Operates on loaded `/locations`; aliases from backend only |
| Location ID normalization / compat aliases | `search` or `domain` | e.g. `ocean-beach-sf` → `ocean-beach` |
| Clear Skies Score display bands, colors, labels | `domain` | Presentation of backend-provided scores; not a second scoring engine |
| Fog intensity labels & UI classification | `domain` | Based on backend-provided fog/sunshine fields |
| Environmental metric presentation | `domain` | Token → color, compact formatters |
| Climate label presentation | `domain` | Enum mapping only |
| Confidence label normalization | `domain` | e.g. suppress “Unavailable” noise |
| Backend region → visible product region | `domain` | Peninsula → SF visibility mapping, etc. |
| Product region catalog (ids, names, chip labels, membership bounds) | `domain` | Geometry constants for membership—not camera UX |
| Deep-link query param names & read precedence | `config` + helpers in `search`/`domain` | Writers/readers must agree |
| Product vocabulary tied to display bands/status | `domain` | “Karl Territory”, score quality labels |
| Weather query stale-time defaults | `config` | Apps may override consciously |
| Data degraded / freshness presentation rules | `domain` | Based on backend `dataStatus` |

**Explicitly not shared as “domain logic”:** Karl Intelligence narrative composition that is screen-specific may start app-local, but any presentation rule that affects **both** apps’ meaning of the same backend field must graduate into `domain`.

Backend environmental intelligence and canonical scoring are **never** reimplemented in these packages.

---

# 8. Design System

### 8.1 Architecture

```
@whereskarl/design  →  token source of truth
        ↓
apps map tokens → Tailwind theme / StyleSheet / CSS variables
```

There is **no shared component library** in this specification.

### 8.2 Token categories (belong in `@whereskarl/design`)

| Category | Examples |
|----------|----------|
| Brand colors | navy, navySoft, navyGlass, gold, goldDeep |
| Status / score colors | Clear Skies clear/moderate/poor (display palette) |
| Environmental palettes | AQI/UV/pollen token → hex maps (may be re-exported via domain for cohesion, but values originate as design tokens) |
| Typography roles | display, body, mono, rounded — **role names**, not loaded font files |
| Spacing scale | xs→xxl numeric scale |
| Radius scale | sm/md/lg/pill |
| Elevation | shadow opacity/blur tokens (values only) |
| Motion | duration/easing tokens |
| Icon semantics | `condition.clear`, `nav.home` keys |

### 8.3 Does not belong in design

- React/RN components  
- Map marker DOM markup  
- Screen layouts  
- Copywriting paragraphs  
- Backend colorToken string enums (those are **schemas**; design maps them to colors)  

### 8.4 Cross-platform application

- **Web:** map tokens to CSS variables + Tailwind `@theme`  
- **Universal:** map tokens to StyleSheet constants  
- Both must reference the same numeric/hex sources—no parallel RGB definitions  

---

# 9. Configuration Architecture

### 9.1 Layers

| Layer | Location | Contents |
|-------|----------|----------|
| Shared constants | `@whereskarl/config` | Production URL constant, param names, timeouts, flag keys |
| App env adapters | `apps/*/lib/env` (or equivalent) | Read `NEXT_PUBLIC_*` / `EXPO_PUBLIC_*`, DOM injection for Next |
| Runtime injection | apps at startup | Pass resolved API base URL into api-client |
| Build config | each app | `next.config.ts`, `app.json`, Metro |
| Secrets | platform secret stores only | **Never** in git, packages, or `NEXT_PUBLIC_`/`EXPO_PUBLIC_` |

### 9.2 Environment variables

- Public client config only in public env vars.  
- Naming: `NEXT_PUBLIC_API_URL`, `EXPO_PUBLIC_API_URL` (platform prefixes required by frameworks).  
- Semantic names after prefix must align (`API_URL`).  
- No localhost fallbacks in production builds.  

### 9.3 Feature flags

- Keys + defaults in `@whereskarl/config`  
- Resolution (remote/local) in apps  
- Flags must not fork schemas  
- Flags must not enable client-side reinterpretation of backend intelligence  

### 9.4 CDN / assets

- Remote hero imagery hosts configured per app build where framework-specific (e.g. Next `images.remotePatterns`)  
- Shared host constants may live in `config` if both apps need them  

---

# 10. API Architecture

### 10.1 Ownership

All TypeScript backend HTTP access goes through `@whereskarl/api-client`.

### 10.2 Request lifecycle

1. App resolves base URL via env adapter  
2. Caller invokes endpoint function  
3. Client builds path/query  
4. `fetch` with JSON Accept headers  
5. Non-OK → `ApiError` with status  
6. Body parsed  
7. Zod schema validation via `@whereskarl/schemas`  
8. Typed result returned  

### 10.3 Validation

- **Required** for TypeScript clients  
- Invalid payloads fail closed (throw); UI maps errors to degraded states  
- Clients do not “repair” backend data beyond schema `.optional()` / documented compat  
- Clients do not invent missing intelligence fields  

### 10.4 Caching

- **Not** in api-client  
- Web: React Query (or successor) in app  
- Universal: app hooks / future query library  
- Cache TTLs may read defaults from `@whereskarl/config`  

### 10.5 Retry / timeouts

- Policy defined once in api-client (idempotent GETs only)  
- No retry storms on 4xx  
- Timeouts configurable via client options  

### 10.6 Versioning

- Prefer URL or header API versioning owned by backend  
- Client schemas version with backend releases  
- Breaking contract changes require coordinated backend + schemas release  

### 10.7 GraphQL / future transports

- REST is current standard  
- If GraphQL is introduced, transport may extend api-client or add `@whereskarl/graphql-client`, but **schemas/domain/search ownership model does not change**  
- Apps still must not embed ad-hoc clients  

---

# 11. Dependency Rules

### 11.1 Matrix

| From ↓ / To → | apps | schemas | api-client | search | domain | design | config |
|---------------|------|---------|------------|--------|--------|--------|--------|
| **apps** | — | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **api-client** | ✗ | ✓ | — | ✗ | ✗ | ✗ | ✓ |
| **search** | ✗ | ✓ | ✗ | — | ✗* | ✗ | ✓ |
| **domain** | ✗ | ✓ | ✗ | ✗* | — | ✓ | ✓ |
| **design** | ✗ | ✗ | ✗ | ✗ | ✗ | — | ✗ |
| **config** | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | — |
| **schemas** | ✗ | — | ✗ | ✗ | ✗ | ✗ | ✗ |

\* Prefer **no** `domain ↔ search` dependency. Apps compose both. If a rare shared helper is needed, extract to the smaller package or `config`—do not create a cycle.

### 11.2 Absolute forbids

- Packages depending on apps  
- Packages importing `next`, `expo`, `react-native`, DOM-only APIs, `Platform.OS`, `isWeb`, or browser globals as hard dependencies  
- Packages knowing or branching on the consuming application  
- Apps importing another app  
- Duplicating schemas inside apps  
- Swift or backend depending on this monorepo’s packages  
- Client packages reimplementing backend intelligence or canonical scoring  

### 11.3 Platform code

- May depend on all packages  
- May depend on platform frameworks  
- Must not export platform modules back into packages  

---

# 12. Naming Conventions

| Kind | Convention |
|------|------------|
| Packages | `@whereskarl/<kebab-case>` |
| Package folders | `packages/<kebab-case>/` |
| App folders | `apps/web`, `apps/universal` |
| Imports (packages) | `@whereskarl/schemas`, `@whereskarl/domain` |
| Imports (apps) | `@/*` mapped to app source root |
| Types | `PascalCase` (`LocationWeather`, `ApiError`) |
| Zod schemas | `camelCase` + `Schema` suffix (`locationWeatherSchema`) |
| React components | `PascalCase` files matching export |
| Hooks | `use` + `PascalCase` (`useLocations`) |
| Constants | `SCREAMING_SNAKE` for true constants; `camelCase` for config objects |
| Env vars | `<FRAMEWORK_PREFIX>_<SEMANTIC_NAME>` |
| Test files | `*.test.ts(x)` colocated policy per app |

Avoid generic package names (`utils`, `helpers`, `common`, `shared`).

---

# 13. Versioning Strategy

### Workspace

- Private monorepo; packages are **not** independently published to npm in v1  
- Single `package-lock.json` at root  
- Apps and packages share one install graph  

### Package versions

- Internal packages may remain `0.0.0` or `workspace:*` style references  
- Semver becomes mandatory **only if** packages are published externally  

### Release strategy

- **Web:** Vercel deployments from main/preview branches  
- **Universal:** EAS build/submit channels when productionized  
- Git tags for production web releases and store builds: `web-YYYY.MM.DD` / `universal-x.y.z`  

### Implication vs industry npm library practice

Unlike open-source multi-package libraries, Where’s Karl optimizes for **product coherence** over independent package release cadence. That is intentional: drift between web and universal is a higher cost than coupled versioning.

---

# 14. Build Architecture

### Package manager

- **npm workspaces** are the standard  
- One lockfile; no pnpm/Yarn unless a future ADR changes this for Expo tooling necessity  

### Turborepo

- **Not required** for correctness  
- Justified later if CI time, many packages, or remote caching become bottlenecks  
- Must not be introduced merely because “monorepos usually have Turborepo”  

### Workspace scripts (normative intent)

Root scripts orchestrate:

- `dev:web`, `dev:universal`  
- `typecheck` (all workspaces)  
- `test` (at minimum web; universal as suite grows)  
- `lint`  
- `build:web`  

### Testing strategy

- **Package pure logic:** unit tests (Vitest or shared test runner) owned beside packages or in a dedicated test target  
- **Web UI:** component tests in `apps/web/tests`  
- **Universal:** introduce tests as features stabilize; critical shared presentation rules must already be covered at package level  
- Contract fixtures from backend samples belong with schema tests  

### Build order

1. packages (types/build if emitting)  
2. apps  

Prefer TypeScript project references or workspace package `exports` with bundler resolution—apps should not compile package internals via deep relative paths.

---

# 15. Deployment Architecture

| System | Deploy unit | Notes |
|--------|-------------|-------|
| Web | `apps/web` on Vercel | Root Directory `apps/web`; install from workspace root as required for package resolution |
| Universal | `apps/universal` via EAS (when enabled) | Metro must resolve workspace packages |
| Backend | Separate repo / infra | Independent promotion |
| Swift | Separate repo | App Store pipeline independent |

### Environment promotion

- Local → Preview/Staging → Production  
- Each client environment points at the appropriate backend via public API URL  
- Preview web deployments must not silently fall back to production API without explicit config  

### Future CI/CD expectations

- PR checks: install, typecheck, lint, test, web build  
- Path-aware jobs optional later  
- Secrets only in CI/CD and host providers  

---

# 16. Repository Governance

### 16.0 Package Acceptance Criteria

New shared packages should be **rare and intentional**.

Every new shared package must satisfy **all** of the following before it may be added:

1. Serves **at least two consumers**, or has an **imminent** second consumer  
2. Has **one clear responsibility**  
3. Does **not overlap** another package’s responsibility  
4. Remains **platform-agnostic**  
5. Has **explicitly documented dependencies** (edges and forbidden imports)  
6. Has an **approved Architecture Decision Record (ADR)**  

Failure to meet any criterion means the code stays in an application or in an existing package—not a new package.

### Hard rules

1. **No duplicated presentation rules** across apps when both need the same meaning of a backend field.  
2. **No duplicated schemas.**  
3. **Platform UI stays in applications** unless an ADR shows sharing reduces long-term complexity.  
4. **Shared packages remain platform-agnostic** and application-unaware.  
5. **Backend contracts are authoritative.** Client packages mirror; they do not invent.  
6. **Backend owns environmental intelligence and canonical scoring.** Clients never recalculate or reinterpret that intelligence.  
7. **Swift does not import this monorepo.**  
8. **No new package** without meeting Package Acceptance Criteria (§16.0).  
9. **No new runtime dependency** in shared packages without justifying multi-app need and license/size impact.  
10. **Search aliases come from backend catalog metadata**, never ad-hoc frontend tables.  
11. **`@whereskarl/domain` must not become a junk drawer.** Unrelated growth requires a splitting ADR, not silent expansion.  
12. **Shared packages are application-agnostic.** No package may branch on or import the consuming application or its platform runtime (`Platform.OS`, `isWeb`, `next/*`, `expo-*`, DOM APIs, browser globals).  
13. **Architectural changes** that alter §3–§11 require an ADR amending this specification’s version.  

### Introducing a new package

Allowed only when Package Acceptance Criteria (§16.0) are fully satisfied.

### Amending this specification

- Increment spec version (e.g. 1.1)  
- Add ADR entry  
- Do not “quietly” expand `domain` into a junk drawer—split with ADR if needed  

---

# 17. Future Expansion

| Future surface | How architecture absorbs it |
|----------------|----------------------------|
| Additional TS clients (desktop Electron, marketing site) | New `apps/*`; consume existing packages |
| Widgets / Apple Watch / visionOS | Prefer Swift/native pipelines; consume **backend**, not TS packages. Shared *presentation semantics* are documented via backend contracts + this spec—not code sharing |
| AI features | Backend-owned intelligence; clients render via schemas/domain presentation |
| New environmental metrics | Backend fields + schema + domain presenter |
| Additional weather providers | Backend integrates providers; clients present new contract fields without restructuring |
| Server-driven search | api-client endpoint + keep `search` for client-side filtering or thin wrapper |
| Analytics | Optional future package only when one provider serves multiple apps and §16.0 is met |
| Design component library | Requires ADR reversing §4.7 and proving reduced long-term complexity; tokens remain prerequisite |

**Goal:** expand by **adding apps or backend capabilities**, not by re-slicing the monorepo.

---

# 18. Migration Readiness Checklist

**Historical note:** This checklist gated authorization to implement. The client monorepo migration on `migration/client-monorepo` completed technically at `f364882` (Phase 15) with documentation closeout in Phase 16. Items below are retained for audit; see [`../migrations/client-monorepo-completion.md`](../migrations/client-monorepo-completion.md).

- [x] This specification (v1.0+) is accepted by product/engineering owners
- [x] Package list in §4 is approved (including explicit non-packages)
- [x] Dependency matrix in §11 is accepted
- [x] Env var naming and api-client injection model in §9–§10 are accepted
- [x] Search semantics (empty query, prefix/alias rules) are product-approved as the single client standard
- [x] Map query param canonical writer/reader behavior is product-approved
- [x] Vercel Root Directory / install expectations for workspaces are acknowledged by whoever owns deploy config
- [x] Expo Metro monorepo resolution approach is acknowledged as mandatory for Universal
- [x] Decision recorded: Turborepo deferred unless/until §14 trigger conditions
- [x] Decision recorded: no `packages/ui` / `analytics` / `content` in first implementation
- [x] Native Swift and backend remaining separate is reconfirmed
- [x] Backend ownership of intelligence and canonical scoring (clients present only) is reconfirmed
- [x] Success definition agreed: both apps consume shared schemas/domain/search with no parallel type modules remaining

This checklist historically gated **authorization to implement**. It is retained as an audit record.

---

# 19. Architecture Decision Log

### ADR-001 — Single TypeScript client monorepo (Web + Universal)

- **Decision:** One npm-workspace monorepo for Web and Universal.  
- **Reason:** Shared product truth; reduce drift; one install graph.  
- **Alternatives:** Separate repos + published packages; nested folder without workspaces.  
- **Tradeoffs:** Coupled releases; requires Metro/Vercel monorepo literacy.  
- **Long-term:** Stable home for all TS clients.  

### ADR-002 — Backend remains a separate repository

- **Decision:** Backend never joins this monorepo.  
- **Reason:** Different deploy cadence, scaling, and ownership; backend is source of truth for intelligence, canonical scoring, and contracts.  
- **Alternatives:** Full-stack monorepo.  
- **Tradeoffs:** Cross-repo contract coordination required.  
- **Long-term:** Clear authority boundaries.  

### ADR-003 — Swift iOS remains a separate repository

- **Decision:** No TypeScript package consumption from Swift.  
- **Reason:** Language/runtime mismatch; native UX independence.  
- **Alternatives:** Kotlin Multiplatform / shared C layer (out of scope, unjustified).  
- **Tradeoffs:** Parallel implementation of presentation rules in Swift.  
- **Long-term:** Backend contracts + documentation keep parity—not TS reuse.  

### ADR-004 — Share presentation rules, not UI components

- **Decision:** No `@whereskarl/ui` in the architecture.  
- **Reason:** DOM and RN differ; forced sharing creates leaky abstractions. Platform-specific rendering stays application-owned unless compelling evidence shows sharing reduces long-term complexity. “We can share this component” is not enough.  
- **Alternatives:** RN Web mega-UI; duplicate all presentation rules in apps.  
- **Tradeoffs:** Some visual divergence possible; mitigated by design tokens + domain presentation.  
- **Long-term:** Hybrid model scales better than fake universality.  

### ADR-005 — Zod schemas package is mandatory for TS clients

- **Decision:** `@whereskarl/schemas` is the only TS contract surface.  
- **Reason:** Prevent plain-type drift; fail closed on invalid payloads.  
- **Alternatives:** TypeScript-only types; per-app Zod.  
- **Tradeoffs:** Runtime cost; Universal must depend on Zod.  
- **Long-term:** Contract changes happen in one place.  

### ADR-006 — api-client owns HTTP; apps own caching

- **Decision:** Split transport from cache/UI state.  
- **Reason:** Next and Expo may use different async state tools.  
- **Alternatives:** Shared React Query package.  
- **Tradeoffs:** Cache behavior can differ if misconfigured; defaults live in config.  
- **Long-term:** Transport remains stable as app state libraries change.  

### ADR-007 — Dedicated `search` package

- **Decision:** Search matching is not buried inside UI or a catch-all utils package.  
- **Reason:** Search semantics are product-critical and already drifted once.  
- **Alternatives:** Keep inside `domain` only.  
- **Tradeoffs:** Extra package; justified by distinct evolution (ranking, aliases, server search).  
- **Long-term:** Clear owner for catalog matching rules.  

### ADR-008 — `domain` package for presentation rules

- **Decision:** Client presentation rules (score display bands, fog labels, environmental presentation, regions) live in `@whereskarl/domain`.  
- **Reason:** Presentation rules for scores, fog bands, environmental tokens, and regions must be singular across clients. Backend remains the sole owner of environmental intelligence and canonical scoring; `domain` must never become a place to reimplement that intelligence.  
- **Alternatives:** Name it `product` / `core`; put everything in apps.  
- **Tradeoffs:** Requires discipline to avoid junk-drawer growth; split via ADR if unrelated responsibilities accumulate.  
- **Long-term:** Governance (§16) constrains expansion.  

### ADR-009 — Design tokens package without components

- **Decision:** `@whereskarl/design` holds tokens only.  
- **Reason:** Brand/status colors must match; components must not.  
- **Alternatives:** CSS-only in web; StyleSheet-only in universal.  
- **Tradeoffs:** Apps map tokens into framework styles.  
- **Long-term:** Enables future generators without a UI kit commitment.  

### ADR-010 — Config package for non-secret shared constants

- **Decision:** `@whereskarl/config` exists; env reading stays in apps.  
- **Reason:** Share param names/timeouts/production URL constant without fighting Next/Expo env inlining.  
- **Alternatives:** Put constants in api-client only.  
- **Tradeoffs:** Another package; keeps api-client free of product flag keys sprawl.  
- **Long-term:** Clean adapter boundary for runtime config.  

### ADR-011 — npm workspaces; Turborepo deferred

- **Decision:** npm workspaces are standard; Turborepo optional later.  
- **Reason:** Both apps already npm-native; avoid tool sprawl.  
- **Alternatives:** pnpm + Turborepo day one.  
- **Tradeoffs:** Less aggressive caching initially.  
- **Long-term:** Add orchestration when CI pain is measured.  

### ADR-012 — Maps remain application-specific

- **Decision:** No shared map package binding MapLibre/RN Maps.  
- **Reason:** Irreconcilable rendering stacks; pure geo helpers may live in domain.  
- **Alternatives:** Force MapLibre everywhere.  
- **Tradeoffs:** Some overlay math may duplicate until extracted as pure functions.  
- **Long-term:** Prevents SDK lock-in inside core packages.  

### ADR-013 — Analytics / content packages deferred

- **Decision:** Do not create analytics or content packages until multi-app need is real and §16.0 is met.  
- **Reason:** Avoid empty abstractions; analytics currently disabled.  
- **Alternatives:** Stub packages “for later.”  
- **Tradeoffs:** Short-term app-local stubs.  
- **Long-term:** Packages appear via ADR when justified.  

---

# 20. Architecture Stability Goals

This architecture is intended to remain stable as Where’s Karl grows.

It should support, without requiring another repository restructuring:

- additional TypeScript clients  
- additional backend APIs  
- additional environmental metrics  
- additional weather providers (via backend; clients present new contract fields)  
- additional platform-specific applications (new `apps/*` or separate native repos as appropriate)  

Future contributors should extend **apps**, **backend capabilities**, and **existing packages** within these boundaries—not reorganize the monorepo—unless a new ADR amends this specification.

---

## Document control

| Field | Value |
|-------|-------|
| Spec ID | WK-CLIENT-ARCH-1.0 |
| Type | Approved long-term architecture specification + ADR log |
| Practical companion | [`system-architecture.md`](./system-architecture.md) |
| Implementation status | Implemented on `migration/client-monorepo` (technical closeout `f364882`) |
| Supersedes | Informal nested `whereskarl-universal/` layout as target architecture |

**End of specification.**
