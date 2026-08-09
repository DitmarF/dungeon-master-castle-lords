# E01-T07 — Owner manual QA checklist

Result recorded: **All items PASS**, reported by the project owner on 2026-08-09 for the exact current E01-T07 source.

## Desktop / responsive DevTools

- 320 × representative portrait height — `PASS`
  - No page-level horizontal overflow; the top/status areas, board viewport, six-board navigation, safe areas, scrolling, overlays, and touch targets remain usable.
- 360 × representative portrait height — `PASS`
  - Same checks as 320; navigation labels and active state remain clear.
- 390 × representative portrait height — `PASS`
  - Same checks as 320; no clipped board or sheet content.
- 430 × representative portrait height — `PASS`
  - Same checks as 320; navigation and shell remain stable.
- Desktop viewport (approximately 1280 × 800 or larger) — `PASS`
  - No unintended overflow; persistent shell, status areas, board viewport, and navigation use the available space correctly.

## Boards and campaign continuity

- Navigate Hero → Settlement → World → Dungeon → Combat → Diplomacy — `PASS`
  - All six use the same shell, the active state follows the displayed board, and scaffold boards contain no fake gameplay.
- Dungeon interaction — `PASS`
  - Existing exploration/movement behavior still works after leaving and returning.
- Dungeon → Settlement progression — `PASS`
  - Settlement remains locked before its existing requirement, unlocks through the existing path, and works after navigation away and back.
- Campaign continuity — `PASS`
  - Creating/selecting a player, Hero setup, saving/loading, board switching, and returning to Dungeon/Settlement do not erase campaign data.

## Themes, overlays, and accessibility

- System theme default — `PASS`
  - A new/default preference follows the operating-system theme without an obvious incorrect-theme flash.
- Light theme override — `PASS`
- Dark theme override — `PASS`
- Theme persistence — `PASS`
  - The chosen preference survives reload as before.
- HeroSheet — `PASS`
- SettingsSheet — `PASS`
- InfoSheet — `PASS`
  - For each available sheet: explicit close works, supported backdrop close works, Escape works, opening focus enters sensibly, Tab/Shift+Tab stay within the modal, focus returns to the opener, and short-height content scrolls without leaving the viewport.
- Keyboard/accessibility — `PASS`
  - Focus is visible, order is logical, active navigation is announced, locked/disabled controls are distinguishable, controls have usable labels, and important information is not hover-only.
- Reduced motion — `PASS`
  - With reduced motion enabled in the OS/browser, unnecessary transitions are suppressed and no interaction breaks.

## Physical smartphone

- Portrait shell and safe-area/browser-UI fit — `PASS`
- Six-board navigation and active indication — `PASS`
- System/Light/Dark theme switching — `PASS`
- Hero, Settings, and Info sheets/dialogs — `PASS`
- Vertical scrolling and short-screen overlay scrolling — `PASS`
- Touch comfort and accidental-tap resistance — `PASS`
- Dungeon interaction — `PASS`
- Campaign-state continuity after board switching/reload — `PASS`

## Overall result

- E01-T07 rendered/browser QA — `PASS` (owner-reported)
- E01-T07 physical-smartphone QA — `PASS` (owner-reported)
