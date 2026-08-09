# E01-T04 — Typed board-module catalog and board router

Status: **Candidate — awaiting project-owner acceptance**
Implementation date: 2026-08-09

## Task ID and name

`E01-T04 — Typed board-module catalog and board router`

## Goal

Replace duplicated board metadata, component resolution, and campaign availability knowledge with one typed authoritative catalog used by both in-shell navigation and active-board rendering, while preserving stable board IDs, Settlement unlock behavior, gameplay, and save compatibility.

## Context

- Stable base commit: `a77bad4d2402935ff1fce97cf9e004aa8cbee105` on `main`, matching GitHub and the configured Sites source branch
- Accepted Sites version: `9` (`appgprj_6a762ab98b2c819181682817b758d7f8~appgver_60b49d3fa7e88191a419d2cfef17a378`), saved from the stable base without deployment
- Current roadmap milestone: EPIC 01 — UI shell and board architecture, Current; E01-T04 is the exact next task
- Relevant decisions: DMCL-P01, DMCL-P02, DMCL-P03, DMCL-P04, DMCL-P05, DMCL-I06
- Relevant documents/files: `AGENTS.md`, `docs/ROADMAP.md`, `docs/DECISIONS.md`, `docs/ARCHITECTURE.md`, `docs/GAME_STATE.md`, `docs/WORKFLOW.md`, `docs/TASK_TEMPLATE.md`, `src/boards/registry.ts`, `src/game/GameApp.tsx`, `src/game/GameProvider.tsx`, `src/game/model.ts`, `src/ui/GameShell.tsx`, `src/ui/BoardNavigation.tsx`, `src/boards/DungeonBoard.tsx`, and `src/boards/SettlementBoard.tsx`
- Why this task is needed now: the existing registry centralizes only partial navigation metadata while `GameApp` owns a second hard-coded board resolver and `BoardNavigation` owns the Settlement unlock rule.

## Requirements

- Convert the partial registry into one typed catalog containing stable ID, navigation metadata, component resolution, enabled state, and campaign unlock rule.
- Register only the implemented Dungeon and Settlement boards; preserve legacy stable board IDs without presenting unimplemented boards as registered modules.
- Keep registered, enabled, unlocked, and active as separately observable board states.
- Resolve active implemented boards and navigation entries from the same catalog, with a safe available-board fallback for unregistered, disabled, or locked active IDs.
- Preserve the current Settlement claim requirement and existing persisted IDs/save schema.
- Replace shell-level arbitrary game-state mutation for ordinary board switching with a named application-facing `navigateToBoard` operation.
- End at Candidate for user approval without saving a Sites version or deploying.

## Constraints

- Keep changes within the board catalog/router boundary, the focused navigation layout rules, and responsible task/architecture documentation.
- Preserve approved mechanics, persisted IDs, save compatibility, and unrelated user work.
- Do not install/upgrade dependencies, refactor, or change infrastructure unless explicitly listed above.
- Do not deploy. Deployment requires a separate explicit user instruction.
- Do not change the atomic Dungeon Heart claim transition merely to remove its existing generic game update; that gameplay transition both unlocks and enters Settlement.

## Non-goals

- Hero, World, Combat, Diplomacy, or other scaffold board modules.
- Browser URL routing, per-board pages, deep links, lazy loading, plugins, micro-frontends, or dynamic external boards.
- Gameplay, visual redesign, broad `GameProvider` refactoring, save-schema changes, or E01-T05 work.

## Acceptance criteria

- [x] Dungeon and Settlement metadata, component resolution, enabled state, and unlock rules live in one typed catalog.
- [x] `GameApp` has no Dungeon-versus-Settlement conditional rendering.
- [x] `BoardNavigation` consumes the same catalog used for rendering.
- [x] Registered, enabled, unlocked, and active remain independently represented.
- [x] Settlement remains locked until its existing campaign flag is set.
- [x] Unknown, unregistered, disabled, or locked active boards safely resolve to an available board.
- [x] Existing stable board IDs and save schema remain unchanged.
- [x] Ordinary shell and Settlement-return navigation use the named navigation operation.
- [x] Adding a simple implemented board requires one catalog entry rather than parallel router/navigation edits.
- [x] No unapproved gameplay or architecture decision was introduced.
- [x] No unrelated files or behavior changed.

## Verification

### Automated

- `npm run tokens:check` — expected: synchronized token artifacts.
- `npm run lint` — expected: pass in a supported installed environment.
- `npm test` — expected: pass in a supported installed environment with GNU `timeout`.
- Focused static catalog/router checks and `git diff --check` — expected: one catalog consumer path, no board-specific `GameApp` condition, safe fallback, and clean diff.

### Behavior/manual

- Open Dungeon, claim Settlement through the existing path, and navigate Dungeon ↔ Settlement.
- Verify Settlement is locked before claim and active navigation follows the displayed board.
- Verify an invalid, unregistered, disabled, or locked active board falls back without corrupting a real save.
- Verify both board shells and two-item navigation remain usable in a representative portrait mobile viewport.

