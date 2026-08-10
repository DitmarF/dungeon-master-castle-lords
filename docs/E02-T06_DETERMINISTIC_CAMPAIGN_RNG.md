# Dungeon Master & Castle Lords — E02-T06 Deterministic campaign RNG foundation

## Task ID and name

`E02-T06 — Deterministic campaign RNG foundation`

## Goal

Introduce one explicit persisted campaign seed and a small pure deterministic random-source contract so current Dungeon creation is reproducible from explicit inputs, new-campaign entropy stays at the application/infrastructure edge, and existing generated Dungeon snapshots migrate without regeneration or changed progress.

## Context

- Stable base commit: `4259a9eff94999225a90744eace6008a142cc0f0`
- Accepted Sites version: `18`
- Current roadmap milestone: `EPIC 02 — Core game engine and state`; E02-T06 is the sole current task
- Relevant decisions: `DMCL-P03`, `DMCL-P05`–`DMCL-P07`, `DMCL-P19`, `DMCL-P20`, `DMCL-P23`, `DMCL-P24`
- Relevant documents/files: `AGENTS.md`; `docs/ROADMAP.md`; `docs/DECISIONS.md`; `docs/E02-T01_CORE_ENGINE_CONTRACT_AUDIT.md`; `docs/E02-T02_CAMPAIGN_STATE_AND_ENGINE_TESTING.md`; `docs/E02-T03_STABLE_ENTITY_AND_ID_SYSTEM.md`; `docs/E02-T05_SELECTORS_AND_DERIVED_STATE.md`; `docs/ARCHITECTURE.md`; `docs/GAME_STATE.md`; `docs/WORKFLOW.md`; `docs/TASK_TEMPLATE.md`; `src/game/campaignState.ts`; `src/game/createGame.ts`; `src/game/generateDungeon.ts`; `src/game/GameProvider.tsx`; `src/game/storage.ts`; `src/game/identity.ts`; `src/game/systemIdSource.ts`; `tests/engine/`
- Why this task is needed now: the current Dungeon generator is deterministic after seed selection, but it still selects a default seed through `Math.random()` and the campaign has no explicit gameplay-random authority separate from identity entropy.

## Requirements

- Add one pure `CampaignSeed`/deterministic random-source contract and no future-system streams or counters.
- Persist one authoritative `campaignSeed` on `CampaignState`; bump the serialized campaign version from 3 to 4 because this is a structural schema change.
- Require an explicit seed for pure Dungeon generation and preserve the current generator algorithm and resulting layout for the same seed.
- Obtain new-campaign seed entropy through a dedicated application/infrastructure source that is separate from `IdSource` and does not use `Math.random()`.
- Create a new campaign deterministically from its explicit campaign seed, using that same seed for the current initial Dungeon because no second random system exists.
- Migrate supported version-2/version-3 saves by assigning their existing stored Dungeon seed as `campaignSeed` while retaining the stored Dungeon object/result and every Hero/progress fact; never regenerate their Dungeon.
- Normalize version-4 saves through the same existing Hero snapshot path without consuming seed or identity entropy when the current campaign structure is valid.
- Audit and classify every current repository `Math.random()` occurrence; remove the sole gameplay/domain occurrence without mechanically changing unrelated tooling.
- Add focused pure tests for seeded sequences, same-seed Dungeon/campaign creation, identity/RNG separation, migration preservation, explicit-input purity, and forbidden dependencies.
- Present the verified result as Candidate and stop for owner acceptance before checkpointing or beginning E02-T07.

## Constraints

- Keep changes within the campaign seed/schema, current Dungeon random helper, creation/hydration inputs, deliberate migration, focused tests, and responsible architecture/state/decision/task documentation.
- Preserve approved mechanics, Dungeon generation algorithm, persisted IDs, existing Dungeon snapshots and progress, version-1 registry behavior, and unrelated user work.
- Do not install/upgrade dependencies, broadly refactor `GameProvider`, redesign persistence, or change infrastructure beyond the seed-source adapter.
- Do not deploy. Deployment requires a separate explicit user instruction.
- Do not add a global RNG singleton, advanced stream framework, per-system counters, hidden mutable RNG state, or speculative random gameplay commands.

## Non-goals

- Loot, combat, events, AI, diplomacy, weather, World generation, or any other new random mechanic.
- Separate combat/loot/world/event streams, random counters, replay log, multiplayer simulation, or cryptographic gameplay guarantees.
- Replacing or rebalancing the Dungeon generator, reconstructing old maps, or adding a generator-version policy.
- Clock isolation, generic application ports, cloud persistence, UI redesign, dependency changes, E02-T07 implementation, or deployment.

## Acceptance criteria

- [x] Campaign randomness has one explicit authoritative persisted seed and a small pure deterministic contract.
- [x] New campaign creation obtains seed entropy through a dedicated application/infrastructure source separate from identity.
- [x] The same explicit seed reproduces the same current Dungeon and new-campaign gameplay state.
- [x] Pure Dungeon generation has no implicit `Math.random()` fallback.
- [x] Existing v2/v3 campaigns migrate to version 4 without regenerating or changing Dungeon layout, Hero position, discovery, Heart state, or settlement claim.
- [x] Identity creation neither imports nor advances gameplay RNG state.
- [x] Current gameplay/domain code contains no scattered uncontrolled `Math.random()` use.
- [x] RNG/domain code is pure, testable, and independent from React, boards, browser storage, and Sites/Cloudflare modules.
- [x] No speculative future random streams, counters, systems, or gameplay were introduced.
- [x] Existing campaign creation, setup, exploration, claim, navigation, and save/load behavior remain unchanged in the verified engine and build paths.
- [x] No unapproved gameplay or architecture decision was introduced.
- [x] No unrelated files or behavior changed.

