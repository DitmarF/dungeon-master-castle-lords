# Dungeon Master & Castle Lords — Decision Log

Status: lightweight architecture and design-decision index  
Scope: accepted decisions, current interim choices, pending proposals, and deferred questions  
Last updated: 2026-08-10

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

These decisions were consolidated into this log on 2026-08-09. Their original approval dates were not separately recorded, so the consolidation date must not be mistaken for the approval date.

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
| DMCL-014 | The faction-development structure is Castle/Humanoid/Light Dominion → Human, Dwarf, or Elf → Domain → Ascension; Dungeon/Monster/Dark Dominion → Goblinoid, Insectoid, or Necronoid → Domain → Ascension. | Structure is approved; exact effects and balance remain TBD. | `GAME_CONCEPT.md` |
| DMCL-015 | Hero progression targets approximately 12 levels; Class + Vocation leads toward a prestige archetype; skill trees use root + 3 branches × 3 tiers. | Progression shape is approved without fixing thresholds or bonuses. | `GAME_CONCEPT.md` |
| DMCL-016 | Strategic play advances in Days and uses global hero Movement Points; dungeon exploration uses exploration turns. | Time/economy shape is approved; exact conversion and costs remain TBD. | `GAME_CONCEPT.md` |
| DMCL-017 | Tactical combat uses squads, a hex grid, an initiative queue, and separate MP/AP economies. | Combat structure is approved; exact rules and balance remain TBD. | `GAME_CONCEPT.md` |
| DMCL-018 | Downed, Wounded, and Dead are distinct hero states; death of the actual sovereign is campaign defeat. | Consequence shape is approved; exact thresholds/recovery remain TBD. | `GAME_CONCEPT.md` |
| DMCL-019 | Dominion, Conquest, and Ascension are the approved victory families. | Exact victory thresholds/resolution remain TBD. | `GAME_CONCEPT.md` |
| DMCL-020 | The authoritative FS token source is `sources/fs.tokens.json`. | UI adapters derive/synchronize from this repository source; adapter details are EPIC 01 work. | `GAME_CONCEPT.md`, `ROADMAP.md` |
| DMCL-021 | The top-level in-campaign board family is Hero, Settlement, World, Dungeon, Combat, and Diplomacy; player/setup remains pre-campaign, and the full Hero board remains distinct from the quick-information `HeroSheet`. | Establish the complete modular family without conflating board surfaces, setup flow, or overlays. | `GAME_CONCEPT.md`, `ARCHITECTURE.md`, `E01-T05_EMPTY_BOARD_SCAFFOLD.md` |
| DMCL-P17 | Generate and commit the existing light/dark FS CSS adapter deterministically from `sources/fs.tokens.json`, keep derived/application CSS handwritten, and generate only the narrow default primitive-color TypeScript projection needed by existing persisted banners. | This removes manual FS-value drift without changing the CSS API, runtime theme bootstrap, visual behavior, dependencies, or stored banner values. | `ARCHITECTURE.md`, `E01-T01_FS_TOKEN_ADAPTER_AUDIT.md`, `E01-T02_FS_TOKEN_SYNCHRONIZATION.md` |
| DMCL-P18 | Retain `npm run install:ci` as the protected ChatGPT Sites/Linux install path; use `npm ci` for local macOS and GitHub Actions; use `npm run verify` as the shared automated quality gate; and treat GitHub Actions Linux as the canonical independent automated checkpoint while keeping rendered/mobile browser acceptance and owner physical-smartphone QA separate. | This makes token, lint, bounded build, artifact, and rendered-HTML checks reproducible across Linux and macOS without weakening the specialized Sites installer; CI remains verification-only. | `ARCHITECTURE.md`, `WORKFLOW.md`, `E01-T07_EPIC_01_EXIT_GATE.md` |

## Observed/interim implementation choices

These entries explain the current code. They are not accepted long-term decisions.

