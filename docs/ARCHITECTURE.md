# Dungeon Master & Castle Lords — Architecture

Status: architectural source of truth with explicit approval markers  
Scope: major structural principles, system boundaries, and dependency direction  
Last updated: 2026-08-14

## Purpose and authority

This document lets future development sessions understand the intended structure without the original planning conversation. It does not define gameplay rules.

- Product vision and approved game systems: [GAME_CONCEPT.md](./GAME_CONCEPT.md)
- Observed implementation, risks, and recommendations: [CURRENT_STATE.md](./CURRENT_STATE.md)
- This document: structural principles and boundaries

Status labels used here:

- **Established** — already required by the approved project direction or platform.
- **Observed** — true of the current repository, but not automatically a permanent decision.
- **Accepted** — approved architectural policy.
- **Proposed** — recommended by a bounded task and awaiting explicit owner approval.
- **TBD/Open Question** — unresolved; do not decide implicitly through implementation.

If documents appear to conflict, `GAME_CONCEPT.md` governs product intent, this document governs approved structure, and `CURRENT_STATE.md` governs claims about what is implemented today.

## Architectural objective

**Established:** Build a mobile-first browser game as a modular collection of interactive boards over one persistent campaign state. The strategic/management, exploration, and tactical loops must exchange consequences through that state. Boards should be easy to add or remove without unrelated rewrites.

The architecture should support fast prototype iteration without allowing UI components, storage details, or platform services to become the definition of game rules.

## Current baseline

**Observed:** The application uses React 19 with Next.js 16 application conventions, adapted by Vinext/Vite for an OpenAI Sites Cloudflare Worker deployment. It currently has:

- a client entry that mounts one global game provider and application orchestrator;
- typed game models, creation/migration rules, deterministic dungeon generation, and skill definitions under `src/game/`;
- board views under `src/boards/` plus a metadata registry;
- reusable shell/navigation/sheet/icon UI under `src/ui/`;
- versioned campaign data persisted to browser `localStorage`;
- platform entry, optional storage scaffolding, and Sites configuration at repository edges.

The current evidence hierarchy and limitations are documented in `CURRENT_STATE.md`. The application uses named validated transitions, a pure board-navigation policy, an injected application clock, and pure lifecycle/persistence helpers, while one provider still coordinates runtime/session concerns. Active/registry mirroring and one global stylesheet remain observed implementation choices. E03-T02 implements the accepted browser-local one-campaign lifecycle target described below without changing the campaign schema.

## Current core-engine architecture

**Accepted and implemented through EPIC 02.** The authoritative pure campaign type is `CampaignState`; `GameSave` is its version-4 serialized compatibility alias. Version 4 adds only the persisted campaign RNG seed to the earlier v3 shape. `CampaignState` contains current justified campaign facts and compatibility snapshots. `PlayerProfile`, `GameRegistry`, `RuntimeState`, theme/hydration, and board-local presentation state remain outside it.

The current engine surface is:

- named application operations for the current campaign intents;
- pure validated transitions for hero setup, dungeon movement/discovery/heart outcome, settlement claim, and board navigation as each bounded task extracts them;
- concrete selectors for current derived reads such as board availability and shared hero/dungeon calculations;
- explicit application/infrastructure inputs for player/campaign identity, lifecycle time, and new gameplay seeds, with identity entropy, wall-clock time, and deterministic rule RNG kept separate;
- browser `localStorage` at the infrastructure edge behind a raw string adapter, with pure staged decode/validation/migration and verified registry-write orchestration inward of that adapter;
- pure engine tests using the existing Node runtime, without React, browser APIs, Sites/Cloudflare code, or a new testing dependency.

This architecture does not use a command framework, event bus, event sourcing, CQRS, ECS, state-management library, cloud repository, or placeholder future gameplay slices. `GameProvider` continues coordinating React runtime state and persistence while delegating the current rule-bearing changes to named pure operations.

### E02-T02 implemented foundation

E02-T02 establishes `src/game/campaignState.ts` as the pure campaign/model boundary. It defines `CampaignState` with exactly the version-3 campaign fields and retains `GameSave` as a type alias, so existing serialized campaigns keep the same runtime shape and require no migration. `src/game/model.ts` now re-exports those campaign types for compatibility while separately owning `PlayerProfile`, `GameRegistry`, `RuntimeState`, and application-view state. Theme, hydration behavior, and board-local presentation remain outside the campaign contract.

