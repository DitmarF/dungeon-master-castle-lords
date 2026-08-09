# E01-T02 — Implement FS token synchronization

Status: **Accepted — checkpoint pending**
Implementation date: 2026-08-09

## Task ID and name

`E01-T02 — Implement FS token synchronization`

## Goal

Make `sources/fs.tokens.json` the operational authority for the existing FS CSS token API and the five default primitive banner colors through deterministic, committed generated adapters, while preserving current light, dark, system-theme, UI, gameplay, and persisted-state behavior.

## Context

- Stable base commit: `dc46a1817909ea3dfb414e7f5e10a96c9062e931` on `main`, matching `origin/main` at task start
- Accepted Sites version: version `7` is the latest saved version, but its recorded source predates the pushed accepted E01-T01 checkpoint; the user explicitly confirmed the pushed Git checkpoint as the base for this task
- Current roadmap milestone: EPIC 01 — UI shell and board architecture, Current; E01-T02 is the exact next task
- Relevant decisions: DMCL-009, DMCL-020, DMCL-I01, DMCL-P16, and accepted DMCL-P17
- Relevant documents/files: `AGENTS.md`, `docs/ROADMAP.md`, `docs/DECISIONS.md`, `docs/ARCHITECTURE.md`, `docs/WORKFLOW.md`, `docs/TASK_TEMPLATE.md`, `docs/E01-T01_FS_TOKEN_ADAPTER_AUDIT.md`, `sources/fs.tokens.json`, `app/globals.css`, `app/layout.tsx`, `src/game/GameProvider.tsx`, `src/boards/StartBoard.tsx`, and repository build scripts
- Why this task is needed now: E01-T01 established and accepted the generated-adapter contract, while the mapped CSS and persisted banner defaults remain manually duplicated.

## Requirements

- Generate the approved default/dark semantic colors, selected primitive game colors, spacing, and typography into a committed CSS adapter without changing the 54-property CSS API.
- Generate the approved five default primitive banner values into a narrow TypeScript adapter without changing persisted literal values or their order.
- Keep application-specific surfaces, borders, shadows, radii, and component-local aliases handwritten and visibly separate from source-owned FS tokens.
- Provide deterministic generate and non-writing check commands using Node.js standard-library tooling only, and wire drift checking into normal verification.
- Preserve system-theme default behavior, manual light/dark overrides, semantic-versus-primitive roles, existing screens, and save compatibility.
- End at Candidate for user approval without saving a Sites version or deploying.

## Constraints

- Keep changes within the token generator and adapters, their existing consumers, supported command documentation, and the responsible architecture/decision/task documentation.
- Preserve approved mechanics, persisted IDs, save compatibility, and unrelated user work.
- Do not install/upgrade dependencies, refactor, or change infrastructure unless explicitly listed above.
- Do not deploy. Deployment requires a separate explicit user instruction.
- Do not expose `muted`, `dark-high-contrast`, or currently unexposed primitives; redesign the UI; alter the palette; migrate styling; broadly split `globals.css`; change theme ownership; or start E01-T03.

## Non-goals

- High-contrast or muted application modes.
- CSS variable renaming, broad stylesheet cleanup, a runtime token parser, CSS-in-JS, Tailwind migration, or a theme library.
- Gameplay, routing, shell, save-schema, board, or component redesign work.

## Acceptance criteria

- [x] `sources/fs.tokens.json` is the only editable authority for every generated FS value.
- [x] Generated CSS contains the approved 54 custom properties and correct default/dark values while retaining the existing API.
- [x] Generated TypeScript supplies the five existing default banner literals without persisted-state change.
- [x] Generated output is deterministic, clearly marked, committed, and reproducibly checked for drift.
- [x] Semantic UI tokens and primitive gameplay colors remain separate.
- [x] Handwritten adapter-only/derived variables remain documented and separate.
- [x] System, light, and dark theme selection remains compatible with the existing bootstrap/provider behavior.
- [x] Existing start, hero setup, dungeon, settlement, and settings behavior remains compatible.
- [x] No unapproved gameplay or architecture decision was introduced.
- [x] No unrelated files or behavior changed.

## Verification

### Automated

- `npm run tokens:generate` — expected: deterministic generated CSS and TypeScript artifacts.
- `npm run tokens:check` — expected: source schema/mapping validation and no committed-artifact drift.
- `npm run lint` — expected: pass in a supported installed environment.
- `npm test` — expected: pass in a supported installed environment with GNU `timeout`.
- Static before/after adapter comparison — expected: the same 85 CSS declarations and five banner literals.

### Behavior/manual

