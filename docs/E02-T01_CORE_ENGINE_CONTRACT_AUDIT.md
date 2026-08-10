# Dungeon Master & Castle Lords — E02-T01 Core Engine Contract Audit

Status: **Complete — accepted checkpoint**
Audit date: 2026-08-10
Audited branch/commit: `main` at `19f360d44bb4f749b5131f4123115fc766b3e7a9`
Accepted Sites checkpoint: version 13 at the same commit

## Task ID and name

`E02-T01 — Audit central game-state boundaries and define the core engine contract`

## Goal

Map the current campaign-state, mutation, rule, randomness, identity, persistence, and dependency boundaries from repository evidence, then propose the smallest core-engine contract needed by the remaining EPIC 02 tasks without changing application behavior.

## Context

- Stable base commit: `19f360d44bb4f749b5131f4123115fc766b3e7a9`
- Accepted Sites version: 13
- Current roadmap milestone: EPIC 02 — Core game engine and state; E02-T01 is the sole next task
- Relevant decisions: DMCL-004, DMCL-011, DMCL-P01–P07, DMCL-P09–P12, DMCL-P16, DMCL-P18, DMCL-I02–I10, DMCL-Q09–Q12
- Relevant documents/files: `AGENTS.md`; `docs/ROADMAP.md`; `docs/DECISIONS.md`; `docs/ARCHITECTURE.md`; `docs/GAME_STATE.md`; `docs/CONTENT_MODEL.md`; `docs/CURRENT_STATE.md`; `docs/WORKFLOW.md`; `docs/TASK_TEMPLATE.md`; `src/game/model.ts`; `src/game/GameProvider.tsx`; `src/game/GameApp.tsx`; `src/game/createGame.ts`; `src/game/storage.ts`; `src/game/generateDungeon.ts`; `src/game/skillTrees.ts`; `src/boards/registry.ts`; `src/boards/BoardCatalogContext.tsx`; `src/boards/StartBoard.tsx`; `src/boards/SetupBoard.tsx`; `src/boards/DungeonBoard.tsx`; `src/boards/SettlementBoard.tsx`; `src/ui/BoardNavigation.tsx`; `src/ui/GameShell.tsx`; `package.json`; `tsconfig.json`; `.openai/hosting.json`
- Why this task is needed now: the application already has one shared save, deterministic dungeon generation after seed selection, versioned migration, and a typed React board catalog, but rule-bearing changes are split among the provider, creation helpers, and React boards. EPIC 02 needs an approved boundary before moving those rules.

## Requirements

- Record the current owner of authoritative campaign truth and distinguish campaign, profile/registry, application session, UI, static content, derived, and platform state.
- Classify every current campaign field and the relevant adjacent runtime values by authority kind.
- Enumerate every current campaign mutation, generic `updateGame` use, React-owned rule, duplicated calculation, ID category, gameplay-relevant randomness source, persistence/migration boundary, and dependency-direction problem.
- Identify save-compatibility risks and recommend a bounded engine contract covering campaign state, application operations, pure transitions, selectors, identity, deterministic RNG, persistence, and tests.
- Validate or adjust the working E02-T02 through E02-T08 sequence against current evidence.
- List the exact approvals required before E02-T02.
- Reconcile stale current-status wording in `docs/DECISIONS.md` without rewriting the baseline evidence audit in `docs/CURRENT_STATE.md`.

## Constraints

- Keep changes within documentation responsible for the task audit, architecture, state, and decision index.
- Preserve approved mechanics, persisted IDs, version-3 save compatibility, and unrelated user work.
- Do not install or upgrade dependencies, modify application code, change the save schema, broadly rewrite `GameProvider`, or change infrastructure.
- Do not add gameplay, balance changes, cloud persistence, multiplayer authority, a state-management library, event sourcing, CQRS, ECS, a generic event bus, or speculative framework.
- Do not add placeholder calendar, settlement, world, army, combat, or event state.
- Do not deploy. Deployment requires a separate explicit user instruction.

## Non-goals

- Implementing the proposed engine contract or beginning E02-T02.
- Resolving later-Epic gameplay, identity/account, multiple-campaign, cloud/offline, or multiplayer questions.
- Rebuilding the EPIC 01 board catalog, router, shell, navigation, or UI.
- Re-auditing and rewriting `docs/CURRENT_STATE.md` under its separate evidence-baseline rules.

## Acceptance criteria

- [x] The current mutation/state architecture is mapped from current repository evidence.
- [x] Stored facts, stored snapshots, derived values, static definitions, application/session state, and UI-only state are explicitly classified.
- [x] Current dependency violations and the minimum correction are identified.
- [x] Version-3 save and migration compatibility risks are identified.
- [x] The proposed engine contract contains only abstractions justified by existing behavior or the immediately upcoming work.
- [x] No future gameplay schema or balance rule is introduced.
- [x] Required owner approvals are listed explicitly.
- [x] A bounded E02-T02 through E02-T08 sequence is proposed from repository evidence.
- [x] No application behavior changed.
- [x] No unapproved gameplay or architecture decision was introduced.
- [x] No unrelated files or behavior changed.

