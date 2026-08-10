# Repository guidance for AI sessions

This file governs work in this repository. Keep changes scoped, preserve approved decisions, and use the linked documents for detail.

## Read before changing anything

Always read:

1. `AGENTS.md` (this file).
2. `docs/ROADMAP.md` — current Epic and exact next task.
3. `docs/DECISIONS.md` — accepted, interim, superseded, and deferred decisions.
4. The task definition created from `docs/TASK_TEMPLATE.md`.

Then read only the documents relevant to the task:

- gameplay/mechanics → `docs/GAME_CONCEPT.md`;
- architecture/boards/platform boundaries → `docs/ARCHITECTURE.md`;
- campaign state/save/persistence → `docs/GAME_STATE.md`;
- reusable content/effects/assets → `docs/CONTENT_MODEL.md`;
- existing implementation facts → `docs/CURRENT_STATE.md`;
- workflow/checkpoint uncertainty → `docs/WORKFLOW.md`.

The task definition must list its relevant documents/files. Do not begin the next task until the prior task has reached the workflow’s Complete state.

Treat `CURRENT_STATE.md` as evidence, not target architecture. Treat entries marked TBD as unapproved detail. Do not infer approval from code or from a recommendation.

## Repository shape

- `app/`: application entry, metadata, theme bootstrap, global styles.
- `src/game/`: game models, state orchestration, rules, generation, content definitions, storage.
- `src/boards/`: board views and current board registry.
- `src/ui/`: reusable shell, navigation, sheets, icons, and shared UI.
- `worker/`, `build/`, `.openai/hosting.json`: Sites/Cloudflare delivery edges.
- `db/`, `drizzle/`: optional persistence scaffolding; no active application schema.
- `tests/`: focused pure-engine tests plus the built-output test.

Preserve the existing React/TypeScript, Vinext/Vite, Cloudflare Worker, npm, and lockfile setup unless an explicit approved task changes it.

## Architecture and state rules

- Maintain one authoritative campaign state across boards. Do not create board-local copies of durable campaign truth.
- Keep the established MVC-like separation: game data/rules, application state, board/UI views, and platform/storage concerns have different responsibilities.
- Boards are focused interaction surfaces over the shared campaign; avoid direct board-to-board component coupling.
- Game rules must not be defined by UI copy, CSS, browser storage, or hosting code.
- Durable choices and outcomes belong in the versioned campaign model. UI preferences, hydration, open sheets, pointer gestures, and other presentation state normally do not.
- Before changing persisted data, identify ownership, authority, defaults, compatibility, and migration behavior. Preserve existing save IDs and meanings unless an approved migration changes them.
- The current one-provider coordination structure, one campaign per player, browser-only persistence, and timestamp/save semantics are observed interim choices—not permanent decisions. The migrated playable mechanics already use named validated operations; do not reintroduce unrestricted whole-campaign board mutation.
- Implement accepted architecture only through scoped tasks. Do not build a generic effect engine until an approved mechanic supplies the concrete vocabulary; cloud and multiplayer authority remain deferred.

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
- `sources/fs.tokens.json` is the authoritative FS token source. Use the established CSS token adapter until a scoped task changes its synchronization; do not invent replacement tokens.
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
- `npm test` — runs the focused engine tests, then the build and current rendered-HTML test.
- `npm run test:engine` — runs focused TypeScript engine tests directly with Node's built-in test runner; no Sites build or browser is required.
- `npm run verify` — normal automated quality gate: FS token drift check, lint, focused engine tests, one bounded build/artifact validation, and the rendered-HTML test.
- `npm run validate:artifact` — validate an existing build artifact.
- `npm run start` — start an existing Vinext build.
- `npm run install:ci` — protected locked install for the ChatGPT Sites/Linux environment; use only when dependencies are absent and installation is authorized.
- `npm run tokens:generate` — deterministically regenerate the committed FS CSS and TypeScript adapters from `sources/fs.tokens.json`.
- `npm run tokens:check` — validate the FS source mapping and fail without writing when a committed generated adapter is stale.
- `npm run db:generate` — generate Drizzle migrations only for explicitly approved schema work.

There is no standalone `typecheck` script. Do not list or claim one.

The accepted DMCL-P18 verification responsibility contract is:

- ChatGPT Sites/Linux installs with `npm run install:ci` and verifies with `npm run verify`.
- Local macOS installs from the lockfile with `npm ci` and verifies with `npm run verify`.
- GitHub Actions installs with `npm ci` and verifies with `npm run verify`.

The Sites installer intentionally retains its Linux-specific integrity, cache, timeout, and concurrency safeguards. Ordinary build/test verification is portable across Linux and macOS and does not require GNU `timeout`, `flock`, `/proc`, or `sha256sum`.

## Verification

Match verification to risk and task scope:

- Documentation-only: inspect links/references, status labels, spelling, and `git diff`; no dependency install or application build is required.
- Code changes with dependencies available in a supported environment: run `npm run verify`. Its command graph already runs lint, focused engine tests, one build/artifact validation, and the rendered-HTML test; do not repeat the expensive build without a reason.
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
