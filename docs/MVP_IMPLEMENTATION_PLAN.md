# Dungeon Master & Castle Lords — MVP Implementation Plan

Status: accepted implementation plan; active planning companion for EPIC 03–14
Scope: Game Concept 2.0 Castle-faction MVP, EPIC 03 through EPIC 14
Last updated: 2026-08-14

## 1. Authority and activation

This document translates the approved [Game Concept 2.0](./GAME_CONCEPT.md) into a bounded implementation sequence. It is the detailed planning companion to [ROADMAP.md](./ROADMAP.md):

- GAME_CONCEPT.md defines the approved product and gameplay direction.
- ROADMAP.md identifies the active Epic and exactly one next task.
- this document defines the accepted MVP Epic, task, subtask, dependency, and exit-gate structure.
- DECISIONS.md records acceptance, supersession, and unresolved decisions.
- GAME_STATE.md, ARCHITECTURE.md, and CONTENT_MODEL.md own their respective implementation contracts.
- CURRENT_STATE.md remains evidence of what is implemented, never a future plan.

The project owner accepted this plan and DMCL-P26 on 2026-08-14. Acceptance did not itself change the campaign schema, migrate a save, or authorize deployment.

DMCL-P26 records the roadmap rebase, EPIC 03 is the active implementation Epic, and the completed E03-T01 audit records its accepted transition decisions as DMCL-P27–DMCL-P39 plus campaign version 5 as DMCL-P40. Accepted E03-T02–T07 work implements the opening foundation; E03-T08 is the sole current task and must pass before EPIC 03 can close. Each later task still requires its own bounded task definition and any owner decisions named by this plan.

## 2. Roadmap rebase

Completed EPIC 00, EPIC 01, and EPIC 02 remain complete and historically unchanged. Their accepted source, decisions, tests, and closure evidence are not reopened.

The former unstarted EPIC 03–24 registry is superseded as a planning sequence because it predates Game Concept 2.0. The useful responsibilities are retained, but the order and grouping change:

- the persistence audit becomes a complete Concept 2.0 campaign-transition Epic;
- World, Settlement, economy, and strategic Days become one connected Tier 1 slice;
- Dungeon exploration becomes a regional World location rather than the source of the capital;
- armies precede and participate in the first real Combat slice;
- Hero Classes, Vocations, and Professions replace the old prestige-class framing;
- Gambits and defending-Hero resistance receive a dedicated integration Epic;
- the three faction-evolution decisions receive separate Epics;
- the first milestone moves forward to the exact strategic/exploration slice approved in the concept;
- post-MVP breadth is removed from the numbered MVP sequence.

This is a supersession of unstarted planning, not a claim that EPIC 03–24 were implemented or completed.

## 3. MVP outcome

The MVP is a complete local single-player Castle campaign that can begin, progress through all three evolution decisions, and end without developer intervention.

### 3.1 Included

| Area | Minimum complete MVP outcome |
|---|---|
| Campaign | local Castle campaign, deliberate save lifecycle, versioned state, controlled migration/recovery |
| Opening | Castle Hero Setup, capital Village, controlled six-region home ring, regional Dungeon context |
| Strategic play | compact hex World, Travel, Roads, control, connection, simple supply, strategic Days |
| Settlement | one capital, six commodities, one global capital stockpile, projects, core buildings, recruitment, evolution |
| Exploration | persistent square-grid regional Dungeon with at least one campaign consequence |
| Forces | core squads, one player army, regional enemies, enemy commanding Heroes, bounded tactical AI |
| Combat | hex board, initiative, Move, AP, Aim/Evasion, Armor/Ward, Durability, conditions, morale, persistent results |
| Hero | Levels 1–20, six attributes, three Classes, three Vocations, nine Professions, 150 shared base abilities |
| Gambits | General, Spy, and Diplomat initiating actions; defending-Hero and army resistance; symmetric enemy use |
| Evolution | Republic/Empire, Industry/Magic, Holy/Unholy, and all eight terminal identities |
| Diplomacy | minimum relationships, Loyalty, Security, Favor/Leverage, access, trade, and Gambit context |
| Endings | thin but executable Dominion, Conquest, and Ascension routes plus sovereign-death defeat |
| Experience | portrait-first touch UI, keyboard support, accessibility, dark mode, reduced motion, recovery, and QA |

### 3.2 Explicit MVP cuts

- no additional playable faction family;
- no secondary-settlement simulation, capital relocation, or evolution reversal;
- no local stockpiles, convoys, spoilage, deep route capacity, naval network, or siege simulation;
- no full population or individual-manpower simulation;
- no large crafting, item, loot, or spell catalog beyond capabilities required by approved abilities;
- no deep multi-level Dungeon catalog, repopulation simulation, or extensive building exploration;
- no full rival-sovereign grand-strategy simulation, weather system, or large procedural-event engine;
- no succession, ordinary base-Gambit defection, or Counter-Gambit system;
- no cloud saves, authentication, multiplayer, modding, remote content, or localization system;
- no deployment as part of normal MVP implementation tasks.

Deferred breadth may reuse the MVP’s proven capabilities later. It must not enlarge the MVP merely because the architecture could support it.

## 4. Delivery rules

1. Execute exactly one bounded task at a time through TASK_TEMPLATE.md and WORKFLOW.md.
2. Begin every mechanic-bearing Epic with the smallest decision task required for that Epic.
3. Do not turn illustrative numbers or TBD values into permanent rules without owner approval.
4. Implement vertical consequences across boards; do not build isolated board demonstrations.
5. Add campaign fields only when the same task implements their approved mechanic.
6. Increment and migrate the campaign version only when the persisted shape actually changes.
7. Preserve stable IDs and semantic meaning; never infer new history for an old save.
8. Use typed TypeScript catalogs and named validated rules; do not create a universal effect engine in advance.
9. Apply faction evolution as shared packages and narrow capstones, never as eight copied games.
10. Use deterministic inputs for campaign-changing randomness and store enough authority to resume safely.
11. Include mobile portrait, touch, keyboard, focus, dark mode, reduced motion, save/reload, and failure-path checks in affected tasks.
12. Finish every Epic with an explicit exit task, owner acceptance, matching pushed source, and a non-deployed Sites checkpoint.

