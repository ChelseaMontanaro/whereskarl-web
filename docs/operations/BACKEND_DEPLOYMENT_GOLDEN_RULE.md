# Where's Karl — Backend Deployment Golden Rule

**Status:** PERMANENT. In effect for every future Where's Karl backend deployment until the owner explicitly revises this document.
**Audience:** owner and anyone preparing, reviewing, or executing a backend release.
**Scope:** `ChelseaMontanaro/whereskarl-backend` deployments to production. This document does not authorize a deployment, a branch reconciliation, or a production change.

A clean test suite is not deployment authorization. A branch named `main` is not deployment authorization. A branch believed to be production is not deployment authorization. Production lineage is verified first.

## 1. Purpose

This rule stops a backend release from shipping a source tree that does not contain the code already running in production.

Phase O1 found that the backend repository default branch and the fingerprinted production commit were not the same lineage. Authenticated Vercel project access was unavailable, so the Vercel production-branch setting stayed unverified. The next backend deployment must not assume that `main` is the authoritative production source.

That incident is why this policy exists. The permanent rule does not depend on the SHAs from that audit. Every future deployment re-proves the lineage that is actually deployed at that moment.

This rule applies to all future backend work, including image optimization, Redis work, caching changes, Pollen optimization, observability, bug fixes, feature work, emergency fixes, and configuration-driven backend releases.

## 2. Production Lineage Rule

No Where's Karl backend deployment may occur until the deployment source has been proven to contain the currently deployed production lineage.

Until the backend branch situation is formally reconciled:

- Do not assume `main` is production.
- Do not use `main` as the base of a production deployment merely because it is the repository default branch.
- Every deployment prompt identifies the verified production lineage first.

The comparison baseline is the actual deployed production lineage. Do not compare the candidate only against repository `main`.

If production and another branch have diverged, do not automatically merge, rebase, cherry-pick, reset, force-push, change the Vercel production branch, promote another deployment, or delete branches. Branch reconciliation requires its own Golden Rule phase and explicit owner authorization.

## 3. Pre-Deployment Checklist

Complete every item below in order. Record the result in the closeout report in section 17. If any hard stop in section 16 occurs, stop and return the discrepancy to the owner. Do not deploy.

1. Identify current production (section 4).
2. Identify the candidate source (section 5).
3. Prove Git ancestry (section 6).
4. Audit production-only changes (section 7).
5. Show the exact deployment delta (section 8).
6. Check client and API compatibility (section 9).
7. Verify expected production configuration (section 10).
8. Confirm data and storage actions are separately authorized (section 11).
9. Record pre-deployment health (section 12).
10. Obtain explicit deployment authorization (section 13).
11. Identify rollback before the deployment starts (section 15).
12. After deployment, repeat health checks (section 14).

## 4. Production Identity

Determine the currently deployed production backend before naming a candidate.

Record:

- deployment ID, if available
- source commit SHA
- source branch, if available
- deployment timestamp
- production domain
- deployment health

The production domain is `https://api.whereskarl.live` unless the owner has explicitly changed it.

Acceptable evidence is a read-only platform record that names the deployment and its source SHA, such as the Vercel production deployment or an equivalent authenticated deployment record. A remembered SHA, a local branch name, or the repository default branch is not production identity.

If the production SHA cannot be determined, or the production branch identity is ambiguous, stop. Do not deploy.

## 5. Candidate Identity

Determine the exact candidate source. Record:

- repository
- branch
- HEAD SHA
- parent and recent history
- working tree status
- staged changes
- uncommitted changes

The candidate is one exact SHA. A dirty working tree, staged work that is not part of the authorized change, or uncommitted files block the deployment.

## 6. Git Ancestry Verification

Prove whether candidate HEAD contains the currently deployed production commit.

Preferred proof:

```bash
git merge-base --is-ancestor <production-sha> <candidate-sha>
```

Exit status 0 means the production commit is an ancestor of the candidate. Any other result means the candidate does not contain that production lineage, unless an equally strong ancestry check shows the same fact and is recorded in the closeout.

Return this line explicitly:

```text
PRODUCTION LINEAGE CONTAINED: YES / NO / UNVERIFIED
```

