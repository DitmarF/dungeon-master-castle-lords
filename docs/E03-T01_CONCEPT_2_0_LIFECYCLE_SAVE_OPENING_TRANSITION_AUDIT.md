# Dungeon Master & Castle Lords — E03-T01 Concept 2.0 Lifecycle, Save, and Opening-Flow Transition Audit

Status: **Candidate — owner review required; no decision is Accepted by this document**

Audit date: 2026-08-14

Audited branch/commit: `main` at `a821bb4862018ffd2acf0d7287054716b016c583`

Latest recorded accepted Sites checkpoint: version 20; the exact matching version ID is not recorded in the repository

## Activation notice

`DMCL-P26` is still **Proposed**. [ROADMAP.md](./ROADMAP.md) and [MVP_IMPLEMENTATION_PLAN.md](./MVP_IMPLEMENTATION_PLAN.md) say the Game Concept 2.0 roadmap rebase, EPIC 03 activation, and this broader E03-T01 scope require explicit owner acceptance first. The owner's request authorized preparation of this audit Candidate, but this document does not silently accept `DMCL-P26`, activate EPIC 03, or begin E03-T02.

Owner review therefore has two distinct gates:

1. accept or revise `DMCL-P26` and the roadmap rebase;
2. accept or revise the thirteen E03-T01 decisions in this Candidate.

No runtime behavior, save version, registry version, migration, generated World, or decision status changes in this task.

## Task ID and name

`E03-T01 — Audit Concept 2.0 lifecycle, save, and opening-flow transition`

## Goal

Produce one complete owner-reviewable transition contract for moving the current version-4 Dungeon-first prototype toward the Game Concept 2.0 Castle-only, Village-first campaign foundation without changing runtime behavior.

## Context

- Stable inspected source: clean `main`, synchronized with `origin/main`, at `a821bb4862018ffd2acf0d7287054716b016c583`.
- Configured Sites project: `appgprj_6a762ab98b2c819181682817b758d7f8`; D1 and R2 are inactive.
- Current roadmap status: Game Concept 2.0 roadmap rebase Candidate; `DMCL-P26` Proposed; EPIC 03 Proposed Current; E03-T01 Proposed Next.
- Accepted product direction: Game Concept 2.0 and `DMCL-022`–`DMCL-028`.
- Relevant accepted technical decisions: `DMCL-P01`–`DMCL-P13`, `DMCL-P16`–`DMCL-P21`, `DMCL-P23`–`DMCL-P25`.
- Relevant open decisions: `DMCL-Q03`, `DMCL-Q09`, `DMCL-Q10`, plus the thirteen items in this Candidate.
- Primary evidence: `src/game/campaignState.ts`, `model.ts`, `createGame.ts`, `GameProvider.tsx`, `storage.ts`, `navigation.ts`, `transitions.ts`, `generateDungeon.ts`, `selectors.ts`; Start, Setup, Dungeon, Settlement, shell, inspector, and focused engine tests.

## Requirements

- Map the complete current campaign lifecycle, persistence timings, failure paths, migration, replacement, and deletion.
- Classify every version-4 campaign field, including nested Hero, attribute, position, skill, Dungeon grid, room, tile, discovery, objective, counter, and timestamp fields.
- Define safe migration treatment for every required source class without inventing history or changing legacy meanings.
- Compare clean break, conversion, and legacy mode without choosing on the owner's behalf.
- Present a minimum candidate next persisted shape and classify stored facts, compatibility snapshots, derived values, static content, application/session state, and UI-only state.
- Present explicit owner decisions, recommended MVP defaults, exact consequences, bounded E03-T02–T08 contracts, the EPIC 03 exit gate, affected files, and non-goals.

## Constraints

- Documentation and analysis only.
- Preserve current code, runtime behavior, saves, persisted IDs, dependencies, infrastructure, and decision statuses.
- Do not implement migration, cut over a version, generate a World, add a database, add cloud/authentication/multiplayer, save a Sites version, deploy, commit, or push.
- Do not reinterpret Dungeon `day` as strategic Day, Dungeon `treasury` as strategic Gold, or `settlementClaimed` as ownership/existence of the capital Village.
- Never silently convert a Dungeon-faction campaign into Castle.

## Non-goals

- Economy yields, stockpiles, Roads, connection/supply, construction, project queues, production, or strategic Day resolution.
- Population, units, armies, encounters, Combat, Gambits, diplomacy, events, threats, or faction-evolution effects.
- Hero levels, XP, Profession trees, equipment, injury, respecialization, or final attribute rules.
- A general entity system, content loader, generic effect engine, state-management replacement, cloud repository, database, or server authority.
- Full World size, later-region generation, conquest, control-loss, hostile access, or future progression state.
- Changing the current Dungeon generator or regenerating any retained Dungeon snapshot.

## Acceptance criteria

- [x] Current lifecycle and every required success/failure path are mapped from repository evidence.
- [x] Every version-4 field has exactly one transition disposition.
- [x] Required migration classes and clean-break/conversion/legacy alternatives are explicit.
- [x] No Dungeon-faction campaign is silently converted and no old counter/claim is reinterpreted.
- [x] The candidate persisted shape is limited to EPIC 03 opening and compatibility needs.
- [x] Stored, compatibility-snapshot, derived, static, session, and UI-only categories are explicit.
- [x] World seed/generator/snapshot authority has a recommendation, not an Accepted decision.
- [x] All thirteen owner decisions include current behavior, options, trade-offs, a recommended MVP default, and exact consequences.
- [x] E03-T02–T08 are bounded with dependencies, files/systems, requirements, non-goals, acceptance, verification, and owner actions.
- [x] The EPIC 03 exit gate, affected-file map, and explicit non-goals are present.
- [x] No runtime or authoritative decision document changed.

## 1. Current lifecycle map

### 1.1 Authority and persistence topology

```text
localStorage key dmcl.prototype.registry.v1
  → gameStorage.read()
  → shallow registry guard
  → migrateLegacyGame() for every games[playerId]
  → GameProvider hydration
  → RuntimeState.registry + selected player
  → activeGame working copy when opened
  → reducer mirrors accepted changes to registry.games[playerId]
  → automatic gameStorage.write() after every hydrated registry change
```

`CampaignState`/`GameSave` version 4 is campaign truth. `RuntimeState.activeGame` and `GameRegistry.games[playerId]` are synchronized application copies, not separate campaigns. `GameRegistry` version 1 and `PlayerProfile` are adjacent persisted lifecycle state. Setup drafts and interaction state are component-local.

### 1.2 End-to-end current flow