## 5. Dependency spine and milestones

Primary execution order:

EPIC 00–02 complete → EPIC 03 → EPIC 04 → EPIC 05 → EPIC 06 → EPIC 07 → EPIC 08 → EPIC 09 → EPIC 10 → EPIC 11 → EPIC 12 → EPIC 13 → EPIC 14

Analysis and content drafting may sometimes occur in parallel, but implementation follows the repository’s one-task workflow and cannot bypass an unmet dependency or decision gate.

| Milestone | Position | Required playable proof |
|---|---|---|
| Foundation Gate | after EPIC 03 | new campaign begins as Castle/Village, reloads safely, and handles legacy saves by an approved policy |
| Milestone A — New-concept strategic slice | after EPIC 05 | Setup → Village → Road → improvement → Day → regional Dungeon consequence → Tier 2 preview |
| Milestone B — Connected gameplay loop | after EPIC 07 | recruit → Travel → encounter → tactical Combat → persistent campaign consequences |
| Capability Gate | after EPIC 09 | Hero progression, all nine Professions, executable abilities, Diplomacy, enemy Heroes, and opposed Gambits interoperate |
| Milestone C — Evolution-complete Castle campaign | after EPIC 12 | all eight Tier 4 identities work through shared strategic and tactical systems |
| Full Campaign Gate | after EPIC 13 | campaign can reach Tier 4 and resolve victory or defeat without developer intervention |
| MVP Candidate | after EPIC 14 | mobile-first, accessible, balanced, persistent, verified, and owner-accepted campaign |

## 6. Decision-gate map

| Gate | Must be decided before | Responsible open decisions |
|---|---|---|
| Lifecycle and migration | EPIC 03 schema cutover | DMCL-Q10, campaign count, timestamps, storage failure, Castle/Dungeon legacy treatment |
| Tier 1 economy and World | EPIC 04 implementation | DMCL-Q03, DMCL-Q07, smallest yields/costs/durations/project and supply behavior |
| Dungeon location | EPIC 05 implementation | DMCL-Q05, access, seed/snapshot authority, minimum persistent consequence |
| Hero progression | EPIC 06 implementation | DMCL-Q06, XP curve, attribute cap/conversions, respecialization, equipment thresholds |
| Army and Combat | EPIC 07 implementation | DMCL-Q04, recruitment, capacity, casualties, encounter resume, tactical constants |
| Executable abilities | EPIC 08 implementation | DMCL-Q12, targeting, stacking, durations, cooldowns, reactions, Mana, typed effect vocabulary |
| Diplomacy and Gambits | EPIC 09 implementation | DMCL-Q17, DMCL-Q18, relationships, costs, resistance weights, variance, bands, reset, hidden information |
| Tier 2 evolution | EPIC 10 implementation | DMCL-Q02, Tier 2 gate, Republic/Empire effects, units, buildings, counters |
| Tier 3 evolution | EPIC 11 implementation | DMCL-Q02, Mana values, Industry/Magic gates, facilities, effects, counters |
| Tier 4 evolution | EPIC 12 implementation | DMCL-Q02, capstone formulas, spiritual costs, signature content, counters |
| Territory and endings | EPIC 13 implementation | DMCL-Q01, remaining DMCL-Q03, compact World contents and victory thresholds |

An Epic may begin its decision task while exact later-Epic values remain TBD. It may not implement past its own unresolved gate.

## 7. EPIC 03 — Game Concept 2.0 transition and campaign persistence

**Purpose:** Replace the version-4 Dungeon-first prototype foundation with the minimum safe Castle-only, Village-first campaign state and deliberate local persistence behavior.

**Entry:** EPIC 00–02 complete; Game Concept 2.0 and DMCL-022–DMCL-028 accepted.

**Implemented schema boundary:** campaign version 5 (DMCL-P40) is the current playable authority after E03-T05/T06. Version 4 remains only a protected migration source; registry version 2 is preferred while the original version-1 payload is retained under DMCL-P31.

