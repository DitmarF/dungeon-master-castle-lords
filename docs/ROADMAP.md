# Dungeon Master & Castle Lords — Roadmap

Status: Active Game Concept 2.0 roadmap; EPIC 03 Current
Last updated: 2026-08-14

## Purpose and authority

This document answers: **Where are we, and what is next?** Product rules live in [GAME_CONCEPT.md](./GAME_CONCEPT.md), the detailed Epic/task/subtask plan in [MVP_IMPLEMENTATION_PLAN.md](./MVP_IMPLEMENTATION_PLAN.md), implementation evidence in [CURRENT_STATE.md](./CURRENT_STATE.md), and accepted decisions in [DECISIONS.md](./DECISIONS.md).

The accepted Game Concept 2.0 rebase preserves completed EPIC 00–02 and replaces the former unstarted EPIC 03–24 sequence with a vertical Castle-MVP sequence through EPIC 14. It retains useful responsibilities from the old plan but changes their order and grouping around Game Concept 2.0. No completed Epic or accepted closure record is rewritten.

The owner accepted DMCL-P26, the E03-T01 decision packet DMCL-P27–DMCL-P39, and the next campaign-schema number under DMCL-P40 on 2026-08-14. ROADMAP.md remains the execution authority for the active Epic and exactly one next task; MVP_IMPLEMENTATION_PLAN.md remains its detailed planning companion.

## Current implementation boundary

The implemented prototype now includes:

`local player → safe verified version-2 local registry → Castle-only Hero Setup → atomic version-5 Village/home-ring opening → deterministic regional Dungeon snapshot/context → Settlement/Hero/World access`

E03-T02 implements the accepted browser-local lifecycle, timestamp, failure, verified Save, and replacement/deletion contract. E03-T03 implements the minimum Castle/Village opening content catalogs and makes Castle the sole new-campaign faction while retaining Dungeon compatibility identity. E03-T04 implements the pure deterministic seven-region opening generator. E03-T05 implements the accepted version-5 target model and strict v2/v3/v4-to-v5 migration capability. E03-T06 switches the playable application to that model, activates the verified version-2 registry cutover while retaining the version-1 source, and creates the complete Village-first foundation atomically. E03-T07 presents the authoritative Hero, capital Village, and edge-sharing home ring; enters the retained Dungeon only through its World-region context; and exposes typed recovery states without adding future mechanics. Region conquest, supply, meaningful management, tactical combat, executable skill effects, faction evolution, cloud saves, and multiplayer remain unimplemented. See CURRENT_STATE.md and the accepted E03 task records for current evidence.

## Accepted activation

Owner acceptance on 2026-08-14:

- accepted DMCL-P26 and superseded only the former unstarted EPIC 03–24 sequence;
- activated **EPIC 03 — Game Concept 2.0 transition and campaign persistence**;
- accepted E03-T01 and its thirteen owner decisions as DMCL-P27–DMCL-P39;
- accepted campaign version 5 as the next implemented campaign-schema number under DMCL-P40, without changing the current version-4 save;
- preserved EPIC 00–02 and every accepted E01/E02 closure as historical foundation;
- left all gameplay numbers and later decision gates unresolved until their responsible tasks.

The acceptance establishes planning and transition authority only. E03-T01 changed no runtime code or saves, and deployment remains separately authorized work.

## Current Epic

### EPIC 03 — Game Concept 2.0 transition and campaign persistence

Status: **Current**

Purpose: safely replace the version-4 Dungeon-first prototype foundation with the minimum Castle-only, Village-first campaign state while establishing deliberate local lifecycle, validation, migration, recovery, and board-entry behavior.

EPIC 03 does not add an empty final-game schema. It adds only state and content required by the new opening: Castle authority, a capital Village, the controlled home ring, basic starting sites, regional Dungeon context, and approved retained legacy facts. Economy yields, Road construction, units, Combat, Gambits, Hero progression depth, and evolution effects remain with later Epics.

## Exact current task

### E03-T08 — Compatibility and EPIC 03 exit gate

Status: **Current — exactly one**

Goal: perform the final compatibility, persistence, determinism, integration, documentation, and manual-acceptance audit for EPIC 03 without adding gameplay.

