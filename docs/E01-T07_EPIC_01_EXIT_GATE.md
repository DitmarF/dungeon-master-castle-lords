# E01-T07 — Portrait mobile QA and EPIC 01 exit gate

Status: **Accepted — checkpoint administration in progress**
Implementation date: 2026-08-09

## Task ID and name

`E01-T07 — Responsive/mobile verification and EPIC 01 exit gate`

## Goal

Verify the complete accepted EPIC 01 foundation as one coherent mobile-first application architecture, correct only defects required by its exit criteria, and present EPIC 01 as a Candidate for completion without deployment.

## Context

- Stable base commit: `437da227013243b040d3961f6ead2cb52c3a8c85` on `main`, matching GitHub and the configured Sites source branch
- Accepted Sites version: `12` (`appgprj_6a762ab98b2c819181682817b758d7f8~appgver_366a9325cc6c8191909afa51d71cf5d2`), saved from the stable base without deployment
- Resumed E01-T07 source: current `main` HEAD `ad880d0e4e3558590f603ad68baf2307047302e1`, which contains only the existing E01-T07 task record and narrow `registry.ts` lint fix beyond the accepted checkpoint; those changes were preserved as the in-progress task source
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
- Preserve `scripts/install-ci.sh` as the protected Sites/Linux installer while making ordinary build/test verification portable across Linux and macOS with a dependency-free bounded process runner.
- Provide one `npm run verify` entry point and a minimal verification-only GitHub Actions Linux job using `npm ci`; do not add deployment behavior.
- Propose the resulting cross-environment verification contract for owner approval as DMCL-P18; do not silently resolve DMCL-Q13.
- Prepare Candidate documentation and a proposed first EPIC 02 task, but do not mark EPIC 01 Complete, begin EPIC 02, save another Sites version, or deploy before explicit acceptance.

## Constraints

- Keep changes within the exit-gate task record, its verification infrastructure/documentation, and narrowly affected EPIC 01 UI/architecture files if observed defects require fixes.
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
- [x] The Sites/Linux protected installer remains intact and documented; normal build/test verification no longer depends on GNU `timeout`.
- [x] One `npm run verify` command runs token checks, lint, one bounded build/artifact validation, and the rendered-HTML test; the full graph passes locally on macOS.
- [x] A minimal Linux GitHub Actions verification workflow uses the required Node version, `npm ci`, and `npm run verify`, and contains no deployment step; its first remote run is pending push/checkpoint.
- [x] DMCL-P18 is accepted and DMCL-Q13 is resolved by the approved cross-environment verification contract.
- [x] One shared shell supplies the app/status areas, viewport, navigation, overlay foundation, and notification foundation at all tested widths; source contract passed and owner rendered checks passed.
- [x] All six registered boards resolve through one catalog/shared shell with correct active and availability semantics; source contract and owner navigation checks passed.
- [x] All nine shared primitive families remain available, accessible, theme-compatible, and independent of concrete game rules; source contract and owner rendered checks passed.
- [x] Portrait widths 320, 360, 390, and 430 pixels and one desktop viewport have no reported exit-blocking layout, overflow, overlay, navigation, or touch-target defects.
- [x] Theme, overlay keyboard/focus, hover-independent information, visible focus, labels, disabled/locked state, and reduced-motion checks have no reported exit-blocking defect.
- [x] Player/setup/load, Dungeon exploration, Settlement progression, board switching, save compatibility, and theme preference have no reported regression.
- [x] No exit-blocking defect was reported; no fix or scope expansion was required after owner QA.
- [x] Physical-smartphone checks passed as reported by the project owner.
- [x] EPIC 01 is documented only as Candidate for completion until explicit owner acceptance and checkpoint administration.
- [x] No unapproved gameplay or architecture decision was introduced.
- [x] No unrelated files or behavior changed.

## Verification

### Automated

- `npm run verify` — expected: token adapters synchronized; lint passes; one bounded build and artifact validation pass; rendered-HTML test passes.
- Forced-timeout check — expected: the Node runner terminates the Vinext process and exits non-zero without running artifact validation.
- Focused source-contract and `git diff --check` checks — expected: accepted token, shell, catalog, primitive, theme, save-version, and scope contracts remain intact.

### Behavior/manual

- Browser-test the complete representative campaign flow at 320, 360, 390, and 430 pixels portrait plus a desktop viewport.
- Exercise all six boards, three theme preferences, Hero/Settings/Info overlays, keyboard focus/dismissal/restoration, touch targets, reduced motion, and state continuity.
- Record observable layout measurements and state/semantic evidence where practical; do not infer physical-device behavior.

### Environment limitations

