# Dungeon Master & Castle Lords — E03-T05 Version-5 state and migration

Status: **Candidate**

## Task ID and name

`E03-T05 — Version-5 state and migration`

## Goal

Implement the accepted minimum version-5 Castle/Village-first campaign shape and a strict pure migration chain that preserves valid legacy history, rejects incompatible Dungeon-faction campaigns, and never writes or repairs source persistence implicitly.

## Context

- Stable base commit: `4ce33a6645a49951074af497a44e06da910c23b9`
- Accepted Sites checkpoint: version 25
- Current roadmap milestone: EPIC 03 Current; E03-T05 sole Next task
- Relevant accepted decisions: DMCL-P32–DMCL-P41
- Relevant contracts: `GAME_CONCEPT.md`, `GAME_STATE.md`, `ARCHITECTURE.md`, `CONTENT_MODEL.md`, accepted E03-T01, and completed E03-T02–T04 records
- Completed dependencies: safe typed local persistence, Castle-opening catalogs, and deterministic seven-region generation

The target model and migration are pure domain capabilities. E03-T05 does not write storage. It also does not wire current Hero Setup or boards to the new shape; the accepted task sequence assigns atomic new-campaign foundation creation/application integration to E03-T06 and player-facing board changes to E03-T07. The current application-facing version-4 alias remains intact so this bounded task does not break or prematurely redesign the playable Setup flow.

## Requirements

- Define only the accepted version-5 identity/lifecycle, Castle foundation, Hero, Tier-1 capital Village, seven-region authoritative World, regional Dungeon, and resume/location facts.
- Store Castle root authority once at campaign foundation level; target Hero state has no faction field.
- Keep strategic region identity separate from retained Dungeon exploration location/cell.
- Store only positive known Hero skill ranks and the versioned `v4-path-bonus-1` compatibility attribute snapshot.
- Migrate supported v2/v3 through the protected v4 normalizer before applying the v4 class policy.
- Convert completed v4 Castle campaigns deterministically and preserve approved identity, timestamps, seed, Hero build, and exact Dungeon snapshot/progress facts.
- Convert incomplete v4 campaigns to `foundation: null`, preserving identity/seed/lifecycle without manufacturing a Hero, draft, Village, World, or exploration history.
- Return a typed recoverable incompatibility for completed v4 Dungeon-faction campaigns and no target state.
- Relocate old Dungeon day, treasury, and claim only to `legacyPrototypeMetadata`; never create strategic Day, Gold, capital, or control meaning from them.
- Validate target version 5 strictly, including World provenance/topology/catalog references, stable instance relationships, target-only fields, Hero references, regional Dungeon shape, and legal context.
- Normalize an already valid version-5 target without regeneration, reroll, ID changes, duplication, or history creation.

## Constraints

- Keep Domain/model/rules → Application/state → UI → platform/storage direction.
- Migration accepts only explicit source data and registry-owner context; it reads no clock, entropy, browser, React, storage, Sites, or hosting API.
- Migration returns data/results only and performs no persistence write.
- Preserve the current version-4 playable application boundary until E03-T06 can switch creation/Setup atomically rather than leaving a half-integrated runtime.
- Add no dependency, database, cloud/authentication, container version, hosting change, or deployment.

## Non-goals

- No Hero Setup transition/application cutover, board-navigation rewrite, or UI change.
- No new-campaign Village/World creation wiring; E03-T06 owns that atomic transition.
- No World regeneration on load, Dungeon regeneration, playable Dungeon legacy mode, or destructive replacement workflow.
- No economy, resources/stockpile, Roads, strategic Day, production, projects, further buildings, units, Combat, Gambits, faction evolution, or new Hero progression.
- No registry-version-2 activation, migration write transaction, cloud save, database, or deployment.

## Implemented target shape

```text
CampaignStateV5
  version, campaign/player IDs, campaignSeed, createdAt, updatedAt
  activeBoardId: setup | hero | settlement | world | dungeon
  foundation: null | {
    rootFactionId: castle
    hero: Class/Vocation/allocation/bonus skill/positive ranks
          + v4-path-bonus-1 snapshot
          + strategicRegionId
          + optional regional exploration context
    capital: one Tier-1 village in the home region
    world: generator version + World seed + authoritative seven-region,
           three-site, two-location snapshot
    regionalDungeons[location:regional-dungeon]: retained Dungeon snapshot
      + optional legacyPrototypeMetadata
  }
```

`setupComplete` is derived from `foundation !== null`. Definition metadata remains in the E03-T03 catalogs. World generation rules remain in E03-T04. Application/session and UI state remain outside this payload.

## Migration fixture matrix

| Fixture/source | Result | Preserved or isolated evidence |
|---|---|---|
| v4 before Setup | v5 success, `foundation: null`, Setup resume | campaign/player IDs, campaign seed, lifecycle timestamps; no fake draft/Hero/World |
| completed v4 Castle | v5 success | IDs, seed, timestamps, valid build/ranks, compatibility totals, exact Dungeon seed/level/grid/rooms/tiles/start/Heart/discovery/outcome/position |
| completed v4 Dungeon | typed `incompatible-faction` | source remains untouched; no Castle state is returned |
| supported v2 | v2 → protected v4 → v5 | adopts stored Dungeon seed as campaign seed; same target as equivalent v4 |
| supported v3 | v3 → protected v4 → v5 | same protected compatibility meaning and target as equivalent v4 |
| malformed campaign | typed `invalid-campaign` | no repair, generation, or source mutation |
| malformed registry | existing typed `registry-validation-failed` | original raw payload retained and no write |
| valid v5 roundtrip | v5 → strict validation → byte-equivalent v5 | stored World/Dungeon/IDs remain authoritative; no generator call on the v5 path |
| retained Dungeon snapshot | moved under regional location | exact approved snapshot/progress fields, with no `createDungeonLevel` call |
| old day/treasury/claim | compatibility metadata only | `dungeonDay`, `dungeonTreasury`, `settlementClaimed`; no strategic fields/effects |