E03-T08 must:

- audit every approved v2/v3/v4 migration class, malformed source, target round trip, retained Dungeon snapshot, and persistence read/write failure path;
- verify no Dungeon or World reroll/regeneration, stable references, idempotence, atomic one-time Setup, context separation, legal navigation, and source preservation;
- run the complete supported automated gate and reconcile rendered/manual evidence without replacing owner physical-device acceptance;
- refresh only responsible documentation from verified implementation evidence and create the EPIC 03 exit record;
- present an EPIC 03 Exit Candidate and wait for explicit owner acceptance before closure checkpoint work.

E03-T08 must not add economy/yields, Roads, projects, units, Combat, Gambits, faction evolution, new Dungeon content, database/hosting infrastructure, begin EPIC 04, or deploy.

## Epic registry

The sequence column records dependency position, not permission to begin early. Detailed tasks, subtasks, decisions, and exit criteria are in MVP_IMPLEMENTATION_PLAN.md. Every task still requires a bounded task definition when activated.

| Epic / milestone | Status | High-level purpose | Sequence position |
|---|---|---|---|
| EPIC 00 — Project contract and development infrastructure | **Complete** | Establish the audit, product and technical contracts, decision log, roadmap, workflow, repository guidance, FS source, and project README. | Foundation |
| EPIC 01 — UI shell and board architecture | **Complete** | Finish and generalize the existing mobile-first shell, FS integration, and modular board foundations. | After EPIC 00 |
| EPIC 02 — Core game engine and state | **Complete** | Establish the shared game-engine and central campaign-state foundations needed by later boards and systems. | After EPIC 01 |
| EPIC 03 — Game Concept 2.0 transition and campaign persistence | **Current** | Update lifecycle, versioned state, migration, Castle/Village opening, regional Dungeon context, and board entry safely. | After EPIC 02 |
| EPIC 04 — Tier 1 World, Settlement, economy, and strategic Days | Planned | Implement Roads, connection, simple supply, projects, stockpile, core infrastructure, production, and both functional boards. | After EPIC 03 |
| EPIC 05 — Regional Dungeon integration and first vertical slice | Planned | Make the existing Dungeon a World-region location that returns a persistent consequence and completes the approved first slice. | After EPIC 04 |
| MILESTONE A — New-concept strategic slice | Planned checkpoint | Prove Setup → Village → Road → improvement → Day → regional Dungeon consequence → Tier 2 preview. | After EPIC 05 |
| EPIC 06 — Hero levels, attributes, Classes, Vocations, and Professions | Planned | Establish Level 1–20 progression, point budgets, all stable Hero identities, trees, and Profession unlocks. | After Milestone A |
| EPIC 07 — Persistent armies, encounters, and tactical Combat core | Planned | Recruit and move squads, resolve hex Combat, and return persistent campaign consequences. | After EPIC 06 |
| MILESTONE B — Connected gameplay loop | Planned checkpoint | Prove recruit → Travel → encounter → Combat → continuing campaign consequence. | After EPIC 07 |
| EPIC 08 — Executable abilities, equipment, and tactical depth | Planned | Implement the concrete typed vocabulary and all 150 shared Class/Vocation/Profession abilities. | After EPIC 07, using EPIC 06 progression |
| EPIC 09 — Diplomacy, intelligence, enemy Heroes, and opposed Gambits | Planned | Implement relationships and symmetric General/Spy/Diplomat Gambits with defending-Hero resistance. | After EPIC 08 |
| CAPABILITY GATE — Hero, social, and encounter integration | Planned checkpoint | Prove all nine Professions, executable abilities, enemy Heroes, Diplomacy, and Gambits interoperate. | After EPIC 09 |
| EPIC 10 — Tier 2 Civilizational Evolution | Planned | Implement Republic/Empire, Iron/Gold, branch packages, atomic evolution, riders, and bounded rosters. | After EPIC 09 |
| EPIC 11 — Tier 3 Technological Evolution | Planned | Implement Mana Crystals, Industry/Magic, four composed identities, facilities, and riders. | After EPIC 10 |
| EPIC 12 — Tier 4 Spiritual Evolution and terminal identities | Planned | Implement Holy/Unholy, eight terminal capstones, ancestry, signature content, costs, counters, and riders. | After EPIC 11 |
| MILESTONE C — Evolution-complete Castle campaign | Planned checkpoint | Prove all eight Tier 4 combinations through shared strategic and tactical systems. | After EPIC 12 |
| EPIC 13 — Integrated campaign, territory, and endings | Planned | Add compact territorial conflict, bounded strategic opposition, Dominion/Conquest/Ascension, defeat, and full-campaign proofs. | After EPIC 12 |
| FULL CAMPAIGN GATE | Planned checkpoint | Prove progression from Setup through Tier 4 to victory or defeat without developer intervention. | After EPIC 13 |
| EPIC 14 — MVP hardening, balance, accessibility, and release candidate | Planned | Complete content, onboarding, mobile/accessibility, persistence recovery, performance, balance, full verification, and owner acceptance. | After EPIC 13 |
| MVP CANDIDATE | Planned checkpoint | Accepted, verified, non-deployed Castle-faction MVP. | After EPIC 14 |

