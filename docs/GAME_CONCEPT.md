# Dungeon Master & Castle Lords — Game Concept

Status: canonical source of truth for the approved game concept

Version: 2.0

Scope: product vision and approved gameplay-system shape, not executable content, balance data, state schema, or implementation evidence

Last updated: 2026-08-14

## 1. Authority and approval boundary

This document is the single source of truth for the approved game concept. Development plans, content definitions, rules, and interface work must be consistent with it.

Material stated as an approved rule is binding until it is explicitly superseded. Exact numbers, examples, working names, and matters marked **TBD** are not binding gameplay rules. Implementation does not approve a mechanic by itself.

For other kinds of truth:

- [DECISIONS.md](./DECISIONS.md) records accepted decisions, supersession, and deferred decisions.
- [CURRENT_STATE.md](./CURRENT_STATE.md) records what the current prototype actually implements.
- [ARCHITECTURE.md](./ARCHITECTURE.md), [GAME_STATE.md](./GAME_STATE.md), and [CONTENT_MODEL.md](./CONTENT_MODEL.md) govern technical structure, state ownership, and reusable content.
- [ROADMAP.md](./ROADMAP.md) governs development sequence.

When these differ, this document governs intended game design; the current-state and technical documents govern their own responsibilities. No design statement here claims that its system is already implemented.

This version supersedes the former Castle/Humanoid/Light and Dungeon/Monster/Dark racial ladder recorded by historical decision `DMCL-014`, and the approximately twelve-level prestige direction recorded by historical decision `DMCL-015`. Their history remains in the decision log.

## 2. Product vision

**Dungeon Master & Castle Lords** is a mobile-first, portrait-first browser strategy game combining:

- settlement and territory management;
- world exploration and conquest;
- dungeon and building exploration;
- Hero, army, and faction progression;
- diplomacy and intelligence;
- squad-scale tactical board-game combat.

The game is a playground for testing interconnected systems. Clear rules, readable consequences, modular content, and fast iteration are more important than production-scale content or graphics.

One authoritative campaign connects every gameplay surface. A road built on the World board can activate a Quarry for the Settlement; a Dungeon can reveal a resource or threat; a Gambit can alter a tactical encounter; casualties can change upkeep and Diplomacy; an evolution choice can reshape buildings, troops, skills, and presentation without replacing their shared foundations.

## 3. Design pillars

- **Connected consequences.** Management, exploration, diplomacy, and combat change the same campaign.
- **Meaningful evolution.** Each faction choice grants a distinct strength, creates a dependency or counter, and changes how existing systems are used.
- **Compositional depth.** Shared foundations plus small rule packages create variety without copying whole rosters or skill trees.
- **Readable board play.** Each activity has a focused board, while shared truth remains consistent.
- **Deterministic authority.** Campaign-changing rules and randomness are reproducible and persist their outcomes.
- **Finite economies.** Resources have deliberate sources, constraints, and sinks rather than only accumulating.
- **Mobile clarity.** Important choices, previews, and consequences must remain understandable on a portrait phone.
- **Prototype discipline.** Build the smallest coherent vertical slice, test it, and deepen only proven mechanics.

## 4. Canonical terms

These progressions are related but are not interchangeable:

| Term | Meaning |
|---|---|
| **Root faction** | The stable campaign family, such as `castle`. |
| **Faction evolution** | A durable, faction-wide choice made when the capital reaches an evolution gate. |
| **Terminal faction identity** | The derived combination of all Castle evolution choices; it is not a second independently mutable choice. |
| **Settlement tier** | The local development stage of one settlement, from Tier 1 to Tier 4. |
| **Building rank** | The upgrade state of one building family. |
| **Unit tier** | A content and power band for a squad definition. |
| **Hero level** | The Hero’s personal progression from Level 1 to Level 20. |
| **Skill rank** | Rank I–IV of a Mastery or Signature. |
| **Technique tier** | The prerequisite depth of a one-purchase branch technique. |

Use qualified terms such as **Settlement Tier 2**, **Hero Level 10**, and **Mastery Rank II**. Avoid an unqualified “level” when several meanings are possible.

The capital triggers Castle faction evolution. Secondary settlements inherit all faction choices but keep their own Settlement Tier, buildings, projects, and local state.

## 5. The connected campaign loops

### 5.1 Strategic and management loop

```text
Village and starting territory
→ control and connect regions
→ produce, construct, recruit, and supply
→ meet locations, factions, and enemy armies
→ explore, negotiate, use a Gambit, or fight
→ persist resources, casualties, relationships, territory, and Hero progress
→ satisfy the next Settlement and faction-evolution gate
```

Strategic time advances in **Days**. The Hero uses a bounded strategic travel allowance, called **Travel**, while roads, terrain, control, and supply make geography consequential.

### 5.2 Exploration loop

The Hero enters persistent square-grid Dungeons and buildings located in World regions. Exploration reveals rooms, threats, objectives, rewards, and information. Results remain part of the campaign instead of resetting when the board closes.

### 5.3 Tactical combat loop

Eligible encounters move campaign Heroes and squads to a dedicated hex-grid Combat board. An optional initiating Gambit may modify the starting conditions. Combat returns persistent casualties, injuries, rewards, relationships, territory, and location outcomes.

### 5.4 Diplomacy and intelligence loop

Relationships, leverage, loyalty, security, and knowledge affect region access, trade, Gambits, surrender, alliances, and enemy behavior. Diplomacy and intelligence are campaign systems, not only combat status effects.

## 6. MVP scope and campaign opening

### 6.1 Playable scope

The **Castle Faction** is the sole playable faction family required for the MVP. The stable `dungeon` identity is retained for compatibility and future design, but a playable Dungeon Faction is not an MVP requirement.

Future goblinoid, nomadic, Dungeon, insectoid, undead, or other factions may have different economies and evolution graphs. They do not have to begin with a Village or reuse Republic/Empire, Industry/Magic, or Holy/Unholy.

### 6.2 Village-first opening

After Hero Setup, a Castle campaign begins with:

- one Tier 1 capital **Village** in its home region;
- the six adjacent regions forming a controlled first ring;
- at least one Food site, one Wood site, and one Stone site within that ring;
- deterministic placement guarantees that make Iron, Gold, and Mana Crystals reachable before their first mandatory gate;
- exactly one introductory regional Dungeon location, one inert discoverable ruin location, and one terrain-only region in the remaining three first-ring regions.

