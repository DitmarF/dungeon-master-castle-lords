# E01-T05 — Add complete empty-board scaffold

Status: **Candidate — awaiting project-owner acceptance**
Implementation date: 2026-08-09

## Task ID and name

`E01-T05 — Register the full EPIC 01 board scaffold`

## Goal

Use the accepted typed board catalog and shared application shell to establish the complete in-campaign board family—Hero, Settlement, World, Dungeon, Combat, and Diplomacy—while preserving the real Dungeon and Settlement boards and keeping the other four foundations explicitly gameplay-free.

## Context

- Stable base commit: `1e8fcb99ff8da16ad53c3263b753ccff5a0e1a7e` on `main`, matching GitHub and the configured Sites source branch
- Accepted Sites version: `10` (`appgprj_6a762ab98b2c819181682817b758d7f8~appgver_785a2bf133f88191972233d6d35e66a7`), saved from the stable base without deployment
- Current roadmap milestone: EPIC 01 — UI shell and board architecture, Current; E01-T05 is the exact next task
- Relevant decisions: DMCL-001, DMCL-003, DMCL-004, DMCL-009, DMCL-021, DMCL-P01, DMCL-P02, DMCL-P03, DMCL-P04, DMCL-P05
- Relevant documents/files: `AGENTS.md`, `docs/ROADMAP.md`, `docs/DECISIONS.md`, `docs/ARCHITECTURE.md`, `docs/GAME_CONCEPT.md`, `docs/GAME_STATE.md`, `docs/WORKFLOW.md`, `docs/TASK_TEMPLATE.md`, `src/boards/registry.ts`, `src/boards/BoardCatalogContext.tsx`, `src/game/GameApp.tsx`, `src/game/GameProvider.tsx`, `src/game/model.ts`, `src/ui/GameShell.tsx`, `src/ui/BoardNavigation.tsx`, `src/ui/HeroSheet.tsx`, and board/navigation rules in `app/globals.css`
- Why this task is needed now: E01-T04 proved the catalog/router boundary with the two implemented boards; EPIC 01 now needs the complete approved top-level board family to verify that another board is added through one catalog rather than parallel shell/router definitions.

## Requirements

- Preserve the real Dungeon and Settlement modules and their current campaign behavior.
- Add minimal Hero, World, Combat, and Diplomacy board foundations, each using the existing `GameShell` and containing only an icon, title, and concise later-Epic explanation.
- Keep the Hero board distinct from the existing quick-information `HeroSheet`; preserve the sheet in shell quick access.
- Register all six boards in the one authoritative catalog and resolve/navigation them through the existing catalog/router path.
- Keep the four new architectural scaffolds enabled and unlocked for EPIC 01 verification without encoding future gameplay unlock rules.
- Preserve Settlement's existing campaign unlock rule.
- Keep portrait bottom navigation usable with six clear destinations and minimum touch-target width; allow horizontal overflow only below the width needed for six 44-pixel targets.
- Preserve stable existing IDs and add only the new stable `hero` and `diplomacy` IDs without changing the save version or persistence model.
- End at Candidate for user approval without saving another Sites version or deploying.

## Constraints

- Keep changes within the board catalog/scaffold views, focused board/navigation CSS, stable board-ID type, and responsible concept/architecture/decision/task documentation.
- Preserve approved mechanics, persisted IDs, save compatibility, and unrelated user work.
- Do not install/upgrade dependencies, refactor, or change infrastructure unless explicitly listed above.
- Do not deploy. Deployment requires a separate explicit user instruction.
- Scaffold availability is an EPIC 01 architecture-verification choice only; it must not imply future World, Combat, Diplomacy, or Hero gameplay availability rules.

## Non-goals

- World maps or hex grids, combat grids or mechanics, diplomacy relationships, hero progression changes, settlement economy, resources, or faction mechanics.
- Browser routing, a new shell, board-local top-level navigation, new persistence, or fabricated board statistics.
- Shared primitive expansion, E01-T06, dependency work, Sites deployment, or unrelated visual redesign.

## Acceptance criteria

- [x] Hero, Settlement, World, Dungeon, Combat, and Diplomacy are registered through one catalog.
- [x] All six resolve through the same state-based board router and existing `GameShell`.
- [x] Dungeon and Settlement remain their real existing boards with unchanged gameplay and Settlement unlock behavior.
- [x] Hero, World, Combat, and Diplomacy are clearly labelled, gameplay-free foundations with no fabricated mechanics or values.
- [x] All currently available boards can be selected through shared navigation and active state is exposed correctly.
- [x] `HeroSheet` remains available as shell quick information and is distinct from the Hero board.
- [x] Portrait navigation provides six clear minimum-width touch destinations without inventing a game hierarchy.
- [x] Existing save IDs remain valid; `hero` and `diplomacy` are additive stable IDs and the save schema/version is unchanged.
- [x] No board introduces a parallel shell, navigation, theme, persistence, or game-state owner.
- [x] No unapproved gameplay or architecture decision was introduced.
- [x] No unrelated files or behavior changed.

## Verification

### Automated

- `npm run tokens:check` — expected: synchronized token artifacts.
- `npm run lint` — expected: pass in a supported installed environment.
- `npm test` — expected: pass in a supported installed environment with GNU `timeout`.
- Focused static catalog/scaffold checks and `git diff --check` — expected: six catalog entries, four shell-based foundations, preserved real boards/HeroSheet, stable schema, and clean diff.

### Behavior/manual

- In a portrait viewport, navigate through every available board and confirm one persistent shell, stable app/campaign areas, active indication, and usable navigation.
- Verify Hero and Settings overlays from a scaffold and confirm Hero quick access still opens `HeroSheet` rather than replacing the Hero board.
- Return to Dungeon and Settlement and confirm their current state/behavior remains intact; verify Settlement remains locked before claim.
- Verify Light, Dark, and System themes across representative boards.

