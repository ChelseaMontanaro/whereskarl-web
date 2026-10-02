# Where's Karl — Version 1.0 Public Launch Record

**Status:** CLOSED AND FROZEN. Launch date October 2, 2026.
**Audience:** owner and anyone who later proposes a production change.
**Scope:** record only. This document does not authorize a deployment, a source change, or a rollback.

Version 1.0 is publicly distributed. Apple App Review is complete. The public App Store listing is live. The production website links to that listing. Production backend hardening and production image optimization are complete. Owner physical QA passed.

No further launch-day change is authorized. A later production change needs a new explicitly named post-launch phase, a defined scope, the applicable Golden Rule, a production checkpoint, a rollback plan where the change can be rolled back, validation, and explicit owner authorization.

## 1. Public App Store

| Item | Value |
|------|--------|
| App | Where's Karl |
| Version | 1.0.0 |
| Build | 3 |
| Bundle | `whereskarl.live.app` |
| Apple App ID | 6815249247 |
| Public URL | https://apps.apple.com/app/wheres-karl/id6815249247 |
| Review | Approved |
| Distribution | Live |
| Build 4 | Does not exist |

Owner physical check: the public listing loads on an iPhone, the Get button is available, and the listing is reachable from that phone.

Read-only confirmation on October 2, 2026: the canonical URL returned HTTP 200 and the page title `Where's Karl App - App Store`, including App ID 6815249247.

## 2. iOS release checkpoint

| Item | Value |
|------|--------|
| Frozen source | `7287b648ac85d93a99386c61f5500d07c7bd09f8` |
| Review branch | `review/build-3-remediation` |
| Version / build | 1.0.0 / 3 |
| Bundle | `whereskarl.live.app` |
| EAS Build | `7da6a016-b662-4f80-b3a3-187eb9233695` |
| EAS Submission | `6da1cf0e-4bb4-4120-a373-39651808262c` |
| App Store Connect app | 6815249247 |

Rollback reference for the iOS binary is this Build 3 source and these EAS identifiers. Do not create Build 4 or version 1.0.1 from launch closeout.

## 3. Website production checkpoint

| Item | Value |
|------|--------|
| Repository | `ChelseaMontanaro/whereskarl-web` |
| Production branch | `main` |
| Production SHA | `019cffab71746714c3fac4c451f6aca3ab6cdcbd` |
| Subject | feat: activate App Store download links |
| Previous production SHA | `7973b985665afaf37c80752d9c5cac8c27092d4d` |
| Public site | https://whereskarl.live |
| Map | https://whereskarl.live/map |
| Privacy | https://whereskarl.live/privacy |
| Support | https://whereskarl.live/support |

`origin/main` was read on October 2, 2026 and matched `019cffab71746714c3fac4c451f6aca3ab6cdcbd`.

App Store controls are active. Every verified control uses exactly:

https://apps.apple.com/app/wheres-karl/id6815249247

Read-only page check the same day:

| Surface | Result |
|---------|--------|
| Homepage header pill | canonical URL, `rounded-full` |
| Homepage hero badge | canonical URL, `rounded-lg` |
| Homepage scenic badge | canonical URL, `rounded-lg` |
| Privacy header pill | canonical URL |
| Support header pill | canonical URL |
| `/map` | HTTP 200, map shell |
| Homepage images | not re-fetched in this closeout; W1 production QA returned 200 for the hero, screenshots, logo, favicon, icon, and apple icon |

Owner physical QA: the live website App Store links open the correct Where's Karl listing.

Website rollback reference: redeploy `7973b985665afaf37c80752d9c5cac8c27092d4d` only under a new authorized phase. That SHA is the pre-link production site.

## 4. Backend production checkpoint

| Item | Value |
|------|--------|
| Repository | `ChelseaMontanaro/whereskarl-backend` |
| Authoritative branch | `main` |
| Production SHA | `b0009585d32aa9a1567d6131c3a71d214b683bd7` |
| Vercel production deployment | `dpl_BDg4Uh37Sbnhb6vWJGcetApxL6St` |
| Public API | https://api.whereskarl.live |
| Lineage reconciliation | Complete |

`origin/main` for the backend repository was read on October 2, 2026 and matched `b0009585d32aa9a1567d6131c3a71d214b683bd7`.

The public API was checked once:

