# Dungeon Master & Castle Lords — Current State Audit

Audit date: 2026-08-09  
Audited checkout: `/Users/dimi/Projects/dungeon-master-castle-lords`  
Branch: `main`  
Commit inspected: `0b83193` (`Initial commit`, 2026-08-09)

> **Audit scope notice:** This document records the application implementation at the audited baseline commit. Later EPIC 00 documentation, README, workflow, decision-log, and `sources/fs.tokens.json` additions are intentionally not reflected here. Use Git and the current repository contents for those infrastructure artifacts.

## Purpose and evidence labels

This document records the current technical and functional state of the existing browser-game prototype. It is an audit, not a target architecture.

- **Observed** means directly supported by the inspected repository.
- **Inferred concern** means a likely risk or limitation derived from the observed implementation; it has not necessarily caused a failure.
- **Recommendation** means future work only. No recommendation was implemented during this audit.
- **Unknown** means the repository did not provide enough evidence to determine the answer.

## Executive summary

**Observed:** The project is a mobile-first, single-page browser-game prototype implemented with React 19 and Next.js 16 application conventions, built for OpenAI Sites through Vinext/Vite and a Cloudflare Worker entry point. The playable flow is:

1. Create or select a local player profile.
2. Start or load one campaign per player.
3. Create a hero by selecting a faction, class, vocation, two free attribute points, and one bonus skill-tree advance.
4. Explore a procedurally generated dungeon with keyboard, pointer, wheel, and touch controls.
5. Reach the dungeon heart, claim a settlement, and open a placeholder settlement board.

State is held in a React context/reducer and automatically serialized to browser `localStorage`. There is no active server database, authentication integration, account synchronization, multiplayer, world board, or combat board.

The code already separates game models/rules, board views, reusable UI, persistence, and platform setup into recognizable directories. The board registry expresses intended modularity, but runtime board selection is still hard-coded in `GameApp`, and several large view/style files concentrate substantial behavior.

## Framework and runtime

### Observed

- Package: `dungeon-master-castle-lords`, version `0.1.0`, private.
- Required Node version: `>=22.13.0`.
- Local audit runtime: Node `v22.22.0`, npm `10.9.4`.
- UI/runtime dependencies:
  - `next` `16.2.6`
  - `react` and `react-dom` `19.2.6`
  - `drizzle-orm` `0.45.2`
- Build/tooling dependencies include Vinext `0.0.50`, Vite `8.0.13`, Cloudflare Vite plugin `1.37.1`, Wrangler `4.92.0`, TypeScript `5.9.3`, ESLint `9.39.4`, Tailwind/PostCSS `4.2.1`, and Drizzle Kit `0.31.10`.
- `app/page.tsx` is a client entry point that mounts `GameProvider` and `GameApp`.
- `app/layout.tsx` supplies metadata, mobile viewport settings, global CSS, and an inline pre-render theme bootstrap script.
- Vinext adapts the Next app-router surface to Vite/Cloudflare Worker output.
- `worker/index.ts` is the Worker entry point. It delegates normal requests to the Vinext app-router handler and handles the `/_vinext/image` optimization route.
- The package lockfile is present and dependencies are version-pinned.

### Inferred concerns

- The project combines Next application conventions with Vinext/Vite/Cloudflare-specific build behavior. Developers need to understand that the deployed runtime is not a conventional Next.js Node server.
- `next.config.ts` is effectively empty; runtime behavior is primarily defined by Vite, Vinext, the Sites plugin, and the Worker entry.
- `README.md` still identifies the repository as `vinext-starter` and documents starter/platform behavior more than the game.

### Recommendations

- Later, replace the starter README with project-specific setup, architecture, gameplay scope, and deployment notes while preserving any still-relevant Sites constraints.
- Keep platform-specific code at the edges so game rules remain portable and independently testable.

## Project structure

### Observed

```text
app/                 Next app entry, metadata, theme boot, global styles
build/               Sites Vite plugin
db/                  Optional Drizzle/D1 adapter and empty schema
drizzle/             Empty migration journal
examples/d1/         Opt-in starter D1 example, not active application code
public/               Favicon and unused starter SVG assets
scripts/              Sites install/build/environment/artifact helpers
src/boards/           Start, setup, dungeon, settlement boards and registry
src/game/             App orchestration, context/reducer, model, rules, data, storage
src/ui/               Shared shell, navigation, sheets, icons, crest, skill picker
tests/                One rendered-HTML metadata test
worker/               Cloudflare Worker entry
.openai/hosting.json  Sites project and optional resource declarations
```

