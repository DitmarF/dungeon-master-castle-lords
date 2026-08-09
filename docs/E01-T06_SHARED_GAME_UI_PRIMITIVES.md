# E01-T06 — Shared game UI primitives

Status: **Accepted — non-deployed checkpoint pending**
Implementation date: 2026-08-09

## Task ID and name

`E01-T06 — Establish the initial shared game UI primitive library`

## Goal

Establish the first typed, FS-token-based presentation primitives needed across future boards—Panel, Stat, ResourceIndicator, ProgressBar, ActionButton, Slot, Tooltip/InfoSheet, GridCell, and GameToken—without moving campaign rules into shared UI or broadly rewriting existing screens.

## Context

- Stable base commit: `19e49dacd8c4c3daf2392399865321740e35f516` on `main`, matching GitHub and the configured Sites source branch
- Accepted Sites version: `11` (`appgprj_6a762ab98b2c819181682817b758d7f8~appgver_a10aa342d5288191a62fa90ecc72ca5b`), saved from the stable base without deployment
- Current roadmap milestone: EPIC 01 — UI shell and board architecture, Current; E01-T06 is the exact next task
- Relevant decisions: DMCL-001, DMCL-003, DMCL-004, DMCL-005, DMCL-009, DMCL-P03, DMCL-P05, DMCL-P17
- Relevant documents/files: `AGENTS.md`, `docs/ROADMAP.md`, `docs/DECISIONS.md`, `docs/ARCHITECTURE.md`, `docs/CONTENT_MODEL.md`, `docs/WORKFLOW.md`, `docs/TASK_TEMPLATE.md`, `app/fs-tokens.generated.css`, `app/globals.css`, `src/ui/GameIcon.tsx`, `src/ui/ModalOverlay.tsx`, `src/ui/GameShell.tsx`, and representative setup, scaffold, settlement, and Dungeon board views
- Why this task is needed now: the shared shell and complete board family exist, but repeated presentation patterns still rely on local markup and class conventions rather than small typed components future boards can reuse safely.

## Requirements

- Add typed presentation primitives for Panel, Stat, ResourceIndicator, ProgressBar, ActionButton, Slot, InfoSheet with a pointer/focus tooltip, SVG GridCell, and SVG-first GameToken.
- Keep primitive props domain-neutral and prevent imports of concrete Dungeon, Settlement, Combat, World, or campaign state.
- Reuse the current `.button` vocabulary and `ModalOverlay`; preserve 44-pixel touch targets, focus visibility, light/dark behavior, and mobile safe-area sheet behavior.
- Give ProgressBar native progress semantics and ensure InfoSheet information is available through focus/click/tap rather than hover alone.
- Use FS semantic tokens for interface surfaces and FS primitive game colors (or persisted projections sourced from them) for game-world token identity.
- Migrate only focused existing usages: shell stats/resource display, setup completion progress, scaffold Panel/InfoSheet, settlement Slot/ActionButton, and Dungeon GridCell/GameToken plus dialog actions.
- End at Candidate for user approval without saving another Sites version or deploying.

## Constraints

- Keep changes within the shared primitive module, focused representative consumers, primitive CSS, responsible architecture/task documentation, and no unrelated systems.
- Preserve approved mechanics, persisted IDs, save compatibility, and unrelated user work.
- Do not install/upgrade dependencies, refactor, or change infrastructure unless explicitly listed above.
- Do not deploy. Deployment requires a separate explicit user instruction.
- Shared primitives may render supplied values and callbacks but must not derive availability, costs, movement, progress, resources, or any other game rule.

## Non-goals

- Inventory, equipment, resource economy, XP/progression, combat, pathfinding, movement cost, dungeon visibility, terrain, tactical, or world mechanics.
- Broad board rewrites, visual redesign, styling-system migration, Storybook, a component/icon library, or a generic design-system package.
- E01-T07, dependency changes, persistence changes, browser routing, or deployment.

## Acceptance criteria

- [x] All nine required primitive families exist with typed, reusable, domain-neutral interfaces.
- [x] Primitives use the current FS token, SVG, button, focus, and modal foundations in light and dark themes.
- [x] ProgressBar exposes accessible value/min/max semantics and clamps presentation safely.
- [x] InfoSheet provides pointer/focus tooltip help and a click/tap modal equivalent with shared overlay behavior.
- [x] GridCell supports generic selected, highlighted, disabled, and reachable presentation states without rules.
- [x] GameToken is SVG-first and uses primitive game-color identity rather than semantic feedback colors.
- [x] Representative existing UI uses each primitive without a broad application rewrite or competing styling system.
- [x] No primitive imports concrete domain/campaign state or owns game rules.
- [x] No unapproved gameplay or architecture decision was introduced.
- [x] No unrelated files or behavior changed.

## Verification

### Automated

- `npm run tokens:check` — expected: synchronized token artifacts.
- `npm run lint` — expected: pass in a supported installed environment.
- `npm test` — expected: pass in a supported installed environment with GNU `timeout`.
- Focused static primitive/API checks and `git diff --check` — expected: all required exports, domain independence, accessible semantics, bounded consumers, and clean diff.

### Behavior/manual

- Inspect representative primitive usage at portrait width in Light, Dark, and System themes.
- Verify keyboard focus, disabled ActionButton, progress semantics, InfoSheet pointer/focus/tap and modal close behavior, GridCell selected state, and SVG GameToken rendering.
- Confirm Dungeon movement/state, Settlement state/navigation, setup choices, overlays, and save data behave as before.

