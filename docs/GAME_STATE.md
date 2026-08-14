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

**Accepted and implemented in E03-T06:** The application-facing `CampaignState` and serialized `GameSave` are schema version 5. The minimum shape contains:

- identity and lifecycle: campaign ID, player ID, campaign seed, immutable creation timestamp, modification/resume timestamp, and active board;
- `foundation: null` before Setup, with no durable Setup draft;
- after Setup, one Castle-owned foundation containing the completed Hero, one Tier-1 capital Village, the authoritative seven-region opening World snapshot, and one regional Dungeon snapshot;
- separate Hero strategic-region and optional exploration-location/cell context.

Version 4 remains a protected legacy compatibility shape used only by strict v2/v3/v4 migration. It is no longer the ordinary new-campaign or application runtime authority.

### Current completed Hero state

**Accepted and implemented in E03-T06:** Once Setup completes, the version-5 Hero contains:

- class, vocation, and the selected bonus skill; root faction authority exists only on the campaign foundation as `castle`;
- the player’s free-attribute allocation;
- positive skill ranks for the accepted Level-1 grants;
- the versioned `v4-path-bonus-1` attribute compatibility snapshot;
- one strategic-region reference and an optional, separately typed regional-exploration context.

The exact creation rules are summarized in `CURRENT_STATE.md`. This document does not redefine them.

### Current regional Dungeon state

**Accepted and implemented in E03-T06:** The completed foundation stores one regional Dungeon snapshot containing:

- level and deterministic seed;
- grid dimensions and generation seed;
- generated rooms and tile map;
- start and dungeon-heart positions;
- discovered cells;
- whether the Heart was reached.

Converted legacy snapshots may additionally retain old Dungeon `day`, `treasury`, and `settlementClaimed` only inside `legacyPrototypeMetadata`. They never authorize strategic Day, Gold, capital ownership, or region control. New Village-first campaigns do not create those legacy fields.

### Current persistence container

**Accepted and implemented in E03-T06:** `GameRegistry` version 2 contains local player profiles, at most one version-5 campaign per profile, and the last active player ID. The preferred container is stored at `dmcl.prototype.registry.v2` through the E03-T02 verified-write contract.

On first successful legacy load, the application strictly decodes and migrates the version-1 source, writes and verifies the version-2 candidate, and leaves the original `dmcl.prototype.registry.v1` bytes untouched. A valid version-2 registry is preferred without consulting version 1. Failed decode, migration, write, or verification never substitutes an empty registry or overwrites the legacy source.

## Accepted EPIC 03 transition contract

**Accepted in E03-T01.** E03-T02 implements the lifecycle/persistence subset below; the opening, World, and gameplay-shape portions remain assigned to E03-T03–T07:

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

Campaign version `5` is the accepted and implemented application schema. E03-T06 activates registry version `2` because the cutover requires a separate verified target container; the original version-1 payload remains untouched throughout EPIC 03 with no automatic cleanup.

### E03-T02 implemented lifecycle and persistence ownership

The application layer now owns lifecycle time and registry transactions through explicit injected boundaries:

- `Clock` supplies profile/campaign lifecycle timestamps; pure creation helpers require an explicit timestamp and no longer construct wall-clock time;
- profile creation sets immutable `PlayerProfile.createdAt`; New/Continue alone update `lastPlayedAt`; selecting a profile does not;
- campaign creation sets immutable `createdAt` and initial `updatedAt`; successful campaign transitions and legal resume-board changes update `updatedAt`; open, return, and manual Save do not;
- hydration stages raw read, parse, registry/profile validation, campaign validation, existing v2/v3/v4 migration, and target validation as distinct typed outcomes;
- a hydration or migration failure leaves the original raw registry untouched and blocks the former automatic empty-registry write;
- legitimate empty storage produces an explicit empty success rather than sharing an error path;
- every automatic durable update and manual Save performs serialization, write, exact readback verification, and best-effort rollback to the previous raw payload if verification fails;
- later non-destructive autosave failure keeps the changed in-memory campaign and marks persistence failed; the Save action is the visible retry;
- profile deletion and campaign replacement remain explicit confirmed actions and change in-memory state only after verified persistence succeeds;
- player-visible errors use bounded messages for unavailable/read/parse/registry/campaign/migration/serialization/quota/write/verification failures and never expose raw exceptions.