| Stage | Current trigger and behavior | Persistence/timestamp effect | Current risk or transition requirement |
|---|---|---|---|
| Initial hydration | `GameProvider` calls `gameStorage.read()` once. Missing storage yields an empty registry. A superficially valid registry is migrated campaign by campaign. | Hydration sets `hydrated`; the automatic effect immediately writes the hydrated registry. | Read, parse, validation, and migration outcomes are not distinguished. A destructive fallback may be written over the source. |
| Malformed registry | JSON parse failure, registry-guard failure, migration throw, or browser read failure returns `EMPTY_REGISTRY`. | The post-hydration automatic write can replace malformed JSON with an empty valid registry. | Source is silently lost when the later write succeeds. |
| Create player | Name is validated; `createPlayerProfile` creates a typed ID, timestamps `createdAt`, and sets `lastPlayedAt: null`. | Registry changes and autosaves. | Write failure is swallowed; UI behaves as if creation persisted. |
| Select player | Reducer changes `selectedPlayerId` and `lastActivePlayerId`. | Registry autosaves; no profile/campaign timestamp changes. | Selection durability failure is silent. |
| New campaign without an existing save | `createNewGame` creates a new campaign ID and campaign seed, immediately generates one Dungeon snapshot, sets Setup active, and passes it to `openGame`. | `openGame` overwrites `updatedAt` with now, sets profile `lastPlayedAt`, installs `games[playerId]`, and autosaves. | The new campaign is already Dungeon-shaped before Setup. Save success is not verified. |
| New campaign with an existing save | Start UI asks for replacement confirmation; confirmation calls the same new-game path. | The registry entry is replaced in memory immediately, then autosaved. | Old campaign is discarded before durable replacement is confirmed. Failed writes create memory/storage divergence. |
| Setup | Faction, Class, Vocation, two free points, and bonus skill live only in `SetupBoard` component state. | No campaign transition or autosave occurs while editing. | Leaving/reloading loses the draft; the empty campaign remains. |
| Return during Setup | `returnToPlayers` stamps the incomplete campaign `updatedAt`, clears `activeGame`, mirrors it, and autosaves. | `updatedAt` changes despite no campaign-truth change; Setup draft is lost. | Timestamp means activity, not modification. |
| Complete Setup | Pure transition validates the current two-faction Setup, writes Hero/build/snapshots, initializes discovery, and enters Dungeon. Provider stamps `updatedAt`. | Registry mirror autosaves. | Target concept requires Castle-only Setup and atomic Village/home-ring creation instead. |
| Campaign transitions | Dungeon movement/discovery/Heart, Settlement claim, and legal board navigation use pure transitions. Provider stamps successful changes. | Every successful state change autosaves. | Board navigation changes `updatedAt`; failures do not. |
| Manual Save | Shell calls `saveGame`; provider only stamps `updatedAt` and mirrors the same campaign. Shell displays “Campaign saved.” | The same automatic write mechanism runs. | Save feedback is shown regardless of storage failure. Manual Save is reassurance/timestamping, not a distinct verified durability boundary. |
| Return after Setup | Provider stamps `updatedAt`, mirrors the campaign, clears the active working copy, and shows players. | Registry autosaves. | Merely returning counts as campaign modification. |
| Continue/load | Start calls `loadGame`; `openGame` copies the stored campaign into `activeGame`, stamps `updatedAt`, touches profile `lastPlayedAt`, and autosaves. | Opening alone rewrites both campaign and profile timestamps. | A read-only open mutates the campaign. |
| Active-board repair | `GameApp` resolves an invalid/locked active board and requests navigation to the first available board. | Successful repair is stamped and autosaved. | Current fallback order starts at Hero; target availability differs. |
| v2/v3 migration | A structured v2/v3 with `dungeon.tiles` adopts `dungeon.seed` as `campaignSeed`, retains the Dungeon snapshot/progress, normalizes bonus skill, attributes, and skill ranks, and becomes v4. | The hydrated v4 result is automatically written. | Validation is shallow; normalization mutates stored shape on read; source v2/v3 payload is not retained. |
| v4 normalization | A structured v4 follows the same path; valid `campaignSeed` is retained, otherwise `dungeon.seed` is used. Hero snapshot normalization still occurs. | Normalized v4 is automatically written. | No exact schema validation; invalid nested fields may pass through. |
| Less-structured campaign object | Migration creates a fresh v4 campaign/Dungeon, retaining only optional ID/player/timestamps and Dungeon level/day/treasury. | Fresh fallback is autosaved. | Silent replacement invents a new campaign and can destroy the source. |
| Non-object campaign value | Migration creates a completely fresh v4 campaign. | Fresh fallback is autosaved. | Same destructive silent fallback. |
| Delete player | Confirmation removes the profile and `games[playerId]`; selection falls back to the first player. | Registry autosaves. | UI calls deletion permanent even when the storage write fails; no campaign-only deletion exists. |
| Storage write failure | `localStorage.setItem` exceptions are caught and ignored. | No result reaches application/UI; in-memory session continues. | Autosave/manual Save/replacement/deletion can all report or imply success falsely. |

### 1.3 Current invariants and gaps

- One campaign per profile is enforced by `games[playerId]`; it is interim, not accepted product policy.
- A profile deletion cascades to its campaign. There is no campaign-only Delete action.
- `createdAt` is generated once but is not formally validated or protected by lifecycle policy.
- `updatedAt` currently means “last opened, saved, navigated, transitioned, or returned,” not “campaign truth last changed.”
- `lastPlayedAt` currently means “last campaign opened/created,” not last actual input, save, or return.
- The registry guard validates only container version, `players` array presence, and non-null object `games`.
- Storage read/write results have no typed error channel.
- Hydration enables an immediate write even after fallback, so corrupt data can be overwritten without consent.
- There are no focused storage-adapter/lifecycle tests; current engine tests cover campaign/migration rules but not browser write failure or reducer lifecycle semantics.

## 2. Complete version-4 field classification

The disposition column is the transition classification requested for Concept 2.0. Every field has exactly one primary disposition: **preserve**, **relocate**, **derive/recompute**, **retire**, or **explicit owner decision required**. “Preserve” does not mean keep the same nesting; “relocate” is used when the fact survives but its owner/context must change.

### 2.1 Campaign top level

| v4 field | Current meaning | Disposition | Candidate treatment and risk |
|---|---|---|---|
| `version` | Campaign schema discriminator, exactly `4`. | explicit owner decision required | `5` is the natural next number only if an accepted persisted-shape cutover follows. Do not change it for documentation or pre-allocate later schemas. |
| `id` | Stable campaign identity. | preserve | Retain exact string for supported conversions; new campaigns keep current `game-…` creation policy. |
| `playerId` | Reference to separate local profile. | preserve | Retain exact reference; do not embed profile data. Validate registry/profile relationship before migration. |
| `campaignSeed` | Unsigned 32-bit campaign RNG authority; equals initial Dungeon seed today. | preserve | Keep as root deterministic provenance. World uses a domain-separated derived seed so legacy Dungeon sequence does not change. |
| `createdAt` | Creation timestamp. | explicit owner decision required | Field survives, but semantics/validation/immutability require E03-D03. |
| `updatedAt` | Mixed opened/modified/saved/returned timestamp. | explicit owner decision required | Field survives only with newly approved semantics; old value may be preserved as best available legacy modification metadata. |
| `activeBoardId` | Resumable current board, including `setup`. | relocate | Keep as persistence resume metadata, validate against target context/availability, and map unsupported legacy destinations explicitly. |
| `setupComplete` | Redundant completion flag paired with `hero !== null`. | derive/recompute | Derive target readiness from required Hero + Castle + capital + World foundation. Decoder may read the v4 flag for classification but candidate state need not store it. |
| `hero` nullability | Whether completed Setup produced a Hero. | preserve | `null` means Setup incomplete; completed Hero facts migrate subject to faction policy. |
| `dungeon` | One embedded campaign-global Dungeon. | relocate | Move under a regional Dungeon location; retain its authoritative snapshot/progress without making it the capital source. |

### 2.2 Completed Hero