## Verification

### Automated

- Documentation links and cited file paths checked with repository search — expected: every cited path exists.
- `git diff --check` — expected: no whitespace errors.
- Documentation-only task: no dependency installation, build, lint, or application test is required by `AGENTS.md`.

### Behavior/manual

- Compared the audit against current `main` code paths for campaign creation, setup, movement, discovery, heart/claim, navigation, save/load, registry hydration, and migration.
- Reviewed the final status and diff to ensure only responsible documentation changed and `docs/CURRENT_STATE.md` remained untouched.

### Environment limitations

- No application behavior or physical-device flow was exercised because this task makes no application changes.
- Existing browser saves were not exported or mutated. Compatibility findings are based on the version-3 schema and migration code.

## Documentation impact

- Responsible documents to update: this task/audit; `docs/ARCHITECTURE.md`; `docs/GAME_STATE.md`; `docs/DECISIONS.md`
- Decision changes: DMCL-P19–P22 accepted by the project owner on 2026-08-10; stale current-approval wording corrected
- Roadmap change after acceptance: E02-T01 accepted/complete; `E02-T02 — Establish CampaignState and pure engine testing` is the sole next task
- `CURRENT_STATE.md` audit required: no; its baseline and audit notice remain accurate

## Checkpoint

- Configured Sites source branch: `main` (current `origin/main`; exact push/checkpoint action remains after acceptance)
- Commit/push authorized: yes; the project owner accepted the Candidate on 2026-08-10
- Expected checkpoint contents: accepted E02-T01 documentation plus acceptance/roadmap status updates
- Deployment authorized: **No**

## Audit findings

### 1. Current authoritative truth and ownership boundaries

`GameSave` version 3 is the current authoritative campaign payload. While a campaign is open, `RuntimeState.activeGame` is the working copy; the reducer mirrors every accepted change into `GameRegistry.games[playerId]`. The registry copy is then automatically serialized to browser storage after hydration. These two in-memory references are intended to match, but their duplication is application orchestration, not two legitimate campaign authorities.

The current ownership boundaries are:

| Boundary | Current owner | Evidence and meaning |
|---|---|---|
| Campaign truth | `GameSave` in `src/game/model.ts` | Campaign ID/owner reference, completed hero, dungeon result/progress, claim outcome, and resumable active board. |
| Player/profile registry | `PlayerProfile` and `GameRegistry.players` | Local ruler identity, banner, and last-played metadata; not embedded in campaign truth. |
| Campaign lookup/container | `GameRegistry.games`, keyed by player ID | Current one-campaign-per-player persistence shape; an interim registry rule, not campaign state. |
| Application/session | `RuntimeState` in `GameProvider` | Hydration, selected player, active in-memory game, and players/game surface. |
| UI preference | provider theme state and separate theme storage key | `system`/`light`/`dark`, current system preference, and effective dark mode. |
| Board-local/UI state | React component state and refs | Setup draft; sheets/dialogs; save toast; movement copy; map pan/zoom, gesture, and pointer state. |
| Static content/rules | `skillTrees.ts`, setup arrays, board catalog, generator constants | Definitions and rule inputs shipped with the application, not campaign instances. |
| Derived state | selectors/calculations currently embedded in components and modules | Selected profile/game, board availability/resolution, setup readiness/preview, discovery set/counts, map measurements, and display labels. |
| Persistence/platform | `storage.ts`, `localStorage`, `.openai/hosting.json`, Sites/Worker edges | Registry serialization and delivery; these must not define game rules. |

### 2. State-value classification

The classification describes current authority, not a future schema. “Stored snapshot” means persisted data that is reproducible or redundant but is currently used when resuming. Removing or changing any persisted field still requires a deliberate versioned migration.

#### Campaign payload (`GameSave`)

| Current value | Classification | Current authority/notes |
|---|---|---|
| `version` | stored fact (persistence metadata) | Selects schema/migration behavior; not gameplay. |
| `id` | stored fact | Stable campaign identity, generated once. |
| `playerId` | stored fact | Reference to a profile/owner ID; the profile itself remains outside the campaign. |
| `createdAt` | stored fact (lifecycle metadata) | Generated at campaign creation; exact product semantics remain TBD. |
| `updatedAt` | stored fact with ambiguous semantics | Changed on open, explicit save, navigation, generic updates, setup completion, and return to players; currently mixes modified/opened/saved meanings. |
| `activeBoardId` | stored fact (resume context) | Durable current interaction surface. Legal availability is derived separately. |
| `setupComplete` | stored snapshot/redundant flag | Currently changes with `hero` from `null` to non-null and is therefore not an independent source of truth; preserve for v3 compatibility. |
| `hero` nullability | stored fact | Whether completed hero state exists. The unfinished setup draft is not stored. |

