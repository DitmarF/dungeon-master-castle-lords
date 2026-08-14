# Dungeon Master & Castle Lords — Content Model

Status: source of truth for game-content ownership and extension principles  
Scope: how authored definitions relate to rules, presentation, and campaign instances  
Last updated: 2026-08-14

## Purpose and authority

This document answers: **How do we add more game content without adding another bespoke subsystem?** It defines content boundaries and extension principles without choosing unapproved gameplay rules or implementing a schema.

- Product systems and gameplay status: [GAME_CONCEPT.md](./GAME_CONCEPT.md)
- Structural boundaries and proposals: [ARCHITECTURE.md](./ARCHITECTURE.md)
- Runtime and campaign-state ownership: [GAME_STATE.md](./GAME_STATE.md)
- Observed implementation: [CURRENT_STATE.md](./CURRENT_STATE.md)

Status labels:

- **Established** — required by the approved concept or established project direction.
- **Observed** — true in the current repository, but not automatically permanent.
- **Accepted** — approved content policy.
- **TBD/Open Question** — unresolved; implementation must not silently decide it.

## Core distinction

**Established at principle level:** Content describes the reusable things the game offers; campaign state records particular choices, instances, and outcomes; rules decide what those things do; views decide how they are presented.

Examples:

- “Fighter” is a reusable content definition; a hero choosing Fighter is campaign state.
- “Heavy Blow” is a skill definition; its learned rank is campaign state; its legal effect is a rule.
- A dungeon-room type can be content; a generated room at coordinates in one campaign is state; placement is generator/rule behavior.
- “World” can be board metadata; whether a campaign may enter it is runtime availability/unlock state.

Adding another Fighter, skill, room type, building, unit, or terrain should extend an existing content family. A new subsystem is justified only when the new content introduces genuinely new lifecycle, state, or rule behavior.

## Current content inventory

### Centralized content

**Observed:** `src/game/skillTrees.ts` is the strongest current content pattern. It defines six typed trees and 60 skills with stable IDs, names, sigils, descriptions, hierarchy metadata, and derived indexes. Campaign saves reference skills by ID and store ranks separately.

Skill descriptions are currently presentation text; most described effects are not executable mechanics. Their wording must not be treated as approved rules.

**Implemented through E02-T04:** `src/game/navigation.ts` owns the six stable board IDs, ordered non-React descriptors, enabled state, and campaign unlock policy. `src/boards/registry.ts` binds the existing React components over those definitions without becoming a second metadata or navigation-rule authority.

### Hero attribute rule definitions

**Implemented through E02-T05:** `src/game/selectors.ts` is the one current authority for class/vocation attribute bonus meaning and total Hero attribute calculation. Hero Setup derives its path-card bonus copy and live preview from those typed mappings; setup completion and migration normalization use the same total calculation. The current version-4 campaign preserves class, vocation, and free allocation as facts plus total attributes as the compatibility snapshot introduced by the earlier v3 shape.

Faction, class, vocation, and attribute names/icons remain presentation definitions in `SetupBoard`; consolidating the complete Hero-foundation catalog belongs to its responsible future Hero-progression Epic, not this bounded selector task. Initial root skills, legal bonus-skill eligibility, and setup validation remain current rule definitions in `transitions.ts` and `skillTrees.ts`. No generic content/effect framework was introduced.

**Observed:** Faction-related presentation and banner colors appear in board/UI components. `GameIcon` contains a typed hand-authored icon mapping. Most UI copy and board-specific labels are component-local.

### Rules or generated data—not reusable content today

**Observed:** Dungeon dimensions, room counts/ranges, corridors, start/heart placement, and initial counters are hard-coded in the generator. The generated rooms and tiles are campaign state, not content definitions.

**Observed:** Hero creation calculations, movement validity, discovery, persistence migration, and board transitions are rule/application behavior rather than authored content.

No external game-content files, runtime content loader, localization catalog, validation schema, editor, mod system, or server-delivered content exists.

## Content families

The approved concept implies these **content families**, but only currently implemented entries are established content. Future entries and mechanics remain TBD.

| Family | Reusable definitions may eventually include | Campaign stores |
|---|---|---|
| Hero foundations | factions, classes, vocations, attributes | selected IDs and durable progression |
| Progression | skills, skill trees, prerequisites, approved effects | learned ranks/unlocks and choices |
| World and locations | region, dungeon, castle, settlement, building, level, room or site definitions | generated/authored instances, discovery, control, changes |
| Management | buildings, projects, resources, production or population types | owned instances, quantities, queues, outcomes |
| Supply and strategy | supply types, routes, strategic actions, region states | campaign network/relationships and consequences |
| Tactical play | units, abilities, terrain, hazards, encounter templates | participants, placement, conditions, results; in-progress state only if approved |
| Presentation | labels, descriptions, sigils, icon/asset references, tags | normally nothing beyond stable references |
| Boards | navigation/display metadata and supported capabilities | active board and approved board-specific state |