| v4 field | Current meaning | Disposition | Candidate treatment and risk |
|---|---|---|---|
| `hero.faction` | Hero-level choice of `dungeon` or `castle`. | relocate | Castle becomes campaign/root-faction authority, not a Hero attribute. `dungeon` triggers incompatible-campaign policy; it is never rewritten to `castle`. |
| `hero.heroClass` | Stable selected Class ID. | preserve | Retain valid Fighter/Ranger/Mage ID. Invalid references are validation failures, not guessed replacements. |
| `hero.vocation` | Stable selected Vocation ID. | preserve | Retain valid General/Spy/Diplomat ID. |
| `hero.freeAttributes.str` | Allocated Strength points. | preserve | Preserve exact valid allocation fact. |
| `hero.freeAttributes.agy` | Allocated Agility points. | preserve | Preserve exact valid allocation fact. |
| `hero.freeAttributes.per` | Allocated Perception points. | preserve | Preserve exact valid allocation fact. |
| `hero.freeAttributes.int` | Allocated Intellect points. | preserve | Preserve exact valid allocation fact. |
| `hero.freeAttributes.cha` | Allocated Charisma points. | preserve | Preserve exact valid allocation fact. |
| `hero.freeAttributes.lead` | Allocated Leadership points. | preserve | Preserve exact valid allocation fact. |
| `hero.bonusSkill` | Selected Setup skill advance. | preserve | Preserve valid stable Skill ID. Invalid reference must be handled by an explicit compatibility rule; current class-root fallback is not silently expanded. |
| `hero.attributes.str` | Calculated total Strength snapshot. | explicit owner decision required | Temporary compatibility policy is E03-D13; it is not final EPIC 06 authority. Same treatment applies to all six totals. |
| `hero.attributes.agy` | Calculated total Agility snapshot. | explicit owner decision required | See E03-D13. |
| `hero.attributes.per` | Calculated total Perception snapshot. | explicit owner decision required | See E03-D13. |
| `hero.attributes.int` | Calculated total Intellect snapshot. | explicit owner decision required | See E03-D13. |
| `hero.attributes.cha` | Calculated total Charisma snapshot. | explicit owner decision required | See E03-D13. |
| `hero.attributes.lead` | Calculated total Leadership snapshot. | explicit owner decision required | See E03-D13. |
| `hero.skills.<valid SkillId>` positive rank | Learned/granted current build fact for each of the 60 stable definitions. | preserve | Preserve every valid positive integer rank. Do not add Profession/effect state. Validate rank shape against the current compatibility catalog. |
| `hero.skills.<valid SkillId>` zero/missing entry | Complete zero-filled catalog snapshot. | derive/recompute | Store only meaningful ranks or normalize a compatibility record from the catalog; zero membership is static/derived, not campaign history. |
| `hero.skills.<unknown SkillId>` | Stale/invalid content reference. | explicit owner decision required | Reject, retain in quarantined source, or map only through an explicit alias. Never silently drop an actually learned unknown rank without policy. |
| `hero.position.x` | X coordinate inside the embedded Dungeon. | relocate | Move to exploration context for the retained regional Dungeon; never use as World hex coordinate. |
| `hero.position.y` | Y coordinate inside the embedded Dungeon. | relocate | Same as X. |
| `hero.visionRadius` | Stored value initialized to 1; affects discovery; no current transition changes it. | derive/recompute | Derive from the temporary exploration rule for valid current saves. Nonstandard legacy values require validation/compatibility handling rather than becoming progression. |

### 2.3 Dungeon snapshot and progress

| v4 field | Current meaning | Disposition | Candidate treatment and risk |
|---|---|---|---|
| `dungeon.level` | Prototype Dungeon level number. | preserve | Retain inside the regional Dungeon snapshot; it is not Hero Level or Settlement Tier. Do not expand hierarchy. |
| `dungeon.day` | Prototype Dungeon counter displayed as Day. | relocate | Preserve only as explicitly labeled legacy Dungeon metadata if owner approves; never strategic Day. See E03-D12. |
| `dungeon.treasury` | Prototype Dungeon counter displayed as Gold. | relocate | Preserve only as explicitly labeled legacy Dungeon metadata if owner approves; never strategic Gold/stockpile. See E03-D12. |
| `dungeon.grid.columns` | Stored generated-grid width. | preserve | Retain with authoritative snapshot; validate rows/tiles/positions consistently. |
| `dungeon.grid.rows` | Stored generated-grid height. | preserve | Retain with authoritative snapshot. |
| `dungeon.seed` | Dungeon generation provenance. | preserve | Retain exact value. For v2/v3 it also supplies `campaignSeed`; do not regenerate snapshot. |
| `dungeon.rooms[]` | Generated room snapshot. | preserve | Retain order and every room record exactly after validation. |
| `dungeon.rooms[].id` | Snapshot-local room ordinal. | preserve | Keep snapshot-local; do not promote to a global entity ID. |
| `dungeon.rooms[].x` | Room origin X. | preserve | Retain and validate within grid. |
| `dungeon.rooms[].y` | Room origin Y. | preserve | Retain and validate within grid. |
| `dungeon.rooms[].width` | Room width. | preserve | Retain and validate positive/in bounds. |
| `dungeon.rooms[].height` | Room height. | preserve | Retain and validate positive/in bounds. |
| `dungeon.tiles[]` | Row strings forming the authoritative generated map. | preserve | Retain byte-for-byte for supported snapshots; validate row count/length/tile vocabulary before use. |
| `dungeon.start.x` | Snapshot start cell X. | preserve | Retain; validate in bounds/walkable. |
| `dungeon.start.y` | Snapshot start cell Y. | preserve | Retain; validate in bounds/walkable. |
| `dungeon.heart.x` | Snapshot Heart cell X. | preserve | Retain; validate in bounds/walkable. |
| `dungeon.heart.y` | Snapshot Heart cell Y. | preserve | Retain; validate in bounds/walkable. |
| `dungeon.discovered[]` | Durable discovered cell keys (`"x,y"`). | preserve | Retain valid unique keys. Invalid/out-of-bounds keys are validation errors; order is not gameplay authority. |
| `dungeon.heartReached` | Historical objective-reached fact. | preserve | Retain as regional Dungeon progress; it does not imply strategic ownership or capital creation. |
| `dungeon.settlementClaimed` | Historical prototype claim/unlock fact. | relocate | Retain only as explicitly named legacy Dungeon outcome if approved. It never creates or owns the Village and never unlocks Settlement in target policy. See E03-D12. |

### 2.4 Adjacent persisted container/profile fields

These are not v4 campaign fields, but lifecycle decisions cannot be complete without them.

| Current field | Classification for EPIC 03 | Candidate treatment |
|---|---|---|
| `GameRegistry.version` | explicit owner decision required | Registry version 2/new key is recommended only if E03-D05 is accepted. Campaign version and container version remain separate. |
| `players[]` | preserve | Validate each profile; do not embed profiles in campaigns. |
| `PlayerProfile.id` | preserve | Stable local profile identity. |
| `PlayerProfile.name` | preserve | Profile fact; validate current length/uniqueness rules at creation, not by rewriting existing names. |
| `PlayerProfile.bannerColor` | preserve | Presentation identity using current persisted primitive value. |
| `PlayerProfile.createdAt` | explicit owner decision required | Preserve and define immutable profile-creation semantics separately from campaign timestamps. |
| `PlayerProfile.lastPlayedAt` | explicit owner decision required | Define through E03-D03; do not mirror `updatedAt`. |
| `games[playerId]` keying | explicit owner decision required | Implements one campaign per profile; E03-D01 decides whether it remains. |
| `lastActivePlayerId` | preserve | Registry convenience fact; validate that it references an existing profile, otherwise derive fallback without mutating campaigns. |
| raw serialized registry | explicit owner decision required | E03-D04/D05 decide retention, recovery, and cutover behavior. |

## 3. Migration matrix

No row is authorized until its referenced owner decisions are accepted.