#### Completed hero (`HeroState`)

| Current value | Classification | Current authority/notes |
|---|---|---|
| `faction`, `heroClass`, `vocation`, `freeAttributes`, `bonusSkill` | stored facts | Durable player choices. IDs reference static definitions or current unions. |
| `attributes` | stored snapshot of a derived value | Recomputed from saved choices during migration; duplicates free allocation plus class/vocation rules. |
| `skills` positive ranks | stored facts | Learned/current ranks affect campaign truth. |
| `skills` complete zero-filled key set | stored snapshot | Catalog membership and missing zero ranks are reproducible from `ALL_SKILLS`; migration normalizes the record. |
| `position` | stored fact | Durable hero location on the current dungeon grid. |
| `visionRadius` | stored snapshot under current rules | Always initialized to 1 and has no current transition; it affects discovery but is reproducible today. Do not remove before its future authority is decided. |

#### Dungeon (`DungeonState`)

| Current value | Classification | Current authority/notes |
|---|---|---|
| `level`, `day`, `treasury` | stored facts | Current counters displayed across boards. They have no current advancing/economy rules and do not establish future mechanics. |
| `seed` | stored fact (random-generation input/provenance) | Chosen nondeterministically for a new campaign; no generator version accompanies it. |
| `grid.columns`, `grid.rows` | stored snapshot | Reproducible from the current generator/result dimensions. |
| `rooms`, `tiles` | stored snapshots used authoritatively for resume | Deterministically generated from the seed by the current algorithm, but persisted results—not regeneration—currently drive play. |
| `start`, `heart` | stored snapshots | Reproducible from generated room centers under the current algorithm; persisted and used directly. |
| `discovered` | stored fact | Durable exploration knowledge, encoded as coordinate keys. |
| `heartReached` | stored fact | Historical outcome; it remains true after the hero leaves the heart and cannot be derived from current position alone. |
| `settlementClaimed` | stored fact | Durable cross-board outcome and settlement unlock input. |

#### Player registry, runtime, UI, static, and derived values

| Current value | Classification | Current authority/notes |
|---|---|---|
| Profile `id`, `name`, `bannerColor`, `createdAt`, `lastPlayedAt` | player/profile registry stored facts | Persisted beside campaigns, but not campaign truth. Banner is player presentation identity; last-played semantics differ from campaign modification. |
| Registry `version` | persistence metadata | Versions the local container, not the campaign schema. |
| Registry `players`, `games`, `lastActivePlayerId` | player/campaign registry | `games` contains campaign truth; the collection and last selection are registry/application concerns. |
| `hydrated`, `selectedPlayerId`, `view` | application/session state | Coordinates the running UI and is not part of a campaign. |
| `activeGame` | application working snapshot | Mutable working reference to the selected registry campaign; should not become a second durable authority. |
| `selectedPlayer`, `selectedGame` | derived values | Computed from registry plus selected ID. |
| `themePreference` | UI preference | Persisted separately under `dmcl.prototype.theme.v1`. |
| `systemDarkMode`, effective `darkMode` | derived UI state | Derived from the OS preference and stored theme preference. |
| Setup selections, `remainingPoints`, bonus preview, readiness | UI-only draft plus derived UI values | The draft is intentionally disposable under current behavior; validation also currently lives here. |
| Dungeon prompt, movement note, map view/scale/pointers/gesture refs | UI-only state | Does not change campaign truth. |
| Board availability/resolution | derived value | Computed from catalog flags, campaign unlock predicates, and `activeBoardId`. |
| Discovery `Set`, discovered/floor counts, heart visibility, titles | derived value | Recomputed for rendering from campaign facts/static definitions. |
| Skill trees/nodes/branches and board descriptors | static definitions | Stable authored definitions; derived indexes should not be persisted. |
| `ALL_SKILLS`, `SKILL_BY_ID`, empty/normalized rank maps | derived indexes/defaults | Rebuilt from static skill definitions. |
| Generator dimensions/ranges/corridor rules and seeded PRNG | static rules | Current hard-coded generation algorithm. |
| Storage/theme keys and FS banner-color projection | static platform/presentation definitions | Not campaign truth. |

### 3. Current mutation paths

