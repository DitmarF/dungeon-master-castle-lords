# E01-T01 — Audit FS token adapter and define synchronization contract

Status: **Accepted — non-deployed checkpoint**
Audit date: 2026-08-09

## Task ID and name

`E01-T01 — Audit FS token adapter and define synchronization contract`

## Goal

Determine exactly how `sources/fs.tokens.json` can remain the authoritative FS design-system source while preserving the existing CSS custom-property API, light/dark behavior, persisted game state, and current UI appearance. Record the recommended synchronization contract as Proposed and stop before implementation.

## Context

- Stable base commit: `3532315bd788d7c47b9fae337f23285da381fa37`
- Accepted Sites version: `7`, whose source commit exactly matches the stable base
- Current roadmap milestone: EPIC 01 — UI shell and board architecture, Current; E01-T01 is the exact next task
- Relevant decisions: DMCL-009, DMCL-020, DMCL-I01, DMCL-P16, DMCL-Q15; this audit adds DMCL-P17 as Proposed
- Relevant documents/files: `AGENTS.md`, `docs/ROADMAP.md`, `docs/DECISIONS.md`, `docs/ARCHITECTURE.md`, `docs/WORKFLOW.md`, `docs/TASK_TEMPLATE.md`, `docs/GAME_CONCEPT.md`, `sources/fs.tokens.json`, `app/globals.css`, `app/layout.tsx`, `src/game/GameProvider.tsx`, `src/ui/SettingsSheet.tsx`, `src/boards/StartBoard.tsx`, `src/ui/Crest.tsx`, and UI/board components whose classes consume the global CSS layer
- Why this task is needed now: the authoritative FS source is restored, but the directly mapped CSS values and five persisted banner-color values are still maintained manually.

The working tree was clean on `main`; `HEAD`, `origin/main`, and accepted Sites version 7 all resolved to the same commit before this task began.

## Requirements

- Audit semantic Surface, Content, Action, Feedback, and Border colors; primitive game-object colors; spacing; typography; light/default and dark values; unexposed source modes/tokens; derived variables; and manual duplicates.
- Document theme bootstrap, system default, manual light/dark override, and return-to-system behavior.
- Compare a manual CSS adapter, a committed generated CSS adapter, and runtime JavaScript/TypeScript application.
- Recommend one synchronization contract compatible with the current Sites/Vinext/Vite and pre-render theme behavior.
- Preserve the separation between semantic UI colors and primitive gameplay colors.
- End at Candidate with any architecture choice marked Proposed.

## Constraints

- Keep changes within documentation for E01-T01.
- Preserve approved mechanics, persisted IDs, save compatibility, and unrelated user work.
- Do not install/upgrade dependencies, refactor, or change infrastructure.
- Do not deploy. Deployment requires a separate explicit user instruction.
- Do not redesign the UI, change gameplay, migrate styling systems, add a theme library, implement high contrast, implement E01-T02, save a Sites version, or change persisted game state.

## Non-goals

- Generating the CSS or TypeScript adapter.
- Changing current CSS variable names, selectors, values, import order, or consumers.
- Exposing muted or dark-high-contrast modes.
- Reclassifying fixed component contrast colors, shadows, map overlays, or gameplay rules.
- General stylesheet cleanup, Tailwind migration, CSS-in-JS, dependency work, build changes, or deployment.

## Acceptance criteria

- [x] The stable Git/Sites checkpoint is resolved and recorded.
- [x] Every directly mapped FS token family and mode is accounted for.
- [x] Adapter-only/derived values and manually duplicated values are distinguished from source mappings.
- [x] Unmapped source tokens and modes are explicit.
- [x] Current theme bootstrap, system behavior, and manual override behavior are documented.
- [x] The three synchronization approaches are compared against the requested criteria.
- [x] One synchronization contract is recommended with E01-T02 files, risks, and verification.
- [x] The recommendation is Proposed, not Accepted.
- [x] No unapproved gameplay or architecture decision was introduced.
- [x] No unrelated files or behavior changed.

## Verification

### Automated