- Root `outputs/` and `work/` directories exist but contain no files within the inspected depth and are not tracked by Git.
- No `docs/` directory existed before this audit.
- No separate asset/data directory or external content files are present.

### Inferred concerns

- Empty/untracked workspace directories and starter assets may confuse future contributors about what is authoritative.
- Content definitions are mixed between UI components and rule modules rather than having one explicit content layer.

### Recommendations

- Define and document module boundaries before adding many more boards.
- Consider a dedicated content/config layer when game content starts changing independently of rendering and rules.

## Component and board hierarchy

### Observed

```text
RootLayout
└─ Home (client)
   └─ GameProvider
      └─ GameApp
         ├─ StartBoard                 player registry and campaign selection
         ├─ SetupBoard                 hero creation
         │  ├─ SkillTreePicker
         │  ├─ Crest / GameIcon
         │  └─ SettingsSheet
         ├─ DungeonBoard
         │  └─ GameShell
         │     ├─ BoardNavigation
         │     ├─ HeroSheet
         │     └─ SettingsSheet
         └─ SettlementBoard
            └─ GameShell
```

- `GameApp` renders a loading screen until storage hydration completes.
- It routes to the player screen, setup, settlement, or dungeon using conditional rendering.
- The `BoardId` type also includes `world` and `combat`.
- `BOARD_REGISTRY` declares dungeon and settlement as enabled, world and combat as disabled.
- `BoardNavigation` consumes the registry, adds settlement unlock gating, and renders disabled future-board items.
- `GameShell` centralizes the in-game app bar, player/campaign stats, board navigation, hero sheet, settings sheet, and save feedback.
- `GameIcon` is a hand-authored SVG icon switch with a typed icon-name union.

### Inferred concerns

- `GameApp` does not use `BOARD_REGISTRY` to resolve board components, so adding a board currently requires changes in both the registry/type layer and central conditional logic.
- `DungeonBoard.tsx` (723 lines), `SetupBoard.tsx` (426 lines), `StartBoard.tsx` (356 lines), and `app/globals.css` (3,067 lines) are early concentration points.
- Board enablement and gameplay unlock state are separate concepts but are combined in navigation logic.

### Recommendations

- Later introduce a typed board module contract containing metadata, availability rules, and component resolution.
- Extract view-only subcomponents and interaction hooks when these boards gain more behavior; avoid splitting solely by line count.

## State management and game model

### Observed

- Global state uses React `createContext`, `useReducer`, callbacks, and a memoized context value in `GameProvider`.
- `RuntimeState` contains hydration state, the registry, selected player ID, active game, and current top-level view.
- The reducer supports hydration, player creation/selection/deletion, opening a campaign, explicit saving, arbitrary game updates, and returning to the player screen.
- Every registry change after hydration is automatically written to storage. Most gameplay operations call `updateGame`, which also updates `updatedAt` and the registry copy of the active campaign.
- The manual Save action updates the timestamp and shows UI feedback; durable browser persistence already happens after state changes.
- Domain types in `model.ts` cover players, boards, hero setup/state, attributes, dungeon rooms/state, save format, and registry format.
- `GameSave` is schema version `3`; `GameRegistry` is version `1`.
- A player has at most one campaign in the current model because games are keyed by `playerId`.
- Starting a new campaign replaces that player’s existing campaign after an explicit confirmation flow in `StartBoard`.
- Player deletion also deletes the associated campaign.

### Inferred concerns

- The context exposes a broad `updateGame(updater)` escape hatch, so board components can change any save field without domain-level commands or validation.
- Runtime, persistence orchestration, theme state, and player/campaign actions all live in one provider.
- Save validity is primarily enforced through TypeScript at authoring time; storage input validation is shallow.
- Updating timestamps when simply opening a game blurs “modified” and “last opened.”
- Automatic persistence means the manual Save control is primarily reassurance, not the only save boundary.

### Recommendations