## EPIC 01 closure

E01-T01 through E01-T07 established and verified:

- deterministic FS-token synchronization with semantic UI and primitive game-color separation;
- one shared shell, status structure, board viewport, navigation, overlay, and notification foundation;
- one typed authoritative catalog resolving Hero, Settlement, World, Dungeon, Combat, and Diplomacy;
- the initial domain-neutral shared game UI primitive library;
- portable bounded verification through accepted DMCL-P18 and a verification-only GitHub Actions workflow;
- owner-reported PASS results for all required desktop, portrait, interaction, accessibility, campaign-regression, and physical-smartphone exit checks.

The project owner accepted E01-T07 and EPIC 01 on 2026-08-09. The matching pushed/Sites checkpoint was completed through the normal workflow without deployment. EPIC 02 subsequently completed through the accepted E02-T08 exit gate.

## EPIC 02 closure

E02-T01 through E02-T08 established and verified:

- one authoritative pure version-4 `CampaignState`/`GameSave` boundary separate from profiles, registry/runtime, theme, and presentation state;
- stable player/campaign identity categories separate from content and spatial keys;
- named validated Hero Setup, Dungeon movement/discovery/Heart, Settlement claim, and legal-navigation transitions;
- one Hero-attribute selector authority and a stored compatibility-snapshot consistency rule;
- explicit deterministic campaign RNG and no-regeneration v2/v3 → v4 migration;
- pure engine tests integrated into the normal verification gate;
- one development-only read-only campaign-state inspector;
- preserved current saves, six-board architecture, and playable prototype behavior without speculative gameplay or frameworks.

The E02-T08 exit assessment is **PASS**. The project owner accepted E02-T08 and EPIC 02 on 2026-08-10 and separately confirmed the latest GitHub Actions `Verify` result as PASS. The matching closure checkpoint is documentation-only, saves a new non-deployed Sites version, makes EPIC 03 Current, and names E03-T01 as the sole next task.

## E03-T01 closure

E03-T01 established and the project owner accepted:

- the complete current version-4 lifecycle map and field-by-field transition classification;
- the required migration-source matrix and clean-break/conversion/legacy-mode alternatives without semantic reinterpretation;
- the minimum candidate Castle/Village/home-ring/retained-Dungeon campaign shape and stored/derived/static authority boundaries;
- the accepted browser-local lifecycle, timestamp, verified Save, typed failure, source-preservation, cardinality, opening, World-authority, Castle-conversion, Dungeon-incompatibility, legacy-metadata, and Hero-compatibility policies recorded as DMCL-P27–DMCL-P39, plus version 5 as the next campaign-schema number under DMCL-P40;
- bounded E03-T02–T08 contracts, the EPIC 03 exit gate, affected-file map, and explicit non-goals.

The project owner accepted DMCL-P26 and all thirteen E03-T01 recommendations on 2026-08-14. This documentation-only checkpoint changes no runtime behavior, campaign/registry version, migration, generated World, gameplay rule, dependency, database, hosting, or deployment state. Its matching pushed/Sites checkpoint completes before E03-T02 begins.

## E03-T02 closure

E03-T02 established and verified:

