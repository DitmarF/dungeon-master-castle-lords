# Dungeon Master & Castle Lords — Decision Log

Status: lightweight architecture and design-decision index  
Scope: accepted decisions, current interim choices, pending proposals, and deferred questions  
Last updated: 2026-08-14

## Purpose

This file is the shortest authoritative answer to: **What has been decided, what is merely true today, and what still needs approval?**

It indexes decisions and links to the responsible source rather than repeating full designs:

- [GAME_CONCEPT.md](./GAME_CONCEPT.md) — product intent and gameplay-system status
- [ARCHITECTURE.md](./ARCHITECTURE.md) — structure and dependency proposals
- [GAME_STATE.md](./GAME_STATE.md) — runtime-information ownership
- [CONTENT_MODEL.md](./CONTENT_MODEL.md) — reusable content boundaries
- [ROADMAP.md](./ROADMAP.md) — sequencing and decision gates
- [CURRENT_STATE.md](./CURRENT_STATE.md) — observed repository evidence

## Status vocabulary

- **Accepted** — approved and binding until superseded.
- **Observed/Interim** — implemented today, but not approved as a permanent product or architecture decision.
- **Proposed** — requires explicit owner approval before it becomes binding.
- **Deferred/TBD** — deliberately undecided; implementation must not choose implicitly.
- **Superseded** — replaced by a later decision; retained for history.

Only the project owner may convert **Proposed** or **Deferred/TBD** to **Accepted**. Code existing in the repository is evidence of implementation, not automatic approval.

## Accepted decisions

DMCL-001–DMCL-021 were consolidated into this log on 2026-08-09. Their original approval dates were not separately recorded, so the consolidation date must not be mistaken for the approval date. DMCL-022–DMCL-029 were explicitly approved on 2026-08-14. Superseded decisions remain in place for history.

