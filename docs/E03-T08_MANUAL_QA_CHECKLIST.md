# E03-T08 — EPIC 03 owner manual QA checklist

Status: **Candidate checklist — owner execution required**

Use this checklist against the exact E03-T08 Candidate source. Record the browser/device, viewport, theme, input method, and any failure with a screenshot or short note. Do not deploy to perform these checks.

The application does not expose a corrupt-save or quota-failure developer toggle. Scenarios B–F therefore require a prepared browser-local fixture or controlled storage failure supplied outside normal play. The automated engine suite covers those policies independently; do not damage a valuable browser profile to reproduce them.

## A. Fresh campaign

- [ ] Create or select a local profile and start a new campaign.
- [ ] Confirm Castle is implicit and no Dungeon-faction choice is offered.
- [ ] Complete the accepted Class, Vocation, two-point allocation, and bonus-skill Setup.
- [ ] Confirm the first board is the Tier-1 capital Village.
- [ ] Confirm exactly one Village, one home region, and six adjacent controlled regions.
- [ ] Confirm Food, Wood, Stone, regional Dungeon, inert ruin, and terrain-only contents are visible.
- [ ] Confirm Hero, Settlement, and World are available; Combat and Diplomacy are unavailable.
- [ ] Confirm Dungeon is unavailable before selecting/entering its regional World location.
- [ ] Enter the Dungeon from World, then return/reload and confirm its structure and discovery did not regenerate.
- [ ] Save, return to players, Continue, and confirm the same campaign and resume context load.

## B. Migrated completed v4 Castle campaign

- [ ] Load a prepared completed v4 Castle fixture through the legacy registry path.
- [ ] Confirm campaign/profile IDs, campaign seed, timestamps, Class, Vocation, allocation, skill facts, and compatibility attributes are preserved.
- [ ] Confirm the complete Dungeon rooms, tiles, start, Heart, discovery, Heart outcome, and exploration cell are preserved.
- [ ] Confirm one Village and one deterministic seven-region home ring are added.
- [ ] Reload twice and confirm no IDs, placements, Dungeon facts, or World facts change.

## C. Pre-Setup v4 campaign

- [ ] Load a prepared incomplete v4 fixture.
- [ ] Confirm campaign/profile identity and seed are preserved.
- [ ] Confirm Castle Setup opens with no fabricated Hero or restored draft choices.
- [ ] Complete Setup once and confirm the normal atomic Village-first opening.

## D. v4 Dungeon-faction campaign

- [ ] Load a prepared completed v4 Dungeon-faction fixture.
- [ ] Confirm the UI explains that the campaign is incompatible and does not show a converted Castle campaign.
- [ ] Cancel replacement and confirm the original legacy source remains unchanged.
- [ ] If testing replacement, explicitly confirm it and verify the new Castle campaign appears only after the preferred write succeeds.
- [ ] Confirm the original version-1 source remains retained after successful replacement.

## E. Corrupt or malformed storage

- [ ] Load prepared malformed JSON, malformed registry, and malformed campaign cases separately.
- [ ] Confirm each produces a visible recoverable error rather than “no campaign.”
- [ ] Reload and confirm no automatic empty/new registry overwrote the source.
- [ ] Confirm ordinary New/Continue remains blocked until an explicit safe recovery action is chosen.

## F. Failed write

- [ ] Simulate an unavailable/quota/write/verification failure with a controlled adapter or browser environment.
- [ ] Confirm manual Save reports failure and never reports success.
- [ ] Confirm a non-destructive campaign change remains playable in memory and is marked unsaved/retryable.
- [ ] Confirm failed replacement/deletion keeps the previous durable campaign/profile.
- [ ] Confirm the prior stored payload is not falsely replaced.

## G. UI and device matrix

- [ ] Physical portrait smartphone: touch targets, safe areas, scrolling, home-ring readability, and Dungeon controls.
- [ ] Smallest supported phone width: New Campaign and Continue Campaign remain readable, full-width, single-line touch targets and both actions work.
- [ ] Desktop: opening boards, dialogs, World ring, and navigation layout.
- [ ] Keyboard only: Setup, board navigation, World selection, Dungeon controls, Save, dialogs, and Escape.
- [ ] Focus: visible focus, dialog containment, and focus restoration to the opener.
- [ ] State communication: selected/controlled/locked/error/success states remain understandable without color alone.
- [ ] Hero Setup skill trees: available sub-skills inherit the parent Class/Vocation color while labels, borders, and locked/selected states remain clear without relying on color alone.
- [ ] Theme: dark, light, and system settings.
- [ ] Reduced motion: no required information depends on animation.
- [ ] Reload/resume from Settlement, World, and a valid regional Dungeon context.

## Owner result

- Overall: [ ] PASS [ ] FAIL
- Browser/device(s):
- Candidate commit or source identifier:
- Notes/screenshots:
- Physical-smartphone acceptance: [ ] PASS [ ] FAIL
- Approval to close EPIC 03: [ ] Yes [ ] No