| Source class | Source meaning | Safely preserved facts | Facts that cannot be reinterpreted | Deterministic generation required | Expected user-visible behavior | Source-payload preservation | Compatibility risks |
|---|---|---|---|---|---|---|---|
| 1. v4 before completed Setup | Campaign/profile IDs, seed, timestamps, initial Dungeon snapshot; no completed Hero and no durable draft. | IDs, player reference, campaign seed, created metadata; raw Dungeon snapshot may be retained as legacy input or retired by policy. | No faction/Class/Vocation/attributes/skill/draft can be inferred. Pre-generated Dungeon does not prove an entered location. | Generate target home region, six neighbors, capital, sites, and starting location only when Setup completes; do not generate from an imagined draft. | Continue opens Castle-only Setup with blank disposable choices; same campaign ID/seed. | Keep raw v4 until target write verifies. | Current v4 already consumed Dungeon RNG; World domain separation must prevent sequence coupling. |
| 2. completed v4 Castle campaign | A Castle Hero completed current Setup and may have explored/claimed the embedded Dungeon. | Campaign/profile IDs, seed, timestamps, Class, Vocation, free allocation, valid skill facts, compatibility totals, full Dungeon snapshot/progress/position. | Old claim does not create capital; old active board does not prove World position; old counters are not strategic. | Deterministically create target Village/home ring; attach retained Dungeon to the approved ring location without regenerating it. | Recommended conversion: resume on the approved legal board, show preserved Hero/Dungeon facts and a newly initialized Village/home ring. | Keep exact source until v5/container write verifies; retain v1 backup per E03-D05 recommendation. | Choosing placement/strategic position creates new opening defaults, not recovered history; must be documented and idempotent. |
| 3. completed v4 Dungeon campaign | A playable prototype faction explicitly chosen as Dungeon. | Entire source can be retained as legacy data; IDs/seed remain identifiable. | Faction cannot become Castle; capital/Village/territory cannot be inferred. | None unless owner explicitly starts a separate new Castle campaign. | Show an incompatibility/legacy notice. Recommended MVP: block conversion and offer explicit new Castle start/replacement after confirmation. | Mandatory; never overwrite source during detection or before confirmed replacement write. | Legacy-mode maintenance cost; clean break loses playable continuation; conversion violates concept and player choice. |
| 4. supported v2 campaign | Structured v2 payload with stored Dungeon snapshot; current code normalizes through v4. | All facts proven by the current protected v2→v4 fixture, including exact Dungeon result/progress, Hero position, IDs, timestamps, and valid build facts. | Missing campaign seed cannot be independently reconstructed beyond accepted adoption of `dungeon.seed`; no World history exists. | First normalize purely to v4 using `dungeon.seed`, then apply the approved v4 class policy and deterministic World generation. | Same outcome as equivalent v4 Castle/Dungeon/incomplete classification; no intermediate UI. | Preserve original v2 raw payload until full final target write verifies, not merely until v4 in-memory normalization. | Chained migration must be deterministic/idempotent and must not auto-save an intermediate v4. |
| 5. supported v3 campaign | Structured v3 payload with stored Dungeon snapshot; same current compatibility contract as v2. | Same protected facts as v2. | Same non-reinterpretation boundaries as v2. | Pure v3→v4 normalization, then approved v4→target path. | Same class-specific result as v4. | Preserve original v3 raw payload until final success. | Same chain/idempotence risk; current normalization recomputes attributes/skill record. |
| 6. malformed registry | JSON cannot parse or container/profile/game relationships fail strict validation. | Raw source string only until a recovery path proves structured facts. | Nothing may be treated as a valid campaign/profile without successful decoding. | None automatically. | Visible recoverable error with retry and explicit reset/new-start action; app must not claim “no saves” silently. | Mandatory exact raw retention; no autosave over source. | Browser quota may prevent backup/copy; UI must distinguish unreadable source from no data. |
| 7. malformed campaign | Container is readable but one campaign is invalid/inconsistent. | Other independently valid profiles/campaigns; exact invalid campaign raw/object for recovery. | Invalid nested values, unknown IDs, impossible grid/positions, or contradictory readiness cannot be guessed. | None automatically. | Isolate the affected profile/campaign, show a recoverable incompatibility error, allow unaffected entries to load. | Preserve whole original registry plus invalid campaign source until owner-authorized replacement. | Partial registry recovery must not reorder, drop, or auto-save away invalid entries. |
| 8. retained Dungeon snapshot | Valid generated map plus discovery, Heart, and exploration position. | Seed, dimensions, rooms, tiles, start/Heart, discovered, Heart history, current exploration cell, Dungeon level. | Snapshot does not establish World placement, generator version, strategic time, strategic wealth, or capital. | Generate only regional attachment/ID/context; never regenerate rooms/tiles/discovery. | Dungeon appears as a regional location; resume exploration only when active/valid context says so. | Keep original snapshot exact through cutover and tests. | New World generator changes must not affect snapshot; location attachment must be stable across repeated migration. |
| 9. old `settlementClaimed` | Historical result of claiming the Dungeon Heart; currently unlocks Settlement. | The boolean as a legacy Dungeon outcome if E03-D12 accepts retention. | It cannot mean capital exists, region controlled, Village owned, or target Settlement unlocked. | None. | No strategic ownership/availability change. It may appear only in legacy/debug history. | Preserve raw source even if candidate target retires the field. | Accidental reuse in navigation would recreate Dungeon-first behavior. |
| 10. old Dungeon `day`/`treasury` | Prototype counters with no authoritative strategic advancement/economy rules. | Exact numeric values only as explicitly labeled legacy Dungeon metadata if approved. | Never strategic Day, Gold, stockpile, production, or starting resources. | None. | Hidden from strategic status; optional legacy/debug display only. | Preserve values in source and, if approved, compatibility namespace. | Naming them `day`/`gold` in target UI would silently canonize false mechanics. |

## 4. Strategy alternatives

### 4.1 Cross-cutting comparison

| Strategy | Contract | Advantages | Costs/risks | Appropriate use |
|---|---|---|---|---|
| Clean break | Old campaign is incompatible with target play; require an explicit fresh Castle campaign. Preserve source until replacement succeeds. | Smallest target schema and lowest semantic-corruption risk. | Loses playable continuity; must provide honest notice and safe replacement/recovery. | Strong candidate for v4 Dungeon campaigns; optional for all saves if owner prioritizes simplicity. |
| Conversion | Pure, validated, deterministic migration maps preserved facts and initializes only target facts that did not exist. | Best continuity for Castle players; exercises migration discipline early. | Most complex; requires idempotent World generation, exact source retention, context mapping, and broad fixtures. | Recommended default for supported completed v4 Castle campaigns. |
| Legacy mode | Keep the v4 Dungeon-first runtime/schema playable beside target v5. | Maximum preservation of old gameplay; no invented conversion. | Maintains two opening flows, navigation policies, UI semantics, save paths, and tests; delays removal of obsolete rules. | Only if owner values continued Dungeon-campaign play enough to fund parallel maintenance. |

### 4.2 By current campaign type

| Source | Clean break consequence | Conversion consequence | Legacy-mode consequence | Recommended MVP default (not Accepted) |
|---|---|---|---|---|
| Incomplete v4 Setup | Discard old empty campaign after confirmation and create a new target campaign. | Preserve campaign ID/seed and reopen blank Castle Setup; generate target foundation only on completion. | Continue old two-faction Setup and Dungeon-first path. | Conversion of identity/seed with disposable draft; do not continue two-faction Setup. |
| Completed v4 Castle | Require new campaign; old progress becomes inaccessible except retained raw data. | Preserve Hero/build/Dungeon facts and deterministically add Village/home ring. | Continue old Dungeon-first loop separately. | Conversion. |
| Completed v4 Dungeon | Require explicit new Castle campaign; never convert. | **Not viable without violating player choice and approved MVP faction direction.** A so-called conversion must be rejected. | Continue v4 Dungeon-first campaign under a compatibility runtime. | Clean break at playability boundary with explicit incompatibility notice and preserved source; no silent replacement. |

## 5. Candidate next persisted shape

### 5.1 Version-number review

Campaign version `5` is the correct sequential candidate **if and only if** EPIC 03 implements an incompatible persisted-shape change after owner acceptance. It must not become authoritative in this audit, in content-only T03/T04 work, or merely because a future shape is described. If implementation discovers that lifecycle/container work can precede campaign cutover, registry versioning and campaign versioning should advance independently. Skipping directly beyond 5 has no current justification.

### 5.2 Minimum conceptual shape

Field names below are a candidate contract, not approved TypeScript. They intentionally omit later mechanics.