- As rules grow, move mutations behind explicit domain actions/services and validate persisted data at runtime.
- Decide whether campaigns should remain one-per-player before account/cloud persistence is designed.
- Clarify save semantics in product language and data fields (for example, last opened versus last modified).

## Hero Creation implementation

### Observed

- Hero creation is implemented by `SetupBoard`, `completeGameSetup`, `model.ts`, `skillTrees.ts`, and `SkillTreePicker`.
- Factions: Dungeon and Castle. Their current effect is presentation/settlement naming; no faction-specific rule data is applied during setup.
- Classes:
  - Fighter: +1 Strength, initial Close Combat rank.
  - Ranger: +1 Perception, initial Ranged Combat rank.
  - Mage: +1 Intellect, initial Mage Combat rank.
- Vocations:
  - General: +1 Leadership, initial Tactics rank.
  - Spy: +1 Agility, initial Deception rank.
  - Diplomat: +1 Charisma, initial Diplomacy rank.
- Attributes: Strength, Agility, Perception, Intellect, Charisma, and Leadership.
- The player must spend exactly two free attribute points. Both points may be assigned to the same attribute.
- The selected class and vocation bonuses are added to the free allocation when setup completes.
- The player receives each selected path’s root skill at rank 1 plus one free skill point. The free point can raise either selected root to rank 2 or learn a tier-1 branch skill at rank 1.
- Changing class/vocation clears an incompatible selected bonus skill but preserves one belonging to the other still-selected tree.
- The setup button is disabled until faction, class, vocation, bonus skill, and both free attribute points are complete.
- Completion sets up the hero, starts at the dungeon start cell, sets vision radius 1, reveals nearby cells, marks setup complete, and navigates to the dungeon board.
- Setup selections live in local component state until completion. Leaving setup and returning to players discards the unfinished selections even though the empty campaign remains.
- There is no editing/respecialization flow after completion.

### Inferred concerns

- Class/vocation bonuses are defined twice: once as Setup UI content/preview logic and again in `createGame.ts` rule functions. These can drift.
- The UI content arrays for factions/classes/vocations are embedded in `SetupBoard`, while the actual skill mappings live in `createGame.ts`.
- An in-progress hero setup is not persisted, despite the player screen describing it as “Hero setup in progress.” Loading that campaign restarts selections from empty.
- The setup component enforces selection constraints, but `completeGameSetup` assumes its input is valid and could accept invalid free-attribute totals or an unrelated skill if called elsewhere.

### Recommendations

- Consolidate path definitions and rule effects into typed domain content consumed by both UI and setup logic.
- Decide explicitly whether draft setup should persist; if yes, model it in the save schema.
- Add domain validation at the setup-completion boundary.

## Skill-tree and content definitions

### Observed

- `skillTrees.ts` defines six trees: three class trees and three vocation trees.
- The trees contain 60 skills in total: one root and three branches of three skills for each tree.
- Each node has an ID, name, sigil, and description; branch nodes also gain indexed tree, branch, and tier metadata.
- `ALL_SKILLS` and `SKILL_BY_ID` are derived indexes.
- Skill ranks are represented as a complete `Record<SkillId, number>`.
- `normalizeSkillRanks` rebuilds the complete record and preserves only finite, non-negative numeric ranks.
- Descriptions currently serve as content/UI text; there is no general skill-effect execution system.
- Faction/class/vocation display content and banner colors are embedded in board components.

### Inferred concerns

- The type-safe, centralized skill definitions are a strong base, but mechanics are currently descriptive rather than executable.
- Hand-maintained IDs and content in TypeScript are appropriate at this size but may become difficult for non-code content authoring.

### Recommendations

- Keep typed definitions while the prototype is small. Introduce schemas/content tooling only when actual authoring or localization needs justify it.
- Separate descriptive text, prerequisites, and executable effects when skill mechanics are implemented.

## Current gameplay boards

### Start/player board — observed

- Supports multiple local player profiles with unique case-insensitive names (2–24 characters) and selected banner colors.
- Supports selection, deletion confirmation, new-campaign replacement confirmation, new campaign, and load campaign.
- Shows last-played information and campaign/setup state.

### Dungeon board — observed

