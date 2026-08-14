# Dungeon Master & Castle Lords — E03-T08 Compatibility and EPIC 03 exit gate

Status: **EPIC 03 Exit Candidate — PASS, awaiting owner acceptance**

## Task ID and name

`E03-T08 — Compatibility and EPIC 03 exit gate`

## Goal

Perform the final compatibility, persistence, determinism, integration, documentation, and manual-acceptance audit for EPIC 03 without adding gameplay, then present a PASS/FAIL/BLOCKED Exit Candidate.

## Context

- Stable source base: clean synchronized `main` at `84130b72e91acfee7923aab8b9db6b98f48989c9`.
- Accepted dependencies: E03-T01–T07 and DMCL-P27–DMCL-P41; DMCL-029 records the accepted single Hero-information surface.
- Current persisted boundaries: campaign version 5 and registry version 2; version 4 and registry version 1 remain protected legacy/source-recovery boundaries.
- Sites project: `appgprj_6a762ab98b2c819181682817b758d7f8`; D1/R2 inactive.
- Deployment authorization: **No**.

## Candidate assessment

| Acceptance area | Result | Evidence |
|---|---|---|
| Migration compatibility | **PASS** | Explicit v2, v3, pre-Setup v4, completed Castle v4, Dungeon v4, malformed source, and v5 target fixtures. |
| Dungeon/World determinism | **PASS** | Fixed Dungeon bytes, separate World seed/stream, deterministic migration, target idempotence, stored snapshot round trip. |
| Atomic opening | **PASS** | Valid Setup creates one complete foundation; invalid/repeated completion leaves source unchanged with no duplicates. |
| Context/navigation | **PASS** | Settlement opens first; Hero/Settlement/World available; Dungeon contextual; Combat/Diplomacy disabled; Heart claim retired. |
| Persistence safety | **PASS** | Typed absence/read/parse/validation/migration/serialization/write/quota/verification outcomes, verified writes, rollback/source retention. |
| Stable authority | **PASS** | Campaign/profile/content/region/site/location references remain stable; Hero faction and strategic/exploration positions are not duplicated. |
| Epic boundary | **PASS** | No economy, Roads, projects, units, Combat, Gambits, evolution, later Hero progression, database, cloud, or deployment. |
| Automated repository gate | **PASS** | `npm run verify`: token drift/lint PASS, engine 107/107 PASS, bounded build/artifact PASS, rendered HTML 1/1 PASS. |
| Rendered desktop/portrait regression | **PASS** | Fresh Castle Setup, Settlement opening, seven-region World, contextual Dungeon, Save, reload/Continue, 390×844 and 1440×900 layouts, focus restoration, theme switch, and clean browser log verified. |
| Accepted-checkpoint integrity | **PASS** | Exact T07 commit `84130b72e91acfee7923aab8b9db6b98f48989c9` is on GitHub and the configured Sites source branch and is saved as non-deployed Sites version 28. |
| Owner physical smartphone and fixture-assisted failure/migration UI | **AWAITING OWNER** | [Manual QA checklist](./E03-T08_MANUAL_QA_CHECKLIST.md). |

No blocking policy gap, semantic-conversion defect, or checkpoint-integrity mismatch remains. EPIC 03 remains Current until the owner accepts this Candidate and the E03-T08 checkpoint workflow completes.

## Fixture and migration matrix

| Required class | Fixture/test authority | Verified contract |
|---|---|---|
| v2 campaign | `supportedV2Fixture`; `campaign-migration-v5.test.ts` | Protected v4 meaning, then byte-equivalent eligible v5 result. |
| v3 campaign | `supportedV3Fixture`; campaign-state/random/migration tests | Stored Dungeon seed adopted; exact Dungeon/progress retained. |
| v4 before Setup | `preSetupV4Fixture` | Identity/seed/lifecycle retained; null foundation; no fabricated draft/Hero. |
| completed v4 Castle | `completedV4CastleFixture` | Hero/build/ID/seed/timestamps and exact Dungeon retained; one deterministic opening added. |
| completed v4 Dungeon | `completedV4DungeonFixture` | Recoverable incompatibility; no Castle target; source unchanged. |
| malformed registry | `MALFORMED_REGISTRY_FIXTURE` plus persistence/cutover adapters | Typed container failure; zero writes. |
| malformed campaign/target | `malformedCampaignFixture` plus strict target corruption cases | Typed failure; no repair/regeneration/source mutation. |
| current v5 round trip | migrated and fresh Village-first fixtures | Exact serialized target reload; no World reroll or duplicate instance. |
| retained Dungeon snapshot | completed Castle fixture plus fixed seed `987654321` bytes | No regeneration; rooms/tiles/start/Heart/discovery/position preserved. |
| persistence read/write failures | `MemoryRegistryStorage` failure controls | Unavailable/read, parse, validation, migration, serialization, write, quota, and verification behavior. |

