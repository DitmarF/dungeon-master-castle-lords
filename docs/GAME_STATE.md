# Dungeon Master & Castle Lords — Game State

Status: source of truth for runtime-information ownership  
Scope: what belongs to a campaign, what does not, and what exists today  
Last updated: 2026-08-10

## Purpose and authority

This document answers: **What kinds of runtime information belong to a campaign?** It defines ownership categories and the current persisted shape without inventing future gameplay schemas.

- Product intent and major game systems: [GAME_CONCEPT.md](./GAME_CONCEPT.md)
- Structural principles and proposals: [ARCHITECTURE.md](./ARCHITECTURE.md)
- Observed implementation and limitations: [CURRENT_STATE.md](./CURRENT_STATE.md)

Status labels:

- **Established** — required by the approved concept or already-established structure.
- **Observed** — true in the current implementation, but not automatically a permanent product rule.
- **Accepted** — approved state policy.
- **Proposed** — recommended by a bounded task and awaiting explicit owner approval.
- **TBD/Open Question** — unresolved; implementation must not silently decide it.

Gameplay rules belong in `GAME_CONCEPT.md` or a future responsible rules document. This document records state only after the corresponding concept is approved.

## Campaign-state test

**Established:** Information belongs to campaign state when losing it would change the continuing campaign’s truth after changing boards, closing and reopening the game, or loading the save.

Campaign state therefore includes durable player choices, acquired progression, world/location changes, owned or controlled things, resources, exploration knowledge, and resolved consequences. It must be shared across boards through the central game state.

Information normally does **not** belong to campaign state when it is:

- a player/account registry concern shared across campaigns;
- temporary application coordination, such as hydration status;
- a UI preference, such as theme;
- ephemeral presentation state, such as hover, open-sheet, or camera gesture state;
- static content or rule definitions;
- a safely reproducible derived value.

The word “normally” matters: a draft, camera position, notification, or derived value may become durable only through an explicit product decision.

## Runtime ownership categories

| Category | Purpose | Current examples | Campaign-owned? |
|---|---|---|---|
| Player registry | Finds local players and their campaigns | profiles, banner color, last active player | No; currently stored alongside campaigns |
| Campaign truth | Continuing game facts and outcomes | hero, active board, dungeon map/discovery, claim state | Yes |
| Application session | Coordinates the currently running app | hydrated, selected player, players/game view, active in-memory save | No |
| UI preference | Personal presentation choice | system/light/dark theme | No |
| Ephemeral view state | Supports a board without changing campaign truth | open sheets, pan/zoom gesture state, setup form draft today | No by current implementation; some items TBD |
| Static content/rules | Defines what the game permits | skill definitions, board metadata, labels | No |
| Derived state | Recomputed from authoritative inputs | skill indexes, some calculated hero values | Prefer no; exact policy requires approval |
| Platform/service state | External delivery and infrastructure facts | authentication session, hosted resources, sync status | No, though identifiers/revisions may reference a campaign later |

## Current persisted campaign

**Observed:** The current `CampaignState` is schema version 3; `GameSave` remains its serialized compatibility alias. It contains:

- identity and lifecycle: game ID, player ID, created timestamp, updated timestamp;
- navigation/progress: active board ID and whether hero setup is complete;
- completed hero state, or `null` before setup;
- one dungeon state.

### Current hero state

**Observed:** Once setup completes, the save contains:

- faction, class, vocation, and the selected bonus skill;
- the player’s free-attribute allocation;
- calculated total attributes;
- ranks for all defined skills;
- current grid position;
- vision radius.

The exact creation rules are summarized in `CURRENT_STATE.md`. This document does not redefine them.

### Current dungeon state

**Observed:** The save contains:

- level, day, and treasury counters;
- grid dimensions and generation seed;
- generated rooms and tile map;
- start and dungeon-heart positions;
- discovered cells;
- whether the heart was reached;
- whether the settlement was claimed.

This is the implemented prototype state, not an approved final dungeon, economy, time, or settlement schema.

### Current persistence container

**Observed:** `GameRegistry` version 1 contains local player profiles, a games object keyed by player ID, and the last active player ID. The entire registry is serialized to browser `localStorage`.

The active in-memory game is also copied into this registry after updates. One campaign per player, local profiles, automatic browser persistence, and the meanings of `updatedAt`/manual Save are current behavior—not established final product rules.

## Current non-campaign runtime state

**Observed:** These runtime values do not live inside `CampaignState`/`GameSave`:

- storage hydration completion;
- currently selected player;
- whether the app shows the player registry or game;
- the active in-memory campaign reference;
- theme preference and effective system theme;
- open sheets and other component-local interaction state;
- unfinished hero-setup selections.

The application’s player registry is persisted, but it is not campaign-owned. Theme preference uses a separate browser-storage key. Static skill and board definitions live in code rather than saves.

