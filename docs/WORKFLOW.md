# Dungeon Master & Castle Lords — Development Workflow

Status: required workflow for future project tasks  
Last updated: 2026-08-09

## Purpose

Every task should produce one reviewable change, prove what changed, obtain user acceptance, and leave an accepted Sites version before the next task begins.

Use [TASK_TEMPLATE.md](./TASK_TEMPLATE.md) to define the task. Repository rules and supported commands remain in [AGENTS.md](../AGENTS.md).

## Non-negotiable deployment rule

Normal development tasks **must not deploy the Site**. Saving an accepted Sites version creates a checkpoint; it does not publish or change production. Deployment requires a separate, explicit user instruction naming deployment as the requested action.

Never treat “save,” “checkpoint,” “finish,” “accept,” or “show me” as deployment authorization.

## Stable starting point

The stable starting point is the latest user-accepted Sites version and its exact pushed source commit. If no saved accepted version exists, use the user-confirmed repository branch/commit and record that exception in the task.

Before editing:

1. Read `AGENTS.md`, this workflow, and the task definition.
2. Inspect `.openai/hosting.json`, the current branch/commit, working-tree changes, and the last accepted checkpoint if available.
3. Do not discard, overwrite, or absorb unrelated work. If the working tree does not match the intended stable base, resolve the scope with the user.
4. Read the required project documents listed in `AGENTS.md`, then reread the documents relevant to the task.
5. Check `docs/DECISIONS.md` for accepted, proposed, and blocking decisions and `docs/ROADMAP.md` for the current milestone.
6. Confirm the task has one bounded goal, explicit non-goals, acceptance criteria, verification, documentation impact, and checkpoint branch/source.

If a missing decision would materially change the result, stop and request that decision. Do not resolve a Proposed/TBD item through implementation.

## One-task cycle

### 1. Establish the candidate scope

- Create or complete a task definition from `TASK_TEMPLATE.md`.
- Identify the exact player-visible or documentation outcome.
- Record the stable base commit and, when known, the accepted Sites version number.
- List files/systems expected to change and explicit non-goals.
- Select verification appropriate to the risk using `AGENTS.md` and actual `package.json` scripts.

Do not combine unrelated cleanup, dependency work, deployment, refactoring, or future milestone work.

### 2. Execute one scoped task

- Make the smallest coherent change that satisfies the acceptance criteria.
- Preserve existing architecture, state, content, save, mobile, visual, and accessibility contracts.
- Keep unapproved mechanics and structural proposals unchanged unless the task explicitly approves them.
- Communicate scope changes or blockers before expanding the task.

### 3. Run automated verification

Use only supported commands documented in `AGENTS.md`.

- Documentation-only: verify files, links, references, status labels, and diff; no build is required.
- Code changes in a supported environment: run `npm run lint` and the relevant build/test path. `npm test` already runs the build.
- Platform/build changes: run `npm run build`.
- Database changes: generate and inspect migrations only when explicitly authorized.

Record every command and result. Distinguish passed, failed, not run, unavailable, and unknown. An environment limitation is not a passing result or an application failure.

### 4. Verify requested behavior

Automated checks do not replace task acceptance criteria.

- Exercise the requested flow and its important failure/edge case.
- For UI changes, verify portrait mobile/touch behavior and relevant keyboard, pointer, dark-mode, reduced-motion, safe-area, and accessibility behavior.
- Confirm persisted state/save-load behavior when affected.
- Confirm no unapproved mechanic, content, or unrelated UI changed.

State exactly what was checked and what remains unverified.

### 5. Review the changed files

Before presenting the candidate:

- inspect the complete working-tree status and diff;
- confirm every changed file belongs to the task;
- check for accidental generated files, dependency/lockfile changes, secrets, starter cleanup, or deployment configuration changes;
- review state ownership, migrations, persisted IDs, duplicated rule authority, cross-board consequences, and content references where relevant;
- verify comments/docs describe current behavior rather than aspirations.

Do not hide unrelated changes or claim ownership of pre-existing user work.

### 6. Update documentation when contracts change

Update only the responsible source of truth:

- product/gameplay contract → `GAME_CONCEPT.md`;
- architecture contract → `ARCHITECTURE.md`;
- campaign/runtime-state contract → `GAME_STATE.md`;
- content contract → `CONTENT_MODEL.md`;
- accepted/proposed/deferred decision → `DECISIONS.md`;
- milestone status and next task → `ROADMAP.md`;
- observed implementation audit → `CURRENT_STATE.md` only through an explicitly scoped new audit.

When a proposal is accepted, rejected, deferred, or superseded, update its responsible document and `DECISIONS.md` together. Do not duplicate large sections between documents.

### 7. Present the candidate and obtain acceptance

Provide a completion report using `TASK_TEMPLATE.md`:

- outcome and changed files;
- acceptance-criteria evidence;
- automated and behavior verification;
- documentation/decision changes;
- known limitations, risks, and unresolved approvals;
- explicit statement that the Site was not deployed.

Ask the user to accept the candidate. Until explicit acceptance:

- do not call the task complete/accepted;
- do not save a Sites version;
- do not start the next task;
- do not deploy.

If changes are requested, keep the same task active, revise, re-verify, review the new diff, and present the candidate again.

### 8. Create the accepted checkpoint

After explicit user acceptance:

1. Update `ROADMAP.md` with the accepted task/milestone status and identify the next bounded task. Keep this concise; `ROADMAP.md` is not a detailed execution diary.
2. Apply any acceptance-driven decision-status updates to `DECISIONS.md` and the responsible documents.
3. Review the final administrative diff and rerun any verification affected by those edits.
4. Commit the exact accepted source state and push it to the configured Sites source branch. Do not force-push. If commit/push authority or the target branch is not established, request it rather than guessing.
5. Confirm the pushed commit is current `HEAD` and that the working tree contains no task changes omitted from the checkpoint.
6. Save a Sites version using the exact `project_id` from `.openai/hosting.json` and the exact pushed `HEAD` commit SHA. If an archive is supplied, it must be built from that same source state and contain the valid Sites artifact.
7. Record/report the saved user-facing version number, commit SHA, completed task ID, and next task.

Saving the version is the end of the normal task. **Do not deploy it.** If saving fails, report the checkpoint as incomplete and do not begin the next task.

## Checkpoint integrity

An accepted checkpoint is valid only when these match:

- user-accepted behavior/documentation;
- final reviewed source tree;
- committed and pushed `HEAD`;
- source commit attached to the saved Sites version;
- any supplied build archive;
- `ROADMAP.md` status and named next task.

Never save a version from uncommitted, unpushed, stale, or differently built source.

## Task completion states

- **In progress:** implementation or verification is underway.
- **Candidate:** scope is complete and evidence is presented; awaiting user acceptance.
- **Changes requested:** candidate was not accepted; the same task remains active.
- **Accepted, checkpoint pending:** user accepted; roadmap/source/version checkpoint is not complete.
- **Complete:** accepted source is pushed, the matching Sites version is saved, roadmap/next task are recorded, and nothing was deployed.
- **Blocked:** a required decision, permission, environment, or external service prevents meaningful progress; report the exact blocker.

## Starting the next task

Begin the next task only after the prior task reaches **Complete**. Start from its saved accepted version and matching pushed commit, then repeat this workflow with a fresh task definition.