| Task | Outcome | Key subtasks |
|---|---|---|
| E03-T01 — Audit Concept 2.0 lifecycle, save, and opening transition | One approved transition contract before code changes | trace New/Continue/replace/delete/hydrate/autosave/manual Save/return; classify every v4 field as preserve, relocate, derive, retire, or decide; compare clean break, conversion, and legacy modes; define minimum new-opening state; present decisions and migration matrix |
| E03-T02 — Safe local lifecycle and persistence behavior | Honest, recoverable browser-local saves | inject the application clock; separate campaign modification from profile activity; define manual Save feedback; return typed read/write failures; prevent destructive autosave after failed hydration/migration; implement approved campaign cardinality and deletion/replacement behavior; add in-memory adapter tests |
| E03-T03 — Minimum Castle-opening content catalogs | Stable definitions needed by the new opening | centralize Castle root; retain dungeon only as compatibility/future identity; define Village, Food/Wood/Stone sites, basic terrain/location and regional Dungeon definitions; preserve valid Class/Vocation/skill IDs; add family-specific World references and catalog validation |
| E03-T04 — Deterministic Village and home-ring generation | Pure reproducible starting World | add axial home region plus six unique neighbors; guarantee approved Food/Wood/Stone access; place the introductory regional location; derive a World random stream without changing the legacy Dungeon sequence; record generator authority/version; test reproducibility and dependency purity |
| E03-T05 — Version-5 state and migration | Minimum target-shaped campaign with a pure migration chain | add Castle authority, capital Village, World/home ring, regional locations, and retained Hero/Dungeon facts; move faction out of Hero authority; separate strategic and exploration position; remove capital dependency on settlementClaimed; implement strict v2/v3→v4→v5 decoding; preserve approved IDs/facts; make migration deterministic and idempotent |
| E03-T06 — Village-first Hero Setup transition | Atomic creation of the playable foundation | make Castle implicit for new MVP campaigns; preserve approved Level-1 setup grants; create/activate Hero, Castle identity, Village, and World exactly once; enter the approved opening board; make Hero/Settlement/World available; gate Dungeon by regional context; disable Combat/Diplomacy until legal; retire claimSettlement as capital creation |
| E03-T07 — Opening boards, summaries, and inspection | Player-facing new opening without fake mechanics | update Start and Setup copy; render the Tier 1 Village and readable home ring; present the Dungeon through World context; remove Dungeon-local Day/Gold from global status; fix Hero/location assumptions; update the development inspector; present migration/storage errors; preserve portrait/touch/keyboard/accessibility behavior |
| E03-T08 — Compatibility and Epic exit gate | Verified, accepted transition checkpoint | cover every approved v2/v3/v4 fixture and v5 round trip; test no reroll/no regeneration/idempotence/stable IDs/atomic Setup/failure recovery; run normal verification and GitHub Actions; manually test new, migrated, incompatible, corrupt, and failed-write paths; refresh responsible docs and CURRENT_STATE evidence; owner device acceptance and non-deployed checkpoint |

### 7.1 E03-T01 accepted owner decisions

E03-T01 made these decisions explicit and the project owner accepted them before E03-T02:

1. MVP campaign count and replacement/deletion behavior.
2. Automatic persistence and the honest meaning of manual Save.
3. createdAt, updatedAt, and profile last-played meanings.
4. parse, validation, migration, quota, and write-failure recovery.
5. registry/container transition and preservation of the source payload until success.
6. whether unfinished Setup remains disposable.
7. the first board after Setup and initial board availability.
8. exact minimum contents of the three non-resource starting-ring regions.
9. World snapshot, generator version, and seed-provenance authority.
10. treatment of completed v4 Castle campaigns.
11. explicit non-conversion policy for v4 Dungeon-faction campaigns.
12. treatment of old Dungeon day, treasury, and settlementClaimed fields.
13. temporary compatibility treatment for current Hero attribute bonuses until EPIC 06.

The accepted MVP defaults are one local campaign per profile, autosave after successful durable changes, manual Save as an immediate verified write, visible recoverable storage errors, immutable createdAt, campaign updatedAt only for campaign-truth/resume-context changes, and profile activity tracked separately. DMCL-P27–DMCL-P39 hold the thirteen transition decisions; DMCL-P40 accepts version 5 as the next campaign-schema number.

### 7.2 Required migration classes

| Input | Required bounded outcome |
|---|---|
| v4 before completed Setup | preserve identity and seed; enter Castle-only Setup; do not invent a draft |
| completed v4 Castle campaign | preserve approved Hero/build/ID/seed/Dungeon facts; generate the Village/home ring deterministically |
| completed v4 Dungeon campaign | never silently convert to Castle; follow the approved legacy or fresh-start policy |
| v2/v3 campaign | normalize through the protected v4 compatibility step before the approved next-version policy |
| malformed registry or campaign | return a recoverable typed error; never generate and autosave a silent replacement |
| retained Dungeon snapshot | attach to regional context without regenerating rooms, tiles, discovery, Heart state, or exploration position |
| old settlementClaimed | preserve/map only by an explicit policy; it cannot create or own the starting Village |
| old day and treasury | do not reinterpret as strategic Day or Gold without an approved conversion |

### 7.3 EPIC 03 exit gate

- A new campaign reaches Castle Setup and creates one Village plus one deterministic controlled home ring exactly once.
- Hero, Settlement, and World have target-shaped availability after Setup.
- Dungeon entry requires regional context; the Dungeon Heart no longer creates the capital.
- Every supported old-save class follows an approved, tested policy.
- Invalid or failed persistence cannot silently overwrite the source.
- No economy yield, Road construction, unit, Gambit, Combat, or faction-evolution effect is pulled into the transition.

## 8. EPIC 04 — Tier 1 World, Settlement, economy, and strategic Days

**Purpose:** Implement the first functioning strategic-management slice over the EPIC 03 foundation.

| Task | Outcome | Key subtasks |
|---|---|---|
| E04-T01 — Tier 1 economy and Day decision packet | Approved minimum executable values | decide starting stockpile, base and improved yields, Road/Workshop/Farm/Quarry/Lumber Camp costs, project duration/capacity, Day phase order, minimum upkeep/shortage behavior, and connection/supply effects |
| E04-T02 — Strategic content and state contracts | Typed definitions and minimum persisted facts | add six commodity identities but activate only Tier 1 extraction; define sites, buildings, exterior improvements, Roads, projects, requirements, costs, and stable references; classify stockpile/project/constructed state and derived production/connectivity |
| E04-T03 — Control, connection, and simple supply | One authority for World network legality | implement Road edges, continuous controlled paths, site connection, improvement activation/suspension, reconnection, and bounded supply selectors; exclude capacity, convoys, and sieges |
| E04-T04 — Projects and deterministic Day resolution | Atomic construction and resource flow | validate/start/advance/complete projects; consume costs once; implement one capital project queue; resolve production, upkeep, projects, and shortages in the approved order; emit readable calculation summaries |
| E04-T05 — Tier 1 buildings and improvements | Working Village infrastructure | implement Workshop, Road, Farm, Quarry, and Lumber Camp; connect Settlement choices to World placement; preserve improvement presence while disconnected; prevent duplicate completion or cost consumption |
| E04-T06 — World and Settlement boards | Portrait-first strategic interaction | replace both scaffolds with authoritative summaries, reachable hex selection, build/project previews, stockpile, queue, Day action, consequence feedback, touch/keyboard states, and accessible labels |
| E04-T07 — Cross-board integration and exit | Verified strategic slice | test World/Settlement agreement, disconnection/reconnection, insufficient resources, repeated commands, save/reload, deterministic Day results, mobile interaction, documentation, and owner acceptance |