All six neighbors begin controlled. EPIC 03 assigns no yield, reward, threat, encounter, travel, or control-change behavior to these opening contents.

The current prototype’s Dungeon-first flow and Dungeon Heart settlement claim are superseded product behavior. In the target concept, a Dungeon Heart may claim, transform, or resolve a regional Dungeon, but it does not create the starting Village.

## 7. Castle faction and Settlement evolution

### 7.1 Evolution tree

The Castle Faction begins from a common settled-humanoid foundation and makes three permanent, orthogonal choices.

| Settlement tier | Capital form | Evolution decision | Branches |
|---|---|---|---|
| **Tier 1** | Village | Castle baseline | No branch yet |
| **Tier 2** | Republic Town or Imperial Prefecture | **Civilizational Evolution** | Republic or Empire |
| **Tier 3** | Republic City or Imperial Colonia | **Technological Evolution** | Industry or Magic |
| **Tier 4** | Republic Metropolis or Imperial Capital | **Spiritual Evolution** | Holy or Unholy |

The choices are orthogonal:

- Civilizational Evolution determines how sovereignty, labor, military obligation, and initiative are organized.
- Technological Evolution determines the dominant way materials and Mana are converted into power.
- Spiritual Evolution determines the civilization’s relationship with metaphysical law and taboo.

Later choices transform earlier choices rather than replacing them. In the MVP, a confirmed choice is irreversible. A rare reversal mechanic, if ever desired, requires a separate approved design.

### 7.2 Evolution transaction

Each evolution is one explicit project and one atomic campaign transition:

1. preview both branches, including benefits, dependencies, and known counters;
2. validate the capital’s tier, required buildings, connected sites, resources, and cross-loop objective;
3. confirm the branch;
4. consume the project resources exactly once;
5. persist the faction-wide choice and capital result;
6. derive newly legal content and consequences.

If validation fails, the campaign remains unchanged. Reopening or reloading cannot consume resources twice or change the recorded choice.

The capital’s Tier 2, Tier 3, and Tier 4 evolution gates require infrastructure and resources. Tier 3 and Tier 4 also require a cross-loop deed, discovery, relationship, or location objective so evolution is not only a payment button. Exact costs, durations, and deeds are TBD.

### 7.3 Civilizational Evolution: Republic or Empire

#### Republic

Republic means **distributed sovereignty**, not necessarily universal democracy. Contracts, guilds, civic orders, local councils, autonomous institutions, and rival houses may share power.

Republic gameplay favors:

- expensive, well-equipped professional or mercenary squads;
- mobility and reliable action away from tight formations;
- independent initiative and flexible local institutions;
- trade, contracts, guilds, and plural sources of authority.

Its costs and counters include:

- greater Gold dependence for recruitment, contracts, and upkeep;
- smaller forces at the same resource budget;
- political obligations and competing interests;
- vulnerability when contracts, markets, or legitimacy collapse.

Republican quality must be tested both at equal headcount and at equal economic value. “Better one-for-one” does not mean “always better for the same cost.”

#### Empire

Empire means **centralized sovereignty**, standardized production, hierarchy, levies, administration, and formation doctrine.

Empire gameplay favors:

- lower-cost standardized squads and larger forces;
- commands and capped Cohesion benefits in valid formations;
- centralized projects, logistics, and mass production;
- predictable combined-arms coordination.

Its costs and counters include:

- Food, manpower, administration, command, and supply pressure;
- reduced effectiveness when isolated, flanked, disrupted, or out of command;
- less flexible local institutions and roster choices;
- systemic consequences when centralized infrastructure fails.

Formation benefits use named conditions and bounded caps. They never scale without limit from every adjacent ally.

### 7.4 Technological Evolution: Industry or Magic

#### Industry

Industry processes Mana Crystals as fuel, charge, or controlled energy for workshops, foundries, engines, equipment, infrastructure, and weapons.

Industry gameplay favors predictable production, durable equipment, fortification, repairable machinery, and scale. It depends on facilities, maintenance, spare materials, logistics, and repair capacity. Industrial factions may retain limited magic; the choice establishes dominance, not prohibition.

#### Magic

Magic channels Mana more directly through spells, rituals, wards, summons, enchantments, and terrain manipulation.

Magic gameplay favors flexibility, specialist effects, battlefield shaping, and concentrated situational power. It depends on Mana availability, trained specialists, channeling conditions, and protection from disruption or anti-magic. Magical factions still construct ordinary infrastructure.

Both paths use the same strategic **Mana Crystals** commodity. Personal Hero **Mana** is a separate combat resource.

### 7.5 Spiritual Evolution: Holy or Unholy

#### Holy

Holy means power sanctioned and constrained by an acknowledged cosmic order, covenant, or doctrine. It may produce wards, restoration, reliability, morale, purification, and obedience. Its price may be rigidity, intolerance, mandatory obligations, restricted methods, or punishment for doctrinal deviation.

#### Unholy

Unholy means power gained by violating, repurposing, or transcending accepted metaphysical boundaries. It may enable mutation, sacrifice, draining, alchemy, undeath, or forbidden transformation. Its price may be instability, pollution, population costs, hostile reactions, dependence on scarce inputs, or exploitable vulnerabilities.

Holy and Unholy are not direct synonyms for good and evil. Both must offer comprehensible motives and benefits, and both must impose credible ethical or systemic costs.

### 7.6 Tier 3 combined identities

| Combination | Working identity and capital form | Gameplay direction |
|---|---|---|
| Republic + Industry | **Clockwork Republic**, Industrial Republic City | Contracted engineering, mobile devices, guild production, modular equipment |
| Republic + Magic | **Mystic Republic**, Magic Republic City | Distributed colleges, shared ritual rights, autonomous magical specialists |
| Empire + Industry | **Steel Empire**, Industrial Imperial Colonia | Standardized machinery, mass production, disciplined logistical formations |
| Empire + Magic | **Arcane Empire**, Magic Imperial Colonia | Centralized academies, regimented spell doctrine, imperial Mana infrastructure |

These are recognizable combinations of shared branch packages, not four separately duplicated factions.

### 7.7 Tier 4 terminal identities

Each terminal identity receives one major capstone rule transformation, one associated cost/counter, and a small signature-content package. It does not replace the shared economy, roster, Hero system, or Settlement board.

#### Republican terminal identities

