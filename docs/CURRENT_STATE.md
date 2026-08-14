# Dungeon Master & Castle Lords — Current State Audit

Audit date: 2026-08-10

Audited checkout: `/Users/dimi/Projects/dungeon-master-castle-lords`

Branch: `main`

Source commit inspected: `80604a1da061bacbd1becb315268b57a387deaeb` (`Document EPIC 02 exit gate`)

> **Audit scope notice:** This is a fresh evidence-based audit of the repository after the accepted EPIC 01 and EPIC 02 engineering work. The closure changes that accompany this audit are documentation-only and do not alter the inspected application behavior.

> **Incremental EPIC 03 evidence (2026-08-14):** The audit body below records the EPIC 02 checkpoint and is retained for historical evidence. Where it conflicts with the current repository, accepted E03-T01–T06 records and the in-progress [E03-T07 Candidate](./E03-T07_OPENING_BOARDS_SUMMARIES_AND_INSPECTION.md) supersede it. The current application uses campaign version 5 and registry version 2, opens with an established Castle Village/home ring, renders authoritative Settlement/World/Hero summaries, enters the retained Dungeon through its regional World context, and reports typed local-storage/migration states. Economy, Roads, travel, projects, units, Combat, Diplomacy mechanics, and strategic Day/resources remain unimplemented.

## Purpose and evidence labels

This document records what the current repository implements. It is evidence, not target architecture or approval of unresolved product behavior.

- **Observed** — directly supported by current source, configuration, or tests.
- **Owner-confirmed** — manually reported by the project owner; not independently inferred from source.
- **Interim limitation** — current behavior or debt that is not an accepted permanent product rule.
- **Not implemented** — an approved concept or scaffold has no corresponding gameplay system today.

Product intent lives in [GAME_CONCEPT.md](./GAME_CONCEPT.md), approved structure in [ARCHITECTURE.md](./ARCHITECTURE.md), runtime ownership in [GAME_STATE.md](./GAME_STATE.md), and decision status in [DECISIONS.md](./DECISIONS.md).

## Executive summary

**Observed:** The repository contains a mobile-first browser-game prototype using React 19 and Next.js 16 application conventions through Vinext/Vite and an OpenAI Sites Cloudflare Worker. Its implemented loop is:

`local player → campaign → Hero Setup → deterministic Dungeon exploration → Dungeon Heart → Settlement claim → placeholder Settlement`

EPIC 02 established a pure version-4 `CampaignState`, typed identity and deterministic-random boundaries, named validated transitions for every current playable campaign mechanic, a narrow Hero-attribute selector authority, pure navigation legality independent from React board implementations, focused engine tests, and a development-only read-only campaign inspector.

`GameProvider` remains the React application coordinator for hydration, player/campaign lifecycle, timestamps, registry mirroring, persistence calls, theme state, and named operation invocation. It is not the rule authority for the migrated Hero Setup, Dungeon movement/discovery/Heart, Settlement claim, or board-navigation mechanics.

World strategy, economy, calendar progression, tactical combat, armies, events, cloud saves, multiplayer, and executable skill effects are not implemented.

## Runtime and stack

### Application runtime

**Observed:**

- Package `dungeon-master-castle-lords` is private at version `0.1.0` and requires Node.js `>=22.13.0`.
- Runtime dependencies are React/React DOM `19.2.6`, Next `16.2.6`, and the currently unused application-level Drizzle package.
- Vinext `0.0.50` and Vite `8.0.13` adapt the Next app-router conventions to Cloudflare Worker output.
- `app/page.tsx` mounts one `GameProvider` and `GameApp` client application.
- `app/layout.tsx` defines metadata, mobile viewport behavior, and pre-render theme bootstrap.
- `worker/index.ts` is the Cloudflare Worker edge. It delegates application requests to Vinext and handles the image-optimization path.
- `.openai/hosting.json` references Sites project `appgprj_6a762ab98b2c819181682817b758d7f8`; D1 and R2 are `null`.
- `db/schema.ts` and the Drizzle journal contain no active application schema. Optional auth/D1 scaffolding is not used by the game flow.

### Supported scripts and verification

**Observed:**

