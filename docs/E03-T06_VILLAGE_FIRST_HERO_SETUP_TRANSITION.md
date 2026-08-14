# Dungeon Master & Castle Lords — E03-T06 Village-first Hero Setup transition

Status: **Complete**

## Task ID and name

`E03-T06 — Village-first Hero Setup transition`

## Goal

Replace the old Dungeon-first Setup completion with one atomic Castle/Village-first version-5 campaign opening that establishes the accepted playable foundation exactly once and resumes on Settlement.

## Context

- Stable base commit: `e0ec50f938bb72e068847532262f774181b2d0ce`
- Accepted Sites checkpoint: version 26
- Current roadmap milestone: EPIC 03 Current; E03-T06 sole Next task
- Relevant accepted decisions: DMCL-P27–DMCL-P41
- Relevant contracts: `GAME_CONCEPT.md`, `GAME_STATE.md`, `ARCHITECTURE.md`, accepted E03-T01, and completed E03-T02–T05 records
- Completed dependency: E03-T05 Complete with its matching pushed source and non-deployed Sites checkpoint

The version-5 target and strict legacy migration are accepted pure capabilities. This task switches the ordinary new-campaign/application boundary to that model, activates the approved safe registry-version-2 key because the persisted cutover now requires it, and keeps the original version-1 payload untouched.

The former Dungeon-first waking/conquest opening remains a possible later tutorial concept only. It is not ordinary MVP Setup behavior and gains no new runtime or schema in this task.

## Requirements

- Make Castle implicit for ordinary new-MVP Setup and preserve the stable Dungeon identity only for compatibility/future content.
- Preserve the accepted temporary Level-1 Class, Vocation, two-point allocation, root grants, legal bonus skill, and `v4-path-bonus-1` attribute snapshot.
- Validate first, then atomically create exactly one Hero, Castle authority, Tier-1 capital Village, home region, six controlled neighbors, approved sites/locations, regional Dungeon snapshot, strategic home position, null exploration context, and Settlement resume board.
- Reject invalid or repeated completion without changing campaign state or duplicating any foundation element.
- Make Hero, Settlement, and World available; require a valid regional exploration context for Dungeon; keep Combat and Diplomacy unavailable.
- Retire the Dungeon Heart claim as a capital-creation or Settlement-availability authority.
- Persist successful Setup through the verified local lifecycle and keep a later write failure visible, recoverable, and unsaved rather than falsely durable.
- Prefer verified registry version 2 at `dmcl.prototype.registry.v2` after successful legacy decode/migration while retaining the original version-1 payload untouched.

## Constraints

- Keep Domain/model/rules → Application/state → Boards/UI → platform/storage adapter direction.
- Preserve deterministic World and legacy Dungeon sequences, stable IDs, accepted timestamps, one campaign per profile, and source-payload recovery.
- Add no dependency, state framework, database, cloud/authentication, hosting change, or deployment.
- Do not start E03-T07 before owner acceptance and checkpoint completion.

## Non-goals

- No Roads, production, stockpile, strategic Day, projects, recruitment, units, Combat, Gambits, faction evolution, or EPIC 06 progression.
- No Dungeon reward/consequence redesign or implementation of the deferred Dungeon-first tutorial campaign.
- No opening-board visual/content redesign beyond the wiring and honest minimum copy needed for this transition; E03-T07 owns full opening presentation.
- No cloud save, database, deployment, or save version beyond campaign 5/registry 2.

## Acceptance criteria

- [x] Valid Setup creates one complete Castle/Village foundation and enters Settlement.
- [x] Invalid and repeated Setup leave the source unchanged and cannot duplicate the capital, regions, sites, locations, or Dungeon.
- [x] The exact accepted temporary Level-1 grants and compatibility attributes are preserved.
- [x] The opening contains exactly one Village and seven controlled regions with deterministic identity/content.
- [x] Hero, Settlement, and World are available; Dungeon is context-gated; Combat and Diplomacy are unavailable.
- [x] The capital exists independently of legacy `settlementClaimed`, and no Heart claim can create or unlock it.
- [x] Successful Setup saves and reloads as version 5; failed persistence remains visible and retryable.
- [x] A verified version-2 registry is preferred while the original version-1 source remains untouched.
- [x] No excluded gameplay/schema slice or deployment is introduced.

## Verification

### Automated

- `npm run test:engine` — PASS, 98/98 focused transition/navigation/persistence/migration tests.
- `npm run verify` — PASS: token, lint, 98/98 engine tests, build/artifact, and rendered-HTML gates.
- `git diff --check` — PASS.

### Behavior/manual

- Rendered new-campaign Setup through successful Settlement entry, immediate Hero/World navigation, return/Continue, and reload/resume.
- Portrait viewport plus keyboard and touch/pointer completion paths.
- Context-gated/disabled navigation and honest persistence feedback.

### Environment limitations

- Physical smartphone acceptance remains the project owner’s responsibility.

## Documentation impact

- Responsible documents to update: `docs/GAME_STATE.md`, `docs/ARCHITECTURE.md`, and this task record.
- Decision changes: none; this task implements already Accepted DMCL-P27–DMCL-P41.
- `CURRENT_STATE.md` audit required: no; no repository-wide audit is in scope.
- `ROADMAP.md`: unchanged while Candidate; update only after owner acceptance.

## Checkpoint

- Configured source branch: `main`
- Commit/push: accepted implementation and checkpoint reconciliation pushed to `main` under `WORKFLOW.md`
- Expected checkpoint contents: accepted E03-T06 transition/persistence integration, focused tests, responsible docs, and acceptance-driven roadmap update
- Deployment authorized: **No**

## Completion report

Candidate implementation now moves ordinary campaign creation, Setup, application state, navigation, inspector, and verified local persistence to version 5/registry version 2. Focused pure coverage verifies atomicity, deterministic identity, exact temporary Hero grants, migration/source preservation, board availability, retired Heart claim, and successful/failed persistence behavior.

The rendered behavior pass covers the portrait layout, pointer completion, keyboard text input and native focusable-control semantics, successful Settlement entry, immediate Hero/World navigation, return/Continue, reload/resume, disabled future boards, and manual Save feedback. The browser controller did not synthesize the native default click for Enter on a focused button, so an end-to-end keyboard-only activation remains an explicit manual owner check rather than a claimed automated PASS. Full command results and screenshots were recorded in the owner-review Candidate report. No deployment was performed.

### User acceptance

- Status: accepted by the project owner; all points and tests approved, with independent GitHub verification reported PASS
- Accepted by/date: project owner, 2026-08-14

### Accepted checkpoint

- Final commit SHA: reported in the completion handoff to avoid a self-referential documentation commit
- Pushed source branch: `main`
- Saved Sites version: matching non-deployed version reported in the completion handoff
- Roadmap status: E03-T06 Complete; E03-T07 is the sole Next task
- Next task: `E03-T07 — Opening boards, summaries, and inspection`
- Deployment: **Not performed**