| Evolution combination | Terminal identity | Signature rule direction | Dependency or counter |
|---|---|---|---|
| Republic + Industry + Holy | **Hallowed Republic** | **Civic Oaths:** diverse guilds, engineers, civic orders, and knightly societies build communal readiness through fulfilled obligations. | Consensus, oath obligations, and institutional diversity must be maintained. |
| Republic + Industry + Unholy | **Blight Republic** | **Grand Transmutation:** regulated alchemy converts constrained inputs and produces afflictions, rare materials, or Gold. | Requires Mana, reagents, time, and creates waste, disease, pollution, or social cost; no free Iron-to-Gold arbitrage. |
| Republic + Magic + Holy | **Celestial Republic** | **Communal Channeling:** citizens and squads pool, relay, or distribute sanctioned magical power through a civic network. | Isolated units and broken network nodes are vulnerable; collective authority can be slow or contested. |
| Republic + Magic + Unholy | **Nosferatu Republic** | **Blood Senate:** immortal houses share sovereignty and field exceptional agents through a regulated blood-and-subject economy. | Rival houses, subject obligations, blood access, and oligarchic legitimacy create internal pressure. |

#### Imperial terminal identities

| Evolution combination | Terminal identity | Signature rule direction | Dependency or counter |
|---|---|---|---|
| Empire + Industry + Holy | **Gold Empire** | **Sacred Standardization:** blessed mass production rewards approved, repeated patterns and integrates relics into machinery and weapons. | Rigid templates, doctrinal inspection, and “mechanical heresy” constrain improvisation. |
| Empire + Industry + Unholy | **Hellforged Empire** | **Soul Furnace:** industrial machinery converts condemned essence, captives, or casualties into power without requiring a generic demon roster. | Pollution, corruption, diplomacy costs, and dangerous dependence on soul inputs. |
| Empire + Magic + Holy | **Radiant Empire** | **Purity Doctrine:** disciplined light, inquisition, and crusade gain exceptional power against explicitly marked corruption. | Narrow doctrine, roster restrictions, internal purges, and vulnerability to misclassification or inflexibility. |
| Empire + Magic + Unholy | **Bone Empire** | **Necrologistics:** Mana and remains replace ordinary living recruitment and upkeep patterns; undead march without Food. | Heavy Mana/remains demand, anti-magic, binding disruption, and supply still matter. Undead use finite Integrity or Soul Cohesion through the common Durability contract. |

“Gold” as a commodity and **Gold Empire** as a proper identity must be visually and linguistically distinct in the interface. The terminal names are accepted working names; a later setting-language pass may propose changes but cannot silently rename their stable identities.

### 7.8 Evolution adapters across systems

Faction evolution is applied compositionally:

```text
Castle baseline
→ Civilizational package
→ Technological package
→ Spiritual package
→ narrow terminal capstone
```

Each axis has a defined responsibility:

| Axis | May primarily modify | Must not become |
|---|---|---|
| Republic / Empire | governance, contracts/administration, squad autonomy/formation, recruitment and command patterns | a complete duplicate roster |
| Industry / Magic | delivery method, facilities, equipment, Mana use, repair/ritual requirements | an absolute ban on the other discipline |
| Holy / Unholy | metaphysical cost, status riders, sanctioned/taboo methods, relationships | a simple good/evil damage color |
| Terminal capstone | one faction-wide rule transformation plus limited signature content | eight separately maintained games |

## 8. World, regions, routes, and supply

### 8.1 World regions

The World is a persistent hex grid. A region may contain:

- terrain and travel properties;
- a resource site;
- one or more explorable locations, including Dungeons or ruins;
- a settlement, army, threat, event, or relationship consequence.

A resource site and a Dungeon may coexist in the same region. They are contents of a region, not mutually exclusive region types.

### 8.2 Control, connection, and supply

- **Controlled** means the faction governs the region and receives its permitted base contribution.
- **Connected** means a continuous constructed route links the region to the capital through controlled regions.
- **Supplied** means the route and source satisfy the requirements of the force, improvement, project, or settlement using them.

A controlled resource site provides its base yield at strategic production resolution. A controlled and connected site may receive a matching exterior improvement, which provides its bonus only while both control and connection remain valid.

Losing control or connection suspends an exterior improvement; it does not automatically destroy it. Reconnection can reactivate it after validation.

### 8.3 Roads

A Road is an edge connection between adjacent regions, not a building occupying a region. Later route ranks may include Paved Roads or branch-specific equivalents. Route cost, construction time, capacity, maintenance, sabotage, and alternate transport are TBD.

### 8.4 Strategic supply

The MVP begins with one connected-network model and no separate “Supply” commodity. A valid supply path enables improved production, exterior construction, reinforcement, and full military readiness.

Disconnected forces or holdings may face restricted reinforcement, reduced readiness, attrition, inactive improvements, or other approved consequences. Exact penalties, hubs, siege behavior, and path capacity are TBD.

### 8.5 Regional Dungeons

Dungeons are persistent regional sites. A discovered Dungeon may be entered when its access conditions permit; control is not automatically the same as access. The final rules for raids into uncontrolled or hostile regions, interception risk, and how Dungeon outcomes affect control are TBD.

The intended direction is that exploration can help create conquest opportunities instead of always occurring only after conquest.

## 9. Commodities and strategic economy

### 9.1 Commodity set

| Unlock tier | Commodity | Principal roles |
|---|---|---|
| Tier 1 | **Food** | organic recruitment, living upkeep, recovery, population support |
| Tier 1 | **Wood** | routes, light construction, ranged equipment, basic projects |
| Tier 1 | **Stone** | permanent buildings, fortifications, infrastructure |
| Tier 2 | **Iron** | advanced weapons, armor, machinery, reinforcement and repair |
| Tier 2 | **Gold** | contracts, trade, administration, elite recruitment, influence |
| Tier 3 | **Mana Crystals** | industrial energy, direct magic, advanced projects, terminal capstones |

Gold represents strategic monetary and precious-metal wealth. It may come from deposits, trade, taxation, contracts, or approved conversion; a Mine follows its fixed deposit and cannot freely switch between Iron and Gold.

### 9.2 Non-circular progression

An evolution cannot require a resource that the same evolution first makes obtainable:

- Tier 1 → Tier 2 uses Tier 1 resources and unlocks reliable Iron and Gold extraction.
- Tier 2 → Tier 3 uses previously available resources and unlocks Mana extraction and processing.
- Tier 3 → Tier 4 may consume Mana Crystals and branch-specific inputs.

