# Dungeon Master & Castle Lords — Roadmap

Status: source of truth for project position, sequencing, and decision gates  
Scope: where the project is, what comes next, and what remains conditional  
Last updated: 2026-08-09

## Purpose and authority

This document answers: **Where are we, and what is next?** It sequences approved direction without inventing mechanics, dates, or commitments.

- Product direction: [GAME_CONCEPT.md](./GAME_CONCEPT.md)
- Structural principles and approval proposals: [ARCHITECTURE.md](./ARCHITECTURE.md)
- Campaign-state ownership: [GAME_STATE.md](./GAME_STATE.md)
- Content extension model: [CONTENT_MODEL.md](./CONTENT_MODEL.md)
- Audited implementation and technical debt: [CURRENT_STATE.md](./CURRENT_STATE.md)

Status labels:

- **Complete** — evidenced in the repository or completed documentation.
- **Current** — the active project stage.
- **Proposed — approval required** — recommended sequence or scope, not yet a commitment.
- **Blocked by decision** — implementation would silently decide an unresolved matter.
- **Later/TBD** — approved concept direction whose scope or order is unresolved.

Detailed gameplay belongs in responsible design documents, not this roadmap. A milestone may approve building a system only after its rules and state consequences are approved.

## Where we are now

### Playable prototype baseline — complete

The current prototype supports this mobile-first flow:

`local player → campaign → hero setup → deterministic dungeon exploration → dungeon-heart claim → placeholder settlement`

It includes a central React state/reducer, versioned browser-local saves, typed hero/skill data, touch/keyboard/pointer dungeon controls, shared game UI, system-dark support, and Sites/Cloudflare delivery infrastructure.

It does **not** yet include meaningful settlement management, a world board, region conquest, supply, tactical combat, executable skill effects, cloud identity/save synchronization, or multiplayer. See `CURRENT_STATE.md` for the exact observed boundary.

### Project-definition baseline — current

The concept and documentation now capture:

- the three connected strategic/management, exploration, and tactical loops;
- central campaign-state ownership;
- modular board and content direction;
- current implementation facts and technical risks;
- explicit unresolved questions rather than invented rules.

`ARCHITECTURE.md`, `GAME_STATE.md`, and `CONTENT_MODEL.md` contain several items labeled **Proposed — approval required**. They are decision material, not approved implementation work until the owner accepts or revises them.

## Immediate next step: approve the foundation

**Current and blocked by decision:** Review the proposed structural principles before application refactoring or major system expansion.

Minimum approval set:

1. Board-module/catalog direction and board lifecycle states.
2. Domain/application/view/infrastructure boundaries and named state transitions.
3. Campaign-state classification, stored-versus-derived policy, and migration discipline.
4. Content identity/catalog/capability principles and TypeScript authoring direction.
5. The next gameplay milestone: deepen the current exploration/settlement slice, begin world strategy, or begin tactical combat.

Exit condition: the accepted decisions are relabeled as approved in their responsible documents, rejected proposals are removed/revised, and the first implementation milestone has an explicitly approved scope.

## Proposed milestone sequence

The sequence below is **Proposed — approval required**. It prioritizes one coherent end-to-end campaign over several disconnected placeholder boards. No dates or effort estimates are approved.

### M0 — Decision and documentation baseline

Status: **Current**

Purpose: establish what future sessions may treat as approved.

Complete:

- audit the actual prototype;
- capture the game concept;
- document architecture, game-state, content, and roadmap boundaries;
- separate established, observed, proposed, and TBD material.

Remaining:

- owner review/approval of proposed principles;
- record which document is authoritative for each accepted decision;
- choose the first post-documentation implementation slice.

Exit condition: major structural principles and the next slice are approved.

### M1 — Stabilize the existing vertical slice

Status: **Proposed — approval required**

Purpose: make player creation, hero setup, dungeon exploration, claiming, and settlement entry a dependable base before adding major boards.

Candidate scope, conditional on the responsible approvals:

- consolidate hero foundation content so views and rules use one definition;
- introduce named, validated operations around setup, movement, discovery, and claiming as those areas change;
- make the board catalog the authoritative integration point if the board-module proposal is approved;
- strengthen save validation/migrations and resolve unfinished-setup persistence and save semantics;
- add focused rule and flow verification for current behavior;
- address accessibility gaps required for the existing interaction surfaces;
- replace misleading starter documentation/metadata only when separately scoped.

This is bounded stabilization, not a general rewrite. The detailed technical-debt inventory remains in `CURRENT_STATE.md`.

Exit condition: the existing playable flow has approved state boundaries, no duplicate authoritative hero rules, meaningful regression coverage, and a documented verification path.

### M2 — Complete one management/exploration feedback loop

Status: **Blocked by gameplay decisions**

Purpose: turn the current settlement placeholder and dungeon claim into the smallest meaningful strategic/management consequence that feeds back into exploration.

Required decisions before implementation:

- the first approved settlement/dungeon/castle management mechanic;
- its resource, time, ownership, and campaign-state rules;
- how it changes a later exploration decision or outcome;
- faction effect, if any, in this slice;
- success/validation criteria.

Possible mechanics named elsewhere—construction, production, population, economy, or supply—remain examples only. Selecting one requires explicit approval.

Exit condition: one approved management decision persists, has a visible consequence in exploration, survives save/load, and uses shared content/state contracts.

### M3 — World strategy, regions, and supply

Status: **Later; blocked by gameplay decisions**

Purpose: connect holdings and exploration through a world-level strategic layer.