### Environment limitations

- `node_modules` is absent and dependency installation was not authorized. `npm run lint` reached and passed `tokens:check`, then was unavailable because `eslint` was not installed (exit 127).
- `npm test` reached and passed `tokens:check`, then the build helper reported that GNU `timeout` is unavailable (exit 69). The build and rendered-HTML test did not run.
- A TypeScript compiler is not installed globally. The local application could not be started without installed dependencies, so browser/manual portrait, theme, focus, tooltip, sheet, and rendered SVG checks were not run.

## Documentation impact

- Responsible documents to update: `docs/ARCHITECTURE.md` and this task record
- Decision changes: none expected; this implements the already accepted shared-UI direction without selecting a new framework or game rule
- Roadmap change after acceptance: mark E01-T06 accepted through the checkpoint workflow and identify E01-T07 only after explicit acceptance
- `CURRENT_STATE.md` audit required: no

## Checkpoint

- Configured Sites source branch: `main`
- Commit/push authorized: yes; the project owner accepted the Candidate by directing continuation to E01-T07
- Expected checkpoint contents: typed primitives, focused representative migrations, shared FS-token CSS, verification evidence, architecture/task documentation, and later acceptance administration
- Deployment authorized: **No**

## Completion report

### Candidate outcome

- Summary: added one small shared presentation module containing Panel, Stat, ResourceIndicator, ProgressBar, ActionButton, Slot, Tooltip/InfoSheet, GridCell, and GameToken. The module reuses the existing button classes, `ModalOverlay`, SVG convention, FS semantic tokens, and FS primitive game colors; it contains no game-state or board imports.
- Changed files: `app/globals.css`; `docs/ARCHITECTURE.md`; `docs/E01-T06_SHARED_GAME_UI_PRIMITIVES.md`; `src/boards/DungeonBoard.tsx`; `src/boards/ScaffoldBoard.tsx`; `src/boards/SettlementBoard.tsx`; `src/boards/SetupBoard.tsx`; `src/ui/GamePrimitives.tsx`; `src/ui/GameShell.tsx`
- Acceptance evidence: shell campaign facts now render through typed Stat/ResourceIndicator primitives, with Settlement Gold proving the resource form. Hero setup uses an accessible four-choice ProgressBar and a disabled-capable primary ActionButton. Empty board foundations use Panel and the shared Tooltip/InfoSheet pattern; pointer/focus help remains supplementary to visible content, while click/tap opens a focus-managed modal sheet. Settlement's existing future district placeholders use Slot and its return control uses ActionButton. Dungeon SVG cells use GridCell, including the current hero-cell selected state; the hero and Heart use GameToken, with the Heart switched from semantic feedback error to the equivalent FS primitive red and the persisted banner color remaining sourced from the generated primitive projection. Existing primary, secondary, and ghost button consumers were migrated without changing callbacks. Typed APIs also expose danger, disabled, highlighted, reachable, selected, empty, unit, and marker presentation variants without implementing their meanings.
- Automated verification: `npm run tokens:check` passed. Fifteen focused source-contract assertions passed, covering all required exports, absence of domain imports, progress ARIA semantics, ActionButton variants, GridCell states, shared modal use, 44-pixel information target, primitive token color, all representative integrations, reduced motion, and touch information fallback. A separate export/integration scan passed, the primitive domain-import scan was empty, scoped checks confirmed no source-token/package/lockfile/hosting changes, and `git diff --check` passed. `npm run lint` and `npm test` were invoked but unavailable as recorded above.
- Behavior verification: source-level tracing confirms existing board callbacks and campaign values are still supplied by their original boards/provider; primitive components only render those props. InfoSheet delegates Escape, backdrop, focus containment/restoration, scroll locking, and safe-area behavior to the accepted `ModalOverlay`. ProgressBar clamps the rendered value and exposes label/min/max/now/value text. GridCell changes only the presentation of the cell holding the existing hero position, and GameToken reproduces the existing SVG hero/Heart geometry. Browser interaction, portrait layout, theme rendering, and actual keyboard/pointer/touch behavior were not run.
- Documentation/decision updates: `docs/ARCHITECTURE.md` records the concrete primitive vocabulary, domain-neutral dependency boundary, button/modal reuse, incremental adoption, and semantic-versus-primitive color responsibilities. No Decision Log entry changed because no new framework, gameplay rule, or unresolved architecture choice was selected. `ROADMAP.md` and `CURRENT_STATE.md` remain unchanged during Candidate.
- Limitations/risks/open approvals: lint, type-checking, build, rendered-HTML tests, and requested browser/manual behavior remain unverified until run in a supported installed environment. The Candidate requires explicit project-owner acceptance before commit/push and a matching non-deployed Sites checkpoint. No additional product or architecture approval is required.
- Deployment: **Not performed**

### User acceptance

- Status: accepted
- Accepted by/date: project owner, 2026-08-09, by directing continuation to E01-T07

### Accepted checkpoint

- Final commit SHA: pending acceptance-administration commit
- Pushed source branch: `main` after acceptance administration
- Saved Sites version: pending matching accepted source checkpoint
- Roadmap status: EPIC 01 remains Current; E01-T06 accepted and E01-T07 is the exact next task
- Next task: `E01-T07 — Portrait mobile QA and EPIC 01 exit gate`
- Deployment: **Not performed**
