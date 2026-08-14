# Dungeon Master & Castle Lords — E03-T04 Deterministic Village and home-ring generation

Status: **Complete**

## Task ID and name

`E03-T04 — Deterministic Village and home-ring generation`

## Goal

Implement a pure, reproducible Game Concept 2.0 starting-World generator that creates the capital home region plus exactly six unique adjacent hex regions and the approved minimum starting contents without changing campaigns or saves.

## Context

- Stable base commit: `3d23d4d75d6cdf96936fb85178c913ef0593465e`
- Accepted Sites checkpoint: version 24
- Current roadmap milestone: EPIC 03 Current; E03-T04 sole Next task
- Relevant decisions: DMCL-P34, DMCL-P35, and explicitly accepted placement policy DMCL-P41
- Relevant contracts: `GAME_CONCEPT.md`, `GAME_STATE.md`, `ARCHITECTURE.md`, `CONTENT_MODEL.md`, accepted E03-T01 audit, and completed E03-T02/T03 records
- Completed dependency: E03-T03 Complete with its matching accepted source and non-deployed Sites checkpoint

DMCL-P41 resolves the ordering/placement owner action left explicit by E03-T01: origin and clockwise coordinate order, exact labeled FNV-1a seed derivation, generator version 1, World-only Fisher–Yates placement, and family-specific deterministic instance-ID formats.

## Requirements

- Represent axial coordinates, coordinate-derived region IDs, canonical clockwise neighbors, and adjacency purely.
- Generate one home region at `(0,0)` plus exactly six unique controlled adjacent regions.
- Place the Tier-1 `village` capital reference in the home region.
- Place exactly one `food-site`, `wood-site`, and `stone-site` in distinct first-ring regions.
- Place exactly one `regional-dungeon` and one inert `ruin` in two other first-ring regions, leaving exactly one terrain-only neighbor.
- Derive a uint32 World seed from `world/home-ring/v1:<campaignSeed>` using FNV-1a and create a fresh World-only deterministic random source.
- Return generator version, effective seed, family-specific IDs, and complete generated snapshot types suitable for the E03-T05 persisted shape.
- Validate metadata, exact topology/order, unique coordinates/IDs, control, catalog references, distinct content placement, and the terrain-only remainder.
- Preserve the existing Dungeon generator algorithm, deterministic sequence, and stored/supplied snapshots exactly.

## Constraints

- Keep the generator under the pure Domain/model/rules layer and consume the authoritative E03-T03 content catalogs.
- Accept only explicit deterministic input; do not read React, browser storage, wall-clock time, crypto, Sites, Cloudflare, identity entropy, or uncontrolled randomness.
- Keep current `CampaignState`/`GameSave` at version 4 and do not modify creation, hydration, persistence, or migration.
- Add no dependency, general procedural-generation framework, database, hosting change, or deployment.
- Do not commit, push, save a Sites version, or begin E03-T05 before owner acceptance.

## Non-goals

- No full campaign World, further rings, or generated content beyond the seven-region opening.
- No Roads, travel, supply, production, stockpile, conquest, strategic Day, building, army, unit, Combat, threat, encounter, reward, or location consequence.
- No Village economy or regional Dungeon entry/exploration rules.
- No version-5 schema, migration cutover, existing-campaign modification, UI redesign, or deployment.

## Acceptance criteria

- [x] Output contains home `(0,0)` plus exactly six unique adjacent axial regions in canonical order.
- [x] Every opening region is controlled, uses the neutral terrain reference, and has a coordinate-derived stable ID.
- [x] The Tier-1 Village capital belongs to the home region.
- [x] Food/Wood/Stone occupy three distinct neighbors; regional Dungeon and ruin occupy two others; exactly one neighbor remains terrain-only.
- [x] Same inputs produce byte-equivalent output and different valid seeds can change only content placement.
- [x] World seed provenance and generator version follow DMCL-P41 exactly.
- [x] Validation rejects duplicate topology, invalid references/control/order, and overlapping or missing contents.
- [x] Existing Dungeon generation and a retained Dungeon snapshot remain structurally and byte unchanged.
- [x] Generator dependency purity is enforced.
- [x] No campaign schema, migration, economy, or unrelated gameplay behavior changed.