## Acceptance criteria

- [x] The minimum accepted version-5 shape contains no speculative future slice.
- [x] Castle faction authority is campaign-owned and target Hero state contains no faction truth.
- [x] The capital Village is generated independently of old `settlementClaimed`.
- [x] Strategic region and retained exploration location/cell are distinct.
- [x] v2/v3 pass through protected v4 normalization before v5 conversion.
- [x] Completed v4 Castle conversion preserves every approved valid fact and never regenerates its Dungeon.
- [x] Pre-Setup v4 creates no fake completed state.
- [x] v4 Dungeon faction returns a typed incompatibility and never produces Castle.
- [x] Old Dungeon counters/claim exist only under legacy prototype metadata.
- [x] Migration and validation are deterministic, typed, pure, idempotent, and write-free.
- [x] Valid v5 JSON roundtrip preserves byte-equivalent authoritative facts and stable IDs.
- [x] No Setup behavior, gameplay mechanic, dependency, database, hosting, or deployment change was added.

## Verification

### Automated

- `npm run test:engine` — PASS, 88/88 focused engine/content/generation/lifecycle/migration tests.
- `npm run verify` — PASS: token synchronization, ESLint, 88/88 engine/content/generation/migration tests, bounded production build, Sites artifact validation, and 1/1 rendered-HTML test.
- `git diff --check` plus untracked-file whitespace checks — PASS.

### Behavior/manual

- Pure fixture matrix — PASS for v2, v3, incomplete v4, Castle v4, Dungeon v4, malformed campaign, malformed registry, target roundtrip, retained Dungeon, old claim, and old counters.
- Seed `987654321` conversion — World seed `2695848309`; Village `region:0,0`; Food `region:0,1`; Wood `region:0,-1`; Stone `region:-1,0`; regional Dungeon `region:1,-1`; ruin `region:-1,1`; retained exploration cell `(3,8)`; legacy metadata `{ dungeonDay: 18, dungeonTreasury: 730, settlementClaimed: true }`. Retained Dungeon/source bytes remain unchanged.
- Repeated conversion and v5 normalization — PASS: no changed IDs, duplicate capital/regions/locations, World reroll, or Dungeon regeneration.
- No browser behavior changed or requires manual browser verification in this pure model/migration task.

### Environment limitations

- The pure migration is not yet invoked by the application registry/provider. This deliberately preserves the playable v4 Setup boundary until E03-T06 performs the accepted atomic application transition.
- No browser migration write is attempted; persistence activation and recovery presentation remain later bounded integration work.

## Documentation impact

- Responsible documents updated: `docs/GAME_STATE.md`, `docs/ARCHITECTURE.md`, and this task record.
- Decision changes: none; this task implements already Accepted DMCL-P32–DMCL-P41 policies.
- `ROADMAP.md`: unchanged while Candidate; update only after owner acceptance.
- `CURRENT_STATE.md` audit required: no; no repository-wide implementation audit is in scope.

## Checkpoint

- Configured source branch: `main`
- Commit/push authorized: no, awaiting owner acceptance
- Expected checkpoint contents: accepted E03-T05 target schema, pure migration/validation, fixtures/tests, responsible docs, and acceptance-driven roadmap/task status update
- Deployment authorized: **No**

## Completion report

### Candidate outcome

- Summary: the accepted version-5 target is now explicitly typed and strictly validated, and supported v2/v3/v4 sources can be converted purely and deterministically without mutation or persistence writes.
- Changed files: `src/game/campaignState.ts`, `src/game/campaignMigration.ts`, `src/game/createGame.ts`, `src/game/model.ts`, `tests/fixtures/campaignMigrationFixtures.ts`, `tests/engine/campaign-migration-v5.test.ts`, `docs/GAME_STATE.md`, `docs/ARCHITECTURE.md`, and this task record.
- Acceptance evidence: fixture matrix, exact retained-Dungeon assertions, generated-World comparison, typed incompatibility/error cases, strict target validation, idempotence, roundtrip, and dependency-purity tests.
- Automated verification: `npm run verify` PASS with 88/88 focused tests and the complete build/render gate.
- Behavior verification: pure migration behaviors pass; no UI or browser behavior changed.
- Known limitations: application persistence/Setup still uses the current v4 boundary until E03-T06 integrates the new shape atomically; registry v2 remains inactive; recovery UI remains E03-T07.
- Gameplay/economy pulled forward: **No**.
- Deployment: **Not performed**.

### User acceptance

- Status: awaiting acceptance
- Accepted by/date: not yet accepted

### Accepted checkpoint

- Final commit SHA: pending acceptance
- Pushed source branch: pending acceptance
- Saved Sites version: pending acceptance
- Roadmap status: E03-T05 remains sole Next while Candidate
- Next task: E03-T06 only after acceptance/checkpoint
- Deployment: **Not performed**