- Generates a deterministic 20×12 map from a stored numeric seed using a local PRNG.
- Creates five rooms plus connecting corridors and two cross-links.
- Supports movement on walkable tiles, discovery/fog state, a vision radius, keyboard arrows/WASD, on-screen direction controls, wheel zoom, pinch zoom, and pointer panning.
- Reaching the dungeon heart opens a claim prompt. Claiming marks the settlement as claimed and moves to the settlement board.
- Current dungeon stats are level, day, and treasury. No economy or time progression beyond stored initial values was found.

### Settlement board — observed

- Displays a claimed settlement state and placeholder future district slots.
- Provides a return-to-exploration action.
- No construction, production, population, or management mechanics are implemented.

### Future boards — observed

- World and combat exist only as typed/registry placeholders and disabled navigation items.

## Reusable UI and accessibility

### Observed

- Reusable UI includes `GameShell`, `BoardNavigation`, `SettingsSheet`, `HeroSheet`, `SkillTreePicker`, `GameIcon`, and `Crest`.
- Buttons generally specify `type="button"`, pressed state, accessible labels, disabled state, or status roles where relevant.
- Sheets close on Escape and include a backdrop and labeled close controls.
- The UI includes focus-visible styling and a `prefers-reduced-motion` media query.
- Mobile safe-area insets and multiple responsive breakpoints are present.
- No external icon library is used; icons are SVG React elements.

### Inferred concerns

- No automated accessibility testing is configured.
- Sheet focus trapping, focus restoration, and explicit dialog semantics were not established from the inspected code.
- Large interactive SVG/grid behavior deserves real-device and assistive-technology testing; that was outside this repository-only audit.

### Recommendations

- Add focused accessibility tests and manual keyboard/screen-reader checks as the UI stabilizes.
- Establish a reusable modal/sheet accessibility primitive before more overlays are added.

## Styling and design tokens

### Observed

- All application styling is in `app/globals.css` (3,067 lines).
- Tailwind CSS is imported, but the application markup primarily uses semantic BEM-like class names and handcrafted CSS rather than utility classes.
- The stylesheet defines:
  - FS semantic color variables for surfaces, content, actions, feedback, and borders.
  - FS primitive game colors (red through magenta).
  - Spacing, typography, line-height, radius, shadow, and derived surface tokens.
  - Responsive rules at 379px, 520px, 760px, and 1100px, plus a short-height rule at 690px.
  - Reduced-motion behavior.
- Light values are declared in `:root`; explicit dark values are declared in `:root[data-theme="dark"]`.
- The root layout reads `dmcl.prototype.theme.v1` before paint and falls back to `prefers-color-scheme`.
- `GameProvider` listens to system-theme changes and supports explicit light/dark or system preference through `SettingsSheet`.
- `Crest` passes the player banner color through a CSS custom property.
- No `fs.tokens.json` file is present in this checkout, so provenance and exact parity with an uploaded FS token source cannot be verified.
- No webfont files or external font loading are configured; the font stacks rely on locally available fonts/fallbacks.

### Inferred concerns

- The token layer and semantic class naming are reusable, but a single 3,067-line stylesheet will become hard to navigate and ownership will blur as boards expand.
- Tailwind is part of the pipeline despite little visible utility-class usage.
- Token values appear manually transcribed; without the source token file or generation process, drift cannot be detected.

### Recommendations

- Preserve the semantic FS token API while later splitting styles by foundations, shared components, and board modules.
- Decide whether Tailwind is intentionally part of the long-term styling strategy.
- Add the authoritative FS token source or a documented generation/synchronization path when available.

## Persistence, identity, and migrations

### Observed

- Player/game persistence is device-local browser `localStorage` under `dmcl.prototype.registry.v1`.
- Theme preference uses `dmcl.prototype.theme.v1`.
- Storage failures are swallowed so the session remains playable, but the UI does not notify the player that saving failed.
- Registry validation checks only version, player-array presence, and games-object presence.
- Game migration accepts save versions 2 and 3 with a dungeon tile map, normalizes skill ranks, repairs derived attributes, and supplies a fallback bonus skill.
- Older/other legacy objects are migrated into a fresh version-3 game while preserving a few IDs, timestamps, and basic dungeon counters when present.
- `app/chatgpt-auth.ts` contains optional Sites/ChatGPT identity helpers, but no current application route imports or calls them.
- `.openai/hosting.json` declares both D1 and R2 as `null`.
- `db/schema.ts` is intentionally empty. `db/index.ts` would use a `DB` D1 binding if enabled.
- There is no active API route, cloud save, cross-device sync, user-owned server record, or multiplayer transport.