**Epic exit:** The player can construct a Road, improve one matching resource site, advance one Day, and see the same persistent production consequence on World and Settlement.

## 9. EPIC 05 — Regional Dungeon integration and Milestone A

**Purpose:** Complete the approved first vertical slice by making exploration a regional action with a persistent strategic consequence.

| Task | Outcome | Key subtasks |
|---|---|---|
| E05-T01 — Regional-location decision packet | Approved minimum Dungeon access and consequence rules | decide discovery/access, Travel cost, entry/exit/return context, seed/snapshot authority, one objective/reward, one non-combat threat, and whether hostile-region entry is permitted in this slice |
| E05-T02 — Location and exploration state boundary | Dungeon belongs to a World region | add stable regional-location reference; preserve existing generated snapshot/discovery; separate strategic presence from exploration position; define entered/completed/consequence facts without a universal location framework |
| E05-T03 — Travel, discovery, entry, and return transitions | Legal round trip between boards | implement site discovery, access validation, Travel, enter Dungeon, resume, exit, and return destination; prevent entry without context or repeated cost consumption |
| E05-T04 — Persistent exploration consequence | Dungeon changes the campaign | implement one objective, choice, or reward that affects World or Settlement; show the result on return; add a non-combat threat/result before the Combat Epic |
| E05-T05 — Tier 2 evolution preview | Visible future dependency without early evolution | show Republic and Empire directions, current gate requirements, completed/missing conditions, and explicit “not yet available” state from authoritative definitions |
| E05-T06 — Milestone A exit gate | Complete strategic/exploration proof | verify Setup → Village → Road → improvement → Day → regional Dungeon → persistent consequence → Tier 2 preview; test reload and mobile/keyboard paths; owner acceptance and checkpoint |

**Epic exit:** The exact Game Concept 2.0 first playable vertical slice works. No faction choice, Profession effect, army, or tactical Combat is implemented early.

## 10. EPIC 06 — Hero levels, attributes, Classes, Vocations, and Professions

**Purpose:** Establish the complete progression structure and all stable Hero identities before executable tactical breadth.

| Task | Outcome | Key subtasks |
|---|---|---|
| E06-T01 — Hero progression decision packet | Approved curves and bounds | decide XP thresholds, attribute cap/conversion rules, Level-1 compatibility, respecialization, equipment requirements, XP sources, injury/recovery minimum, and which derived values become executable now |
| E06-T02 — Authoritative Hero catalogs | One source for Hero foundations | centralize six attributes, three Classes, three Vocations, nine Professions, Masteries, branch structures, names, icons, descriptions, tags, and stable IDs; retain current IDs where meaning survives |
| E06-T03 — Levels, XP, and attributes | Legal Level 1–20 progression | add Level, XP, two attribute points per level, 40-point total budget, validated allocation, bounded derived selectors, XP award transition, and migration/default behavior |
| E06-T04 — Skill spending and Profession unlock | Enforced 20-point build budget | grant free Class/Vocation Mastery I; implement ranks, sequential Techniques, 20 spendable points, five purchased Class plus five Vocation points, both roots Rank II, earliest Level 10 unlock, and free Profession Signature I |
| E06-T05 — Nine Profession definition catalogs | Complete stable 90-ability identity set | define Warlord, Huntmaster, Warcaster, Assassin, Stalker, Veilweaver, Champion, Herald, and Enchanter trees; keep effects descriptive until EPIC 08 where a concrete rule vocabulary exists |
| E06-T06 — Hero board | Mobile progression interaction | implement XP/Level/attributes, Class/Vocation/Profession ancestry, point spending, prerequisites, previews, locked reasons, equipment thresholds, undo-before-confirm behavior, and one concise authoritative Hero presentation |
| E06-T07 — Progression fixtures and exit | Verified constrained builds | test every Class × Vocation path, earliest unlock, overspend/invalid rank rejection, Level 10 and 20 accelerated fixtures, migration, save/reload, mobile/accessibility, documentation, and owner acceptance |

**Epic exit:** Every Class × Vocation combination progresses legally, all nine Professions unlock under the approved arithmetic, and the Level-20 budget cannot purchase everything.

## 11. EPIC 07 — Persistent armies, encounters, and tactical Combat core

**Purpose:** Complete the first strategic → encounter → tactical → campaign-consequence loop.

