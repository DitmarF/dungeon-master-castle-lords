# Dungeon Master & Castle Lords — Roadmap

Status: source of truth for current Epic, exact next task, and decision gates
Last updated: 2026-08-10

## Purpose and authority

This document answers: **Where are we, and what is next?** Product rules live in [GAME_CONCEPT.md](./GAME_CONCEPT.md), implementation evidence in [CURRENT_STATE.md](./CURRENT_STATE.md), and accepted decisions in [DECISIONS.md](./DECISIONS.md).

The approved master roadmap uses **EPIC 00 through EPIC 24**, with Milestone A after EPIC 11. Work follows that sequence and adapts each Epic to the implementation already present; an Epic must not recreate working systems from scratch. The registry below preserves the approved long-range spine. Detailed tasks and exit criteria are added only when an Epic approaches activation.

## Current implementation boundary

The playable prototype is:

`local player → campaign → hero setup → deterministic dungeon exploration → dungeon-heart claim → placeholder settlement`

World strategy, region conquest, supply, meaningful management, tactical combat, executable skill effects, cloud saves, and multiplayer are not implemented. See `CURRENT_STATE.md` for detail.

## Current Epic

### EPIC 02 — Core game engine and state

Status: **Current**

Purpose: establish the shared game-engine and central campaign-state foundations needed by later boards and systems, building on the completed EPIC 01 shell/catalog architecture without introducing unapproved gameplay rules.

E02-T01 audited and reconciled the existing model/provider/rule/storage boundaries. E02-T02 implemented the accepted central campaign boundary and pure-engine test foundation without a broad provider rewrite or save-schema change.

Accepted constraints carried forward include one authoritative campaign state, versioned save compatibility, named validated transitions introduced gradually, stable IDs, domain/application/view/infrastructure boundaries, and no silent gameplay-rule decisions.

## Current Next Task

### E02-T06 — Deterministic campaign RNG foundation

Status: **Next — exactly one**

Goal: introduce the smallest explicit campaign-level deterministic randomness foundation while preserving every existing generated Dungeon snapshot and keeping identity entropy separate from gameplay RNG.

The bounded scope is defined in [E02-T06_DETERMINISTIC_CAMPAIGN_RNG.md](./E02-T06_DETERMINISTIC_CAMPAIGN_RNG.md) and starts from the accepted E02-T05 checkpoint plus the randomness/state policy in the accepted [E02-T01 audit](./E02-T01_CORE_ENGINE_CONTRACT_AUDIT.md). It covers one authoritative campaign seed, an application/infrastructure entropy boundary for new campaigns, deterministic current Dungeon creation from explicit inputs, a compatibility migration that never regenerates existing Dungeon snapshots, and a current-code `Math.random()` audit.

Non-goals include combat, loot, weather, AI, diplomacy, events, World generation, separate random streams/counters, multiplayer simulation, cryptographic gameplay requirements, UI redesign, new dependencies, and deployment.

The project owner accepted E02-T05 on 2026-08-10 and reported all requested tests, verifications, Hero Setup checks, and save/load behavior passing. E02-T06 must preserve loaded Dungeon maps, Hero position, discovery, Heart state, settlement claim, and current gameplay while introducing no speculative random system.

## Epic registry

The sequence column records dependency position, not permission to begin an Epic early. Each Epic receives scoped tasks and acceptance criteria before implementation.

| Epic / milestone | Status | High-level purpose | Sequence position |
|---|---|---|---|
| EPIC 00 — Project contract and development infrastructure | **Complete** | Establish the audit, product and technical contracts, decision log, roadmap, workflow, repository guidance, FS source, and project README. | Foundation |
| EPIC 01 — UI shell and board architecture | **Complete** | Finish and generalize the existing mobile-first shell, FS integration, and modular board foundations. | After EPIC 00 |
| EPIC 02 — Core game engine and state | **Current** | Establish the shared game-engine and central campaign-state foundations needed by later boards and systems. | After EPIC 01 |
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

## EPIC 01 closure

E01-T01 through E01-T07 established and verified:

- deterministic FS-token synchronization with semantic UI and primitive game-color separation;
- one shared shell, status structure, board viewport, navigation, overlay, and notification foundation;
- one typed authoritative catalog resolving Hero, Settlement, World, Dungeon, Combat, and Diplomacy;
- the initial domain-neutral shared game UI primitive library;
- portable bounded verification through accepted DMCL-P18 and a verification-only GitHub Actions workflow;
- owner-reported PASS results for all required desktop, portrait, interaction, accessibility, campaign-regression, and physical-smartphone exit checks.

The project owner accepted E01-T07 and EPIC 01 on 2026-08-09. The matching pushed/Sites checkpoint is completed through the normal workflow without deployment. EPIC 02 is Current; E02-T01 through E02-T05 were accepted on 2026-08-10, and E02-T06 is the exact next task.

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

## Deferred decisions that do not block E02-T06

- exact gameplay formulas, balance, thresholds, costs, and progression values;
- final player/account/cloud/offline/multiplayer authority model;
- unfinished setup and other draft persistence;
- placement of still-unimplemented clock isolation; E02-T06 addresses only the approved campaign gameplay-seed boundary;
- exact effect vocabulary until an approved mechanic needs it;
- localization, mod/content-pack, and remote-content requirements;
- detailed tasks, formulas, readiness criteria, and exit criteria for future Epics; define these through bounded planning before each Epic is activated.