| ID | Decision | Reason/constraint | Responsible source |
|---|---|---|---|
| DMCL-001 | Build a mobile-first, portrait-oriented browser game prototype. | Smartphone testing and rapid mechanic iteration are primary goals. | `GAME_CONCEPT.md` |
| DMCL-002 | The game combines three connected loops: strategic/management, exploration, and tactical combat. | The campaign’s decisions and consequences must cross loop boundaries. | `GAME_CONCEPT.md` |
| DMCL-003 | Organize play as a modular family of focused interactive boards. | Boards must be addable/removable without fragmenting campaign truth. | `GAME_CONCEPT.md`, `ARCHITECTURE.md` |
| DMCL-004 | Use one authoritative central campaign state across boards. | Hero, faction, locations, holdings, resources, supply, exploration, and outcomes belong to one continuing campaign when their rules exist. | `GAME_STATE.md`, `ARCHITECTURE.md` |
| DMCL-005 | Separate reusable content, campaign instances/outcomes, rules, and views at principle level. | Adding more content must not require duplicating campaign truth or rule logic in each view. | `CONTENT_MODEL.md` |
| DMCL-006 | Persistent progression and cross-board consequences are core product behavior. | Hero/faction development, holdings, territory, resources, and future combat results must matter beyond one screen. | `GAME_CONCEPT.md` |
| DMCL-007 | Region conquest, supply, dungeon/building structure, holding management, and tactical combat are approved major system categories—not approved detailed rules. | Preserve the concept without inventing mechanics. | `GAME_CONCEPT.md` |
| DMCL-008 | Player creation/recognition and campaign save/load are required. | Campaign continuity is part of the core concept. The final identity and persistence models remain open. | `GAME_CONCEPT.md`, `GAME_STATE.md` |
| DMCL-009 | Use simple geometric SVG visuals and the FS color system; system dark mode is the default. | Semantic UI colors and primitive game-object colors have distinct roles. | `GAME_CONCEPT.md` |
| DMCL-010 | Treat prototype mechanics as experiments until explicitly approved. | Implementation must not silently turn tentative concepts into permanent rules. | `GAME_CONCEPT.md`, `ARCHITECTURE.md` |
| DMCL-011 | Campaign data is versioned and requires deliberate migration handling. | Existing saves are persistent project data, even during the prototype. | `GAME_STATE.md`, `CURRENT_STATE.md` |
| DMCL-012 | Multiplayer is a possible future direction, not a current commitment. | Its mode, authority, ownership, and synchronization requirements are unresolved. | `GAME_CONCEPT.md`, `ROADMAP.md` |
| DMCL-013 | Grid assignments are World Map → hex, Dungeon/Building Map → square, Tactical Combat → hex. | Each board uses the approved spatial model for its loop. | `GAME_CONCEPT.md` |
| DMCL-014 | **Superseded by DMCL-022 and DMCL-023.** Historical decision: The faction-development structure is Castle/Humanoid/Light Dominion → Human, Dwarf, or Elf → Domain → Ascension; Dungeon/Monster/Dark Dominion → Goblinoid, Insectoid, or Necronoid → Domain → Ascension. | The original structure was approved with effects and balance TBD; the owner replaced it with the Village-first Castle evolution on 2026-08-14. | `GAME_CONCEPT.md` |
| DMCL-015 | **Superseded by DMCL-025 and DMCL-026.** Historical decision: Hero progression targets approximately 12 levels; Class + Vocation leads toward a prestige archetype; skill trees use root + 3 branches × 3 tiers. | The original progression shape was approved without fixed thresholds or bonuses; the owner replaced it with the Level-20 Profession system on 2026-08-14. | `GAME_CONCEPT.md` |
| DMCL-016 | Strategic play advances in Days and uses global hero Movement Points; dungeon exploration uses exploration turns. | Time/economy shape is approved; exact conversion and costs remain TBD. | `GAME_CONCEPT.md` |
| DMCL-017 | Tactical combat uses squads, a hex grid, an initiative queue, and separate MP/AP economies. | Combat structure is approved; exact rules and balance remain TBD. | `GAME_CONCEPT.md` |
| DMCL-018 | Downed, Wounded, and Dead are distinct hero states; death of the actual sovereign is campaign defeat. | Consequence shape is approved; exact thresholds/recovery remain TBD. | `GAME_CONCEPT.md` |
| DMCL-019 | Dominion, Conquest, and Ascension are the approved victory families. | Exact victory thresholds/resolution remain TBD. | `GAME_CONCEPT.md` |
| DMCL-020 | The authoritative FS token source is `sources/fs.tokens.json`. | UI adapters derive/synchronize from this repository source; adapter details are EPIC 01 work. | `GAME_CONCEPT.md`, `ROADMAP.md` |
| DMCL-021 | **HeroSheet distinction superseded by DMCL-029; board-family decision remains accepted.** Historical decision: the full Hero board remained distinct from the quick-information `HeroSheet`. The top-level in-campaign family remains Hero, Settlement, World, Dungeon, Combat, and Diplomacy; player/setup remains pre-campaign. | The temporary distinction supported an empty Hero scaffold, but became duplicate information authority once E03-T07 implemented the real Hero inspection board. | `GAME_CONCEPT.md`, `ARCHITECTURE.md`, `E01-T05_EMPTY_BOARD_SCAFFOLD.md` |
| DMCL-022 | The Castle Faction is the sole playable MVP faction family and begins with an established capital Village and controlled home ring; regional Dungeons are sites rather than the source of the starting Settlement. | Establishes a coherent Village-first strategic opening while retaining stable legacy faction IDs. Starting-ring contents beyond the guaranteed Food, Wood, and Stone sites and save migration remain TBD. | `GAME_CONCEPT.md` |
| DMCL-023 | Castle makes three permanent faction-wide evolution choices when its capital reaches Settlement Tiers 2–4: Republic/Empire, Industry/Magic, and Holy/Unholy; the combination derives one of eight terminal identities. | Replaces the inaccurate racial/light–dark ladder with orthogonal governance, technology, and metaphysical axes. Exact costs, numeric effects, balance, and capstone formulas remain TBD. | `GAME_CONCEPT.md` |
| DMCL-024 | Region control grants a base resource contribution; a continuous Road connection through controlled regions enables exterior improvements and supply; strategic production, upkeep, and projects resolve deterministically by Day. | Connects World geography to Settlement economy while separating control, connection, supply, and building ownership. Exact rates, construction times, shortages, conquest, and supply penalties remain TBD. | `GAME_CONCEPT.md` |
| DMCL-025 | Hero progression has 20 levels, 40 allocated attribute points, and 20 spendable skill points; Class and Vocation each grant a free Rank-I Mastery, and five purchased points in each foundation tree plus both Masteries at Rank II unlock the Class × Vocation Profession no earlier than Level 10. | Creates a comprehensible point budget with meaningful post-unlock Profession choices. XP thresholds, attribute curves/caps, respecialization, and exact skill effects remain TBD. | `GAME_CONCEPT.md` |
| DMCL-026 | Class, Vocation, and the nine Profession trees retain stable base abilities and resolve compatible faction-evolution riders compositionally; terminal factions do not duplicate all skill trees, rosters, or economies. | Prevents the proposed 780-ability multiplication and preserves recognizable abilities, stable IDs, and modular future content. Exact tags, riders, precedence, and named exceptions remain TBD. | `GAME_CONCEPT.md`, `CONTENT_MODEL.md` |
| DMCL-027 | A Vocation Gambit is the encounter initiator’s one optional pre-battle action under symmetric player/enemy rules; the defender’s attributes, matching Mastery, army rating, equipment, status, and context produce opposed resistance, and the deterministic result is persisted atomically. | Makes defensive Hero development and enemy-Hero counterplay meaningful while preventing rerolls and unbounded pre-battle stacking. Exact weights, thresholds, costs, target lists, and reset timing remain TBD. | `GAME_CONCEPT.md` |
| DMCL-028 | Hero attributes are bounded rule inputs rather than universal multipliers; tactical Aim and Critical Chance are separate, Move and AP are separate, and Armor/Ward use diminishing mitigation with explicit immunity rather than a binary damage-versus-defense cliff. | Avoids runaway scaling, ambiguous MP terminology, accuracy overflow, and zero-damage hard cliffs while preserving the approved squad/hex/initiative shape. Exact combat constants, curves, values, conditions, and AI remain TBD. | `GAME_CONCEPT.md` |
| DMCL-029 | The Hero board is the sole authoritative in-campaign Hero information surface. The shell Hero shortcut navigates to that board; the duplicate quick-information `HeroSheet` is retired. | Preserves one clear, accessible destination while retaining identity, compatibility attributes, skills, strategic position, and exploration context without duplicate presentation authority. | `GAME_CONCEPT.md`, `ARCHITECTURE.md`, `E03-T07_OPENING_BOARDS_SUMMARIES_AND_INSPECTION.md` |
| DMCL-P17 | Generate and commit the existing light/dark FS CSS adapter deterministically from `sources/fs.tokens.json`, keep derived/application CSS handwritten, and generate only the narrow default primitive-color TypeScript projection needed by existing persisted banners. | This removes manual FS-value drift without changing the CSS API, runtime theme bootstrap, visual behavior, dependencies, or stored banner values. | `ARCHITECTURE.md`, `E01-T01_FS_TOKEN_ADAPTER_AUDIT.md`, `E01-T02_FS_TOKEN_SYNCHRONIZATION.md` |
| DMCL-P18 | Retain `npm run install:ci` as the protected ChatGPT Sites/Linux install path; use `npm ci` for local macOS and GitHub Actions; use `npm run verify` as the shared automated quality gate; and treat GitHub Actions Linux as the canonical independent automated checkpoint while keeping rendered/mobile browser acceptance and owner physical-smartphone QA separate. | This makes token, lint, bounded build, artifact, and rendered-HTML checks reproducible across Linux and macOS without weakening the specialized Sites installer; CI remains verification-only. | `ARCHITECTURE.md`, `WORKFLOW.md`, `E01-T07_EPIC_01_EXIT_GATE.md` |

