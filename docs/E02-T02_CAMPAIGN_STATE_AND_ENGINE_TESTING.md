# Dungeon Master & Castle Lords — E02-T02 CampaignState and pure engine testing

## Task ID and name

`E02-T02 — Establish CampaignState and pure engine testing`

## Goal

Establish `CampaignState` as the one authoritative pure campaign contract while preserving the exact version-3 serialized shape, and add dependency-free focused engine tests that run without React, browser storage, or a full Sites build.

## Context

- Stable base commit: `79f4b797bdcf0ebd9595593384c8c4849f9d1b0c`
- Accepted Sites version: `14`
- Current roadmap milestone: `EPIC 02 — Core game engine and state`; E02-T02 is the sole next task
- Relevant decisions: `DMCL-P19`, `DMCL-P20`, `DMCL-P22`; `DMCL-P21` remains accepted for E02-T06 and is not implemented here
- Relevant documents/files: `AGENTS.md`, `docs/ROADMAP.md`, `docs/DECISIONS.md`, `docs/E02-T01_CORE_ENGINE_CONTRACT_AUDIT.md`, `docs/ARCHITECTURE.md`, `docs/GAME_STATE.md`, `docs/WORKFLOW.md`, `docs/TASK_TEMPLATE.md`, `src/game/model.ts`, `src/game/createGame.ts`, `src/game/generateDungeon.ts`, `src/game/storage.ts`, `src/game/GameProvider.tsx`, `package.json`, `tsconfig.json`
- Why this task is needed now: E02-T01 established and the owner accepted the campaign boundary and test mechanism; subsequent engine extractions need a pure named state contract and a fast rule-level verification path.

## Requirements

- Define pure `CampaignState` and current campaign value types independently from React, browser storage, Sites/Cloudflare modules, player profiles, registry/runtime coordination, theme/hydration, and board-local presentation state.
- Retain `GameSave` as a type-compatible version-3 serialized alias and preserve every current field, value meaning, and runtime JSON shape without a schema migration.
- Keep `PlayerProfile`, `GameRegistry`, `RuntimeState`, application view, and empty registry state outside the campaign module.
- Add focused `node:test` coverage for the v3 boundary, existing v2/v3 migration/normalization behavior, explicit-seed dungeon determinism, and pure-module dependency constraints.
- Add a standalone `npm run test:engine` command using the supported Node runtime and include it in `npm run verify` without adding a dependency.
- Preserve existing visible campaign creation, setup, exploration, claim, navigation, persistence, theme, and board behavior.
- Present the verified implementation as a Candidate and stop for owner acceptance before checkpointing or beginning E02-T03.

## Constraints

- Keep changes within the campaign/model boundary, immediately required import/config/test wiring, focused engine tests, and responsible architecture/state/repository documentation.
- Preserve approved mechanics, persisted IDs, save compatibility, and unrelated user work.
- Do not install/upgrade dependencies, refactor, or change infrastructure unless explicitly listed above.
- Do not deploy. Deployment requires a separate explicit user instruction.
- Do not broadly rewrite `GameProvider`, extract later task transitions/navigation policy, or change hidden clock/identity/random inputs assigned to E02-T03.

## Non-goals

- Commands, transitions, selectors, or schema slices for future hero, calendar, settlement economy, world, armies, combat, events, or other later mechanics.
- E02-T03 clock/identity/RNG injection, E02-T04 setup extraction, E02-T05 dungeon transition extraction, E02-T06 board-policy separation, or E02-T07 provider operation integration.
- Persistence lifecycle redesign, cloud storage, multiple campaigns, multiplayer authority, state-management framework adoption, UI redesign, or deployment.

## Acceptance criteria

- [x] One pure authoritative `CampaignState` contract contains exactly the current version-3 campaign fields.
- [x] `GameSave` remains a compatibility alias and existing v3 campaigns require no schema migration or data rewrite.
- [x] Player/profile registry, application/session, theme/hydration, and board-local UI state remain outside `CampaignState`.
- [x] No speculative future gameplay slices are added.
- [x] Pure engine modules used by focused tests import no React, browser storage, localStorage, Sites, or Cloudflare code.
- [x] Focused state/migration/determinism tests run independently through `npm run test:engine` and participate in `npm run verify`.
- [x] Existing campaign facts are preserved through the exercised v2/v3 migration fixtures.
- [ ] The requested live create/load/setup/movement/claim/save/reload browser flow remains unavailable because the browser's enforced localhost security check could not be verified.
- [x] No unapproved gameplay or architecture decision was introduced.
- [x] No unrelated files or behavior changed.

