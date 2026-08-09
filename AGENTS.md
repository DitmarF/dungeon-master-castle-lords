# Repository guidance for AI sessions

This file governs work in this repository. Keep changes scoped, preserve approved decisions, and use the linked documents for detail.

## Read before changing anything

Read these in order:

1. `docs/CURRENT_STATE.md` — observed implementation, limitations, and verification status.
2. `docs/GAME_CONCEPT.md` — approved product direction and open gameplay questions.
3. `docs/DECISIONS.md` — accepted decisions, interim implementation choices, pending proposals, and deferred decisions.
4. `docs/ARCHITECTURE.md` — structural principles and proposals.
5. `docs/GAME_STATE.md` — campaign-state ownership.
6. `docs/CONTENT_MODEL.md` — content/rule/instance/view boundaries.
7. `docs/ROADMAP.md` — current stage and decision-gated sequence.
8. `docs/WORKFLOW.md` — required candidate, acceptance, and checkpoint cycle.

Define each task with `docs/TASK_TEMPLATE.md`. Do not begin the next task until the prior task has reached the workflow’s Complete state.

Treat `CURRENT_STATE.md` as evidence, not target architecture. Treat entries marked Proposed/TBD as unapproved. Do not infer approval from code or from a recommendation.

## Repository shape

- `app/`: application entry, metadata, theme bootstrap, global styles.
- `src/game/`: game models, state orchestration, rules, generation, content definitions, storage.
- `src/boards/`: board views and current board registry.
- `src/ui/`: reusable shell, navigation, sheets, icons, and shared UI.
- `worker/`, `build/`, `.openai/hosting.json`: Sites/Cloudflare delivery edges.
- `db/`, `drizzle/`: optional persistence scaffolding; no active application schema.
- `tests/`: current built-output test.

Preserve the existing React/TypeScript, Vinext/Vite, Cloudflare Worker, npm, and lockfile setup unless an explicit approved task changes it.

## Architecture and state rules

- Maintain one authoritative campaign state across boards. Do not create board-local copies of durable campaign truth.
- Keep the established MVC-like separation: game data/rules, application state, board/UI views, and platform/storage concerns have different responsibilities.
- Boards are focused interaction surfaces over the shared campaign; avoid direct board-to-board component coupling.
- Game rules must not be defined by UI copy, CSS, browser storage, or hosting code.
- Durable choices and outcomes belong in the versioned campaign model. UI preferences, hydration, open sheets, pointer gestures, and other presentation state normally do not.
- Before changing persisted data, identify ownership, authority, defaults, compatibility, and migration behavior. Preserve existing save IDs and meanings unless an approved migration changes them.
- The current generic `updateGame` API, one-provider structure, hard-coded board rendering, one campaign per player, and local-only persistence are observed interim choices—not permanent decisions.
- Do not implement proposals such as a new board-module contract, generic effect engine, cloud model, or multiplayer authority model without explicit approval recorded in `docs/DECISIONS.md`.

## Content and mechanics

- Separate reusable definitions, domain rules, campaign instances/outcomes, and presentation. Consult `docs/CONTENT_MODEL.md` before adding content families or effects.
- Extend an existing content family when behavior and lifecycle are already supported; do not create a bespoke subsystem or board for each new item.
- Use the centralized skill-tree/catalog pattern where applicable. Do not duplicate authoritative labels, bonuses, relationships, or rule calculations between views and rule modules.
- Preserve stable persisted references such as existing skill and board IDs. Match the existing lowercase/kebab-case style for content IDs unless an approved ID policy supersedes it.
- Skill descriptions are mostly descriptive today; do not treat them as executable or balanced rules.
- Never silently add, redesign, rebalance, or finalize gameplay mechanics. Mark experiments as experiments and request approval when a choice would alter product rules.

## Naming and file guidance

- Use TypeScript/TSX and the repository’s strict compiler settings.
- Follow existing naming in the touched area: PascalCase for React component/type names and component files; camelCase for functions and variables; lowercase/kebab-case for current content IDs.
- Put game/domain work under `src/game/`, board-specific views under `src/boards/`, and reusable presentation under `src/ui/`. Keep Sites/Worker/database code at repository edges.
- Prefer focused extraction along stable responsibilities; do not split or rename files solely because they are large.
- Reuse `GameShell`, shared sheets, `GameIcon`, `Crest`, and established interaction patterns before creating parallel primitives.
- Preserve semantic, BEM-like class naming in existing styles. Do not introduce a styling-system migration incidentally.

## Product and visual requirements

