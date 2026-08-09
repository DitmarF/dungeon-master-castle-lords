# E01-T03 — Harden the shared application shell

Status: **Accepted — non-deployed checkpoint**
Implementation date: 2026-08-09

## Task ID and name

`E01-T03 — Harden the existing shared application shell and overlay infrastructure`

## Goal

Evolve the existing `GameShell` into the stable shared shell used by current and future game boards, with one clear board viewport, a reusable accessible modal/sheet foundation, and a small shared notification region, while preserving current controls, appearance, gameplay ownership, theme behavior, and persisted state.

## Context

- Stable base commit: `4c18d4f1547cc98edc53a088f69d99a43322bc3b` on `main`, matching GitHub and the configured Sites source branch
- Accepted Sites version: `8` (`appgprj_6a762ab98b2c819181682817b758d7f8~appgver_96c773d9bf408191b1dd8ecc827e891c`), saved from the stable base without deployment
- Current roadmap milestone: EPIC 01 — UI shell and board architecture, Current; E01-T03 is the exact next task
- Relevant decisions: DMCL-003, DMCL-004, DMCL-009, DMCL-P01, DMCL-P02, DMCL-P03, DMCL-P16, DMCL-I02, and DMCL-I06
- Relevant documents/files: `AGENTS.md`, `docs/ROADMAP.md`, `docs/DECISIONS.md`, `docs/ARCHITECTURE.md`, `docs/WORKFLOW.md`, `docs/TASK_TEMPLATE.md`, `src/ui/GameShell.tsx`, `src/ui/BoardNavigation.tsx`, `src/ui/HeroSheet.tsx`, `src/ui/SettingsSheet.tsx`, `src/boards/DungeonBoard.tsx`, `src/boards/SettlementBoard.tsx`, `src/boards/SetupBoard.tsx`, `src/game/GameApp.tsx`, and the shell/modal/toast rules in `app/globals.css`
- Why this task is needed now: the existing shell already centralizes board chrome, but its content region is implicit, Hero and Settings duplicate incomplete modal behavior, and save feedback is a one-off element rather than a shared notification boundary.

## Requirements

- Preserve one `GameShell` and render Dungeon/Settlement content through one explicit shared board viewport.
- Provide one bounded modal/sheet primitive with dialog semantics, title association, Escape handling, backdrop handling, initial focus, Tab/Shift+Tab containment, focus restoration, background scroll locking, and existing safe-area/mobile sheet behavior.
- Reuse the modal/sheet primitive for both `HeroSheet` and `SettingsSheet`, including the Settings instance used during hero setup.
- Provide an always-mounted polite, atomic notification region and use existing campaign-saved feedback as its first and only current notification.
- Preserve Players/back, Hero, Save, Settings, campaign status, board navigation, system/light/dark theme behavior, and current shell appearance.
- Keep authoritative campaign/game rules in the existing application/domain boundary; shared UI may render data and invoke callbacks only.
- End at Candidate for user approval without saving a new Sites version or deploying.

## Constraints

- Keep changes within the existing shared shell/overlay/notification UI, their focused CSS, the two required sheet consumers, and responsible task/architecture documentation.
- Preserve approved mechanics, persisted IDs, save compatibility, and unrelated user work.
- Do not install/upgrade dependencies, refactor, or change infrastructure unless explicitly listed above.
- Do not deploy. Deployment requires a separate explicit user instruction.
- Do not migrate unrelated StartBoard confirmations or the Dungeon Heart decision merely because they use the existing backdrop class.

## Non-goals

- World, settlement-economy, combat, diplomacy, event-log, quest-notification, or other gameplay work.
- A complex toast queue, global modal state machine, routing overhaul, or alternate shell.
- Board catalog/router implementation reserved for E01-T04.
- Visual redesign, styling migration, dependency migration, save-schema work, or deployment.

## Acceptance criteria

- [x] Existing Dungeon and Settlement boards render through the same explicit `GameShell` viewport.
- [x] Hero and Settings sheets use one reusable modal/sheet primitive.
- [x] Each migrated sheet has `role="dialog"`, `aria-modal`, and an accessible title association.
- [x] Initial focus, Tab/Shift+Tab containment, Escape closure, backdrop closure, and opener focus restoration are implemented.
- [x] Modal background scrolling is locked while open; existing mobile safe-area and sheet scrolling remain usable.
- [x] Campaign-saved feedback uses one reusable, always-mounted notification region.
- [x] Players/back, Hero, Save, Settings, campaign status, board navigation, and theme behavior remain present.
- [x] No gameplay or persisted-state behavior changed.
- [x] No duplicate shell architecture or unapproved global modal/toast framework was introduced.
- [x] No unapproved gameplay or architecture decision was introduced.
- [x] No unrelated files or behavior changed.

## Verification

### Automated