- `npm run dev` starts the Vite/Vinext development preview.
- `npm run test:engine` runs TypeScript engine tests directly with Node's built-in test runner and native type stripping; it does not render React or require a Sites build.
- `npm run build` checks FS-token drift, performs the bounded Vinext build, and validates the Sites artifact.
- `npm test` runs focused engine tests, the build/artifact check, and the rendered-HTML test.
- `npm run verify` runs token drift checking, ESLint, all focused engine tests, one bounded build/artifact validation, and the rendered-HTML test.
- `npm run tokens:generate` and `npm run tokens:check` maintain the committed FS CSS and game-color adapters generated from `sources/fs.tokens.json`.
- There is no standalone `typecheck` script.
- `.github/workflows/verify.yml` runs `npm ci` and `npm run verify` on pushes and pull requests using Node `22.13.0`.

The current focused suite contains 41 engine tests across campaign/migration boundaries, identity, deterministic RNG, Hero selectors, validated transitions/navigation, dependency direction, and the developer inspector. One additional built-output test checks the rendered development-preview metadata.

## Application architecture

### Current responsibility boundaries

| Boundary | Current modules | Observed responsibility |
|---|---|---|
| Pure campaign/model | `campaignState.ts`, `model.ts` compatibility exports | Version-4 campaign types and current value types; separate registry/runtime types. |
| Pure rules/transitions | `transitions.ts`, `generateDungeon.ts`, `random.ts` | Setup validation/completion, movement/discovery/Heart, claim, deterministic generation, and legal transition results. |
| Pure derived policy | `selectors.ts`, `navigation.ts` | Hero attribute calculation plus board identity, availability, unlock, resolution, and fallback. |
| Application/runtime | `GameProvider.tsx`, `GameApp.tsx` | Hydration, profile/campaign lifecycle, timestamping, active/registry synchronization, named-operation invocation, theme, and board composition. |
| Boards | `src/boards/` | Render current state, own board-local interaction/presentation state, and submit player intent. |
| Shared UI | `src/ui/` | Shell, navigation, overlays, sheets, icons, primitives, notifications, and read-only development inspection. |
| Persistence adapter | `storage.ts` | Browser `localStorage` serialization, registry guard, and per-campaign migration invocation. |
| Infrastructure/platform | system entropy adapters, `app/`, `worker/`, `build/`, `.openai/hosting.json` | Crypto-backed identity/seed inputs and Sites/Cloudflare delivery edges. |

The implemented rule flow is:

```text
Board/UI intent
  → named GameProvider operation
  → pure validated transition/navigation policy
  → authoritative CampaignState
  → pure selector/policy reads
  → board/shared-UI rendering

CampaignState
  ↔ explicit normalization/migration
  ↔ GameRegistry
  ↔ browser localStorage adapter
```

Pure engine modules are tested to reject React, board implementation, browser-storage, and Sites/Cloudflare imports. `src/game/navigation.ts` owns legal board policy; `src/boards/registry.ts` only binds the six React components to those pure descriptors.

## Campaign state and runtime ownership

### Authoritative campaign payload

**Observed:** `src/game/campaignState.ts` defines `CampaignState` version `4`; `GameSave` is its serialized compatibility alias rather than a second shape. Its top-level fields are:

- `version`;
- `id` and referenced `playerId`;
- persisted `campaignSeed`;
- `createdAt` and `updatedAt`;
- resumable `activeBoardId`;
- `setupComplete`;
- completed `hero` or `null`;
- one stored `dungeon`.

The current Hero stores faction, class, vocation, two-point free allocation, selected bonus skill, calculated total-attribute snapshot, normalized skill ranks, Dungeon position, and vision radius.

The current Dungeon stores level/day/treasury counters, dimensions, seed, rooms, tiles, start/Heart positions, discovery keys, historical Heart-reached state, and Settlement-claim state. These counters and snapshots describe the prototype; they do not establish an economy, calendar, or final location schema.

No World, Combat, Army, Event, calendar, or settlement-economy state slice exists in `CampaignState`.

### Adjacent non-campaign state

**Observed:**

- `PlayerProfile` stores local profile identity, name, banner color, creation time, and last-played time outside the campaign.
- `GameRegistry` version `1` stores profiles, campaigns keyed by player ID, and the last active player ID.
- `RuntimeState` stores hydration, selected player, active campaign working copy, registry, and players/game surface.
- Theme preference is stored under its own browser key and combined with OS dark-mode state.
- Setup drafts, open overlays, map pan/zoom/pointers, prompts, copy feedback, notifications, and other view interaction state remain component-local.
- Skill trees, board descriptors, labels, generator rules, and attribute-bonus mappings are static definitions/rules, not campaign data.