```text
CampaignStateCandidateV5
  version: 5
  id: CampaignId
  playerId: PlayerId
  campaignSeed: CampaignSeed
  createdAt: ISO timestamp
  updatedAt: ISO timestamp
  activeBoardId: setup | hero | settlement | world | dungeon

  foundation: null | {
    rootFactionId: "castle"

    hero: {
      heroClass: fighter | ranger | mage
      vocation: general | spy | diplomat
      freeAttributes: six allocated values
      bonusSkillId: SkillId
      skillRanks: positive learned/granted ranks by SkillId
      attributesCompatibility: {
        ruleVersion: "v4-path-bonus-1"
        values: six calculated totals
      }
      strategicRegionId: RegionId
      explorationContext: null | {
        locationId: LocationId
        cell: { x, y }
        returnBoardId: world | settlement
      }
    }

    capital: {
      settlementId: SettlementId
      definitionId: "village"
      tier: 1
      regionId: RegionId
    }

    world: {
      generatorVersion: 1
      seed: WorldSeed
      homeRegionId: RegionId
      regions: seven authoritative generated region snapshots
        each: id, axial coordinate, terrainDefinitionId, controlled
      sites: three minimum site instances
        exactly one Food, one Wood, one Stone site in distinct ring regions
      locations: minimum regional location instances
        including the approved introductory Dungeon and any E03-D08 choices
    }

    regionalDungeons: record keyed by Dungeon location ID
      each retained/current context may contain:
        dungeonDefinitionId
        seed
        level
        grid dimensions
        rooms
        tiles
        start
        heart
        discovered
        heartReached
        legacyPrototypeMetadata? {
          dungeonDay
          dungeonTreasury
          settlementClaimed
        }
  }
```

`foundation: null` is the only valid pre-Setup target state and requires `activeBoardId: "setup"`. Valid Setup completion creates the whole non-null foundation atomically. This avoids storing a second `setupComplete` flag and prevents a half-created Hero, Village, or World.

The exact `RegionId`, `SettlementId`, `SiteId`, and `LocationId` representation belongs to T03/T04. They must be family-specific, stable within the campaign, independent from labels/array positions, and deterministic where generation creates them. No global generic `EntityId` is proposed.

### 5.3 Category classification

| Category | Candidate values | Authority rule |
|---|---|---|
| Stored campaign facts | version; campaign/profile IDs; campaign seed; lifecycle timestamps under E03-D03; root Castle authority; completed Hero Class/Vocation/free allocation/bonus skill/positive ranks; capital instance/region/tier; region/site/location instance IDs and authoritative generated results; control of the initial seven regions; Dungeon discovery/Heart history; active resume board; strategic region and active exploration context. | Losing or changing these alters continuing campaign truth. |
| Stored compatibility snapshots | temporary Hero total attributes with explicit compatibility-rule version; retained generated Dungeon rooms/tiles/grid/start/Heart; legacy Dungeon day/treasury/claim only if E03-D12 accepts; World generated snapshot when seed/version can reproduce it. | Persisted to prevent rule/generator drift; never a second independent authority. |
| Derived values | Setup completeness/readiness; zero-filled skill record; current Hero totals once EPIC 06 owns rules; board availability/unlock; World seed if the approved contract derives rather than stores it; home-ring membership from axial coordinates; site indexes/counts; whether the Hero is exploring; discovery sets/counts; display summaries. | Recompute from stored facts + versioned rules; do not persist duplicates without a compatibility reason. |
| Static content | Castle root definition; Village definition; Food/Wood/Stone site definitions; terrain definitions; regional Dungeon/ruin definitions; board descriptors; Class/Vocation/skill definitions; generator algorithm and domain-separation label. | Typed catalogs referenced by stable IDs, never copied into saves. |
| Application/session state | hydration phase; selected profile; active in-memory working copy; storage read/write status; unsaved/dirty/error state; recovery workflow; players/game view. | Coordinates the app and adapter; not campaign truth. |
| UI-only state | unfinished Setup selections if E03-D06 accepts; open dialogs/sheets; save toast; form errors; pan/zoom/pointers; focused/selected region; transient Dungeon prompt; copy feedback; theme preference. | Losing it may alter presentation but not campaign truth. |

### 5.4 Explicit exclusions from candidate v5

No strategic Day, stockpile/Gold, production/yields, Road edges, connectivity/supply, buildings beyond the existence/type of the capital Village, projects/queues, units/armies, Travel allowance, encounter/Combat state, Gambits, relationships, events, population, evolution branches, Hero Level/XP/Profession/equipment/injury, or future progression placeholders are present.

## 6. Generator and snapshot authority recommendation

Recommended MVP policy, pending E03-D09:

1. `campaignSeed` remains the campaign root provenance.
2. Derive a World seed with an explicit stable domain-separation algorithm and label such as `world/home-ring/v1`; do not consume the legacy Dungeon generator sequence and do not assume `world.seed === dungeon.seed`.
3. Store the effective World seed and `world.generatorVersion` for transparent provenance and fixture stability.
4. Generate the seven-region opening once through a pure function after Setup validation.
5. Store the generated region/site/location snapshot and treat it as authoritative for resume/migration. Seed + version prove/reproduce it; they do not authorize silent regeneration on load.
6. Re-running migration or Setup completion must produce the same IDs/coordinates/contents and must not duplicate the capital, regions, sites, or Dungeon.
7. Retained v4 Dungeon snapshots are always authoritative. Their rooms/tiles/start/Heart/discovery are never regenerated, even if their seed is known.
8. A future generator change increments the relevant generator version and requires an explicit compatibility policy; it does not mutate existing snapshots automatically.

This “seed + generator version + stored authoritative snapshot” policy costs more local bytes than seed-only generation but avoids generator-drift corruption, supports deterministic tests, and matches the accepted current Dungeon preservation discipline.

## 7. Required owner decisions

Every recommendation below is **Proposed for review**, not Accepted.

### E03-D01 — MVP campaign count, replacement, and deletion

**Current behavior:** one campaign per profile; New Game replaces it after confirmation; deleting a profile cascades to the campaign; no campaign-only Delete.

**Options and consequences:**

- One campaign per profile, retain current relationship: smallest registry/UI. Replacement and profile deletion must become verified write-first transactions; on failure the previous durable and in-memory source remains active.
- Multiple campaigns/save slots: preserves history and avoids replacement, but changes registry identity, Start UI, selection, naming, migration, and testing beyond the smallest EPIC 03 need.
- One global campaign without profiles: simpler campaign count but discards accepted/current local profile identity and is a broader product change.

**Recommended MVP default:** one campaign per profile. Keep explicit replacement confirmation. Add campaign-only Delete only if the owner needs it now; otherwise profile deletion remains a confirmed cascade. Never remove/replace the old durable entry until the candidate registry write and readback verify.

### E03-D02 — Autosave and manual Save meaning

**Current behavior:** every hydrated registry change attempts an automatic write; manual Save merely changes `updatedAt`; success toast appears even if write fails.

**Options and consequences:**

- Autosave after every successful durable transition and lifecycle mutation; manual Save performs an immediate exact write/readback verification without changing campaign truth. Honest, smallest, and compatible with mobile interruption.
- Manual-save-only campaign durability: clear semantic boundary but increases loss risk and requires dirty-state/leave warnings.
- Autosave only and remove Save: honest but removes player reassurance and an explicit retry after failure.

**Recommended MVP default:** autosave after successful target state changes, including legal resume-board changes. Manual Save is “flush current registry now and verify exact serialized readback,” reports success/failure, and does not change `updatedAt` by itself.

### E03-D03 — Timestamp semantics

**Current behavior:** campaign `updatedAt` changes on open, Save, transitions/navigation, and return; profile `lastPlayedAt` changes on open/new.

**Options and consequences:**

- Separate creation, campaign modification, and profile activity: accurate, testable semantics; requires injected application clock and migration wording.
- Keep mixed `updatedAt`: no schema/UI change but cannot support honest sorting/audit/save meaning.
- Add more timestamps now (opened/saved/returned): more detail but speculative and enlarges the schema.

**Recommended MVP default:** `createdAt` is immutable campaign creation time. `updatedAt` changes only when persisted campaign payload truth/resume context changes successfully; open, manual Save, and return alone do not change it. Profile `lastPlayedAt` changes when a campaign successfully becomes active through New/Continue. Preserve old values as best available legacy metadata; do not claim historical precision.

### E03-D04 — Parse, validation, migration, quota, and write-failure recovery

**Current behavior:** most failures collapse to empty/fresh state; writes are swallowed; UI cannot distinguish success.

**Options and consequences:**

- Strict staged result types with visible recovery: safest, testable, modest application/UI work.
- Keep fallback-to-empty/new: smallest code but destructive and incompatible with the EPIC exit gate.
- Attempt permissive field repair: may recover more data but risks inventing meaning and needs per-field policy.

