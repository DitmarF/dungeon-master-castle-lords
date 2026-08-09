# Dungeon Master & Castle Lords — Game Concept

Status: source of truth for the approved game concept  
Scope: product vision and major game systems, not detailed rules or technical architecture  
Last updated: 2026-08-09

## Purpose

This document gives future development sessions the established concept without requiring the original planning conversation. It distinguishes the approved direction from the currently implemented prototype and from matters that still require design or approval.

For implementation facts, limitations, and technical recommendations, see [CURRENT_STATE.md](./CURRENT_STATE.md). When the concept and the current build differ, treat this document as the intended direction and `CURRENT_STATE.md` as evidence of what exists today. Neither document silently resolves an open design question.

## Core concept

**Dungeon Master & Castle Lords** is a mobile-first, portrait-oriented browser game prototype combining 2D management, strategy, exploration, and tactical board-game play. The player develops a hero and faction, explores and controls dungeons, establishes and manages holdings, expands across a wider world through region conquest, maintains supply, and resolves encounters on a tactical combat board.

The game is organized as a modular set of interconnected boards backed by one central game state. Actions on one board must be able to create consequences on the others. The prototype favors clear surfaces, square or hexagonal grids, simple geometric SVG visuals, and rapid testing of mechanics over production-grade art.

## Design pillars

- **Interconnected decisions:** exploration, strategic management, and tactical encounters belong to one campaign rather than separate modes with disposable state.
- **Board-based clarity:** each major activity has a focused interactive board while shared campaign information remains consistent.
- **Persistent progression:** the hero, faction, controlled territory, dungeon/settlement development, resources, and campaign consequences progress together.
- **Expandable structure:** boards and systems should be independently addable or removable without fragmenting the central state.
- **Prototype-first rules:** implement and test mechanics incrementally; tentative ideas remain open until explicitly approved.
- **Mobile-first play:** portrait phone use is the primary interaction and layout target, with responsive support for larger screens.

## The three interconnected loops

### 1. Strategic and management loop

The player develops their dungeon, castle, settlement, or other holdings; manages campaign resources; supports hero and faction progression; maintains supply; and pursues control of regions on the world map. Strategic decisions establish the conditions, opportunities, and constraints for exploration and tactical encounters.

Approved at concept level: holdings/settlement management, faction progression, region conquest, supply, and a world-level strategic board are major systems.

The strategic campaign advances in **Days**. The hero has global Movement Points for strategic travel, while regions, holdings, and supply make geography consequential. Exact day advancement, movement costs, economy formulas, construction/production rules, diplomacy, conquest resolution, and supply calculations remain TBD.

### 2. Exploration loop

The player explores grid-based dungeon or building levels, reveals unknown space, discovers objectives and encounters, and changes the campaign by reaching or claiming important locations. A dungeon is a structured place with levels/areas rather than a one-off decorative map; its state belongs to the continuing campaign.

The current prototype demonstrates this loop with a deterministic square-grid dungeon, fog/discovery, movement, a dungeon heart objective, and claiming a settlement. These are implemented prototype facts, not a complete definition of future dungeon rules.

TBD: the full dungeon hierarchy, generation and persistence across multiple levels, room contents, hazards, rewards, ownership pressure, replenishment, and how castle/building exploration differs from dungeon exploration.

### 3. Tactical combat loop

Encounters are intended to resolve on a dedicated grid-based tactical board. Combat must use the same campaign entities and feed outcomes back into hero/faction progression, territorial control, resources, supply, and the explored location.

Approved at concept level: tactical combat is a major interconnected loop and board, not a detached minigame. It uses a hex grid, squad-scale forces rather than individual soldiers, an initiative queue, and separate Movement Point (MP) and Action Point (AP) economies.

The hero can become **Downed**, **Wounded**, or **Dead**; these are distinct states. Death of the actual sovereign ends the campaign in defeat. Exact initiative, MP/AP values, squad composition, movement/range, terrain, abilities, damage thresholds, recovery, rewards, and AI behavior remain TBD.

## Campaign progression

### Hero

The hero is a persistent campaign entity. The established prototype uses:

- faction: Dungeon or Castle;
- class: Fighter, Ranger, or Mage;
- vocation: General, Spy, or Diplomat;
- attributes: Strength, Agility, Perception, Intellect, Charisma, and Leadership;
- class and vocation skill trees with initial choices and ranks.

The prototype progression target is approximately **12 hero levels**. Class and Vocation combine toward a future prestige archetype. Each of the six class/vocation trees has an approved **root + three branches × three tiers** structure.

The attributes have these broad responsibilities:

- **Strength:** physical power and close-combat force;
- **Agility:** speed, finesse, and evasive movement;
- **Perception:** awareness and ranged accuracy;
- **Intellect:** knowledge and magical capability;
- **Charisma:** diplomacy and personal influence;
- **Leadership:** command, morale, and squad direction.

The exact implemented creation rules are recorded in `CURRENT_STATE.md` and enforced by the current code. Exact level thresholds, prestige archetypes, attribute formulas, skill effects, equipment, companions, respecialization, injury/recovery, and balance remain TBD.

### Faction

Dungeon and Castle are the established faction identities. Their approved development structure is:

```text
Castle
→ Humanoid / Light Dominion
→ Human | Dwarf | Elf
→ Domain
→ Ascension

Dungeon
→ Monster / Dark Dominion
→ Goblinoid | Insectoid | Necronoid
→ Domain
→ Ascension
```