`UNVERIFIED` is a stop. `NO` is a stop. Only `YES` may proceed to the rest of the gate.

## 7. Production-Only Commit Audit

If the candidate SHA differs from the current production SHA, list:

- commits reachable from production that are not reachable from the candidate
- commits reachable from the candidate that are not reachable from production
- files that exist only on the production lineage
- files whose content differs between the two lineages
- functionality that would be lost

Useful read-only commands, after the SHAs are known:

```bash
git log --oneline <candidate-sha>..<production-sha>
git log --oneline <production-sha>..<candidate-sha>
git diff --stat <production-sha>...<candidate-sha>
```

The first log is production-only history. It must be empty before a deployment. Non-empty production-only history means the candidate would drop commits that are already deployed.

## 8. Exact Deployment Delta

Show what the deployment would add, change, and remove relative to current production.

```text
ADD
CHANGE
REMOVE
```

Use `git diff <production-sha> <candidate-sha>` as the source of that classification. Describe behavior, not only file names. Call out Karl persistence, imagery, upstream timeouts, cache behavior, API response shape, and environment assumptions when those areas change.

Do not describe the delta against `main` unless `main` has already been proven to be the deployed production SHA.

## 9. Client/API Compatibility

Before a backend deployment that affects API responses, verify compatibility with the currently supported production client binary.

Record the client that is in production at the time of the deployment: version, build, and bundle identifier. When this policy was adopted, that client was Where's Karl version 1.0.0 build 3, bundle `whereskarl.live.app`. Re-identify the supported binary at each deployment. Do not keep using a stale build number after the owner has approved a newer production client.

A backend deployment must not silently require a newer iOS binary unless that requirement is an explicit part of the authorized release plan.

For API changes, verify:

- schema compatibility
- existing fields remain present
- nullability
- IDs
- enum and value expectations
- URL expectations
- fallback behavior

While an App Store review is in progress, a backend deployment still requires explicit owner authorization in addition to this gate. The binary under review must keep working.

## 10. Environment Verification

Confirm the production configuration the deployment expects. Read only, until a separate phase authorizes a change.

Verify the items the candidate code actually depends on, which may include:

- production branch and deployment source
- required environment variable names and whether each expected pair is present
- cache TTL overrides
- scheduled jobs
- domain and health endpoints

Missing or unreadable expected production configuration is a stop. Do not deploy in order to discover configuration.

## 11. Data/Storage Safety

A backend code deployment does not authorize:

- Redis writes or migrations
- Blob deletion or overwrite
- Google Cloud changes
- environment-variable changes
- DNS changes
- database or schema changes
- secret rotation

Those actions require explicit authorization in the relevant Golden Rule phase. If the candidate implies one of these actions, stop and split that action into its own authorized phase.

## 12. Pre-Deployment Health

Immediately before deployment, verify read-only:

- `GET /health`
- `GET /current`
- `GET /locations`

Record:

- HTTP status
- live or mock source
- catalog count
- Karl location, where the payload exposes it
- degraded state, if the payload exposes it

Do not load-test. Do not send repeated probes beyond these checks.

## 13. Deployment Authorization Gate

All of the following must be true before a deployment starts:

- production SHA is known
- `PRODUCTION LINEAGE CONTAINED: YES`
- production-only commit list is empty
- the deployment delta matches the owner-authorized scope
- client compatibility is recorded
- expected production configuration was verified
- data and storage actions are either absent or separately authorized
- pre-deployment health is recorded
- rollback is identified
- the owner explicitly authorized this deployment in the current phase

A previous phase, a green test run, or a local branch name does not carry that authorization forward.

## 14. Post-Deployment Health

Immediately after deployment, repeat the section 12 checks against the same production domain.

Compare status, source, catalog count, Karl location, and degraded state with the pre-deployment record. An unexpected regression requires stop and rollback as preauthorized by the deployment phase. Do not improvise another fix directly in production.

## 15. Rollback

Before deployment, every backend production phase identifies:

- previous production deployment
- previous production SHA
- rollback mechanism
- whether rollback requires a code deploy or a platform promotion
- any data or storage change that cannot be rolled back with code

