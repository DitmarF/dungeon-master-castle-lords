# Dungeon Master & Castle Lords — Decision Log

Status: lightweight architecture and design-decision index  
Scope: accepted decisions, current interim choices, pending proposals, and deferred questions  
Last updated: 2026-08-09

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

## Observed/interim implementation choices

These entries explain the current code. They are not accepted long-term decisions.

| ID | Current choice | Status/revisit trigger | Evidence |
|---|---|---|---|
| DMCL-I01 | React/Next conventions run through Vinext/Vite on an OpenAI Sites Cloudflare Worker. | Revisit only through an explicit platform decision. | `CURRENT_STATE.md` |
| DMCL-I02 | One React context/reducer coordinates runtime state and exposes generic whole-save updates. | Revisit as rule-bearing systems expand; replacement approach is proposed, not approved. | `CURRENT_STATE.md`, `ARCHITECTURE.md` |
| DMCL-I03 | Player registry and campaigns persist in browser `localStorage`. | Revisit before cloud identity, cross-device saves, valuable campaigns, or multiplayer. | `CURRENT_STATE.md`, `GAME_STATE.md` |
| DMCL-I04 | A local player has at most one campaign, keyed by player ID. | Product rule remains TBD. | `CURRENT_STATE.md`, `GAME_STATE.md` |
| DMCL-I05 | The current save is `GameSave` version 3 inside `GameRegistry` version 1. | Preserve through migrations until explicitly superseded. | `CURRENT_STATE.md`, `GAME_STATE.md` |
| DMCL-I06 | Dungeon, settlement, world, and combat IDs exist; world/combat are disabled, and board rendering remains hard-coded. | Revisit if the board-module proposal is accepted. | `CURRENT_STATE.md`, `ARCHITECTURE.md` |
| DMCL-I07 | Skill trees are centralized typed content; hero foundation display/rules are distributed and partly duplicated. | Revisit when content consolidation is approved and scoped. | `CURRENT_STATE.md`, `CONTENT_MODEL.md` |
| DMCL-I08 | Game content is authored in TypeScript; no external content loader/schema/editor exists. | Authoring format remains a proposal. | `CONTENT_MODEL.md` |
| DMCL-I09 | The dungeon stores both a seed and generated rooms/tiles. | Future seed/snapshot authority is TBD. | `GAME_STATE.md` |
| DMCL-I10 | Unfinished hero setup and most view interaction state are component-local and disposable. | Draft persistence requires a product decision. | `CURRENT_STATE.md`, `GAME_STATE.md` |
| DMCL-I11 | World strategy, conquest, supply, meaningful management, tactical combat, executable skill effects, cloud saves, and multiplayer are not implemented. | Do not report concept scope as shipped functionality. | `CURRENT_STATE.md` |

## Proposals awaiting approval

Approval should update the responsible document and this register in the same documentation change.

| ID | Proposed decision | Source |
|---|---|---|
| DMCL-P01 | Use one typed board-module contract and authoritative board catalog. | `ARCHITECTURE.md` |
| DMCL-P02 | Distinguish board states as registered, enabled, unlocked, and active. | `ARCHITECTURE.md` |
| DMCL-P03 | Adopt explicit domain/application/view/infrastructure boundaries with dependencies directed toward domain rules. | `ARCHITECTURE.md` |
| DMCL-P04 | Gradually replace generic whole-save mutation with named, validated operations as real mechanics are added. | `ARCHITECTURE.md` |
| DMCL-P05 | Adopt stable data IDs, authoritative sources, reproducible generation, and explicit migration planning as formal data policy. | `ARCHITECTURE.md`, `GAME_STATE.md` |
| DMCL-P06 | Classify values as stored facts, stored snapshots, derived values, or static definitions. | `GAME_STATE.md` |
| DMCL-P07 | Preserve enough authoritative randomness information—seed/version, generated result, or both—per system. | `GAME_STATE.md` |
| DMCL-P08 | Use a small common content identity/presentation envelope with family-specific schemas. | `CONTENT_MODEL.md` |
| DMCL-P09 | Reference definitions by stable IDs and compose approved behavior from validated reusable capabilities. | `CONTENT_MODEL.md` |
| DMCL-P10 | Provide one authoritative typed catalog per content family with derived indexes/selectors. | `CONTENT_MODEL.md` |
| DMCL-P11 | Keep TypeScript as the prototype content-authoring format until concrete needs justify externalization. | `CONTENT_MODEL.md` |
| DMCL-P12 | Introduce typed declarative effects only when an approved mechanic provides a concrete vocabulary. | `CONTENT_MODEL.md` |
| DMCL-P13 | Use vertical slices and explicit readiness/exit criteria for milestones. | `ROADMAP.md` |
| DMCL-P14 | Sequence work as foundation approval → existing-slice stabilization → management feedback → world/supply → tactical combat → content breadth → cloud → optional multiplayer. | `ROADMAP.md` |
| DMCL-P15 | Make bounded stabilization of the existing playable slice the next implementation milestone. | `ROADMAP.md` |
| DMCL-P16 | Keep platform services at architectural edges while preserving the current Sites-compatible delivery unless separately replaced. | `ARCHITECTURE.md` |

