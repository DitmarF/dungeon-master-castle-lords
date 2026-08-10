# Dungeon Master & Castle Lords — E02-T07 Developer/debug state inspector

## Task ID and name

`E02-T07 — Developer/debug state inspector`

## Goal

Add one development-only, read-only inspector that exposes the current authoritative campaign payload, deterministic seeds, and selector-derived Hero attributes through the existing accessible overlay foundation without adding campaign mutation or gameplay controls.

## Context

- Stable base commit: `77a8849d950453d26f118b9626f75a0df7aded9a`
- Accepted Sites version: `19`
- Current roadmap milestone: `EPIC 02 — Core game engine and state`; E02-T07 is the sole current task
- Relevant decisions: `DMCL-P03`, `DMCL-P05`–`DMCL-P07`, `DMCL-P19`–`DMCL-P21`, `DMCL-P24`, `DMCL-P25`
- Relevant documents/files: `AGENTS.md`; `docs/ROADMAP.md`; `docs/DECISIONS.md`; `docs/E02-T01_CORE_ENGINE_CONTRACT_AUDIT.md`; `docs/E02-T04_NAMED_VALIDATED_TRANSITIONS.md`; `docs/E02-T05_SELECTORS_AND_DERIVED_STATE.md`; `docs/E02-T06_DETERMINISTIC_CAMPAIGN_RNG.md`; `docs/ARCHITECTURE.md`; `docs/GAME_STATE.md`; `docs/WORKFLOW.md`; `docs/TASK_TEMPLATE.md`; `src/game/campaignState.ts`; `src/game/GameProvider.tsx`; `src/game/selectors.ts`; `src/ui/GameShell.tsx`; `src/ui/SettingsSheet.tsx`; `src/ui/ModalOverlay.tsx`; `app/globals.css`; `tests/`
- Why this task is needed now: the engine now has explicit campaign, transition, selector, identity, and deterministic-RNG boundaries, but developers must inspect those facts across multiple boards and storage rather than through one bounded read-only surface.

## Requirements

- Add one development-build-only entry in the existing Settings overlay, which is already reachable during Hero Setup and from every in-campaign `GameShell` board.
- Reuse `ModalOverlay` for focus trapping, Escape/backdrop close behavior, responsive presentation, safe areas, and the existing sheet architecture.
- Display schema version, campaign/player IDs, campaign and Dungeon seeds, active board, setup status, Hero faction/class/vocation/position, selector-derived current Hero attributes, Dungeon level, discovery count, Heart state, settlement claim, and formatted authoritative campaign JSON.
- Derive Hero attributes through `selectHeroAttributes`; do not independently interpret class/vocation bonus rules or treat the stored compatibility snapshot as a second calculation authority.
- Provide only read-only copy actions for campaign seed and campaign JSON, with accessible success/failure feedback.
- Keep raw JSON read-only and serialize the current `activeGame` directly so legitimate campaign transitions are reflected on the next render/open.
- Add focused source-contract coverage for development gating, selector usage, required facts, JSON serialization, and the absence of mutation APIs.
- Present the verified result as Candidate and stop for owner acceptance before checkpointing or beginning E02-T08.

## Constraints

- Keep changes within the inspector component, its Settings access, responsive styles, focused tests, and responsible architecture/state/task documentation.
- Preserve approved mechanics, persisted IDs, save compatibility, normal Settings behavior, existing overlays, and unrelated user work.
- Do not install/upgrade dependencies, expose provider mutation operations, broadly refactor `GameProvider`, or change campaign/persistence schemas.
- Do not deploy. Deployment requires a separate explicit user instruction.
- The inspector must not create, cache, edit, import, or persist a second campaign representation.

## Non-goals

- Generic developer console, command line, command bus, state editor, arbitrary JSON import, or debug persistence format.
- Skip-day, resource, HP, World, Combat, army, item, faction-progression, reveal, spawn, or other gameplay cheats.
- Production analytics, normal player board/navigation entry, UI redesign, new icons/frameworks, E02-T08 implementation, or deployment.

## Acceptance criteria

- [x] A developer can open the inspector through the Settings surface in a development build during setup and normal campaign play.
- [x] The inspector displays the current authoritative campaign and deterministic values requested by the task.
- [x] Current Hero attributes are calculated through `selectHeroAttributes`.
- [x] Raw authoritative campaign JSON is visible, read-only, and copyable.
- [x] Campaign seed is copyable; copy success/failure is communicated accessibly.
- [x] The inspector exposes no campaign mutation, JSON import, or gameplay cheat action.
- [x] Production builds do not expose an inspector entry in normal Settings UI.
- [x] The existing shared modal supplies focus containment, Escape/backdrop close behavior, and focus restoration.
- [x] The sheet retains the established portrait/desktop responsive and closed-overlay input boundaries.
- [x] No campaign/save schema, gameplay rule, provider operation, dependency, or production infrastructure changes.
- [x] No unapproved gameplay or architecture decision was introduced.
- [x] No unrelated files or behavior changed.

