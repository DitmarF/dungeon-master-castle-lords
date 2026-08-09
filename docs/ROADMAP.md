# Dungeon Master & Castle Lords — Roadmap

Status: source of truth for current Epic, exact next task, and decision gates
Last updated: 2026-08-09

## Purpose and authority

This document answers: **Where are we, and what is next?** Product rules live in [GAME_CONCEPT.md](./GAME_CONCEPT.md), implementation evidence in [CURRENT_STATE.md](./CURRENT_STATE.md), and accepted decisions in [DECISIONS.md](./DECISIONS.md).

The approved master roadmap uses **EPIC 00 through EPIC 24**. Work follows that Epic sequence and adapts each Epic to the implementation already present; an Epic must not recreate working systems from scratch.

Only EPIC 00 and EPIC 01 detail is available in the repository material recovered during EPIC 00. EPIC 02–24 retain their approved sequence positions, but their original titles/scopes must be restored from the approved master plan before those Epics are activated. Do not invent replacements.

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

### E01-T01 — Synchronize the FS token source and existing CSS token layer

Status: **Next — exactly one**

Goal: use the restored authoritative [`sources/fs.tokens.json`](../sources/fs.tokens.json) to audit and synchronize the existing CSS token adapter without redesigning the UI or changing gameplay.

Expected scope must be defined with [TASK_TEMPLATE.md](./TASK_TEMPLATE.md) before implementation. It should determine the token mapping/synchronization approach, preserve semantic UI versus primitive game-color roles, verify light/dark behavior, and document any intentional adapter-only tokens.

Non-goals include a Tailwind migration, general visual redesign, gameplay changes, unrelated stylesheet refactoring, dependency installation, and deployment.

## Epic registry

| Epic | Status | Repository-known scope |
|---|---|---|
| EPIC 00 | **Complete — checkpoint pending acceptance** | Project contract: audit, concept, architecture, state, content, decisions, roadmap, workflow, task template, repository guidance, FS source restoration, and README. |
| EPIC 01 | **Current** | UI shell and board architecture; finish/generalize the existing implementation. |
| EPIC 02–24 | **Planned sequence; source detail not present** | Restore each original approved title/scope from the master roadmap before activation. Do not redesign the sequence locally. |

## EPIC 00 closure

E00-T05 reconciles the project contract by:

- accepting DMCL-P01–P13 and DMCL-P16;
- superseding the temporary milestone proposals DMCL-P14/P15 with the Epic roadmap and E01-T01;
- recording approved gameplay-system shapes while leaving exact formulas/balance TBD;
- restoring the authoritative FS token source;
- replacing starter-first repository documentation;
- reducing mandatory reading to core plus task-relevant documents;
- declaring EPIC 01 and exactly one next task.

EPIC 00 becomes fully complete when this candidate is accepted and saved through the non-deployed checkpoint workflow in `WORKFLOW.md`.

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
- EPIC 02–24 title/scope text, which must be restored from the original approved roadmap before use.
