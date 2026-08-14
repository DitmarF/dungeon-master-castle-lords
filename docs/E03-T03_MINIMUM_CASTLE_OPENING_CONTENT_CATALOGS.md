# Dungeon Master & Castle Lords — E03-T03 Minimum Castle-opening content catalogs

Status: **Complete**

## Task ID and name

`E03-T03 — Minimum Castle-opening content catalogs`

## Goal

Create the smallest authoritative typed content definitions required by the accepted Game Concept 2.0 Castle/Village opening without implementing World instances, economy mechanics, or the version-5 campaign schema.

## Context

- Stable base commit: `9b41636e10d86cd9d29c4c716c0acb8d5a40f785`
- Accepted Sites checkpoint: version 23
- Current roadmap milestone: EPIC 03 Current; E03-T03 sole Next task
- Relevant accepted decisions: DMCL-022, DMCL-P26, DMCL-P34, DMCL-P37
- Relevant contracts: `GAME_CONCEPT.md`, `CONTENT_MODEL.md`, `GAME_STATE.md`, `ARCHITECTURE.md`, and the accepted E03-T01 transition audit
- Completed dependency: E03-T02 Complete with accepted source/checkpoint reconciled before this task began

The accepted home-ring decision provides exactly three resource sites, one introductory regional Dungeon, one inert ruin, and one terrain-only region. It does not approve a biome or terrain effect, so this task uses one explicitly neutral home-ring terrain reference rather than inventing plains, forest, travel, or production semantics.

## Requirements

- Define one authoritative Castle root and retain the stable Dungeon identity only for compatibility/reference and future faction identity.
- Make Castle the sole playable new-campaign faction and disable Dungeon in current Hero Setup without deleting the persisted `dungeon` identity.
- Define the reusable Tier-1 `village` settlement identity.
- Define reusable `food-site`, `wood-site`, and `stone-site` identities without yields, costs, or economy effects.
- Define only the neutral home-ring terrain reference, explorable regional Dungeon, and inert ruin needed by the accepted opening.
- Preserve every current Class, Vocation, tree, skill, and legal Castle Hero Setup reference.
- Use family-specific definition ID types and keep generated instance, coordinate, and campaign identity outside content.
- Validate duplicate IDs, deterministic ordering, required definitions, broken references, incompatible reference families, and required opening compatibility.

## Constraints

- Preserve Domain/model/rules → Application/state → Boards/UI → Platform/storage adapter direction.
- Keep campaign version 4, the current registry, save compatibility, current Dungeon snapshots, and gameplay rules unchanged.
- Keep TypeScript as the current content authoring format and add no dependency or external schema.
- Do not commit, push, save a Sites version, or begin E03-T04 before owner acceptance.
- Do not deploy.

## Non-goals

- No generated World region, coordinate, site, location, or settlement instance.
- No campaign version-5 schema or migration.
- No resource yield, stockpile, production, improvement, Road, building, project, upgrade, unit, evolution, effect, encounter, reward, or ruin mechanic.
- No Hero progression redesign, localization/content loader, universal location framework, or global content/entity mega-ID.
- No change yet to the current version-4 post-Setup Dungeon entry; the Village-first atomic opening remains E03-T06.

## Acceptance criteria

- [x] Castle is the sole playable new-campaign root; Dungeon remains a stable compatibility-only definition.
- [x] Current Hero Setup renders authoritative faction content and cannot select Dungeon.
- [x] Tier-1 Village, Food/Wood/Stone sites, neutral home-ring terrain, regional Dungeon, and inert ruin have stable typed definitions.
- [x] The six accepted home-ring content references are complete and deterministically ordered without assigning coordinates.
- [x] Catalog validation covers uniqueness, ordering, required definitions, broken references, family incompatibility, and required role compatibility.
- [x] Existing Class, Vocation, tree, skill, and legal Castle setup IDs remain unchanged.
- [x] No World instance, campaign schema, migration, economy, or gameplay effect was added.
- [x] No unapproved gameplay or architecture decision was introduced.
- [x] No unrelated files or behavior changed.

## Verification

### Automated

- `npm run test:engine` — PASS, 63/63 focused engine/content/lifecycle tests.
- `npm run verify` — PASS: token synchronization, ESLint, 63/63 engine/content tests, bounded production build, Sites artifact validation, and 1/1 rendered-HTML test.
- `git diff --check` — PASS.

### Behavior/manual

- Pure catalog matrix — PASS for canonical validity, stable required definitions, duplicates, order, missing definitions, broken references, incompatible references, Castle-only availability, Dungeon compatibility, Hero ID preservation, and forbidden dependency direction.
- Hero Setup source/transition path — PASS: the board consumes the authoritative faction catalog, Dungeon is disabled, and the domain transition rejects a forged Dungeon new-campaign selection.
- Current post-Setup behavior intentionally remains the version-4 Dungeon-first prototype until E03-T06; no World/Village opening was pulled forward.

### Environment limitations

- No browser behavior run is required by this catalog task. The normal build/render verification remains part of `npm run verify`.
- Physical smartphone and final visual acceptance remain owner responsibilities.

## Documentation impact

- Responsible documents updated: `docs/CONTENT_MODEL.md` and this task record.
- Decision changes: none; this task implements already accepted DMCL-022/DMCL-P34/DMCL-P37 constraints and does not mark a new decision Accepted.
- `ROADMAP.md`: updated at the accepted checkpoint to mark E03-T03 Complete and make E03-T04 the sole Next task.
- `CURRENT_STATE.md` audit required: no; this bounded task does not request a new repository-wide audit.

## Checkpoint

- Configured source branch: `main`
- Commit/push: accepted implementation and checkpoint reconciliation pushed to `main` under `WORKFLOW.md`
- Checkpoint contents: accepted E03-T03 content catalogs, validation/tests, responsible documentation, and acceptance-driven roadmap/task status update
- Deployment authorized: **No**

## Completion report

### Candidate outcome

- Summary: one pure typed content module now owns the minimum Castle opening definitions and validates their stable references before play. Castle is the only playable new-campaign root, while Dungeon remains present and load-compatible but disabled in current Hero Setup.
- Changed files: `src/game/openingContent.ts`, `src/game/transitions.ts`, `src/boards/SetupBoard.tsx`, `app/globals.css`, `tests/engine/opening-content.test.ts`, `tests/engine/transitions.test.ts`, `tests/engine/identity.test.ts`, `docs/CONTENT_MODEL.md`, and this task record.
- Acceptance evidence: required definition/reference matrix and Castle-only setup enforcement are covered by focused pure tests; the repository-supported full verification is PASS.
- Behavior verification: current Castle choice remains usable; Dungeon renders as unavailable and is also rejected by the pure transition boundary.
- Known limitations: the neutral `home-ring-terrain` reference deliberately carries no biome/effects; generated instances and the Village-first post-Setup transition remain later tasks.
- Gameplay/economy/schema migration pulled forward: **No**.
- Deployment: **Not performed**.

### User acceptance

- Status: accepted by the project owner on 2026-08-14; all points and tests approved, with independent GitHub verification reported PASS.
- Accepted by/date: project owner, 2026-08-14

### Accepted checkpoint

- Final commit SHA: reported in the completion handoff to avoid a self-referential documentation commit.
- Pushed source branch: `main`
- Saved Sites version: matching non-deployed version reported in the completion handoff.
- Roadmap status: E03-T03 Complete; E03-T04 is the sole Next task.
- Next task: E03-T04 — Deterministic Village and home-ring generation
- Deployment: **Not performed**