`RuntimeState.activeGame` and the campaign in `GameRegistry.games[playerId]` are synchronized application copies. They are not two independent campaign truths.

### Stored, derived, and static authority

**Observed:**

- Stored facts include campaign/profile references, lifecycle timestamps, campaign and Dungeon seeds, active board, completed setup choices, learned ranks, Hero position, Dungeon counters, discovery, Heart outcome, and claim outcome.
- Stored compatibility snapshots include `setupComplete`, `hero.attributes`, the normalized complete skill-rank shape, current vision radius, and the generated Dungeon dimensions/rooms/tiles/start/Heart.
- Derived values include legal board availability, Setup readiness/preview, current Hero totals, discovery indexes/counts, and display summaries.
- Static definitions include skill trees, board descriptors, attribute-bonus rules, generator constants, and presentation catalogs.

`hero.attributes` remains persisted for compatibility, but `heroClass`, `vocation`, and `freeAttributes` are the calculation inputs. Current setup completion and save normalization refresh the snapshot through the same pure selector.

## Persistence and migrations

**Observed:**

- Player/campaign data is stored in browser `localStorage` under `dmcl.prototype.registry.v1`.
- Theme preference uses `dmcl.prototype.theme.v1` separately.
- Hydration reads one version-1 registry, checks its outer shape, and calls `migrateLegacyGame` for every campaign.
- Current version-4 saves are normalized without regenerating valid stored Dungeons.
- Supported version-2/version-3 saves become version 4 by adopting their already-stored `dungeon.seed` as `campaignSeed`.
- Migration preserves stored Dungeon grid/rooms/tiles/start/Heart, Hero position, discovery, Heart-reached state, Settlement claim, IDs, and lifecycle values for supported structured saves. Hero attributes/skills and an invalid bonus-skill fallback are normalized from current authoritative definitions.
- Less-structured legacy or invalid campaign values can fall back to a newly created campaign while retaining limited legacy identity/timestamp/counter values when present.
- Registry writes occur automatically after hydrated registry changes. The explicit Save action also updates `updatedAt`; it is not the exclusive durability boundary.
- Storage read/write errors are swallowed, leaving the session playable without exposing a reliable failure state to the player.

**Interim limitation:** The registry currently allows one campaign per player because `games` is keyed by player ID. Starting a new campaign replaces that player's existing campaign after UI confirmation; deleting a player deletes the associated campaign. This is current behavior, not an accepted permanent campaign-lifecycle policy.

No cloud save, authentication-owned campaign, cross-device synchronization, export/import, server conflict handling, or multiplayer persistence is active.

## Identity

**Observed:**

- `PlayerId` is a typed `player-…` string and `CampaignId` is a typed `game-…` string.
- New values come from an injected `IdSource`; the system adapter uses `crypto.randomUUID()` and rejects unavailable secure identity generation instead of falling back to gameplay randomness.
- Existing loaded legacy identity strings retain their exact meaning rather than being reformatted during migration.
- Board, skill, tree, branch, faction, class, and vocation IDs are stable family-specific content-definition IDs.
- `CellKey` is a coordinate-derived `"x,y"` spatial key. Dungeon room numbers are snapshot-local generator ordinals. Neither is a global persistent entity ID.
- UI labels and array positions do not define current persistent identity.

No generic entity table, global `EntityId`, or speculative Hero/Settlement/World/Army/Unit/Item identity subsystem exists.

## Current rule-bearing transitions

**Observed:** `src/game/transitions.ts` owns four current pure transition boundaries:

1. `completeHeroSetup` validates incomplete Setup state, faction/class/vocation, exactly two non-negative integer free points, and a legal current-tree root/tier-1 bonus skill. It stores the completed Hero, initial position/discovery, and Dungeon entry.
2. `moveHeroInDungeon` validates campaign/Dungeon context and direction, calculates destination and walkability, updates position/discovery, and records historical Heart reach.
3. `claimSettlement` requires a ready Hero on the Dungeon board and the existing Heart-reached fact, stores the claim, and legally enters Settlement.
4. `navigateToAvailableBoard` requires a ready campaign and validates registered, enabled, and unlocked board availability before changing the active board.