## Observed/interim implementation choices

These entries explain the current code. They are not accepted long-term decisions.

| ID | Current choice | Status/revisit trigger | Evidence |
|---|---|---|---|
| DMCL-I01 | React/Next conventions run through Vinext/Vite on an OpenAI Sites Cloudflare Worker. | Revisit only through an explicit platform decision. | `CURRENT_STATE.md` |
| DMCL-I02 | One React context/reducer still coordinates runtime state, but current playable rule-bearing changes now enter through named validated Village-first Setup, regional Dungeon movement, retired Heart-claim, and navigation operations; the unrestricted whole-campaign updater is no longer exposed. | Continue adding operations only alongside approved real mechanics; broader provider/lifecycle separation remains later bounded work. | `ARCHITECTURE.md`, `GAME_STATE.md`, `E02-T04_NAMED_VALIDATED_TRANSITIONS.md` |
| DMCL-I03 | Player registry and campaigns persist in browser `localStorage`. | Revisit before cloud identity, cross-device saves, valuable campaigns, or multiplayer. | `CURRENT_STATE.md`, `GAME_STATE.md` |
| DMCL-I04 | A local player has at most one campaign, keyed by player ID. | Accepted for the browser-local MVP by DMCL-P27; broader future identity/cardinality remains deferred. | `CURRENT_STATE.md`, `GAME_STATE.md` |
| DMCL-I05 | The accepted E03-T06 implementation uses `GameSave` version 5 inside `GameRegistry` version 2; strict legacy decoding/migration reads version 1 without modifying or deleting its payload. | Retain the version-1 source throughout EPIC 03 under DMCL-P31. | `GAME_STATE.md`, `E03-T06_VILLAGE_FIRST_HERO_SETUP_TRANSITION.md` |
| DMCL-I06 | One pure six-board descriptor/availability policy drives legal navigation and one React registry binds components. Hero, Settlement, and World are available after Setup; Dungeon is regional-context gated; Combat and Diplomacy are disabled. | Revisit availability only when each later Epic establishes its legal entry context. | `ARCHITECTURE.md`, `GAME_STATE.md`, `E03-T06_VILLAGE_FIRST_HERO_SETUP_TRANSITION.md` |
| DMCL-I07 | Skill trees are centralized typed content, and current Hero Class/Vocation attribute bonuses plus the `v4-path-bonus-1` snapshot have one pure selector authority; the authoritative Hero board reads that compatibility state. | EPIC 06 must explicitly migrate or retire the compatibility snapshot when it implements progression. | `CONTENT_MODEL.md`, `GAME_STATE.md`, `E02-T05_SELECTORS_AND_DERIVED_STATE.md` |
| DMCL-I08 | Game content is authored in TypeScript; no external content loader/schema/editor exists. | TypeScript is accepted for the prototype until a concrete externalization need exists. | `CONTENT_MODEL.md` |
| DMCL-I09 | Each regional Dungeon stores both its deterministic seed and authoritative generated rooms/tiles snapshot; migrated snapshots are retained without regeneration. | Revisit only through a deliberate Dungeon schema/generator migration. | `GAME_STATE.md` |
| DMCL-I10 | Unfinished hero setup and most view interaction state are component-local and disposable. | Unfinished Hero Setup is accepted as disposable by DMCL-P32; other view/session persistence remains case-specific. | `CURRENT_STATE.md`, `GAME_STATE.md` |
| DMCL-I11 | World strategy, conquest, supply, meaningful management, tactical combat, executable skill effects, cloud saves, and multiplayer are not implemented. | Do not report concept scope as shipped functionality. | `CURRENT_STATE.md` |