## Verification

### Automated

- `npm run test:engine` — expected: focused engine and inspector source-contract tests pass without a Sites build.
- `npm run verify` — expected: token drift check, lint, focused tests, bounded Sites build/artifact validation, and rendered-HTML test all pass.

### Behavior/manual

- In development, open Settings during Hero Setup, open the inspector, verify pre-Hero values and both seeds, close with its button/Escape/backdrop, and confirm focus returns safely.
- Complete setup, open the inspector from the Dungeon, verify faction/class/vocation/position/derived attributes, move legally with the inspector closed, reopen, and confirm position/discovery/Heart facts update.
- Exercise copy seed and copy JSON success/failure feedback; inspect the raw JSON and confirm it matches `activeGame` without edit/import controls.
- Check representative portrait and desktop viewports, light/dark themes, keyboard focus containment, and that closed inspector state does not affect Dungeon controls or navigation.
- Inspect a production build/source transformation to confirm the development-only Settings entry is unavailable.

### Environment limitations

- Browser interaction depends on the available browser security policy; any blocked responsive/interactive check will be reported separately from automated source/build evidence.
- Physical-smartphone testing remains owner verification; the task does not redesign gameplay interactions.

## Documentation impact

- Responsible documents to update: `docs/ARCHITECTURE.md`, `docs/GAME_STATE.md`, `docs/ROADMAP.md`, and this task record
- Decision changes: none expected; this implements the owner-requested read-only development surface within existing accepted boundaries
- Roadmap change after acceptance: mark E02-T07 accepted/complete and name exactly one bounded E02-T08 task; do not begin it in this task
- `CURRENT_STATE.md` audit required: no; it remains the dated baseline audit and will not be rewritten by this bounded implementation task

## Checkpoint

- Configured Sites source branch: `main`
- Commit/push authorized: after explicit owner acceptance under the established workflow
- Expected checkpoint contents: accepted E02-T07 implementation/tests/docs plus acceptance-driven roadmap/task updates
- Deployment authorized: **No**, unless a separate explicit deployment task says otherwise.

## Completion report

### Candidate outcome

- Summary: added one development-gated read-only campaign inspector inside the existing Settings/`ModalOverlay` path, displaying current campaign, deterministic, Dungeon, Hero, selector-derived attribute, and raw JSON information with copy-only actions.
- Changed files: `src/ui/DeveloperStateInspector.tsx`; `src/ui/SettingsSheet.tsx`; `app/globals.css`; `tests/engine/developer-inspector.test.ts`; `docs/ARCHITECTURE.md`; `docs/GAME_STATE.md`; `docs/ROADMAP.md`; this task record.
- Acceptance evidence: Settings gates the entry with `import.meta.env.DEV && activeGame`; the inspector reads `activeGame`, calls `selectHeroAttributes(activeGame.hero)`, serializes `JSON.stringify(activeGame, null, 2)`, and exposes only clipboard writes. Source-contract tests reject provider transitions, dispatch, storage, JSON parsing/import, inputs, and the historical generic update path.
- Automated verification: focused `npm run test:engine` passed 41/41; final `npm run verify` passed token synchronization, lint, the same 41 tests, bounded Sites build/artifact validation, and rendered-HTML test 1/1; `git diff --check` passed.
- Behavior verification: production output was inspected and the Settings entry is compiled to `null`; the inspector component therefore has no normal production Settings access. Development access is shared by Hero Setup and every `GameShell` board through their existing Settings entry; live values are read on render rather than copied into inspector state; established `ModalOverlay` and Settings responsive rules remain in use, with a narrow-phone fact-grid refinement.
- Documentation/decision updates: architecture and state documents record the development-only view-layer/read-only boundary and classify inspector-open/copy feedback as UI-only; roadmap links the bounded task. No new gameplay/product decision or `CURRENT_STATE.md` audit was introduced.
- Limitations/risks/open approvals: in-app browser navigation to the healthy local preview was denied before page load because the admin-enforced browser security policy could not be verified. Owner verification remains required for actual open/copy/close, post-transition refresh, Dungeon-input regression, keyboard focus behavior, and representative portrait/desktop rendering before acceptance.
- Deployment: **Not performed**

### User acceptance

- Status: Candidate awaiting explicit owner acceptance
- Accepted by/date: pending explicit acceptance

### Accepted checkpoint

- Final commit SHA: pending acceptance
- Pushed source branch: `main` after acceptance
- Saved Sites version: pending acceptance
- Roadmap status: E02-T07 remains active until acceptance and checkpoint completion
- Next task: pending owner acceptance and bounded roadmap definition
- Deployment: **Not performed**