- one injected application clock separating immutable creation, campaign modification/resume context, and successful New/Continue profile activity;
- explicit verified local writes and honest manual Save success/failure feedback;
- typed absence, storage, parse, registry/campaign validation, migration, serialization, quota/write, and verification outcomes;
- safe hydration that never overwrites failed input with an empty registry;
- atomic one-campaign replacement/profile deletion behavior and retryable non-destructive write failures;
- a pure in-memory persistence adapter with focused lifecycle, failure, timestamp, and cardinality coverage;
- unchanged campaign version 4, gameplay rules, and conditional registry-version policy.

The project owner accepted E03-T02 on 2026-08-14, approved all points and tests, and reported independent GitHub verification PASS. Its matching non-deployed source/Sites checkpoint completes before E03-T03 begins.

## E03-T03 closure

E03-T03 established and verified the minimum typed Castle-opening catalogs: Castle as the sole new-campaign root, Dungeon as compatibility-only identity, Tier-1 Village, Food/Wood/Stone sites, neutral home-ring terrain, regional Dungeon, inert ruin, family-specific references, deterministic ordering, and catalog validation. It preserved every existing legal Hero Class, Vocation, tree, and skill ID without adding yields, economy, generated instances, or a new campaign schema.

The project owner accepted E03-T03 on 2026-08-14, approved all points and tests, and reported independent GitHub verification PASS. Its matching non-deployed checkpoint completed before E03-T04 began.

## E03-T04 closure

E03-T04 established and verified the pure generator for one axial home region and exactly six controlled adjacent regions, the accepted Food/Wood/Stone/Dungeon/ruin/terrain-only placements, domain-separated World seed provenance, generator version 1, deterministic instance identities, stable ordering, and no mutation or consumption of the legacy Dungeon sequence or snapshot.

The project owner accepted E03-T04 on 2026-08-14, approved all points and tests, and reported independent GitHub verification PASS. Its matching non-deployed checkpoint completed before E03-T05 began.

## E03-T05 closure

E03-T05 established and verified:

- the accepted minimum version-5 Castle/Village-first target shape without speculative future state;
- strict pure v2/v3 → protected v4 → v5 migration and target validation;
- deterministic eligible Castle conversion with exact retained Dungeon and Hero facts;
- typed Dungeon-faction incompatibility, malformed-source failure, and source-preservation boundaries;
- isolated legacy Dungeon counters/claim with no strategic reinterpretation;
- deterministic/idempotent World attachment and byte-equivalent target round trips.

The project owner accepted E03-T05 on 2026-08-14, approved all points and tests, and reported independent GitHub verification PASS. Its matching non-deployed source/Sites checkpoint completes before E03-T06 begins; the playable application/Setup cutover remains E03-T06.

## E03-T06 closure

E03-T06 established and verified:

- Castle as the implicit ordinary new-campaign root with the accepted temporary Level-1 Hero grants;
- one atomic version-5 Setup transition creating the complete Tier-1 Village, controlled seven-region World, approved sites/locations, regional Dungeon snapshot, and strategic home position;
- Settlement as the opening board, with Hero/Settlement/World available, Dungeon context-gated, and Combat/Diplomacy unavailable;
- retirement of Dungeon Heart claiming as a capital-creation or board-unlock authority;
- the version-2 verified local registry cutover with the original version-1 payload retained untouched;
- focused atomicity, navigation, persistence, migration/source-preservation, and save/reload coverage.

The project owner accepted E03-T06 on 2026-08-14, approved all points and tests, and reported independent GitHub verification PASS. Its matching non-deployed source/Sites checkpoint completes before E03-T07 begins.

## E03-T07 closure

E03-T07 established and verified:

- honest Start, recovery, replacement, deletion, Save, and incompatibility presentation over the typed persistence outcomes;
- one authoritative Hero information board, the Tier-1 capital summary, and a continuous edge-sharing seven-region World map with accessible high-contrast hex boundaries;
- stored World-region selection/inspection and regional Dungeon entry without regeneration or strategic/exploration position confusion;
- correct Hero/Settlement/World availability, contextual Dungeon access, and disabled Combat/Diplomacy scaffolds;
- read-only version-5 development inspection and explicit legacy-metadata labeling;
- portrait, desktop, pointer, keyboard/focus, theme, reduced-motion, reload, and resume evidence without fake later mechanics.

