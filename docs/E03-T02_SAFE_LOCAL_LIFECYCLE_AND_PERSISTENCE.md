# Dungeon Master & Castle Lords — E03-T02 Safe local lifecycle and persistence behavior

Status: **Complete**

## Task ID and name

`E03-T02 — Safe local lifecycle and persistence behavior`

## Goal

Implement the accepted E03-T01 browser-local lifecycle and persistence contract so campaigns fail honestly and recoverably without changing gameplay rules or the version-4 campaign schema.

## Context

- Stable base commit: `bb5d5561927472af01d226d5cbcc1e2d319b2be0`
- Accepted Sites checkpoint: version 22
- Current roadmap milestone: EPIC 03 Current; E03-T02 sole Next task
- Accepted dependencies: DMCL-P27–DMCL-P32; related timestamp, storage, recovery, and source-preservation contract in the accepted E03-T01 audit
- Current campaign/container at task start: `CampaignState` version 4 inside `GameRegistry` version 1 at `dmcl.prototype.registry.v1`
- Primary implementation areas: `GameProvider`, creation/lifecycle helpers, persistence decoder/orchestrator, browser storage adapter, Start/GameShell feedback, and focused pure tests

E03-T01 is Complete and no required E03-T02 persistence decision remains unresolved. DMCL-P31 keeps registry version 2 conditional; this task therefore hardens the current version-1 container/key and does not activate a container or campaign-schema cutover.

## Requirements

- Inject one small application `Clock`; remove ad-hoc lifecycle wall-clock construction from profile/campaign creation and provider actions.
- Keep `createdAt` immutable, update `updatedAt` only for campaign truth/stored resume-context changes, and update profile `lastPlayedAt` only for successful New/Continue entry.
- Make manual Save an immediate serialized write plus exact readback verification with honest success/failure feedback and no timestamp mutation.
- Distinguish empty storage, unavailable/read failure, parse failure, registry validation, campaign validation, migration failure, serialization failure, quota/write failure, and verification failure.
- Stage hydration without any automatic write; failed read/decode/validation/migration must leave the original payload unchanged.
- Keep later non-destructive write failures playable in memory but visibly unsaved and retryable.
- Keep one campaign per local profile; replacement and profile deletion remain confirmed UI actions and must not change in-memory/durable state unless verified persistence succeeds.
- Keep browser APIs in the platform adapter and cover the application behavior through a pure in-memory adapter.

## Constraints

- Preserve Domain/model/rules → Application/state → UI → platform/storage adapter dependency direction.
- Keep the existing repository stack, current game provider, version-4 gameplay state, and current rules.
- Add no state-management, repository, event, database, cloud, authentication, or persistence framework.
- Add no dependency, hosting, Worker, or deployment change.

## Non-goals

- No campaign version-5 cutover or registry version-2 activation.
- No World generation, Village implementation, content catalogs, Castle-only Setup, or Dungeon migration redesign.
- No economy, Roads, units, Combat, cloud/authentication, database, or deployment.
- No ROADMAP checkpoint update, commit/push, or Sites version before owner acceptance.

## Acceptance criteria

- [x] One injected application clock owns lifecycle time.
- [x] New/Continue, return, manual Save, navigation, and campaign changes follow the accepted timestamp semantics.
- [x] Manual Save reports success only after exact write/readback verification.
- [x] Typed outcomes distinguish every required read/decode/migration/write failure class without raw player-facing exceptions.
- [x] Legitimate empty storage is not confused with failed hydration.
- [x] Failed hydration/migration performs no write and retains the original source payload.
- [x] Failed later writes keep non-destructive campaign changes in memory and surface an unsaved/retry path.
- [x] Confirmed replacement/deletion retains the previous registry on write/quota/verification failure.
- [x] One campaign per profile remains enforced with no extra slots.
- [x] Pure in-memory adapter tests cover success, failure, timestamp, and cardinality behavior.
- [x] Campaign version remains 4 and gameplay rules are unchanged.

## Verification

### Automated

- `npm run test:engine` — PASS, 54/54 focused engine/lifecycle/persistence tests.
- `npm run verify` — PASS: token synchronization, ESLint, 54/54 engine tests, bounded production build, Sites artifact validation, and 1/1 rendered-HTML test.
- `git diff --check` — PASS.