### Inferred concerns

- Malformed but shallowly valid registry content can reach the app or be silently reset/migrated in surprising ways.
- `localStorage` writes are synchronous, quota-limited, and scoped to a browser origin; the hosted site and a local preview will not share saves.
- Player profiles are local labels, not authenticated identities.
- Silent write failure can make “Campaign saved” misleading.

### Recommendations

- Add explicit runtime schemas, migration tests, and visible persistence status before save data becomes valuable.
- Treat any future authenticated/cloud storage migration as a deliberate data-model project, not a direct swap of the storage adapter.

## Testing, linting, and build tooling

### Observed

- `npm run build` runs a bounded Vinext build and then validates that the Sites artifact contains an ESM Worker `default.fetch` export and packaged hosting manifest.
- `npm test` runs the full build and then one Node test against the built Worker HTML.
- The sole test checks for the development-preview metadata tag. It does not exercise game rules, reducer behavior, storage migration, hero setup, dungeon generation, interactions, or accessibility.
- ESLint uses Next core-web-vitals and TypeScript configurations.
- TypeScript is strict and no-emit, with bundler module resolution.
- No dedicated `typecheck` package script, browser/end-to-end framework, component test framework, coverage tool, formatter configuration, or CI workflow is tracked.
- The install/build helper scripts explicitly target Linux and require tools including GNU `timeout`; the README states they are not native macOS scripts.

### Verification status for this audit

- **Dependency install:** not run, by instruction.
- **Build:** not run. `node_modules/` is absent, so Vinext is unavailable; the prescribed build helper also requires GNU `timeout`, which was not found on the audited macOS environment. Running a build would additionally create build artifacts, contrary to the requested single-file modification boundary.
- **Tests:** not run. The test script first runs the build, and no existing `dist/` artifact is present.
- **Lint:** not run. Dependencies are absent and were not installed.
- **Type check:** not run. Dependencies are absent and there is no dedicated project script.
- **Git working tree before documentation:** clean.
- **Current build/test/lint result:** **unknown in this checkout**, not failed. There is no executed result to report.

### Inferred concerns

- The existing test can pass while all gameplay is broken because it only asserts metadata in rendered HTML.
- Core deterministic/domain behavior is currently unprotected despite being well suited to low-cost unit tests.
- Local macOS contributors cannot use the documented build helper without an alternate environment/tooling path.

### Recommendations

- Add unit tests first for setup calculation/validation, skill normalization, migrations, dungeon connectivity/determinism, and reducer actions.
- Add a small number of interaction tests for player creation, hero setup, save/load, movement, and settlement claiming.
- Add a documented, supported verification path for local macOS development or clearly require a Linux/container environment.

## Sites, local, and Git configuration

### Observed

- Sites project ID: `appgprj_6a762ab98b2c819181682817b758d7f8`.
- The Sites manifest declares no D1 or R2 binding.
- Vite loads the Sites plugin and Cloudflare plugin, configures the Worker entry, and simulates optional local D1/R2 bindings only when declared.
- Vite listens on `0.0.0.0`, allows `terminal.local`, and uses polling when running under the Codex macOS sandbox.
- Wrangler/Miniflare runtime paths are redirected into ignored project-local directories.
- Git branch: `main`.
- Git remotes:
  - `origin`: `https://github.com/DitmarF/dungeon-master-castle-lords.git`
  - `workspace`: the ChatGPT Sites Git workspace for the project ID above.
- Only one commit was present in the inspected history.
- The root `.gitignore` excludes common dependency, build, environment, Wrangler, Sites runtime, and temporary outputs.
- `app/layout.tsx` still includes `codex-preview=development` metadata, which is exactly what the current test asserts.
- No deployment was initiated or changed during this audit.

### Unknown

