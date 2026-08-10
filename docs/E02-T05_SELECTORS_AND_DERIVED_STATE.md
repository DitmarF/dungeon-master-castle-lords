# Dungeon Master & Castle Lords — E02-T05 Selectors and derived-state layer

## Task ID and name

`E02-T05 — Selectors and derived-state layer`

## Goal

Create a small pure selector boundary for the current Hero attribute calculation so Hero Setup preview, setup completion, and save normalization share one rule authority without changing version-3 campaign meaning or adding a general selector framework.

## Context

- Stable base commit: `eb55b0a615b310c37065fd94209d3977ea65c77b`
- Accepted Sites version: `17`
- Current roadmap milestone: `EPIC 02 — Core game engine and state`; E02-T05 is the sole current task
- Relevant decisions: `DMCL-P03`, `DMCL-P06`, `DMCL-P10`, `DMCL-P19`, `DMCL-P20`, `DMCL-P24`
- Relevant documents/files: `AGENTS.md`; `docs/ROADMAP.md`; `docs/DECISIONS.md`; `docs/E02-T01_CORE_ENGINE_CONTRACT_AUDIT.md`; `docs/E02-T02_CAMPAIGN_STATE_AND_ENGINE_TESTING.md`; `docs/E02-T04_NAMED_VALIDATED_TRANSITIONS.md`; `docs/ARCHITECTURE.md`; `docs/GAME_STATE.md`; `docs/CONTENT_MODEL.md`; `docs/WORKFLOW.md`; `docs/TASK_TEMPLATE.md`; `src/game/campaignState.ts`; `src/game/transitions.ts`; `src/game/createGame.ts`; `src/game/navigation.ts`; `src/boards/SetupBoard.tsx`; `src/ui/HeroSheet.tsx`; `tests/engine/`
- Why this task is needed now: the E02-T01 audit classified Hero totals as a stored snapshot derived from class, vocation, and free-allocation facts. E02-T04 centralized the calculation in the transition module, but path bonus definitions still exist independently in Hero Setup card copy and the rule calculation, and there is no focused selector contract or combination coverage.

## Requirements

- Add one React-independent selector/derived-state module for the current class bonus, vocation bonus, combined path bonus, and total Hero attributes.
- Preserve the approved current bonuses exactly: Fighter → Strength, Ranger → Perception, Mage → Intellect, General → Leadership, Spy → Agility, and Diplomat → Charisma, each at the existing value.
- Make Hero Setup path cards and attribute preview derive bonus meaning from the selector authority rather than parallel bonus strings or calculations.
- Make Hero Setup completion and v2/v3 load normalization calculate the stored `hero.attributes` snapshot through the same selector.
- Keep `hero.attributes` as the current version-3 stored snapshot for compatibility. Treat `heroClass`, `vocation`, and `freeAttributes` as the authoritative stored facts; successful setup writes and migration normalization must refresh the snapshot from those facts.
- Add focused pure tests for all Fighter/Ranger/Mage and General/Spy/Diplomat combinations, deterministic/non-mutating calculation, setup integration, and forbidden dependencies.
- Add no additional selector unless current code demonstrates a shared derived or rule-interpretation need.
- Present the verified result as Candidate and stop for owner acceptance before checkpointing or beginning E02-T06.

## Constraints

- Keep changes within the Hero attribute selector/calculation, bounded Hero Setup integration, migration normalization, focused tests, and responsible architecture/state/content/decision/task documentation.
- Preserve approved mechanics, bonus values, persisted IDs, version-3 save shape and meaning, and unrelated user work.
- Do not install/upgrade dependencies, broadly refactor Hero Setup or transitions, or change infrastructure.
- Do not deploy. Deployment requires a separate explicit user instruction.
- Do not turn every property read into a selector or introduce a query framework, state-management library, generic effect system, or speculative Hero-content architecture.

## Non-goals

- Full Hero foundation, leveling, derived combat stats, skill effects, faction evolution, equipment, or economy.
- New or rebalanced classes, vocations, factions, attributes, skills, bonus values, or progression.
- Changing `CampaignState` structure, save version, persistence container, migration fallback behavior, or stored-snapshot policy.
- Dungeon exploration progress selectors or board-policy rewrites without a second current consumer.
- UI redesign, dependency changes, E02-T06 implementation, or deployment.

## Acceptance criteria

- [x] Hero class/vocation bonuses and total attribute calculation have one pure authority.
- [x] Hero Setup card copy and attribute preview consume that authority rather than duplicating mechanical bonus definitions.
- [x] `hero.attributes` remains an explicit version-3 stored snapshot with one documented write/normalization consistency rule.
- [x] Setup completion and v2/v3 migration normalization use the same calculation and preserve existing campaigns.
- [x] Focused tests cover all nine current class/vocation combinations deterministically and without mutating inputs.
- [x] Pure selector code imports no React, board, browser storage, localStorage, Sites, or Cloudflare module.
- [x] No unneeded selectors, future gameplay values, balance changes, or speculative framework are introduced.
- [x] Existing Hero Setup and save/load behavior remain unchanged in source, engine, migration, build, and rendered-output verification; interactive browser inspection remains for owner acceptance because of the environment limitation below.
- [x] No unapproved gameplay or architecture decision was introduced.
- [x] No unrelated files or behavior changed.

