# Dungeon Master & Castle Lords — E02-T03 Stable entity and ID system

## Task ID and name

`E02-T03 — Stable entity and ID system`

## Goal

Establish one small, explicit identity policy and implementation for the currently persisted player and campaign instances while keeping content-definition IDs, persistent instance IDs, and spatial/derived keys distinct.

## Context

- Stable base commit: `fbfd19372d34e99e902a3b4c29fe26dcb56eff46`
- Accepted Sites version: `15`
- Current roadmap milestone: `EPIC 02 — Core game engine and state`; E02-T03 is the sole current task
- Relevant decisions: `DMCL-P05`, `DMCL-P19`, `DMCL-P20`, `DMCL-P22`; owner-approved E02-T03 identity-source policy in the initiating request
- Relevant documents/files: `AGENTS.md`, `docs/ROADMAP.md`, `docs/DECISIONS.md`, `docs/E02-T01_CORE_ENGINE_CONTRACT_AUDIT.md`, `docs/E02-T02_CAMPAIGN_STATE_AND_ENGINE_TESTING.md`, `docs/ARCHITECTURE.md`, `docs/GAME_STATE.md`, `docs/CONTENT_MODEL.md`, `docs/CURRENT_STATE.md`, `docs/WORKFLOW.md`, `docs/TASK_TEMPLATE.md`, `src/game/campaignState.ts`, `src/game/model.ts`, `src/game/createGame.ts`, `src/game/generateDungeon.ts`, `src/game/storage.ts`, `src/game/GameProvider.tsx`, `src/game/skillTrees.ts`, `src/boards/registry.ts`, `tests/engine/`
- Why this task is needed now: current player/campaign identity generation is an untyped helper whose fallback consumes `Math.random()`, while accepted architecture requires explicit player/campaign ID types and an identity source separate from content and gameplay randomness.

## Requirements

- Document content-definition IDs, persistent player/campaign instance IDs, and spatial/derived keys as distinct identity categories with different ownership and compatibility rules.
- Add explicit `PlayerId` and `CampaignId` string types, the smallest `IdSource` contract, current-prefix creation helpers, and useful runtime narrowing for newly generated identities.
- Preserve the existing `player-…` and `game-…` conventions and every existing persisted ID; do not change the version-3 save or version-1 registry shape.
- Route current player and campaign creation through an injected identity source and provide one system crypto adapter at the application/infrastructure edge.
- Remove identity generation's `Math.random()` fallback so identity creation cannot consume gameplay RNG.
- Keep board/skill/faction/class/vocation IDs as stable content-definition IDs; keep coordinates, cell keys, room ordinals, array indexes, storage keys, and schema versions outside persistent entity identity.
- Add focused engine tests for identity prefixes/types, narrowing, invalid source values, injection at current creation paths, spatial-key distinction, and separation from gameplay RNG/UI/platform dependencies.
- Preserve existing player creation, campaign creation/loading, hero setup, dungeon generation/loading, migration, and visible UI behavior.
- Present the verified result as Candidate and stop for owner acceptance before checkpointing or beginning E02-T04.

## Constraints

- Keep changes within current identity creation/use, focused tests, and responsible architecture/content/state/decision/task documentation.
- Preserve approved mechanics, persisted IDs, save compatibility, and unrelated user work.
- Do not install/upgrade dependencies, refactor, or change infrastructure unless explicitly listed above.
- Do not deploy. Deployment requires a separate explicit user instruction.
- Do not implement identity categories for hero, settlement, region, army, unit, item, or any system without a current persistent instance.
- Do not isolate or redesign the application clock or gameplay seed/RNG in this task; the initiating E02-T03 scope explicitly excludes gameplay RNG.

## Non-goals

- World, army, unit, item, settlement, hero-instance, or generic entity models.
- ECS, generic entity table, database/repository IDs, cloud/global synchronization, authentication identity, or multiplayer authority.
- Gameplay random-source architecture, deterministic campaign-seed injection, clock injection, or generator changes.
- Content namespace aliases/deprecation/versioning beyond preserving current literal IDs and documenting their category.
- UI redesign, save-schema migration, deployment, or E02-T04 implementation.

## Acceptance criteria

- [x] One documented identity policy distinguishes content definitions, player/campaign instances, and spatial/derived keys.
- [x] Explicit current `PlayerId`, `CampaignId`, and `IdSource` contracts exist without a generic entity framework.
- [x] New player and campaign IDs retain the existing lowercase `player-…` and `game-…` conventions.
- [x] Existing persisted IDs and save/registry shapes remain unchanged and loadable.
- [x] Identity creation is injected where currently needed and does not use or advance gameplay RNG.
- [x] No persistent entity uses a UI array position or display label as identity.
- [x] Focused engine tests cover the implemented identity helpers and invariants and participate in `npm run verify`.
- [x] No speculative future identity category or entity subsystem is introduced.
- [x] Existing player/campaign/setup/dungeon behavior remains unchanged.
- [x] No unapproved gameplay or architecture decision was introduced.
- [x] No unrelated files or behavior changed.