Focused engine verification uses the supported Node runtime and built-in `node:test` with native TypeScript stripping. `npm run test:engine` exercises the state boundary, migration/normalization, deterministic Dungeon generation, identity, selectors, transitions/navigation, lifecycle/persistence, dependency purity, and the inspector contract without rendering React or building Sites. The normal `npm test` and `npm run verify` paths include these focused tests. At the E02-T02 checkpoint, identity, transitions, and campaign-seed work were still later tasks; E02-T03, E02-T04, and E02-T06 subsequently implemented those boundaries, and E03-T02 later implemented clock/persistence isolation.

### E02-T03 implemented identity boundary

E02-T03 establishes `src/game/identity.ts` as the pure current identity contract. `PlayerId` and `CampaignId` are distinct string types retaining the existing `player-…` and `game-…` prefixes. New values come from an injected `IdSource` and pass current-format narrowing before entering new profiles or campaigns. The system crypto adapter lives separately in `src/game/systemIdSource.ts`; it uses `crypto.randomUUID()` and cannot consume the dungeon/gameplay random stream.

This is not a generic entity system. Skills, boards, faction/class/vocation values, and other reusable definitions retain their literal content IDs. Cell keys remain coordinate-derived `CellKey` values, and dungeon room numbers remain stored snapshot-local ordinals rather than global entity identities. No hero, settlement, region, army, unit, or item identity exists until an approved mechanic has a persistent instance that needs one. Existing loaded IDs are never rewritten merely for format consistency.

The provider and browser-storage adapter supply the system identity source to current player/campaign creation and migration fallback paths. E02-T03 deliberately left clock and gameplay-seed work outside its identity scope; E02-T06 subsequently implemented the campaign-seed boundary, and E03-T02 later added the separate injected application clock.

### E02-T04 implemented transition boundary

E02-T04 establishes `src/game/transitions.ts` as the small pure boundary for the four current rule-bearing campaign intents: complete Hero Setup, move the Hero inside the current Dungeon, claim the Settlement after reaching the Dungeon Heart, and navigate to an available board. Each transition validates its current-state and input prerequisites and returns a typed success/failure result. The functions do not stamp time, persist, render, or import React/browser/platform code.

The setup transition is now authoritative for the existing two-point allocation, selected path/root skills, legal root-or-tier-1 bonus skill, initial position/vision/discovery, setup completion, and Dungeon entry. It delegates calculated Hero attributes to the E02-T05 selector boundary below. `SetupBoard` consumes the same transition validation for readiness, while setup completion and `createGame.ts` migration normalization consume the same attribute selector.

The Dungeon transition computes destination, walkability, discovery union, position, and historical Heart reach. Settlement claim validates the Heart prerequisite and uses the same legal-navigation policy for the resulting Settlement entry. Boards retain keyboard/touch input, prompts, copy, animation, and other presentation state.

`GameProvider` exposes exactly these named campaign operations and remains responsible for application timestamp stamping plus active-campaign/registry mirroring. The migrated boards no longer receive an unrestricted `updateGame` function; no unrelated lifecycle, storage, theme, or provider responsibility was rewritten.

### E02-T05 implemented selector boundary

E02-T05 establishes `src/game/selectors.ts` as the narrow pure derived-state authority for the current Hero attribute mechanic. It owns the existing Fighter/Strength, Ranger/Perception, Mage/Intellect, General/Leadership, Spy/Agility, and Diplomat/Charisma bonus mappings, the combined path bonus, and total attributes from free allocation plus those bonuses. The selector module imports no React, board, browser, storage, or platform code.

`SetupBoard` derives both path-card bonus copy and the live attribute preview from this authority. `completeHeroSetup` writes the same calculated total into the stored Hero snapshot, and `migrateLegacyGame` refreshes that snapshot from the saved class, vocation, and free-allocation facts during supported save normalization. This is a concrete selector for a shared calculation, not a universal query layer; board availability remains in its already justified pure navigation policy, and no trivial property selectors were added.

### E02-T06 implemented campaign RNG boundary

