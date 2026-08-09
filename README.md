# Dungeon Master & Castle Lords

Mobile-first browser prototype combining 2D management, strategy, dungeon/building exploration, and tactical board-game play. The campaign is organized as interconnected boards over one central state.

## Current state

The playable flow is:

`local player → hero setup → dungeon exploration → dungeon-heart claim → placeholder settlement`

World strategy, conquest, supply, meaningful holding management, tactical combat, cloud saves, and multiplayer are planned system areas but are not implemented. See [`docs/CURRENT_STATE.md`](docs/CURRENT_STATE.md) for the audited boundary.

## Development

Requires Node.js `>=22.13.0`. With dependencies already available:

```sh
npm run dev
```

Repository commands and verification rules are documented in [`AGENTS.md`](AGENTS.md). Future tasks follow [`docs/WORKFLOW.md`](docs/WORKFLOW.md) and [`docs/TASK_TEMPLATE.md`](docs/TASK_TEMPLATE.md).

## Documentation

- [`docs/GAME_CONCEPT.md`](docs/GAME_CONCEPT.md) — approved game direction
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — structural principles
- [`docs/GAME_STATE.md`](docs/GAME_STATE.md) — campaign-state ownership
- [`docs/CONTENT_MODEL.md`](docs/CONTENT_MODEL.md) — data-driven content rules
- [`docs/DECISIONS.md`](docs/DECISIONS.md) — decision log
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — current Epic and exact next task

The authoritative FS token source is [`sources/fs.tokens.json`](sources/fs.tokens.json).

## Platform

Built with React/TypeScript using Next.js application conventions, Vinext/Vite, and a Cloudflare Worker for OpenAI Sites. Optional Cloudflare D1 and Drizzle scaffolding remains inactive.

## Repository shape

- `app/` — application entry, metadata, theme bootstrap, and global styles
- `src/game/` — models, central state, rules, content definitions, generation, and local persistence
- `src/boards/` — game-board views and the current board registry
- `src/ui/` — shared shell, navigation, sheets, icons, and reusable UI
- `worker/`, `build/`, `.openai/hosting.json` — Sites and Cloudflare delivery edges
- `db/`, `drizzle/` — inactive optional persistence scaffolding
- `tests/` — current built-output test

Deeper ownership and file-placement rules live in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md), [`docs/GAME_STATE.md`](docs/GAME_STATE.md), [`docs/CONTENT_MODEL.md`](docs/CONTENT_MODEL.md), and [`AGENTS.md`](AGENTS.md).

## Commands

- Node.js `>=22.13.0`
- `npm run dev` — start the development server
- `npm run lint` — run repository linting
- `npm run build` — build and validate the Sites artifact
- `npm test` — build, validate, and run the current rendered-output test

The install/build helper scripts target Linux and require GNU `timeout`; see [`AGENTS.md`](AGENTS.md) for the complete verified command list and environment limitations.

## Checkpoints and deployment

Every task follows the acceptance and checkpoint process in [`docs/WORKFLOW.md`](docs/WORKFLOW.md). Normal development tasks do not deploy the Site. Deployment requires a separate explicit user instruction.

Cloud persistence, authentication, and multiplayer remain deferred. Existing D1, R2, Drizzle, and ChatGPT sign-in helpers are inactive platform scaffolding, not approved game behavior.