## Verification

### Automated

- `npm run test:engine` — expected: campaign-state, migration, determinism, identity-source, prefix/narrowing, and dependency tests pass without a Sites build.
- `npm run verify` — expected: token drift check, lint, focused engine tests, one bounded build/artifact validation, and rendered-HTML test all pass.

### Behavior/manual

- Review current player creation and persisted `player-…` identity, campaign creation/loading and persisted `game-…` identity, hero setup, and dungeon generation/loading.
- Confirm content catalog IDs, React keys for persisted players/content, dungeon coordinates/cell keys, and room ordinals were not migrated or treated as global entity IDs.
- Review the final diff for accidental schema, migration, gameplay-RNG, provider, UI, platform, dependency, lockfile, or future-entity changes.

### Environment limitations

- No UI change is planned; automated build/render verification plus targeted source/runtime regression review is proportionate. Any unavailable browser-local existing save will be reported rather than fabricated.

## Documentation impact

- Responsible documents to update: `docs/ARCHITECTURE.md`, `docs/GAME_STATE.md`, `docs/CONTENT_MODEL.md`, `docs/DECISIONS.md`, and this task record
- Decision changes: record the owner-approved current identity/`IdSource` policy as accepted implementation; do not resolve broader account/cloud/content-version identity questions
- Roadmap change after acceptance: E02-T03's identity portion will be complete, but the previously combined clock/gameplay-seed work is outside this task; present the minimum evidence-based sequencing correction for explicit owner approval before the accepted checkpoint names E02-T04
- `CURRENT_STATE.md` audit required: no; it remains the dated baseline audit and this bounded implementation is recorded in responsible contract/task documents

## Checkpoint

- Configured Sites source branch: `main`
- Commit/push authorized: after explicit owner acceptance under the established workflow
- Expected checkpoint contents: accepted E02-T03 identity implementation/tests/docs plus acceptance-driven roadmap/task updates
- Deployment authorized: **No**, unless a separate explicit deployment task says otherwise.

## Completion report

### Candidate outcome

- Summary: established current player/campaign ID types and injected identity creation, separated content and spatial keys, and removed the identity path's gameplay-RNG fallback without changing persisted schemas or current IDs
- Changed files: `docs/ROADMAP.md`; `docs/ARCHITECTURE.md`; `docs/GAME_STATE.md`; `docs/CONTENT_MODEL.md`; `docs/DECISIONS.md`; this task record; `src/game/identity.ts`; `src/game/systemIdSource.ts`; `src/game/campaignState.ts`; `src/game/model.ts`; `src/game/createGame.ts`; `src/game/generateDungeon.ts`; `src/game/GameProvider.tsx`; `src/game/storage.ts`; `tests/engine/campaign-state.test.ts`; `tests/engine/identity.test.ts`
- Acceptance evidence: only current `PlayerId`/`CampaignId` categories were implemented; new values retain `player-…`/`game-…`; malformed source values are rejected; existing/legacy IDs are retained; `CellKey` is coordinate-derived; content catalogs and room ordinals were not migrated; no generic/future entity model was added
- Automated verification: `npm run test:engine` passed 12/12 directly; final `npm run verify` passed token drift, lint, 12/12 engine tests, the bounded build/artifact validation, and 1/1 rendered-HTML test
- Behavior verification: focused creation/setup/load regression covers player creation, campaign ownership/identity, Hero Setup completion, dungeon seed/result/discovery retention, and version-3 loading; source review confirms persisted players/content use stable IDs as React keys while dungeon grid keys remain coordinate-derived
- Documentation/decision updates: accepted current identity policy recorded as `DMCL-P23` in architecture, state, content, decision, roadmap, and task sources; broader account/cloud/content-version questions remain open; `CURRENT_STATE.md` unchanged because no new repository-wide audit was performed
- Limitations/risks/open approvals: the system adapter intentionally requires `crypto.randomUUID()` instead of falling back to `Math.random()`; clock and gameplay-seed injection remain outside this task. Owner approval is required for the minimum sequence correction: make E02-T04 the remaining clock/deterministic campaign-seed task, then shift the previously approved setup/dungeon/navigation/provider/exit tasks to E02-T05–T09.
- Deployment: **Not performed**

### User acceptance

- Status: awaiting Candidate
- Accepted by/date: pending explicit acceptance

### Accepted checkpoint

- Final commit SHA: pending acceptance
- Pushed source branch: `main` after acceptance
- Saved Sites version: pending acceptance
- Roadmap status: E02-T03 remains active until acceptance and checkpoint completion
- Next task: pending explicit owner approval of the minimum sequence correction
- Deployment: **Not performed**