The current prototype represents only the top-level Dungeon/Castle choice and does not implement this progression. Exact faction bonuses, resources, units, unlock requirements, relationships, Domain mechanics, Ascension mechanics, and balance remain TBD.

### Territory, holdings, and supply

Region conquest and supply connect the world, holdings, exploration, and combat. Controlled locations should have persistent campaign meaning, and supply should make geography and expansion consequential.

No detailed conquest or supply rules are established by this document. In particular, it does not decide adjacency, occupation, influence, supply-line tracing, attrition, transport, upkeep, or loss/reclamation rules.

## Time, defeat, and victory shape

- Strategic play advances in Days and uses global hero Movement Points.
- Dungeon/building exploration uses exploration turns on square grids.
- Tactical combat uses a hex grid, initiative queue, and separate MP/AP economy.
- Downed, Wounded, and Dead are distinct hero states; death of the actual sovereign is campaign defeat.
- Approved victory families are **Dominion**, **Conquest**, and **Ascension**.

Exact day/turn conversion, action costs, injury thresholds, sovereign succession rules (if any), and victory thresholds remain TBD.

## Boards and information flow

The approved top-level in-campaign board family is:

- **Hero** — future full character-management and progression surface;
- **Settlement** — holding development and management;
- **World** — strategic map and campaign geography;
- **Dungeon** — square-grid exploration and location interaction;
- **Combat** — tactical encounter resolution;
- **Diplomacy** — future campaign relationship and diplomatic interaction surface.

Player/campaign selection and hero setup remain pre-campaign surfaces rather than entries in the in-campaign board catalog. The full Hero board is distinct from `HeroSheet`, which remains a quick-information overlay available from the shared shell.

These surfaces preserve the previously approved responsibilities:

- **Player/campaign and hero setup:** create or recognize a player, start/load a campaign, and establish the hero/faction.
- **Dungeon/building-level board:** square-grid exploration and location-level interaction.
- **Settlement/dungeon/castle management board:** development and management of a controlled holding.
- **World map:** hex-grid regions, expansion, strategic movement, conquest, and supply context.
- **Tactical combat map:** hex-grid squad encounter resolution.
- **Additional focused boards:** may be added when a system benefits from its own clear interaction surface.

The central state is authoritative across boards. A board is a view and interaction surface over campaign state, not an isolated save. Typical information flow is:

`World/management conditions → exploration or encounter → tactical outcome → hero, faction, territory, holding, resource, and supply consequences`

The precise triggers and data contracts between boards are TBD and must be approved alongside their rules.

## Player, campaign, and persistence

The concept requires player creation/recognition plus saving and loading the central campaign for the current player. The current prototype provides multiple device-local player profiles, one local campaign per player, automatic browser storage, and a manual save reassurance action.

The following are not established product rules merely because the prototype currently behaves this way:

- one campaign per player;
- device-local identity as the final player model;
- browser-local storage as the final persistence layer;
- automatic saving as the final save contract.

Authenticated identity, cloud synchronization, ownership, multiple campaigns, migration, offline behavior, and multiplayer are TBD. Multiplayer is a possible future direction, not a current commitment.

## Presentation and interaction

- Mobile-first, portrait-first browser experience suitable for smartphone testing.
- Dark mode follows the system setting by default, with a user override.
- Use the FS color system: semantic colors for UI and primitive colors for game objects/imagery. The authoritative repository source is `sources/fs.tokens.json`; the CSS synchronization/adapter is handled by the design-system work.
- Prefer SVG and simple geometric forms for game visuals; static descriptive images may be supplied separately.
- Grid assignments are approved: World Map → hex; Dungeon/Building Map → square; Tactical Combat → hex.
- Accessibility, touch operation, keyboard support where applicable, safe areas, and reduced-motion behavior are part of the product quality bar.

## Current prototype boundary

As of the linked current-state audit, the playable path is: local player profile → campaign → hero setup → deterministic dungeon exploration → dungeon-heart claim → placeholder settlement board.

World strategy, region conquest, supply, tactical combat, meaningful settlement management, executable skill effects, cloud identity/storage, and multiplayer are not implemented. Their presence in the approved concept must not be reported as shipped functionality.

## Decision discipline

Future work must preserve these rules:

1. Do not turn a TBD or open question into a rule without explicit approval.
2. Record approved gameplay decisions in this document or in a dedicated responsible design document linked from here.
3. Keep detailed technical truth in `CURRENT_STATE.md` or later architecture documents; avoid duplicating it here.
4. When prototyping an unapproved mechanic, label it as an experiment and do not treat implementation alone as approval.
5. Preserve cross-board consequences and central-state ownership when designing new boards or systems.

## Open questions requiring approval

1. What are the exact thresholds and resolution rules for Dominion, Conquest, Ascension, and campaign defeat?
2. What bonuses, costs, unlock requirements, units, and balance distinguish the approved faction branches and stages?
3. What is the authoritative region-conquest model?
4. What is the authoritative supply model, and which entities consume or transmit supply?
5. What are the exact tactical initiative, MP/AP, squad, terrain, damage, recovery, reward, and AI rules?
6. What is the persistent dungeon/building hierarchy, including multiple levels and reset/repopulation behavior?
7. What are the exact hero level, prestige, skill, attribute, equipment, companion, injury, and recovery rules?
8. What management/economy systems belong on the settlement/dungeon/castle board?
9. Is one campaign per player intentional, and what is the future relationship between local profiles, authenticated users, and multiplayer participants?
10. Which game-state changes autosave, and what are the required cloud/offline/migration guarantees?
11. Is multiplayer merely a possible future extension or a design constraint that current systems must already accommodate?