E02-T06 establishes `src/game/random.ts` as the small pure randomness contract. It defines a validated unsigned 32-bit `CampaignSeed`, a stateful `RandomSource` returned from an explicit seed, and the integer helper required by the current Dungeon generator. It does not define global state, future-system streams, counters, or random gameplay commands.

`CampaignState`/`GameSave` version 4 adds exactly one `campaignSeed` stored fact. New campaigns obtain it from `systemCampaignSeedSource` at the application edge; the current initial Dungeon uses that same seed because it is the only implemented random game system. `IdSource` and `systemIdSource` remain independent and cannot consume or advance gameplay RNG.

`createDungeonLevel` now requires an explicit seed and reuses the unchanged Mulberry32 algorithm through the pure contract. Supported version-2/version-3 campaigns migrate by adopting their already-stored Dungeon seed as `campaignSeed`; their persisted Dungeon result remains authoritative and is never regenerated. The system seed adapter uses platform entropy only to create a new campaign fact and imports no identity contract. Clock isolation remains separate unscheduled work.

### E03-T04 candidate starting-World generator boundary

`src/game/generateStartingWorld.ts` is a pure domain generator over an explicit `CampaignSeed` and the E03-T03 opening catalogs. It owns the minimum axial-coordinate helpers, the accepted canonical first-ring order, the DMCL-P41 FNV-1a World-seed derivation, a fresh World-only deterministic random source, family-specific generated instance IDs, generator version `1`, snapshot assembly, and snapshot validation.

The generator returns one Tier-1 Village capital reference, one home region plus six controlled adjacent regions, three distinct resource-site placements, two distinct location placements, and one derived terrain-only neighbor. Region output remains in canonical coordinate order; site and location arrays remain in catalog order; only content-to-region placement is shuffled by the World stream. This makes serialized output stable while allowing approved placement variation across seeds.

The module imports no React, board, provider, storage, clock, identity entropy, browser, crypto, or hosting API. It does not accept or mutate a Dungeon snapshot and does not call `createDungeonLevel`; fixed tests protect the legacy Dungeon bytes and structure. The persistable result types are not part of `CampaignState` version 4. E03-T05 alone owns adding the authoritative snapshot to version 5 and migration/load behavior.

### E02-T07 developer inspector boundary

E02-T07 adds one view-layer `DeveloperStateInspector` behind `import.meta.env.DEV` in the existing Settings sheet. Settings is already reachable from Hero Setup and every in-campaign `GameShell`, so no debug board, navigation entry, provider operation, or second overlay architecture is introduced. Production Settings does not render the entry.

The inspector reads the current `activeGame` working copy and calls `selectHeroAttributes` for current Hero totals. It serializes that same campaign object for read-only JSON and offers only browser clipboard writes for the campaign seed and JSON text. It does not import transitions, storage, identity/RNG sources, or any unrestricted mutation API.

Inspector-open state and copy feedback are component-local UI state. The shared `ModalOverlay` continues to own focus containment, Escape/backdrop closing, body-scroll containment, and focus restoration. No debug state enters `CampaignState`, `RuntimeState`, `GameRegistry`, or persistence.

### Accepted board-policy correction

Before E02-T04, the application/state layer imported `RegisteredBoardId` from `src/boards/registry.ts`, which also imported React component types and every board implementation. Settlement unlock and active-board fallback policy were therefore unavailable to application code without depending on the board/view layer. Shared `BoardNavigation` also imported a board-layer context and registry types.

**Accepted and implemented minimum correction:** `src/game/navigation.ts` owns stable in-campaign board identity, six ordered non-React descriptors, campaign-aware registered/enabled/unlocked/active availability, legal navigation inputs, and fallback selection. `src/boards/registry.ts` now only attaches the existing React components to those descriptors. `GameProvider` and `BoardNavigation` import the pure policy rather than the React registry; `GameApp` uses pure resolution and then asks the React registry only for the selected component. The EPIC 01 ordering, IDs, labels, icons, components, enabled states, Settlement unlock, fallback behavior, and visible navigation remain unchanged.

Full audit evidence, save risks, module responsibilities, and staged tasks are recorded in [E02-T01_CORE_ENGINE_CONTRACT_AUDIT.md](./E02-T01_CORE_ENGINE_CONTRACT_AUDIT.md).