**Recommended MVP default:** decode as `read raw → parse → validate container → decode campaigns → migrate in memory → validate target → write candidate → readback/validate`. Return typed errors for unavailable/read/parse/container/profile/campaign/migration/serialization/quota/write/verification. Never autosave after a failed read or migration. Keep in-memory play after a later write failure, mark unsaved, expose Retry, and require explicit confirmation for Reset/New Campaign.

### E03-D05 — Registry/container transition and original-payload preservation

**Current behavior:** registry v1 and storage key v1 are rewritten in place after hydration; no backup.

**Options and consequences:**

- New registry v2 under a new key, leaving v1 unchanged: strongest rollback/source preservation; temporarily duplicates local data and needs source-selection rules.
- Registry v2 in the same key with a backup key: fewer active keys but backup creation itself can fail/quota and cutover is harder to reason about.
- Keep registry v1 and change only campaign version: least container churn but does not solve safe source preservation/typed lifecycle alone.

**Recommended MVP default:** introduce a registry v2 container only when lifecycle/campaign cutover requires it, write it to `dmcl.prototype.registry.v2`, verify exact readback and target decode, then prefer v2 on future loads. Keep the original v1 payload untouched throughout EPIC 03 as rollback evidence; no automatic cleanup. Do not embed the raw source inside every campaign.

### E03-D06 — Unfinished Hero Setup

**Current behavior:** draft is disposable component state; only empty campaign identity/seed/Dungeon persists.

**Options and consequences:**

- Keep drafts disposable: smallest state and migration; returning/reloading restarts the form.
- Persist every draft choice: better interruption recovery but adds partial-validity/migration/clear rules.
- Persist only completed Setup atomically: current conceptual boundary, with no partial state.

**Recommended MVP default:** keep unfinished choices disposable and make the UI explicit. Preserve campaign ID/seed/createdAt; create Castle/Hero/Village/World exactly once only on valid Setup completion.

### E03-D07 — First board and initial availability

**Current behavior:** Setup enters Dungeon. Hero, World, Combat, and Diplomacy scaffolds are available; Settlement requires `settlementClaimed`.

**Options and consequences:**

- Settlement first: strongest Village-first message and immediate capital context.
- World first: immediately shows the controlled home ring and sites.
- Hero first: confirms build but weakens the strategic opening.

**Recommended MVP default:** enter Settlement after Setup. Hero, Settlement, and World are initially available. Dungeon is locked until a valid regional location is selected/entered; Combat and Diplomacy are locked until later legal context. Setup is pre-campaign and not in normal navigation. For an eligible converted Castle save, preserve `hero`, `settlement`, or `world` only when the target board is legal; preserve `dungeon` only by creating the retained regional exploration context; map old `combat`/`diplomacy` scaffolds or any invalid destination to Settlement. An incomplete campaign always maps to Setup. This explicit mapping replaces generic fallback-order inference.

### E03-D08 — Three non-resource home-ring regions

**Current behavior:** no World or regions exist. Approved concept requires Food/Wood/Stone in three ring regions and leaves the other three TBD.

**Options and consequences:**

- Dungeon + ruin + terrain-only: demonstrates regional location variety with no economy/combat mechanics; requires only minimal Dungeon/ruin/terrain definitions.
- Dungeon + extra resource + terrain-only: smaller location catalog but begins resource-density/balance assumptions early.
- Dungeon + neutral/threat + terrain-only: foreshadows later loops but creates fake or inactive participant/threat semantics.

**Recommended MVP default:** exactly one introductory regional Dungeon location, one inert discoverable ruin location, and one terrain-only region. All six neighbors remain controlled. No threat, reward, extra commodity, encounter, or executable ruin mechanic is added in EPIC 03.

### E03-D09 — World snapshot, generator version, and seed provenance

**Current behavior:** Dungeon stores seed + snapshot without generator version; snapshot is authoritative on load.

**Options and consequences:**

- Seed only: compact but generator changes can rewrite campaign truth.
- Snapshot only: safe resume but weak provenance/reproducibility.
- Seed + generator version + authoritative snapshot: safest and clearest; modest duplication.

**Recommended MVP default:** use all three as defined in section 6, with a domain-separated World seed and immutable stored result. Never regenerate on ordinary load.

### E03-D10 — Completed v4 Castle campaigns

**Current behavior:** they load as the Dungeon-first prototype and may have a claimed placeholder Settlement.

**Options and consequences:**

- Clean break: lowest complexity, loses continuity.
- Deterministic conversion: preserves Hero/Dungeon facts and adds target opening defaults; requires full migration fixtures.
- Legacy mode: preserves exact play but maintains two products.

**Recommended MVP default:** deterministic conversion. Preserve IDs, seed, createdAt/best available updatedAt, valid Class/Vocation/allocation/skill facts, compatibility attributes, and exact Dungeon snapshot/progress. Add Castle authority, Village, and home ring deterministically. Old claim/counters have no strategic effect.

### E03-D11 — v4 Dungeon-faction campaigns

**Current behavior:** they are playable and structurally identical except for chosen faction/presentation.

**Options and consequences:**

- Clean break with explicit fresh-start offer: honest and smallest target runtime; old campaign cannot continue.
- Legacy mode: preserves playability at significant parallel-runtime cost.
- Conversion: invalid because it changes an explicit durable faction choice and is therefore not viable.

**Recommended MVP default:** classify as incompatible, never convert, retain raw source, and show an explicit explanation. Offer a new Castle campaign only after confirmed replacement and verified write. Do not implement playable legacy mode unless the owner explicitly funds its additional scope.

### E03-D12 — Old Dungeon day, treasury, and `settlementClaimed`

**Current behavior:** displayed globally as Day/Gold; claim unlocks Settlement.

**Options and consequences:**

- Retain in a clearly named legacy compatibility namespace: maximum evidence preservation; small payload/UI-inspector cost.
- Retire from target payload after retaining the original source: smallest v5, but values are unavailable to target debugging without reading backup.
- Convert to strategic values/ownership: prohibited because meanings are not equivalent.

**Recommended MVP default:** retain as `legacyPrototypeMetadata` on migrated regional Dungeon state, hide from normal strategic UI, and expose only in development/recovery inspection. New campaigns do not create these fields. They never affect Village, region control, strategic Day, or resources.

### E03-D13 — Temporary Hero attribute compatibility through EPIC 05

**Current behavior:** current selector grants +1 from Class and +1 from Vocation; total attributes are stored and normalized on load. Game Concept 2.0 defers final attribute rules to EPIC 06.

**Options and consequences:**

- Preserve a versioned compatibility total and current Setup calculation temporarily: avoids visible stat changes; adds a clearly temporary snapshot.
- Recompute from current selector without storing: smaller save but future selector changes can alter old campaigns.
- Remove current bonuses now: changes Hero behavior before EPIC 06 approval.

**Recommended MVP default:** preserve/use a stored `v4-path-bonus-1` compatibility snapshot for migrated Heroes and produce the same snapshot for new EPIC 03 Heroes. Keep allocation/Class/Vocation as facts. Do not call these totals the final Level 1 attribute contract. EPIC 06 must explicitly migrate or retire the snapshot.

## 8. Bounded implementation contracts

No task below may start until `DMCL-P26`, this Candidate, and all decisions required by that task are explicitly accepted and the prior task is Complete.

### E03-T02 — Safe local lifecycle and persistence behavior

**Goal:** make current local persistence honest and recoverable before changing campaign shape.

**Dependencies:** E03-D01–D06 accepted; E03-T01 accepted/checkpointed.

**Expected systems/files:** `GameProvider.tsx`, `storage.ts`, `model.ts`, `createGame.ts` or a focused decoder/migration module, Start/Settings/save feedback surfaces, and new lifecycle/storage engine tests.

**Requirements:** inject an application clock; implement accepted timestamp semantics; define a typed storage port/result; stage raw read/parse/validation/migration; suppress writes after failed hydration; implement verified autosave/manual Save and visible failures; implement accepted replacement/deletion cardinality atomically; preserve original payload under accepted container policy; keep current v4 gameplay unchanged.