- Deterministic read-only token comparison — result: all 31 mapped color tokens match FS in both exposed modes (62 assignments), and all 23 one-mode spacing/typography tokens match; zero value mismatches.
- CSS usage scan — result: all current direct and derived custom-property definitions and references were inventoried.
- Git/Sites checkpoint comparison — result: clean `main`, `HEAD` = `origin/main` = Sites version 7 source commit.
- Documentation status/reference and whitespace review — result: pass.
- Application build/lint — not required for a documentation-only task under `AGENTS.md`.

### Behavior/manual

- Read-only code review of the blocking head bootstrap, provider theme state/effects, settings switch, and return-to-system action.
- Read-only mapping review of global styles and the board/shared UI classes that consume the adapter.
- No browser behavior or visual appearance was changed or claimed re-tested.

### Environment limitations

- None affecting the documentation audit. E01-T02 build verification must use a supported environment with Node.js `>=22.13.0` and GNU `timeout` for the repository build/test helpers.

## Documentation impact

- Responsible documents to update: this task/audit; `docs/ARCHITECTURE.md`; `docs/DECISIONS.md`
- Decision changes: add DMCL-P17 as **Proposed**; narrow DMCL-Q15 to its owner-approval gate; no Accepted decision
- Roadmap change after acceptance: mark E01-T01 accepted through the normal checkpoint workflow and name `E01-T02 — Implement the approved FS token synchronization contract` as the proposed next bounded task
- `CURRENT_STATE.md` audit required: no; this task is a bounded audit rather than a general implementation-state re-audit

## Checkpoint

- Configured Sites source branch: `main` (`HEAD` and `origin/main` matched at task start)
- Commit/push authorized: not before Candidate acceptance; follow `docs/WORKFLOW.md` after explicit acceptance
- Expected checkpoint contents: this audit/task definition, Proposed decision record, architecture proposal, and acceptance/roadmap administration only
- Deployment authorized: **No**

## Current token-adapter findings

### Adapter shape and exact-match result

`sources/fs.tokens.json` contains:

- 23 primitive color tokens, each with `default`, `dark`, `muted`, and `dark-high-contrast` values;
- 20 semantic color tokens: 4 Surface, 5 Content, 4 Action, 4 Feedback, and 3 Border tokens, each with the same four modes;
- 9 spacing tokens with a default value;
- 14 typography tokens with a default value: 2 families, 5 sizes, 4 weights, and 3 line heights.

The current CSS adapter exposes 54 direct custom properties:

- all 20 semantic color tokens in `default` and `dark`;
- 11 selected primitive gameplay colors in `default` and `dark`;
- all 9 spacing tokens;
- all 14 typography tokens.

That produces 85 direct declarations across the two CSS mode blocks: 62 color declarations plus 23 one-mode spacing/typography declarations. Every exposed value exactly matches the FS source after whitespace normalization. There is no current value drift inside the mapped CSS declarations.

The drift problem is procedural: those exact values are copied by hand, so a future source change can leave the adapter stale without any failing check.

### Conceptual semantic mapping

In the table, `Semantic.*` means `fs-colors.FS-Semantic-Colors.*` in the JSON. Usage counts are current `var(...)` references in `app/globals.css`; zero means exposed API but no current consumer.