### E02-T08 accepted exit audit

The final EPIC 02 audit verifies the implemented flow as board/UI intent → named provider operation → pure validated transition/navigation policy → authoritative `CampaignState` → pure selectors/policy → board rendering. The persistence flow remains `CampaignState` ↔ explicit normalization/migration ↔ the version-1 browser registry adapter. Source/import review finds no React, browser persistence, board implementation, or Sites/Cloudflare dependency in the tested pure engine modules; application navigation legality uses `src/game/navigation.ts`, while React board registration remains a view-composition concern.

The current boards do not directly rewrite the migrated Hero Setup, movement/discovery/Heart, Settlement claim, or navigation facts, and no unrestricted whole-campaign updater remains in their normal API. The existing provider still coordinates timestamps, the active working copy, registry mirroring, lifecycle operations, and storage; this is known bounded application-layer debt rather than campaign-rule authority. No generic framework or speculative gameplay/state slice was introduced.

`npm run test:engine` and `npm run verify` passed at the exit gate, and the owner confirmed the independent GitHub Actions `Verify` result as PASS. The owner accepted E02-T08 and EPIC 02 on 2026-08-10. Complete evidence and residual limitations are recorded in [E02-T08_EPIC_02_EXIT_GATE.md](./E02-T08_EPIC_02_EXIT_GATE.md).

## Structural principles

### 1. One authoritative campaign state

**Established.**

All boards operate on one coherent campaign. Hero, faction, locations, territory, holdings, resources, supply, exploration, and combat outcomes must not become independent board-local versions of the same truth.

Transient presentation state—such as an open sheet, camera position, hover state, or an unfinished form that has explicitly been classified as disposable—may remain local to a view. Whether a gameplay choice is transient or campaign state must be decided deliberately.

### 2. Boards are modular interaction surfaces

**Established.**

Each major activity is represented by a focused board: player/setup, dungeon or building exploration, holding management, world strategy, tactical combat, and future approved boards.

A board owns its presentation and board-specific interactions. It does not own a separate campaign, persistence system, theme system, or duplicate shared rules. Adding or removing a board should have a bounded integration surface.

### 3. Separate rules, state, views, and platform concerns

**Accepted.**

The approved direction is broadly MVC-like, without requiring a particular framework-specific MVC library:

- **Domain/model:** campaign entities, value types, invariants, deterministic rules, commands/events, and migrations.
- **Application/state:** coordinates player/campaign lifecycle, board transitions, domain operations, and persistence boundaries.
- **Views/boards/UI:** render state and translate user intent into application/domain operations.
- **Infrastructure/platform:** browser storage, future cloud services, authentication, Sites/Worker integration, and other external adapters.

Dependencies should point toward the domain. Game rules must not depend on React components, browser APIs, or hosting-specific modules.

### 4. Shared consequences use explicit state transitions

**Accepted.**

Cross-board effects must pass through the central application/domain boundary. A tactical result, dungeon claim, world conquest, or supply change should be represented as an explicit campaign transition rather than an unrelated collection of view-level mutations.

No generic command/event framework is established or required. Current rule-bearing changes use ordinary named, validated, testable pure transition functions; future mechanics should extend that pattern only when their approved rules require it.

### 5. Persistent data is versioned and migratable

**Accepted, building on the observed foundation.**

Campaign data must have explicit schema versions and controlled migrations. Persisted input is untrusted and should be validated before use. A storage implementation must not dictate the domain model.

The current versioned save and migration approach is a foundation to preserve. Browser storage remains a prototype adapter; cloud persistence, identity, synchronization, and multiplayer storage are unresolved.

### 6. Deterministic rules where practical

**Accepted.**

Procedural generation and rule calculations should accept explicit inputs, including seeds where randomness is involved, and produce reproducible results where practical. This supports reliable saves, debugging, tests, and possible future simulation or multiplayer.

This principle does not prescribe deterministic networking or a multiplayer protocol.

### 7. Shared content has one authoritative definition

**Accepted.**

Rule-bearing content—such as hero paths, skill prerequisites/effects, units, terrain, buildings, or resources—should not be independently redefined in views and rule modules. Presentation may derive labels and previews from authoritative typed content.