## Verification

### Automated

- `npm run test:engine` — expected: focused campaign, identity, transition, selector-combination, migration, and dependency-boundary tests pass without a Sites build.
- `npm run verify` — expected: token drift check, lint, focused engine tests, one bounded Sites build/artifact validation, and rendered-HTML test all pass.

### Behavior/manual

- Inspect Hero Setup and confirm Fighter, Ranger, Mage, General, Spy, and Diplomat show their existing bonuses and the preview total uses the same calculation written into the completed Hero.
- Confirm a completed campaign and a normalized existing v2/v3 campaign retain the expected Hero totals through save/load.
- Review the diff for duplicate bonus rule meaning, accidental save/schema changes, unrelated selector wrappers, new gameplay values, UI redesign, dependency changes, and unrelated files.

### Environment limitations

- Browser-local existing saves may be unavailable to this execution environment; any unavailable interactive save/load inspection will be reported rather than inferred from automated migration fixtures.
- Physical-smartphone testing is not required because no visual or interaction redesign is planned.

## Documentation impact

- Responsible documents to update: `docs/ARCHITECTURE.md`, `docs/GAME_STATE.md`, `docs/CONTENT_MODEL.md`, `docs/DECISIONS.md`, `docs/ROADMAP.md`, and this task record
- Decision changes: no new gameplay decision anticipated; record the implemented selector and stored-snapshot consistency policy under accepted `DMCL-P06`, `DMCL-P10`, `DMCL-P19`, and `DMCL-P20`; reconcile `DMCL-I07` where its duplication is removed
- Roadmap change after acceptance: mark E02-T05 accepted/complete and name exactly one bounded E02-T06 task; do not begin it in this task
- `CURRENT_STATE.md` audit required: no; it remains the dated baseline audit and will not be rewritten by this bounded implementation task

## Checkpoint

- Configured Sites source branch: `main`
- Commit/push authorized: after explicit owner acceptance under the established workflow
- Expected checkpoint contents: accepted E02-T05 implementation/tests/docs plus acceptance-driven roadmap/task updates
- Deployment authorized: **No**, unless a separate explicit deployment task says otherwise.

## Completion report

### Candidate outcome

- Summary: added one pure Hero-attribute selector authority and wired Hero Setup preview/card copy, setup completion, and v2/v3 normalization through it while retaining the version-3 stored snapshot and every current bonus value
- Changed files: `docs/ROADMAP.md`; `docs/ARCHITECTURE.md`; `docs/GAME_STATE.md`; `docs/CONTENT_MODEL.md`; `docs/DECISIONS.md`; this task record; `src/game/selectors.ts`; `src/game/transitions.ts`; `src/game/createGame.ts`; `src/boards/SetupBoard.tsx`; `tests/engine/selectors.test.ts`; `tests/engine/transitions.test.ts`
- Acceptance evidence: the selector module owns the six current bonus mappings, combined path bonus, and total calculation; Setup no longer contains parallel `+1` bonus strings or attribute arithmetic; transition writes and migration normalization call the same selector; no other selector or schema field was added
- Automated verification: focused `npm run test:engine` passed 32/32; final `npm run verify` passed token synchronization, lint, 32/32 engine tests, the bounded Sites build/artifact validation, and 1/1 rendered-HTML test
- Behavior verification: source inspection confirms each Fighter/Ranger/Mage and General/Spy/Diplomat card derives its existing selector mapping and the live total derives from the same calculation stored at completion; the transition integration and v2/v3 migration fixtures confirm completed and loaded Hero totals. The local preview was healthy, but in-app browser access was denied before page load because its required admin security policy could not be verified.
- Documentation/decision updates: architecture, state, content, decision, roadmap, and task records now describe the narrow selector responsibility and the retained version-3 stored-snapshot consistency rule; `DMCL-I07` is reconciled; no new gameplay decision was made; `CURRENT_STATE.md` remains unchanged because no new audit was performed
- Limitations/risks/open approvals: owner acceptance should repeat the requested interactive Hero Setup inspection and save/load check because browser interaction was unavailable here. Full Hero content consolidation remains EPIC 04 work, and no E02-T06 scope was inferred or begun.
- Deployment: **Not performed**

### User acceptance

- Status: awaiting Candidate acceptance
- Accepted by/date: pending explicit acceptance

### Accepted checkpoint

- Final commit SHA: pending acceptance
- Pushed source branch: `main` after acceptance
- Saved Sites version: pending acceptance
- Roadmap status: E02-T05 remains active until acceptance and checkpoint completion
- Next task: pending owner acceptance and bounded roadmap definition
- Deployment: **Not performed**
