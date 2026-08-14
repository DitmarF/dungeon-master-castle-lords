import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import type { HeroSetupSelection } from "../../src/game/campaignState.ts";
import {
  CASTLE_OPENING_CATALOG,
  CASTLE_OPENING_DEFINITION,
  NEW_CAMPAIGN_ROOT_FACTION_DEFINITIONS,
  REGION_LOCATION_DEFINITION_BY_ID,
  RESOURCE_SITE_DEFINITIONS,
  ROOT_FACTION_DEFINITION_BY_ID,
  SETTLEMENT_DEFINITION_BY_ID,
  getRootFactionDefinition,
  isPlayableNewCampaignFaction,
  validateCastleOpeningCatalog,
  type CastleOpeningCatalog,
  type HomeRingContentReference,
} from "../../src/game/openingContent.ts";
import { ALL_SKILLS, SKILL_TREES } from "../../src/game/skillTrees.ts";
import {
  CLASS_SKILL,
  VOCATION_SKILL,
  validateHeroSetupSelection,
} from "../../src/game/transitions.ts";

const VALID_CASTLE_SELECTION: HeroSetupSelection = {
  heroClass: "fighter",
  vocation: "general",
  freeAttributes: {
    str: 2,
    agy: 0,
    per: 0,
    int: 0,
    cha: 0,
    lead: 0,
  },
  bonusSkill: "heavy-blow",
};

test("the minimum Castle-opening catalogs expose the accepted stable definitions", () => {
  assert.deepEqual(validateCastleOpeningCatalog(CASTLE_OPENING_CATALOG), []);
  assert.equal(ROOT_FACTION_DEFINITION_BY_ID.castle.name, "Castle");
  assert.equal(
    ROOT_FACTION_DEFINITION_BY_ID.castle.newCampaignAvailability,
    "playable",
  );
  assert.equal(SETTLEMENT_DEFINITION_BY_ID.village.tier, 1);
  assert.equal(
    SETTLEMENT_DEFINITION_BY_ID.village.rootFactionId,
    "castle",
  );
  assert.deepEqual(
    RESOURCE_SITE_DEFINITIONS.map((definition) => definition.id),
    ["food-site", "wood-site", "stone-site"],
  );
  assert.deepEqual(CASTLE_OPENING_DEFINITION.homeRingContents, [
    { kind: "resource-site", definitionId: "food-site" },
    { kind: "resource-site", definitionId: "wood-site" },
    { kind: "resource-site", definitionId: "stone-site" },
    { kind: "location", definitionId: "regional-dungeon" },
    { kind: "location", definitionId: "ruin" },
    { kind: "terrain-only", definitionId: "home-ring-terrain" },
  ]);
  assert.equal(
    REGION_LOCATION_DEFINITION_BY_ID["regional-dungeon"].interaction,
    "exploration",
  );
  assert.equal(REGION_LOCATION_DEFINITION_BY_ID.ruin.interaction, "inert");
});

test("Castle is the sole new-campaign faction while Dungeon remains a stable compatibility identity", () => {
  assert.deepEqual(
    NEW_CAMPAIGN_ROOT_FACTION_DEFINITIONS.map((definition) => definition.id),
    ["castle"],
  );
  assert.equal(isPlayableNewCampaignFaction("castle"), true);
  assert.equal(isPlayableNewCampaignFaction("dungeon"), false);
  assert.equal(
    getRootFactionDefinition("dungeon")?.newCampaignAvailability,
    "compatibility-only",
  );
  assert.equal(getRootFactionDefinition("unknown"), null);
  assert.equal("faction" in VALID_CASTLE_SELECTION, false);
});

test("catalog validation detects duplicate IDs and non-deterministic ordering", () => {
  const duplicateCatalog: CastleOpeningCatalog = {
    ...CASTLE_OPENING_CATALOG,
    resourceSites: [
      ...CASTLE_OPENING_CATALOG.resourceSites,
      {
        ...CASTLE_OPENING_CATALOG.resourceSites[0],
        catalogOrder: 3,
      },
    ],
  };
  const duplicateIssues = validateCastleOpeningCatalog(duplicateCatalog);
  assert.ok(
    duplicateIssues.some(
      (issue) =>
        issue.code === "duplicate-id" && issue.path === "resourceSites[3].id",
    ),
  );

  const outOfOrderCatalog: CastleOpeningCatalog = {
    ...CASTLE_OPENING_CATALOG,
    resourceSites: [
      CASTLE_OPENING_CATALOG.resourceSites[1],
      CASTLE_OPENING_CATALOG.resourceSites[0],
      CASTLE_OPENING_CATALOG.resourceSites[2],
    ],
  };
  assert.ok(
    validateCastleOpeningCatalog(outOfOrderCatalog).some(
      (issue) => issue.code === "non-deterministic-order",
    ),
  );
});