TypeScript definitions are the accepted prototype content format. External schemas or authoring tooling remain TBD until a concrete need justifies them.

### 8. Design-system and interaction foundations are shared

**Established.**

Boards reuse semantic FS design tokens, system-dark behavior, responsive/safe-area foundations, accessible interaction patterns, and shared UI primitives. Game-object colors remain distinct from semantic UI colors as defined by the concept.

Styles may be organized per stable module as the project grows; no styling technology migration is approved here.

**Accepted — DMCL-P17.** Synchronize the existing FS adapter through a deterministic, dependency-free generation step. `sources/fs.tokens.json` remains the only authority for directly mapped FS values; a committed generated CSS file preserves the current custom-property names and the current `:root`/`:root[data-theme="dark"]` mode boundary. Handwritten CSS continues to own derived surfaces, borders, shadows, radii, and component-local variables. A narrowly generated TypeScript projection exposes the existing default primitive banner values without changing their persisted representation. Generation has a non-writing drift check used by normal verification. Muted and dark-high-contrast source modes remain intentionally unexposed until separately approved.

The E01-T02 implementation uses `scripts/generate-fs-token-adapter.mjs` to write `app/fs-tokens.generated.css` and `src/ui/fs-game-colors.generated.ts`. `app/globals.css` imports the generated CSS before its handwritten derived/application layer. `npm run tokens:generate` is the explicit write operation; `npm run tokens:check` is non-writing and runs before normal lint/build verification. The generator uses an explicit allowlist, so new FS modes or primitives do not silently become application API.

The shared application-shell boundary is the existing `GameShell`. It owns the persistent app/status area, campaign-status area, one labelled board viewport, `BoardNavigation`, a local overlay layer, and a polite notification region. Boards supply viewport content, while shared controls invoke existing application-facing callbacks; boards do not recreate global shell/navigation or transfer campaign-rule authority into shared UI.

Shared modal sheets use the small `ModalOverlay` presentation primitive for dialog semantics, title association, Escape/backdrop dismissal, initial focus, keyboard focus containment, opener-focus restoration, and background scroll locking. `HeroSheet` and `SettingsSheet` are the first consumers. This is a reusable interaction foundation, not a global modal state machine. `NotificationRegion` similarly provides only an always-mounted live region and presentation slot; campaign-saved feedback is its first consumer, with no queue or game-event ownership.

E01-T06 establishes the initial domain-neutral presentation vocabulary in `src/ui/GamePrimitives.tsx`: Panel, Stat, ResourceIndicator, ProgressBar, ActionButton, Slot, Tooltip/InfoSheet, SVG GridCell, and SVG-first GameToken. These components accept primitive display values, visual states, children, token colors, and callbacks; they do not import concrete board or campaign models or derive game rules. `ActionButton` is the typed entry to the existing `.button` variants rather than a second button system. `InfoSheet` pairs optional pointer/focus help with a click/tap `ModalOverlay`, so important information is never hover-only. `GameToken` uses FS primitive game colors or their persisted generated projections for game-world identity, while Panel and other interface primitives use semantic/derived UI tokens. Adoption is intentionally incremental through representative existing consumers.

### 9. Mobile-first does not mean mobile-only

**Established.**

Portrait smartphone interaction is the primary design and testing target. Board input must support touch first while retaining appropriate keyboard, pointer, larger-screen, reduced-motion, and accessibility behavior.

### 10. Platform code stays at the edges

**Accepted.**

OpenAI Sites, Cloudflare Worker, Vinext/Vite, browser APIs, authentication, and future persistence services are delivery/infrastructure concerns. Their adapters may call application interfaces; domain rules should not import them.

Preserve the current Sites-compatible project and Worker output unless a separately approved platform decision replaces it.

### 11. Prototype changes must remain reversible

**Established.**

Unapproved mechanics may be implemented only as clearly labeled experiments. Implementation alone does not make a gameplay or architectural choice canonical. Prefer small, bounded additions over speculative general frameworks.

### 12. Verification follows risk and boundaries

**Accepted and initially implemented.**

Deterministic rules, state transitions, migrations, and generation should be testable without rendering the full application. Board integration and important player flows need focused interaction coverage. Platform output needs its existing artifact validation.