| Task | Outcome | Key subtasks |
|---|---|---|
| E07-T01 — Army and Combat decision packet | Minimum executable tactical rules | decide squad sizes/stats, recruitment/upkeep/reinforcement/capacity, encounters, resumability, casualties, initiative, Move/AP, line of sight, Aim/Evasion, damage constants, Armor/Ward, Durability, healing, Resolve/Cohesion, retreat, injury, and rewards |
| E07-T02 — Squad, unit, and army contracts | Persistent player and enemy forces | define Militia, Slingers, Healers, a small enemy roster, squad instances, army composition, command/recruitment capacity, casualties, reinforcement, statuses, and stable identity/reference rules |
| E07-T03 — Recruitment, upkeep, Travel, and encounters | Strategic preparation reaches battle | implement recruit/reinforce/disband where approved, Day upkeep, army placement/Travel, threats, encounter identity, deterministic encounter seed, deployment inputs, and legal Combat entry |
| E07-T04 — Pure tactical engine | Deterministic playable battle | implement hex coordinates, deployment, initiative queue, Move, AP, range, line of sight, Aim/Evasion, basic physical/magical packets, Armor/Ward mitigation, finite Durability, healing, conditions, Resolve, and defeat |
| E07-T05 — Combat board and bounded AI | Usable tactical presentation | implement portrait touch selection, reachable/action previews, initiative, hex targeting, combat log, end-turn/undo rules, keyboard/pointer support, reduced motion, and enemy AI using the same legal actions |
| E07-T06 — Campaign consequence transition | Battle permanently matters | atomically persist casualties, reinforcement needs, Hero Downed/Wounded results, rewards, relationship/territory/location outcomes, and return board; prevent replay/reroll of a resolved encounter |
| E07-T07 — Milestone B exit gate | Complete connected loop | verify recruit → Travel → encounter → Combat → persistent consequence, save/resume policy, deterministic fixtures, AI legality, mobile/accessibility, cross-board state, documentation, owner acceptance, and checkpoint |

**Epic exit:** The player recruits a core army, completes a tactical encounter, and sees every approved result in the continuing campaign.

## 12. EPIC 08 — Executable abilities, equipment, and tactical depth

**Purpose:** Turn all 150 stable Class, Vocation, and Profession abilities into authoritative executable content without faction copies.

| Task | Outcome | Key subtasks |
|---|---|---|
| E08-T01 — Concrete effect-vocabulary decision | Small typed rules derived from real abilities | decide targeting, requirements, duration, stacking, conditions, cooldowns, charges, reactions, Mana, equipment use, preview/log semantics, and named-handler boundary; reject arbitrary executable content |
| E08-T02 — Three Class trees | Executable Fighter, Ranger, and Mage identity | implement Masteries and 27 Class Techniques through approved physical, ranged, magical, equipment, defense, mobility, and resource capabilities |
| E08-T03 — Three Vocation trees | Executable General, Spy, and Diplomat non-Gambit identity | implement Masteries and 27 Vocation Techniques for army command, World/Settlement/Dungeon interaction, preparation, intelligence, relationship, and resistance hooks; reserve base Gambit resolution for EPIC 09 |
| E08-T04 — General Profession tranche | Warlord, Huntmaster, Warcaster playable | implement their three Signatures and 27 Techniques; integrate command, marks, volley, sigils, formations, and required AI behavior |
| E08-T05 — Spy Profession tranche | Assassin, Stalker, Veilweaver playable | implement their Signatures and 27 Techniques; integrate exposure, concealment, traps, triggers, hexes, and required AI behavior |
| E08-T06 — Diplomat Profession tranche | Champion, Herald, Enchanter playable | implement their Signatures and 27 Techniques; integrate duels, signals, inspiration, oaths, boons, compulsion, wards, and required AI behavior |
| E08-T07 — Required equipment, Mana, spells, and conditions | Only concrete supporting content | add weapons, shields, ranged/mage weapons, armor, personal Mana, consumables, spells, conditions, and item capabilities strictly needed by the implemented trees |
| E08-T08 — Previews, logs, AI, and catalog validation | One mechanical authority from rule to UI | derive skill previews and combat-log explanations; validate every reference and definition; teach AI legal use; prove no faction-specific ability copies or duplicated calculations |
| E08-T09 — Ability-system exit gate | All 150 base definitions work | run per-tree fixtures, invalid-target/resource tests, save/reload, deterministic results, performance, mobile Hero/Combat interaction, documentation, owner acceptance, and checkpoint |

**Epic exit:** Every purchasable MVP ability has one stable identity and one executable authoritative effect.

## 13. EPIC 09 — Diplomacy, intelligence, enemy Heroes, and opposed Gambits

**Purpose:** Implement persistent relationships and the symmetric pre-battle Vocation system, including defending-Hero resistance.

| Task | Outcome | Key subtasks |
|---|---|---|
| E09-T01 — Relationship and Gambit decision packet | Approved minimum social/intelligence rules | decide participants, attitude/trust/obligation scope, Favor/Leverage, Loyalty, Security, access/trade actions, Gambit costs, weights, variance, bands, target eligibility, reset timing, hidden information, Reversal, and AI policy |
| E09-T02 — Relationship and Diplomacy foundation | Campaign consequences outside battle | add participants and durable relationship facts; implement a small set of negotiation, trade/access, preparation, and intelligence actions; make the Diplomacy board meaningful but bounded |
| E09-T03 — Enemy commanding Heroes | Symmetric opposition | define enemy attributes, Class/Vocation, Masteries, equipment, statuses, strategic context, and one commanding Hero per encounter; use ordinary rules rather than difficulty bonuses |
| E09-T04 — Atomic opposed-Gambit core | Persisted no-reroll pre-battle transaction | validate actor/target/resources/eligibility; commit costs; consume encounter-seeded draw; calculate Power, defending-Hero and target Resistance, margin, band, and breakdown; persist outcome and hand off to Combat |
| E09-T05 — General, Spy, and Diplomat modes | Three complete Vocation actions | implement intimidation/ultimatum, sabotage/infiltration, and parley/suborn modes; include attributes, matching counter-Mastery, Resolve/Security/Loyalty, preparation, equipment, immunity, and Reversal effects |
| E09-T06 — Fair enemy use and readable presentation | Explainable player and AI Gambits | implement legal AI selection with no hidden Power/rerolls; preview known immunity and cost; display attacker/defender breakdown and resulting conditions; prevent Hero death or base side-switching |
| E09-T07 — Capability Gate | Integrated Hero/social/encounter systems | test player and enemy initiation, every Vocation, absent defending Hero, resistance development, immunity, failed/Repeated attempts, save/reload, mobile/accessibility, documentation, owner acceptance, and checkpoint |

