# Dungeon Master & Castle Lords — Current State Audit

Audit date: 2026-08-14

Audited checkout: `/Users/dimi/Projects/dungeon-master-castle-lords`

Branch: `main`

Source base inspected: `84130b72e91acfee7923aab8b9db6b98f48989c9` (`Add opening board summaries and inspection`) plus the E03-T08 Candidate audit/reconciliation diff

## Purpose and evidence labels

This document records what the repository implements after the owner-accepted E03-T01–T07 work. It is implementation evidence, not approval of unresolved gameplay.

- **Observed** — directly supported by source, configuration, or automated tests.
- **Owner-confirmed** — manually reported by the project owner.
- **Manual acceptance required** — an interaction/device result that automated source or engine checks cannot establish.
- **Not implemented** — concept scope with no executable mechanic in the current prototype.

Product intent lives in [GAME_CONCEPT.md](./GAME_CONCEPT.md), approved structure in [ARCHITECTURE.md](./ARCHITECTURE.md), runtime ownership in [GAME_STATE.md](./GAME_STATE.md), and decision status in [DECISIONS.md](./DECISIONS.md).

## Executive summary

**Observed:** The current playable flow is:

```text
local profile
→ typed/verified registry hydration
→ Castle-only Hero Setup
→ atomic Tier-1 Village + controlled seven-region opening
→ Settlement/Hero/World inspection
→ regional Dungeon entry from World context
→ verified local Save/reload/Continue
```

Campaign version 5 is the application/save authority inside registry version 2. The original registry-version-1 payload is retained untouched during legacy cutover. Supported v2/v3/v4 Castle campaigns migrate deterministically; incomplete v4 campaigns retain identity/seed without a fabricated Hero; v4 Dungeon-faction campaigns are recoverably incompatible and never silently become Castle.

EPIC 03 implements an opening foundation and safe browser-local lifecycle, not the strategic economy or later game loops. Food/Wood/Stone sites, the ruin, terrain-only region, capital Village, and regional Dungeon are stored identities/context without yields, Roads, projects, threats, rewards, units, or progression effects.

## Runtime, platform, and verification boundary

**Observed:** The repository remains a private React 19/Next 16-convention application adapted by Vinext/Vite to a Sites-compatible Cloudflare Worker. `app/page.tsx` mounts one `GameProvider` and `GameApp`. `.openai/hosting.json` references Sites project `appgprj_6a762ab98b2c819181682817b758d7f8`; D1 and R2 are inactive. No dependency, database schema, Worker, hosting, or deployment change is part of EPIC 03.

Supported verification remains:

- `npm run test:engine` — dependency-free Node engine tests;
- `npm run verify` — token drift, lint, engine tests, bounded build/artifact validation, and rendered-HTML check;
- GitHub Actions — `npm ci` plus `npm run verify` as independent checkpoint evidence.

There is no standalone `typecheck` command and no browser/component/end-to-end test framework. Rendered interaction and physical-device acceptance remain separate from the automated gate.

## Current responsibility boundaries

| Boundary | Current modules | Observed responsibility |
|---|---|---|
| Campaign/model | `campaignState.ts`, `model.ts` | Version-5 campaign, version-4 compatibility, profile/registry/runtime separation. |
| Migration/validation | `campaignMigration.ts`, protected legacy normalization in `createGame.ts` | Strict v2/v3→v4→v5 conversion, typed incompatibility/failure, target validation/idempotence. |
| Rules/generation | `villageOpening.ts`, `campaignTransitionsV5.ts`, `generateStartingWorld.ts`, `generateDungeon.ts`, `random.ts` | Atomic Setup, contextual Dungeon entry/movement, deterministic World and Dungeon behavior. |
| Application lifecycle | `lifecycle.ts`, `lifecycleV2.ts`, `persistence.ts`, `registryCutover.ts`, `GameProvider.tsx` | Clocked lifecycle, verified transactions, hydration/cutover, active/registry coordination, player-visible status. |
| Content | `openingContent.ts`, `skillTrees.ts`, `selectors.ts` | Castle-opening identities, stable Hero IDs, temporary compatibility attribute authority. |
| Navigation | `navigationV5.ts`, compatibility exports in `navigation.ts` | Six-board identity and legal availability independent from React components. |
| Boards/UI | `src/boards/`, `src/ui/` | Render authoritative state, own transient focus/selection/dialog state, submit named intent. |
| Platform/storage | `storage.ts`, system clock/ID/seed adapters, app/worker/Sites edges | Browser APIs, wall-clock/entropy inputs, delivery. |