The registry-version-2/new-key option in DMCL-P31 remains conditional and is not activated by E03-T02. This task hardens the current version-1 key in place while guaranteeing that failed decode/migration never writes and that failed destructive changes retain the previous durable/in-memory registry.

### E03-T04 implemented World-generation authority

The pure `generateStartingWorld` boundary now implements the explicitly accepted DMCL-P41 generation policy without adding World data to the current version-4 campaign:

- `campaignSeed` remains the root provenance; the effective World seed is 32-bit FNV-1a of `world/home-ring/v1:<campaignSeed>`;
- generator version `1`, the effective World seed, and the generated snapshot types are ready for persistence by E03-T05, but they are not yet stored or loaded;
- the home region is axial `(0,0)` and the six neighbors use the accepted clockwise order beginning east;
- region IDs derive from coordinates, while the one capital, three sites, and two locations use family-specific deterministic instance IDs independent of array positions;
- Fisher–Yates placement consumes a fresh random source created only from the derived World seed and assigns exactly one approved content to each neighbor;
- the result contains the Tier-1 Village capital reference, seven controlled neutral-terrain regions, Food/Wood/Stone sites, the regional Dungeon, and the inert ruin; the one unattached neighbor is derived as terrain-only;
- validation checks metadata, exact topology/order, coordinate and ID uniqueness, control, catalog references, distinct placements, and the one terrain-only remainder.

The returned snapshot is a pure generated value, not current version-4 campaign truth. E03-T05 owns the version-5 target and pure migration result, which stores the generated result as authoritative rather than regenerating it during target normalization. `createDungeonLevel` and existing stored Dungeon snapshots remain unchanged.

### E03-T05 accepted version-5 state and migration boundary

`CampaignStateV5` now defines the accepted minimum target payload independently from the current application-facing version-4 alias:

- identity, campaign seed, immutable creation/best-available modification timestamps, and a bounded Setup/Hero/Settlement/World/Dungeon resume destination remain top-level;
- `foundation: null` is the only pre-Setup form and cannot contain a Hero, draft, Village, World, or retained exploration context;
- a completed foundation owns the sole `castle` root-faction fact, one Hero, one Tier-1 capital Village, the authoritative E03-T04 World snapshot, and one regional Dungeon keyed by `location:regional-dungeon`;
- the target Hero stores valid Class/Vocation/allocation/bonus-skill/positive-rank facts plus the `v4-path-bonus-1` compatibility snapshot; it has no faction field;
- `strategicRegionId` is a World-region reference, while `explorationContext.locationId/cell` retains Dungeon placement without reusing it as a hex coordinate;
- the World stores generator version, effective seed, seven controlled regions, three sites, and two locations; the capital is stored once beside it rather than duplicated inside the World state;
- the regional Dungeon retains level, seed, grid, rooms, tiles, start, Heart, discovery, and Heart history; old day, treasury, and claim survive only in optional `legacyPrototypeMetadata`.

The pure `migrateCampaignToV5` chain strictly validates its source, verifies the registry-owner relationship supplied by the caller, normalizes v2/v3/v4 through the protected v4 compatibility meaning, and then applies the accepted source-class policy. Completed Castle sources generate the opening once and attach the exact retained Dungeon snapshot. Incomplete sources preserve identity/seed/lifecycle with a null foundation. Dungeon-faction sources return a typed recoverable incompatibility and no Castle target.

An already-version-5 payload follows strict target validation and cloning only: it does not call World or Dungeon generation, repair fields, duplicate instances, or change IDs. The migration module imports no React, storage, clock, entropy, browser, or hosting API and performs no write. E03-T06 now consumes this target through the application-facing aliases and version-2 registry while retaining the version-1 source as recovery material.