| ID | Current choice | Status/revisit trigger | Evidence |
|---|---|---|---|
| DMCL-I01 | React/Next conventions run through Vinext/Vite on an OpenAI Sites Cloudflare Worker. | Revisit only through an explicit platform decision. | `CURRENT_STATE.md` |
| DMCL-I02 | One React context/reducer still coordinates runtime state, but current playable rule-bearing changes now enter through named validated setup, Dungeon movement, Settlement claim, and navigation operations; the unrestricted whole-campaign updater is no longer exposed. | Continue adding operations only alongside approved real mechanics; broader provider/lifecycle separation remains later bounded work. | `ARCHITECTURE.md`, `GAME_STATE.md`, `E02-T04_NAMED_VALIDATED_TRANSITIONS.md` |
| DMCL-I03 | Player registry and campaigns persist in browser `localStorage`. | Revisit before cloud identity, cross-device saves, valuable campaigns, or multiplayer. | `CURRENT_STATE.md`, `GAME_STATE.md` |
| DMCL-I04 | A local player has at most one campaign, keyed by player ID. | Product rule remains TBD. | `CURRENT_STATE.md`, `GAME_STATE.md` |
| DMCL-I05 | The current save is `GameSave` version 3 inside `GameRegistry` version 1. | Preserve through migrations until explicitly superseded. | `CURRENT_STATE.md`, `GAME_STATE.md` |
| DMCL-I06 | One pure six-board descriptor/availability policy drives legal navigation and one React registry binds components. Dungeon and Settlement are real prototype boards; Hero, World, Combat, and Diplomacy are enabled architectural foundations, and Settlement retains its campaign unlock. | Revisit scaffold availability when each later Epic establishes real entry rules. | `ARCHITECTURE.md`, `E01-T04_TYPED_BOARD_CATALOG.md`, `E01-T05_EMPTY_BOARD_SCAFFOLD.md`, `E02-T04_NAMED_VALIDATED_TRANSITIONS.md` |
| DMCL-I07 | Skill trees are centralized typed content; hero foundation display/rules are distributed and partly duplicated. | Revisit when content consolidation is approved and scoped. | `CURRENT_STATE.md`, `CONTENT_MODEL.md` |
| DMCL-I08 | Game content is authored in TypeScript; no external content loader/schema/editor exists. | TypeScript is accepted for the prototype until a concrete externalization need exists. | `CONTENT_MODEL.md` |
| DMCL-I09 | The dungeon stores both a seed and generated rooms/tiles. | Future seed/snapshot authority is TBD. | `GAME_STATE.md` |
| DMCL-I10 | Unfinished hero setup and most view interaction state are component-local and disposable. | Draft persistence requires a product decision. | `CURRENT_STATE.md`, `GAME_STATE.md` |
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
| DMCL-Q02 | Exact bonuses, costs, units, unlocks, and balance for the approved faction branches/stages. | Setup, management, content, balance. | `GAME_CONCEPT.md` |
| DMCL-Q03 | Region conquest and supply rules. | World board and strategic state. | `GAME_CONCEPT.md`, `GAME_STATE.md` |
| DMCL-Q04 | Exact tactical initiative, MP/AP, squad composition, damage, recovery, AI, and encounter-resume rules. | Combat board, skills, tactical state. | `GAME_CONCEPT.md`, `GAME_STATE.md` |
| DMCL-Q05 | Dungeon/building hierarchy, multiple levels, regeneration, and authored/procedural balance. | Exploration content, state, generation. | `GAME_CONCEPT.md`, `CONTENT_MODEL.md` |
| DMCL-Q06 | Exact hero level/prestige thresholds, effects, equipment, companions, injury/recovery, and balance. | Progression content/state and combat. | `GAME_CONCEPT.md` |
| DMCL-Q07 | First meaningful holding-management mechanic and economy/time consequences. | Future holding-management work. | `GAME_CONCEPT.md` |
| DMCL-Q09 | Player/profile/user/owner/participant relationship and number of campaigns. | Save schema, identity, cloud, multiplayer. | `GAME_STATE.md` |
| DMCL-Q10 | Save semantics, draft persistence, cloud/offline sync, conflict handling, and compatibility guarantee. | Persistence and migrations. | `GAME_STATE.md`, `ROADMAP.md` |
| DMCL-Q11 | Multiplayer mode and authority model, or confirmation that it should not constrain current work. | Architecture and campaign transitions. | `ROADMAP.md` |
| DMCL-Q12 | Content ID/version/deprecation strategy, localization, asset catalog, and mod/remote-content requirements. | Content infrastructure. | `CONTENT_MODEL.md` |

### Resolved deferred entries

| ID | Status | Resolution |
|---|---|---|
| DMCL-Q08 | **Accepted as DMCL-013** | World and tactical boards use hex grids; dungeon/building boards use square grids. |
| DMCL-Q13 | **Resolved by accepted DMCL-P18** | Sites/Linux retains its protected installer; macOS and GitHub Actions use lockfile `npm ci`; all share `npm run verify`; independent CI does not replace rendered/mobile or physical-device acceptance. |
| DMCL-Q14 | **Resolved by accepted DMCL-P16** | Sites/Vinext/Cloudflare remains the delivery constraint unless an explicit later decision replaces it; platform services stay at the edges. |
| DMCL-Q15 | **Resolved by accepted DMCL-P17** | Use deterministic committed generation for the existing FS adapter and the narrow persisted-banner projection; keep derived CSS handwritten and runtime theme handling unchanged. |
| DMCL-Q16 | **Resolved historically; superseded by current roadmap status** | E00-T05 activated EPIC 01 with E01-T01 next. EPIC 01 is now complete; EPIC 02 is Current, E02-T01 through E02-T03 are accepted, and E02-T04 is the exact next task. |

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

EPIC 01 is complete. DMCL-P01–P13, DMCL-P16–P21, and DMCL-P23–P24 are accepted; DMCL-P14/P15 remain historical superseded proposals, and DMCL-P22's task sequence is superseded by DMCL-P24. EPIC 02 is Current, E02-T01 through E02-T03 are accepted, and E02-T04 is active.

E02-T02 implemented the v3-preserving `CampaignState` boundary and dependency-free engine tests authorized by DMCL-P19–P21. DMCL-P23 records the accepted bounded E02-T03 identity policy, and DMCL-P24 authorizes the active E02-T04 transition-layer Candidate. Clock/gameplay-seed isolation remains unimplemented and must be placed explicitly later. E02-T04 requires owner acceptance before it becomes a completed checkpoint or any E02-T05 work begins.