## Verification

### Automated

- `npm run test:engine` — expected: focused pure state, migration, deterministic generation, and dependency-boundary tests pass without a Sites build.
- `npm run verify` — expected: token drift check, lint, focused engine tests, one bounded build/artifact validation, and rendered-HTML test all pass.

### Behavior/manual

- Create and load a local player/campaign; load an existing stored campaign if one is available.
- Complete Hero Setup, enter Dungeon, move the hero, retain discovery, reach and claim the Dungeon Heart, enter Settlement, save, reload, and confirm the campaign facts remain intact.
- Review the final diff for accidental schema, dependency, platform, UI, gameplay, lockfile, or generated-artifact changes.

### Environment limitations

- Physical-smartphone testing is not required because there is no UI change; any unavailable pre-existing local save will be reported rather than fabricated.

## Documentation impact

- Responsible documents to update: `AGENTS.md`, `docs/ARCHITECTURE.md`, `docs/GAME_STATE.md`, `docs/WORKFLOW.md`, and this task record
- Decision changes: none; E02-T02 implements accepted `DMCL-P19`, `DMCL-P20`, and the first step of `DMCL-P22`
- Roadmap change after acceptance: mark E02-T02 accepted/complete and name `E02-T03 — Isolate clock, identity, and deterministic campaign creation inputs` as the sole next task
- `CURRENT_STATE.md` audit required: no; this task records its bounded implementation in the responsible contract/task documents and does not perform a new repository-wide evidence audit

## Checkpoint

- Configured Sites source branch: `main`
- Commit/push authorized: after explicit owner acceptance under the established workflow
- Expected checkpoint contents: accepted E02-T02 implementation/tests/docs plus acceptance-driven roadmap/task updates
- Deployment authorized: **No**, unless a separate explicit deployment task says otherwise.

## Completion report

### Candidate outcome

- Summary: established the pure `CampaignState`/v3 `GameSave` alias boundary and a dependency-free Node engine-test path without changing serialized state or application behavior
- Changed files: `AGENTS.md`; `docs/ARCHITECTURE.md`; `docs/GAME_STATE.md`; `docs/WORKFLOW.md`; this task record; `src/game/campaignState.ts`; `src/game/model.ts`; `src/game/createGame.ts`; `src/game/generateDungeon.ts`; `tests/engine/campaign-state.test.ts`; `package.json`; `tsconfig.json`
- Acceptance evidence: the campaign module contains only current v3 fields; profile/registry/runtime remain in the compatibility model module; tests prove the alias boundary, v2/v3 normalization and fact retention, explicit-seed determinism, and forbidden-dependency absence; no future schema or provider rewrite was introduced
- Automated verification: `npm run test:engine` passed 5/5; `npm run lint` passed; the required `npm run verify` passed after rerunning outside the workspace sandbox so Vite could write its temporary config, including 5/5 engine tests, artifact validation, and 1/1 rendered-HTML test
- Behavior verification: build/render verification passed and migration fixtures retain identity, timestamps, active board, hero position/vision, dungeon snapshot/counters/discovery, heart outcome, settlement claim, and skill normalization; live browser flow was not run because the browser's enforced localhost security check was unavailable
- Documentation/decision updates: implemented boundary/test responsibilities recorded in architecture/state/workflow/repository guidance; no decision statuses changed; `ROADMAP.md` and `CURRENT_STATE.md` remain unchanged until acceptance/a separately scoped audit respectively
- Limitations/risks/open approvals: hidden creation clock/ID/RNG inputs remain for E02-T03; current rule-bearing setup/dungeon/navigation/provider paths remain for E02-T04–T07; live manual browser regression remains unverified in this environment
- Deployment: **Not performed**

### User acceptance

- Status: awaiting Candidate
- Accepted by/date: pending explicit acceptance

### Accepted checkpoint

- Final commit SHA: pending acceptance
- Pushed source branch: `main` after acceptance
- Saved Sites version: pending acceptance
- Roadmap status: E02-T02 remains Next until acceptance
- Next task: `E02-T03 — Isolate clock, identity, and deterministic campaign creation inputs` after accepted checkpoint only
- Deployment: **Not performed**