| Path | Entry and current boundary | Campaign/registry changes | Current validation/rule owner |
|---|---|---|---|
| Player creation | `StartBoard` → provider `createPlayer` → `createPlayerProfile` → reducer `createPlayer` | Adds profile, selects it, updates last-active ID; no campaign yet. | Provider validates trimmed length and case-insensitive uniqueness; ID/time creation helper supplies identity metadata. |
| Player selection | `StartBoard` → `selectPlayer` | Changes selected and last-active player only. | Provider/reducer; no campaign rule. |
| Player deletion | confirmation UI → `deletePlayer` | Deletes profile and the campaign keyed by that profile ID. | Confirmation is view-only; reducer owns destructive registry mutation. |
| Campaign creation/replacement | `StartBoard` confirmation → `startNewGame` → `createNewGame` → reducer `openGame` | Creates v3 campaign, random dungeon seed/result, campaign ID/timestamps, replaces `games[playerId]`, opens it, touches player last-played. | Replacement confirmation in React; creation helper supplies defaults; no independent domain validation. |
| Campaign load/open | `loadGame` → reducer `openGame` | Copies stored game to `activeGame`, changes `updatedAt`, touches last-played, re-saves the campaign. | Provider/reducer. Opening currently counts as campaign update. |
| Hero setup completion | `SetupBoard.beginCampaign` → generic `updateGame` → `completeGameSetup` | Stores choices, derived attributes/full skill ranks, start position/vision, initial discovery; sets setup complete and active dungeon. | React validates completeness/point count and skill-choice compatibility; helper applies bonuses but does not independently validate selection. |
| Dungeon movement | `DungeonBoard.moveHero` → generic `updateGame` | Updates hero position, unioned discovery, and historical heart-reached flag. | React board computes target, walkability result, discovery merge, and heart detection; helper functions only answer walkability/discovery. |
| Discovery update | Setup helper and dungeon movement | Initial cells on setup; expanded cells per legal movement. | Split between `completeGameSetup`, `discoverAround`, and React board merge logic. |
| Dungeon-heart reach | Dungeon movement | Sets `heartReached` once position equals persisted heart. | React board. |
| Settlement claim | `DungeonBoard.claimSettlement` → generic `updateGame` | Sets `settlementClaimed` and `activeBoardId = settlement`. | React UI controls when the action is offered; mutation itself does not validate `heartReached`. |
| Board navigation | navigation UI or fallback effect → named provider `navigateToBoard` → reducer | Directly changes `activeBoardId` and `updatedAt`. | `BoardNavigation` disables unavailable entries, while the reducer accepts any registered ID. `GameApp` later repairs illegal/unavailable state through the React board catalog. |
| Generic campaign update | provider `updateGame` reducer case | Accepts arbitrary whole-save updater; stamps time and mirrors to registry. | Caller; no central validation. |
| Manual save | `GameShell` → `saveGame` | Changes `updatedAt` and registry copy; automatic storage already follows registry changes. | Provider; UI reports success even though storage write failures are swallowed. |
| Return to players | setup/shell → `returnToPlayers` | Changes `updatedAt`, copies active game to registry, clears active working game, changes session view. | Provider/reducer. |
| Automatic persistence | provider effect → `gameStorage.write` | Serializes the full registry after any hydrated registry change. | Browser adapter; write errors are swallowed. |
| Hydration/load | provider effect → `gameStorage.read` → `migrateLegacyGame` per game → reducer `hydrate` | Parses registry, migrates each campaign to v3, selects last-active/fallback player. | Storage guard is shallow; migration performs partial structural repair/defaulting. |
| Migration | `migrateLegacyGame` | v2/v3-with-tiles: forces v3, repairs bonus skill/attributes/skill record; other object: creates a fresh v3 game and preserves limited identity/time/counters; invalid value creates fresh v3 game. | `createGame.ts`; fallback creation can consume new randomness and current time/IDs. |

Only three current rule-bearing board calls pass through generic `updateGame`: setup completion, dungeon movement/discovery/heart reach, and settlement claim/navigation. Board navigation has its own named action but lacks application-level legality validation.

### 4. Rules currently inside React or split across layers

- `SetupBoard` owns completion gating, exactly-two-point UI enforcement, bonus-skill/tree compatibility when class/vocation changes, and the duplicate class/vocation attribute preview.
- `StartBoard` owns destructive replacement/deletion confirmation. Provider owns name length/uniqueness; these are profile rules rather than campaign rules.
- `DungeonBoard` owns movement target calculation, blocked-move handling, discovery union, heart-reach detection, claim eligibility presentation, and the settlement-claim mutation.
- `src/boards/registry.ts` owns settlement unlock policy in the same module that imports React board implementations.
- `BoardNavigation` prevents user clicks on unavailable boards, but `GameProvider.navigateToBoard` does not enforce that policy. `GameApp` repairs invalid state after it is stored.
- Display-only map pan/zoom/clamp, prompts, messages, and counters may remain in React; they are not engine rules.

### 5. Duplicated, redundant, or ambiguous calculations