| FS source token | CSS adapter variable | Theme/mode | Current usage |
|---|---|---|---|
| `Semantic.Surface.color-surface-background` | `--fs-surface-background` | `default` → `:root`; `dark` → `:root[data-theme="dark"]` | 17; page/board backgrounds and derived surfaces |
| `Semantic.Surface.color-surface-elevation-1` | `--fs-surface-elevation-1` | default/dark | 4; dark derived surfaces and theme switch |
| `Semantic.Surface.color-surface-elevation-2` | `--fs-surface-elevation-2` | default/dark | 1; dungeon wall fill |
| `Semantic.Surface.color-surface-overlay` | `--fs-surface-overlay` | default/dark | 3; dungeon/map overlay ground |
| `Semantic.Content.color-content-inverse` | `--fs-content-inverse` | default/dark | 7; text/icons on primary actions and map contrast |
| `Semantic.Content.color-content-elevation-2` | `--fs-content-elevation-2` | default/dark | 0; preserved API, currently unused |
| `Semantic.Content.color-content-elevation-1` | `--fs-content-elevation-1` | default/dark | 49; secondary labels, metadata, inactive controls |
| `Semantic.Content.color-content-primary` | `--fs-content-primary` | default/dark | 11; body/primary copy and selected states |
| `Semantic.Content.color-content-disabled` | `--fs-content-disabled` | default/dark | 3; disabled controls/locked skill detail |
| `Semantic.Action.color-action-primary` | `--fs-action-primary` | default/dark | 57; buttons, controls, selection, navigation, map accents |
| `Semantic.Action.color-action-hover` | `--fs-action-hover` | default/dark | 2; primary-button hover background/border |
| `Semantic.Action.color-action-link` | `--fs-action-link` | default/dark | 0; preserved API, currently unused |
| `Semantic.Action.color-action-disabled` | `--fs-action-disabled` | default/dark | 0; preserved API; disabled UI currently uses Content disabled |
| `Semantic.Feedback.color-feedback-success` | `--fs-feedback-success` | default/dark | 9; status, readiness, open skills, save toast |
| `Semantic.Feedback.color-feedback-warning` | `--fs-feedback-warning` | default/dark | 1; incomplete readiness status dot |
| `Semantic.Feedback.color-feedback-error` | `--fs-feedback-error` | default/dark | 17; destructive/error states and dungeon-heart objective |
| `Semantic.Feedback.color-feedback-info` | `--fs-feedback-info` | default/dark | 0; preserved API, currently unused |
| `Semantic.Borders.color-border-subtle` | `--fs-border-subtle` | default/dark | 2; input to soft border plus direct usage |
| `Semantic.Borders.color-border-strong` | `--fs-border-strong` | default/dark | 3; input to medium border and dungeon wall stroke |
| `Semantic.Borders.color-border-focus` | `--fs-border-focus` | default/dark | 3; keyboard/input focus rings |

All semantic tokens remain UI-role tokens. Their use in the dungeon board is semantic where they style surfaces, focus, status, and UI-level map treatment; they are not a replacement palette for faction or game markers.

### Conceptual primitive mapping

`Primitive.*` refers to the base primitive group except Indigo, which is in `FS-Primitive-Colors-extended`. These variables are the gameplay/object palette, not semantic UI aliases.

| FS source token | CSS adapter variable | Theme/mode | Current usage |
|---|---|---|---|
| `Primitive.color-red` | `--fs-red` | default/dark | 0 CSS references |
| `Primitive.color-vermilion` | `--fs-vermilion` | default/dark | Fighter/General skill-tree accent |
| `Primitive.color-orange` | `--fs-orange` | default/dark | 0 CSS references |
| `Primitive.color-amber` | `--fs-amber` | default/dark | 0 CSS references |
| `Primitive.color-yellow` | `--fs-yellow` | default/dark | 0 CSS references |
| `Primitive.color-green` | `--fs-green` | default/dark | Ranger/Spy skill-tree accent |
| `Primitive.color-cyan` | `--fs-cyan` | default/dark | 0 CSS references |
| `Primitive.color-blue` | `--fs-blue` | default/dark | 0 CSS references |
| `PrimitiveExtended.color-indigo` | `--fs-indigo` | default/dark | 0 CSS references |
| `Primitive.color-violet` | `--fs-violet` | default/dark | Mage/Diplomat skill-tree accent |
| `Primitive.color-magenta` | `--fs-magenta` | default/dark | 0 CSS references |

`StartBoard.tsx` separately duplicates the FS default literals for Indigo, Vermilion, Amber, Green, and Violet. Those values become `PlayerProfile.bannerColor`, are persisted as literal strings, and are rendered by `Crest` and the dungeon hero SVG. This is intentional primitive gameplay usage, but its manual source duplication is a real synchronization gap.

Changing it to a theme-dependent CSS variable or changing the persisted representation would alter current behavior/save data. The proposed generator instead emits a narrow default-value TypeScript projection while keeping the stored strings byte-for-byte compatible.

### Spacing and typography mapping