## EPIC 02 core-engine decisions

The project owner accepted the following E02-T01 decisions on 2026-08-10. They authorize the bounded E02-T02–T08 sequence while preserving the documented non-goals and compatibility constraints.

| ID | Status | Decision | Reason/constraint | Responsible source |
|---|---|---|---|---|
| DMCL-P19 | **Accepted** | Name the pure authoritative campaign contract `CampaignState`, retain `GameSave` as the version-3 serialized compatibility name or alias, and preserve the exact v3 runtime shape during the first engine task. | Separates campaign truth from runtime/profile/UI state without forcing a save migration or speculative future slices. | `GAME_STATE.md`, `E02-T01_CORE_ENGINE_CONTRACT_AUDIT.md` |
| DMCL-P20 | **Accepted** | Build the smallest engine surface from named current operations, pure transitions/selectors, explicit clock/identity/gameplay-seed inputs, a registry-storage port, and dependency-free Node engine tests integrated into `npm run verify`. | Current rules are split across provider/helpers/React boards and are untested independently; no framework or dependency is justified. | `ARCHITECTURE.md`, `E02-T01_CORE_ENGINE_CONTRACT_AUDIT.md` |
| DMCL-P21 | **Accepted** | Separate pure board identity/availability/navigation policy from the React component registry while preserving the EPIC 01 catalog, IDs, ordering, components, and UI. | Application/state currently imports a React-bearing board module and cannot enforce legal navigation at its own boundary. | `ARCHITECTURE.md`, `E02-T01_CORE_ENGINE_CONTRACT_AUDIT.md` |
| DMCL-P22 | **Superseded by DMCL-P24 (sequence only)** | Sequence E02-T02–T08 as state/tests; clock/identity/RNG inputs; setup transition; dungeon transitions/selectors; board-policy separation; named operation/provider integration; then v3 compatibility/EPIC 02 exit gate. | The architectural requirements remain accepted through DMCL-P19–P21, but the owner selected a different bounded task order after E02-T03. | `E02-T01_CORE_ENGINE_CONTRACT_AUDIT.md` |

## E02-T03 identity decision

The project owner explicitly approved the bounded E02-T03 identity-source policy on 2026-08-10.

| ID | Status | Decision | Reason/constraint | Responsible source |
|---|---|---|---|---|
| DMCL-P23 | **Accepted** | Distinguish family-specific content IDs, current `PlayerId`/`CampaignId` values, and spatial/derived keys; generate new player/campaign IDs through an injected `IdSource` using the existing `player-…`/`game-…` conventions and identity entropy separate from gameplay RNG. | Preserves all current IDs and save shapes while preventing UI labels/indexes, coordinates, content IDs, and gameplay randomness from becoming one generic identity system. Future entity categories require a real persistent mechanic. | `ARCHITECTURE.md`, `GAME_STATE.md`, `CONTENT_MODEL.md`, `E02-T03_STABLE_ENTITY_AND_ID_SYSTEM.md` |

## EPIC 02 sequence correction

The project owner accepted the E02-T03 Candidate and necessary sequence correction on 2026-08-10, then explicitly selected the named validated transition layer as E02-T04.

| ID | Status | Decision | Reason/constraint | Responsible source |
|---|---|---|---|---|
| DMCL-P24 | **Accepted** | Complete E02-T03 as the bounded identity task and make E02-T04 the named validated transition/application layer for current Hero Setup, Dungeon movement/discovery/Heart reach, Settlement claim, and legal board navigation. Keep the unimplemented clock/gameplay-seed isolation explicit and unscheduled until a later bounded task places it. | Preserves the owner-defined immediate task while avoiding a false claim that the narrower E02-T03 completed clock/RNG work. It supersedes DMCL-P22 task numbering only, not the accepted engine, dependency, or compatibility requirements. | `ROADMAP.md`, `E02-T03_STABLE_ENTITY_AND_ID_SYSTEM.md`, `E02-T04_NAMED_VALIDATED_TRANSITIONS.md` |

## E02-T06 campaign RNG decision

The project owner explicitly selected the deterministic campaign-RNG foundation as E02-T06 on 2026-08-10.

| ID | Status | Decision | Reason/constraint | Responsible source |
|---|---|---|---|---|
| DMCL-P25 | **Accepted** | Add one persisted unsigned 32-bit `campaignSeed`, migrate `GameSave` from version 3 to version 4, obtain new seeds through infrastructure entropy separate from `IdSource`, and require explicit seeds for the unchanged deterministic Dungeon generator. Existing version-2/version-3 saves adopt their stored Dungeon seed without regenerating the stored Dungeon snapshot. | Establishes the smallest current deterministic authority while preserving all existing campaign facts and avoiding speculative streams, counters, or future random mechanics. | `ARCHITECTURE.md`, `GAME_STATE.md`, `E02-T06_DETERMINISTIC_CAMPAIGN_RNG.md` |