The world generator must make the next tier’s required sources reachable before they become mandatory.

### 9.3 Stockpile and resource sinks

The MVP uses one faction/capital stockpile. Local warehouses, convoys, storage caps, spoilage, and throughput may be added only when a concrete mechanic requires them.

Initial sinks are:

- construction and route projects;
- Settlement evolution;
- squad recruitment and reinforcement;
- equipment refitting and repair;
- recurring army and building upkeep;
- trade, contracts, administration, and approved conversion;
- Mana-powered abilities, rituals, machines, and capstones where defined.

Recruitment cost, upkeep, and reinforcement cost are distinct. Content must not use the word “cost” without identifying which one it means.

### 9.4 Strategic Day resolution

The campaign resolves deterministic strategic production in this order:

1. determine controlled, connected, and active sites;
2. calculate gross production;
3. pay building and army upkeep;
4. advance construction, recruitment, and evolution projects;
5. apply approved shortage consequences;
6. persist and present a readable Day summary.

Exact yields, durations, payment timing, parallel capacity, shortage priority, and penalties are TBD. Repeated interface actions cannot produce resources or advance projects without the authoritative Day process.

## 10. Settlement development

### 10.1 Interior and exterior development

- **Interior buildings** belong to a settlement and provide recruitment, processing, civic, economic, defensive, or project capabilities.
- **Exterior improvements** occupy eligible resource sites in controlled, connected regions.
- **Routes** connect adjacent regions and are separate from both building categories.

Buildings are reusable families with ranks or branch variants. A new proper name is justified when behavior or faction identity genuinely changes, not merely because the Settlement Tier increased.

### 10.2 Tier 1 Village foundation

| Element | Initial responsibility |
|---|---|
| Village core | Exists at campaign start; recruits Militia and hosts the first project queue. |
| Shooting Range | Recruits Slingers, the initial ranged squad. |
| Healer’s Cabin / Infirmary | Recruits Healer support squads and later supports recovery. |
| Workshop | Enables the first concrete processing, improvement, repair, or equipment projects; it does not own every future crafting system. |
| Farm | Improves an eligible Food site. |
| Quarry | Improves an eligible Stone site. |
| Lumber Camp | Improves an eligible Wood site. |
| Road | Connects adjacent controlled regions through route edges. |

The Tier 1 → Tier 2 gate requires an operating Farm, Quarry, and Lumber Camp connected to the capital, an interior Workshop, the required Tier 1 resources, and any approved introductory cross-loop objective. Exact quantities and time are TBD.

### 10.3 Tier 2 Civic settlement

Tier 2 unlocks:

- Iron and Gold Mines on matching deposits;
- branch-specific civic, economic, processing, ranged, support, and elite institutions;
- Republican contracts/guilds/markets or Imperial state manufactories/exchanges;
- the first elite squads: Republican Knights and Imperial Praetorians as working identities;
- upgraded routes and basic-resource improvements where approved.

Support institutions at Tier 2 are civic, medical, logistical, or philosophical by default. A mandatory Church/Temple would prematurely choose a spiritual doctrine and is therefore not a universal Tier 2 requirement.

Working roster direction:

| Role | Republic | Empire |
|---|---|---|
| Core melee | Mercenary line infantry / Landsknechts | Legion infantry |
| Core ranged | Mercenary crossbow squads | Legion archers |
| Support | Civic adepts, medics, engineers, or logisticians | Imperial acolytes, orderlies, engineers, or logisticians |
| Elite | Knights | Praetorians |

Names drawn from different real-world cultures are working names pending a deliberate setting-language pass. Their mechanical roles are more authoritative than the labels.

### 10.4 Tier 3 technological settlement

Tier 3 unlocks Mana Crystal extraction/processing and the selected Industry or Magic facility family.

- Industry creates foundries, manufactories, engines, standardized equipment, repair systems, and Mana-powered devices.
- Magic creates academies, circles, ritual spaces, wards, summons, and direct Mana infrastructure.

The exact facility catalog is composed with Republic/Empire rather than copied into four unrelated sets.

### 10.5 Tier 4 spiritual settlement

Tier 4 unlocks the selected terminal identity’s capstone project and small signature package. Reaching Tier 4 is not an automatic victory. It unlocks or strengthens endgame routes, including a possible Ascension route whose exact relationship to Tier 4 remains TBD.

### 10.6 Projects and construction capacity

Construction, recruitment, refitting, and evolution are persisted projects. The MVP begins with one construction/project queue per settlement and a simple refreshed recruitment-capacity rule. Extra queues, population simulation, local labor, and production chains require later approval.

## 11. Squads and armies

### 11.1 Scale and roles

Tactical forces are persistent **squads**, not individual soldiers. Shared roles are:

- core melee;
- core ranged;
- support;
- elite;
- large;
- apex.

“Large” and “apex” are eligibility roles, not promises that every faction receives a giant or supreme being.

### 11.2 Army constraints

Every squad definition or instance participates in:

- one-time recruitment expenditure;
- recurring upkeep;
- reinforcement or replacement cost after casualties;
- recruitment/manpower capacity;
- Hero or army command capacity;
- finite Durability and persistent casualty state;
- Resolve, Cohesion, Loyalty, Security, and other ratings only where their rules require them.

Recruitment capacity and command capacity are limits, not stockpiled commodities. A simple capacity model precedes any full population simulation.

Lower-tier squads remain useful as garrisons, low-cost forces, or refit candidates. Evolution does not delete them or silently transform their instances.

### 11.3 Civic military identity

- Republican squads pay more for quality, mobility, autonomy, and equipment. Their contracts and Gold upkeep are strategic pressure.
- Imperial squads are cheaper and more numerous, with bounded formation and command synergies. Their supply, manpower, and disruption exposure are strategic pressure.

Enemies and monsters use the same core durability, action, damage, morale, and consequence contracts where applicable. Their traits may prototype capabilities for future factions, but enemy content does not automatically become an approved playable faction.

## 12. Hero development

### 12.1 Three-layer identity

- **Class** defines how the Hero personally fights and which equipment they master.
- **Vocation** defines how the Hero affects armies and campaign situations, including the pre-battle Gambit.
- **Profession** is the tactical synthesis of Class × Vocation.
- **Faction evolution** adapts compatible abilities without replacing their stable identities.

### 12.2 Level and point budget