Required decisions before implementation:

- world map/grid structure and region identity;
- region discovery/control/conquest state and transitions;
- strategic movement and encounter triggers;
- supply entities, connectivity, consumption, and consequences;
- relationship to campaign time and holdings;
- smallest playable world-loop objective.

Implementation should begin with a narrow vertical slice: a world decision changes exploration/holding conditions, and a resulting outcome returns to world/campaign state.

Exit condition: at least one approved region interaction and supply consequence form a persistent loop across the relevant boards.

### M4 — Tactical combat vertical slice

Status: **Later; blocked by gameplay decisions**

Purpose: add the third major loop as a campaign-connected tactical encounter, not a detached minigame.

Required decisions before implementation:

- unit/party scale, turn structure, movement, actions, targeting, terrain, damage/defeat, and AI boundary;
- which hero attributes/skills have approved executable effects;
- encounter creation and return-to-campaign contract;
- whether an in-progress encounter is resumable;
- smallest representative encounter and outcome.

Exit condition: one encounter can be entered from an approved campaign context, resolved on the tactical board, and return durable consequences to hero/faction/location/resource state.

### M5 — Progression and content breadth

Status: **Later/TBD**

Purpose: expand replayable content through shared definitions and capabilities after the first three-loop vertical slice proves the contracts.

Potential scope only after rules approval:

- executable hero skills and advancement;
- faction asymmetry/progression;
- additional locations, rooms, encounters, units, terrain, buildings, resources, or objectives;
- multi-level dungeon/building structure;
- content validation, localization, assets, or authoring improvements when actual volume requires them.

Exit condition: TBD. Content quantity targets, balance goals, and progression depth are not approved.

### M6 — Durable identity and cross-device campaigns

Status: **Later/TBD**

Purpose: replace or supplement device-local prototype identity/persistence when campaign value or product requirements justify it.

Required decisions:

- player versus authenticated user versus campaign owner;
- one or multiple campaigns;
- cloud source of truth, offline behavior, synchronization/conflicts, export/import, deletion, and migrations;
- access policy and privacy expectations;
- transition path for existing local saves.

Do not activate optional authentication/database scaffolding as a shortcut around these decisions.

Exit condition: TBD; depends on approved product and data requirements.

### M7 — Multiplayer, if approved

Status: **Optional future direction; not committed**

Purpose: add multiplayer only after its intended mode and authority model are approved.

Required decisions:

- cooperative, competitive, asynchronous, or real-time mode;
- participant/campaign ownership;
- authoritative state transitions, synchronization, conflicts, reconnection, cheating, and moderation boundaries;
- which existing rules/state schemas must change.

No current milestone should claim multiplayer readiness merely because rules are deterministic or state is centralized.

Exit condition: TBD.

## Cross-cutting work policy

**Proposed — approval required:** Apply these rules across milestones:

- Build vertical slices that cross content, rules, state, board UI, persistence, and verification.
- Approve a mechanic before adding permanent fields or generic engines for it.
- Introduce abstractions alongside a concrete need; avoid speculative frameworks.
- Preserve and migrate existing saves when feasible; document any intentional incompatibility.
- Keep mobile portrait/touch, accessibility, system-dark behavior, and FS semantics in each board’s acceptance criteria.
- Distinguish registered, enabled, unlocked, and active boards if that architecture proposal is approved.
- Update the responsible source-of-truth document when a decision becomes approved or implementation status changes.

## Near-term candidate task queue

This queue is **Proposed — approval required** and intentionally contains no gameplay-rule invention:

1. Review and approve/revise the foundation proposals across the architecture, state, and content documents.
2. Choose M1 stabilization or a specific gameplay vertical slice as the next implementation milestone.
3. If M1 is approved, define its exact acceptance checks and preserve-current-behavior boundary.
4. Resolve unfinished hero-setup persistence, campaign count, save semantics, and local verification environment when their implementation becomes in scope.
5. Approve the first management/exploration feedback mechanic before designing M2 state or UI.

Items 3–5 must become separate, bounded tasks. This roadmap does not authorize their implementation.

## Definition of milestone readiness

**Proposed — approval required:** A milestone is ready to implement only when:

- its player-visible outcome is explicit;
- affected gameplay rules are approved or clearly labeled experimental;
- content definitions and campaign-state ownership are identified;
- board entry, exit, and cross-board consequences are defined;
- persistence/migration impact is understood;
- mobile/touch/accessibility expectations are stated;
- validation and acceptance evidence are defined;
- unresolved choices that would materially alter the result are closed.

## Open questions requiring approval

1. Confirm the proposed milestone order: foundation → stabilize current slice → management feedback → world/supply → tactical combat → breadth → cloud → optional multiplayer?
2. Should M1 stabilization be the next implementation milestone, or should the next task first design an approved gameplay vertical slice?
3. Which is the first gameplay expansion: settlement/management, world/regions/supply, or tactical combat?
4. What is the first approved management-to-exploration feedback mechanic?
5. Approve the cross-cutting vertical-slice and milestone-readiness policies?
6. Which M1 candidate items are required versus deferred?
7. What save compatibility guarantee applies during the prototype?
8. What verification level is required before a milestone is complete?
9. When should cloud identity/persistence become necessary rather than optional?
10. Is multiplayer merely optional, or must earlier state/rule work preserve a specific multiplayer model?
11. Are milestone dates, effort estimates, or release labels needed now? None are established.
12. Should the roadmap track task IDs/status history, or remain a concise milestone-level source of truth?