- Class/vocation attribute bonuses exist in `SetupBoard.automaticBonus` and separately in `createGame.ts`.
- Class/vocation names, bonus labels, and skill labels are authored in `SetupBoard`, while initial skill-ID mapping is authored in `createGame.ts` and tree metadata in `skillTrees.ts`.
- `hero.attributes` duplicates a calculation from saved choices and current rule definitions; migration deliberately rebuilds it.
- `hero.skills` stores every static skill ID, including zero ranks; the complete shape is normalized from the catalog.
- `setupComplete` duplicates the current `hero !== null` lifecycle boundary.
- Dungeon seed and full generated result are both stored without a generator/rule version. Grid dimensions, start, and heart are also reproducible from the current result/rules.
- `RuntimeState.activeGame` duplicates the selected campaign in `registry.games`; reducer branches manually keep both aligned.
- `selectedPlayerId` and persisted `lastActivePlayerId` overlap but represent session selection versus resumable registry preference.
- `updatedAt` is stamped by both `completeGameSetup` and the generic reducer and is also changed for non-rule events such as open, manual save, navigation, and return.

### 6. Identity categories and generation

| Identity | Current representation/generation | Stability and risk |
|---|---|---|
| Player/profile ID | `player-` plus `crypto.randomUUID()`; fallback uses `Date.now()` plus `Math.random()` | Persisted and used as campaign owner reference and registry game key. No collision/format validation on load. |
| Campaign/game ID | `game-` plus the same generator | Persisted stable campaign identity. No distinct TypeScript ID type from general strings. |
| Board ID | string-literal `BoardId`; `setup` plus six in-campaign IDs | `activeBoardId` is persisted. Current application/provider typing depends on the React board registry for the in-campaign subset. |
| Skill-tree/class/vocation IDs | lowercase literal unions and catalog keys | Static content identity; class/vocation IDs intentionally match skill-tree IDs. |
| Skill and branch IDs | lowercase/kebab-case strings in `skillTrees.ts` | Skill IDs are persisted in `bonusSkill` and rank records; branch IDs are static metadata. |
| Dungeon room ID | generator-local sequential number 1–5 | Stable only inside the stored dungeon snapshot; not a general entity identity. |
| Grid/cell identity | `{x,y}` positions and `"x,y"` discovered keys | Location key inside one dungeon; no dungeon/location namespace is encoded. |
| Storage keys/schema versions | fixed strings plus numeric registry/save versions | Platform/persistence identity, not entity identity. |

Minimum identity correction: introduce explicit `PlayerId` and `CampaignId` string types and an application/infrastructure ID source for new identities. Preserve every existing persisted string and prefix. Do not add a generic entity-ID framework, change current IDs, or assign global IDs to rooms/cells without a mechanic that requires them.

### 7. Gameplay-relevant randomness

There are two `Math.random()` sites in current application/game code:

1. `createDungeonLevel()` chooses a default seed with `Math.random()` when no explicit seed is passed. All subsequent dungeon layout randomness uses a local seeded `mulberry32` generator, so the same explicit seed reproduces the current algorithm’s result.
2. `createId()` uses `Math.random()` only in the fallback when `crypto.randomUUID()` is unavailable. Identity randomness is not gameplay resolution, but it is persistence-relevant and must be separated from deterministic rule RNG.

No other gameplay-relevant randomness source was found. Time is also an implicit nondeterministic input through `new Date()`/`Date.now()` and must be injected or supplied at application boundaries for pure tests, though it is not RNG.

Minimum RNG contract: pure generators and rules accept an explicit seed or a small `RandomSource` input; the application obtains a new seed from an infrastructure RNG only when creating new campaign facts. Existing v3 dungeon snapshots must never be regenerated merely because the engine boundary changes. Identity generation remains a separate `IdSource`; it must not share gameplay RNG state.

### 8. Persistence, versions, and migrations

- The browser container is `GameRegistry` version 1 stored at `dmcl.prototype.registry.v1`.
- Campaigns are `GameSave` version 3 and are stored inside `GameRegistry.games`, keyed by player ID.
- Registry validation checks only version, `players` array presence, and a non-null object for `games`; profile/campaign members are otherwise trusted and migrated with casts/structural checks.
- `migrateLegacyGame` recognizes v2/v3 objects with a dungeon containing `tiles`; it normalizes hero attributes/skills and bonus skill while retaining the rest of the shape.
- Other object-shaped values become a newly generated v3 campaign while preserving limited IDs/timestamps and dungeon level/day/treasury. This path consumes current time, a new campaign ID when absent, and a new random dungeon.
- Invalid/non-object values become a newly generated v3 campaign.
- Reads return an empty registry on JSON, guard, migration, or browser failure. Writes swallow browser errors.
- Automatic write follows every hydrated registry change. Manual Save is not the exclusive durability boundary.