If rollback is unclear, stop. Do not deploy.

Rollback uses the mechanism named in the authorized phase. It does not include an unplanned merge, rebase, or production-branch change.

## 16. Stop Conditions

Deployment is prohibited if any of the following is true:

- production SHA cannot be determined
- candidate lineage cannot be compared
- production lineage is not contained
- production-only commits would be lost
- the candidate unexpectedly removes production functionality
- production branch identity is ambiguous
- the working tree contains unrelated changes
- the deployment would include unreviewed commits
- expected production configuration cannot be verified
- deployment scope differs from owner authorization
- rollback is unclear
- client compatibility was not checked for an API-affecting change
- a data or storage mutation would ride along without its own authorization

If any condition occurs:

```text
STOP.
DO NOT DEPLOY.
```

Return the discrepancy to the owner.

Ambiguous production source blocks deployment. Missing production lineage blocks deployment. Loss of production functionality blocks deployment.

## 17. Required Closeout Report

Use this report for every backend deployment phase. Fill every line. Do not leave a gate blank.

```text
BACKEND DEPLOYMENT CLOSEOUT

PRODUCTION IDENTITY
- deployment ID:
- source commit SHA:
- source branch:
- deployment timestamp:
- production domain:
- deployment health:

CANDIDATE IDENTITY
- repository:
- branch:
- HEAD SHA:
- working tree:
- staged changes:
- uncommitted changes:

LINEAGE
- PRODUCTION LINEAGE CONTAINED: YES / NO / UNVERIFIED
- ancestry command:
- production-only commits:
- candidate-only commits:
- functionality at risk:

DEPLOYMENT DELTA
- ADD:
- CHANGE:
- REMOVE:

CLIENT / API
- supported client:
- schema compatibility:
- silent new-binary requirement: NO

ENVIRONMENT
- production configuration verified:
- unverified items:

DATA / STORAGE
- Redis:
- Blob:
- Google Cloud:
- environment variables:
- DNS:
- other:

HEALTH BEFORE
- /health:
- /current:
- /locations:
- catalog count:
- Karl location:
- live/mock:
- degraded:

AUTHORIZATION
- owner authorized this deployment:
- scope:

ROLLBACK
- previous deployment:
- previous SHA:
- mechanism:
- code deploy or platform promotion:
- non-reversible data changes:

HEALTH AFTER
- /health:
- /current:
- /locations:
- catalog count:
- Karl location:
- live/mock:
- degraded:
- regression:

RESULT
- deployed: YES / NO
- stopped because:
```

## Appendix A — Historical context

This appendix explains why the rule was adopted. It is not a substitute for sections 1–17. Re-verify every SHA at deployment time.

Phase O1 (read-only) recorded:

- backend repository `ChelseaMontanaro/whereskarl-backend`
- GitHub `main` at `037c590963ed5e172bae8e60e7e4f25aa428e088`
- Phase A1 live production fingerprint on `feature/product-hardening` at `a730b50ddbc8895a649f0aac33ee0741435aa430`
- `main` did not contain that fingerprint
- production-only lineage at that time included Karl Redis persistence, imagery mappings, and upstream timeout handling
- the Vercel production-branch setting remained unverified

Those values can change. The permanent requirement does not.

## Appendix B — Image delivery hold

The prepared image-optimization backend work must follow this rule. Do not deploy it from `perf/image-delivery-preparation` until production lineage is verified.

When this hold was written, the prepared backend commit was `b0009585d32aa9a1567d6131c3a71d214b683bd7`, based on `feature/product-hardening` at `a730b50ddbc8895a649f0aac33ee0741435aa430`. Those SHAs are a snapshot. Before any image-manifest deployment:

1. Verify the actual production SHA.
2. Verify the actual Vercel production branch.
3. Prove the deployment source contains the current production lineage.
4. Upload and verify all optimized JPEG objects before switching the manifest.
5. Show the exact backend delta against current production.
6. Preserve rollback to the current PNG manifest.
7. Deploy only after that gate and explicit owner authorization.

This hold does not authorize the upload, the manifest switch, or the deployment.
