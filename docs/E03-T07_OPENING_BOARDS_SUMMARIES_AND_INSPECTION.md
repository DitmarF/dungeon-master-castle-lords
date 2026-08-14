# E03-T07 — Opening boards, summaries, and inspection

Status: **Complete — accepted by the project owner on 2026-08-14**
Epic: EPIC 03 — Game Concept 2.0 transition and campaign persistence
Base checkpoint: `9e8e9cfa691e44fc61bb92d49d8d88ed3a9930c9` / Sites version 27
Scope: player-facing presentation and read-only inspection of the accepted version-5 Castle/Village opening

## Goal

Make the accepted Castle/Village-first campaign foundation understandable and inspectable without presenting EPIC 04+ mechanics as implemented.

## Dependencies

- E03-T01 transition contract — Complete and accepted.
- E03-T02 safe local lifecycle/persistence — Complete and accepted.
- E03-T03 minimum opening catalogs — Complete and accepted.
- E03-T04 deterministic home-ring generation — Complete and accepted.
- E03-T05 version-5 state/migration — Complete and accepted.
- E03-T06 Village-first Setup transition — Complete and accepted.

## Requirements

- Present typed hydration, migration, incompatibility, and persistence failures honestly.
- Keep normal new campaigns Castle-only and remove obsolete Dungeon-first Setup language.
- Summarize the authoritative Tier-1 capital Village without fake economy or construction.
- Render and keyboard/touch-select the stored home region plus six controlled neighbors.
- Identify the three approved sites, regional Dungeon, inert ruin, and terrain-only region.
- Enter the Dungeon only through its stored World-region location context and preserve its snapshot/progress.
- Distinguish strategic region from Dungeon exploration position everywhere.
- Keep Hero, Settlement, and World available; keep Dungeon contextual and Combat/Diplomacy unavailable.
- Expand the development-only inspector with version-5 World, capital, context, Dungeon, and compatibility evidence.
- Preserve portrait-first layout, safe areas, focus behavior, themes, and reduced motion.

## Explicit non-goals

No economy, yields, Roads, travel costs, control changes, construction, projects, units, Combat, Gambits, faction evolution, new Dungeon content, save-schema change, migration-policy change, deployment, or mutable inspector tooling.

## Acceptance criteria

- A fresh Setup opens the established Village and the player can understand the seven-region opening from stored campaign state.
- World region selection has visible and non-color-only state; the regional Dungeon alone offers legal entry.
- Dungeon entry creates valid stored exploration context without regenerating or resetting the Dungeon.
- Global and Hero presentation never call legacy Dungeon counters strategic Day or Gold.
- Incompatible, corrupt, migration, empty, and write-failure states are distinguishable where applicable.
- Replacement/deletion actions remain confirmed and verified; failure never implies durability.
- The inspector remains read-only and exposes the accepted version-5 authority/provenance.

## Verification

- `npm run verify`
- Focused pure transition, cutover/error, and source-contract tests.
- Rendered fresh, migrated, incompatible/corrupt, Save, reload, navigation, portrait, desktop, keyboard, theme, and reduced-motion checks.
- Full diff review for fake mechanics, duplicate authority, schema drift, and accidental deployment.

## Checkpoint boundary

Present a Candidate for owner review. Do not commit/push, save a Sites version, deploy, or begin E03-T08 before explicit owner acceptance.

## Candidate implementation