This table is a classification aid, not approval of any listed mechanic.

## Common definition contract

**Accepted:** Every reusable game-content definition shares a small identity/presentation envelope, then adds fields specific to its family:

```text
ContentDefinition
  id            stable machine ID
  kind          content family/type
  name          player-facing name or text key
  description   optional player-facing description or text key
  presentation  optional sigil/icon/asset/color-role references
  tags          optional descriptive/query metadata
  version       optional content revision when compatibility requires it
  family fields fields validated for this specific kind
```

This is the approved conceptual contract, not a prescribed concrete TypeScript or file schema. Do not require irrelevant fields merely to force every family into one large record.

### Identity rules

**Accepted:**

- IDs are stable, unique within an explicitly defined namespace, and independent of display labels.
- Campaign state references definitions by ID rather than embedding full definitions.
- Renaming display text does not change identity.
- Removing or changing persisted references requires compatibility/migration handling.
- Definition IDs, campaign-instance IDs, and player/campaign IDs are distinct concepts.

**Accepted and implemented for the current repository through E02-T03:**

- existing board, skill, skill-tree, branch, faction, class, and vocation IDs remain stable lowercase literal/content-catalog values; no generic `ContentId` wrapper replaces their family-specific types;
- current player/profile instances use `PlayerId` values with the established `player-…` prefix;
- current campaigns use `CampaignId` values with the established `game-…` prefix;
- display labels and UI array positions never define persistent identity;
- coordinates, `CellKey` strings, array indexes, and dungeon-room ordinals are spatial/derived or snapshot-local values, not reusable content IDs or campaign-entity IDs;
- new player/campaign identities use an injected identity source separate from deterministic gameplay randomness;
- existing persisted IDs retain their meaning and are not migrated merely to satisfy a newer formatting preference;
- future campaign-entity categories receive IDs only when an approved implemented mechanic requires persistent instances.

Namespace, alias/deprecation, and content-version policy beyond these current categories remain TBD. No hero, settlement, region, army, unit, item, or generic global entity namespace is approved here.

## Composition instead of bespoke types

**Accepted:** Model variation through small reusable capabilities where families share real behavior. A definition may compose approved capabilities such as:

- grants or modifies an attribute;
- unlocks or grants a skill;
- has a grid footprint or placement constraints;
- has costs, requirements, production, or upkeep;
- participates in exploration, supply, control, or tactical behavior;
- references presentation assets and descriptive tags.

These are examples of structural capability categories, not approved gameplay effects.

Do not create a new capability merely because two items share a word. A capability must have one rule meaning, one validation contract, and one execution path. Content data selects/configures approved behavior; it must not contain arbitrary executable code.

When behavior is genuinely unique, add a named rule extension behind the same content contract rather than implementing it directly in one view.

## Definition, rule, instance, and view boundaries

**Accepted:** Use this ownership test for any new field:

| Question | Owner |
|---|---|
| What reusable thing exists? | Content definition |
| What does that kind of thing legally do? | Domain rule/capability handler |
| What happened to this particular thing in this campaign? | Campaign instance/state |
| How is it displayed or interacted with here? | Board/shared UI |
| How is it loaded, validated, or delivered? | Content infrastructure |

Do not store campaign quantities, damage, ownership, discovery, learned ranks, construction progress, or tactical position in reusable definitions. Do not encode rule calculations in display copy. Do not duplicate names, bonuses, or relationships across a view and rule file when one authoritative definition can serve both.

## Relationships and references

**Accepted:** Content relationships use stable references and are validated as a whole catalog. Examples include a class referencing its root skill, a skill referencing prerequisites, or an encounter template referencing unit and terrain definitions.

Relationships may be one-to-one, lists, hierarchy, or tagged queries only when the relevant system requires them. Circular dependencies, missing references, invalid hierarchy, and incompatible capabilities should fail validation before play.

Exact prerequisite, inheritance, override, tagging, and cross-pack semantics are TBD.

## Content catalogs

**Accepted:** Each family exposes one authoritative typed catalog plus derived indexes/selectors. Consumers query that catalog instead of maintaining local parallel arrays.

A catalog should provide, as relevant:

- validated definitions keyed by stable ID;
- deterministic ordering where presentation needs it;
- derived indexes for kind, hierarchy, tags, or relationships;
- explicit availability/version information when required;
- selectors that return definitions without exposing campaign mutation.