## Exit-criterion evidence

- No Dungeon reroll/regeneration: fixed legacy fixture and migrated-source byte assertions; target normalization does not call Dungeon generation.
- No World reroll: World is generated only for eligible legacy conversion or valid new Setup; valid v5 normalization clones the stored snapshot.
- Determinism/idempotence: repeated source conversion and v5 JSON round trip are byte-equivalent with unchanged stable references.
- One-time opening: exactly one capital, seven regions, three sites, two locations, and one regional Dungeon; repeated Setup is rejected.
- Context separation: `strategicRegionId` is a World region; Dungeon cell lives only in `explorationContext`.
- Semantic isolation: old Dungeon day/treasury/claim exist only under `legacyPrototypeMetadata`, are absent from strategic UI/rules, and cannot create the capital.
- Dungeon non-conversion: explicit `incompatible-faction`/`incompatible-legacy-campaign` outcomes and confirmed verified replacement only.
- Source safety: failed hydration/migration performs no write; cutover never writes the legacy adapter; verification failure restores/removes the prior preferred payload.
- Honest Save: success follows exact write/readback verification; failure remains failure and changes no timestamp.
- Legal boards: Settlement opens first; Hero/Settlement/World available; Dungeon requires regional context; Combat/Diplomacy disabled.

## Persistence failure evidence

| Failure | Player/application result | Source effect |
|---|---|---|
| No data | Legitimate empty registry | No write during hydration. |
| Storage unavailable/read | Typed bounded error | No empty replacement. |
| Parse/registry/campaign validation | Distinct typed error | Raw payload retained; zero writes. |
| Migration/incompatible faction | Distinct typed error/recovery | No silent target and no source write. |
| Serialization | Save failure before adapter write | Prior payload retained. |
| Write/quota | Save/autosave failure; current non-destructive session may remain unsaved | Prior durable payload retained. |
| Readback mismatch | Verification failure with rollback | Previous payload restored where adapter permits. |

## Documentation audit

- `GAME_STATE.md` and `ARCHITECTURE.md` describe the accepted v5/registry-v2, clock, verified persistence, migration, generation, Setup, context, and presentation boundaries.
- `CONTENT_MODEL.md` continues to own only the minimum typed Castle-opening definitions and their validation.
- `DECISIONS.md` retains every accepted/superseded/deferred status; this task accepts no new policy.
- `CURRENT_STATE.md` is refreshed from current source/test evidence rather than future plans.
- `ROADMAP.md` keeps EPIC 03 Current and E03-T08 as the sole task. It does not activate EPIC 04 before owner acceptance.
- `MVP_IMPLEMENTATION_PLAN.md` now distinguishes the implemented E03 boundary from later strategic mechanics.

## Epic boundary audit

EPIC 03 did **not** implement economy yields, strategic production/Days, Roads, connection/supply, construction, project queues, recruitment, units, armies, Gambits, tactical Combat, Republic/Empire, Industry/Magic, Holy/Unholy, later Hero progression, population, events, cloud/authentication, database persistence, multiplayer, or deployment.

The minimum site/location/settlement definitions, stored opening instances, and disabled board placeholders do not execute those mechanics.

## Candidate changes

- Add this exit-gate record and the owner manual QA checklist.
- Refresh `CURRENT_STATE.md` from current E03 implementation evidence.
- Reconcile accepted T07, roadmap, decision, concept, state, architecture, and implementation-plan wording without accepting EPIC 03 closure early.
- Correct locked placeholder copy to the accepted EPIC 07 Combat and EPIC 09 Diplomacy owners; add a source-contract assertion.
- Correct available sub-skill borders/fills to inherit the selected parent tree accent: Fighter/General vermilion, Ranger/Spy green, and Mage/Diplomat violet.
- Stack New Campaign and Continue Campaign as full-width, single-line touch targets at the smallest phone breakpoint while retaining the wider two-column layout.

No campaign schema, migration behavior, gameplay rule, dependency, lockfile, database, Worker, hosting configuration, or deployment is changed.

## Affected-file map

