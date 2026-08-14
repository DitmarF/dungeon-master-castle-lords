import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import type {
  CampaignStateV5,
  HeroSetupSelection,
} from "../../src/game/campaignState.ts";
import { validateCampaignStateV5 } from "../../src/game/campaignMigration.ts";
import { createDungeonLevel } from "../../src/game/generateDungeon.ts";
import {
  BOARD_DESCRIPTORS_V5,
  getBoardAvailabilityV5,
  resolveActiveBoardV5,
} from "../../src/game/navigationV5.ts";
import { completeVillageFirstHeroSetup } from "../../src/game/villageOpening.ts";

const SELECTION: HeroSetupSelection = {
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

function preSetupCampaign(): CampaignStateV5 {
  return {
    version: 5,
    id: "game-village-opening",
    playerId: "player-village-opening",
    campaignSeed: 42,
    createdAt: "2026-08-14T10:00:00.000Z",
    updatedAt: "2026-08-14T10:00:00.000Z",
    activeBoardId: "setup",
    foundation: null,
  };
}

function completedCampaign(): CampaignStateV5 {
  const result = completeVillageFirstHeroSetup(preSetupCampaign(), SELECTION);
  if (!result.ok) throw new Error(`Setup failed: ${result.code}`);
  return result.state;
}

test("Village-first Setup creates the complete Castle opening atomically", () => {
  const source = preSetupCampaign();
  const original = structuredClone(source);
  const result = completeVillageFirstHeroSetup(source, SELECTION);

  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.deepEqual(source, original);
  assert.equal(result.state.activeBoardId, "settlement");
  assert.equal(result.state.foundation?.rootFactionId, "castle");
  assert.equal(result.state.foundation?.capital.definitionId, "village");
  assert.equal(result.state.foundation?.capital.tier, 1);
  assert.equal(result.state.foundation?.world.regions.length, 7);
  assert.ok(
    result.state.foundation?.world.regions.every((region) => region.controlled),
  );
  assert.equal(result.state.foundation?.world.sites.length, 3);
  assert.equal(result.state.foundation?.world.locations.length, 2);
  assert.equal(validateCampaignStateV5(result.state).length, 0);
});

test("Village-first Setup preserves the accepted temporary Level-1 grants", () => {
  const foundation = completedCampaign().foundation;
  assert.ok(foundation);
  assert.deepEqual(foundation.hero.freeAttributes, SELECTION.freeAttributes);
  assert.equal(foundation.hero.bonusSkillId, "heavy-blow");
  assert.deepEqual(foundation.hero.skillRanks, {
    "close-combat": 1,
    tactics: 1,
    "heavy-blow": 1,
  });
  assert.deepEqual(foundation.hero.attributesCompatibility, {
    ruleVersion: "v4-path-bonus-1",
    values: {
      str: 3,
      agy: 0,
      per: 0,
      int: 0,
      cha: 0,
      lead: 1,
    },
  });
  assert.equal(foundation.hero.strategicRegionId, foundation.world.homeRegionId);
  assert.equal(foundation.hero.explorationContext, null);
});

test("invalid and repeated Setup cannot create partial or duplicate foundations", () => {
  const source = preSetupCampaign();
  const invalid = {
    ...SELECTION,
    freeAttributes: { ...SELECTION.freeAttributes, str: 1 },
  };
  assert.deepEqual(completeVillageFirstHeroSetup(source, invalid), {
    ok: false,
    code: "invalid-attributes",
  });
  assert.equal(source.foundation, null);

  const completed = completedCampaign();
  const snapshot = structuredClone(completed);
  assert.deepEqual(completeVillageFirstHeroSetup(completed, SELECTION), {
    ok: false,
    code: "setup-already-complete",
  });
  assert.deepEqual(completed, snapshot);
  assert.equal(completed.foundation?.world.regions.length, 7);
  assert.equal(Object.keys(completed.foundation?.regionalDungeons ?? {}).length, 1);
});

test("the starting regional Dungeon is deterministic context, not the opening position", () => {
  const campaign = completedCampaign();
  const foundation = campaign.foundation;
  assert.ok(foundation);
  const regional = foundation.regionalDungeons["location:regional-dungeon"];
  const legacyGenerated = createDungeonLevel(campaign.campaignSeed);

  assert.deepEqual(regional.rooms, legacyGenerated.rooms);
  assert.deepEqual(regional.tiles, legacyGenerated.tiles);
  assert.deepEqual(regional.start, legacyGenerated.start);
  assert.deepEqual(regional.heart, legacyGenerated.heart);
  assert.deepEqual(regional.discovered, []);
  assert.equal(regional.heartReached, false);
  assert.equal(regional.legacyPrototypeMetadata, undefined);
  assert.equal(foundation.hero.explorationContext, null);
  assert.equal("settlementClaimed" in regional, false);
});

test("initial board availability follows the accepted Village-first policy", () => {
  const campaign = completedCampaign();
  assert.deepEqual(
    BOARD_DESCRIPTORS_V5.map((board) => board.id),
    ["hero", "settlement", "world", "dungeon", "combat", "diplomacy"],
  );
  for (const boardId of ["hero", "settlement", "world"] as const) {
    assert.equal(getBoardAvailabilityV5(boardId, campaign).available, true);
  }
  assert.deepEqual(
    {
      enabled: getBoardAvailabilityV5("dungeon", campaign).enabled,
      unlocked: getBoardAvailabilityV5("dungeon", campaign).unlocked,
      available: getBoardAvailabilityV5("dungeon", campaign).available,
    },
    { enabled: true, unlocked: false, available: false },
  );
  for (const boardId of ["combat", "diplomacy"] as const) {
    assert.deepEqual(
      {
        enabled: getBoardAvailabilityV5(boardId, campaign).enabled,
        available: getBoardAvailabilityV5(boardId, campaign).available,
      },
      { enabled: false, available: false },
    );
  }
  assert.equal(resolveActiveBoardV5(campaign)?.descriptor.id, "settlement");
});

test("Dungeon availability requires the stored regional exploration context", () => {
  const campaign = completedCampaign();
  if (!campaign.foundation) throw new Error("Missing foundation");
  const withContext: CampaignStateV5 = {
    ...campaign,
    activeBoardId: "dungeon",
    foundation: {
      ...campaign.foundation,
      hero: {
        ...campaign.foundation.hero,
        explorationContext: {
          locationId: "location:regional-dungeon",
          cell: {
            ...campaign.foundation.regionalDungeons["location:regional-dungeon"]
              .start,
          },
          returnBoardId: "world",
        },
      },
    },
  };
  assert.equal(getBoardAvailabilityV5("dungeon", withContext).available, true);
  assert.equal(resolveActiveBoardV5(withContext)?.descriptor.id, "dungeon");
  assert.equal(validateCampaignStateV5(withContext).length, 0);
});

test("Village opening and navigation stay pure and platform-independent", async () => {
  for (const moduleUrl of [
    new URL("../../src/game/heroSetup.ts", import.meta.url),
    new URL("../../src/game/villageOpening.ts", import.meta.url),
    new URL("../../src/game/navigationV5.ts", import.meta.url),
  ]) {
    const source = await readFile(moduleUrl, "utf8");
    assert.doesNotMatch(source, /from\s+["']react(?:\/[^"']*)?["']/);
    assert.doesNotMatch(source, /\b(?:window|localStorage|Date|crypto)\b/);
    assert.doesNotMatch(source, /(?:cloudflare|sites-project|\.openai\/hosting)/i);
  }
});