- Design mobile-first and portrait-first for smartphone use. Touch is primary; preserve appropriate keyboard, pointer, larger-screen, safe-area, and reduced-motion behavior.
- Game visuals are SVG-first and use simple geometric forms. Reuse the existing icon/crest system; use supplied static images only where the approved design calls for them.
- Use FS semantic tokens for UI surfaces/content/actions/feedback and FS primitive colors for game objects. Do not mix these roles or invent replacement palette values.
- System dark mode is the default, with the existing user override behavior preserved.
- The authoritative `fs.tokens.json` is not present in this checkout. Do not guess missing tokens; use the established CSS token API or request the authoritative source/synchronization decision.
- Maintain accessible names, focus visibility, disabled/pressed states, Escape behavior for overlays, and touch target usability. Do not claim full accessibility without appropriate testing.

## Dependencies and scope

- Do not install, remove, or upgrade dependencies unless the task explicitly requires and authorizes it.
- Use npm and preserve `package-lock.json`. Do not switch package managers.
- Do not activate D1, R2, authentication, cloud saves, or deployment resources without explicit scope and approved data/product decisions.
- Do not refactor unrelated code, clean up starter residue, change metadata, deploy, or broaden a documentation-only task.
- Preserve unrelated user changes in a dirty working tree. Review the diff before editing and before handoff.
- Prefer the smallest coherent change that satisfies the task. Avoid speculative abstractions and future-proofing without a concrete approved need.
- Normal tasks must not deploy. Deployment requires a separate explicit user instruction; an accepted saved Sites version is a non-deployed checkpoint.

## Supported commands

Requires Node.js `>=22.13.0`. Use only commands present in `package.json`:

- `npm run dev` — Vite/Vinext development server.
- `npm run lint` — ESLint for the repository.
- `npm run build` — bounded Sites build plus artifact validation.
- `npm test` — runs the build, then the current rendered-HTML test.
- `npm run validate:artifact` — validate an existing build artifact.
- `npm run start` — start an existing Vinext build.
- `npm run install:ci` — locked install; use only when dependencies are absent and installation is authorized.
- `npm run db:generate` — generate Drizzle migrations only for explicitly approved schema work.

There is no standalone `typecheck` script. Do not list or claim one. The build/test helper scripts target Linux and require GNU `timeout`; on unsupported macOS environments, report verification as not run/unknown rather than treating an environment limitation as a product failure or inventing alternate project commands.

## Verification

Match verification to risk and task scope:

- Documentation-only: inspect links/references, status labels, spelling, and `git diff`; no dependency install or application build is required.
- Code changes with dependencies available in a supported environment: run `npm run lint` and the most relevant verification. `npm test` already runs `npm run build`; do not repeat the build without a reason.
- Build-only/platform changes: run `npm run build`; use `npm run validate:artifact` only when validating an already-produced artifact separately.
- Database schema changes: inspect generated migrations and use `npm run db:generate` only when the task authorizes schema work.
- Interaction or visual changes: test the affected mobile portrait/touch flow and relevant keyboard/accessibility behavior. Browser QA is task-dependent; state what was and was not checked.

Never claim a command passed if it was not run. Distinguish failure from “not run,” “unavailable,” and “unknown.”

## Documentation and decisions

- Update the responsible document when an approved product, architecture, state, content, or roadmap decision changes.
- Update `docs/DECISIONS.md` in the same change when a proposal is accepted, rejected, deferred, or superseded. Never silently rewrite decision history.
- Keep detailed material in its responsible document; keep `DECISIONS.md` as the compact index.
- Do not update `CURRENT_STATE.md` as a plan. Revise it only through a new evidence-based audit when implementation state materially changes.
- Mark unresolved matters as TBD/Open Question. Implementation alone does not resolve them.

## Definition of done

A task is done when:

- the requested scope is complete and unrelated behavior/files are unchanged;
- approved mechanics and decision boundaries are preserved;
- state/content ownership and save compatibility are handled when relevant;
- mobile portrait, touch, dark mode, FS tokens, SVG visuals, and accessibility expectations are preserved where affected;
- appropriate supported verification has passed, or limitations are reported precisely;
- required source-of-truth and decision documents are updated;
- the final handoff lists changed files, verification performed, and remaining approval needs.

For normal Sites development, this is the candidate definition of done. Final workflow completion additionally requires explicit user acceptance, the accepted source committed and pushed, a matching saved Sites version, an updated roadmap status, and an identified next task. Follow `docs/WORKFLOW.md`; never deploy as part of this checkpoint.

## Code review

Prioritize correctness and regressions over style preference. Check campaign invariants, save/migration safety, duplicated rule authority, cross-board consequences, deterministic behavior, mobile/touch/accessibility regressions, and accidental scope expansion. Distinguish observed defects from architectural proposals and gameplay preferences. Cite concrete files/lines, explain impact, and do not request redesign or rebalance without an approved decision.