**Epic exit:** Both sides can initiate all three Gambit families, and defensive Hero development materially and transparently changes resistance.

## 14. EPIC 10 — Tier 2 Civilizational Evolution

**Purpose:** Implement the first permanent faction-wide choice and prove compositional branch adaptation.

| Task | Outcome | Key subtasks |
|---|---|---|
| E10-T01 — Tier 2 decision packet | Approved Republic/Empire gate and effects | decide prerequisites, project duration/cost, deed, Iron/Gold access, branch strengths/costs/counters, formations, contract/administration behavior, roster/building scope, and balance cases |
| E10-T02 — Tier 2 economy and content foundation | Legal new resources and institutions | activate Iron and Gold; add fixed-deposit Mines, required processing/economic/recruitment buildings, projects, sinks, requirements, and stable content references |
| E10-T03 — Republic package | Distinct decentralized strategic/tactical play | implement contracts, Gold dependence, professional quality, mobility/autonomy, civic institutions, bounded roster and support content, and applicable AI/Diplomacy priorities |
| E10-T04 — Empire package | Distinct centralized strategic/tactical play | implement standardized cost/scale, command and capped formation Cohesion, administration/supply pressure, bounded roster and support content, and applicable AI/Diplomacy priorities |
| E10-T05 — Atomic Civilizational Evolution | Safe permanent campaign choice | preview both branches and counters; validate capital/infrastructure/resources/deed; consume once; persist choice; derive Republic Town or Imperial Prefecture; unlock legal content; reject repeat/reversal |
| E10-T06 — Civilizational riders | One shared baseline plus branch adapters | adapt economy, recruitment, squads, abilities, Gambits, Diplomacy, presentation, and AI only through compatible typed packages; preserve base IDs and purposes |
| E10-T07 — Branch balance and exit | Two viable, counterable paths | test equal headcount and equal economic value, formation disruption, contract/Gold pressure, migration/reload, evolution atomicity, ancestry UI, mobile decision preview, documentation, owner acceptance, and checkpoint |

**Epic exit:** The same Tier 1 campaign can become Republic or Empire with recognizable strengths, costs, and counterplay but no duplicated baseline game.

## 15. EPIC 11 — Tier 3 Technological Evolution

**Purpose:** Add Mana Crystals and compose Industry/Magic with both Tier 2 branches.

| Task | Outcome | Key subtasks |
|---|---|---|
| E11-T01 — Tier 3 decision packet | Approved gate, Mana economy, and path effects | decide prerequisites, cost/duration/deed, Mana sites/yields/sinks, Industry maintenance/repair, Magic channeling/disruption, facilities, signature content, riders, counters, and balance cases |
| E11-T02 — Mana Crystal economy | Shared strategic energy source | add reachable sites, extraction, processing, stockpile behavior, project/recruitment/ability sinks, previews, shortage behavior, and non-circular Tier 2→3 progression |
| E11-T03 — Industry package | Machinery-centered path | implement facilities, equipment, devices, durable production, maintenance, repair, penetration/delivery hooks, bounded units/content, and AI/Diplomacy priorities |
| E11-T04 — Magic package | Direct-Mana path | implement academies, wards, spells, rituals, summons only where approved, channeling/disruption hooks, bounded units/content, and AI/Diplomacy priorities |
| E11-T05 — Atomic Technological Evolution | Four legal Tier 3 identities | preview/validate/consume/persist once; derive Clockwork Republic, Mystic Republic, Steel Empire, or Arcane Empire; preserve Civilizational ancestry and unlock legal content |
| E11-T06 — Technological riders | Composed delivery/resource adaptations | apply compatible Industry/Magic riders to buildings, armies, abilities, Gambits, Diplomacy, presentation, and AI without prohibiting the other discipline or copying content |
| E11-T07 — Four-path exit gate | Verified orthogonal composition | test all Republic/Empire × Industry/Magic fixtures, resource reachability, non-circular gates, maintenance/disruption counters, save/reload, ancestry UI, mobile, documentation, owner acceptance, and checkpoint |

**Epic exit:** All four Tier 3 identities share foundations while producing materially different Mana, infrastructure, army, and ability play.

## 16. EPIC 12 — Tier 4 Spiritual Evolution and terminal identities

**Purpose:** Complete the Castle evolution graph through Holy/Unholy packages and eight narrow terminal capstones.

| Task | Outcome | Key subtasks |
|---|---|---|
| E12-T01 — Tier 4 decision packet | Approved spiritual gates and capstone contracts | decide prerequisites, costs/durations/deeds, Holy/Unholy systemic costs, each capstone formula/input/counter, signature content amount, political consequences, victory hooks, and eight-path balance cases |
| E12-T02 — Holy and Unholy packages | Shared metaphysical adaptation | implement sanctioned covenant/rigidity/restoration/Resolve patterns and taboo/transformation/instability/externality patterns; avoid good/evil damage colors and duplicated content |
| E12-T03 — Hallowed and Blight Republic capstones | First Republic pair | implement Civic Oaths and Grand Transmutation with one meaningful dependency/counter and small signature packages; integrate economy, abilities, armies, Gambits, Diplomacy, AI, and presentation |
| E12-T04 — Celestial and Nosferatu Republic capstones | Second Republic pair | implement Communal Channeling and Blood Senate with network/house/blood dependencies and small signature packages; retain common Durability and relationship contracts |
| E12-T05 — Gold and Hellforged Empire capstones | First Empire pair | implement Sacred Standardization and Soul Furnace with doctrinal/input/pollution/corruption costs and small signature packages; prevent free or circular conversion |
| E12-T06 — Radiant and Bone Empire capstones | Second Empire pair | implement Purity Doctrine and Necrologistics with roster/restriction/Mana/remains/anti-magic counterplay; present alternative Durability through the common contract |
| E12-T07 — Atomic Spiritual Evolution and ancestry | Permanent Tier 4 identity | preview both spiritual paths and resulting terminal identity; validate/consume/persist once; derive Metropolis or Imperial Capital; display complete Castle → civic → technology → spiritual → terminal ancestry |
| E12-T08 — Spiritual riders and named exceptions | Small compositional rule surface | apply compatible Holy/Unholy riders; use named validated terminal handlers only for genuinely unique mechanics; preserve all base content IDs and recognizable purposes |
| E12-T09 — Eight-path integration and balance | Every combination interoperates | run eight fixture campaigns through economy, army, ability, Gambit, Diplomacy, AI, Durability, counters, save/reload, and endgame hooks; audit duplication and dead ends |
| E12-T10 — Milestone C exit gate | Evolution-complete Castle campaign | complete mobile previews, accessibility, performance, documentation, owner acceptance, non-deployed checkpoint, and proof that Tier 4 is not automatic victory |