### Behavior/manual

- Local browser — PASS: created a profile and new Castle campaign, completed current Hero Setup, received `Campaign saved` only after the manual verified write, returned to player selection, continued successfully, navigated to World, reloaded, and confirmed the stored World resume board reopened.
- Replacement/deletion safeguards — PASS: an existing campaign requires the explicit `Begin a new campaign?` confirmation; profile deletion requires the explicit permanent-deletion dialog; canceling either leaves Continue and the existing campaign available. Pure adapter tests exercise successful and failed destructive commits.
- Persistence-failure behavior — PASS in the pure in-memory adapter for unavailable/read, parse, registry, campaign, migration, serialization, ordinary write, quota-like, and verification failures, including source retention and retryable in-memory state. The repository has no browser-facing failure-injection control, so no test-only runtime switch was added.
- Browser console — no lifecycle/persistence runtime exception observed. The existing development-only theme hydration warning remains and is outside this task's unchanged theme code.
- Physical-smartphone testing remains owner responsibility; no visual redesign is introduced.

## Documentation impact

- Updated responsible contracts: `docs/GAME_STATE.md`, `docs/ARCHITECTURE.md`, and this task record.
- Decision changes: none; E03-T02 implements already accepted DMCL-P27–DMCL-P32 and does not accept a new decision.
- `CURRENT_STATE.md` audit required: no; no explicitly scoped new repository-wide audit is part of this task.
- `ROADMAP.md`: updated at the accepted checkpoint to mark E03-T02 Complete and make E03-T03 the sole Next task.

## Checkpoint

- Configured source branch: `main`
- Commit/push: accepted implementation and checkpoint reconciliation pushed to `main` under `WORKFLOW.md`
- Checkpoint contents: accepted E03-T02 implementation, tests, responsible docs, and acceptance-driven roadmap/task status update
- Deployment authorized: **No**

## Completion report

### Candidate outcome

- Summary: the current version-1 local registry now hydrates through staged typed outcomes and persists through explicit serialized write/readback verification. An injected clock separates campaign creation/modification time from profile activity; destructive lifecycle actions are durable before they alter runtime state; non-destructive autosave failures remain playable, visible, and retryable.
- Changed files:
  - application/model: `src/game/clock.ts`, `src/game/lifecycle.ts`, `src/game/persistence.ts`, `src/game/storage.ts`, `src/game/createGame.ts`, `src/game/GameProvider.tsx`, and `src/game/GameApp.tsx`;
  - UI/feedback: `src/boards/StartBoard.tsx`, `src/ui/GameShell.tsx`, `src/ui/NotificationRegion.tsx`, and `app/globals.css`;
  - verification: `tests/engine/persistence.test.ts` plus explicit-time updates in the campaign-state, identity, and random tests;
  - responsible documentation: `docs/GAME_STATE.md`, `docs/ARCHITECTURE.md`, and this task record.
- Acceptance evidence: pure lifecycle/persistence tests plus local browser behavior matrix.
- Automated verification: `npm run verify` PASS.
- Behavior verification: local New/Continue, verified Save success, return, navigation/reload resume, and replacement/deletion confirmation checks PASS; failure branches PASS through the pure adapter because the app has no browser-facing failure injector.
- Known limitations: browser-local only; registry remains version 1; no export/import or corrupt-payload reset is added; exact rollback after a failed verification is best-effort within `localStorage`; physical-device acceptance remains with the owner. The pre-existing development theme hydration warning is unchanged.
- Gameplay/schema migration pulled forward: **No**.
- Deployment: **Not performed**.

### User acceptance

- Status: accepted by the project owner on 2026-08-14; all points and tests approved, with independent GitHub verification reported PASS.
- Accepted by/date: project owner, 2026-08-14.

### Accepted checkpoint

- Final commit SHA: reported in the completion handoff to avoid a self-referential documentation commit.
- Pushed source branch: `main`.
- Saved Sites version: matching non-deployed version reported in the completion handoff.
- Roadmap status: E03-T02 Complete; E03-T03 is the sole Next task.
- Deployment: **Not performed**.