| FS source tokens | CSS adapter variables | Theme/mode | Current usage |
|---|---|---|---|
| `Spacing.space-3xs` through `space-3xl` | same names with `--` prefix | default only | All 9 exposed; `xs`, `sm`, `md`, `lg`, and `xl` used; `3xs`, `2xs`, `2xl`, and `3xl` unused |
| `FontFamilies.font-family-base` | `--font-base` | default only | global body family |
| `FontFamilies.font-family-mono` | `--font-mono` | default only | compact labels, metadata, and game UI |
| `FontSizes.font-size-xs` through `font-size-xl` | same names with `--` prefix | default only | `xs`, `sm`, `md`, and `lg` used; `xl` unused |
| `FontWeights.font-weight-regular` through `font-weight-bold` | same names with `--` prefix | default only | medium, semibold, and bold used; regular unused |
| `LineHeights.line-height-tight` through `line-height-relaxed` | same names with `--` prefix | default only | tight and normal used; relaxed unused |

The adapter intentionally preserves established names even where they differ from the JSON leaf: `font-family-base` → `--font-base`, `font-family-mono` → `--font-mono`, and semantic/primitive `color-` prefixes → `--fs-` names.

## Adapter-only and derived tokens

These values are not direct FS source tokens and must remain handwritten:

| Adapter/application variable | Derivation or source | Role |
|---|---|---|
| `--surface-card`, `--surface-raised`, `--surface-muted`, `--surface-appbar` | mode-specific `color-mix(...)` recipes over FS surfaces | application surface recipes |
| `--border-soft`, `--border-medium` | mode-specific mixes over FS border tokens | application border strengths |
| `--shadow-soft`, `--shadow-sheet` | fixed light/dark shadow recipes | application elevation |
| `--radius-sm`, `--radius-md`, `--radius-lg` | fixed pixel values | application geometry; no FS radius source exists |
| `--tree-accent`, `--tree-on-accent` | component-local aliases/fixed contrast values | skill-tree presentation |
| `--banner-color` | runtime value from persisted player profile | gameplay marker color bridge |

Fixed `white`, black/near-black RGBA values, translucent overlays, and shadow alphas elsewhere in `globals.css` resemble FS primitives but are not direct adapter mappings. Several deliberately stay fixed across themes for on-color contrast, SVG/map rendering, or translucency. E01-T02 must not mechanically replace them with mode-switching primitive variables.

## Mismatches or drift found

1. **No mapped value mismatch:** all current default/light, dark, spacing, and typography mappings exactly equal the JSON source.
2. **Manual synchronization risk:** the 54 direct CSS properties are copied into `globals.css`; no generator or stale-artifact check exists.
3. **Persisted banner palette duplication:** five FS default primitive literals are copied into `StartBoard.tsx`.
4. **Theme contract duplication:** the storage key and preference interpretation exist in both the inline layout bootstrap and `GameProvider`. They currently agree, but no shared/checkable contract prevents drift. This is adjacent to token generation and should be regression-tested; E01-T02 need not refactor it.
5. **Unused exposure is not drift:** several semantic, primitive, spacing, and typography variables are defined but not referenced. They are part of the existing adapter API and should remain.
6. **Hardcoded contrast colors are not automatically source drift:** replacing them without role analysis could change current UI behavior.

## Unmapped FS modes and tokens

| Source material not exposed | Scope | Contract for now |
|---|---|---|
| `muted` mode | all 23 primitive + 20 semantic color tokens = 43 values | remain source-only; do not generate CSS selectors |
| `dark-high-contrast` mode | all 43 color tokens | remain source-only; high contrast is not implemented |
| default/dark primitive values | Chartreuse plus White, Grey Bright 1–4, Grey, Grey Dark 4–1, and Black = 12 tokens/24 values | remain source-only because the existing CSS API does not expose them |

The source contains 172 color-mode values in total. The current adapter exposes 62 and intentionally leaves 110 unexposed. Generation should use an explicit allowlist so adding a source token or mode does not silently expand the application API.

## Theme behavior audit

### Pre-render/bootstrap behavior

- Server-rendered markup has no `data-theme`; the CSS fallback is the default/light FS block.
- A blocking inline script in `app/layout.tsx` runs in `<head>` before body content. It reads `dmcl.prototype.theme.v1`, resolves dark or light, sets `document.documentElement.dataset.theme`, and sets the inline `colorScheme` style.
- A stored dark or light value wins. A missing or unrecognized value follows `prefers-color-scheme`.
- The generated recommendation keeps the exact `:root` and `:root[data-theme="dark"]` selectors, so it remains compatible with pre-render handling and requires no runtime token injection.

### Provider and settings behavior