- Maximum Hero Level is **20**.
- Level 1 grants the first two allocated attribute points and the first spendable skill point.
- Levels 2–20 each grant two attribute points and one skill point.
- The full progression therefore grants **40 allocated attribute points** and **20 spendable skill points**.
- Class Mastery I and Vocation Mastery I are granted automatically and do not count as purchased points.
- Definition bonuses, equipment, statuses, and faction effects are separate from allocated points.

XP comes from meaningful strategic, exploration, tactical, diplomatic, intelligence, and management objectives, not only kills. Repeatable no-risk farming must not become the dominant progression path. The XP curve, attribute cap/conversion, respecialization, and catch-up rules are TBD.

### 12.3 Skill-tree grammar

Every Class and Vocation tree contains:

- one **Mastery** with ranks I–IV;
- three thematic branches;
- three one-purchase Techniques in each branch, with Tier I → II → III prerequisites.

Every Profession tree contains:

- one **Signature** with ranks I–IV;
- three thematic branches;
- three one-purchase Techniques in each branch.

A Mastery or Signature is one stable ability definition with ranks, while a Technique is purchased once. Rank upgrades should add options, targeting, efficiency, or interactions before relying on repeated percentage inflation.

### 12.4 Class foundations

| Class | Mastery | Core responsibility |
|---|---|---|
| Fighter | **Close Combat** | higher-tier melee weapons and shields, personal control, guarding, physical pressure |
| Ranger | **Ranged Combat** | higher-tier ranged weapons, aim, positioning, fieldcraft, cover interaction |
| Mage | **Mage Combat** | higher-tier magical implements, spellcasting, Mana use, wards, magical control |

The existing root-plus-three-branch foundation remains recognizable. Exact Techniques and executable effects belong to later bounded content work.

### 12.5 Vocation foundations

| Vocation | Mastery | Campaign identity | Optional initiating Gambit |
|---|---|---|---|
| General | **Tactics** | army command, readiness, training, formation, strategic military pressure | Intimidate / Issue Ultimatum |
| Spy | **Deception** | intelligence, infiltration, sabotage, detection, concealed access | Sabotage / Infiltrate Camp |
| Diplomat | **Diplomacy** | relationships, trade, leverage, loyalty, negotiated access | Parley / Suborn |

### 12.6 Profession unlock

A Profession is unlocked when the Hero has:

- five **purchased** points in the selected Class tree;
- five **purchased** points in the selected Vocation tree;
- both Masteries at Rank II or higher.

The free Rank I Masteries do not count toward the five purchased points. The earliest unlock is Hero Level 10. Unlocking grants Profession Signature I without spending an additional point.

Levels 11–20 then provide ten more spendable points. A focused build can purchase Signature ranks II–IV and seven of nine Profession Techniques, while another build may continue investing in its Class or Vocation. This preserves meaningful choice instead of allowing every ability in one playthrough.

### 12.7 Profession matrix

| Class + Vocation | Profession | Signature | Branch themes |
|---|---|---|---|
| Fighter + General | **Warlord** | **Breakthrough Command:** breach a line and enable a bounded allied advance. | Assault, Guard, Command |
| Ranger + General | **Huntmaster** | **Designate Quarry:** share a mark so coordinated attacks progressively expose a target. | Quarry, Volley, Fieldcraft |
| Mage + General | **Warcaster** | **Arcane Formation:** establish a command sigil with an offensive, defensive, or focus order. | Battle Magic, Sigils, Arcane Logistics |
| Fighter + Spy | **Assassin** | **Exploit Opening:** strike an Exposed or isolated target and gain a bounded disengagement opportunity. | Execution, Evasion, Preparation |
| Ranger + Spy | **Stalker** | **Ghost Hunt:** conceal, track, and prepare a ranged attack that can defeat cover. | Marksmanship, Concealment, Traps |
| Mage + Spy | **Veilweaver** | **Hidden Hex:** place a concealed curse on a unit or hex with a selected trigger. | Hexes, Rituals, Secrets |
| Fighter + Diplomat | **Champion** | **Trial by Combat:** mark a rival and attach morale consequences to the confrontation. | Duel, Inspiration, Oaths |
| Ranger + Diplomat | **Herald** | **Signal Shot:** rally or reposition allies and pressure enemy Resolve through a ranged signal. | Signals, Mediation, Skirmish |
| Mage + Diplomat | **Enchanter** | **Binding Word:** grant an allied boon or attempt a Resolve-tested hostile compulsion. | Boons, Compulsion, Wards |

**Veilweaver** avoids assigning an Unholy identity before Spiritual Evolution. **Herald** replaces the duplicate Warlord label in the original draft.

### 12.8 Attributes

Attributes are bounded ratings and rule inputs, not unbounded universal multipliers.

| Attribute | Canonical responsibilities | Explicit boundary |
|---|---|---|
| **Strength** | melee power, brace/shove, heavy-equipment requirements, modest Health contribution | does not multiply all physical damage and Armor |
| **Agility** | Initiative, Evasion, disengagement, bounded Move thresholds, infiltration and sabotage | does not multiply AP |
| **Perception** | Aim, detection, ambush/trap awareness, exploration sight, counter-sabotage | does not turn accuracy above 100% into critical chance |

#### Magical, social, and command attributes

| Attribute | Canonical responsibilities | Explicit boundary |
|---|---|---|
| **Intellect** | spell power, Mana capacity/efficiency, magical knowledge, security and manipulation resistance | does not multiply all magical damage and Ward |
| **Charisma** | diplomacy, trade, morale pressure, surrender, inspiration, command presence | does not guarantee social success by itself |
| **Leadership** | command range/capacity, order strength, allied morale/readiness, intimidation, bounded training | does not transfer every Hero statistic to all squads |

Derived values include Health, Mana, Physical Power, Spell Power, Armor, Ward, Aim, Evasion, Initiative, Move, Resolve, and Command. Penetration and Critical Chance are separate where required.

Use **Travel** for strategic movement, **Move** for tactical movement, **AP** for actions, and **Mana** in full. Do not use the ambiguous abbreviation “MP” for both movement and Mana.

## 13. Opposed Vocation Gambits

### 13.1 Purpose and opportunity

A **Gambit** is the encounter initiator’s one optional Vocation action before tactical combat. The same rule applies to player and enemy Heroes:

- if the player initiates, the player may declare a Gambit;
- if an enemy Hero initiates, that enemy may declare a Gambit against the player;
- the defender resists and does not automatically receive a second Gambit;
- a later named rule may explicitly grant a Counter-Gambit.

Only one commanding Hero per side contributes to the base Gambit. If no defending Hero is present, the target army or asset still supplies its normal resistance. Additional Heroes do not stack unless a named rule permits it.

This makes defensive development meaningful. Every Hero can improve resistance through attributes, skills, equipment, preparation, status, and army quality, even when their own Vocation differs from the attacker’s.

### 13.2 Resolution model

```text
Gambit Power =
  Vocation Mastery
  + weighted primary and secondary offensive attributes
  + declared preparation or resource commitment
  + applicable skill, doctrine, status, and context modifiers

Gambit Resistance =
  weighted primary and secondary defensive attributes
  + matching counter-Mastery when possessed
  + target Resolve, Security, or Loyalty
  + applicable skill, doctrine, status, and context modifiers

Net Margin = Gambit Power − Gambit Resistance + encounter-seeded variance
```

Primary attributes contribute more than secondary attributes. Exact weights, curves, variance, and thresholds are TBD. A tie is **Resisted**.

| Gambit | Attacker Power | Defending Hero resistance | Target resistance |
|---|---|---|---|
| General — Intimidate / Issue Ultimatum | Tactics; Leadership primary; Charisma secondary | Leadership primary; Charisma secondary; defending Tactics if present | army Resolve and Discipline |
| Spy — Sabotage / Infiltrate Camp | Deception; Agility primary; Perception secondary; preparation/intel | Perception primary; Intellect secondary; defending Deception if present | selected target’s Security and Alertness |
| Diplomat — Parley / Suborn | Diplomacy; Charisma primary; Intellect secondary; committed Gold, Favor, or Leverage | Leadership primary; Intellect secondary; defending Diplomacy if present | squad Loyalty plus army oversight/Discipline |

A matching Vocation Mastery is a specialized counter, not a requirement. Class and Profession abilities modify a Gambit only when their definitions explicitly say so.

### 13.3 Outcome bands

| Band | General | Spy | Diplomat |
|---|---|---|---|
| **Decisive Success** | Enemy starts Shaken; one eligible, already-low-Resolve regular squad may withdraw. | Stronger declared sabotage: enhanced condition, disabled support asset, or bounded casualties. | Enemy starts Hesitant or Shaken; one eligible low-Loyalty, non-elite squad may withdraw. |
| **Success** | Enemy starts Shaken or suffers the selected morale/readiness effect. | Selected target starts Disrupted, Poisoned, Exposed, or another declared eligible condition. | Selected target or army starts Hesitant or Shaken. |
| **Resisted** | No effect on defender. | No effect on defender. | No effect on defender. |
| **Reversal** | Defender starts Inspired or Defiant. | Acting Spy becomes Revealed or Exposed; durable injury requires an explicitly declared high-risk rule. | Defender becomes Vigilant or Defiant; committed resources remain spent. |

Every legal attempt consumes the opportunity. Declared costs are committed before resolution and remain spent after Resisted or Reversal results. Ordinary resistance does not arbitrarily buff the defender; only the Reversal band creates a counter-effect.

A base Gambit cannot kill a Hero, force a Hero to change allegiance, or remove a Hero from the encounter. Side-switching is not a base Diplomat result; withdrawal is the standard decisive outcome. A later named ability may allow defection only with explicit eligibility, upkeep, ownership, and post-battle rules.

### 13.4 Eligibility, immunity, and counterplay

Immunity belongs to a named effect family:

- Fearless or Mindless squads may ignore Shaken or forced withdrawal.
- Poison immunity blocks poison, not armament, command, or supply sabotage.
- Armies without conventional supplies are ineligible for supply sabotage.
- Mindless, Bound, Fanatic, or otherwise ineligible squads cannot be suborned.
- Sovereigns and Heroes cannot desert through a base Gambit.

Where a Vocation provides multiple target modes, the initiator may select another eligible mode. Immunity never silently converts into an unrelated penalty.

Known eligibility and immunity are previewed before commitment. Whether intelligence can hide some traits is TBD. Faction evolution may add tagged Gambit riders or resistance tools while preserving the same opposed structure.

### 13.5 Atomic persistence and AI fairness

Declaration and resolution are one atomic campaign transition:

1. validate actor, encounter, target, resources, and eligibility;
2. commit resources and consume the opportunity;
3. consume the encounter’s deterministic random draw;
4. calculate Power, Resistance, margin, and band;
5. persist the attempt, breakdown, outcome, and consequences;
6. advance to the tactical encounter.

Reloading, reopening, or returning to the same unresolved contact cannot reroll or redeclare the Gambit. Exact rules for when a later re-engagement becomes a new encounter are TBD.

Enemy AI uses the same information and rules legally available to it. Difficulty may improve decision quality but does not grant hidden Power, Resistance, immunity, resources, or rerolls. After resolution, the player receives a readable breakdown of the enemy Gambit and the modifiers that affected them.

## 14. Evolution-aware skills without a data dam

The system defines **60** shared Class/Vocation abilities and **90** Profession abilities: 150 stable ability definitions, not eight copies per terminal faction. Fully duplicating nine Profession trees across eight terminal factions would create 720 Profession variants plus 60 base abilities: **780**, before future factions.

The resolved form of an ability is derived in a deterministic order:

```text
Base Class, Vocation, or Profession ability
→ applicable Civilizational rider
→ applicable Technological rider
→ applicable Spiritual rider
→ narrow terminal-faction exception, if genuinely required
```

Rules:

- the campaign stores the stable base ability ID and purchased rank;
- faction choices are stored once and the resolved ability is derived;
- only abilities with compatible tags receive a rider;
- each adapter changes only its assigned design axis;
- targeting and tactical purpose remain recognizable;
- display aliases or faction epithets never change stable IDs;
- a genuinely exceptional capstone uses a named validated rule, not copied trees or arbitrary per-content code.

Example shape, not a final numeric effect: Warlord’s **Breakthrough Command** remains a breach-and-advance Signature. Republic may make the advance more autonomous; Empire may make it formation-dependent. Industry may deliver it through a device or armored engine; Magic through a command sigil. Holy may add an oath/Resolve rider; Unholy may trade Durability or corruption for force. The base identity does not disappear.

The player-facing mobile view shows the base ability followed by short active doctrine riders. It never presents eight parallel trees.