**Non-goals:** v5 fields, Castle-only Setup, World generation, board availability change, database/cloud/export UI, broad provider/state-library rewrite.

**Acceptance:** read/write/quota/verification failures are distinguishable; no failure reports success; corrupt input is not overwritten; replacement/deletion preserves old durable state on failure; timestamps follow accepted rules; one in-memory adapter fixture covers success and each failure class.

**Verification:** focused engine/lifecycle tests, `npm run verify`, manual no-storage/quota-simulated/retry/reload/replacement/deletion checks.

**Owner actions:** accept D01–D06; review wording of destructive confirmations and storage errors; accept the Candidate before checkpoint.

### E03-T03 — Minimum Castle-opening content catalogs

**Goal:** establish only the stable definitions and family-specific references required by the Village-first opening.

**Dependencies:** T02 Complete; E03-D08 accepted.

**Expected systems/files:** new or focused TypeScript content modules under `src/game/`; `campaignState.ts` type exports only where content ID types are needed; catalog validation tests; no board implementation.

**Requirements:** centralize Castle root; retain `dungeon` only as compatibility/future content identity; define Tier-1 Village, Food/Wood/Stone sites, minimum terrain set, regional Dungeon, ruin/other approved ring contents; preserve existing Class/Vocation/Skill IDs; define family-specific Region/Settlement/Site/Location IDs and reference validation.

**Non-goals:** yields, costs, buildings/projects, Roads, units, encounters, location rewards, external content format, generic entity/content ID, effect engine.

**Acceptance:** one authoritative catalog per introduced family; unique stable IDs and valid references; exact E03-D08 contents are representable without executable later mechanics; no campaign version change.

**Verification:** catalog/reference tests and `npm run verify`.

**Owner actions:** approve exact names/identities if the implementation proposal changes the working defaults; visual acceptance is not required because this task has no UI.

### E03-T04 — Deterministic Village and home-ring generation

**Goal:** generate the seven-region opening reproducibly without changing legacy Dungeon outcomes.

**Dependencies:** T03 Complete; E03-D08/D09 accepted.

**Expected systems/files:** new World generation module, random/seed derivation helpers, content catalogs, pure generator tests.

**Requirements:** one axial home region plus six unique neighbors; capital in home region; distinct guaranteed Food/Wood/Stone ring sites; exact other three contents; stable instance IDs; explicit World seed provenance and generator version; pure deterministic result; no consumption/change of legacy Dungeon sequence; validation of uniqueness, control, coordinates, references, and required contents.

**Non-goals:** rendering, travel, yields, Roads, connectivity, later World size, conquest, threats/encounters, save cutover.

**Acceptance:** same inputs produce byte-equivalent result; different valid seeds can vary only approved generated choices; guarantees always hold; legacy Dungeon fixture remains unchanged; generator output is idempotent and catalog-valid.

**Verification:** deterministic/property-style bounded fixtures, dependency-purity checks, `npm run verify`.

**Owner actions:** approve any proposed deterministic ordering/placement semantics not already covered by D08/D09.

### E03-T05 — Candidate version-5 state and migration

**Goal:** implement the accepted minimum target-shaped campaign and pure safe migration chain.

**Dependencies:** T02–T04 Complete; E03-D03, D05, D09–D13 accepted; owner confirms version 5.

**Expected systems/files:** `campaignState.ts`, `model.ts`, `createGame.ts` split if justified, storage decoder/migrations, selectors, identity/content types, campaign/migration/random tests.

**Requirements:** implement only section 5 accepted fields; v2→v4→v5 and v3→v4→v5 pure chains; exact v4 class handling; preserve IDs/build/Dungeon snapshot facts; relocate faction and positions; derive readiness; isolate legacy counters/claim; deterministically initialize Castle/Village/World only for eligible sources; validate target strictly; preserve source until full write success; idempotent v5 normalization/roundtrip.

**Non-goals:** Setup behavior/UI cutover, strategic mechanics, playable Dungeon legacy mode unless separately approved, future schema placeholders.

**Acceptance:** every migration-matrix row has fixtures; no reroll/regeneration; repeated migration is identical; Dungeon-faction input never produces Castle; invalid input returns typed error; v5 roundtrip preserves exact authoritative facts.

**Verification:** focused migration/roundtrip/source-preservation tests and `npm run verify`.

**Owner actions:** explicitly accept version 5 and D09–D13; review migration fixture summaries before checkpoint.

### E03-T06 — Village-first Hero Setup transition

**Goal:** atomically create the playable Castle/Hero/Village/home-ring foundation and enter the approved board exactly once.

**Dependencies:** T05 Complete; E03-D06–D09/D13 accepted.

**Expected systems/files:** `transitions.ts`, creation helpers, navigation policy, `GameProvider.tsx`, Setup integration, transition/navigation tests.

**Requirements:** Castle implicit; validate current approved temporary Class/Vocation/allocation/skill grants; create Hero, campaign Castle authority, capital Village, World snapshot, regional locations, positions/context once; enter approved first board; initially enable/unlock Hero/Settlement/World; Dungeon only through regional context; Combat/Diplomacy unavailable; retire `claimSettlement` as capital creation; failed/repeated completion changes nothing.

**Non-goals:** Setup visual rewrite beyond required wiring, strategic actions, Dungeon consequence redesign, economy/Combat/Diplomacy mechanics.

**Acceptance:** one atomic success produces one foundation; repeated/concurrent-like duplicate requests are rejected; no cost/history invented; reload preserves result; board policy matches D07; no claim creates a capital.

**Verification:** pure transition/navigation tests and `npm run verify`.

**Owner actions:** confirm first-board and availability behavior; accept the transition Candidate before checkpoint.

### E03-T07 — Opening boards, summaries, and inspection

**Goal:** present the new opening and persistence states honestly without implementing fake mechanics.

**Dependencies:** T06 Complete.

**Expected systems/files:** Start, Setup, Settlement, World, Dungeon, possibly Hero scaffold/Sheet, `GameShell`, navigation, Settings/storage recovery, Developer State Inspector, CSS only as needed.

**Requirements:** Castle/Village-first copy; remove Dungeon faction choice; render readable Tier-1 Village and seven-region home ring; identify Food/Wood/Stone and approved other contents; select/enter Dungeon through World context; remove legacy Dungeon Day/treasury from strategic status; distinguish strategic/exploration position; present migration/incompatibility/storage errors; update inspector categories; preserve portrait touch, keyboard, focus, names, safe areas, dark mode, and reduced motion.

**Non-goals:** clickable fake Roads/buildings/yields, active ruin reward/threat, economy, Travel spending, Combat/Diplomacy behavior, visual-system rewrite.

**Acceptance:** player can understand the new opening and legal/locked reasons; no old counter is labeled strategic; incompatible Dungeon campaign is never shown as converted; Save feedback reflects verified result; target boards agree on one campaign state.

**Verification:** `npm run verify`; rendered desktop and portrait checks; touch/keyboard/focus/dark/reduced-motion paths; error/legacy/new/migrated flows.

**Owner actions:** visual/mobile acceptance and copy review; physical smartphone testing remains owner responsibility.

### E03-T08 — Compatibility and EPIC 03 exit gate

**Goal:** prove the accepted transition foundation, reconcile responsible documentation, and prepare a non-deployed Candidate checkpoint.

**Dependencies:** T02–T07 Complete; all E03 decisions accepted.

**Expected systems/files:** all focused engine fixtures; source-contract tests; responsible docs (`GAME_STATE`, `ARCHITECTURE`, `CONTENT_MODEL`, `CURRENT_STATE`, `DECISIONS`, `ROADMAP`); E03 exit record.

**Requirements:** exercise every migration row; v5 roundtrip; stable IDs; no regeneration/reroll; atomic Setup; storage-read/write/quota/recovery; new/migrated/incompatible flows; board availability/context; legacy semantic isolation; complete diff/status/doc reconciliation; GitHub Actions evidence; no deployment.