- `GameProvider` models `system | light | dark`; absent/invalid storage resolves to system.
- In system mode it reads and listens to `prefers-color-scheme: dark`; device changes update the active theme.
- The Settings switch displays the resolved dark state. Toggling it creates and stores an explicit light or dark preference.
- “Use device setting” removes the storage key and returns to live system-mode behavior.
- Provider effects reapply `data-theme` and `colorScheme` after hydration.
- If storage writes fail, a manual choice still applies for the current session. If the bootstrap read throws, the caught failure leaves default/light until the provider resolves and reapplies the theme.

The source mode named `default` is therefore the light adapter block; “system” is preference-resolution behavior, not a third token mode.

## Comparison of synchronization approaches

| Approach | Simplicity | Drift risk | Maintainability | Build/runtime cost | Sites/Vinext/Vite compatibility | Pre-render compatibility | Dependencies |
|---|---|---|---|---|---|---|---|
| Manually maintained CSS adapter | Simplest today | High; exact values can silently diverge | Mapping knowledge remains implicit | None | Fully compatible | Fully compatible | None |
| Generated CSS adapter committed to repository | Small one-time script and clear generated boundary | Low when non-writing check gates stale output | Strong: paths, allowlist, aliases, and modes become executable/reviewable | Negligible generation/check; zero runtime | Strong fit: ordinary committed CSS through Vite/PostCSS/Sites | Strong: preserves selectors and blocking bootstrap | None required; Node standard library |
| Runtime JavaScript/TypeScript application | Most moving parts | Low source drift but higher bootstrap drift | Couples source parsing, theme resolution, DOM mutation, and React state | Bundle/startup parsing and DOM writes | Possible, but unnecessary runtime/platform coupling | Weakest: must run before paint and duplicate/replace bootstrap | None strictly required, but more runtime code |

## Recommended synchronization contract

**Recommendation: DMCL-P17 — committed deterministic generation, accepted on 2026-08-09.**

The repository evidence validates the preferred direction, with one narrow addition for persisted primitive values:

    sources/fs.tokens.json
      → dependency-free deterministic generator
      → committed fs-tokens.generated.css
      → existing handwritten derived/application CSS

      → limited committed default game-color TypeScript projection
        (only for existing persisted banner literals)

Contract details:

1. `sources/fs.tokens.json` is the only editable authority for directly mapped FS values.
2. The generator owns an explicit mapping/allowlist and preserves all 54 current CSS custom-property names exactly.
3. Generated CSS emits default semantic/selected primitive values plus spacing/typography under `:root`, and dark semantic/selected primitive overrides under `:root[data-theme="dark"]`.
4. Generated CSS is committed, marked “do not edit,” deterministic, and checked without writing during normal lint/build verification.
5. `globals.css` imports the generated layer before handwritten declarations. Derived surfaces, borders, shadows, radii, component-local variables, layout, and component rules remain handwritten.
6. Muted, dark-high-contrast, and 12 currently unexposed primitive tokens remain ungenerated until a separate approved task expands the API.
7. A small generated TypeScript export supplies the five existing default primitive banner strings. The stored `bannerColor: string` representation and saved values do not change.
8. Runtime theme selection remains the current layout bootstrap/provider responsibility; tokens are not parsed or applied by runtime JavaScript.
9. Source/schema errors, missing required modes, duplicate CSS names, unexpected value types, and stale committed output fail the check clearly.
10. Generated artifacts are never hand-edited; intentional adapter changes begin in the source or explicit mapping contract.

## Expected files for E01-T02

Likely bounded file set:

- `scripts/generate-fs-token-adapter.mjs` — dependency-free generator and `--check` mode;
- `app/fs-tokens.generated.css` — committed direct CSS adapter;
- `src/ui/fs-game-colors.generated.ts` — committed five-color default primitive projection;
- `app/globals.css` — import generated CSS; retain derived/application declarations and consumers;
- `src/boards/StartBoard.tsx` — replace five handwritten literals with generated constants without changing stored values;
- `package.json` — add supported generate/check scripts and wire the drift check into normal verification;
- `AGENTS.md` — document newly supported scripts;
- focused generator/check tests if CLI self-check is not sufficient;
- `docs/ARCHITECTURE.md`, `docs/DECISIONS.md`, this task record, and `docs/ROADMAP.md` only for approved decision/checkpoint status changes.