Pure engine modules are tested to avoid React, board, browser-storage, clock/entropy, and Sites/Cloudflare dependencies where those imports would invert the approved direction.

## Campaign state and authority

### Version-5 payload

**Observed:** `CampaignState` and serialized `GameSave` are aliases of `CampaignStateV5`:

- identity/lifecycle: version, campaign ID, profile reference, campaign seed, immutable creation time, modification/resume time, and active resume board;
- `foundation: null` before completed Setup, with no durable draft;
- completed foundation: sole `castle` root authority, one Hero, one Tier-1 capital Village, one stored seven-region World snapshot, and one retained/current regional Dungeon snapshot;
- Hero: Class, Vocation, free allocation, bonus skill, positive skill ranks, versioned `v4-path-bonus-1` attribute snapshot, strategic region, and optional regional exploration context;
- World: generator version 1, domain-separated World seed, home region, seven controlled regions, three sites, and two locations;
- Dungeon: level, seed, grid, rooms, tiles, start/Heart, discovery, Heart history, and optional explicitly non-strategic legacy metadata.

There is no duplicate Hero faction truth, stored `setupComplete`, strategic Day, stockpile/Gold, Road, project, building/economy, unit/army, encounter/Combat, Gambit, relationship, event, population, evolution, Hero Level/XP, Profession, or equipment slice.

### Non-campaign state

Profiles and the registry remain outside campaign truth. Hydration state, selected profile, players/game view, active in-memory campaign, persistence error/unsaved status, theme preference, open sheets/dialogs, World selection/focus, pointer/zoom state, and unfinished Setup choices are application/session or UI state.

`RuntimeState.activeGame` and `GameRegistryV2.games[playerId]` are coordinated application copies of the same campaign, not independent board saves.

## Persistence and lifecycle

**Observed:** The preferred registry is version 2 at `dmcl.prototype.registry.v2`; the legacy source is read from `dmcl.prototype.registry.v1` and never written by cutover/recovery code.

- Hydration distinguishes absence, unavailable/read failure, parse failure, registry validation, campaign validation, migration failure, and incompatible legacy campaign.
- Failed hydration/migration performs no automatic write and cannot become a legitimate empty registry.
- Campaign-level validation, migration, and incompatibility failures are isolated by profile; unaffected profiles/campaigns remain loadable, while ordinary writes pause so the filtered working registry cannot overwrite the source.
- Candidate writes validate before serialization, write, read back exactly, decode and validate the readback, and report success only after the complete verification; failure attempts rollback.
- Serialization, ordinary write, quota-like, and verification failures have typed bounded player messages rather than raw exceptions.
- Later non-destructive autosave failure keeps the in-memory campaign marked unsaved and retryable.
- Manual Save performs the immediate verified write and changes no campaign/profile timestamp.
- Campaign `createdAt` is immutable; `updatedAt` changes only with campaign truth or stored resume context; profile `lastPlayedAt` changes only on successful New/Continue activation.
- Each profile has at most one campaign. Replacement and profile deletion are confirmed, verified transactions; failure retains the previous in-memory and durable registry. Explicit issue recovery creates a fresh pre-Setup Castle campaign for each affected profile in one verified transaction; hard unreadable-container reset is also explicit. No campaign-only delete or extra save slot exists.

## Migration and compatibility evidence

| Source class | Implemented result |
|---|---|
| Supported v2 | Protected v2→v4 normalization, then deterministic v5 class policy. |
| Supported v3 | Protected v3→v4 normalization, then the same deterministic v5 class policy. |
| v4 before Setup | Preserve campaign/profile IDs, seed, and lifecycle; `foundation: null`; blank disposable Castle Setup. |
| Completed v4 Castle | Preserve approved Hero/build/ID/seed/timestamps and exact Dungeon structure/progress; add the deterministic Village/home ring. |
| Completed v4 Dungeon | Isolated typed incompatibility; no Castle conversion; explicit confirmed recovery creates a fresh Castle Setup campaign only after a verified preferred write, while the version-1 source remains untouched. |
| Malformed registry | Typed hard registry failure; no automatic preferred write or empty fallback; explicit reset requires confirmation and verified persistence. |
| Malformed campaign/target | Typed isolated campaign failure with no throw, repair, regeneration, or source mutation; unaffected campaigns remain loadable and ordinary writes pause until explicit recovery. |
| Current v5 | Strict validation and clone/round trip; stored World/Dungeon snapshots and IDs remain authoritative. |
| Retained Dungeon snapshot | Attached to `location:regional-dungeon` without regeneration; exploration cell remains square-grid context. |
| Old day/treasury/claim | Optional `legacyPrototypeMetadata` only; no strategic Day, Gold, capital, or control effect. |

