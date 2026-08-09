# E01-T07 — Portrait mobile QA and EPIC 01 exit gate

Status: **Blocked — rendered browser QA unavailable**
Implementation date: 2026-08-09

## Task ID and name

`E01-T07 — Responsive/mobile verification and EPIC 01 exit gate`

## Goal

Verify the complete accepted EPIC 01 foundation as one coherent mobile-first application architecture, correct only defects required by its exit criteria, and present EPIC 01 as a Candidate for completion without deployment.

## Context

- Stable base commit: `437da227013243b040d3961f6ead2cb52c3a8c85` on `main`, matching GitHub and the configured Sites source branch
- Accepted Sites version: `12` (`appgprj_6a762ab98b2c819181682817b758d7f8~appgver_366a9325cc6c8191909afa51d71cf5d2`), saved from the stable base without deployment
- Current roadmap milestone: EPIC 01 — UI shell and board architecture, Current; E01-T07 is the exact next task and its exit gate
- Relevant decisions: DMCL-001, DMCL-003, DMCL-004, DMCL-005, DMCL-009, DMCL-011, DMCL-020, DMCL-021, DMCL-P01–P05, DMCL-P13, DMCL-P16, DMCL-P17
- Relevant documents/files: `AGENTS.md`, `docs/ROADMAP.md`, `docs/DECISIONS.md`, `docs/ARCHITECTURE.md`, `docs/WORKFLOW.md`, `docs/TASK_TEMPLATE.md`, accepted E01-T01 through E01-T06 task records, `sources/fs.tokens.json`, token generator/adapters, theme bootstrap/provider, board catalog/router, shared shell/navigation/overlay/notification/primitives, all six registered boards, setup/start flow, global responsive CSS, and current save model/storage
- Why this task is needed now: EPIC 01's individual foundations are accepted, but their combined rendered behavior has not yet received the required portrait-width, interaction, theme, state-regression, and Epic-exit verification.

## Requirements

- Test approximately 320, 360, 390, and 430-pixel portrait widths plus at least one larger desktop viewport in the available browser/Sites environment.
- Verify page overflow, shared app/campaign/status regions, board viewport, six-destination navigation, safe-area behavior, overlay containment/scrolling, and appropriate content scrolling.
- Exercise Hero, Settlement, World, Dungeon, Combat, and Diplomacy through the authoritative catalog and shared shell; preserve real Dungeon/Settlement behavior and gameplay-free scaffolds.
- Test System, Light, and Dark theme preference behavior, including system default/bootstrap and absence of a visible theme regression.
- Test HeroSheet, SettingsSheet, and InfoSheet dismissal, explicit controls, Escape, initial focus, containment, restoration, and short-viewport scrolling.
- Check keyboard order/focus, active and disabled/locked semantics, labels, touch targets, hover-independent information, and reduced-motion behavior.
- Exercise player creation/selection, setup, campaign loading, dungeon exploration, Dungeon-to-Settlement progression, board switching, state continuity, and theme persistence without inventing new game tests.
- Apply only small defects directly required for the EPIC 01 exit criteria; report substantial findings separately.
- Prepare Candidate documentation and a proposed first EPIC 02 task, but do not mark EPIC 01 Complete, begin EPIC 02, save another Sites version, or deploy before explicit acceptance.

## Constraints

- Keep changes within the exit-gate task record and narrowly affected EPIC 01 UI/architecture files if observed defects require fixes.
- Preserve approved mechanics, persisted IDs, save compatibility, and unrelated user work.
- Do not install/upgrade dependencies, refactor, or change infrastructure unless explicitly listed above.
- Do not deploy. Deployment requires a separate explicit user instruction.
- Browser/Sites testing is not physical-smartphone testing; report that boundary explicitly.

## Non-goals

- Broad visual redesign, new gameplay, future board mechanics, new save tests for nonexistent systems, or future-Epic architecture.
- Dependency, styling-system, routing, persistence, framework, or platform migration.
- E01-T08, EPIC 02 implementation, physical-device claims, version saving before acceptance, or deployment.

## Acceptance criteria

- [x] FS source/generation, default/dark/system theme, semantic/primitive separation, and derived-token boundaries satisfy the source-contract portion of the EPIC exit gate.
- [ ] One shared shell supplies the app/status areas, viewport, navigation, overlay foundation, and notification foundation at all tested widths; source contract passed, rendered widths blocked.
- [ ] All six registered boards resolve through one catalog/shared shell with correct active and availability semantics; source contract passed, rendered navigation blocked.
- [ ] All nine shared primitive families remain available, accessible, theme-compatible, and independent of concrete game rules; exports/dependency boundary passed, rendered behavior blocked.
- [ ] Portrait widths 320, 360, 390, and 430 pixels and one desktop viewport have no exit-blocking layout, overflow, overlay, navigation, or touch-target defects.
- [ ] Theme, overlay keyboard/focus, hover-independent information, visible focus, labels, disabled/locked state, and reduced-motion checks have no exit-blocking defect.
- [ ] Player/setup/load, Dungeon exploration, Settlement progression, board switching, save compatibility, and theme preference have no regression.
- [ ] Any discovered exit-blocking defect is fixed narrowly and reverified; larger findings are reported without scope expansion.
- [ ] Physical-smartphone items remain explicitly unverified for owner acceptance.
- [ ] EPIC 01 is documented only as Candidate for completion until explicit owner acceptance and checkpoint administration.
- [ ] No unapproved gameplay or architecture decision was introduced.
- [ ] No unrelated files or behavior changed.