### Environment limitations

- `node_modules` is absent and dependency installation was not authorized. `npm run lint` reached and passed `tokens:check`, then was unavailable because `eslint` was not installed (exit 127).
- `npm test` reached and passed `tokens:check`, then the build helper reported that GNU `timeout` is unavailable (exit 69). The build and rendered-HTML test did not run.
- The local application could not be started without installed dependencies, so the requested browser/manual navigation, overlay, theme, Dungeon/Settlement return, and portrait checks were not run.

## Documentation impact

- Responsible documents to update: `docs/GAME_CONCEPT.md`, `docs/ARCHITECTURE.md`, `docs/DECISIONS.md`, and this task record
- Decision changes: record the explicitly approved six-board in-campaign family and Hero-board/HeroSheet distinction; no Proposed/TBD gameplay rule becomes Accepted
- Roadmap change after acceptance: mark E01-T05 accepted through the checkpoint workflow and identify E01-T06 only after explicit acceptance
- `CURRENT_STATE.md` audit required: no

## Checkpoint

- Configured Sites source branch: `main`
- Commit/push authorized: no; await explicit Candidate acceptance
- Expected checkpoint contents: six-board catalog, four empty shell-based foundations, focused navigation/scaffold styling, additive IDs, verification evidence, documentation, and later acceptance administration
- Deployment authorized: **No**

## Completion report

### Candidate outcome

- Summary: expanded the accepted catalog from two implemented boards to the complete six-board family, preserving the real Dungeon and Settlement while adding four explicitly empty, shell-based foundations for Hero, World, Combat, and Diplomacy. All four are temporarily navigable for EPIC 01 architecture verification and add no gameplay.
- Changed files: `app/globals.css`; `docs/ARCHITECTURE.md`; `docs/DECISIONS.md`; `docs/E01-T05_EMPTY_BOARD_SCAFFOLD.md`; `docs/GAME_CONCEPT.md`; `src/boards/CombatBoard.tsx`; `src/boards/DiplomacyBoard.tsx`; `src/boards/HeroBoard.tsx`; `src/boards/ScaffoldBoard.tsx`; `src/boards/WorldBoard.tsx`; `src/boards/registry.ts`; `src/game/model.ts`
- Acceptance evidence: `BOARD_CATALOG` now contains exactly Hero, Settlement, World, Dungeon, Combat, and Diplomacy in the approved family order and owns all component resolution/navigation metadata. The four new views delegate to one board-local `ScaffoldBoard`, which uses the existing `GameShell`, presents only persisted Faction/Class/Vocation facts, and contains no controls, maps, grids, resources, or mechanics. Their shared unlock function is explicitly labelled as architecture-only. Settlement alone retains `dungeon.settlementClaimed`; Dungeon and Settlement sources are unchanged. `GameApp`, `GameProvider`, `GameShell`, `HeroSheet`, and the catalog-driven navigation implementation are unchanged. The nav continues deriving destinations from the catalog and now guarantees 44-pixel minimum widths, compact labels, and narrow-screen overflow without a second hierarchy. Existing IDs remain and `hero`/`diplomacy` are additive while `GameSave` stays version 3.
- Automated verification: `npm run tokens:check` passed. A focused source-contract check passed twelve assertions covering six catalog IDs/resolvers, four shared-shell foundations, gameplay-free markup, preserved HeroSheet, preserved Settlement unlock, explicit temporary scaffold availability, unchanged catalog router, catalog-driven navigation, portrait target sizing, additive stable IDs, and untouched real boards. A separate scoped-diff assertion confirmed Dungeon, Settlement, `GameShell`, `HeroSheet`, `GameProvider`, and `package-lock.json` are unchanged. `git diff --check` passed. `npm run lint` and `npm test` were invoked but unavailable as described above.
- Behavior verification: source-level tracing confirms every enabled scaffold ID is accepted by the catalog-derived `navigateToBoard` operation, active indication remains `game.activeBoardId === board.id`, each new board renders beneath the persistent shell/status/navigation/overlay layers, and returning to the unchanged Dungeon or unlocked Settlement reuses the same campaign state. The Hero app-bar control still renders `HeroSheet` independently of the Hero catalog destination. At normal portrait widths, six 44-pixel-or-wider tabs remain in one row; exceptionally narrow widths scroll horizontally. Browser interaction and theme/portrait checks were not run.
- Documentation/decision updates: `docs/GAME_CONCEPT.md` now records the six-board family and Hero-board/HeroSheet distinction; `docs/ARCHITECTURE.md` records the complete catalog, explicitly temporary scaffold availability, and compact navigation choice; `docs/DECISIONS.md` adds accepted DMCL-021 and refreshes the scoped interim catalog fact DMCL-I06. `docs/GAME_STATE.md` required no change because it defines the active board as a stable campaign fact without enumerating IDs, and the schema/version remain unchanged. No gameplay TBD was resolved. `ROADMAP.md` and `CURRENT_STATE.md` remain unchanged during Candidate.
- Limitations/risks/open approvals: lint, build, rendered-HTML tests, and requested browser/manual behavior remain unverified until run in a supported installed environment. The Candidate requires explicit project-owner acceptance before checkpoint administration. No new gameplay decision is pending.
- Deployment: **Not performed**

### User acceptance

- Status: awaiting acceptance
- Accepted by/date: pending

### Accepted checkpoint

- Final commit SHA: pending acceptance
- Pushed source branch: pending acceptance
- Saved Sites version: pending acceptance
- Roadmap status: unchanged during Candidate; EPIC 01 remains Current and E01-T05 remains the exact next task
- Next task: none authorized until acceptance
- Deployment: **Not performed**