## E02-T01 current-value classification and accepted state contract

**Observed by the current E02-T01 audit:** `GameSave` version 3 is the authoritative campaign payload. `RuntimeState.activeGame` is its application working copy and `GameRegistry.games[playerId]` is the mirrored registry copy that is serialized automatically. The duplication is application coordination and must not become two independent campaign authorities.

The current v3 payload classifies as follows:

| Values | Classification |
|---|---|
| campaign/player reference, timestamps, active board, completed setup choices, hero position, learned ranks, dungeon counters, seed, discovery, heart outcome, and settlement claim | stored facts, with timestamp semantics still TBD |
| `setupComplete`, calculated hero attributes, the zero-filled skill-record shape, vision radius under current rules, and generated dungeon grid/rooms/tiles/start/heart | stored snapshots or redundant persisted values; preserve until a deliberate migration |
| legal board availability, setup readiness/attribute preview, skill indexes, discovered-cell indexes/counts, and display summaries | derived values |
| skill/board definitions and generator constants/rules | static definitions |
| hydration, selected player, active working copy, and players/game surface | application/session state |
| theme, setup draft, overlays, prompts, notifications, pan/zoom, and gesture state | UI preference or UI-only state |

The field-by-field classification and evidence are recorded in [E02-T01_CORE_ENGINE_CONTRACT_AUDIT.md](./E02-T01_CORE_ENGINE_CONTRACT_AUDIT.md#2-state-value-classification).

**Accepted through DMCL-P19–P22 on 2026-08-10:** use `CampaignState` for the pure authoritative campaign contract and retain `GameSave` as the version-3 serialized compatibility name or alias. Preserve the exact current runtime JSON shape for the first implementation task. Do not add future calendar, settlement, world, army, combat, or event slices merely to match a long-term concept.

The campaign continues to reference a player/profile ID without embedding `PlayerProfile`. `GameRegistry`, one-campaign-per-player lookup, profile lifecycle, hydration, theme, and UI state remain separate. Pure transitions and selectors may be extracted incrementally without moving unrelated runtime responsibilities into the campaign.

### E02-T02 implemented boundary

`src/game/campaignState.ts` now owns the pure `CampaignState` contract and its current campaign value types. `GameSave` is a TypeScript alias of `CampaignState`, not a second state shape or a runtime envelope. The version remains `3`; field names, nesting, persisted IDs, timestamps, setup/hero data, generated dungeon snapshot, position, discovery, heart outcome, settlement claim, and active board are unchanged.

`src/game/model.ts` remains a compatibility import surface while separately defining `PlayerProfile`, `GameRegistry`, `RuntimeState`, and `AppView`. `GameRegistry.games` and `RuntimeState.activeGame` now explicitly reference `CampaignState`; they remain persistence/application copies rather than new campaign fields. No migration is introduced because serialization is unchanged, and the existing v2/v3 normalization path is protected by focused Node fixtures.

The E02-T02 implementation did not resolve timestamp semantics, seed-versus-snapshot authority, profile/campaign cardinality, future gameplay schemas, or hidden creation inputs. E02-T03 adds only the bounded identity policy below; clock and gameplay-seed inputs remain later work.

### E02-T03 implemented identity policy

The current persistent identity types are now explicit without changing serialized data:

- `PlayerId` retains the existing `player-…` convention and identifies one local player profile/registry owner.
- `CampaignId` retains the existing `game-…` convention and identifies one campaign.
- `CampaignState.playerId` remains a reference to the separate profile; it does not embed player data.
- new player/campaign IDs come from an injected `IdSource`; the system adapter uses crypto identity entropy independently from dungeon/gameplay randomness.

`CampaignState` remains version 3 and `GameRegistry` remains version 1. Existing loaded identity strings are preserved exactly, including legacy strings that predate current narrowing; this task adds validation only at new-ID creation boundaries and requires no migration.

Content-definition IDs are not player/campaign IDs. Coordinates and `CellKey` values such as `"3,4"` are spatial/derived keys scoped to the stored dungeon, while `DungeonRoom.id` is a snapshot-local generator ordinal. Neither is a global persistent entity identity. The current hero, settlement outcome, and generated dungeon do not gain manufactured entity IDs in this task.

Clock and gameplay-seed isolation remain unresolved by this identity-only task. The broader player/account/owner relationship, multiple campaigns, cloud/global identity, and multiplayer authority also remain open.

## Established future campaign categories

The approved concept requires the central campaign eventually to represent the consequences of the three connected loops. The following are **established categories**, not approved field schemas or mechanics:

### Campaign identity and lifecycle

- stable campaign identity and owner/player relationship;
- save/schema version and lifecycle metadata;
- current playable context or board when resuming.

Campaign count, ownership, timestamps, save slots, branching, and lifecycle states are TBD.

### Hero and faction progression

- durable hero identity/build choices and progression;
- faction identity and any approved faction progression;
- acquired skills, capabilities, equipment, companions, conditions, or other progression only after their rules are approved.

Approved shape includes an approximately 12-level hero target, Class + Vocation leading toward a prestige archetype, the faction branch/stage structure in `GAME_CONCEPT.md`, and distinct Downed/Wounded/Dead states. Exact schemas and balance remain TBD.

No unapproved progression field should be added merely as a placeholder that implies a rule.

### World, regions, and holdings

- persistent world/region state needed for approved conquest and strategic play;
- controlled, discovered, contested, or otherwise changed locations when those states are defined;
- dungeon, castle, settlement, building, and level state that must survive leaving the board;
- approved construction, population, production, or management outcomes.

Region status vocabulary, map hierarchy, ownership model, and holding schema are TBD.

### Exploration

- generated or authored location identity and structure;
- exploration/discovery knowledge;
- entity positions or presence when they must persist;
- objectives, encounters, hazards, rewards, and location changes after their rules are approved.

What regenerates, what is stored, and what is reconstructed from a seed remain TBD.

### Resources, time, and supply

- quantities and commitments that affect continuing campaign decisions;
- supply relationships and consequences once the supply model is approved;
- campaign time, turns, days, or schedules only once their authority and advancement rules are defined.

Strategic time is based on Days, strategic hero travel uses global Movement Points, and dungeon exploration uses exploration turns. The existing treasury/day counters do not establish their exact advancement, conversion, economy, or supply rules.

### Tactical encounters and consequences

- an encounter’s durable identity and origin;
- participating campaign entities and relevant starting conditions;
- resolved outcome and consequences returned to the campaign;
- in-progress tactical state only if resumable encounters are approved.

Approved tactical state shape includes squad-scale participants, a hex grid, an initiative queue, and separate MP/AP values. Exact turn data, actions, damage, AI, retreat, recovery, and encounter-resume rules remain TBD.

## State that should remain outside the campaign

**Established at category level:** Keep the following separate unless explicitly approved otherwise:

- authentication credentials, access tokens, and transport sessions;
- global/player UI preferences;
- build, deployment, and hosting configuration;
- static definitions and presentation copy;
- transient rendering, animation, pointer, and accessibility-control state;
- caches that can be safely rebuilt without changing campaign truth.

Future authenticated user IDs or server revision identifiers may be referenced by campaign records, but credentials themselves must not be campaign data.

## Derived versus stored information

**Observed:** The prototype stores both source choices and some derived hero values, then repairs derived attributes during migration. It stores the complete generated dungeon map as well as its seed.

**Accepted:** For each value, identify one authoritative source and classify the value as:

1. **stored fact** — a choice or outcome that cannot be safely recreated;
2. **stored snapshot** — persisted for resume/performance while remaining reproducible;
3. **derived value** — recalculated from authoritative facts and rule version;
4. **static definition** — shipped content/rules, referenced by stable ID.

Do not persist the same fact in multiple forms without an explicit consistency and migration rule.

## Randomness and reproducibility

**Observed:** The dungeon uses a stored numeric seed and also persists the generated rooms and tiles.

**Accepted:** Any randomness that changes campaign truth must preserve enough authoritative information to resume and migrate safely. Depending on the approved system, that may be a seed plus generator/rule version, the generated result, or both. The choice must be made per system rather than inferred from the current dungeon implementation.

## Change and migration discipline

**Established:** Persisted campaign data is versioned and existing saves require deliberate migration handling.

**Accepted:** Before adding or changing campaign state:

1. link the field to an approved gameplay concept;
2. classify its ownership and authority;
3. define its valid states and transition boundary;
4. decide whether it is stored, derived, or static;
5. define defaulting and migration behavior;
6. verify save/load and relevant deterministic rules.

Implementation must not convert an open gameplay question into a permanent save-schema decision.

## Open questions requiring approval

1. Which draft/session information persists, beginning with unfinished hero setup?
2. Is one campaign per player intentional, or will players have multiple campaigns/save slots?
3. What distinguishes player profile, authenticated user, campaign owner, faction participant, and future multiplayer participant?
4. What are the authoritative save moments and meanings of created, modified, opened, and manually saved timestamps?
5. Should camera/board position resume per campaign, per player, or not at all?
6. Are tactical encounters resumable; if so, which in-progress combat state is durable?
7. For generated locations, what is authoritative: seed/version, generated snapshot, or both?
8. What world, region, holding, conquest, and supply fields implement their approved system shapes once exact rules are defined?
9. How do Days, global hero Movement Points, exploration turns, and tactical initiative/MP/AP advance or convert between one another?
10. What are the cloud-save, offline, synchronization, conflict, export/import, and migration guarantees?
11. Must multiplayer requirements constrain the campaign schema now; if yes, who is authoritative for state transitions?
