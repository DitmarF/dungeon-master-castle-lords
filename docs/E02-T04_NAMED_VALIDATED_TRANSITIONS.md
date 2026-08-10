# Dungeon Master & Castle Lords — E02-T04 Named validated command/transition layer

## Task ID and name

`E02-T04 — Named validated command/transition layer`

## Goal

Move the current real rule-bearing campaign mutations behind a small typed pure transition and application-operation boundary so boards express player intent rather than rewriting arbitrary campaign state.

## Context

- Stable base commit: `2eb7c17a27462286c9336d8440645b68d9a84251`
- Accepted Sites version: `16`
- Current roadmap milestone: `EPIC 02 — Core game engine and state`; E02-T04 is the sole current task
- Relevant decisions: `DMCL-P03`, `DMCL-P04`, `DMCL-P19`–`DMCL-P21`, `DMCL-P24`
- Relevant documents/files: `AGENTS.md`; `docs/ROADMAP.md`; `docs/DECISIONS.md`; `docs/E02-T01_CORE_ENGINE_CONTRACT_AUDIT.md`; `docs/E02-T02_CAMPAIGN_STATE_AND_ENGINE_TESTING.md`; `docs/E02-T03_STABLE_ENTITY_AND_ID_SYSTEM.md`; `docs/GAME_CONCEPT.md`; `docs/ARCHITECTURE.md`; `docs/GAME_STATE.md`; `docs/CONTENT_MODEL.md`; `docs/CURRENT_STATE.md`; `docs/WORKFLOW.md`; `docs/TASK_TEMPLATE.md`; `src/game/campaignState.ts`; `src/game/createGame.ts`; `src/game/generateDungeon.ts`; `src/game/GameProvider.tsx`; `src/game/GameApp.tsx`; `src/boards/registry.ts`; `src/boards/BoardCatalogContext.tsx`; `src/boards/SetupBoard.tsx`; `src/boards/DungeonBoard.tsx`; `src/boards/SettlementBoard.tsx`; `src/ui/BoardNavigation.tsx`; `src/ui/GameShell.tsx`; `tests/engine/`
- Why this task is needed now: setup, movement/discovery/Heart reach, and Settlement claim still use generic whole-campaign mutation from React boards, while legal board navigation is split between an unvalidated provider action and a React-bearing board registry.

## Requirements

- Add named pure transitions for completing Hero Setup, moving the Hero inside the current Dungeon, claiming the Settlement after the existing Dungeon Heart prerequisite, and navigating to an available board.
- Validate transition inputs, current campaign state, legal prerequisites, and board availability; return small typed success/failure results useful to current callers and tests.
- Make Dungeon movement own destination calculation, walkability, resulting position, discovery union, and historical Dungeon Heart reach state.
- Make Settlement claim validate the existing Heart prerequisite and produce both the durable claim and legal transition to Settlement.
- Separate stable six-board identity/descriptors, availability/unlock policy, legal navigation, and fallback selection from React component resolution while preserving EPIC 01 IDs, ordering, labels, icons, enabled states, components, and visible navigation.
- Expose the four named operations through `GameProvider`; playable boards must not use unrestricted whole-campaign mutation for these interactions.
- Preserve application-owned timestamp stamping, active-game/registry mirroring, automatic persistence, and all version-3 campaign meanings.
- Add focused pure tests for valid/invalid Hero Setup, valid/blocked movement, discovery, Heart reach, legal/illegal claim, and legal/illegal navigation; keep these tests in the normal verification gate.
- Present the verified result as Candidate and stop for owner acceptance before checkpointing or beginning E02-T05.

## Constraints

- Keep changes within current setup/dungeon/claim/navigation rules, bounded provider and board integration, focused tests, and responsible architecture/state/content/decision/task documentation.
- Preserve approved mechanics, persisted IDs, save compatibility, catalog behavior, and unrelated user work.
- Do not install/upgrade dependencies, broadly rewrite `GameProvider`, or change infrastructure.
- Do not deploy. Deployment requires a separate explicit user instruction.
- Do not add a generic command framework, command bus, event sourcing, CQRS, global event bus, Saga, Redux, Zustand, ECS, or plugin framework.
- Do not isolate or redesign the application clock or gameplay seed/RNG in this task; their pending placement remains explicit under `DMCL-P24`.

## Non-goals

- Future commands for days, buildings, resources, world conquest, armies, combat, or events.
- New gameplay, balance, hero progression, settlement economy, world, combat, or persistence mechanics.
- Save-schema migration, generator changes, cloud persistence, multiplayer authority, UI redesign, or deployment.
- Unrelated provider, board, content, style, or platform cleanup.

## Acceptance criteria

- [x] Current Hero Setup, Dungeon movement/discovery/Heart reach, Settlement claim, and board navigation have named operation boundaries.
- [x] Boards send intent and no longer implement the authoritative campaign rules for those interactions.
- [x] Invalid setup, movement, claim, and navigation requests are rejected without changing campaign state.
- [x] Settlement claim cannot succeed without the existing Heart prerequisite.
- [x] Dungeon movement remains deterministic and owns destination, walkability, position, discovery, and Heart result.
- [x] Navigation respects registered, enabled, and unlocked availability through a pure non-React policy.
- [x] Application/domain navigation imports no React board implementation and shared UI imports no board implementation/catalog module.
- [x] The six-board EPIC 01 catalog, component resolution, order, IDs, labels, icons, availability behavior, and visible UI remain unchanged.
- [x] Unrestricted `updateGame` is not exposed to playable boards for the migrated interactions.
- [x] Existing version-3 saves require no schema migration and retain their meaning.
- [x] Focused engine tests cover every requested legal and illegal transition and participate in `npm run verify`.
- [x] No future gameplay command or speculative framework is introduced.
- [x] No unapproved gameplay or architecture decision was introduced.
- [x] No unrelated files or behavior changed.