E02-T02 adds the first dependency-free pure-engine suite through `npm run test:engine`. It runs TypeScript modules directly with Node's built-in test runner and participates in the normal repository gate without making each focused assertion pay for a Sites build.

**Accepted — DMCL-P18.** Use `npm run verify` as the shared normal quality gate on ChatGPT Sites/Linux, local macOS, and GitHub Actions Linux. It checks generated FS-token synchronization, lint, focused engine tests, one bounded Vinext build plus artifact validation, and the rendered-HTML test. The normal bounded build uses Node standard-library process control so it is portable across Linux and macOS. The protected `npm run install:ci` path remains specific to ChatGPT Sites/Linux; macOS and GitHub Actions use `npm ci`. GitHub Actions is the independent automated checkpoint, but it does not replace rendered interaction/mobile checks or owner physical-smartphone acceptance.

## Target module contract

**Accepted and implemented at the current catalog boundary:** Each in-campaign board is registered through one authoritative typed catalog. A board module contains or references:

- stable board ID and navigation metadata;
- view/component resolution;
- availability and unlock rules as separate concepts;
- the state slice or selectors it reads;
- named application/domain operations it may invoke;
- optional route/entry requirements and cleanup behavior.

The central application resolves boards from this catalog rather than duplicating board knowledge in conditional rendering and navigation. This preserves the registry boundary while keeping add/remove behavior bounded.

E01-T04 establishes the initial concrete contract in `src/boards/registry.ts`: each registered module provides its stable `BoardId`, labels, icon, React component, independent `enabled` flag, and campaign-aware `isUnlocked` rule. E01-T05 registers the complete in-campaign family—Hero, Settlement, World, Dungeon, Combat, and Diplomacy—through that contract. Dungeon and Settlement remain the real prototype boards; Hero, World, Combat, and Diplomacy are explicitly empty EPIC 01 foundations. Setup remains the pre-campaign flow outside the board catalog.

`GameApp` is the in-campaign board router. It resolves the requested active ID through the pure navigation policy, renders the matching React registry component, and repairs an unregistered, disabled, or locked active ID to the first enabled and unlocked descriptor through the named `navigateToBoard` application operation. This is state-based in-shell resolution, not browser URL routing. `BoardNavigation` reads the same pure descriptors and availability selector directly; it does not import React board implementations or a board-layer context.

The initial availability selector exposes `registered`, `enabled`, `unlocked`, `active`, and derived `available` independently. Settlement's existing `dungeon.settlementClaimed` rule owns only `unlocked`; it does not alter the module's enabled state. The four empty foundations are temporarily enabled and unlocked solely so EPIC 01 can verify catalog, router, shell, and navigation behavior; this does not establish future gameplay unlock rules. Board components continue reading their existing campaign state and invoking existing application-facing operations; richer declarative state-slice, operation, entry, or cleanup declarations remain deferred until a concrete board needs them.

The portrait board navigation keeps the six primary destinations in one compact row, using catalog short labels and a 44-pixel minimum destination width. It scrolls horizontally only below the width required to preserve those minimum targets; no gameplay hierarchy or secondary router is introduced. On larger screens the same catalog remains a vertical rail. The Hero destination is the future full management surface and does not replace the shell's quick-information `HeroSheet`.

## Dependency direction

**Accepted:** Use the following dependency direction as modules expand:

```text
platform adapters ─┐
                   ├─> application/state ─> domain/model/rules
boards and shared UI ┘

content definitions ─────────────────────> domain/model/rules
```

- Domain imports no React, browser, storage, or Sites modules.
- Application coordinates domain operations and infrastructure interfaces.
- Boards depend on application-facing operations/selectors and shared UI.
- Infrastructure implements persistence, identity, and platform interfaces.
- Shared UI does not import board-specific modules or change campaign state directly.

Folder names may evolve; dependency responsibilities matter more than a prescribed directory tree.

## State and persistence boundaries

### Campaign state

**Established:** State whose loss would change campaign truth belongs in the versioned campaign model. Examples include completed hero choices, progression, explored/controlled locations, resources, supply, and resolved outcomes once those systems are approved.

**TBD/Open Question:** unfinished hero setup, encounter drafts, undo/history, camera state, notifications, and other session state need explicit classification.