- The exact commit currently serving at the public Sites URL cannot be proven from this local repository alone.
- Current hosted environment variables, access policy, deployment history/status, and Cloudflare resource wiring are unknown.
- GitHub branch protection, pull-request policy, and external CI settings are unknown.
- Whether `outputs/` and `work/` are generated by an external Sites workflow is unknown.

## Technical debt inventory

The following separates facts from risk interpretation.

| Area | Factual observation | Inferred concern |
|---|---|---|
| Board modularity | Registry metadata exists, but `GameApp` hard-codes rendering branches. | Adding/removing boards is not yet plug-in-like and can create duplicated routing logic. |
| Domain boundaries | Boards can mutate an entire `GameSave` through a generic updater. | Rule invariants may become distributed across UI components. |
| Hero definitions | Class/vocation bonuses and labels are represented in multiple modules. | UI previews and saved rule calculations can drift. |
| Setup drafts | Setup choices are component-local until completion. | Returning to players loses an in-progress setup. |
| Persistence validation | Registry guard is shallow; migrations use structural assumptions/casts. | Corrupt or unexpected saves may silently reset or partially migrate. |
| Styling | One global stylesheet contains 3,067 lines. | Future board styles may collide and become difficult to own/remove. |
| Large components | Dungeon, setup, and start boards contain substantial UI and behavior. | Change risk and test setup will rise as mechanics expand. |
| Tests | One metadata-only built-worker test exists. | Gameplay regressions are effectively unguarded. |
| Authentication/data | Auth helpers and optional D1 plumbing are unused. | Future cloud save/multiplayer work requires identity and ownership design, not just activation. |
| Starter residue | README, comments, example D1 files, and some public assets remain starter-oriented. | New developers may misread examples or placeholders as live functionality. |

## Keep / Refactor Later / Replace Candidate

This is prioritization guidance only; no actions were performed.

### Keep

- Typed domain model and versioned save format.
- Deterministic seeded dungeon generation and isolated map helpers.
- Central skill-tree definitions and derived indexes.
- Semantic FS CSS variables, system-dark default, safe-area handling, and reduced-motion support.
- `GameShell`, shared sheets, icon component, and board registry concept.
- Project-local Sites runtime paths and artifact validation.

### Refactor Later

- Convert the board registry into actual typed component resolution and availability rules.
- Split provider responsibilities and replace generic save mutation with domain actions as mechanics grow.
- Consolidate hero path content/rules and add setup validation.
- Persist or intentionally remove the notion of draft hero setup.
- Split global styles and large board components along stable module boundaries.
- Strengthen storage validation/migrations and test them.
- Rewrite starter documentation for the game.

### Replace Candidate

- The metadata-only test suite as the primary verification signal; retain the check if useful, but surround it with meaningful rule and interaction tests.
- Unused starter public assets/examples once confirmed unnecessary.
- Device-local-only persistence when cross-device identity, valuable saves, or multiplayer become requirements. Local storage may remain appropriate for preferences and offline/prototype use.

## Unresolved questions

1. Where is the authoritative `fs.tokens.json`, and should tokens be copied, generated, or synchronized from it?
2. Should unfinished hero creation persist across returning to the player registry or page reloads?
3. Is one campaign per player an intentional product rule or only a prototype simplification?
4. Which parts of skill descriptions are intended mechanics versus placeholder flavor text?
5. Should Dungeon and Castle factions change rules now, or are they intentionally cosmetic at this stage?
6. What is the intended boundary between a player profile, an authenticated user, and a future multiplayer participant?
7. Which environment is authoritative for verification: Linux Sites build infrastructure, a container, or local macOS?
8. Is the current public deployment built from local commit `0b83193`?
9. Are `world` and `combat` the next boards, and what module contract should all future boards satisfy?

## Audit boundary and change confirmation

The audit inspected repository structure, package/runtime configuration, application entry points, component hierarchy, state reducer/context, save model and migration, Hero Creation rules/UI, skill-tree data, dungeon generation and interaction code, reusable UI, global styles/tokens, browser persistence, optional auth/database scaffolding, tests, scripts, Sites manifest/build configuration, Git status/history/remotes, and local tool/dependency availability.

Only this file, `docs/CURRENT_STATE.md`, was created. No application code was edited, no dependency was installed, no refactor or mechanic/UI change was made, no build artifact was generated, and no deployment was performed.