- Start/hydration presentation distinguishes incompatible legacy, corrupt parse/container/campaign, migration, unavailable storage, and write/verification states with bounded player copy.
- Explicit incompatible replacement retains profiles and compatible campaigns, omits only campaigns proven Dungeon-faction incompatible, verifies the preferred version-2 write, and never writes the original version-1 adapter.
- Start replacement/deletion prompts and the Dungeon Heart sheet now use the shared focus-contained/restoring dialog primitive.
- Setup copy makes Castle and the established Village implicit and states that the disposable draft becomes campaign truth only on completion.
- Settlement renders the stored Tier-1 capital, Castle authority, seven-region control, and approved content counts without economy or construction controls.
- World renders the stored axial home ring as seven selectable, non-color-only hex regions and resolves their labels from the authoritative opening catalogs.
- Owner-review correction: the seven flat-top regions now form one edge-sharing tessellation with no card gaps. Every cell uses a layered, high-contrast semantic hex border so shared edges remain distinct; selection and keyboard focus remain non-color-only and visible without separating adjacent regions.
- The regional Dungeon is the only executable World location. Its pure entry transition creates/resumes exploration context, reveals initial cells, preserves all generated/retained Dungeon facts, and leaves strategic position separate.
- Owner-review correction: the implemented Hero board is the sole Hero information surface. The shell shortcut navigates to it, the duplicate Hero sheet is retired, and the board now includes identity, compatibility attributes, skills, strategic region, and exploration context without promoting old Dungeon counters.
- The development inspector exposes schema/identity, seed provenance, capital, regions/sites/locations, active context, retained Dungeon, and explicit legacy metadata while retaining copy-only/read-only behavior.
- The theme bootstrap suppresses only the expected pre-hydration root-attribute difference; a clean rendered load reports no console warning.

## Candidate verification evidence

- `npm run verify` — PASS.
- Engine suite — 104/104 PASS.
- Bounded Vinext/Sites build and artifact validation — PASS.
- Rendered-HTML development metadata check — 1/1 PASS.
- `git diff --check` — PASS.
- Fresh 390 × 844 flow — player creation, New Campaign, Castle-only Setup, atomic Village entry, Settlement summary, World ring, regional Dungeon entry, Save, reload, and Continue PASS.
- Regional Dungeon entry — locked before World context; available after entry; retained discovery and exact resume board survive reload.
- Keyboard/focus — focusable Dungeon map accepts WASD; replacement and inspector dialogs contain/restore focus; Escape returns focus to the opener.
- Pointer/touch-sized path — Setup choices, World hex selection, Dungeon entry, navigation, and settings controls exercised at portrait width.
- Theme — explicit light and system-default paths PASS; reduced-motion CSS remains present and no new motion dependency was added.
- Desktop 1280 × 800 World layout PASS.
- Final clean browser run — no console warnings/errors.
- Owner-review hex-map correction — continuous shared-edge topology at portrait and desktop widths PASS.
- Owner-review Hero consolidation — header and board navigation reach the same Hero board, no Hero dialog remains, all six compatibility attributes are present, and portrait rendering reports no console errors.

Screenshots captured outside the repository for owner review:

- `E03-T07-village-portrait.png`
- `E03-T07-world-portrait.png`
- `E03-T07-dungeon-context-portrait.png`
- `E03-T07-world-desktop.png`

## Known limitations

- Browser-local failure visuals are protected by typed/source tests; the rendered browser run did not inject corrupt localStorage or a quota failure because the current preview exposes no safe failure-toggle tooling.
- Physical smartphone testing remains an owner action.
- The ruin, terrain-only region, and three resource sites are inspection-only by design. No yield, reward, travel, threat, or control mutation exists.

## Accepted boundary confirmation

No campaign-schema/version change, migration-policy reinterpretation, World or Dungeon regeneration, strategic Day/resource economy, Road, project, unit, Combat, Diplomacy mechanic, new dependency, or deployment was performed.

## User acceptance and checkpoint

- Status: accepted by the project owner on 2026-08-14; all points and tests approved.
- Source: committed and pushed to `main`; the owner reported the matching GitHub `Verify` workflow PASS.
- Final commit at the start of E03-T08: `84130b72e91acfee7923aab8b9db6b98f48989c9`.
- Sites checkpoint: version 28, saved from exact commit `84130b72e91acfee7923aab8b9db6b98f48989c9` after reconciling the configured Sites source branch. The version was not deployed.
- Next task: `E03-T08 — Compatibility and EPIC 03 exit gate`.
- Deployment: **Not performed**.