The project owner accepted E03-T07 on 2026-08-14, approved all points and tests, and reported the pushed GitHub verification PASS. Its exact source commit `84130b72e91acfee7923aab8b9db6b98f48989c9` is saved as non-deployed Sites version 28. E03-T08 is the sole current audit task; EPIC 03 remains Current until the exit Candidate is explicitly accepted and checkpointed.

## E02-T01 closure

E02-T01 established and documented:

- `GameSave` v3 as the current authoritative campaign payload, with `activeGame` identified as an application working copy;
- the field-by-field stored fact, stored snapshot, derived, static, session, and UI-only classifications;
- every current campaign mutation, generic `updateGame` path, React-owned rule, duplicated calculation, identity/randomness source, and migration boundary;
- the save-compatibility risks for incremental EPIC 02 extraction;
- the accepted `CampaignState` contract, minimal operations/transitions/selectors/ports, pure-engine testing direction, and board-policy dependency correction;
- the bounded E02-T02 through E02-T08 sequence without adding future gameplay schemas.

The project owner accepted E02-T01 and DMCL-P19–P22 on 2026-08-10. Its matching pushed/Sites checkpoint is created through the normal workflow without deployment before E02-T02 begins.

## E02-T02 closure

E02-T02 established and verified:

- `CampaignState` as the pure authoritative version-3 campaign contract, with `GameSave` retained as its serialized compatibility alias;
- physical separation of campaign types from `PlayerProfile`, `GameRegistry`, `RuntimeState`, theme/hydration, and board-local presentation state;
- preservation of the exact version-3 JSON shape and existing v2/v3 normalization behavior without a schema migration;
- dependency-free `node:test` engine coverage for state boundaries, migration/normalization, explicit-seed dungeon determinism, and forbidden dependencies;
- `npm run test:engine` as the focused engine gate and its integration into normal repository verification;
- unchanged visible gameplay, confirmed by the owner through the requested campaign regression flow.

The project owner accepted E02-T02 on 2026-08-10. Its matching source/Sites checkpoint is completed through the normal workflow without deployment before E02-T03 begins.

## E02-T03 closure

E02-T03 established and verified:

- explicit `PlayerId`, `CampaignId`, and injected `IdSource` contracts for the current persistent identity categories;
- preservation of existing `player-…`/`game-…` values, version-3 campaigns, and version-1 registries without migration;
- separation of content-definition IDs, persistent player/campaign identities, and spatial/derived keys;
- crypto-backed system identity generation at the application edge without consuming gameplay RNG;
- focused engine coverage for identity creation, validation, injection, compatibility, and dependency boundaries;
- unchanged player creation, campaign creation/loading, Hero Setup, and Dungeon behavior, confirmed by the owner.

The project owner accepted E02-T03 and the necessary sequence correction on 2026-08-10, reporting all tests and gameplay checks passing. The owner then explicitly selected E02-T04 as the named validated transition layer. The matching non-deployed source/Sites checkpoint is completed before E02-T04 implementation begins.

## E02-T04 closure

E02-T04 established and verified:

- named validated transitions for current Hero Setup, Dungeon movement/discovery/Heart reach, Settlement claim, and legal board navigation;
- boards expressing player intent through named provider operations instead of unrestricted whole-campaign mutation;
- pure non-React board identity, availability, unlock, and navigation policy separated from React component bindings;
- safe rejection of illegal setup, movement, claim, and navigation requests without changing campaign state;
- preservation of version-3 save meaning, the six-board EPIC 01 catalog, deterministic Dungeon movement, and visible gameplay;
- focused pure-engine coverage integrated into the normal verification gate.

The project owner accepted E02-T04 on 2026-08-10 and reported all requested tests, verifications, and gameplay checks passing. Its matching non-deployed source/Sites checkpoint is completed before E02-T05 implementation begins.

## E02-T05 closure

E02-T05 established and verified:

- one pure authority for the six current class/vocation attribute bonuses, combined path bonus, and total Hero attributes;
- Hero Setup path-card copy and live preview derived from that authority instead of parallel mechanical strings or calculations;
- version-3 `hero.attributes` retained as a compatibility snapshot refreshed by the same selector on setup completion and v2/v3 load normalization;
- deterministic, non-mutating coverage for all nine current class/vocation combinations;
- no schema change, balance change, speculative selector framework, or unrelated gameplay work.

The project owner accepted E02-T05 on 2026-08-10 and reported all requested tests, verifications, Hero Setup checks, and save/load behavior passing. Its matching non-deployed source/Sites checkpoint is completed before E02-T06 implementation begins.

## E02-T06 closure

E02-T06 established and verified:

- one authoritative persisted unsigned 32-bit campaign seed and a small pure deterministic random-source contract;
- explicit new-campaign seed entropy at an infrastructure boundary separate from identity generation;
- the unchanged current Dungeon algorithm consuming an explicit seed with same-seed reproducibility;
- deliberate version-2/version-3 to version-4 migration that adopts the stored Dungeon seed without regenerating or changing stored Dungeon/progress facts;
- removal of uncontrolled gameplay `Math.random()` use without speculative streams, counters, or future random mechanics.

The project owner accepted E02-T06 on 2026-08-10 and reported all requested tests, verifications, migration checks, and new-campaign behavior passing. Its matching non-deployed source/Sites checkpoint is completed before E02-T07 implementation begins.

## E02-T07 closure

E02-T07 established and verified:

- one development-gated read-only inspector within the existing Settings and modal architecture;
- direct display of current campaign, Dungeon, Hero, deterministic-seed, and raw JSON facts;
- selector-derived Hero attributes without duplicated rule interpretation;
- copy-only clipboard actions with no campaign transition, persistence, JSON import, or cheat surface;
- production Settings without an inspector entry and unchanged normal gameplay when the inspector is closed.

The project owner accepted E02-T07 on 2026-08-10 and reported all requested tests, inspector interactions, responsive checks, and normal-gameplay regressions passing. Its matching non-deployed source/Sites checkpoint is completed before E02-T08 begins.

## EPIC 00 closure

E00-T05 reconciles the project contract by:

- accepting DMCL-P01–P13 and DMCL-P16;
- superseding the temporary milestone proposals DMCL-P14/P15 with the Epic roadmap and E01-T01;
- recording approved gameplay-system shapes while leaving exact formulas/balance TBD;
- restoring the authoritative FS token source;
- replacing starter-first repository documentation;
- reducing mandatory reading to core plus task-relevant documents;
- declaring EPIC 01 and exactly one next task.

E00-T05 was accepted by the project owner on 2026-08-09, completing EPIC 00. Its accepted, non-deployed checkpoint leaves EPIC 01 current and E01-T01 as the exact next task.

## Roadmap operating rules

- Use vertical slices with explicit readiness and exit criteria.
- Approve a mechanic’s system shape before permanent state/rule implementation; exact formulas may remain a later bounded design task.
- Extend existing working systems instead of rebuilding them from a blank-slate plan.
- Introduce abstractions alongside concrete Epic work; avoid speculative frameworks.
- Preserve/migrate saves when feasible and document intentional incompatibility.
- Every accepted task updates this file with the current Epic status and exactly one next task.
- Normal tasks save an accepted Sites version but do not deploy. Deployment requires separate explicit user instruction.

## Open decisions after E03-T01

- DMCL-P27–DMCL-P39 resolve the MVP lifecycle, timestamp, storage-failure, campaign-count, legacy-save, opening-destination, starting-ring, and transition contract. Implementation remains bounded to the responsible E03 tasks.
- Campaign version 5 and registry version 2 are the accepted and implemented playable application boundaries. The original registry-version-1 payload remains retained throughout EPIC 03 under DMCL-P31.
- Exact gameplay formulas, balance, thresholds, costs, progression values, content quantities, and later schema fields remain with their named Epic decision tasks.
- Exact effect vocabulary remains deferred until EPIC 08 has concrete approved abilities.
- Cloud/offline synchronization, authentication, multiplayer authority, localization, mods/content packs, and remote content remain outside the MVP.
- A detailed task row is planning scope, not implementation authorization; each task still requires its own accepted task definition.