## Game Concept 2.0 MVP roadmap and EPIC 03 transition decisions

The project owner accepted the roadmap rebase and the complete E03-T01 transition packet on 2026-08-14.

| ID | Status | Decision | Reason/constraint | Responsible source |
|---|---|---|---|---|
| DMCL-P26 | **Accepted** | Preserve completed EPIC 00–02; supersede the former unstarted EPIC 03–24 sequence with the Game Concept 2.0 Castle-MVP sequence in EPIC 03–14; begin with the versioned Village-first campaign-transition Epic; and make E03-T01 the first task in that Epic. | The old plan places World/Settlement dependencies, armies/Combat, Professions, Gambits, and faction evolution in an order that no longer matches the approved core mechanic. The rebase uses vertical milestones and does not reopen completed work or pre-approve later numeric decisions. | `ROADMAP.md`, `MVP_IMPLEMENTATION_PLAN.md` |
| DMCL-P27 | **Accepted** | Keep at most one campaign per local profile. Replacement and profile deletion require explicit confirmation; the old durable campaign must remain intact until the replacement write and readback verify. Campaign-only deletion is not added in EPIC 03. | Preserves the current cardinality while preventing implicit or partially persisted destructive replacement. | `GAME_STATE.md`, `E03-T01_CONCEPT_2_0_LIFECYCLE_SAVE_OPENING_TRANSITION_AUDIT.md` |
| DMCL-P28 | **Accepted** | Persist automatically after successful durable campaign/profile changes. Manual Save means an immediate adapter write plus verified readback and reports success only after both succeed; it does not itself change campaign truth or timestamps. | Save feedback must represent actual browser-local durability rather than an in-memory update or swallowed failure. | `GAME_STATE.md`, `ARCHITECTURE.md`, `E03-T01_CONCEPT_2_0_LIFECYCLE_SAVE_OPENING_TRANSITION_AUDIT.md` |
| DMCL-P29 | **Accepted** | `campaign.createdAt` is immutable creation time; `campaign.updatedAt` changes only when campaign truth or its stored resume context changes; `profile.lastPlayedAt` records a successful New/Continue entry and is not mirrored from campaign modification or Save. | Separates campaign modification history from profile activity and removes incidental navigation/lifecycle timestamp drift. | `GAME_STATE.md`, `E03-T01_CONCEPT_2_0_LIFECYCLE_SAVE_OPENING_TRANSITION_AUDIT.md` |
| DMCL-P30 | **Accepted** | Decode and persist through typed staged outcomes covering absence, unavailable storage, parse, registry/profile/campaign validation, migration, serialization, quota/write, and verification failures. Failed hydration/migration suppresses automatic writes; later write failure keeps the in-memory campaign marked unsaved and offers retry without exposing raw exceptions. | A failure must never masquerade as empty storage or authorize overwriting the original payload. | `GAME_STATE.md`, `ARCHITECTURE.md`, `E03-T01_CONCEPT_2_0_LIFECYCLE_SAVE_OPENING_TRANSITION_AUDIT.md` |
| DMCL-P31 | **Accepted** | Introduce registry version 2 under `dmcl.prototype.registry.v2` only when the approved lifecycle/campaign cutover requires it. Write, read back, and validate the candidate before preferring it; retain the original version-1 payload untouched throughout EPIC 03 with no automatic cleanup. | Gives rollback/source preservation without embedding raw source in each campaign or rewriting the only copy in place. | `GAME_STATE.md`, `ARCHITECTURE.md`, `E03-T01_CONCEPT_2_0_LIFECYCLE_SAVE_OPENING_TRANSITION_AUDIT.md` |
| DMCL-P32 | **Accepted** | Keep unfinished Hero Setup choices disposable. Preserve only the pre-setup campaign identity/seed/lifecycle facts, and create the completed Castle/Hero/Village/World opening atomically after valid Setup. | Avoids a partial-draft schema and makes the existing interruption boundary explicit. | `GAME_STATE.md`, `E03-T01_CONCEPT_2_0_LIFECYCLE_SAVE_OPENING_TRANSITION_AUDIT.md` |
| DMCL-P33 | **Accepted** | Enter Settlement after completed Setup. Hero, Settlement, and World are initially available; Dungeon requires a valid selected regional context; Combat and Diplomacy remain unavailable until later legal contexts. Converted resume-board mapping follows the explicit E03-T01 policy rather than generic fallback order. | Establishes the Village-first opening and prevents scaffold availability from becoming gameplay policy. | `GAME_STATE.md`, `ARCHITECTURE.md`, `E03-T01_CONCEPT_2_0_LIFECYCLE_SAVE_OPENING_TRANSITION_AUDIT.md` |
| DMCL-P34 | **Accepted** | The three non-resource home-ring regions contain exactly one introductory regional Dungeon location, one inert discoverable ruin location, and one terrain-only region. All six neighbors begin controlled; EPIC 03 adds no threat, reward, extra commodity, encounter, or executable ruin mechanic. | Supplies the minimum varied opening context without pulling later economy or encounter systems forward. | `GAME_STATE.md`, `CONTENT_MODEL.md`, `E03-T01_CONCEPT_2_0_LIFECYCLE_SAVE_OPENING_TRANSITION_AUDIT.md` |
| DMCL-P35 | **Accepted** | Derive a domain-separated World seed from the campaign seed and store that seed, a generator-version identifier, and the generated World snapshot. The stored snapshot is authoritative after creation and is not regenerated on ordinary load. | Preserves reproducibility and provenance without allowing generator changes to rewrite campaign truth. | `GAME_STATE.md`, `ARCHITECTURE.md`, `E03-T01_CONCEPT_2_0_LIFECYCLE_SAVE_OPENING_TRANSITION_AUDIT.md` |
| DMCL-P36 | **Accepted** | Convert eligible completed version-4 Castle campaigns deterministically, preserving approved identity, Hero, timestamp, seed, and exact Dungeon facts while adding the Castle/Village/home-ring opening. Old claim and Dungeon counters have no strategic effect. | Retains honest continuity where the durable faction choice already matches the target concept. | `GAME_STATE.md`, `E03-T01_CONCEPT_2_0_LIFECYCLE_SAVE_OPENING_TRANSITION_AUDIT.md` |
| DMCL-P37 | **Accepted** | Treat version-4 Dungeon-faction campaigns as incompatible: never convert them to Castle, retain the source payload, explain the incompatibility, and require explicit confirmed/verified replacement for a fresh Castle campaign. Do not add playable legacy mode in EPIC 03. | Silent conversion would overwrite an explicit durable faction choice; parallel legacy runtime is outside MVP scope. | `GAME_STATE.md`, `E03-T01_CONCEPT_2_0_LIFECYCLE_SAVE_OPENING_TRANSITION_AUDIT.md` |
| DMCL-P38 | **Accepted** | Preserve old Dungeon `day`, `treasury`, and `settlementClaimed` only as clearly named legacy prototype metadata on migrated regional Dungeon state, hidden from normal strategic UI. Never reinterpret them as strategic Day, Gold/resources, capital ownership, Village existence, or region control. | Retains evidence while preventing semantic corruption of the new campaign. | `GAME_STATE.md`, `E03-T01_CONCEPT_2_0_LIFECYCLE_SAVE_OPENING_TRANSITION_AUDIT.md` |
| DMCL-P39 | **Accepted** | Through EPIC 05, retain a stored `v4-path-bonus-1` Hero attribute compatibility snapshot for migrated Heroes and produce the same snapshot for new EPIC 03 Heroes; keep allocation/Class/Vocation as facts. EPIC 06 must explicitly migrate or retire this snapshot. | Avoids an unrelated visible stat change before the approved Hero-progression Epic while labeling the totals as temporary compatibility data. | `GAME_STATE.md`, `E03-T01_CONCEPT_2_0_LIFECYCLE_SAVE_OPENING_TRANSITION_AUDIT.md` |
| DMCL-P40 | **Accepted** | Use campaign version `5` as the next persisted campaign-schema version when E03-T05 implements the accepted incompatible Castle/Village opening shape. Version 4 remains the current runtime/save authority until that verified cutover; registry versioning remains independent and conditional under DMCL-P31. | The sequential number is now owner-approved without falsely claiming that the documentation checkpoint changed the stored schema. | `GAME_STATE.md`, `MVP_IMPLEMENTATION_PLAN.md`, `E03-T01_CONCEPT_2_0_LIFECYCLE_SAVE_OPENING_TRANSITION_AUDIT.md` |
| DMCL-P41 | **Accepted** | The E03-T04 opening generator uses axial home `(0,0)`; six clockwise neighbors beginning east; 32-bit FNV-1a of `world/home-ring/v1:<campaignSeed>` as the World seed; generator version `1`; a World-seeded Fisher–Yates placement of the six approved ring contents; coordinate-derived `region:<q>,<r>` IDs; and unique definition-derived capital/site/location IDs. | Makes the accepted domain-separation and snapshot policy executable and reproducible without coupling World generation to Dungeon RNG, identity entropy, array positions, or unapproved World mechanics. | `GAME_STATE.md`, `ARCHITECTURE.md`, `E03-T04_DETERMINISTIC_VILLAGE_HOME_RING_GENERATION.md` |