## Verification

### Automated

- `npm run tokens:check` — expected: synchronized generated adapters.
- `npm run lint` — expected: pass in a supported installed environment.
- `npm test` — expected: pass in a supported installed environment with GNU `timeout`.
- Focused source-contract and `git diff --check` checks — expected: accepted token, shell, catalog, primitive, theme, save-version, and scope contracts remain intact.

### Behavior/manual

- Browser-test the complete representative campaign flow at 320, 360, 390, and 430 pixels portrait plus a desktop viewport.
- Exercise all six boards, three theme preferences, Hero/Settings/Info overlays, keyboard focus/dismissal/restoration, touch targets, reduced motion, and state continuity.
- Record observable layout measurements and state/semantic evidence where practical; do not infer physical-device behavior.

### Environment limitations

- The supported `npm run install:ci` command is Linux-only and exited 69 because macOS lacks `flock`/GNU `timeout`. After explicit owner approval, one direct `npm ci` exception installed exactly the lockfile dependencies; `package.json` and `package-lock.json` remained unchanged.
- The local Vite/Vinext server started successfully at `http://localhost:5173/` after approved sandbox escalation.
- The in-app browser denied both the existing Sites URL and local server because its admin-enforced access policy could not be verified. The browser explicitly prohibited bypassing that control. No requested viewport or interaction test could run.
- `npm test` remains unavailable because the supported build helper requires GNU `timeout` (exit 69). No alternate test command was invented.
- Physical smartphone testing is reserved for the project owner and was not performed.

## Documentation impact

- Responsible documents to update: this task record; `docs/ROADMAP.md` only after explicit Candidate acceptance/checkpoint administration
- Decision changes: none expected; this is verification/stabilization of accepted EPIC 01 decisions
- Roadmap change after acceptance: mark EPIC 01 Complete and identify the exact first bounded EPIC 02 task
- `CURRENT_STATE.md` audit required: no; this exit gate does not authorize a general implementation-state audit

## Checkpoint

- Configured Sites source branch: `main`
- Commit/push authorized: no; await explicit Candidate acceptance
- Expected checkpoint contents: exit-gate evidence, any narrowly required fixes, Candidate documentation, and later Epic-completion/next-task administration
- Deployment authorized: **No**

## Completion report

### Candidate outcome

- Summary: EPIC 01 is **not yet a completion Candidate** because the required rendered portrait, desktop, theme, overlay, accessibility, and campaign-flow checks could not run. Source-level exit contracts passed, and one lint-blocking catalog defect discovered by the installed toolchain was fixed narrowly.
- Changed files: `docs/E01-T07_EPIC_01_EXIT_GATE.md`; `src/boards/registry.ts`
- Acceptance evidence: twenty focused source-contract checks passed for generated token provenance/modes, semantic/primitive and derived-token separation, system-theme bootstrap/provider behavior, six catalog IDs/component ownership, registered/enabled/unlocked/active/available distinctions, catalog-based routing/navigation, shared shell/viewport/navigation/overlay/notification foundations, all ten exported primitive components covering the nine requested families, primitive domain independence, save version 3, safe-area styles, reduced motion, and visible focus styling. Rendered evidence remains absent.
- Automated verification: `npm run tokens:check` passed. Initial `npm run lint` exposed `@next/next/no-assign-module-variable` in `src/boards/registry.ts`; renaming the local `module` binding to `boardModule` preserved the public `BoardAvailability.module` contract, and `npm run lint` then passed. `npm test` was invoked and unavailable because `build-verified.sh` requires GNU `timeout` (exit 69). `git diff --check` and final scope checks remain required after any resumed browser work.
- Behavior verification: the current accepted checkpoint's Vite server started successfully, but the browser rejected navigation to both the Sites URL and `localhost` before page content loaded. Therefore 320, 360, 390, 430, desktop, six-board navigation, themes, overlays/focus, reduced motion, player/setup/load, Dungeon movement, Settlement progression, save/state continuity, overflow, safe area, scrolling, and touch targets are all unverified in rendered behavior.
- Documentation/decision updates: this task record documents the incomplete exit gate and environment evidence. `ROADMAP.md` remains unchanged; EPIC 01 remains Current and E01-T07 remains the exact next task. `DECISIONS.md`, `CURRENT_STATE.md`, and architecture contracts are unchanged.
- Limitations/risks/open approvals: the browser policy must become available or an approved equivalent rendered environment must be supplied before EPIC 01 can be presented as ready. Final physical-smartphone checks still require the project owner even after browser QA passes. The provisional next task after eventual acceptance is `E02-T01 — Audit central game-state boundaries and define the core engine contract`; it is not authorized or started.
- Deployment: **Not performed**

### User acceptance

- Status: not requested; task is blocked before Candidate
- Accepted by/date: pending

### Accepted checkpoint

- Final commit SHA: pending acceptance
- Pushed source branch: pending acceptance
- Saved Sites version: pending acceptance
- Roadmap status: unchanged during Candidate; EPIC 01 remains Current and E01-T07 remains the exact next task
- Next task: proposed only after verification; not authorized until acceptance
- Deployment: **Not performed**