- Verify System, Light, and Dark theme selection and return-to-system behavior.
- Verify the start/player screen, hero setup, Dungeon board, Settlement board, and Settings sheet retain their intended appearance and behavior.
- Verify existing saved banner-color literals remain renderable and newly selected defaults remain byte-compatible.

### Environment limitations

- `node_modules` is absent and dependency installation was not authorized. `npm run lint` therefore reached and passed `tokens:check`, then was unavailable because `eslint` was not installed (exit 127).
- `npm test` reached and passed `tokens:check`, then the build helper reported that GNU `timeout` is unavailable (exit 69). The test suite did not run.
- The local application could not be started without installed dependencies, so browser/manual screen and theme checks were not run. Compatibility evidence is static: exact before/after values and API, unchanged theme code, unchanged component CSS consumers, and byte-identical persisted banner defaults.

## Documentation impact

- Responsible documents to update: `AGENTS.md`, `docs/ARCHITECTURE.md`, `docs/DECISIONS.md`, and this task record
- Decision changes: DMCL-P17 remains Accepted; record the concrete implementation files without introducing another architecture decision
- Roadmap change after acceptance: mark E01-T02 accepted through the checkpoint workflow and propose E01-T03 only after explicit acceptance
- `CURRENT_STATE.md` audit required: no

## Checkpoint

- Configured Sites source branch: `main`; Git `main`/`origin/main` is the accepted implementation base, while the latest saved Sites version remains older
- Commit/push authorized: yes; the project owner accepted the Candidate by directing continuation to E01-T03
- Expected checkpoint contents: deterministic generator and committed adapters, consumer/build integration, verification, documentation, and later acceptance administration
- Deployment authorized: **No**

## Completion report

### Candidate outcome

- Summary: implemented the accepted dependency-free generation chain from the authoritative FS JSON source to committed CSS and TypeScript adapters, with handwritten derived CSS left separate.
- Changed files: `AGENTS.md`; `app/fs-tokens.generated.css`; `app/globals.css`; `docs/ARCHITECTURE.md`; `docs/DECISIONS.md`; `docs/E01-T02_FS_TOKEN_SYNCHRONIZATION.md`; `package.json`; `scripts/generate-fs-token-adapter.mjs`; `src/boards/StartBoard.tsx`; `src/ui/fs-game-colors.generated.ts`
- Acceptance evidence: the generator uses an explicit allowlist and validates paths, modes, string/value shapes, duplicate CSS outputs, arguments, and stale/missing artifacts; generated files are marked do-not-edit; semantic and primitive sections remain distinct; `muted`, `dark-high-contrast`, and 12 unexposed primitives remain absent; no save schema or gameplay code changed.
- Automated verification: `npm run tokens:generate` passed; `npm run tokens:check` passed; repeat generation preserved SHA-256 `e6b64bf797855280828390779aa3c58af7fd071aa2c69d73e6ebb5c224ee55c5` for CSS and `13e8d4be9977449e08446ced66c7621196470aee0bce1c9929054cb7915d7325` for TypeScript; static comparison confirmed 54 default declarations plus 31 dark overrides (85 total) and the same five ordered banner literals; `node --check`, `package.json` parse, and `git diff --check` passed; `npm run lint` and `npm test` were invoked but unavailable as described above.
- Behavior verification: `app/layout.tsx` and `src/game/GameProvider.tsx` are unchanged; the generated selectors reproduce the former default/dark declarations; the CSS import precedes the unchanged handwritten derived layer; `StartBoard` consumes the same five default primitive strings. Browser verification of System/Light/Dark, start/player, hero setup, Dungeon, Settlement, and Settings was not run due to the environment limitation.
- Documentation/decision updates: documented both token commands in `AGENTS.md`; recorded concrete implementation files and boundaries in `docs/ARCHITECTURE.md`; added this task as implementation evidence for accepted DMCL-P17 without changing its status; left `ROADMAP.md` and `CURRENT_STATE.md` unchanged during Candidate.
- Limitations/risks/open approvals: application lint/test/browser results remain unknown until run in an installed supported environment; Sites version 7 remains older than the pushed Git base until the accepted checkpoint is saved. No architecture decision is awaiting approval.
- Deployment: **Not performed**

### User acceptance

- Status: accepted
- Accepted by/date: project owner, 2026-08-09; accepted by directing continuation to E01-T03

### Accepted checkpoint

- Final commit SHA: the acceptance-administration commit containing this update; reported with the saved Sites checkpoint because a commit cannot contain its own SHA
- Pushed source branch: `main`
- Saved Sites version: assigned from the pushed acceptance commit and reported with the checkpoint
- Roadmap status: E01-T02 accepted; EPIC 01 remains Current
- Next task: `E01-T03 — Harden the shared application shell`
- Deployment: **Not performed**