| File | Bounded E03-T08 responsibility |
|---|---|
| `docs/E03-T08_EPIC_03_EXIT_GATE.md` | Exit results, fixture/criterion evidence, limitations, and checkpoint boundary. |
| `docs/E03-T08_MANUAL_QA_CHECKLIST.md` | Owner scenarios A–G and physical-device acceptance record. |
| `docs/CURRENT_STATE.md` | Fresh verified version-5/registry-version-2 implementation audit. |
| `docs/ROADMAP.md` | Sole current E03-T08 task and complete E03 task history without early Epic closure. |
| `docs/DECISIONS.md` | Current approval position only; no new or promoted decision. |
| `docs/GAME_CONCEPT.md` | Implemented opening boundary and already accepted home-ring/save-policy wording. |
| `docs/GAME_STATE.md` | Reconcile accepted T07 presentation/context implementation status. |
| `docs/ARCHITECTURE.md` | Reconcile accepted T07 board/application boundary status. |
| `docs/MVP_IMPLEMENTATION_PLAN.md` | Current schema/task boundary and completed-transition history. |
| `docs/E03-T07_OPENING_BOARDS_SUMMARIES_AND_INSPECTION.md` | Record the accepted commit and reconciled non-deployed Sites version 28 checkpoint. |
| `app/globals.css` | Make available sub-skills inherit their parent tree accent and make smallest-phone campaign actions readable full-width touch targets. |
| `src/boards/CombatBoard.tsx` | Correct locked placeholder ownership from obsolete EPIC 11 to accepted EPIC 07. |
| `src/boards/DiplomacyBoard.tsx` | Name accepted EPIC 09 as the locked placeholder owner. |
| `tests/engine/opening-boards.test.ts` | Protect future-board ownership, parent-tree sub-skill color inheritance, and smallest-phone campaign action layout against drift. |

`CONTENT_MODEL.md` was inspected and requires no change because E03-T08 adds no content definition or authority.

## Verification

### Automated

- `npm run test:engine` — baseline PASS: 104/104 before the Candidate reconciliation.
- `npm run verify` — **PASS**: FS token adapter synchronized; ESLint PASS; engine 107/107 PASS; bounded Vinext build and Sites artifact validation PASS; rendered-HTML 1/1 PASS.
- Build emitted the existing Node `punycode` deprecation warning from the toolchain; no build or test failed.
- `git diff --check` — **PASS**.
- Local Markdown-link check for both new E03-T08 records — **PASS**.
- `git status --short --branch` and complete diff review — expected Candidate files only; no dependency, lockfile, generated artifact, secret, database, Worker, hosting, or deployment change.
- Checkpoint reconciliation — configured Sites source `main` advanced without force from T06 to exact accepted T07 commit; Sites version 28 saved; no deployment.

### Rendered/manual

- Accepted E03-T07 evidence covers fresh 390×844 and 1280×800 flows, Setup, Settlement, continuous home-ring map, regional Dungeon context, Save/reload/Continue, pointer, keyboard/focus, theme, reduced motion, and clean console.
- E03-T08 representative rendered regression — **PASS**: created a separate `E03 Exit QA` profile; completed implicit-Castle Fighter/General Setup; entered the Tier-1 Village; observed exactly seven World cells with Food/Wood/Stone/Dungeon/ruin/terrain-only contents; verified regional Dungeon entry, successful Save feedback, return/reload/Continue resume, disabled Combat/Diplomacy, Hero/Settlement/World availability, portrait 390×844 and desktop 1440×900 World layouts, dark/light switching with restoration, dialog Escape/focus restoration, and zero browser warnings/errors.
- Skill-tree color correction — **PASS**: computed and rendered checks confirm available nodes inherit vermilion for Fighter/General, green for Ranger/Spy, and violet for Mage/Diplomat; locked and selected states remain distinct and the browser log is clean.
- Smallest-phone campaign actions — **PASS**: at 320×667 and 375×667, both actions render stacked at full available width, remain single-line 44-pixel touch targets, Continue opens the saved campaign, New Campaign opens the verified-replacement dialog, and the browser log is clean.
- The E03-T08 run did not inject corrupt/migrated/quota fixtures, emulate system theme/reduced motion, or replace physical-device testing; those remain explicit owner checks below.
- Owner-required scenarios A–G are in [E03-T08_MANUAL_QA_CHECKLIST.md](./E03-T08_MANUAL_QA_CHECKLIST.md).

## Known limitations and unresolved risks

- Physical-smartphone acceptance remains owner-only.
- The application has no safe built-in corrupt-storage/quota/migration fixture switch; those behaviors are pure-test evidence unless the owner supplies a controlled browser fixture.
- Browser-local storage has no cloud, cross-device, export/import, or long-term cleanup guarantee.
- Retaining the version-1 source deliberately duplicates local payload bytes.
- Hero compatibility attributes remain temporary through EPIC 05 and require explicit EPIC 06 treatment.
- All EPIC 04+ mechanics remain absent and unresolved decisions stay deferred.

## Checkpoint boundary

This is a Candidate only. Before explicit owner acceptance, do not mark EPIC 03 Complete, activate EPIC 04, commit/push this Candidate, save a Sites version, or deploy.

After acceptance, follow `WORKFLOW.md`: apply closure/next-task status, rerun affected verification, commit and push without force, confirm pushed HEAD and GitHub Actions, save the matching non-deployed Sites version, and report the SHA/version/next task. Do not begin EPIC 04 automatically.