One catalog API does not require one physical file. Content may be split into maintainable modules and assembled at a controlled boundary.

## Rules and effects

**Observed:** Current skill descriptions imply mechanics, but there is no general effect-execution system. The current Hero path attribute bonuses are a small typed selector mapping, not general executable effects.

**Accepted:** When a concrete approved mechanic needs repeatable effects, represent them through typed effect/requirement definitions interpreted by domain rule handlers. Complex behavior may use a named handler with validated parameters. Views may preview the same authoritative definition but must not independently implement the effect.

TBD/Open Question:

- which effects and requirements are generic enough to model declaratively;
- ordering, stacking, duration, targeting, and conflict rules;
- whether descriptions are authored separately or generated from mechanics;
- how rule/content versions interact with old campaigns.

No generic effect engine should be built before at least one approved mechanic requires it.

## Generated and authored locations

**Established:** Campaign-specific generated maps and discoveries belong to campaign state as described in `GAME_STATE.md`.

**Accepted:** Separate reusable generation inputs from generated instances:

- content can describe approved tiles, room/site types, encounter pools, themes, or generation profiles;
- generator rules consume those definitions and an explicit random source;
- campaign state stores the authoritative seed/version, result, or both according to the approved state policy.

The dungeon hierarchy, generation profiles, authored-versus-procedural balance, and compatibility rules are TBD.

## Presentation and assets

**Established:** Use simple geometric SVG visuals, the FS color system, semantic UI colors, primitive game-object colors, and externally supplied static images when appropriate. See `GAME_CONCEPT.md`.

**Accepted:** Content definitions reference presentation roles or asset IDs rather than embedding board-specific markup or CSS classes. Shared presentation metadata may include a sigil, icon name, asset reference, and descriptive tags; layout and interaction remain owned by views.

TBD/Open Question:

- authoritative asset catalog and path conventions;
- whether an icon reference is semantic or tied to the current `GameIcon` union;
- image metadata, variants, licensing/provenance, and fallbacks;
- FS token synchronization method.

## Authoring format and delivery

**Observed:** Game content is currently authored as TypeScript. This provides compile-time types and simple derived indexes, but much content is still embedded in components.

**Accepted:** Keep TypeScript as the default prototype authoring format until non-developer authoring, localization, downloadable content, modding, or independent content releases justify a validated external format. Centralize definitions before changing formats.

TBD/Open Question:

- TypeScript versus JSON/YAML/database or generated artifacts;
- runtime validation library and schema ownership;
- content packs, load order, override policy, and compatibility;
- localization keys and translation workflow;
- hot reload/editor tooling;
- remote delivery, modding, and trust/security model.

Externalization alone does not make content modular; stable contracts, validation, rule separation, and campaign references do.

## Adding content versus adding a subsystem

**Accepted:** Use this decision sequence:

1. Identify the existing content family and approved gameplay rule.
2. Add a definition using the family schema and existing capabilities.
3. Reference existing definitions by stable ID and reuse catalog selectors.
4. Add presentation through shared metadata and existing views.
5. Add campaign fields only for new durable instance facts.
6. Add or extend a rule handler only when approved behavior cannot be expressed by existing capabilities.
7. Create a new subsystem only when the content has a genuinely distinct lifecycle, state ownership, or interaction model.

Examples:

- Another class using approved attribute/skill grants: new content, not a new setup flow.
- Another skill using an approved effect: new content, not a new skill component.
- Another room type using an approved generation profile: new content, not another dungeon generator.
- A new strategic system with unique state transitions and board interactions: possibly a subsystem, requiring concept and architecture approval first.

These examples explain classification only; they do not approve new classes, skills, room types, or strategic mechanics.

## Validation and compatibility

**Accepted:** Content validation should cover:

- unique and well-formed IDs;
- required family fields and valid capability parameters;
- reference integrity and hierarchy constraints;
- compatibility with campaign persistence and migrations;
- presentation references/fallbacks;
- deterministic catalog assembly/order where required.

Content changes that alter the meaning of persisted IDs or outcomes need an explicit compatibility decision: preserve old meaning, migrate campaign state, version the definition/rules, or declare incompatibility. The project currently has no formal content-versioning policy.

## Open questions requiring approval

1. Which first approved mechanics should define the initial typed effect/requirement vocabulary?
2. What ID namespace, deprecation, alias, and content/rule-version strategy is required beyond the accepted stable-ID policy?
3. Which future content family should be formalized first after hero foundations and skills?
4. What is the localization strategy, and should player-facing text be direct strings or text keys?
5. What asset catalog, provenance, and fallback rules apply?
6. Are remote content, content packs, user mods, or independent content releases actual requirements; if yes, what load-order and trust model applies?