**Epic exit:** Every evolution combination reaches a distinct, counterable terminal identity through shared systems rather than eight copied games.

## 17. EPIC 13 — Integrated campaign, territory, and endings

**Purpose:** Assemble enough World opposition and campaign goals to progress from Setup through Tier 4 to victory or defeat.

| Task | Outcome | Key subtasks |
|---|---|---|
| E13-T01 — Territory and ending decision packet | Approved compact full-campaign rules | decide World size/content profile, contest/control transfer/loss, hostile access, supply disruption, strategic threat cadence, Dominion/Conquest/Ascension thresholds, sovereign death, and Tier 4 endgame relationship |
| E13-T02 — Compact deterministic campaign World | Sufficient progression opportunities | assemble reachable Food/Wood/Stone/Iron/Gold/Mana, regional Dungeons, threats, deeds, relationship participants, and branch-neutral routes needed for Tier 1–4 without building a huge simulation |
| E13-T03 — Region conflict and control consequences | Territory can change hands | implement contest, capture, loss, reclamation, Road/improvement suspension, reconnection, supply effects, location access, rewards, and explicit validated transitions |
| E13-T04 — Bounded strategic opposition | Campaign pressure without full sovereign AI | implement deterministic threat movement/priority/encounter behavior using legal rules; integrate enemy Heroes and terminal-faction priorities only as required |
| E13-T05 — Victory, defeat, and campaign summary | Executable endings | implement minimum Dominion, Conquest, and Ascension routes; sovereign-death defeat; Tier 4 hooks without automatic victory; end summary, branch ancestry, and safe continue/restart policy |
| E13-T06 — Full-campaign fixtures | Proof of complete routes | run representative Republic/Empire, Industry/Magic, and Holy/Unholy campaigns plus all eight terminal fixtures using accelerated deterministic setup where needed |
| E13-T07 — Economy/exploit/dead-end audit | No blocked or infinite campaign path | test resource reachability, sinks, project/gate loops, army/upkeep pressure, Gambit rerolls, evolution duplication, territory loss/recovery, victory timing, and deterministic replay |
| E13-T08 — Full Campaign Gate | Accepted complete campaign | reconcile cross-board UI, mobile/accessibility, persistence, documentation, owner playthrough evidence, and matching non-deployed checkpoint |

**Epic exit:** A campaign reaches any Tier 4 identity and resolves an approved victory or defeat path without developer intervention.

## 18. EPIC 14 — MVP hardening, balance, accessibility, and release candidate

**Purpose:** Convert the complete feature set into a stable, comprehensible mobile-first MVP Candidate.

| Task | Outcome | Key subtasks |
|---|---|---|
| E14-T01 — Content completeness and naming audit | Coherent bounded Castle catalog | verify every required resource, building, unit, ability, Gambit, evolution package, capstone, location, relationship, and ending; remove placeholders; complete accepted setting-language pass without changing stable IDs |
| E14-T02 — Onboarding and mobile UX | Understandable first campaign | refine Setup, board navigation, context, previews, confirmations, errors, logs, empty/locked states, touch targets, safe areas, interruption recovery, portrait information density, and desktop responsiveness |
| E14-T03 — Accessibility and inclusive interaction | Verified non-pointer and reduced-motion use | audit headings/landmarks/names, focus, keyboard, contrast, non-color signals, screen-reader order, motion, modal behavior, Combat/World alternatives, and physical touch usability |
| E14-T04 — Persistence and recovery hardening | Valuable campaigns fail safely | test every migration class, malformed input, quota/write failure, partial recovery, reload during legal states, deterministic replay, long campaign, save size, and no destructive fallback |
| E14-T05 — Performance and device hardening | Smooth bounded browser play | profile World and Combat rendering, selectors, state size, logs, content indexes, low-power phone behavior, memory, input latency, and build artifact; optimize only measured bottlenecks |
| E14-T06 — Balance and pacing pass | Viable choices and deliberate sinks | tune progression cadence, resources, projects, army/reinforcement/upkeep, tactical curves, abilities, resistance, evolution gates, capstones, counterplay, and ending timing through recorded fixtures |
| E14-T07 — Automated campaign-spine coverage | Repeatable release evidence | add appropriate pure, integration, rendered, and end-to-end checks; preserve normal npm run verify; validate deterministic fixtures and source dependency contracts |
| E14-T08 — Manual acceptance matrix | Owner-visible device proof | execute desktop and portrait phone flows, touch/keyboard, dark/light/system, reduced motion, save/reload/recovery, representative branches, all eight terminal identities, victory/defeat, and physical-smartphone QA |
| E14-T09 — MVP Candidate exit gate | Accepted, documented, non-deployed checkpoint | refresh CURRENT_STATE and responsible contracts; close/retain TBDs honestly; review full diff; obtain owner acceptance; commit/push exact source; save matching Sites version; report MVP Candidate and keep deployment separate |

