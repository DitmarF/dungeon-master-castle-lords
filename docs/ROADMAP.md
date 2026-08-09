# Dungeon Master & Castle Lords — Roadmap

Status: source of truth for current Epic, exact next task, and decision gates
Last updated: 2026-08-09

## Purpose and authority

This document answers: **Where are we, and what is next?** Product rules live in [GAME_CONCEPT.md](./GAME_CONCEPT.md), implementation evidence in [CURRENT_STATE.md](./CURRENT_STATE.md), and accepted decisions in [DECISIONS.md](./DECISIONS.md).

The approved master roadmap uses **EPIC 00 through EPIC 24**, with Milestone A after EPIC 11. Work follows that sequence and adapts each Epic to the implementation already present; an Epic must not recreate working systems from scratch. The registry below preserves the approved long-range spine. Detailed tasks and exit criteria are added only when an Epic approaches activation.

## Current implementation boundary

The playable prototype is:

`local player → campaign → hero setup → deterministic dungeon exploration → dungeon-heart claim → placeholder settlement`

World strategy, region conquest, supply, meaningful management, tactical combat, executable skill effects, cloud saves, and multiplayer are not implemented. See `CURRENT_STATE.md` for detail.

## Current Epic

### EPIC 01 — UI shell and board architecture

Status: **Current**

Purpose: finish and generalize the existing mobile-first shell, FS design-system integration, and modular board foundations. `GameShell`, navigation, shared UI, board metadata, dark mode, and responsive styles already exist; EPIC 01 evolves them rather than replacing them.

Approved structural direction includes:

- typed board modules through one authoritative catalog;
- registered, enabled, unlocked, and active board states;
- domain/application/view/infrastructure boundaries;
- central campaign state with named, validated transitions introduced gradually;
- data-driven content and stable IDs;
- mobile portrait/touch-first behavior, SVG visuals, FS tokens, and accessible shared primitives.

## Current Next Task

### E01-T05 — Add complete empty-board scaffold

Status: **Next — exactly one**

Goal: use the accepted board catalog and shared shell to register the complete top-level board family—Hero, Settlement, World, Dungeon, Combat, and Diplomacy—while preserving the real Dungeon and Settlement boards and adding only explicitly empty foundations for the other four.

Expected scope must be defined with [TASK_TEMPLATE.md](./TASK_TEMPLATE.md) before implementation. All six boards must resolve through the authoritative catalog and existing `GameShell`; new scaffolds must remain gameplay-free and temporarily navigable for architecture verification. Portrait navigation must remain usable without inventing gameplay hierarchy or unlock rules.

Non-goals include world/combat/diplomacy mechanics, hero progression changes, settlement economy, new persistence, browser routing, shared primitive expansion, dependency work, and deployment.

E01-T04 was accepted by the project owner on 2026-08-09 by directing continuation to E01-T05. It established one typed authoritative board catalog and state-based board router, centralized Settlement availability, preserved stable IDs and gameplay, and introduced the named ordinary-navigation boundary.

## Epic registry

The sequence column records dependency position, not permission to begin an Epic early. Each Epic receives scoped tasks and acceptance criteria before implementation.

| Epic / milestone | Status | High-level purpose | Sequence position |
|---|---|---|---|
| EPIC 00 — Project contract and development infrastructure | **Complete** | Establish the audit, product and technical contracts, decision log, roadmap, workflow, repository guidance, FS source, and project README. | Foundation |
| EPIC 01 — UI shell and board architecture | **Current** | Finish and generalize the existing mobile-first shell, FS integration, and modular board foundations. | After EPIC 00 |
| EPIC 02 — Core game engine and state | Planned | Establish the shared game-engine and central campaign-state foundations needed by later boards and systems. | After EPIC 01 |
| EPIC 03 — Campaign lifecycle and persistence | Planned | Define and implement the campaign lifecycle and its supported save/load persistence boundary. | After EPIC 02 |
| EPIC 04 — Hero foundation | Planned | Establish the approved hero identity, attributes, and foundational campaign representation. | After EPIC 03 |
| EPIC 05 — Minimal progression framework | Planned | Add the smallest progression framework needed for the first playable loop. | After EPIC 04 |
| EPIC 06 — Calendar and global turn engine | Planned | Establish strategic Days and the global turn/movement structure. | After EPIC 05 |
| EPIC 07 — Minimal settlement economy | Planned | Add the minimum settlement economy needed by the first playable loop. | After EPIC 06 |
| EPIC 08 — Minimal world map | Planned | Introduce the minimum usable world-map board and its campaign integration. | After EPIC 07 |
| EPIC 09 — Region conquest and supply | Planned | Add the approved region-conquest and supply system shapes to the strategic loop. | After EPIC 08 |
| EPIC 10 — Dungeon exploration | Planned | Develop the dungeon exploration loop and its campaign consequences. | After EPIC 09 |
| EPIC 11 — Tactical combat skeleton | Planned | Establish the minimum squad-based tactical combat loop on a hex board. | After EPIC 10 |
| MILESTONE A — First complete playable loop | Planned checkpoint | Demonstrate the first integrated strategic, exploration, and tactical campaign loop. | After EPIC 11; before EPIC 12 |
| EPIC 12 — Army and troop system | Planned | Develop campaign armies and troop content beyond the Milestone A minimum. | After Milestone A |
| EPIC 13 — Items, equipment and spells | Planned | Add reusable item, equipment, and spell content within the established content model. | After EPIC 12 |
| EPIC 14 — Full class/vocation system | Planned | Expand the minimal hero progression into the approved class and vocation structure. | After EPIC 13 |
| EPIC 15 — Faction system and evolution | Planned | Develop the approved faction identities, domains, and evolution structure. | After EPIC 14 |
| EPIC 16 — Prestige hero classes | Planned | Add prestige outcomes that build on class, vocation, and faction progression. | After EPIC 15 |
| EPIC 17 — Dungeon depth | Planned | Expand dungeon content and exploration depth through existing system boundaries. | After EPIC 16 |
| EPIC 18 — Tactical combat depth | Planned | Expand tactical choices and combat content beyond the skeleton. | After EPIC 17 |
| EPIC 19 — Subjects and advanced settlement | Planned | Develop subjects and deeper settlement management. | After EPIC 18 |
| EPIC 20 — Strategic interaction systems | Planned | Expand interactions within the strategic layer using established campaign systems. | After EPIC 19 |
| EPIC 21 — Events and world simulation | Planned | Add campaign events and broader world-state simulation. | After EPIC 20 |
| EPIC 22 — Rival sovereign AI | Planned | Introduce AI-controlled rival sovereign behavior within approved campaign rules. | After EPIC 21 |
| EPIC 23 — Victory and campaign ending | Planned | Implement approved victory families, defeat conditions, and campaign resolution. | After EPIC 22 |
| EPIC 24 — Balancing, UX and production hardening | Planned | Balance approved systems, improve usability, and harden the integrated prototype. | After EPIC 23 |

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

## Deferred decisions that do not block E01-T01

- exact gameplay formulas, balance, thresholds, costs, and progression values;
- final player/account/cloud/offline/multiplayer authority model;
- unfinished setup and other draft persistence;
- exact effect vocabulary until an approved mechanic needs it;
- localization, mod/content-pack, and remote-content requirements;
- detailed tasks, formulas, readiness criteria, and exit criteria for future Epics; define these through bounded planning before each Epic is activated.