The minimum persistence correction is an application-facing storage port implemented by the browser adapter, plus pure decode/validation/migration functions that can be tested without `window` or `localStorage`. EPIC 02 should preserve the registry/container policy; multiple campaigns, cloud sync, conflict handling, and save semantics belong to later approved work.

### 9. Dependency-direction problems

The intended dependency direction is not yet true around board identity and navigation:

- `GameProvider` (application/state) imports `RegisteredBoardId` from `src/boards/registry.ts` (board/view layer).
- That registry imports React `ComponentType`, `GameIcon` presentation types, and every board component. Therefore application navigation typing indirectly depends on React board implementations.
- Settlement unlock policy and board availability selectors live in that React-bearing registry, so application/domain code cannot validate legal navigation without importing board implementations.
- `BoardNavigation` (shared UI) imports both `BoardCatalogContext` and registry types from `src/boards`, contrary to the accepted shared-UI boundary.
- `GameApp` must repair illegal active-board state after the provider has already stored it because the provider cannot use the view-owned availability policy.

Minimum correction: split pure board identity/navigation descriptors and campaign-aware availability policy from React component resolution. A pure `src/game/navigation.ts` (name illustrative) should own the stable in-campaign ID type, non-React descriptors needed by application rules, and `getBoardAvailability`/`canNavigateToBoard`/fallback selection. `src/boards/registry.ts` should attach components and presentation icon metadata to those descriptors for rendering. Shared UI should receive catalog/availability data through application-facing props/context typed from the pure contract, without importing React board implementations. Preserve the EPIC 01 catalog, ordering, six IDs, components, and visible navigation.

### 10. Save-compatibility risks in EPIC 02

1. Renaming or nesting `GameSave` fields would change the serialized v3 shape. The first engine task should use a type alias/extraction while preserving the exact runtime JSON structure.
2. Changing `setupComplete`/`hero` normalization can alter whether old setup campaigns open Setup or a board.
3. Recomputing attributes or skills at different times can change old campaigns because migration currently binds them to current static definitions/rules.
4. Regenerating dungeon rooms/tiles from the seed can change saves after any generator edit because no generator version exists. Persisted snapshots must remain authoritative.
5. Changing board IDs, catalog order, unlock checks, or fallback order can redirect loaded campaigns. Existing ID strings and current visible behavior must remain stable.
6. Moving movement/claim rules behind transitions could reject states that the current UI permits unless validation is introduced deliberately and regression-tested. In particular, claim validation is currently UI-only.
7. Replacing `updateGame` can change timestamp frequency/order and the synchronization between `activeGame` and `registry.games`.
8. Moving migration code out of `createGame.ts` can introduce circular imports or cause fallback migration to consume randomness/time differently.
9. Separating player profile and campaign state must not change the current registry keying, one-campaign-per-player behavior, or player deletion cascade during EPIC 02.
10. Tightening validation could silently discard malformed-but-currently-loadable saves. Validation changes require fixtures and an explicit fallback policy.

## Accepted smallest core-engine contract

The project owner accepted this contract through DMCL-P19–P22 on 2026-08-10.

### Central state name and scope

Recommend `CampaignState` as the authoritative pure campaign type because it states the boundary precisely and avoids confusion with `RuntimeState` and `GameRegistry`. For compatibility, the implemented T02 boundary should preserve `GameSave` as the v3 serialized name/alias or envelope until a separately approved migration changes the runtime shape.

`CampaignState` should initially contain exactly the current justified v3 campaign fields—identity/lifecycle metadata, resumable active board, setup/completed hero state, and current dungeon facts/snapshots. It must not add empty calendar, settlements, world, armies, combat, or events sections.

`PlayerProfile`, `GameRegistry`, `RuntimeState`, theme/hydration, and component-local presentation state remain separate. A campaign may continue to reference `PlayerId`; it must not embed the profile.

### Application-facing operations

Expose named intent operations for current behavior only:

- create a campaign for an existing player/profile ID;
- complete hero setup;
- attempt dungeon movement;
- claim the reached dungeon heart/settlement;
- navigate to a legal board;
- save/return/load through application lifecycle coordination.

Profile creation/selection/deletion remain registry application operations, not campaign transitions. Do not create command infrastructure for future mechanics.

### Pure domain transitions

Use ordinary pure functions accepting `Readonly<CampaignState>` and explicit inputs. The immediately justified transition set is:

- hero setup validation/completion;
- dungeon move attempt, including walkability, position, discovery, and heart outcome;
- settlement claim validation/consequence;
- board navigation validation/fallback.

Where the UI needs feedback, a transition may return a small typed result such as moved/blocked/reached-heart plus the next state. This is a direct return value, not an event bus or event-sourcing model. Timestamps are application metadata supplied by a `Clock`, not hidden inside domain rules.

