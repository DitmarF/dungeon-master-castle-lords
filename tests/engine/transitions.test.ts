import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import type {
  CampaignState,
  HeroSetupSelection,
} from "../../src/game/campaignState.ts";
import { discoverAround } from "../../src/game/generateDungeon.ts";
import {
  BOARD_DESCRIPTORS,
  getBoardAvailability,
  resolveActiveBoard,
} from "../../src/game/navigation.ts";
import {
  claimSettlement,
  completeHeroSetup,
  moveHeroInDungeon,
  navigateToAvailableBoard,
  validateHeroSetupSelection,
} from "../../src/game/transitions.ts";
import { selectHeroAttributes } from "../../src/game/selectors.ts";

const VALID_SELECTION: HeroSetupSelection = {
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

function createSetupCampaign(): CampaignState {
  return {
    version: 5,
    id: "game-transitions",
    playerId: "player-transitions",
    campaignSeed: 1_234,
    createdAt: "2026-08-10T10:00:00.000Z",
    updatedAt: "2026-08-10T10:00:00.000Z",
    activeBoardId: "setup",
    foundation: null,
  };
}

function createReadyCampaign(): CampaignState {
  const result = completeHeroSetup(createSetupCampaign(), VALID_SELECTION);
  if (!result.ok) throw new Error(`Setup failed: ${result.code}`);
  return result.state;
}

function enterDungeon(campaign = createReadyCampaign()): CampaignState {
  if (!campaign.foundation) throw new Error("Missing foundation");
  const dungeon = campaign.foundation.regionalDungeons["location:regional-dungeon"];
  return {
    ...campaign,
    activeBoardId: "dungeon",
    foundation: {
      ...campaign.foundation,
      hero: {
        ...campaign.foundation.hero,
        explorationContext: {
          locationId: "location:regional-dungeon",
          cell: { ...dungeon.start },
          returnBoardId: "world",
        },
      },
      regionalDungeons: {
        ...campaign.foundation.regionalDungeons,
        "location:regional-dungeon": {
          ...dungeon,
          discovered: discoverAround(
            dungeon.start,
            dungeon.grid.columns,
            dungeon.grid.rows,
          ),
        },
      },
    },
  };
}

test("legal Hero Setup completes through one atomic Village-first transition", () => {
  const campaign = createSetupCampaign();
  const snapshot = structuredClone(campaign);
  const result = completeHeroSetup(campaign, VALID_SELECTION);

  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.deepEqual(campaign, snapshot);
  assert.equal(result.state.activeBoardId, "settlement");
  assert.equal(result.state.foundation?.rootFactionId, "castle");
  assert.equal(result.state.foundation?.capital.definitionId, "village");
  assert.deepEqual(
    result.state.foundation?.hero.attributesCompatibility.values,
    selectHeroAttributes(VALID_SELECTION),
  );
  assert.equal(result.state.foundation?.hero.skillRanks["close-combat"], 1);
  assert.equal(result.state.foundation?.hero.skillRanks.tactics, 1);
  assert.equal(result.state.foundation?.hero.skillRanks["heavy-blow"], 1);
  assert.equal(result.state.foundation?.hero.explorationContext, null);
  assert.equal(result.state.updatedAt, campaign.updatedAt);
});

test("Hero Setup rejects invalid constraints and repeated completion", () => {
  const campaign = createSetupCampaign();
  const onePoint = {
    ...VALID_SELECTION,
    freeAttributes: { ...VALID_SELECTION.freeAttributes, str: 1 },
  };
  const unrelatedSkill = {
    ...VALID_SELECTION,
    bonusSkill: "ranged-combat" as const,
  };

  assert.deepEqual(validateHeroSetupSelection(onePoint), {
    ok: false,
    code: "invalid-attributes",
  });
  assert.deepEqual(completeHeroSetup(campaign, unrelatedSkill), {
    ok: false,
    code: "invalid-bonus-skill",
  });
  assert.deepEqual(campaign, createSetupCampaign());

  const ready = createReadyCampaign();
  assert.deepEqual(completeHeroSetup(ready, VALID_SELECTION), {
    ok: false,
    code: "setup-already-complete",
  });
});

test("regional Dungeon movement owns context position, discovery, and outcome", () => {
  const campaign = enterDungeon();
  const snapshot = structuredClone(campaign);
  const context = campaign.foundation?.hero.explorationContext;
  if (!context) throw new Error("Missing context");
  const dungeon = campaign.foundation?.regionalDungeons[context.locationId];
  if (!dungeon) throw new Error("Missing Dungeon");

  const direction = dungeon.tiles[context.cell.y]?.[context.cell.x + 1] === "."
    ? "east"
    : "north";
  const result = moveHeroInDungeon(campaign, direction);

  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.deepEqual(campaign, snapshot);
  assert.deepEqual(
    result.state.foundation?.hero.explorationContext?.cell,
    result.details.destination,
  );
  assert.ok(
    result.state.foundation?.regionalDungeons[context.locationId].discovered
      .length >= dungeon.discovered.length,
  );
});

test("Dungeon movement requires both the regional context and active board", () => {
  const ready = createReadyCampaign();
  assert.deepEqual(moveHeroInDungeon(ready, "east"), {
    ok: false,
    code: "dungeon-board-required",
  });
  const forged = { ...ready, activeBoardId: "dungeon" as const };
  assert.deepEqual(moveHeroInDungeon(forged, "east"), {
    ok: false,
    code: "dungeon-context-required",
  });
});

test("the former Dungeon Heart settlement claim is retired", () => {
  const campaign = enterDungeon();
  const snapshot = structuredClone(campaign);
  assert.deepEqual(claimSettlement(), {
    ok: false,
    code: "operation-retired",
  });
  assert.deepEqual(campaign, snapshot);
  assert.equal(campaign.foundation?.capital.definitionId, "village");
  assert.equal(
    "settlementClaimed" in
      (campaign.foundation?.regionalDungeons["location:regional-dungeon"] ?? {}),
    false,
  );
});

test("board navigation enforces Village-first availability", () => {
  const ready = createReadyCampaign();
  assert.deepEqual(
    BOARD_DESCRIPTORS.map((board) => board.id),
    ["hero", "settlement", "world", "dungeon", "combat", "diplomacy"],
  );
  for (const boardId of ["hero", "settlement", "world"] as const) {
    assert.equal(getBoardAvailability(boardId, ready).available, true);
  }
  assert.equal(getBoardAvailability("dungeon", ready).available, false);
  assert.equal(getBoardAvailability("combat", ready).enabled, false);
  assert.equal(getBoardAvailability("diplomacy", ready).enabled, false);
  assert.deepEqual(navigateToAvailableBoard(ready, "dungeon"), {
    ok: false,
    code: "board-locked",
  });
  assert.deepEqual(navigateToAvailableBoard(ready, "combat"), {
    ok: false,
    code: "board-disabled",
  });

  const world = navigateToAvailableBoard(ready, "world");
  assert.equal(world.ok, true);
  if (!world.ok) return;
  assert.equal(world.state.activeBoardId, "world");
  assert.equal(resolveActiveBoard(ready)?.descriptor.id, "settlement");
});

test("transition and navigation dependencies point away from boards and storage", async () => {
  for (const moduleUrl of [
    new URL("../../src/game/campaignTransitionsV5.ts", import.meta.url),
    new URL("../../src/game/navigationV5.ts", import.meta.url),
    new URL("../../src/game/villageOpening.ts", import.meta.url),
  ]) {
    const source = await readFile(moduleUrl, "utf8");
    assert.doesNotMatch(source, /from\s+["']react(?:\/[^"']*)?["']/);
    assert.doesNotMatch(source, /from\s+["'][^"']*(?:boards|storage)[^"']*["']/);
    assert.doesNotMatch(source, /\b(?:window|localStorage)\b/);
    assert.doesNotMatch(source, /(?:cloudflare|sites-project|\.openai\/hosting)/i);
  }
});
