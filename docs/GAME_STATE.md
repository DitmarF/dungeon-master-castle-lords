# Dungeon Master & Castle Lords — Game State

Status: source of truth for runtime-information ownership  
Scope: what belongs to a campaign, what does not, and what exists today  
Last updated: 2026-08-14

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

**Observed:** The current `CampaignState` is schema version 4; `GameSave` remains its serialized compatibility alias. It contains:

- identity and lifecycle: game ID, player ID, campaign seed, created timestamp, updated timestamp;
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

## Accepted EPIC 03 transition contract

**Accepted in E03-T01; implementation is assigned to E03-T02–T07.** The following target rules are authoritative even where the current version-4 runtime has not implemented them yet:

- each local profile has at most one campaign; replacement and profile deletion require explicit confirmation, and the old durable entry remains intact until the candidate write and readback verify;
- `campaign.createdAt` is immutable creation time; `campaign.updatedAt` changes only with campaign truth or stored resume-context changes; `profile.lastPlayedAt` records successful New/Continue entry rather than campaign modification or Save;
- automatic persistence follows successful durable campaign/profile changes; manual Save performs an immediate adapter write plus verified readback, reports success only after both succeed, and changes no campaign fact or timestamp by itself;
- absence is distinct from storage unavailability and from parse, registry/profile/campaign validation, migration, serialization, quota/write, and verification failure;
- failed hydration or migration suppresses automatic persistence and cannot be treated as an empty registry; the original serialized payload remains untouched until an approved decode/migration and verified replacement succeeds;
- a later write failure leaves the current in-memory campaign playable but explicitly unsaved, exposes a bounded retry/recovery action, and does not expose raw platform exceptions to the player;
- unfinished Hero Setup choices remain disposable; valid Setup completion atomically creates the Castle/Hero/Village/World opening and enters Settlement;
- initial campaign availability is Hero, Settlement, and World; Dungeon requires valid regional exploration context, while Combat and Diplomacy await later legal contexts;
- the controlled home ring contains the three approved resource regions plus exactly one introductory Dungeon location, one inert discoverable ruin location, and one terrain-only region;
- World creation derives a domain-separated seed from `campaignSeed` and stores that seed, a generator version, and an authoritative generated snapshot that is not regenerated on ordinary load;
- eligible completed version-4 Castle campaigns use deterministic conversion; version-4 Dungeon-faction campaigns are incompatible and never silently convert to Castle;
- migrated Dungeon `day`, `treasury`, and `settlementClaimed` are legacy prototype metadata only and never strategic Day, Gold/resources, capital/Village ownership, or region control;
- through EPIC 05, Hero totals use the versioned `v4-path-bonus-1` stored compatibility snapshot; EPIC 06 must explicitly migrate or retire it.

Campaign version `5` is accepted as the next campaign-schema number under DMCL-P40 but does not become the current persisted shape until E03-T05 implements and verifies the cutover. Registry version `2` remains conditional: if the registry cutover is required, the accepted target is a verified `dmcl.prototype.registry.v2` candidate while the original version-1 payload remains untouched throughout EPIC 03 with no automatic cleanup.

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

## Current value classification and EPIC 02 evolution

**Current:** `CampaignState`/`GameSave` version 4 is the authoritative campaign payload. `RuntimeState.activeGame` is its application working copy and `GameRegistry.games[playerId]` is the mirrored registry copy that is serialized automatically. The duplication is application coordination, not two independent campaign authorities.

The current v4 payload classifies as follows:

| Values | Classification |
|---|---|
| campaign/player reference, timestamps, campaign seed, active board, completed setup choices, hero position, learned ranks, dungeon counters/seed, discovery, heart outcome, and settlement claim | stored facts, with timestamp semantics still TBD |
| `setupComplete`, calculated hero attributes, the zero-filled skill-record shape, vision radius under current rules, and generated dungeon grid/rooms/tiles/start/heart | stored snapshots or redundant persisted values; preserve until a deliberate migration |
| legal board availability, setup readiness/attribute preview, skill indexes, discovered-cell indexes/counts, and display summaries | derived values |
| skill/board definitions and generator constants/rules | static definitions |
| hydration, selected player, active working copy, and players/game surface | application/session state |
| theme, setup draft, overlays, prompts, notifications, pan/zoom, and gesture state | UI preference or UI-only state |