Transitions return typed success/failure results and do not stamp time, persist, render, or import React/browser/platform code. `GameProvider` invokes them through named operations, stamps successful state changes, and synchronizes the active/registry copies.

`SetupBoard`, `DungeonBoard`, `SettlementBoard`, `BoardNavigation`, and `GameApp` submit intent or render policy results. They no longer receive an unrestricted whole-campaign mutation API for these mechanics. Player/profile creation, campaign creation/open/replacement/deletion, explicit Save, return, hydration, theme, and registry persistence remain application/lifecycle operations rather than campaign transitions.

## Derived Hero state

**Observed:** `src/game/selectors.ts` is the single current authority for:

- Fighter → +1 Strength;
- Ranger → +1 Perception;
- Mage → +1 Intellect;
- General → +1 Leadership;
- Spy → +1 Agility;
- Diplomat → +1 Charisma;
- combined path bonuses and final attributes from free allocation.

Hero Setup card copy and live preview, setup completion, v2/v3/v4 normalization, and the developer inspector consume this authority. The module is pure and React-independent. No general selector/query framework has been introduced.

## Deterministic randomness

**Observed:**

- Version-4 campaigns persist one unsigned 32-bit `campaignSeed`.
- New campaign seed entropy comes from `crypto.getRandomValues()` through a dedicated infrastructure adapter.
- `createDeterministicRandom` implements the explicit seeded Mulberry32 sequence used by the unchanged Dungeon generator.
- `createDungeonLevel` requires a seed; the initial Dungeon seed equals the campaign seed because no other random gameplay system exists.
- Current gameplay/domain source contains no uncontrolled `Math.random()` call.
- Crypto identity generation and campaign-seed generation are separate adapters; creating IDs cannot advance deterministic gameplay randomness.
- Migrated campaigns retain their stored generated Dungeon snapshot rather than reconstructing it from the seed.

There are no combat, loot, weather, event, AI, diplomacy, or World RNG streams/counters.

## Boards and shared UI

### Six-board architecture

**Observed:** The in-campaign catalog contains six stable ordered destinations:

1. Hero;
2. Settlement;
3. World;
4. Dungeon;
5. Combat;
6. Diplomacy.

Setup remains a pre-campaign surface outside the catalog. `GameApp` resolves the current descriptor through pure availability/fallback policy and then obtains its React component from `src/boards/registry.ts`. `BoardNavigation` uses the same pure descriptors and availability policy.

### Meaningful prototype surfaces

- `StartBoard` manages local profiles and current create/continue/replace/delete entry flows.
- `SetupBoard` implements the current Hero Setup interaction and previews authoritative attribute calculations.
- `DungeonBoard` renders the stored square-grid Dungeon with fog/discovery, keyboard and on-screen movement, pointer panning, wheel/pinch zoom, objective prompt, and Settlement claim intent.
- `SettlementBoard` displays the claimed settlement outcome and a return-to-Dungeon action. It has no management mechanics.

### Architectural scaffolds

`HeroBoard`, `WorldBoard`, `CombatBoard`, and `DiplomacyBoard` are enabled EPIC 01 architecture scaffolds. They render the shared shell and explicitly state that their gameplay belongs to later Epics. Their presence and navigability do not mean Hero management, World strategy, tactical combat, or diplomacy mechanics are implemented.

### Shared UI foundation

**Observed:** `GameShell` owns the app/status areas, board viewport, navigation, Hero/Settings overlays, Save feedback, and notification region. `ModalOverlay` supplies dialog semantics, focus containment, Escape/backdrop dismissal, body-scroll containment, and opener-focus restoration for shared sheets. `GamePrimitives.tsx` contains domain-neutral panels, stats/resources, progress, buttons, slots, tooltips/info sheets, grid cells, and SVG-first tokens.

The generated FS adapter supplies semantic UI colors and the primitive game-color projection from `sources/fs.tokens.json`. The application remains portrait/mobile-first with safe-area, responsive, focus-visible, and reduced-motion styling in the global stylesheet.

## Developer tooling and inspection

**Observed:**

