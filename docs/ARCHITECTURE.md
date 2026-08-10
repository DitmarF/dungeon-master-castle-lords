# Dungeon Master & Castle Lords — Architecture

Status: architectural source of truth with explicit approval markers  
Scope: major structural principles, system boundaries, and dependency direction  
Last updated: 2026-08-10

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

The exact hierarchy and limitations are documented in `CURRENT_STATE.md`. Current patterns such as one large provider, generic whole-save mutation, hard-coded board rendering, one global stylesheet, one campaign per player, and browser-only persistence are prototype facts—not approved long-term architecture.

## EPIC 02 core-engine contract

**Accepted through DMCL-P19–P22 on 2026-08-10.** Name the authoritative pure campaign type `CampaignState`, while retaining `GameSave` as the version-3 serialized compatibility name or alias until a separately approved migration changes the runtime shape. `CampaignState` contains only current justified campaign facts and snapshots. `PlayerProfile`, `GameRegistry`, `RuntimeState`, theme/hydration, and board-local presentation state remain outside it.

The smallest engine surface is:

- named application operations for the current campaign intents;
- pure validated transitions for hero setup, dungeon movement/discovery/heart outcome, settlement claim, and board navigation as each bounded task extracts them;
- concrete selectors for current derived reads such as board availability and shared hero/dungeon calculations;
- explicit application/infrastructure inputs for clock, player/campaign identity, and new gameplay seeds, with identity randomness separate from deterministic rule RNG;
- a small registry-storage port with browser `localStorage` at the infrastructure edge and pure migration/normalization functions;
- pure engine tests using the existing Node runtime, without React, browser APIs, Sites/Cloudflare code, or a new testing dependency.

This proposal does not require a command framework, event bus, event sourcing, CQRS, ECS, state-management library, cloud repository, or placeholder future gameplay slices. Extraction is incremental; `GameProvider` may continue coordinating React runtime state and persistence while it delegates rule-bearing changes to named operations.

### E02-T02 implemented foundation

E02-T02 establishes `src/game/campaignState.ts` as the pure campaign/model boundary. It defines `CampaignState` with exactly the version-3 campaign fields and retains `GameSave` as a type alias, so existing serialized campaigns keep the same runtime shape and require no migration. `src/game/model.ts` now re-exports those campaign types for compatibility while separately owning `PlayerProfile`, `GameRegistry`, `RuntimeState`, and application-view state. Theme, hydration behavior, and board-local presentation remain outside the campaign contract.

Focused engine verification uses the supported Node runtime and built-in `node:test` with native TypeScript stripping. `npm run test:engine` exercises the state boundary, existing migration/normalization, explicit-seed dungeon determinism, and dependency purity without rendering React or building Sites. The normal `npm test` and `npm run verify` paths include these focused tests. E02-T02 was only the state/test foundation; E02-T03 adds the bounded identity policy below, while clock/gameplay-seed inputs and setup/dungeon/navigation/provider transitions remain later work.

### E02-T03 implemented identity boundary

E02-T03 establishes `src/game/identity.ts` as the pure current identity contract. `PlayerId` and `CampaignId` are distinct string types retaining the existing `player-…` and `game-…` prefixes. New values come from an injected `IdSource` and pass current-format narrowing before entering new profiles or campaigns. The system crypto adapter lives separately in `src/game/systemIdSource.ts`; it uses `crypto.randomUUID()` and cannot consume the dungeon/gameplay random stream.

This is not a generic entity system. Skills, boards, faction/class/vocation values, and other reusable definitions retain their literal content IDs. Cell keys remain coordinate-derived `CellKey` values, and dungeon room numbers remain stored snapshot-local ordinals rather than global entity identities. No hero, settlement, region, army, unit, or item identity exists until an approved mechanic has a persistent instance that needs one. Existing loaded IDs are never rewritten merely for format consistency.

The provider and browser-storage adapter supply the system identity source to current player/campaign creation and migration fallback paths. Clock and gameplay-seed inputs remain hidden and explicitly outside this owner-defined E02-T03 task; setup/dungeon/navigation/provider transition extraction also remains later work.

### Accepted board-policy correction

The current application/state layer imports `RegisteredBoardId` from `src/boards/registry.ts`, which also imports React component types, icons, and every board implementation. Settlement unlock and active-board fallback policy are therefore unavailable to application code without depending on the board/view layer. Shared `BoardNavigation` also imports board-layer context and registry types.

**Accepted minimum correction:** separate stable in-campaign board identity, non-React descriptors, campaign-aware availability, legal navigation, and fallback selection into a pure game/application module. Keep `src/boards/registry.ts` as the React component/presentation binding over those descriptors. Shared UI should receive navigation data and callbacks through the application-facing contract rather than importing board implementations. Preserve the EPIC 01 catalog, ordering, IDs, components, availability behavior, and visible navigation; do not rebuild the board architecture.

Full audit evidence, save risks, module responsibilities, and staged tasks are recorded in [E02-T01_CORE_ENGINE_CONTRACT_AUDIT.md](./E02-T01_CORE_ENGINE_CONTRACT_AUDIT.md).

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

The exact command/event model is not yet established. The principle is that rule-bearing changes are named, validated, testable, and traceable.

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

**Accepted:** Evolve each playable board into a typed module registered through one authoritative board catalog. A board module contains or references:

- stable board ID and navigation metadata;
- view/component resolution;
- availability and unlock rules as separate concepts;
- the state slice or selectors it reads;
- named application/domain operations it may invoke;
- optional route/entry requirements and cleanup behavior.

The central application would resolve boards from this catalog rather than duplicating board knowledge in conditional rendering and navigation. This preserves the existing registry idea while making add/remove behavior genuinely modular.

E01-T04 establishes the initial concrete contract in `src/boards/registry.ts`: each registered module provides its stable `BoardId`, labels, icon, React component, independent `enabled` flag, and campaign-aware `isUnlocked` rule. E01-T05 registers the complete in-campaign family—Hero, Settlement, World, Dungeon, Combat, and Diplomacy—through that contract. Dungeon and Settlement remain the real prototype boards; Hero, World, Combat, and Diplomacy are explicitly empty EPIC 01 foundations. Setup remains the pre-campaign flow outside the board catalog.

`GameApp` is the in-campaign board router. It resolves the requested active ID through the catalog, renders that module's component, and repairs an unregistered, disabled, or locked active ID to the first enabled and unlocked module through the named `navigateToBoard` application operation. This is state-based in-shell resolution, not browser URL routing. `BoardNavigation` receives the identical catalog and availability selector through `BoardCatalogProvider`; the provider transports the authoritative definitions without creating a second authority or making shared UI import board implementations.

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

**Accepted:** Replace broad whole-save mutation gradually with named domain/application operations as each system gains rules. Validate invariants at those boundaries. Do not refactor everything pre-emptively; introduce operations alongside real mechanics.

### Persistence adapters

**Established:** Keep persistence behind a boundary and preserve schema versioning/migrations.

**TBD/Open Question:** local-only versus authenticated cloud saves, one versus multiple campaigns, ownership, synchronization/conflict resolution, offline behavior, export/import, and multiplayer authority.

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

1. What session or draft state must persist, beginning with unfinished hero setup?
2. What is the authoritative player/campaign/persistence model: campaign count, identity, cloud sync, offline behavior, and save semantics?
3. Should future multiplayer constrain architecture now; if yes, what authority and synchronization model is required?
4. What verification gates and supported local development environment are required?
5. Should styling remain handcrafted CSS, use Tailwind intentionally, or defer that choice?