### State transitions

**Accepted and implemented for current playable interactions:** Replace broad whole-save mutation gradually with named domain/application operations as each system gains rules. E02-T04 moves every current playable-board rule-bearing mutation behind validated setup, movement, claim, and navigation operations, so the generic whole-campaign updater is no longer exposed. Profile/campaign lifecycle, save, return, hydration, storage, theme, and future mechanics remain separate bounded work rather than being forced into a command framework.

### Persistence adapters

**Established:** Keep persistence behind a boundary and preserve schema versioning/migrations.

**Accepted for the browser-local MVP transition:** Application lifecycle code depends on a small storage port with typed read/write outcomes and a small injected `Clock`; browser APIs and wall-clock construction remain infrastructure concerns. The boundary must distinguish legitimate absence from storage unavailability, parse, registry/profile/campaign validation, migration, serialization, quota/write, and verification failures. It must not expose raw platform exceptions to players.

Hydration is a staged read/decode/validate/migrate operation. A failed stage suppresses automatic writes and cannot produce a legitimate empty replacement. The original serialized payload remains intact until a candidate replacement is written, read back, and validated. A later write failure leaves the in-memory campaign explicitly unsaved and retryable.

For EPIC 03, each local profile has at most one campaign. Confirmed replacement/profile deletion are application transactions, not domain rules: destructive success is reported only after verified persistence, and the previous durable entry remains recoverable until then. Manual Save uses the same immediate verified adapter write and changes no timestamps by itself.

**Implemented in E03-T02:** The timestamp policy separates immutable campaign creation time, campaign modification/resume-context time, and successful profile New/Continue activity through the smallest explicit `Clock`. The application uses pure lifecycle helpers and a raw storage port; `src/game/storage.ts` is the only campaign-registry module that touches browser storage. Hydration never writes, all writes serialize and verify exact readback, verification failure attempts rollback, and destructive replacement/deletion commits in memory only after verified persistence. The current registry remains version 1 under its existing key; the conditional registry-v2 cutover is not pulled forward.

This boundary does not introduce a time framework, repository framework, database abstraction, event sourcing, CQRS, or alternate state library.

**Still open beyond the local MVP:** authenticated cloud saves, synchronization/conflict resolution, broader ownership, cross-device/offline guarantees, export/import, and multiplayer authority.

## Board-to-board integration

**Established:** Boards communicate through central campaign transitions, not direct component coupling. A board may request navigation, but navigation must respect campaign state and availability/unlock rules.

**Accepted:** Distinguish these concepts in the board contract:

- **registered:** the application knows the board exists;
- **enabled:** the implementation is available in this release;
- **unlocked:** the current campaign permits entry;
- **active:** it is the current interaction surface.

World, combat, and future systems must define their own state and transition contracts before implementation. `GAME_CONCEPT.md` identifies the intended information flow but deliberately leaves its rules open.

## Data and content rules

- Stable persisted IDs must not depend on display labels.
- Derived indexes and display previews should be generated from authoritative definitions where practical.
- Persist durable player choices and outcomes; recompute safe derived values when doing so is explicitly part of the migration/rule contract.
- Random generation that affects campaign truth must store enough information to reproduce or persist the result.
- Persisted schemas require migration and validation plans before incompatible changes.

**Accepted:** These are formal data rules.

## Out of scope for this architecture decision

This document does not approve:

- detailed gameplay, economy, conquest, supply, combat, or progression rules;
- a specific state-management library;
- a cloud database, authentication model, API style, or multiplayer protocol;
- detailed grid algorithms and board-specific interaction rules;
- a CSS framework migration or design-system rewrite;
- dynamic plugin loading, micro-frontends, event sourcing, ECS, or a server-authoritative simulation;
- refactoring solely to match a preferred folder structure.

## Open questions requiring approval

1. Beyond the accepted disposable Hero Setup draft and stored active-board context, what additional session/view state should persist?
2. Beyond the accepted one-campaign browser-local MVP and verified-save semantics, what future authenticated identity, cloud sync, offline, export/import, and ownership model is required?
3. Should future multiplayer constrain architecture later; if yes, what authority and synchronization model is required?
4. Should styling remain handcrafted CSS, use Tailwind intentionally, or defer that choice?
