<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:golden-rule-contract -->
# Where's Karl — Golden Rule Development Contract (Permanent)

**Status: PERMANENT. Applies to this entire repository (Web + Universal +
shared packages). In effect until the user explicitly revises it.**

This contract governs **every** future Cursor implementation, correction, fix,
polish pass, QA correction, or regression repair in this repository — with no
exceptions for changes that appear one-line, isolated, trivial, "just this one
thing," or late-stage QA/polish. Small-fix shortcuts are forbidden (see §14).

## 1. Approved UI / behavior is frozen by default

Anything previously approved by the user is frozen unless the user explicitly
authorizes a change to it. "Frozen" means the element must remain at, or be
restored to, its **approved** visual and behavioral state — it does **not**
mean "leave whatever is currently in the dirty worktree untouched." If
uncommitted work has already regressed a frozen element, identify the
regression and restore the approved state; do not preserve a regression just
because it predates the current task. Only explicitly authorized defects may
change.

## 2. Audit / root-cause before editing

Before touching code: inspect the current implementation, inspect `git
status`, inspect the relevant `git diff`, understand shared components,
understand responsive behavior, identify dependency relationships, and
determine root cause. Distinguish the current dirty-worktree state from the
approved state. Do not patch by visual guesswork, and do not assume the
user's summary perfectly matches the current worktree — verify it.

## 3. Understand broadly, change narrowly

Understand the affected system broadly enough to prevent regressions, then
make the smallest complete change necessary. Never use a task as an excuse
for opportunistic refactoring, redesign, modernization, unrelated cleanup,
renaming unrelated concepts, reorganizing files for preference, or changing
already-approved visual language. Minimal diff is mandatory.

## 4. Shared-component regression protection

Before modifying a shared component, style token, hook, utility, navigation
element, responsive rule, or data contract: identify every screen/surface
that consumes it, verify the fix will not regress those consumers, and prefer
a local correction when changing shared behavior isn't necessary. If shared
behavior must change, explicitly verify all affected consumers. Never fix one
surface by silently breaking another.

## 5. Responsive / device-range verification

Responsive behavior must be based on width, height, safe-area, and layout
constraints — **not** device-model detection, hardcoded iPhone model
branching, or user-agent hacks. Unless a task explicitly narrows the required
range, verify at widths: **320, 390, 430, 768, 820, 1024, 1180**. For iPad in
current phases: must be functional, no clipping, no overflow, sensible
max-width/layout, with no dedicated redesign unless explicitly requested.

## 6. Physical iPhone is the final approval gate

For iOS/Universal UI work, a simulator is not final approval, browser
responsive mode is not final approval, and automated tests are not final
approval. **The user's physical iPhone is the final visual/behavioral
approval gate before commit/push.**

Required workflow:

```
known-good checkpoint
  → freeze approved UI
  → audit / root cause
  → defect-specific minimal diff
  → responsive verification
  → full tests
  → physical iPhone QA
  → ONLY THEN commit/push
```

Do not commit/push release-affecting UI work before the user explicitly
approves the physical-iPhone result.

## 7. Worktree protection

There may be legitimate uncommitted work from other approved phases already
in the worktree. Before editing: inspect `git status`, inspect relevant
diffs, identify existing uncommitted work, and preserve it. Do **not** reset,
clean, discard, checkout away, overwrite, or stash existing work without
explicit authorization. Do not assume dirty files belong to the current task.

## 8. Full validation before success claims

Run the appropriate full validation for the repo. At minimum: relevant
targeted tests, full typecheck, full test suite, any configured lint/static
checks, responsive verification for UI work, and a final `git diff`/`status`
review. Report exact results. Do not hide failures, warnings, skipped tests,
or degraded behavior. If failures/skips are pre-existing, explicitly prove
they match the known baseline.

## 9. No unauthorized commit / push / merge / deploy

Never commit, push, merge, or deploy unless the current task explicitly
authorizes that step. Audit and implementation approval are separate from
commit approval. Commit approval is separate from push approval. Push
approval is separate from production deployment approval.

## 10. Backend / API freeze protection

Phase 23.2 backend production support is COMPLETE / APPROVED / FROZEN.

Canonical backend checkpoint: `0f106d869df6c54642c3d15d2b37a2b391be47fc`

Frozen backend behavior includes: canonical `karlLocationId`; 30-minute
minimum Karl residence; challenger must beat incumbent by `>=5` fogScore;
BOTH conditions required before movement; movement resets held-since;
`regionalAirQuality` semantics; Upstash-backed production persistence; local
memory fallback; production missing-config warning behavior; current
`/current` API compatibility.

Map work (Phase 24 and beyond) must not casually modify any of this. If Map
work appears to require backend/API changes: **STOP and report why before
changing backend behavior.**

## 11. Home is frozen

Phase 23 Home is COMPLETE / APPROVED / FROZEN.

Canonical approved Universal Home checkpoint: `b43df6e`

Future work must not regress: Home hero behavior, Home card layout, regional
AQI presentation, Karl presentation, bottom-nav approved Home state, or any
approved Home responsive behavior.

## 12. Map-specific rule (Phase 24 and beyond)

Map work is a correction/parity phase. The Map must be audited against
approved mobile-web behavior **before** editing. Known issues are not
automatically the complete issue list — the first implementation pass must:
inventory ALL physical-iPhone Map defects, compare against approved mobile
web, identify root causes, distinguish Map-local issues from shared-component
issues, and preserve every already-approved non-Map surface. Do not fix only
a known list if the audit finds additional regressions.

Known physical-iPhone Map issues reported as of Phase 24 include: region
chips clipped/cut off; selected-location expanded content mismatch versus
mobile web; inability to close the selected-location card; bottom navigation
mismatch versus mobile web. Additional issues may exist and must be
discovered during audit.

## 13. Product / architecture context

Where's Karl architecture: the iOS/Universal app is the main product; web
will later become a lightweight landing/acquisition surface; the main Where's
Karl backend is canonical; clients consume backend data; Redis/Upstash is
internal backend infrastructure only. Do not create client-side parallel
domain logic that conflicts with backend canonical behavior.

## 14. "Small fix" exception is forbidden

There is no special lightweight process for tiny fixes, one-line fixes,
visual nudges, QA corrections, polish, or "just this one thing." Every
implementation/correction/fix must still follow this entire Golden Rule
contract.

---

**These rules are permanent and apply to all future Cursor
implementation/correction/fix work in this repository until the user
explicitly changes them.** Physical-iPhone approval precedes commit/push for
iOS/Universal UI work in every case, including Phase 24 Map work.
<!-- END:golden-rule-contract -->