| Route | Result |
|-------|--------|
| `GET /health` | HTTP 200, `status: ok`, service `wheres-karl-api` |
| `GET /current` | HTTP 200, `source: live`, `karlLocationId: pacifica` |
| `GET /locations` | HTTP 200, 55 locations |
| `GET /karl-intelligence?locationId=pacifica` | HTTP 200, intelligence payload including `heroImagery`, `narrative`, and `source` |

The deployment id above is the owner-declared Vercel production deployment for this closeout. The unauthenticated API response does not include that deployment id. A branch named `main` is still not, by itself, permission to deploy. Future backend deployments must verify the lineage that is actually in production before deployment.

Permanent rule: [BACKEND_DEPLOYMENT_GOLDEN_RULE.md](./BACKEND_DEPLOYMENT_GOLDEN_RULE.md).

Backend rollback reference: the previous production deployment that `dpl_BDg4Uh37Sbnhb6vWJGcetApxL6St` replaced, identified from the Vercel production history in a future authorized phase. Do not roll back from this closeout.

## 5. Redis production checkpoint

Production Upstash Redis was verified active before this closeout. This closeout did not read or write Redis and did not read credential values.

| Item | Value |
|------|--------|
| State | Verified active |
| Canonical Karl key | `karl:position:v1` |
| Persistence | Durable Redis |
| TTL | None (`-1`) |
| Accepted credential family | `UPSTASH_REDIS_REST_KV_REST_API_URL` and `UPSTASH_REDIS_REST_KV_REST_API_TOKEN` |

## 6. Image production checkpoint

| Item | Value |
|------|--------|
| Blob store | `whereskarl-hero-images` |
| Store ID | `store_snhiTXYRhsE7O7XM` |
| Original PNGs | Retained |
| Optimized JPEGs | 92 |
| Day/night pairs | 46 |
| Original library | 227,468,961 bytes |
| Optimized library | 24,869,553 bytes |
| Reduction | 89.07% |
| Dynamic location URLs | optimized q80 JPEG |
| Dynamic Home hero | optimized q80 JPEG |
| New iOS binary required | No |

Do not delete the original PNGs from launch closeout.

## 7. Owner physical QA

Exact binary: Version 1.0.0, Build 3.

| Check | Result |
|-------|--------|
| Cold / force-quit launch | Pass |
| Home hero image | about 1–2 seconds |
| Map to Home | Pass |
| Favorites to Home | Pass |
| Home image after navigation | about 1–2 seconds |
| Multiple Map location images | Pass |
| Favorites image navigation | Pass |
| Missing or broken images | None observed |
| Website App Store links | Pass |
| App Store destination | Correct |
| Overall acceptance | Pass |

## 8. Known pre-existing technical debt

Recorded during website phase W1. Not introduced by App Store CTA activation. The production Next.js build succeeded. Do not treat these as launch blockers.

| Item | Record |
|------|--------|
| Web tests | 5 existing failures in `apps/web/tests/components/BayAreaMap.test.tsx` |
| Typecheck | `tests/map/phonePortraitAttributionCss.test.ts` regex `s` flag; `tests/site/metadata.test.ts` Twitter `card` |
| Lint | 14 existing warnings |

## 9. Deferred post-launch roadmap

Not implemented. Not launch-day work.

Infrastructure and operations:

1. Fix `www.whereskarl.live` TLS / redirect.
2. Google Pollen API / shared-cache optimization.
3. Server-side cache architecture review.
4. Production observability / cost monitoring.
5. API fallback visibility.
6. Karl Intelligence history persistence.
7. Production infrastructure documentation maintenance.

iOS and UX, for a future release:

8. Home hero state retention.
9. Bottom navigation / screen lifecycle.
10. Home / API data-flow optimization.
11. Full surface-specific image architecture: thumbnail, card, hero, selective prefetch, and memory/disk strategy.

Technical debt:

12. Resolve the pre-existing BayAreaMap test failures.
13. Resolve the pre-existing web typecheck failures.
14. Review the existing lint warnings.

Product and business:

15. Post-launch analytics and usage strategy.
16. Monetization strategy.
17. Future catalog and location expansion.

## 10. Freeze

| Surface | State |
|---------|--------|
| iOS Version 1.0 | Frozen |
| Website launch state | Frozen |
| Backend launch state | Frozen |
| Image migration | Frozen |
| App Store 1.0 metadata | Frozen |
| Additional launch-day changes | Not authorized |

This documentation commit does not change application source, production configuration, or any deployed system.