The exact tag vocabulary, rider effects, precedence inside specific mechanics, and terminal exceptions remain TBD until their concrete gameplay rules are implemented. This concept does not approve a universal generic effect engine.

## 15. Tactical combat

### 15.1 Board and activation

- Combat uses squad-scale pieces on a hex grid.
- Each active entity receives one activation through an initiative queue.
- Tactical **Move** and **AP** are separate.
- Most entities begin from a small fixed AP allowance; Agility affects Initiative, Evasion, and bounded Move thresholds rather than multiplying AP.
- Abilities spend AP and, where defined, Mana, charges, cooldowns, or encounter uses.
- Reactions use a separate bounded reaction allowance.

The first prototype should normally use two AP for standard actors, one AP for standard actions, and two AP or an additional limit for strong Signatures. These are implementation-test defaults, not final balance values.

### 15.2 Aim and critical results

Aim and Critical Chance are separate:

```text
Hit chance =
  tunable curve(Aim + ability modifiers − Evasion − Cover − Range penalties)

Critical chance =
  independent tunable curve(critical modifiers and critical resistance)
```

Accuracy above 100% does not become Critical Chance. Exact curves, clamps, cover, range, and critical effects are TBD.

### 15.3 Damage and defense

Physical and magical packets resolve independently:

```text
Effective Armor = max(0, Armor − Physical Penetration)
Effective Ward  = max(0, Ward − Magical Penetration)

Physical dealt = Raw Physical × K / (K + Effective Armor)
Magical dealt  = Raw Magical × K / (K + Effective Ward)

Total dealt = resolved Physical + resolved Magical
```

`K`, clamps, rounding, minimum damage, critical behavior, penetration, and barriers are TBD. This diminishing-mitigation shape avoids the hard cliff where any attack below Defense always deals zero. True immunity is an explicit trait, not an accidental result of extreme Defense.

### 15.4 Resolution order

1. validate range, line of sight, target, Move, AP, and resources;
2. resolve hit;
3. resolve critical result;
4. resolve physical and magical packets separately;
5. apply barriers and finite Durability;
6. apply conditions and morale effects;
7. resolve squad defeat or Hero Downed state;
8. convert the encounter into persistent casualties, injury, resources, relationships, territory, and location consequences.

Squads use Resolve and Cohesion where applicable. Routing, surrender, intimidation, loyalty, and formation do not resolve through Health alone.

All living and alternative-life entities implement a common finite **Durability** contract. The Bone Empire may present it as Bone Integrity, Binding, or Soul Cohesion, but it remains interoperable with common targeting and damage rules.

## 16. Exploration and Dungeons

- Dungeons and explorable buildings use deterministic square grids.
- Discovery, objectives, generated structure, and resolved contents persist.
- A Dungeon belongs to a World region and can affect resources, control, supply, relationships, threats, and evolution objectives.
- Exploration may trigger combat, negotiation, hazards, choices, or non-combat rewards.
- A Dungeon Heart is one possible location objective, not the universal source of a Settlement.

The exact multi-level hierarchy, authored/procedural mix, reset/repopulation rules, hazards, ownership pressure, and reward cadence are TBD.

## 17. Diplomacy and campaign relationships

Diplomacy owns persistent relationships and strategic negotiation. It may govern:

- factions, settlements, houses, guilds, orders, and notable characters;
- attitude, trust, obligation, grievance, leverage, Favor, treaties, and access;
- trade and contract conditions;
- surrender, neutrality, alliance, vassalage, or hostility when those rules are approved;
- Diplomat Gambit preparation and resistance context;
- ethical and political consequences of terminal-faction capstones.

The Diplomacy board is not a list of flavor text. Its state must create consequences elsewhere and receive consequences from military, economic, and evolution choices. The exact relationship model and treaty rules are TBD.

## 18. Boards and cross-board consequences

The approved top-level in-campaign boards are:

- **Hero** — attributes, equipment, Class, Vocation, Profession, skills, injury, and personal progression;
- **Settlement** — buildings, projects, recruitment, stockpile, production, upkeep, and evolution previews;
- **World** — hex regions, routes, control, Travel, sites, supply, armies, and encounters;
- **Dungeon** — square-grid regional exploration;
- **Combat** — hex-grid tactical resolution;
- **Diplomacy** — persistent relationships, leverage, agreements, and diplomatic actions.

Player/campaign selection and Hero Setup are pre-campaign surfaces. The Hero board is the sole in-campaign Hero information and progression surface; the shell Hero shortcut navigates there rather than opening a duplicate overlay.

Initial availability direction:

- after Castle Hero Setup, Settlement and World are available because the campaign begins with a Village;
- Dungeon becomes relevant when an accessible regional site is selected;
- Combat becomes active for a valid encounter;
- Diplomacy becomes meaningful when a relationship participant or decision exists;
- Hero remains available for information and legal progression actions.

Examples of mandatory cross-board flow:

| Source action | Persistent consequences |
|---|---|
| Build or lose a Road on World | activate or suspend exterior production and supply on Settlement; alter army readiness |
| Resolve a Dungeon | reveal sites, resources, threats, deeds, relationships, or evolution prerequisites |
| Recruit or reinforce on Settlement | consume stockpile/capacity; create or restore World/Combat squads; increase upkeep |
| Resolve a Gambit or Combat | persist statuses, casualties, Hero injury, rewards, loyalty, and territorial outcomes |
| Choose faction evolution | modify legal buildings, recruitment, skills, economy, Diplomacy, presentation, and AI priorities |
| Advance a Day | resolve production, upkeep, projects, shortages, and time-sensitive World/Diplomacy consequences |

Boards are views and interaction surfaces over one campaign, never independent mini-apps or independent saves.

## 19. Time, defeat, and victory

- Strategic play advances in Days and uses Travel.
- Dungeon/building exploration uses exploration turns on square grids.
- Tactical Combat uses initiative activations, Move, AP, and reactions on a hex grid.
- **Downed**, **Wounded**, and **Dead** are distinct Hero states.
- Death of the actual sovereign ends the campaign in defeat unless a separately approved succession rule applies.
- Approved victory families remain **Dominion**, **Conquest**, and **Ascension**.
- Tier 4 evolution is not an automatic victory; it may enable or strengthen an endgame route.

Exact time conversion, injury thresholds, recovery, succession, and victory thresholds are TBD.

## 20. Modular content and future factions

