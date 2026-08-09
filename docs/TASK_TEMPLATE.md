# Dungeon Master & Castle Lords — Task Template

Use one copy of this template per bounded task. Remove instructional placeholders, but keep all headings. Follow [WORKFLOW.md](./WORKFLOW.md) and [AGENTS.md](../AGENTS.md).

## Task ID and name

`<E##-T##[-subtask] — concise name>`

## Goal

State one concrete outcome. Describe what will be true when the task is complete.

## Context

- Stable base commit: `<SHA>`
- Accepted Sites version: `<version number or none/unknown>`
- Current roadmap milestone: `<milestone/status>`
- Relevant decisions: `<DMCL IDs>`
- Relevant documents/files: `<links or paths>`
- Why this task is needed now: `<brief reason>`

## Requirements

- `<required behavior or artifact>`
- `<required compatibility, mobile, state, content, or accessibility condition>`
- `<required workflow/checkpoint condition>`

## Constraints

- Keep changes within `<files/systems>`.
- Preserve approved mechanics, persisted IDs, save compatibility, and unrelated user work.
- Do not install/upgrade dependencies, refactor, or change infrastructure unless explicitly listed above.
- Do not deploy. Deployment requires a separate explicit user instruction.
- `<task-specific constraint>`

## Non-goals

- `<explicitly excluded adjacent feature>`
- `<cleanup/refactor/design decision not included>`
- `<future milestone not included>`

## Acceptance criteria

- [ ] `<observable result>`
- [ ] `<important edge/failure case>`
- [ ] `<mobile/state/content/accessibility result when relevant>`
- [ ] No unapproved gameplay or architecture decision was introduced.
- [ ] No unrelated files or behavior changed.

## Verification

### Automated

- `<supported command or documentation check>` — expected: `<result>`
- Do not list commands absent from `package.json`.

### Behavior/manual

- `<flow, viewport/input mode, state transition, or document review>`
- `<edge case and regression check>`

### Environment limitations

- `<none, or exact unavailable/unknown verification>`

## Documentation impact

- Responsible documents to update: `<none or paths>`
- Decision changes: `<none or DMCL IDs/status changes>`
- Roadmap change after acceptance: `<milestone status and proposed next task>`
- `CURRENT_STATE.md` audit required: `<yes/no; normally no>`

## Checkpoint

- Configured Sites source branch: `<branch or needs confirmation>`
- Commit/push authorized: `<yes/no/needs confirmation>`
- Expected checkpoint contents: `<task changes plus acceptance/roadmap updates>`
- Deployment authorized: **No**, unless a separate explicit deployment task says otherwise.

## Completion report

### Candidate outcome

- Summary: `<what changed>`
- Changed files: `<paths>`
- Acceptance evidence: `<criteria and evidence>`
- Automated verification: `<command/check and result>`
- Behavior verification: `<what was checked>`
- Documentation/decision updates: `<what changed>`
- Limitations/risks/open approvals: `<none or list>`
- Deployment: **Not performed**

### User acceptance

- Status: `<awaiting acceptance / changes requested / accepted>`
- Accepted by/date: `<record after explicit acceptance>`

### Accepted checkpoint

- Final commit SHA: `<after acceptance>`
- Pushed source branch: `<branch>`
- Saved Sites version: `<version number and opaque ID if needed>`
- Roadmap status: `<updated status>`
- Next task: `<ID/name>`
- Deployment: **Not performed**