No dependency or lockfile change is expected.

## Migration and compatibility risks

- **Cascade/import order:** generated import must remain after the existing Tailwind import and before handwritten declarations.
- **Selector parity:** changing `:root[data-theme="dark"]` specificity or adding media-query mode would conflict with manual overrides.
- **API/name drift:** automatic naming would break aliases such as `--font-base`; use explicit mapping.
- **Accidental API expansion:** exporting everything would expose high contrast, muted, and neutral primitives without approval.
- **Fixed-versus-themed confusion:** replacing fixed white/near-black contrast values with theme-switching primitives can invert SVG/button contrast.
- **Persisted banners:** keep the same default RGBA strings; do not persist CSS expressions, token IDs, or dark variants.
- **Stale generated artifacts:** committed output needs a byte-comparison check.
- **Nondeterministic formatting:** ordering, whitespace, newline, and header must be stable.
- **Theme first paint:** runtime injection or post-hydration resolution could flash light; the proposal avoids it.
- **Platform build:** generator/check must use Node standard library only and need no browser, network, or package.

## Verification plan for E01-T02

### Generator and contract

- Generate twice and prove byte-identical output.
- Run the non-writing check against committed artifacts.
- Verify the 54 custom-property names and 85 declarations exactly preserve the current mapping.
- Verify missing required tokens/modes, invalid value types, duplicate output names, and stale output fail clearly.
- Verify muted, dark-high-contrast, Chartreuse, and neutral primitives are absent from generated CSS.
- Verify five generated banner values exactly equal current persisted literals.

### Repository verification

- Run the new token check directly.
- Run `npm run lint`.
- Run `npm test` in the supported Linux/GNU-`timeout` environment; it already runs the build.
- Review `git diff`; confirm no dependency/lockfile changes and only intended generated output.

### Behavior/manual verification

- Compare representative computed values before/after in explicit light and dark.
- With no stored key, verify first paint and live device-theme changes.
- Verify stored light/dark override system before first paint and ignore later system changes.
- Verify Settings creates a manual choice and “Use device setting” removes it.
- Verify StartBoard swatches, profile/game-shell crests, and dungeon hero marker retain exact colors in both themes.
- Verify semantic UI and primitive gameplay roles remain separate; perform no redesign.
- Verify no profile/campaign schema or value migration occurs.

## Decision resolution

The project owner accepted the E01-T01 Candidate and DMCL-P17 by directing implementation of the approved synchronization contract in E01-T02 on 2026-08-09.

DMCL-P17 is **Accepted**, DMCL-Q15 is resolved, and E01-T02 is authorized as the next bounded task.

## Completion report

### Candidate outcome

- Summary: audited the FS source-to-adapter boundary, found no mapped-value mismatch, identified procedural/manual duplication, and proposed a deterministic committed-generation contract.
- Changed files: `docs/E01-T01_FS_TOKEN_ADAPTER_AUDIT.md`, `docs/ARCHITECTURE.md`, `docs/DECISIONS.md`
- Acceptance evidence: all criteria above are checked with source, CSS, consumer, theme, Git, and Sites evidence.
- Automated verification: read-only comparison found zero mismatches across all 85 exposed declarations; documentation reference/status/whitespace checks passed.
- Behavior verification: theme and usage behavior reviewed in code; no UI behavior changed and no browser test was required.
- Documentation/decision updates: DMCL-P17 was proposed at Candidate and accepted by the project owner; DMCL-Q15 is resolved.
- Limitations/risks/open approvals: implementation and behavior verification belong to E01-T02; browser/build behavior was unchanged and not re-run by E01-T01.
- Deployment: **Not performed**

### User acceptance

- Status: accepted
- Accepted by/date: project owner, 2026-08-09

### Accepted checkpoint

- Final commit SHA: the acceptance-administration commit containing this update; reported with the saved Sites checkpoint because a commit cannot contain its own SHA
- Pushed source branch: `main`
- Saved Sites version: assigned from the pushed acceptance commit and reported with the checkpoint
- Roadmap status: E01-T01 accepted; EPIC 01 remains Current
- Next task: `E01-T02 — Implement the approved FS token synchronization contract`
- Deployment: **Not performed**
