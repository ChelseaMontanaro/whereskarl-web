# Client Monorepo Migration — Completion Record

**Status:** Technical migration complete; Phase 16 documentation closeout
**Branch:** `migration/client-monorepo`
**Final technical checkpoint:** `f364882` — `chore: finalize monorepo validation workflow`
**Documentation phase:** Phase 16 (this record + permanent architecture docs)
**Do not rewrite** earlier plan/baseline history; this file closes the migration narrative.

Governing historical documents:

- [`../architecture/client-monorepo-architecture.md`](../architecture/client-monorepo-architecture.md)
- [`client-monorepo-migration-plan.md`](./client-monorepo-migration-plan.md)
- [`client-monorepo-baseline.md`](./client-monorepo-baseline.md)

Permanent post-migration references:

- [`../architecture/system-architecture.md`](../architecture/system-architecture.md)
- [`../architecture/deployment-and-validation.md`](../architecture/deployment-and-validation.md)

---

## Documentation inventory (at Phase 16)

| Path | Purpose | Audience | Current? | Overlap | Action |
|------|---------|----------|----------|---------|--------|
| `docs/architecture/client-monorepo-architecture.md` | Long-form approved architecture + ADRs | Architects / owners | Yes (normative decisions) | Overlaps practical guide | **Retain**; status updated; link to system guide |
| `docs/architecture/system-architecture.md` | Day-to-day system architecture guide | Contributors | Yes (new) | Summarizes arch spec | **Created** (permanent) |
| `docs/architecture/deployment-and-validation.md` | Deploy + validation runbook | Contributors / ops | Yes (new) | Partially in README | **Created** (permanent) |
| `docs/migrations/client-monorepo-migration-plan.md` | Execution plan (phases, risks) | Migration history | Historical | N/A | **Retain**; status header updated |
| `docs/migrations/client-monorepo-baseline.md` | Phase 1 command baseline | Migration history | Historical | N/A | **Retain unchanged** |
| `docs/migrations/client-monorepo-completion.md` | Closeout record | Migration history | Yes (this file) | Summarizes plan outcome | **Created** |
| `README.md` | Root install / scripts / deploy | Contributors | Updated for monorepo | Overlaps runbook lightly | **Updated** |
| `packages/*/README.md` | Package public API notes | Contributors | Yes | Minimal | **Retain** (accurate) |
| `apps/universal/README.md` | Expo app notes | Universal contributors | Partially template | Low | **Retain** (no rewrite) |

No historical migration documents were deleted. No separate ADR files were added; ADRs remain in the architecture specification §19, with a Key Decisions summary in the system guide.

---

## Major checkpoint commits

Verified on `migration/client-monorepo`:

| Commit | Summary |
|--------|---------|
| `f7df47b` | Record migration baseline |
| `4f4ab07` | Move Next.js web app into `apps/web` |
| `46c9e36` | Move Expo universal app into `apps/universal` |
| `60e8ff6` | Scaffold `@whereskarl` shared packages |
| `aa6eb88` | Extract `@whereskarl/design` |
| `e0f70c1` | Extract `@whereskarl/config` |
| `32b8a30` | Extract `@whereskarl/schemas` |
| `dbb89f4` | Extract `@whereskarl/api-client` |
| `0159efe` | Extract `@whereskarl/search` |
| `3bb6a82` | Extract `@whereskarl/domain` |
| `645232e` | Final consolidation / duplicate cleanup |
| `b143280` | Package boundary enforcement |
| `f364882` | Final monorepo validation workflow |

---

## Migration stages (summary)

1. **Baseline and workspace setup** — freeze baseline failures; introduce npm workspaces.
2. **App moves** — Web → `apps/web`; Universal → `apps/universal`.
3. **Package scaffolding** — six `@whereskarl/*` packages with root exports.
4. **Package extractions** — design → config → schemas → api-client → search → domain.
5. **Duplicate consolidation** — remove parallel canonical implementations and shims.
6. **Boundary enforcement** — package `exports` + ESLint restricted imports (Phase 14).
7. **Final validation** — root scripts including `validate`; regression vs baseline (Phase 15).
8. **Documentation** — permanent architecture guide, runbook, this completion record (Phase 16).

Operational phase numbering on the branch (Phases 13–16) differs slightly from the original plan’s Phase 15–20 labels; substance is complete. The plan document is preserved as historical.

---

## Final canonical ownership

| Concern | Owner |
|---------|-------|
| Design tokens / palettes | `@whereskarl/design` |
| Shared non-secret constants | `@whereskarl/config` |
| Zod contracts / `parseApiResponse` | `@whereskarl/schemas` |
| HTTP transport / endpoints | `@whereskarl/api-client` |
| Catalog search / ID normalization | `@whereskarl/search` |
| Score / env / fog / region presentation rules | `@whereskarl/domain` |
| Env, UI, maps, routing, navigation, deploy | Applications |

---

## Final dependency graph

```text
apps → domain | search | api-client | schemas | config | design
domain → schemas, design, config
search → schemas
api-client → schemas, config
schemas → zod
design → (none)
config → (none)
```

---

## Completion assertions

At `f364882` (technical) + Phase 16 docs:

- No compatibility shims remain for package cutover.
- No duplicate canonical implementations remain for schemas / api / search / domain / design / config ownership.
- One root `package-lock.json` remains.
- Preview deployments were validated through the migration (Phase 15 Preview Ready).
- Branch was **technically ready to merge** after Phase 15 (baseline failures acknowledged).
- Phase 16 added **documentation only**.

---

## Remaining technical debt (not fixed in migration)

Supported by Phase 15 closeout and repository evidence:

| Item | Notes |
|------|-------|
| 6 × TS1501 Web errors | `phonePortraitAttributionCss.test.ts` |
| 5 BayAreaMap test failures | Pre-existing baseline |
| Web lint warnings | 10 warnings, 0 errors at closeout |
| Universal lint gap | `expo lint` not a trusted green gate |
| Web / Universal React & TypeScript version drift | e.g. React 19.2.4 vs 19.2.3; TS ^5 vs ~6 |
| Empty tracked `main` file | Root empty file left alone |
| Near-duplicate fog overlay behavior | `apps/web` and `apps/universal` map helpers |
| `cssColorTokens` not wired into Web CSS | Exported from design; Web CSS not consuming yet |
| `BAY_AREA_BACKEND_REGION_IDS` dual definition | Schemas contract enum + domain catalog helper |
| Universal score-color presentation inconsistencies | Domain colors used alongside gold StyleSheet defaults |

These are **not** silent migration regressions. Fix under separate, intentional work.

---

## Merge note

Phase 16 does **not** merge to `main` and does not create a release tag unless requested after review.