**Epic exit:** Automated and manual acceptance gates pass, no serious persistence/accessibility defect remains, and the owner accepts the non-deployed MVP Candidate.

## 19. Cross-cutting acceptance matrix

Every task applies only the relevant rows, but no Epic may close while an affected requirement is unverified.

| Concern | Required evidence |
|---|---|
| State | one authority, stored/derived/static classification, valid transitions, migration/default behavior |
| Determinism | explicit seeds/state, reproducible fixtures, no UI or platform randomness in domain rules |
| Content | stable IDs, catalog validation, no duplicated labels/calculations/evolution copies |
| Persistence | round trip, old-save policy, malformed/failure path, no destructive fallback |
| Cross-board | source action and persistent consequences visible on every affected board |
| Mobile | portrait hierarchy, 44-pixel-class touch targets where applicable, safe areas, interruption recovery |
| Accessibility | names, focus, keyboard, contrast, non-color state, reduced motion, readable previews/logs |
| AI | same legal rules and information, deterministic testability, no hidden statistical bonuses |
| Performance | measured state/render/build impact proportional to the task |
| Documentation | responsible contracts updated; CURRENT_STATE only from new evidence; ROADMAP names one next task |
| Workflow | candidate review, owner acceptance, pushed source, matching saved Sites version, no deployment |

## 20. Primary risks and controls

| Risk | Why it matters | Control |
|---|---|---|
| Premature mega-schema | later rules would be locked into empty or misleading save fields | EPIC 03 stores only the opening foundation; later Epics add state with implemented mechanics |
| Silent legacy corruption | current migration can replace invalid data and storage failures are hidden | E03 decision gate, strict decoding, typed errors, retained source, idempotent migration fixtures |
| Eightfold content duplication | faction leaves could multiply abilities, rosters, and economies | stable base definitions plus civic, technological, spiritual, and narrow capstone packages |
| Isolated boards | scaffolds may look complete without campaign consequences | every Epic exit requires an end-to-end cross-board proof |
| Balance before rules stabilize | early tuning would be repeatedly invalidated | use explicit test defaults, then tune within each branch and again in EPIC 14 |
| Ability-system overreach | 150 skills could trigger a generic effect engine | introduce only concrete typed capabilities required by approved ability tranches |
| Mobile density | World, Combat, Hero trees, and evolution previews can overwhelm portrait screens | progressive disclosure, short previews, shared sheets, touch/keyboard/a11y checks in each affected Epic |
| AI scope explosion | full rival strategy could dominate MVP work | bounded encounter and strategic threat behavior; full sovereign simulation remains post-MVP |
| False completion | feature breadth can hide broken save, migration, or inaccessible flows | milestone gates, deterministic fixtures, full-campaign tests, owner physical-device acceptance |

## 21. Completed transition tasks and exact current task

The first task under this plan was:

### E03-T01 — Audit Concept 2.0 lifecycle, save, and opening-flow transition

Status: **Complete**

**Goal:** Produce the approved lifecycle, state-ownership, version-5 candidate, migration, opening-flow, and bounded EPIC 03 implementation contract without changing runtime behavior.

**Required outputs:**

- current New/Continue/replace/delete/hydrate/autosave/manual Save/return map;
- complete v4 field and transition classification;
- Castle, Dungeon, v2/v3, invalid, and partial-save migration matrix;
- clean-break, conversion, and legacy-mode alternatives with trade-offs;
- minimum new-opening stored/derived/static categories;
- World snapshot/generator authority recommendation;
- explicit decision list and recommended MVP defaults;
- E03-T02–T08 bounded task definitions and Epic exit criteria;
- affected-file and non-goal boundary.

**Non-goals:**

- no source-code behavior change;
- no save-version cutover;
- no World/economy/combat schema;
- no database, dependency, Worker, hosting, cloud, authentication, multiplayer, or deployment change.

**Acceptance criteria:**

- every current version-4 field has an explicit disposition or owner-decision marker;
- no Dungeon-faction campaign can be silently converted into Castle;
- old day, treasury, and settlementClaimed meanings are not silently reinterpreted;
- state categories cover the Village-first opening without speculative later mechanics;
- persistence failure cannot be mistaken for a successful save in the approved contract;
- all owner choices required before E03-T02 are explicit;
- exactly one next task is named after acceptance.

Documentation-only verification is sufficient for E03-T01: inspect repository evidence, links, status labels, decision coverage, task bounds, and the complete diff. No application build is required unless the task separately changes code.

E03-T01 through E03-T07 are complete and owner-accepted. Their records and `ROADMAP.md` provide the authoritative checkpoint history.

### Exact current task

**E03-T08 — Compatibility and EPIC 03 exit gate** is the sole current task. It audits the combined migration, persistence, determinism, Setup, navigation, presentation, documentation, and manual-acceptance evidence without adding gameplay. EPIC 03 remains Current until the owner explicitly accepts the exit Candidate and the workflow checkpoint completes.

## 22. Acceptance and activation

On 2026-08-14, the project owner accepted:

1. the EPIC 03–14 sequence and milestone placement;
2. the included and cut MVP scope;
3. the supersession of the former unstarted EPIC 03–24 sequence;
4. DMCL-P26 as the compact decision-log record;
5. E03-T01 as the sole next task;
6. campaign version 5 as the next campaign-schema number, recorded after E03-T01 as DMCL-P40.

Acceptance activated the plan and EPIC 03. It does not pre-approve gameplay numbers or later decision gates. Owner-accepted E03-T01–T07 work leads to E03-T08 as the sole current task; no task or checkpoint authorizes deployment.