Reusable content uses stable identities. Campaign state references those identities and stores mutable facts and outcomes; it does not copy definitions into every save.

The Castle system is built from proven capabilities such as:

- requirements and unlocks;
- resource production and consumption;
- routes and connectivity;
- persisted projects;
- squads and recruitment;
- attributes, Masteries, Techniques, Signatures, and tagged riders;
- statuses, Durability, Resolve, Security, and Loyalty where concrete rules need them;
- named terminal capstones.

Do not build a universal faction mega-framework before a second concrete faction proves what is actually shared. A future unsettled faction may migrate instead of constructing Settlements; a Dungeon Faction may grow rooms instead of building roads; a swarm may reproduce rather than recruit. They should reuse stable capabilities where useful without being forced into the Castle graph.

## 21. Presentation and interaction

- Portrait smartphone use is the primary target.
- Touch targets, safe areas, readable previews, and short decision summaries are mandatory.
- Desktop, keyboard, accessibility, and reduced motion remain supported.
- System dark mode is the default, with a user override.
- `sources/fs.tokens.json` is the authoritative FS design-token source.
- FS semantic colors are used for UI; primitive colors are used for game-world objects, factions, markers, and units.
- Prefer SVG and simple geometric game visuals; use supplied static images where appropriate.
- World and Combat use hex grids; Dungeon/building exploration uses square grids.

Evolution presentation must show ancestry instead of replacing identity: for example, the player can inspect **Castle → Republic → Magic → Unholy → Nosferatu Republic** and see the active package from every choice.

## 22. First playable vertical slice

The first coherent slice of the new concept is:

```text
Castle Hero Setup
→ starting Village and controlled home ring
→ visible Food, Wood, and Stone sites
→ construct one Road connection
→ construct one matching exterior improvement
→ resolve one strategic Day and production consequence
→ enter one regional Dungeon or encounter
→ return a persistent consequence to the campaign
→ preview the Tier 2 Republic/Empire evolution gate
```

This slice proves the central dependency chain before adding full rosters, Tier 2 evolution, Professions, Industry/Magic, Holy/Unholy, or all eight capstones. Later work expands vertically rather than constructing every catalog in advance.

The repository roadmap remains responsible for exact sequencing. At the time of this concept approval, EPIC 03 and its persistence audit remain the official next implementation work unless the roadmap is separately amended.

## 23. Current prototype boundary

After the accepted E03-T02–T07 implementation:

- ordinary new campaigns use implicit Castle-only Setup and create one Tier-1 Village plus the deterministic controlled seven-region opening exactly once;
- campaign version 5 and registry version 2 are the playable local boundaries, with strict v2/v3/v4 migration and the original registry-version-1 source retained;
- the regional Dungeon belongs to a stored World location and requires valid exploration context; the Dungeon Heart does not create the capital;
- Hero, Settlement, and World present authoritative opening facts, while Combat and Diplomacy remain unavailable without future legal contexts;
- the repository still contains six descriptive Class/Vocation trees with 60 abilities but no Hero levels, XP, Profession trees, or executable evolution riders;
- Food/Wood/Stone, the ruin, terrain-only region, and regional Dungeon are identities/inspection context only; Roads, yields, stockpile, projects, units, armies, Gambits, tactical Combat, and faction evolution are not implemented.

These are implementation-boundary facts, not additional gameplay approval. EPIC 03 does not implement the strategic economy or later connected loops and does not authorize deployment.

## 24. Consolidated TBD decisions

The following remain deliberately open and require bounded design or implementation approval:

1. All exact yields, costs, durations, upkeep, conversion ratios, caps, curves, thresholds, and balance values.
2. World size beyond the accepted seven-region opening, later-region density, and the future terrain catalog.
3. Region conquest, contesting, occupation, reclamation, loss, and hostile-Dungeon access.
4. Road ranks, cost, capacity, maintenance, alternate transport, supply hubs, attrition, and siege rules.
5. Local stockpiles, storage caps, convoys, spoilage, and market exchange behavior beyond the MVP global stockpile.
6. Population/manpower simulation, exact recruitment capacity, command capacity, squad size, and reinforcement timing.
7. Exact unit definitions, statistics, abilities, formations, counters, AI, and branch balance.
8. Exact Tier 2–4 prerequisites, project durations, and cross-loop deeds.
9. Exact capstone formulas, meters, affected content, costs, counters, and signature-content quantities.
10. Rare evolution reversal, capital relocation, secondary-settlement evolution timing, and capital-loss consequences.
11. XP thresholds, attribute cap and conversion curves, equipment requirements, respecialization, companions, injury, and recovery.
12. Exact Class, Vocation, and Profession Technique effects, doctrine tags, rider precedence, and named terminal exceptions.
13. Gambit weights, variance, bands, costs, reset timing, target lists, hidden information, AI policy, and high-risk injury options.
14. Tactical initiative, Move/AP values, terrain, Aim/Evasion curves, damage constants, minimum damage, criticals, conditions, casualties, rewards, recovery, and AI tactics.
15. Dungeon hierarchy, multi-level persistence, generation, contents, hazards, reset/repopulation, and rewards.
16. Diplomacy relationship values, treaties, negotiation, loyalty change, Favor/leverage sources, and faction reactions.
17. Exact Dominion, Conquest, Ascension, and defeat thresholds, including Tier 4’s relationship to Ascension.
18. Final setting-language pass for mixed historical working names and any proposed display-name changes.
19. Save compatibility beyond the accepted v2/v3/v4→v5 Castle conversion, pre-Setup preservation, Dungeon-faction incompatibility, and retained-source policy.
20. Cloud, offline synchronization, authenticated identity, campaign cardinality beyond the one-campaign local MVP, and multiplayer persistence policies.

## 25. Decision discipline

1. Do not turn a TBD, example, or implementation default into a canonical rule without owner approval.
2. Record approved concept changes here and record their decision/supersession chain in `DECISIONS.md`.
3. Keep executable numbers in typed content or a responsible balance specification when their mechanic is approved.
4. Keep state schema, migration, and architecture detail in their responsible documents.
5. Keep implementation evidence in `CURRENT_STATE.md`; do not report target design as shipped functionality.
6. Preserve stable IDs, atomic transitions, deterministic campaign outcomes, and one central state.
7. Prefer one proven shared rule plus small adapters over parallel copies.
8. Do not deploy or checkpoint a concept candidate until it passes the repository workflow and receives owner acceptance.