### E03-T06 accepted Village-first opening and application cutover

The pure `completeVillageFirstHeroSetup` operation validates the complete Setup selection before constructing any campaign fact. One successful call creates the Hero, Castle foundation, Tier-1 capital, generated seven-region snapshot, fresh regional Dungeon snapshot, home-region strategic position, null exploration context, and Settlement resume board as one replacement value. Invalid or repeated completion returns the unchanged source; no partial or duplicate foundation can exist.

Castle is implicit in ordinary Setup and is not a Hero field. Current Class, Vocation, two-point allocation, legal root-or-tier-1 bonus skill, root grants, and `v4-path-bonus-1` snapshot behavior remain unchanged pending EPIC 06. The stable Dungeon faction ID remains only in compatibility content/migration and is not selectable for a new MVP campaign.

The pure version-5 navigation policy makes Hero, Settlement, and World initially available. Dungeon requires a stored regional exploration context; Setup deliberately leaves that context null. Combat and Diplomacy remain disabled until future legal contexts exist. The former Heart claim operation returns `operation-retired`, has no capital or navigation effect, and is absent from the current Dungeon UI.

The provider submits the complete transition through the verified version-2 persistence path. Successful persistence enters the Village-first campaign durably. A later write failure retains the complete in-memory campaign with explicit unsaved feedback and Save retry; it never reports durability or falls back to a partial campaign.

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

**Current:** `CampaignState`/`GameSave` version 5 is the authoritative campaign payload. `RuntimeState.activeGame` is its application working copy and `GameRegistryV2.games[playerId]` is the mirrored registry copy serialized through explicit verified writes. The duplication is application coordination, not two independent campaign authorities.

The current v5 payload classifies as follows:

| Values | Classification |
|---|---|
| campaign/player reference, timestamps, campaign seed, active board, Castle authority, completed setup/build choices, positive skill ranks, capital, World snapshot/metadata, strategic region, optional exploration context, regional Dungeon seed/snapshot/discovery/Heart outcome | stored facts; lifecycle timestamps follow E03-T02 and legacy metadata has no strategic authority |
| `v4-path-bonus-1` Hero attributes and optional converted `legacyPrototypeMetadata` | stored compatibility snapshots; preserved and explicitly isolated until their responsible later migrations |
| legal board availability, Setup readiness/attribute preview, skill indexes, discovered-cell indexes/counts, coordinate adjacency, and display summaries | derived values |
| Hero/Castle/Village/site/location/terrain/board definitions and generator constants/rules | static definitions |
| hydration, selected player, active working copy, and players/game surface | application/session state |
| theme, setup draft, overlays, prompts, notifications, pan/zoom, and gesture state | UI preference or UI-only state |