## Foundation proposals resolved by E00-T05

| ID | Status | Decision | Source |
|---|---|---|---|
| DMCL-P01 | **Accepted** | Use one typed board-module contract and authoritative board catalog. | `ARCHITECTURE.md` |
| DMCL-P02 | **Accepted** | Distinguish board states as registered, enabled, unlocked, and active. | `ARCHITECTURE.md` |
| DMCL-P03 | **Accepted** | Use domain/application/view/infrastructure boundaries with dependencies directed toward domain rules. | `ARCHITECTURE.md` |
| DMCL-P04 | **Accepted** | Gradually replace generic whole-save mutation with named, validated operations as mechanics are added. | `ARCHITECTURE.md` |
| DMCL-P05 | **Accepted** | Use stable IDs, authoritative sources, reproducible generation, and explicit migration planning. | `ARCHITECTURE.md`, `GAME_STATE.md` |
| DMCL-P06 | **Accepted** | Classify values as stored facts, stored snapshots, derived values, or static definitions. | `GAME_STATE.md` |
| DMCL-P07 | **Accepted** | Preserve enough authoritative randomness information per system. | `GAME_STATE.md` |
| DMCL-P08 | **Accepted** | Use a small common content identity/presentation envelope with family-specific schemas. | `CONTENT_MODEL.md` |
| DMCL-P09 | **Accepted** | Reference definitions by stable IDs and compose approved behavior from validated capabilities. | `CONTENT_MODEL.md` |
| DMCL-P10 | **Accepted** | Provide one authoritative typed catalog per content family with derived indexes/selectors. | `CONTENT_MODEL.md` |
| DMCL-P11 | **Accepted** | Keep TypeScript as the prototype content-authoring format until concrete needs justify externalization. | `CONTENT_MODEL.md` |
| DMCL-P12 | **Accepted** | Introduce typed declarative effects only when an approved mechanic provides a concrete vocabulary. | `CONTENT_MODEL.md` |
| DMCL-P13 | **Accepted** | Use vertical slices and explicit readiness/exit criteria for milestones. | `ROADMAP.md` |
| DMCL-P14 | **Superseded** | The temporary M0–M7 sequence is replaced by the approved EPIC 00–24 roadmap structure. | `ROADMAP.md` |
| DMCL-P15 | **Superseded** | The next milestone is EPIC 01 and the exact next task is E01-T01, not generic M1 stabilization. | `ROADMAP.md` |
| DMCL-P16 | **Accepted** | Keep platform services at architectural edges and preserve Sites-compatible delivery unless explicitly replaced. | `ARCHITECTURE.md` |

