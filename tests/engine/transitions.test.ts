import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import type {
  CampaignState,
  HeroSetupSelection,
} from "../../src/game/campaignState.ts";
import { createDungeonLevel } from "../../src/game/generateDungeon.ts";
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

const VALID_SELECTION: HeroSetupSelection = {
  faction: "dungeon",
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
    version: 3,
    id: "game-transitions",
    playerId: "player-transitions",
    createdAt: "2026-08-10T10:00:00.000Z",
    updatedAt: "2026-08-10T10:00:00.000Z",
    activeBoardId: "setup",
    setupComplete: false,
    hero: null,
    dungeon: {
      ...createDungeonLevel(1_234),
      grid: { columns: 5, rows: 3 },
      rooms: [{ id: 1, x: 1, y: 1, width: 3, height: 1 }],
      tiles: ["#####", "#...#", "#####"],
      start: { x: 1, y: 1 },
      heart: { x: 3, y: 1 },
      discovered: [],
      heartReached: false,
      settlementClaimed: false,
    },
  };
}

function createReadyCampaign(): CampaignState {
  const result = completeHeroSetup(createSetupCampaign(), VALID_SELECTION);
  if (!result.ok) throw new Error(`Setup failed: ${result.code}`);
  return result.state;
}

test("legal Hero Setup completes through one validated pure transition", () => {
  const campaign = createSetupCampaign();
  const snapshot = structuredClone(campaign);
  const result = completeHeroSetup(campaign, VALID_SELECTION);

  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.deepEqual(campaign, snapshot);
  assert.equal(result.state.setupComplete, true);
  assert.equal(result.state.activeBoardId, "dungeon");
  assert.deepEqual(result.state.hero?.attributes, {
    str: 3,
    agy: 0,
    per: 0,
    int: 0,
    cha: 0,
    lead: 1,
  });
  assert.equal(result.state.hero?.skills["close-combat"], 1);
  assert.equal(result.state.hero?.skills.tactics, 1);
  assert.equal(result.state.hero?.skills["heavy-blow"], 1);
  assert.deepEqual(result.state.hero?.position, campaign.dungeon.start);
  assert.ok(result.state.dungeon.discovered.includes("1,1"));
  assert.equal(result.state.updatedAt, campaign.updatedAt);
});

test("Hero Setup rejects invalid existing constraints without changing state", () => {
  const campaign = createSetupCampaign();
  const onePoint = {
    ...VALID_SELECTION,
    freeAttributes: { ...VALID_SELECTION.freeAttributes, str: 1 },
  };
  const unrelatedSkill = {
    ...VALID_SELECTION,
    bonusSkill: "ranged-combat" as const,
  };
  const lockedSkill = {
    ...VALID_SELECTION,
    bonusSkill: "cleaving-strike" as const,
  };

  assert.deepEqual(validateHeroSetupSelection(onePoint), {
    ok: false,
    code: "invalid-attributes",
  });
  assert.deepEqual(completeHeroSetup(campaign, unrelatedSkill), {
    ok: false,
    code: "invalid-bonus-skill",
  });
  assert.deepEqual(completeHeroSetup(campaign, lockedSkill), {
    ok: false,
    code: "invalid-bonus-skill",
  });
  assert.deepEqual(campaign, createSetupCampaign());
});

test("Dungeon movement owns destination, discovery, and deterministic result", () => {
  const campaign = createReadyCampaign();
  const snapshot = structuredClone(campaign);
  const result = moveHeroInDungeon(campaign, "east");

  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.deepEqual(campaign, snapshot);
  assert.deepEqual(result.details.destination, { x: 2, y: 1 });
  assert.deepEqual(result.state.hero?.position, { x: 2, y: 1 });
  assert.deepEqual(result.details.newlyDiscovered, ["3,0", "3,1", "3,2"]);
  assert.ok(result.state.dungeon.discovered.includes("3,1"));
  assert.equal(result.details.reachedHeart, false);
  assert.equal(result.state.dungeon.heartReached, false);
});

test("blocked Dungeon movement is rejected without a campaign transition", () => {
  const campaign = createReadyCampaign();

  assert.deepEqual(moveHeroInDungeon(campaign, "north"), {
    ok: false,
    code: "blocked",
  });
  assert.deepEqual(campaign.hero?.position, { x: 1, y: 1 });
});

