# Deployment and Validation Runbook

**Audience:** engineers validating local work and Web Preview
**Architecture:** [`system-architecture.md`](./system-architecture.md)
**Closeout baseline:** Phase 15 at commit `f364882`
**Figures below are the approved migration-closeout baseline** and may change as debt is fixed.

---

## Web / Vercel

Verified project setup (dashboard-managed; **no** committed `vercel.json`):

| Setting | Value |
|---------|-------|
| Framework | Next.js |
| Root Directory | `apps/web` |
| Build Command | `npm run build` |
| Output Directory | Framework default |
| Install Command | Default (workspace install from repo root) |
| Include files outside root directory | Enabled |

Notes:

- Environment variables (`NEXT_PUBLIC_API_URL`, etc.) are managed in the deployment environment, not in repository deploy config.
- Repository code does **not** own Vercel project settings. Do not add `vercel.json` casually.
- Preview must reach **Ready** before treating a migration/deploy checkpoint as approved.
- An unauthenticated Vercel CLI failure is **not** authoritative when GitHub/Vercel deployment status already shows Ready.

Local production-shaped check:

```bash
npm run build
```

---

## Universal / Expo

```bash
npm run dev:universal
```

- Metro resolves all `@whereskarl/*` workspace packages.
- Package `exports` are enabled; apps import package roots only.
- No special package copies or deep imports are required.
- Expo / Metro / Babel / React Native versions were left as-is at migration closeout; do not “fix” resolution by upgrading casually.

Universal lint (`expo lint`) is **not** currently a trusted green gate and is omitted from root `npm run lint`.

---

## Validation commands

From repository root:

```bash
npm run lint
npm run typecheck
npm run typecheck:universal
npm run test
npm run build
npm run validate   # lint && typecheck && test && build:web
```

### Expected closeout baseline (`f364882`)

**Web**

| Check | Baseline |
|-------|----------|
| Typecheck | **6 × TS1501** in `tests/map/phonePortraitAttributionCss.test.ts` (regex `s` flag / lib target) |
| Tests | **747** passing; **5** failing in `BayAreaMap.test.tsx` |
| Production build | Passes |
| Lint | **0** errors; **10** warnings (exhaustive-deps, no-img-element, unused eslint-disable) |

**Universal**

| Check | Baseline |
|-------|----------|
| Typecheck | Passes |
| Lint | Not a trusted green gate |

**Packages**

| Package | Tests |
|---------|-------|
| `@whereskarl/design` | 6 |
| `@whereskarl/config` | 4 |
| `@whereskarl/schemas` | 15 |
| `@whereskarl/api-client` | 22 |
| `@whereskarl/search` | 14 |
| `@whereskarl/domain` | 58 |

**Root `validate`:** exits nonzero at Web typecheck (honest; does not mask). To finish the matrix after that stop, run `npm test` and `npm run build` separately.

---

## Local validation procedure

1. `npm install` at repository root (single lockfile).
2. Configure app env (`apps/web/.env.local`, Universal `.env` as needed). See root `.env.example`.
3. Run package/app checks as needed, or `npm run validate` knowing typecheck may stop early.
4. For Web UI: `npm run dev:web`.
5. For Universal: `npm run dev:universal` and confirm `@whereskarl/*` resolve.

---

## Preview verification procedure

1. Push the branch (or open/update the PR) so Vercel creates a Preview.
2. Confirm deployment status **Ready** in GitHub checks / Vercel dashboard.
3. Smoke critical Web paths on Preview when product validation is required (home, map, search, detail).
4. Do not treat CLI auth errors as deploy failure if the dashboard shows Ready.

---

## Rollback (high level)

- **Git:** revert or reset to a known good commit on `migration/client-monorepo` / `main` as appropriate for the situation; prefer revert on shared branches.
- **Vercel:** redeploy a previous Ready deployment; restore prior dashboard settings only if they were changed (they should not be changed casually).
- **Do not** introduce nested lockfiles or temporary import shims as a rollback shortcut.

This runbook does not define a full production incident process.

---

## What not to change casually

- Vercel Root Directory / install / build settings
- Package public `exports` maps and root-only import rules
- Shared package ownership boundaries
- Adding Turborepo/Nx or a second package manager without an ADR
- “Fixing” baseline TS1501 / BayAreaMap failures silently inside unrelated work
- Environment reads inside shared packages

---

## Known limitations

Documented at migration closeout (see also [`../migrations/client-monorepo-completion.md`](../migrations/client-monorepo-completion.md)):

- Web typecheck and BayAreaMap test failures above
- Web lint warnings
- Universal lint gap
- Web / Universal React and TypeScript version drift
- Empty tracked `main` file at repo root
- Near-duplicate fog overlay helpers across apps (map SDK–adjacent; app-owned)
- `cssColorTokens` exported from design but not yet wired into Web CSS
- `BAY_AREA_BACKEND_REGION_IDS` defined in both schemas (contract enum) and domain (product catalog helper)
- Universal Clear Skies UI still mixes domain band colors with gold StyleSheet defaults in places