## Deferred/TBD decision index

The responsible documents contain detailed questions. This index groups the decisions that materially block future work.

| ID | Decision needed | Blocks/affects | Responsible source |
|---|---|---|---|
| DMCL-Q01 | Exact Dominion, Conquest, Ascension, and defeat thresholds/resolution. | Campaign goals and completion. | `GAME_CONCEPT.md` |
| DMCL-Q02 | Exact bonuses, requirements, units, buildings, capstone formulas, counters, costs, and balance for the approved Castle evolution packages and terminal identities. | Setup, management, content, balance. | `GAME_CONCEPT.md` |
| DMCL-Q03 | Exact starting-region generation, conquest, control loss, Road, connection, supply, hostile-Dungeon access, and siege rules. | World board and strategic state. | `GAME_CONCEPT.md`, `GAME_STATE.md` |
| DMCL-Q04 | Exact tactical initiative, Move/AP, squad composition, Aim/Evasion, Armor/Ward, damage, conditions, recovery, AI, and encounter-resume rules. | Combat board, skills, tactical state. | `GAME_CONCEPT.md`, `GAME_STATE.md` |
| DMCL-Q05 | Dungeon/building hierarchy, multiple levels, regeneration, and authored/procedural balance. | Exploration content, state, generation. | `GAME_CONCEPT.md`, `CONTENT_MODEL.md` |
| DMCL-Q06 | Exact Hero XP thresholds, attribute caps/conversions, Class/Vocation/Profession effects, evolution riders, equipment, companions, respecialization, injury/recovery, and balance. | Progression content/state and combat. | `GAME_CONCEPT.md` |
| DMCL-Q07 | Exact Settlement production, construction, recruitment, reinforcement, upkeep, shortage, project-capacity, and resource-sink rules. | Future Settlement/economy work. | `GAME_CONCEPT.md` |
| DMCL-Q09 | Player/profile/user/owner/participant relationship beyond the accepted one-campaign-per-local-profile MVP boundary. | Future identity, cloud, multiplayer. | `GAME_STATE.md` |
| DMCL-Q10 | Cloud/offline sync, conflict handling, export/import, and long-term compatibility guarantees beyond the accepted browser-local save, draft, recovery, and v4 Castle/Dungeon transition policies. | Future persistence and migrations. | `GAME_STATE.md`, `ROADMAP.md` |
| DMCL-Q11 | Multiplayer mode and authority model, or confirmation that it should not constrain current work. | Architecture and campaign transitions. | `ROADMAP.md` |
| DMCL-Q12 | Content ID/version/deprecation strategy, evolution-rider compatibility and precedence, localization, asset catalog, and mod/remote-content requirements. | Content infrastructure. | `CONTENT_MODEL.md` |
| DMCL-Q17 | Exact Gambit weights, variance, outcome thresholds, costs, target eligibility, hidden information, re-engagement reset timing, AI policy, and high-risk consequences. | Vocation progression, enemy Heroes, encounters, Combat entry, deterministic persistence. | `GAME_CONCEPT.md`, `GAME_STATE.md` |
| DMCL-Q18 | Exact Diplomacy participant, relationship, trust/obligation, Favor/Leverage, access, trade, treaty, loyalty-change, faction-reaction, and minimum strategic-event rules. | Diplomacy board, World access, economy, Gambits, evolution consequences, and strategic opposition. | `GAME_CONCEPT.md`, `GAME_STATE.md` |