test("moving onto the Dungeon Heart records the historical reach outcome", () => {
  const first = moveHeroInDungeon(createReadyCampaign(), "east");
  if (!first.ok) throw new Error(`First move failed: ${first.code}`);
  const second = moveHeroInDungeon(first.state, "east");

  assert.equal(second.ok, true);
  if (!second.ok) return;
  assert.equal(second.details.reachedHeart, true);
  assert.deepEqual(second.state.hero?.position, { x: 3, y: 1 });
  assert.equal(second.state.dungeon.heartReached, true);
});

test("Settlement claim rejects a premature request and applies the legal consequence", () => {
  const ready = createReadyCampaign();
  assert.deepEqual(claimSettlement(ready), {
    ok: false,
    code: "dungeon-heart-not-reached",
  });

  const first = moveHeroInDungeon(ready, "east");
  if (!first.ok) throw new Error(`First move failed: ${first.code}`);
  const second = moveHeroInDungeon(first.state, "east");
  if (!second.ok) throw new Error(`Second move failed: ${second.code}`);
  const claimed = claimSettlement(second.state);

  assert.equal(claimed.ok, true);
  if (!claimed.ok) return;
  assert.equal(claimed.state.dungeon.settlementClaimed, true);
  assert.equal(claimed.state.activeBoardId, "settlement");
  assert.equal(claimed.details.boardId, "settlement");
});

test("board navigation uses the pure registered/enabled/unlocked policy", () => {
  const ready = createReadyCampaign();
  assert.deepEqual(
    BOARD_DESCRIPTORS.map((board) => board.id),
    ["hero", "settlement", "world", "dungeon", "combat", "diplomacy"],
  );
  assert.deepEqual(
    getBoardAvailability("settlement", ready),
    {
      registered: true,
      enabled: true,
      unlocked: false,
      active: false,
      available: false,
      descriptor: BOARD_DESCRIPTORS[1],
    },
  );
  assert.deepEqual(navigateToAvailableBoard(ready, "settlement"), {
    ok: false,
    code: "board-locked",
  });
  assert.deepEqual(navigateToAvailableBoard(ready, "setup"), {
    ok: false,
    code: "board-not-registered",
  });

  const world = navigateToAvailableBoard(ready, "world");
  assert.equal(world.ok, true);
  if (!world.ok) return;
  assert.equal(world.state.activeBoardId, "world");

  const invalidActive = { ...ready, activeBoardId: "settlement" as const };
  const resolution = resolveActiveBoard(invalidActive);
  assert.equal(resolution?.usedFallback, true);
  assert.equal(resolution?.descriptor.id, "hero");
});

test("transition and application navigation dependencies point away from boards", async () => {
  for (const moduleUrl of [
    new URL("../../src/game/navigation.ts", import.meta.url),
    new URL("../../src/game/transitions.ts", import.meta.url),
  ]) {
    const source = await readFile(moduleUrl, "utf8");
    assert.doesNotMatch(source, /from\s+["']react(?:\/[^"']*)?["']/);
    assert.doesNotMatch(source, /from\s+["'][^"']*(?:boards|storage)[^"']*["']/);
    assert.doesNotMatch(source, /\b(?:window|localStorage)\b/);
    assert.doesNotMatch(source, /(?:cloudflare|sites-project|\.openai\/hosting)/i);
  }

  const provider = await readFile(
    new URL("../../src/game/GameProvider.tsx", import.meta.url),
    "utf8",
  );
  const sharedNavigation = await readFile(
    new URL("../../src/ui/BoardNavigation.tsx", import.meta.url),
    "utf8",
  );
  const setupBoard = await readFile(
    new URL("../../src/boards/SetupBoard.tsx", import.meta.url),
    "utf8",
  );
  const dungeonBoard = await readFile(
    new URL("../../src/boards/DungeonBoard.tsx", import.meta.url),
    "utf8",
  );

  assert.doesNotMatch(provider, /from\s+["'][^"']*boards[^"']*["']/);
  assert.doesNotMatch(sharedNavigation, /from\s+["'][^"']*boards[^"']*["']/);
  assert.doesNotMatch(setupBoard, /\bupdateGame\b/);
  assert.doesNotMatch(dungeonBoard, /\bupdateGame\b/);
  assert.doesNotMatch(dungeonBoard, /\b(?:isWalkable|discoverAround)\b/);
});