**Non-goals:** beginning EPIC 04, balance, economy, Roads, strategic Days, regional Dungeon reward, save-version 6, deployment.

**Acceptance:** section 9 gate passes with automated/manual evidence; no severe persistence or semantic-conversion defect; owner accepts desktop/phone result; exact accepted source is pushed and matching Sites version saved only after acceptance.

**Verification:** `npm run verify`, independent GitHub Actions, documented manual matrix, physical smartphone owner confirmation, final diff/link/status review.

**Owner actions:** provide manual/device and CI confirmation, accept the Candidate, authorize/confirm checkpoint branch, then allow commit/push and matching non-deployed Sites version under workflow. Deployment remains a separate request.

## 9. EPIC 03 exit gate

EPIC 03 may close only when all are true:

- `DMCL-P26` and the E03-T01 decision packet are explicitly Accepted and recorded in responsible documents.
- A new campaign completes Castle Setup and atomically creates exactly one Hero, Castle authority, Tier-1 capital Village, home region, six controlled neighbors, guaranteed Food/Wood/Stone sites, and approved three remaining contents.
- Hero, Settlement, and World have the accepted initial availability; Dungeon requires regional context; Combat and Diplomacy remain unavailable without legal future context.
- The Dungeon Heart no longer creates the capital or controls Settlement availability.
- v2, v3, incomplete v4, completed Castle v4, Dungeon-faction v4, malformed registry, malformed campaign, retained snapshot, old claim, and old counter classes all follow accepted tested policies.
- No supported retained Dungeon snapshot is regenerated and no migration rerolls World facts or changes stable IDs on repetition.
- Parse/migration/write/quota/verification failures are visible and recoverable; failed input is never silently overwritten; manual Save never reports false success.
- Strategic and exploration position/context are distinct; legacy Dungeon coordinates never become World coordinates.
- Legacy Dungeon day/treasury/claim have no strategic Day/Gold/capital/control effect.
- The candidate campaign version and container version are authoritative only after their actual persisted cutovers and accepted migrations.
- No economy yield, stockpile, Road, supply, project, unit, Combat, Gambit, diplomacy, event, population, evolution, or future Hero progression state was added early.
- Normal automated verification, migration/storage fixtures, rendered/manual checks, owner physical smartphone acceptance, and independent GitHub Actions evidence pass.
- Responsible docs and `CURRENT_STATE` are reconciled from implementation evidence; accepted source is committed/pushed and a matching Sites version is saved only after owner acceptance; nothing is deployed.

## 10. Affected-file map

This is impact forecasting, not authorization to edit every file.

| Area | Likely files/systems | Planned reason |
|---|---|---|
| Lifecycle/application | `src/game/GameProvider.tsx`, `model.ts` | Clock, transaction results, timestamp semantics, registry/active synchronization. |
| Persistence | `src/game/storage.ts`, focused decoder/migration module if extracted | Typed raw read/write, strict staged decode, container cutover, source preservation, verified writes. |
| Campaign model/migration | `campaignState.ts`, `createGame.ts`, selectors | Candidate v5 fields, pure chains, readiness derivation, compatibility snapshot handling. |
| Content | existing/new `src/game/*` catalogs | Castle/Village/site/terrain/location definitions and stable references. |
| Generation/random | new World generator, `random.ts` or focused seed derivation helper | Domain-separated seed, generator version, deterministic home ring and IDs. |
| Rules/navigation | `transitions.ts`, `navigation.ts` | Atomic target Setup, context-aware Dungeon entry, initial board availability, claim retirement. |
| Start/Setup | `StartBoard.tsx`, `SetupBoard.tsx` | Replacement/recovery/incompatibility UI and Castle-only Setup. |
| Boards/shared UI | `SettlementBoard.tsx`, `WorldBoard.tsx`, `DungeonBoard.tsx`, `HeroBoard.tsx`/`HeroSheet.tsx`, `GameShell.tsx`, `BoardNavigation.tsx`, Settings/notification components | New opening summaries, regional context, semantic isolation, honest Save/error feedback. |
| Inspection | `DeveloperStateInspector.tsx` | v5 categories, strategic/exploration context, legacy metadata labels, storage status. |
| Tests | `tests/engine/*` plus focused lifecycle/storage tests | Migration matrix, determinism, atomicity, failure recovery, policy/dependency contracts. |
| Documentation | `GAME_STATE`, `ARCHITECTURE`, `CONTENT_MODEL`, `CURRENT_STATE`, `DECISIONS`, `ROADMAP`, E03 task/exit records | Update only as each accepted implementation changes its responsible truth. |
| Expected untouched infrastructure | `.openai/hosting.json`, `worker/`, `db/`, `drizzle/`, dependencies/lockfile | No database, hosting, dependency, cloud, auth, or deployment work. |

## 11. Verification for this documentation Candidate

### Automated/document checks

- Repository branch/status/commit and Sites manifest inspected.
- Required governing documents and current lifecycle/persistence/model/board/test sources inspected.
- Documentation links and cited paths checked against the repository.
- Complete diff, status labels, field coverage, migration classes, decision coverage, task bounds, and non-goals reviewed.
- New-file diff whitespace check (`git diff --no-index --check`) — **PASS**.
- Link/path check, 13-decision count, 10-migration-class count, and T02–T08 count — **PASS**.
- No build, lint, engine test, dependency install, browser test, or deployment is required because this task changes documentation only.

### Manual review scope

- Compared this contract with Game Concept 2.0 Village-first opening, six-board direction, Dungeon regional-site rule, state ownership categories, deterministic-authority policy, stable-ID/content rules, roadmap task sequence, and current implementation evidence.
- Confirmed that recommendations remain explicitly unaccepted and that `DMCL-P26` remains Proposed.
- Confirmed all v4 nested fields and all requested migration/decision classes are covered.

### Environment limitations

- No existing browser save was exported, parsed, or mutated; migration findings use repository types, code paths, and fixtures.
- The exact opaque ID for accepted Sites version 20 is not recorded in repository documentation and was not inferred.
- No runtime behavior was exercised because executable source is unchanged.

## 12. Documentation impact and checkpoint

- Changed document: this E03-T01 Candidate only.
- Decision changes: none. `DMCL-P26` remains Proposed; E03-D01–D13 await explicit owner answers.
- Roadmap change: none before acceptance. E03-T02 must not begin.
- `CURRENT_STATE.md`: unchanged because implementation evidence did not change.
- Commit/push: not authorized by this Candidate request and not performed.
- Sites version: not saved.
- Deployment: **Not performed**.

## Completion report

### Candidate outcome

- Summary: complete Concept 2.0 lifecycle, migration, minimum-state, authority, decision, task-sequence, and exit-gate contract prepared from current repository evidence.
- Changed files: `docs/E03-T01_CONCEPT_2_0_LIFECYCLE_SAVE_OPENING_TRANSITION_AUDIT.md` only.
- Acceptance evidence: sections 1–12 and the checked acceptance criteria.
- Automated verification: documentation/path/status/diff checks only; result recorded in the handoff.
- Behavior verification: current source paths reviewed; no behavior changed or exercised.
- Documentation/decision updates: Candidate audit added; no authoritative status changed.
- Limitations/risks/open approvals: `DMCL-P26` plus E03-D01–D13 require explicit owner acceptance/revision; version 5 and registry version 2 remain candidates.
- Deployment: **Not performed**.

### User acceptance

- Status: awaiting owner review.
- Required response: accept or revise `DMCL-P26`, then answer/accept/revise E03-D01–D13. Acceptance of recommendations may be given as one explicit packet or item by item.

### Accepted checkpoint

- Final commit SHA: pending acceptance.
- Pushed source branch: pending acceptance.
- Saved Sites version: pending acceptance.
- Roadmap status: unchanged Candidate/Proposed status.
- Next task: none active; proposed next after all required acceptance and checkpoint work is `E03-T02 — Safe local lifecycle and persistence behavior`.
- Deployment: **Not performed**.