## Verification

### Automated

- `npm run test:engine` — expected: focused campaign, identity, setup, Dungeon, claim, navigation, and dependency-boundary tests pass without a Sites build.
- `npm run verify` — expected: token drift check, lint, focused engine tests, one bounded build/artifact validation, and rendered-HTML test all pass.

### Behavior/manual

- Exercise Hero Setup → Dungeon legal and blocked movement → discovery retention → Dungeon Heart → Settlement claim → legal board navigation → save/reload.
- Confirm an invalid setup request, premature Settlement claim, locked Settlement navigation, and unknown board request leave campaign state unchanged.
- Review the final diff for board-owned duplicate rules, application/shared-UI imports from React board implementations, unintended gameplay changes, schema/migration risk, dependency changes, and unrelated files.

### Environment limitations

- Browser-local existing saves may be unavailable to this execution environment; any unavailable live save/load or interactive browser check will be reported rather than inferred from automated coverage.
- Physical-smartphone testing is not required because no visual or interaction design change is planned; the owner may still repeat the normal campaign flow during acceptance.

## Documentation impact

- Responsible documents to update: `docs/ARCHITECTURE.md`, `docs/GAME_STATE.md`, `docs/CONTENT_MODEL.md`, `docs/DECISIONS.md`, `docs/ROADMAP.md`, and this task record
- Decision changes: no new gameplay decision anticipated; record E02-T04 as implemented under accepted `DMCL-P20`, `DMCL-P21`, and `DMCL-P24`; update stale observed/interim wording where the generic mutation and board dependency are removed
- Roadmap change after acceptance: mark E02-T04 accepted/complete and name exactly one bounded E02-T05 task; do not silently schedule or implement the pending clock/gameplay-seed work
- `CURRENT_STATE.md` audit required: no; it remains the dated baseline audit and will not be rewritten by this bounded implementation task

## Checkpoint

- Configured Sites source branch: `main`
- Commit/push authorized: after explicit owner acceptance under the established workflow
- Expected checkpoint contents: accepted E02-T04 implementation/tests/docs plus acceptance-driven roadmap/task updates
- Deployment authorized: **No**, unless a separate explicit deployment task says otherwise.

## Completion report

### Candidate outcome

- Summary: implemented one pure, typed transition surface for current Hero Setup, Dungeon movement/discovery/Heart reach, Settlement claim, and legal board navigation; wired the existing boards through named provider operations; and split pure board availability from React component resolution without changing campaign schema or gameplay
- Changed files: `docs/ROADMAP.md`; `docs/ARCHITECTURE.md`; `docs/GAME_STATE.md`; `docs/CONTENT_MODEL.md`; `docs/DECISIONS.md`; this task record; `src/game/navigation.ts`; `src/game/transitions.ts`; `src/game/createGame.ts`; `src/game/GameProvider.tsx`; `src/game/GameApp.tsx`; `src/boards/registry.ts`; removed `src/boards/BoardCatalogContext.tsx`; `src/boards/SetupBoard.tsx`; `src/boards/DungeonBoard.tsx`; `src/ui/BoardNavigation.tsx`; `tests/engine/identity.test.ts`; `tests/engine/transitions.test.ts`
- Acceptance evidence: named transitions validate current state and inputs; setup calculation and readiness share one rule source; movement owns destination/walkability/discovery/Heart outcome; premature claim and locked/unknown navigation fail without state replacement; claim records the outcome and legally enters Settlement; the provider/shared navigation no longer import React board modules; all six descriptors retain their established ordered metadata and component bindings; no `updateGame` use remains
- Automated verification: focused `npm run test:engine` passed 20/20; final `npm run verify` passed token synchronization, lint, 20/20 engine tests, the bounded Sites build/artifact validation, and 1/1 rendered-HTML test
- Behavior verification: focused transition fixtures exercise legal setup, invalid point/skill inputs, legal and blocked movement, discovery union, Heart reach, premature/legal claim, locked/unknown/legal navigation, v3 migration retention, and dependency direction. A local preview started successfully, but the in-app browser was denied access before page load because its required admin security policy could not be verified, so the interactive Hero Setup → save/reload flow was unavailable in this environment.
- Documentation/decision updates: the implemented transition, board-policy, timestamp/mirroring, content-rule authority, and removal of the generic board mutation path are recorded in architecture/state/content/decision/roadmap/task sources; no new gameplay decision was made; `CURRENT_STATE.md` remains unchanged because no new repository-wide audit was performed
- Limitations/risks/open approvals: owner acceptance should repeat the requested live campaign flow, especially save/reload, because browser interaction was unavailable here. The provider intentionally still coordinates lifecycle, timestamps, registry mirroring, storage, and theme; setup presentation catalogs remain board-local; clock/gameplay-seed isolation remains unimplemented and unscheduled under DMCL-P24. E02-T05 must not begin until this Candidate is accepted and checkpointed.
- Deployment: **Not performed**

### User acceptance

- Status: awaiting Candidate
- Accepted by/date: pending explicit acceptance

### Accepted checkpoint

- Final commit SHA: pending acceptance
- Pushed source branch: `main` after acceptance
- Saved Sites version: pending acceptance
- Roadmap status: E02-T04 remains active until acceptance and checkpoint completion
- Next task: pending owner acceptance and bounded roadmap definition
- Deployment: **Not performed**