### Environment limitations

- `node_modules` is absent and dependency installation was not authorized. `npm run lint` reached and passed `tokens:check`, then was unavailable because `eslint` was not installed (exit 127).
- `npm test` reached and passed `tokens:check`, then the build helper reported that GNU `timeout` is unavailable (exit 69). The build and rendered-HTML test did not run.
- The local application could not be started without installed dependencies, so the requested browser/manual navigation, unlock, fallback, and portrait checks were not run.

## Documentation impact

- Responsible documents to update: `docs/ARCHITECTURE.md` and this task record
- Decision changes: none; E01-T04 implements already accepted DMCL-P01/P02/P04/P05 boundaries
- Roadmap change after acceptance: mark E01-T04 accepted through the checkpoint workflow and identify E01-T05 only after explicit acceptance
- `CURRENT_STATE.md` audit required: no

## Checkpoint

- Configured Sites source branch: `main`
- Commit/push authorized: no; await explicit Candidate acceptance
- Expected checkpoint contents: typed board catalog/router, named navigation boundary, focused responsive navigation adjustment, verification evidence, documentation, and later acceptance administration
- Deployment authorized: **No**

## Completion report

### Candidate outcome

- Summary: replaced the partial metadata registry with one typed catalog that owns current board metadata, component resolution, enabled state, and campaign unlock rules; made `GameApp` a catalog-driven in-shell router; and introduced a named application navigation operation for ordinary board changes.
- Changed files: `app/globals.css`; `docs/ARCHITECTURE.md`; `docs/E01-T04_TYPED_BOARD_CATALOG.md`; `src/boards/BoardCatalogContext.tsx`; `src/boards/SettlementBoard.tsx`; `src/boards/registry.ts`; `src/game/GameApp.tsx`; `src/game/GameProvider.tsx`; `src/ui/BoardNavigation.tsx`; `src/ui/GameShell.tsx`
- Acceptance evidence: `BOARD_CATALOG` contains only the implemented Dungeon and Settlement modules; each entry provides one stable ID, labels, icon, component, independent `enabled` flag, and `isUnlocked` rule. `getBoardAvailability` reports registered/enabled/unlocked/active separately and derives available. `resolveActiveBoard` chooses the requested available module or the first available fallback. `GameApp` renders `boardResolution.module.component` without board-specific conditions, repairs unavailable persisted active IDs through `navigateToBoard`, provides a Players exit if no module is available at all, and supplies the exact catalog/selector to navigation through a context that does not create a second definition. Settlement's rule remains `dungeon.settlementClaimed`. `BoardId` and save version remain unchanged. Shell navigation and Settlement's return control use `navigateToBoard`; the atomic Heart claim remains unchanged. Dynamic navigation grid count keeps the two registered destinations filling mobile and desktop navigation space.
- Automated verification: `npm run tokens:check` passed. A focused source-contract check passed ten assertions covering current-module membership, catalog component ownership, separate state fields, centralized Settlement unlock, safe fallback, catalog-based rendering, shared catalog consumption, absence of a runtime shared-UI import cycle, named navigation, and stable schema/IDs. `git diff --check` passed. `npm run lint` and `npm test` were invoked but unavailable as described above.
- Behavior verification: source-level tracing confirms a pre-claim Settlement entry is registered and enabled but locked/disabled in navigation; the existing Heart claim atomically sets `settlementClaimed` and the stable Settlement active ID; Dungeon ↔ Settlement controls use the shared named operation; invalid/unregistered, disabled, or locked active IDs show a bounded recovery state and are repaired to Dungeon, which is always enabled and unlocked in the current catalog. Browser interaction and portrait layout were not run.
- Documentation/decision updates: `docs/ARCHITECTURE.md` now records the exact initial board-module fields, setup exclusion, legacy unregistered IDs, state-based router/fallback strategy, catalog transport into shared UI, and deferred speculative module fields. No decision status changed; `ROADMAP.md`, `DECISIONS.md`, and `CURRENT_STATE.md` remain unchanged during Candidate.
- Limitations/risks/open approvals: lint, build, rendered-HTML tests, and requested browser/manual behavior remain unverified until run in a supported installed environment. The E01-T04 Candidate requires explicit project-owner acceptance before checkpoint administration. No new architecture decision is pending.
- Deployment: **Not performed**

### User acceptance

- Status: awaiting acceptance
- Accepted by/date: pending

### Accepted checkpoint

- Final commit SHA: pending acceptance
- Pushed source branch: pending acceptance
- Saved Sites version: pending acceptance
- Roadmap status: unchanged during Candidate; EPIC 01 remains Current and E01-T04 remains the exact next task
- Next task: none authorized until acceptance
- Deployment: **Not performed**