The field-by-field classification and evidence are recorded in [E02-T01_CORE_ENGINE_CONTRACT_AUDIT.md](./E02-T01_CORE_ENGINE_CONTRACT_AUDIT.md#2-state-value-classification).

**Historical EPIC 02 starting contract:** DMCL-P19–P21 first introduced `CampaignState` as a v3-compatible alias without changing the runtime JSON shape. E02-T06 later performed the approved v4 migration that added only `campaignSeed`. No future calendar, settlement, world, army, combat, or event slices were added.

The campaign continues to reference a player/profile ID without embedding `PlayerProfile`. `GameRegistry`, one-campaign-per-player lookup, profile lifecycle, hydration, theme, and UI state remain separate. Pure transitions and selectors may be extracted incrementally without moving unrelated runtime responsibilities into the campaign.

### E02-T02 implemented boundary

`src/game/campaignState.ts` now owns the pure `CampaignState` contract and its current campaign value types. `GameSave` is a TypeScript alias of `CampaignState`, not a second state shape or a runtime envelope. The version remains `3`; field names, nesting, persisted IDs, timestamps, setup/hero data, generated dungeon snapshot, position, discovery, heart outcome, settlement claim, and active board are unchanged.

`src/game/model.ts` remains a compatibility import surface while separately defining `PlayerProfile`, `GameRegistry`, `RuntimeState`, and `AppView`. `GameRegistry.games` and `RuntimeState.activeGame` now explicitly reference `CampaignState`; they remain persistence/application copies rather than new campaign fields. No migration is introduced because serialization is unchanged, and the existing v2/v3 normalization path is protected by focused Node fixtures.

The E02-T02 implementation did not resolve timestamp semantics, seed-versus-snapshot authority, profile/campaign cardinality, future gameplay schemas, or hidden creation inputs. E02-T03 subsequently added the bounded identity policy, E02-T06 added the campaign-seed policy, and E03-T02 later resolved the browser-local clock/cardinality/lifecycle subset without changing campaign version 4.

### E02-T03 implemented identity policy

The current persistent identity types are now explicit without changing serialized data:

- `PlayerId` retains the existing `player-…` convention and identifies one local player profile/registry owner.
- `CampaignId` retains the existing `game-…` convention and identifies one campaign.
- `CampaignState.playerId` remains a reference to the separate profile; it does not embed player data.
- new player/campaign IDs come from an injected `IdSource`; the system adapter uses crypto identity entropy independently from dungeon/gameplay randomness.

`CampaignState` remains version 3 and `GameRegistry` remains version 1. Existing loaded identity strings are preserved exactly, including legacy strings that predate current narrowing; this task adds validation only at new-ID creation boundaries and requires no migration.

Content-definition IDs are not player/campaign IDs. Coordinates and `CellKey` values such as `"3,4"` are spatial/derived keys scoped to the stored dungeon, while `DungeonRoom.id` is a snapshot-local generator ordinal. Neither is a global persistent entity identity. The current hero, settlement outcome, and generated dungeon do not gain manufactured entity IDs in this task.

At this identity-only checkpoint, clock and gameplay-seed isolation remained unresolved. E02-T06 subsequently implemented the separate campaign-seed authority, and E03-T02 later implemented the application clock. The broader player/account/owner relationship, cloud/global identity, and multiplayer authority remain open beyond the accepted one-local-campaign MVP boundary.

### E02-T04 implemented transition policy

The version-3 shape and field classifications remain unchanged. E02-T04 changes only who may author current campaign transitions:

- `completeHeroSetup` validates the current incomplete Setup state and existing setup constraints, then creates the stored hero/setup/discovery facts and snapshots;
- `moveHeroInDungeon` validates the current Dungeon context and owns destination, walkability, stored position, discovery, and historical Heart-reached outcome;
- `claimSettlement` validates that the Heart was reached, records the claim fact, and enters Settlement through legal board policy;
- `navigateToAvailableBoard` validates the pure registered/enabled/unlocked board availability before changing the stored resume board.

These pure transitions retain `updatedAt`; application operations in `GameProvider` stamp it only for a successful state change and mirror the result into `RuntimeState.activeGame` and `GameRegistry.games`. Failed transitions return a typed reason and do not produce a replacement campaign. Automatic browser persistence remains the adapter around the registry and no migration is required.

The four migrated board interactions no longer receive unrestricted whole-campaign mutation. Player/profile creation, campaign create/load, save, return, hydration, theme, and UI-only draft/prompt/map state remain outside this transition set. E02-T06 subsequently resolved the campaign-seed boundary; E03-T02 later implemented the separate application lifecycle/clock/persistence boundary.

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

**Implemented for the current system:** New gameplay randomness originates only from explicit seed/state inputs. Infrastructure entropy creates a new campaign seed; pure deterministic helpers consume it. The existing Dungeon snapshot remains authoritative for resume. E03-T04 adds a separately derived, domain-labeled World stream and pure starting-World snapshot generator; it never advances or regenerates the Dungeon stream/snapshot. Future random mechanics must extend this contract only when their responsible Epic defines their state and replay needs.

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