The focused fixtures assert deterministic repeated conversion, target idempotence, byte-equivalent serialization round trip, stable IDs/references, unchanged source bytes, unchanged retained Dungeon structure, no World reroll after a target snapshot exists, safe nested malformed-data handling, strict Hero compatibility facts, campaign isolation, decode-validated writes, and explicit verified recovery/reset.

## Opening and board behavior

**Observed:** Valid Hero Setup constructs the complete foundation as one pure replacement value. Invalid or repeated completion changes nothing and cannot duplicate the Hero, capital, seven regions, three sites, two locations, or regional Dungeon.

- Opening board: Settlement.
- Available after Setup: Hero, Settlement, World.
- Dungeon: registered/enabled but locked until `hero.explorationContext` names the stored regional Dungeon; World entry creates or resumes that context without changing strategic region or regenerating the Dungeon.
- Combat and Diplomacy: registered but disabled until later legal contexts.
- Dungeon Heart settlement claim: retired operation; it cannot create the capital or unlock Settlement.

The Hero board is the sole Hero information surface. Settlement shows only current capital/opening facts. World renders the authoritative edge-sharing seven-hex cluster with visible non-color-only selection/focus and high-contrast polygon boundaries. The development inspector is development-only and read-only.

## Determinism and stable identity

- New campaign identity entropy and campaign-seed entropy are separate infrastructure inputs.
- Dungeon generation uses the explicit unchanged deterministic seed/algorithm; retained snapshots are authoritative.
- World seed is FNV-1a over `world/home-ring/v1:<campaignSeed>` and uses its own fresh deterministic stream.
- World generator version, seed, and authoritative snapshot are stored.
- Home and first-ring coordinate order, region IDs, capital/site/location IDs, and catalog order are deterministic.
- Current game/domain source has no uncontrolled gameplay `Math.random()`.

## Explicit EPIC 03 boundary

**Not implemented:** economy yields, strategic production/Days, Roads, connection/supply, construction, projects/queues, recruitment, units, armies, Gambits, tactical Combat, Republic/Empire, Industry/Magic, Holy/Unholy, later Hero progression, population, events, cloud saves, authentication, database persistence, multiplayer, or deployment.

The presence of content identities, locked board modules, or explanatory placeholders is not an executable mechanic.

## Residual limitations and owner acceptance

- Browser `localStorage` remains the only active campaign persistence adapter; no export/import, cloud synchronization, or cross-device guarantee exists.
- The original version-1 payload is intentionally retained with no automatic cleanup, increasing local storage use.
- `GameProvider` still coordinates several application concerns and active/registry mirroring; no broader state-library/provider rewrite is justified by EPIC 03.
- Hero attribute totals remain the explicitly temporary `v4-path-bonus-1` compatibility snapshot through EPIC 05; EPIC 06 must migrate or retire it.
- The seven-region World and Tier-1 Village are inspection/opening context only until EPIC 04 defines and implements economy/World mechanics.
- Browser corruption/quota injection is not exposed as a player/developer toggle; those paths are verified through pure adapters and require prepared fixtures or a controlled browser environment for visual inspection.
- Physical smartphone touch, safe-area, theme, reduced-motion, focus, and error-dialog acceptance remains an explicit owner action for the EPIC 03 exit Candidate.

## Verification status

The E03-T08 exit record contains the exact final command results, fixture-to-criterion matrix, rendered checks, and owner manual QA checklist. Review of the first Candidate requested persistence/migration hardening; E03-T08 remains active as Changes requested while the revised Candidate is reviewed. The project owner reported E03-T07 accepted and its GitHub `Verify` run PASS; exact commit `84130b72e91acfee7923aab8b9db6b98f48989c9` is also saved as non-deployed Sites version 28. EPIC 03 is not Complete until the owner accepts the revised E03-T08 Exit Candidate and the matching workflow checkpoint is committed, pushed, independently verified, and saved as a non-deployed Sites version.

Deployment was not performed or authorized.