- Focused engine tests run without React rendering or a complete Sites build.
- Source-contract tests protect dependency direction, removal of current uncontrolled `Math.random()`, selector use, board intent boundaries, and inspector restrictions.
- The normal `npm run verify` gate is shared by local/Sites verification and GitHub Actions.
- The development-only Campaign State Inspector is available through Settings when `import.meta.env.DEV && activeGame`.
- It displays schema/campaign/player IDs, campaign and Dungeon seeds, active board, Setup/Hero/Dungeon/progress facts, selector-derived Hero attributes, and formatted raw `activeGame` JSON.
- It offers only clipboard copy for seed/JSON. It has no transition, storage, edit, import, or arbitrary mutation surface.
- Production Settings does not render the inspector entry.

**Owner-confirmed:** The latest GitHub Actions `Verify` result is PASS. The owner also previously confirmed the accepted EPIC 02 manual player/campaign, Setup, Dungeon, Heart, Settlement, navigation, save/reload, migration, inspector, and responsive regressions.

## Current playable loop and explicit absences

The implemented player flow is:

1. create or select a local player profile;
2. create a new campaign or continue the one stored for that profile;
3. complete Hero Setup;
4. explore the deterministic stored Dungeon;
5. reach the Dungeon Heart;
6. claim the first Settlement;
7. view the placeholder Settlement and move among the current catalog surfaces.

The repository does **not** implement strategic World play, region conquest, supply, a meaningful settlement economy, calendar advancement, tactical combat, armies/units, items/equipment, events/world simulation, AI rivals, cloud saves, authenticated campaign ownership, multiplayer, or executable skill effects.

## Current technical debt and open implementation boundaries

These are evidence-backed limitations, not a new work plan:

- `GameProvider` still coordinates wall-clock timestamps, profile/campaign lifecycle, active/registry mirroring, automatic persistence, theme, and named transition invocation.
- `activeGame` and `registry.games[playerId]` remain synchronized application copies maintained by reducer branches.
- Browser `localStorage` is the only active persistence adapter; write failure is silent.
- One campaign per player, replacement behavior, player-deletion cascade, and the meaning of New Game/Continue are interim lifecycle behavior.
- `updatedAt` changes on open, explicit Save, named transitions/navigation, and return-to-players, so “modified,” “opened,” and “saved” semantics are not distinguished.
- Automatic persistence means the explicit Save action is reassurance/timestamping rather than the only durability boundary.
- Registry validation is shallow; malformed storage can reset or enter legacy fallback behavior, and errors are not surfaced.
- `hero.attributes`, `setupComplete`, complete skill-rank shape, vision radius, and generated Dungeon data remain compatibility snapshots/redundant persisted values with documented normalization rules.
- The Dungeon stores both seed and generated snapshot without a generator/rule version; the stored snapshot is authoritative today, while future seed/version policy remains open.
- Clock isolation remains unimplemented; rule transitions are pure, but application lifecycle timestamps still call the wall clock directly.
- Setup drafts remain disposable component state.
- Hero foundation presentation catalogs remain partly board/UI-local; full consolidation belongs to its responsible later Epic.
- Large `DungeonBoard`, `SetupBoard`, `StartBoard`, and global stylesheet files remain concentration points, but no refactor is justified solely by size.
- There is no browser/component/end-to-end test framework or automated accessibility suite; interaction and physical-smartphone acceptance remain manual responsibilities.

## Verification status for this audit

- `npm run test:engine` — **PASS**, 41 tests and 0 failures on the inspected `main` source.
- `npm run verify` — **PASS** after final documentation reconciliation: FS token synchronization, ESLint, 41 engine tests, bounded Sites build/artifact validation, and 1 rendered-HTML test all passed.
- GitHub Actions `Verify` — **PASS**, owner-confirmed external evidence; no run ID or metadata is asserted here.
- Working tree before this closure audit — clean and synchronized with `origin/main` at `80604a1da061bacbd1becb315268b57a387deaeb`.
- Deployment — not performed or authorized.

## Audit boundary and change confirmation

The audit inspected repository guidance and sources of truth; runtime/build configuration; application entry and provider; campaign, registry, identity, RNG, generator, selectors, navigation, transitions, storage, and migration modules; the six-board catalog and representative boards; shared shell/overlay/inspector UI; focused engine and rendered-output tests; the GitHub Actions workflow; Sites manifest; current Git branch/status/history; and the accepted E02 task records.

This audit changes documentation only. No game source, test, dependency, lockfile, build/platform configuration, persistence schema, gameplay rule, or UI behavior is modified, and no deployment is performed.