## Deferred/TBD decision index

The responsible documents contain detailed questions. This index groups the decisions that materially block future work.

| ID | Decision needed | Blocks/affects | Responsible source |
|---|---|---|---|
| DMCL-Q01 | Detailed win, loss, and campaign-end conditions. | Campaign goals and completion. | `GAME_CONCEPT.md` |
| DMCL-Q02 | Mechanical differences and progression for Dungeon versus Castle. | Setup, management, content, balance. | `GAME_CONCEPT.md` |
| DMCL-Q03 | Region conquest and supply rules. | World board and strategic state. | `GAME_CONCEPT.md`, `GAME_STATE.md` |
| DMCL-Q04 | Tactical combat rules, unit scale, and encounter-resume behavior. | Combat board, skills, tactical state. | `GAME_CONCEPT.md`, `GAME_STATE.md` |
| DMCL-Q05 | Dungeon/building hierarchy, multiple levels, regeneration, and authored/procedural balance. | Exploration content, state, generation. | `GAME_CONCEPT.md`, `CONTENT_MODEL.md` |
| DMCL-Q06 | Hero advancement, executable skills, equipment, companions, injury/defeat, and related progression. | Progression content/state and combat. | `GAME_CONCEPT.md` |
| DMCL-Q07 | First meaningful holding-management mechanic and economy/time consequences. | Roadmap M2 and settlement board. | `ROADMAP.md`, `GAME_CONCEPT.md` |
| DMCL-Q08 | Square, hex, or board-specific grid choices. | Future boards and content. | `GAME_CONCEPT.md` |
| DMCL-Q09 | Player/profile/user/owner/participant relationship and number of campaigns. | Save schema, identity, cloud, multiplayer. | `GAME_STATE.md` |
| DMCL-Q10 | Save semantics, draft persistence, cloud/offline sync, conflict handling, and compatibility guarantee. | Persistence and migrations. | `GAME_STATE.md`, `ROADMAP.md` |
| DMCL-Q11 | Multiplayer mode and authority model, or confirmation that it should not constrain current work. | Architecture and campaign transitions. | `ROADMAP.md` |
| DMCL-Q12 | Content ID/version/deprecation strategy, localization, asset catalog, and mod/remote-content requirements. | Content infrastructure. | `CONTENT_MODEL.md` |
| DMCL-Q13 | Required verification gates and supported development environment. | Milestone completion. | `ARCHITECTURE.md`, `ROADMAP.md` |
| DMCL-Q14 | Whether Sites/Vinext/Cloudflare is a continuing constraint or only the current delivery mechanism. | Platform architecture. | `ARCHITECTURE.md` |
| DMCL-Q15 | FS token source/synchronization and long-term styling approach. | Design-system maintenance. | `ARCHITECTURE.md`, `CONTENT_MODEL.md` |
| DMCL-Q16 | Next milestone and first gameplay expansion. | All post-documentation implementation. | `ROADMAP.md` |

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

## Choices currently requiring owner approval

The immediate approval set is:

1. DMCL-P01–P04: board contract, board lifecycle states, structural boundaries, and named operations.
2. DMCL-P05–P07: formal data/state authority and reproducibility policies.
3. DMCL-P08–P12: content identity, capability, catalog, authoring, and effect policies.
4. DMCL-P13–P15: roadmap method, milestone sequence, and M1 as next work.
5. DMCL-P16: platform-edge policy and continuing Sites-compatible delivery assumption.
6. DMCL-Q16: which milestone/gameplay expansion is actually next.

All DMCL-Q entries remain open; approve them only when their decision is needed and sufficient design evidence exists.