### Resolved deferred entries

| ID | Status | Resolution |
|---|---|---|
| DMCL-Q08 | **Accepted as DMCL-013** | World and tactical boards use hex grids; dungeon/building boards use square grids. |
| DMCL-Q13 | **Resolved by accepted DMCL-P18** | Sites/Linux retains its protected installer; macOS and GitHub Actions use lockfile `npm ci`; all share `npm run verify`; independent CI does not replace rendered/mobile or physical-device acceptance. |
| DMCL-Q14 | **Resolved by accepted DMCL-P16** | Sites/Vinext/Cloudflare remains the delivery constraint unless an explicit later decision replaces it; platform services stay at the edges. |
| DMCL-Q15 | **Resolved by accepted DMCL-P17** | Use deterministic committed generation for the existing FS adapter and the narrow persisted-banner projection; keep derived CSS handwritten and runtime theme handling unchanged. |
| DMCL-Q16 | **Resolved historically; superseded by current roadmap status** | E00-T05 activated EPIC 01 with E01-T01 next. EPIC 01 and EPIC 02 are complete; EPIC 03 is Current and E03-T08 is its sole current task. |

## Decision record format

Use this compact format for future decisions:

```text
### DMCL-NNN — Short title
Date: YYYY-MM-DD
Status: Accepted | Proposed | Deferred/TBD | Superseded by DMCL-NNN
Decision: One clear sentence.
Reason: Why this choice was made now.
Consequences: Important constraints or tradeoffs.
Source: Responsible document/section or task.
```

Use a full standalone ADR only when a decision needs alternatives, extensive evidence, or migration detail. Keep this file as the index and link the ADR.

## Maintenance rules

1. Never infer acceptance from implementation, a recommendation, or a prototype experiment.
2. Change a proposal to **Accepted** only after explicit owner approval.
3. Do not rewrite historical decisions silently; mark them **Superseded** and reference the replacement.
4. Put full gameplay, state, content, architecture, or roadmap detail in its responsible document and keep only the decision summary here.
5. Update `CURRENT_STATE.md` only through a new audit when implementation evidence changes materially; it is not a target-plan log.
6. Include decision IDs in future task notes when work depends on them.

## Current approval position

On 2026-08-14, the project owner accepted the Game Concept 2.0 system shape recorded by DMCL-022–DMCL-028. DMCL-014 and DMCL-015 remain visible as historical decisions and are superseded by the named replacements. The approval establishes the Village-first Castle MVP, three-axis faction evolution, World/Settlement economy relationship, Level-20 Profession progression, compositional skills, opposed Gambits with defensive resistance, and bounded tactical-stat/damage shape. Exact numeric values and the deferred questions remain unapproved.

The concept approval originally changed intended product direction without claiming implementation or authorizing deployment. The separately accepted DMCL-P26 roadmap amendment and E03-T01 packet activated EPIC 03; accepted E03-T02–T07 work subsequently implemented the approved version-5 Castle/Village foundation and its presentation. E03-T08 is the sole current task.

On 2026-08-14, the project owner accepted DMCL-P26, the complete E03-T01 owner-decision packet recorded as DMCL-P27–DMCL-P39, and version 5 as the next campaign-schema number under DMCL-P40. E03-T05 implemented the accepted pure version-5 target/migration boundary. Accepted E03-T06 makes version 5/registry version 2 the playable application boundary while retaining the version-1 source untouched under DMCL-P31. Accepted E03-T07 adds player-facing presentation and records DMCL-029 without changing any E03 transition policy.

EPIC 01 and EPIC 02 are complete, and EPIC 03 remains current pending its E03-T08 exit gate. DMCL-P01–P13, DMCL-P16–P21, and DMCL-P23–P41 are accepted; DMCL-P14/P15 remain historical superseded proposals, and DMCL-P22's task sequence is superseded by DMCL-P24. No E03-T08 audit finding promotes a deferred gameplay decision.

E02-T02 implemented the original v3-preserving `CampaignState` boundary and dependency-free engine tests authorized by DMCL-P19–P21. DMCL-P23 records the accepted bounded E02-T03 identity policy, DMCL-P24 authorized the accepted E02-T04 transition layer, E02-T05 implemented the accepted concrete selector boundary, and DMCL-P25 authorized the accepted E02-T06 version-4 campaign-seed migration. E02-T07 completed the bounded read-only developer inspector. E02-T08 found no new decision or blocking defect and verified that the implementation satisfies the EPIC 02 exit criteria.

DMCL-P27–DMCL-P41 are implemented through the owner-accepted E03-T02–T07 work: browser-local one-campaign lifecycle, verified Save, timestamp separation, typed recovery, safe registry cutover, deterministic World authority, version-5 migration, Village-first Setup, contextual Dungeon entry, and compatibility isolation. E03-T08 audits those contracts; it introduces no new decision and does not authorize deployment.