## Verification

### Automated

- `npm run test:engine` — expected: focused campaign, migration, RNG, identity, selector, and transition tests pass without a Sites build.
- `npm run verify` — expected: token drift check, lint, focused engine tests, one bounded Sites build/artifact validation, and rendered-HTML test all pass.

### Behavior/manual

- Load an existing campaign and confirm identical stored Dungeon grid/rooms/tiles/start/Heart, Hero position, discovered cells, Heart-reached state, and settlement-claim state after migration.
- Create a new campaign and confirm it receives a valid campaign seed, the current Dungeon is playable, and save/reload retains the seed and generated snapshot.
- Review every `Math.random()` result in current source and classify gameplay/domain versus unrelated tooling/documentation uses.
- Review the diff for accidental generator changes, snapshot regeneration, ID/RNG coupling, speculative streams, clock work, UI changes, dependencies, and unrelated files.

### Environment limitations

- Browser-local existing saves may be unavailable to this execution environment; any unavailable interactive load/new-campaign check will be reported rather than inferred from pure migration and creation fixtures.
- Physical-smartphone testing is not required because no visual or interaction redesign is planned.

## Documentation impact

- Responsible documents to update: `docs/ARCHITECTURE.md`, `docs/GAME_STATE.md`, `docs/DECISIONS.md`, `docs/ROADMAP.md`, and this task record
- Decision changes: record the owner-requested one-seed version-4 migration policy as accepted implementation; retain generator-version, future stream, clock, cloud, and multiplayer questions as unresolved
- Roadmap change after acceptance: mark E02-T06 accepted/complete and name exactly one bounded E02-T07 task; do not begin it in this task
- `CURRENT_STATE.md` audit required: no; it remains the dated baseline audit and will not be rewritten by this bounded implementation task

## Checkpoint

- Configured Sites source branch: `main`
- Commit/push authorized: after explicit owner acceptance under the established workflow
- Expected checkpoint contents: accepted E02-T06 implementation/tests/docs plus acceptance-driven roadmap/task updates
- Deployment authorized: **No**, unless a separate explicit deployment task says otherwise.

## Completion report

### Candidate outcome

- Summary: version-4 campaigns now persist one validated `campaignSeed`; new campaigns obtain it from a dedicated system-entropy adapter, while pure Dungeon generation and deterministic random sequences require explicit seeds.
- Changed files: `src/game/random.ts`; `src/game/systemCampaignSeedSource.ts`; `src/game/campaignState.ts`; `src/game/model.ts`; `src/game/generateDungeon.ts`; `src/game/createGame.ts`; `src/game/GameProvider.tsx`; `src/game/storage.ts`; `tests/engine/random.test.ts`; `tests/engine/campaign-state.test.ts`; `tests/engine/identity.test.ts`; `tests/engine/transitions.test.ts`; `docs/ARCHITECTURE.md`; `docs/GAME_STATE.md`; `docs/DECISIONS.md`; `docs/ROADMAP.md`; this task record.
- Acceptance evidence: same-seed sequence and campaign creation are deterministic; a fixed Dungeon golden fixture confirms the existing generator result; identity and gameplay seed sources are independent; version-2/version-3 migration retains the entire stored Dungeon and all tested progress facts without consuming fallback entropy; source-boundary tests prohibit current `Math.random()` and forbidden engine imports.
- Automated verification: `npm run test:engine` passed 38/38; `npm run verify` passed token drift, lint with no warning, the same 38 engine tests, bounded Sites production build and artifact validation, and rendered-HTML test 1/1; `git diff --check` passed.
- Behavior verification: explicit new-campaign construction produces a valid seed and playable stored Dungeon; supported legacy fixtures preserve Dungeon layout, rooms, tiles, start, Heart, Hero position, discovery, Heart state, settlement claim, and save identity. An interactive local-browser attempt was blocked before navigation because the admin-enforced browser security policy could not be verified, so browser-local existing-save and click-flow checks remain for owner verification.
- Documentation/decision updates: `DMCL-P25` records the accepted one-seed/version-4 policy; architecture and state documents define system entropy versus pure gameplay randomness and the no-regeneration migration; roadmap links this bounded task while E02-T06 remains the active Candidate.
- Limitations/risks/open approvals: no current named transition consumes random values, so no artificial random command was added; the deterministic contract will be extended only when a real mechanic requires RNG state/streams. Owner acceptance and interactive create/load regression confirmation are required before checkpointing or beginning E02-T07.
- Deployment: **Not performed**

### User acceptance

- Status: **Accepted**
- Accepted by/date: project owner, 2026-08-10
- Owner-reported verification: all requested tests, verifications, existing-save migration checks, and new-campaign behavior passed; the implementation works as intended

### Accepted checkpoint

- Final commit SHA: recorded in the checkpoint handoff after the acceptance metadata commit
- Pushed source branch: `main`
- Saved Sites version: recorded in the checkpoint handoff
- Roadmap status: E02-T06 accepted/complete; EPIC 02 remains current
- Next task: `E02-T07 — Developer/debug state inspector`
- Deployment: **Not performed**