### Selectors

Selectors should centralize current derived reads only:

- board availability, active-board resolution, and legal navigation;
- setup/hero derived attributes and validation summaries where shared by UI and transitions;
- dungeon discovered-cell membership/progress and other repeated campaign-derived display values as concrete consumers require them.

Do not persist selector output merely for convenience. Do not build a generic query framework.

### Stable identity

Use explicit string types for `PlayerId` and `CampaignId`, preserving current values and prefixes. Supply new IDs through an application/infrastructure `IdSource`. Continue using literal stable IDs for boards and content. Add no global `EntityId`, UUID requirement for every value, or room/cell identity migration without a current mechanic.

### Deterministic RNG and time

- Pure dungeon generation requires an explicit seed.
- Campaign creation obtains that seed from an injected infrastructure random source.
- If a rule later needs multiple random draws, pass a minimal deterministic `RandomSource` (`next(): number`) or a seeded helper locally; do not create a global RNG singleton.
- Identity generation and gameplay RNG are separate sources.
- Application timestamping uses an injected `Clock` (`now(): string`) so transitions and tests do not call the wall clock.
- Existing stored dungeon snapshots remain authoritative; adding a generator version is deferred until a task changes generation compatibility.

### Persistence adapter boundary

Keep the current browser registry container and provide only the boundary now justified:

- a small application-facing registry storage interface with read/write operations;
- a browser `localStorage` implementation at the infrastructure edge;
- pure registry/campaign parsing, migration, and normalization functions testable without browser APIs;
- explicit write failure reporting to the application only when a bounded task approves the UI/semantics change.

Do not introduce cloud repositories, async synchronization, campaign collections beyond the existing registry, or server authority in EPIC 02.

### Pure engine testing

Use the existing Node >=22.13 runtime and built-in `node:test`; install no package. The T02 implementation can run TypeScript directly with the explicit `--experimental-strip-types` flag and extension-complete imports in the new pure-engine boundary, adding the smallest TypeScript configuration support required. Add a focused `test:engine` script and include it in `npm run verify` without requiring a full Sites build for each individual engine assertion.

Initial tests should protect:

- the exact v3 state boundary and separation from runtime/profile/theme state;
- existing save migration/normalization fixtures;
- deterministic dungeon generation for an explicit seed and no implicit randomness in pure calls;
- setup calculation/validation when extracted;
- movement, discovery union, heart reach, claim validation, and legal navigation as those transitions move;
- purity: no React, `window`, `localStorage`, Sites, or hosting imports in tested engine modules.

### Accepted file/module responsibilities

Names may be adjusted during implementation, but responsibilities should remain bounded:

| Module | Responsibility |
|---|---|
| `src/game/model.ts` or `src/game/state.ts` | Pure `CampaignState`/v3 `GameSave` compatibility types plus current value types; no React/browser imports. |
| `src/game/navigation.ts` | Pure stable board IDs/descriptors, unlock/availability policy, legal navigation, and fallback selection. |
| `src/game/transitions.ts` (or focused setup/dungeon transition files once needed) | Pure current rule-bearing state changes and validation; no future command catalog. |
| `src/game/selectors.ts` | Pure, concrete derived reads shared by more than one consumer or required for rules/tests. |
| `src/game/random.ts` | Seeded deterministic helper currently used by dungeon generation; no global state. |
| `src/game/ports.ts` | Only the immediately justified `Clock`, `IdSource`, and registry-storage contracts. |
| `src/game/createGame.ts` | Pure creation/setup composition during gradual extraction; no hidden time/random inputs after its responsible task. |
| `src/game/migrations.ts` | Pure v3 migration/normalization once extracted; preserve current load behavior through fixtures. |
| `src/game/storage.ts` | Browser/localStorage adapter and serialization edge; no game-rule ownership. |
| `src/game/GameProvider.tsx` | React runtime coordination, application operations, active/registry synchronization, hydration, persistence calls, and UI preferences; not rule authority. |
| `src/boards/registry.ts` | React component resolution and presentation binding over pure board descriptors; not application navigation policy. |
| `src/boards/*` | Render/select state, keep UI-only interaction state, and invoke named operations; no whole-save rule mutations. |
| `src/ui/*` | Domain-neutral presentation receiving data/callbacks; no board implementation imports or campaign mutation. |

This responsibility map does not require all files to be created at once. Each extraction should occur only in the task that needs it.

## Accepted E02-T02 through E02-T08 sequence

At audit time the repository contained no accepted detailed T03–T08 definitions. The project owner accepted the following evidence-based sequence through DMCL-P22 on 2026-08-10. Acceptance defines the order but does not permit a task to begin before its predecessor reaches Complete.