The field-by-field classification and evidence are recorded in [E02-T01_CORE_ENGINE_CONTRACT_AUDIT.md](./E02-T01_CORE_ENGINE_CONTRACT_AUDIT.md#2-state-value-classification).

**Historical EPIC 02 starting contract:** DMCL-P19–P21 first introduced `CampaignState` as a v3-compatible alias without changing the runtime JSON shape. E02-T06 later performed the approved v4 migration that added only `campaignSeed`. No future calendar, settlement, world, army, combat, or event slices were added.

The campaign continues to reference a player/profile ID without embedding `PlayerProfile`. `GameRegistry`, one-campaign-per-player lookup, profile lifecycle, hydration, theme, and UI state remain separate. Pure transitions and selectors may be extracted incrementally without moving unrelated runtime responsibilities into the campaign.

### E02-T02 implemented boundary

`src/game/campaignState.ts` now owns the pure `CampaignState` contract and its current campaign value types. `GameSave` is a TypeScript alias of `CampaignState`, not a second state shape or a runtime envelope. The version remains `3`; field names, nesting, persisted IDs, timestamps, setup/hero data, generated dungeon snapshot, position, discovery, heart outcome, settlement claim, and active board are unchanged.

`src/game/model.ts` remains a compatibility import surface while separately defining `PlayerProfile`, `GameRegistry`, `RuntimeState`, and `AppView`. `GameRegistry.games` and `RuntimeState.activeGame` now explicitly reference `CampaignState`; they remain persistence/application copies rather than new campaign fields. No migration is introduced because serialization is unchanged, and the existing v2/v3 normalization path is protected by focused Node fixtures.

The E02-T02 implementation did not resolve timestamp semantics, seed-versus-snapshot authority, profile/campaign cardinality, future gameplay schemas, or hidden creation inputs. E02-T03 subsequently added only the bounded identity policy below; E02-T06 later added the campaign-seed policy, while clock semantics remain open.

### E02-T03 implemented identity policy

The current persistent identity types are now explicit without changing serialized data:

- `PlayerId` retains the existing `player-…` convention and identifies one local player profile/registry owner.
- `CampaignId` retains the existing `game-…` convention and identifies one campaign.
- `CampaignState.playerId` remains a reference to the separate profile; it does not embed player data.
- new player/campaign IDs come from an injected `IdSource`; the system adapter uses crypto identity entropy independently from dungeon/gameplay randomness.

`CampaignState` remains version 3 and `GameRegistry` remains version 1. Existing loaded identity strings are preserved exactly, including legacy strings that predate current narrowing; this task adds validation only at new-ID creation boundaries and requires no migration.

Content-definition IDs are not player/campaign IDs. Coordinates and `CellKey` values such as `"3,4"` are spatial/derived keys scoped to the stored dungeon, while `DungeonRoom.id` is a snapshot-local generator ordinal. Neither is a global persistent entity identity. The current hero, settlement outcome, and generated dungeon do not gain manufactured entity IDs in this task.

At this identity-only checkpoint, clock and gameplay-seed isolation remained unresolved. E02-T06 subsequently implemented the separate campaign-seed authority; clock isolation, the broader player/account/owner relationship, multiple campaigns, cloud/global identity, and multiplayer authority remain open.

### E02-T04 implemented transition policy

The version-3 shape and field classifications remain unchanged. E02-T04 changes only who may author current campaign transitions:

- `completeHeroSetup` validates the current incomplete Setup state and existing setup constraints, then creates the stored hero/setup/discovery facts and snapshots;
- `moveHeroInDungeon` validates the current Dungeon context and owns destination, walkability, stored position, discovery, and historical Heart-reached outcome;
- `claimSettlement` validates that the Heart was reached, records the claim fact, and enters Settlement through legal board policy;
- `navigateToAvailableBoard` validates the pure registered/enabled/unlocked board availability before changing the stored resume board.

These pure transitions retain `updatedAt`; application operations in `GameProvider` stamp it only for a successful state change and mirror the result into `RuntimeState.activeGame` and `GameRegistry.games`. Failed transitions return a typed reason and do not produce a replacement campaign. Automatic browser persistence remains the adapter around the registry and no migration is required.

The four migrated board interactions no longer receive unrestricted whole-campaign mutation. Player/profile creation, campaign create/load, save, return, hydration, theme, and UI-only draft/prompt/map state remain outside this transition set. E02-T06 subsequently resolved the campaign-seed boundary; clock semantics remain pending.

### E02-T05 implemented Hero-attribute consistency policy

The accepted E02-T01 classification remains unchanged: `heroClass`, `vocation`, and `freeAttributes` are stored facts, while `hero.attributes` is a version-3 stored snapshot of the current derived total. E02-T05 introduces no schema or save-version change.

`src/game/selectors.ts` is the single calculation authority for current class/vocation bonuses and total Hero attributes. Hero Setup preview reads it, successful setup writes its result into `hero.attributes`, and existing v2/v3 migration normalization recomputes the snapshot from the saved facts. The consistency rule is therefore: current writes and loads refresh the stored snapshot through the same selector; consumers may rely on the normalized snapshot without independently interpreting class or vocation rules. Removing the snapshot or changing its authority remains a separately approved migration decision.

### E02-T06 implemented campaign-seed policy

`CampaignState`/`GameSave` version 4 adds one `campaignSeed` stored fact. It is an unsigned 32-bit integer and is the authoritative deterministic gameplay-random foundation for the campaign. No counters, mutable global RNG state, or combat/loot/world/event streams exist. The version-1 registry container is unchanged.

For a new campaign, the application obtains `campaignSeed` from a dedicated infrastructure entropy source, then passes it explicitly into pure campaign/Dungeon creation. The current initial `dungeon.seed` equals `campaignSeed` because Dungeon generation is the only implemented random system. Identity generation remains a separate source and cannot advance gameplay randomness.

Migration from supported version-2/version-3 saves sets `campaignSeed` to the already-persisted `dungeon.seed`. This is an explicit compatibility assignment, not an attempt to reconstruct campaign history: the stored Dungeon grid, rooms, tiles, start, Heart, Hero position, discovery, Heart-reached state, and settlement claim remain untouched and authoritative. Version-4 normalization also retains the stored Dungeon snapshot. A future generator version/seed-versus-snapshot policy remains open.

### E02-T07 read-only inspection policy

The development-only campaign inspector is a consumer of campaign truth, not a state owner. It reads the current application working copy, derives current Hero attributes through `selectHeroAttributes`, and formats raw JSON directly from that same object. It has no edit/import/transition/storage API and cannot create a competing campaign representation.

Whether the inspector is open and its temporary clipboard result message are UI-only component state. They are not stored in `CampaignState`, `RuntimeState`, `GameRegistry`, theme preference, or browser persistence. Copying seed/JSON changes only the platform clipboard and has no game-state consequence.

### E02-T08 accepted state-boundary verification

The EPIC 02 exit audit confirms that version-4 `CampaignState` remains the only campaign contract and contains only the currently implemented campaign facts and compatibility snapshots. `PlayerProfile`, `GameRegistry`, `RuntimeState`, theme/hydration, and board-local presentation state remain outside it. No empty World, Combat, Army, Event, calendar, or settlement-economy schema was added.

The E02-T01 stored-fact/snapshot/derived/static/session/UI classification remains applicable. `campaignSeed` is the only later stored fact added by the explicit version-4 migration. `hero.attributes` remains a compatibility snapshot refreshed from authoritative setup facts by the single selector authority; the stored Dungeon snapshot remains authoritative for migrated campaigns and is not regenerated. Focused migration tests preserve existing version-2/version-3 Dungeon, position, discovery, Heart, claim, Hero, and identity facts.

This verification introduces no new state decision or save migration. The owner accepted the PASS assessment and EPIC 02 closure on 2026-08-10. The full evidence is recorded in [E02-T08_EPIC_02_EXIT_GATE.md](./E02-T08_EPIC_02_EXIT_GATE.md).

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

Approved future shape includes 20 Hero Levels, 40 allocated attribute points, 20 spendable skill points, Class + Vocation determining one of nine Professions, compositional faction-evolution riders, and distinct Downed/Wounded/Dead states. Exact schemas, curves, executable effects, and balance remain TBD.

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

Strategic time is based on Days, strategic Hero movement uses Travel, and Dungeon exploration uses exploration turns. The existing treasury/day counters do not establish their exact advancement, conversion, economy, or supply rules.

### Tactical encounters and consequences

- an encounter’s durable identity and origin;
- participating campaign entities and relevant starting conditions;
- resolved outcome and consequences returned to the campaign;
- in-progress tactical state only if resumable encounters are approved.

Approved tactical state shape includes squad-scale participants, a hex grid, an initiative queue, and separate Move/AP values. Exact turn data, actions, damage, AI, retreat, recovery, and encounter-resume rules remain TBD.

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

**Observed:** Version 4 stores one campaign seed plus the current Dungeon seed and generated rooms/tiles. For the initial Dungeon in a new campaign the two seeds are equal; migrated campaigns adopt their existing Dungeon seed as the campaign seed without regeneration.

**Accepted:** Any randomness that changes campaign truth must preserve enough authoritative information to resume and migrate safely. Depending on the approved system, that may be a seed plus generator/rule version, the generated result, or both. The choice must be made per system rather than inferred from the current dungeon implementation.

**Implemented for the current system:** New gameplay randomness originates only from explicit seed/state inputs. Infrastructure entropy creates a new campaign seed; pure deterministic helpers consume it. The existing Dungeon snapshot remains authoritative for resume. Future random mechanics must extend this contract only when their responsible Epic defines their state and replay needs.

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

1. What distinguishes local player profile, future authenticated user, campaign owner, faction participant, and future multiplayer participant beyond the accepted one-local-campaign MVP boundary?
2. Should camera/board position resume per campaign, per player, or not at all beyond the accepted stored active-board context?
3. Are tactical encounters resumable; if so, which in-progress combat state is durable?
4. What world, region, holding, conquest, and supply fields implement their approved system shapes beyond the minimum EPIC 03 opening snapshot?
5. How do strategic Days and Travel, exploration turns, and tactical initiative/Move/AP advance or relate? Dungeon day is explicitly not a strategic Day.
6. What are the future cloud-save, offline synchronization, conflict, export/import, and long-term migration guarantees beyond the accepted browser-local recovery contract?
7. Must multiplayer requirements constrain the campaign schema later; if yes, who is authoritative for state transitions?