- The Sites/Linux `npm run install:ci` command remains intentionally Linux-specific. Local macOS uses `npm ci`; the previously authorized lockfile install left `package.json` and `package-lock.json` unchanged.
- `npm run verify` now passes locally on macOS without GNU `timeout`. The first sandboxed attempt was denied write access to Vite's project-local temporary directory; rerunning the identical command with project-directory write permission passed.
- A forced `SITES_BUILD_TIMEOUT=1ms` build exited 124 immediately after sending `SIGTERM`, proving the normal build remains bounded and returns non-zero on timeout. The subsequent normal verification run passed.
- The local Vite/Vinext server started successfully at `http://localhost:5173/`. The permitted in-app browser retry was again denied before page load because its admin-enforced access policy could not be verified. Per policy, no bypass or alternative automation was attempted.
- GitHub Actions and a post-change ChatGPT Sites/Linux verification run require the workflow/source to be pushed; neither may be claimed as passed yet.
- Physical smartphone testing was performed by the project owner, who reported PASS for every checklist item; no agent-controlled physical-device result is claimed.

## Documentation impact

- Responsible documents updated: `AGENTS.md`, `docs/DECISIONS.md`, `docs/ARCHITECTURE.md`, `docs/WORKFLOW.md`, this task record, and the owner manual-QA checklist; `docs/ROADMAP.md` only after explicit Candidate acceptance/checkpoint administration
- Decision changes: DMCL-P18 is **Accepted**; DMCL-Q13 is resolved by that accepted contract
- Roadmap change after acceptance: mark EPIC 01 Complete and identify the exact first bounded EPIC 02 task
- `CURRENT_STATE.md` audit required: no; this exit gate does not authorize a general implementation-state audit

## Checkpoint

- Configured Sites source branch: `main`
- Commit/push authorized: yes; the project owner accepted the Candidate on 2026-08-09
- Expected checkpoint contents: exit-gate evidence, any narrowly required fixes, Candidate documentation, and later Epic-completion/next-task administration
- Deployment authorized: **No**

## Completion report

### Candidate outcome

- Summary: The verification-environment defect is fixed, the full local macOS automated gate passes, and the project owner reports PASS for every required rendered desktop, portrait, interaction, accessibility, campaign-flow, and physical-smartphone check. EPIC 01 is ready for explicit Candidate acceptance.
- Changed files: `.github/workflows/verify.yml`; `AGENTS.md`; `package.json`; `scripts/build-verified.sh`; `scripts/install-ci.sh` (documentation comment only); `scripts/run-bounded-build.mjs`; `docs/ARCHITECTURE.md`; `docs/DECISIONS.md`; `docs/WORKFLOW.md`; `docs/E01-T07_EPIC_01_EXIT_GATE.md`; `docs/E01-T07_MANUAL_QA_CHECKLIST.md`; preserved prior `src/boards/registry.ts` lint fix
- Acceptance evidence: twenty focused source-contract checks passed for generated token provenance/modes, semantic/primitive and derived-token separation, system-theme bootstrap/provider behavior, six catalog IDs/component ownership, registered/enabled/unlocked/active/available distinctions, catalog-based routing/navigation, shared shell/viewport/navigation/overlay/notification foundations, all ten exported primitive components covering the nine requested families, primitive domain independence, save version 3, safe-area styles, reduced motion, and visible focus styling. The project owner reported PASS for every rendered desktop, responsive, interaction, campaign-regression, and physical-smartphone checklist item.
- Automated verification: final local macOS `npm run verify` passed the token drift checks, lint, bounded Vinext build, Sites artifact validation, and one rendered-HTML test. The forced one-millisecond timeout check exited 124 after `SIGTERM`, as intended. GitHub Actions and post-change Sites/Linux results are pending push/checkpoint and are not claimed.
- Behavior verification: the in-app browser remained blocked before page load by its admin-enforced policy, so no agent-controlled browser result is claimed. The project owner subsequently reported PASS for every item in `E01-T07_MANUAL_QA_CHECKLIST.md`, including 320/360/390/430 portrait widths, desktop, all six boards, themes, overlays/focus, reduced motion, player/setup/load, Dungeon movement, Settlement progression, save/state continuity, overflow, safe areas, scrolling, touch targets, and physical-smartphone use.
- Documentation/decision updates: the accepted environment responsibilities and shared verification gate are documented in `AGENTS.md`, `ARCHITECTURE.md`, and `WORKFLOW.md`. `DECISIONS.md` records DMCL-P18 as Accepted and resolves DMCL-Q13. `ROADMAP.md` records EPIC 01 Complete, EPIC 02 Current, and E02-T01 as the exact next task. `CURRENT_STATE.md` remains unchanged.
- Limitations/risks/open approvals: the GitHub workflow must run on the pushed checkpoint before its result can be confirmed. `E02-T01 — Audit central game-state boundaries and define the core engine contract` is identified as Next but has not been started.
- Deployment: **Not performed**

### User acceptance

- Status: accepted
- Accepted by/date: project owner, 2026-08-09

### Accepted checkpoint

- Final commit SHA: pending acceptance-administration commit
- Pushed source branch: `main` after acceptance administration
- Saved Sites version: pending matching accepted source checkpoint
- Roadmap status: EPIC 01 Complete; EPIC 02 Current
- Next task: `E02-T01 — Audit central game-state boundaries and define the core engine contract`
- Deployment: **Not performed**