test("catalog validation distinguishes broken and incompatible references", () => {
  const brokenReference = {
    kind: "location",
    definitionId: "missing-location",
  } as unknown as HomeRingContentReference;
  const brokenCatalog: CastleOpeningCatalog = {
    ...CASTLE_OPENING_CATALOG,
    opening: {
      ...CASTLE_OPENING_CATALOG.opening,
      homeRingContents: [
        ...CASTLE_OPENING_CATALOG.opening.homeRingContents.slice(0, 3),
        brokenReference,
        ...CASTLE_OPENING_CATALOG.opening.homeRingContents.slice(4),
      ],
    },
  };
  assert.ok(
    validateCastleOpeningCatalog(brokenCatalog).some(
      (issue) => issue.code === "broken-reference",
    ),
  );

  const incompatibleReference = {
    kind: "location",
    definitionId: "food-site",
  } as unknown as HomeRingContentReference;
  const incompatibleCatalog: CastleOpeningCatalog = {
    ...CASTLE_OPENING_CATALOG,
    opening: {
      ...CASTLE_OPENING_CATALOG.opening,
      homeRingContents: [
        ...CASTLE_OPENING_CATALOG.opening.homeRingContents.slice(0, 3),
        incompatibleReference,
        ...CASTLE_OPENING_CATALOG.opening.homeRingContents.slice(4),
      ],
    },
  };
  assert.ok(
    validateCastleOpeningCatalog(incompatibleCatalog).some(
      (issue) => issue.code === "incompatible-reference",
    ),
  );
});

test("catalog validation reports missing and incompatible required definitions", () => {
  const withoutCastle: CastleOpeningCatalog = {
    ...CASTLE_OPENING_CATALOG,
    rootFactions: CASTLE_OPENING_CATALOG.rootFactions.filter(
      (definition) => definition.id !== "castle",
    ),
  };
  const missingIssues = validateCastleOpeningCatalog(withoutCastle);
  assert.ok(
    missingIssues.some(
      (issue) =>
        issue.code === "missing-required-definition" &&
        issue.path === "rootFactions.castle",
    ),
  );

  const playableDungeon: CastleOpeningCatalog = {
    ...CASTLE_OPENING_CATALOG,
    rootFactions: CASTLE_OPENING_CATALOG.rootFactions.map((definition) =>
      definition.id === "dungeon"
        ? {
            ...definition,
            newCampaignAvailability: "playable" as const,
          }
        : definition,
    ),
  };
  assert.ok(
    validateCastleOpeningCatalog(playableDungeon).some(
      (issue) =>
        issue.code === "incompatible-definition" &&
        issue.path === "rootFactions.dungeon",
    ),
  );
});

test("all existing Hero tree, Class, Vocation, and skill IDs remain stable", () => {
  assert.deepEqual(Object.keys(SKILL_TREES), [
    "fighter",
    "ranger",
    "mage",
    "general",
    "spy",
    "diplomat",
  ]);
  assert.deepEqual(CLASS_SKILL, {
    fighter: "close-combat",
    ranger: "ranged-combat",
    mage: "mage-combat",
  });
  assert.deepEqual(VOCATION_SKILL, {
    general: "tactics",
    spy: "deception",
    diplomat: "diplomacy",
  });
  assert.deepEqual(
    ALL_SKILLS.map((skill) => skill.id),
    [
      "close-combat",
      "heavy-blow",
      "cleaving-strike",
      "executioner",
      "brace",
      "riposte",
      "bulwark",
      "footwork",
      "lunge",
      "whirlwind",
      "ranged-combat",
      "aimed-shot",
      "weak-spot",
      "deadeye",
      "quickstep",
      "skirmisher",
      "ghost-trail",
      "rapid-shot",
      "split-arrow",
      "arrow-storm",
      "mage-combat",
      "ember-bolt",
      "fireball",
      "inferno",
      "frost-shard",
      "ice-wall",
      "deep-freeze",
      "mana-ward",
      "blink",
      "arcane-surge",
      "tactics",
      "rally",
      "battle-order",
      "supreme-command",
      "hold-line",
      "flanking",
      "encirclement",
      "supply-line",
      "forced-march",
      "war-machine",
      "deception",
      "disguise",
      "shadow-entry",
      "perfect-cover",
      "tamper",
      "poison-cache",
      "demolition",
      "eavesdrop",
      "network",
      "mastermind",
      "diplomacy",
      "persuasion",
      "favor",
      "mandate",
      "bargain",
      "mediation",
      "grand-accord",
      "protocol",
      "alliance",
      "peacekeeper",
    ],
  );
  assert.deepEqual(validateHeroSetupSelection(VALID_CASTLE_SELECTION), {
    ok: true,
  });
});

test("opening content stays pure and does not pull gameplay or instance state forward", async () => {
  const source = await readFile(
    new URL("../../src/game/openingContent.ts", import.meta.url),
    "utf8",
  );
  for (const forbidden of [
    "react",
    "../boards",
    "../ui",
    "localStorage",
    "GameProvider",
    "yield",
    "stockpile",
    "coordinate",
    "Road",
    "projectQueue",
  ]) {
    assert.doesNotMatch(source, new RegExp(forbidden, "i"));
  }

  for (const definition of CASTLE_OPENING_CATALOG.resourceSites) {
    assert.equal("yield" in definition, false);
    assert.equal("cost" in definition, false);
  }
});

test("Hero Setup treats Castle as implicit and exposes no Dungeon choice", async () => {
  const source = await readFile(
    new URL("../../src/boards/SetupBoard.tsx", import.meta.url),
    "utf8",
  );
  assert.match(source, /Castle is your campaign foundation/);
  assert.match(source, /The sole playable root faction/);
  assert.doesNotMatch(source, /ROOT_FACTION_DEFINITIONS\.map|setFaction|Dungeon/);
});