1. **E02-T02 — Establish `CampaignState` and pure engine testing.** Preserve the v3 runtime shape, separate runtime/profile/UI types, add the dependency-free Node engine test path, and add baseline state/migration/determinism tests. No broad provider rewrite.
2. **E02-T03 — Isolate clock, identity, and deterministic campaign creation inputs.** Preserve ID strings, seed outcomes, timestamps, and visible behavior while removing hidden randomness/time from pure creation paths.
3. **E02-T04 — Extract and validate the hero-setup transition.** Consolidate current setup calculations/definitions needed by rules and UI, add pure validation/tests, and remove only the setup use of generic `updateGame`.
4. **E02-T05 — Extract dungeon exploration transitions and selectors.** Move current legal movement, discovery, heart reach, and claim consequence into pure tested functions without changing map generation or balance.
5. **E02-T06 — Separate pure board navigation policy from React component registration.** Keep the EPIC 01 catalog and UI intact while making legal navigation available to application operations without board-component imports.
6. **E02-T07 — Complete named application operations and bounded provider integration.** Route the current campaign intents through operations, remove board access to the generic whole-save mutation escape hatch, and preserve active-game/registry synchronization.
7. **E02-T08 — Harden v3 engine compatibility and run the EPIC 02 exit gate.** Add focused migration/invariant/regression fixtures for all extracted transitions, verify dependency boundaries and the normal gate/manual campaign flow, reconcile documentation, and prepare the accepted checkpoint. Do not expand into EPIC 03 persistence lifecycle decisions.

Reason for adjustment: randomness/clock extraction belongs immediately after the state/test foundation because current creation and migration fallbacks consume implicit inputs. Navigation correction should follow the current dungeon/claim transitions so its availability policy is tested against the actual campaign consequence. Persistence lifecycle redesign is deliberately not pulled forward from EPIC 03; E02-T08 protects existing v3 compatibility only.

## Owner decisions accepted for E02-T02

The project owner accepted these decisions on 2026-08-10:

1. **Central name:** use `CampaignState`, with `GameSave` retained as the version-3 serialized compatibility name/alias until a future approved migration.
2. **T02 schema boundary:** preserve the exact v3 runtime JSON shape; do not nest or add future gameplay slices in T02.
3. **Test mechanism:** use Node’s built-in test runner with native TypeScript stripping and no new dependency, integrate focused engine tests into `npm run verify`.
4. **Minimum engine ports:** approve only `Clock`, `IdSource`, deterministic gameplay seed/RNG input, and the existing registry-storage boundary; no general framework.
5. **Board dependency correction:** split pure board identity/availability/navigation policy from React component resolution while preserving the EPIC 01 catalog/UI.
6. **Sequence:** use the accepted E02-T02 through E02-T08 ordering recorded above.
7. **Compatibility posture:** existing version-3 saves, persisted IDs, generated dungeon snapshots, one-campaign-per-player registry behavior, and current visible gameplay remain unchanged throughout the bounded EPIC 02 extractions unless a later task separately approves a migration.

The deferred player/profile/account relationship, number of campaigns, timestamp semantics, setup-draft persistence, generator version policy, cloud/offline behavior, and multiplayer authority do **not** block E02-T02 under this contract because T02 preserves current behavior and representation.

## Completion report

### Candidate outcome

- Summary: current campaign/state/mutation/randomness/identity/persistence/dependency boundaries are mapped and a minimal, staged core-engine contract is proposed.
- Changed files: `docs/E02-T01_CORE_ENGINE_CONTRACT_AUDIT.md`, `docs/ARCHITECTURE.md`, `docs/GAME_STATE.md`, `docs/DECISIONS.md`, `docs/ROADMAP.md`
- Acceptance evidence: see the checked criteria, current-code mutation table, state classification, compatibility risks, contract, and task sequence above.
- Automated verification: documentation/path/status/diff checks only; application build not required for a documentation-only task.
- Behavior verification: current code paths reviewed; no application behavior changed or exercised.
- Documentation/decision updates: accepted engine/state/navigation/testing contract added to responsible documents; DMCL-P19–P22 accepted; stale DECISIONS current-task wording reconciled; `CURRENT_STATE.md` unchanged.
- Limitations/risks/open approvals: detailed T03–T08 definitions were not previously present in the repository; the evidence-based sequence in this task is now accepted through DMCL-P22. Deferred later-Epic product decisions remain open and do not block E02-T02.
- Deployment: **Not performed**

### User acceptance

- Status: accepted
- Accepted by/date: project owner, 2026-08-10

### Accepted checkpoint

- Final commit SHA: accepted checkpoint commit reported in the completion handoff
- Pushed source branch: `main`
- Saved Sites version: matching accepted version reported in the completion handoff
- Roadmap status: E02-T01 Complete; EPIC 02 Current
- Next task: `E02-T02 — Establish CampaignState and pure engine testing`
- Deployment: **Not performed**