## Verification

### Automated

- `npm run test:engine` — PASS, 74/74 focused engine/content/generation/lifecycle tests.
- `npm run verify` — PASS: token synchronization, ESLint, 74/74 engine/content/generation tests, bounded production build, Sites artifact validation, and 1/1 rendered-HTML test.
- `git diff --check` — PASS.

### Behavior/manual

- Bounded seed matrix — PASS for `0`, `1`, `2`, `42`, `65535`, `123456789`, and `4294967295`.
- Seed `42` fixture — World seed `3631972228`; Village at `region:0,0`; Food at `region:-1,0`; Wood at `region:0,-1`; Stone at `region:1,-1`; regional Dungeon at `region:1,0`; ruin at `region:0,1`; terrain-only at `region:-1,1`.
- Seeds `1` and `2` — PASS: topology/order and guarantees match while approved content placements differ.
- Legacy Dungeon fixture — PASS: seed `987654321` remains byte-identical after World generation; retained discovery/Heart/counter snapshot is not mutated.

### Environment limitations

- No browser behavior is required because this task adds no UI or campaign integration.
- Physical smartphone testing is not applicable to this pure generator task.

## Documentation impact

- Responsible documents updated: `docs/GAME_STATE.md`, `docs/ARCHITECTURE.md`, `docs/CONTENT_MODEL.md`, `docs/DECISIONS.md`, and this task record.
- Decision changes: DMCL-P41 records the owner-approved exact placement/seed/ID policy.
- `ROADMAP.md`: updated at the accepted checkpoint to mark E03-T04 Complete and make E03-T05 the sole Next task.
- `CURRENT_STATE.md` audit required: no; no repository-wide audit is in scope.

## Checkpoint

- Configured source branch: `main`
- Commit/push: accepted implementation and checkpoint reconciliation pushed to `main` under `WORKFLOW.md`
- Checkpoint contents: accepted E03-T04 generator, fixtures/tests, responsible docs, and acceptance-driven roadmap/task status update
- Deployment authorized: **No**

## Completion report

### Candidate outcome

- Summary: a pure generator now creates and validates the complete seven-region Castle opening from an explicit campaign seed through a separately derived World stream. Its result is ready for E03-T05 persistence but is not yet campaign state.
- Changed files: `src/game/generateStartingWorld.ts`, `tests/engine/starting-world.test.ts`, `docs/GAME_STATE.md`, `docs/ARCHITECTURE.md`, `docs/CONTENT_MODEL.md`, `docs/DECISIONS.md`, and this task record.
- Acceptance evidence: exact fixture, bounded seed matrix, corruption cases, dependency source inspection, and fixed legacy Dungeon bytes.
- Automated verification: `npm run verify` PASS with 74/74 focused tests and the complete build/render gate.
- Behavior verification: deterministic fixture and allowed cross-seed placement variation pass; no UI behavior changed.
- Known limitations: only the seven-region opening exists; the generator output is not persisted or rendered; the regional Dungeon has placement only and no entry/consequence rule.
- Campaign/schema migration pulled forward: **No**.
- Deployment: **Not performed**.

### User acceptance

- Status: accepted by the project owner on 2026-08-14; all points and tests approved, with independent GitHub verification reported PASS.
- Accepted by/date: project owner, 2026-08-14

### Accepted checkpoint

- Final commit SHA: reported in the completion handoff to avoid a self-referential documentation commit.
- Pushed source branch: `main`
- Saved Sites version: matching non-deployed version reported in the completion handoff.
- Roadmap status: E03-T04 Complete; E03-T05 is the sole Next task.
- Next task: E03-T05 — Version-5 state and migration
- Deployment: **Not performed**