- `npm run tokens:check` — expected: synchronized token artifacts.
- `npm run lint` — expected: pass in a supported installed environment.
- `npm test` — expected: pass in a supported installed environment with GNU `timeout`.
- Static shell/overlay contract checks and `git diff --check` — expected: one viewport, shared primitive consumers, notification region, and clean diff.

### Behavior/manual

- Verify Dungeon and Settlement shell layout, preserved controls/status/navigation, and campaign-saved notification.
- Open and close Hero and Settings by close button, backdrop, and Escape; verify initial focus, forward/reverse Tab containment, and focus restoration to each opener.
- Verify Settings from hero setup and from `GameShell`.
- Verify Light, Dark, and System themes and a representative portrait mobile viewport, including internally scrollable sheets and safe-area spacing.

### Environment limitations

- `node_modules` is absent and dependency installation was not authorized. `npm run lint` reached and passed `tokens:check`, then was unavailable because `eslint` was not installed (exit 127).
- `npm test` reached and passed `tokens:check`, then the build helper reported that GNU `timeout` is unavailable (exit 69). The build and rendered-HTML test did not run.
- The local application could not be started without installed dependencies, so requested browser/manual shell, focus, notification, theme, and portrait checks were not run.

## Documentation impact

- Responsible documents to update: `docs/ARCHITECTURE.md` and this task record
- Decision changes: none; this task implements the established shared-UI and dependency boundaries without introducing a new decision
- Roadmap change after acceptance: mark E01-T03 accepted through the checkpoint workflow and identify E01-T04 only after explicit acceptance
- `CURRENT_STATE.md` audit required: no

## Checkpoint

- Configured Sites source branch: `main`
- Commit/push authorized: yes; the project owner accepted the Candidate by directing continuation to E01-T04
- Expected checkpoint contents: shared viewport, modal/sheet primitive and migrated consumers, notification region, focused CSS, verification, documentation, and later acceptance administration
- Deployment authorized: **No**

## Completion report

### Candidate outcome

- Summary: hardened the existing `GameShell` with one labelled board viewport, one local overlay slot, a reusable focus-managed `ModalOverlay` used by Hero and Settings, and an always-mounted `NotificationRegion` used by campaign-saved feedback.
- Changed files: `app/globals.css`; `docs/ARCHITECTURE.md`; `docs/E01-T03_SHARED_APPLICATION_SHELL.md`; `src/ui/GameShell.tsx`; `src/ui/HeroSheet.tsx`; `src/ui/ModalOverlay.tsx`; `src/ui/NotificationRegion.tsx`; `src/ui/SettingsSheet.tsx`
- Acceptance evidence: Dungeon and Settlement remain unchanged consumers of the sole `GameShell`; the shell retains all existing controls, status, and navigation; `ModalOverlay` owns role/title semantics, initial focus, Escape, backdrop handling, forward/reverse focus containment, external-focus correction, opener restoration, and body scroll locking; existing sheet safe-area/max-height rules remain and gain contained momentum scrolling; one local union prevents simultaneous shell sheets without creating global modal state; notification timing/message remain unchanged.
- Automated verification: `npm run tokens:check` passed; the static shell contract check passed all seven assertions (one viewport, both boards using `GameShell`, both sheets using `ModalOverlay`, dialog semantics/title, Escape/Tab handling, scroll lock/focus restoration, and shared live region); `git diff --check` passed; a scoped diff check confirmed board, game-state, and lockfile sources are unchanged. `npm run lint` and `npm test` were invoked but unavailable as described above.
- Behavior verification: source-level review confirms the first focus target is each sheet close control, Tab and Shift+Tab wrap at the dialog boundary, outside focus is redirected, every close path unmounts through the same cleanup, and focus restores only when the opener remains connected. Existing mobile safe-area and responsive sheet CSS, theme provider/bootstrap behavior, save callback, and 1600 ms feedback duration are unchanged. Browser verification was not run.
- Documentation/decision updates: `docs/ARCHITECTURE.md` now records the shared shell, modal, notification, and authority boundaries; no decision status changed; `ROADMAP.md` and `CURRENT_STATE.md` remain unchanged during Candidate.
- Limitations/risks/open approvals: application lint/build/test results and requested manual browser behavior remain unknown until run in an installed supported environment. No additional architecture decision is pending.
- Deployment: **Not performed**

### User acceptance

- Status: accepted
- Accepted by/date: project owner, 2026-08-09; accepted by directing continuation to E01-T04

### Accepted checkpoint

- Final commit SHA: the acceptance-administration commit containing this update; reported with the saved Sites checkpoint because a commit cannot contain its own SHA
- Pushed source branch: `main`
- Saved Sites version: assigned from the pushed acceptance commit and reported with the checkpoint
- Roadmap status: E01-T03 accepted; EPIC 01 remains Current
- Next task: `E01-T04 — Typed board-module catalog and board router`
- Deployment: **Not performed**
