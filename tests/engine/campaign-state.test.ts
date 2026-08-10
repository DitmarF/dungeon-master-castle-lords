import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import type {
  CampaignState,
  GameSave,
  HeroAttributes,
} from "../../src/game/campaignState.ts";
import { migrateLegacyGame } from "../../src/game/createGame.ts";
import { createDungeonLevel } from "../../src/game/generateDungeon.ts";
import { ALL_SKILLS } from "../../src/game/skillTrees.ts";

const ZERO_ATTRIBUTES: HeroAttributes = {
  str: 0,
  agy: 0,
  per: 0,
  int: 0,
  cha: 0,
  lead: 0,
};

function createCampaignState(): CampaignState {
  return {
    version: 3,
    id: "game-fixture",
    playerId: "player-fixture",
    createdAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-08-01T11:00:00.000Z",
    activeBoardId: "setup",
    setupComplete: false,
    hero: null,
    dungeon: createDungeonLevel(1_234_567),
  };
}

test("CampaignState is the exact version-3 campaign boundary", () => {
  const campaign = createCampaignState();
  const compatibleSave: GameSave = campaign;

  assert.strictEqual(compatibleSave, campaign);
  assert.deepEqual(Object.keys(campaign).sort(), [
    "activeBoardId",
    "createdAt",
    "dungeon",
    "hero",
    "id",
    "playerId",
    "setupComplete",
    "updatedAt",
    "version",
  ]);
  assert.equal(campaign.version, 3);
  assert.equal("players" in campaign, false);
  assert.equal("hydrated" in campaign, false);
  assert.equal("theme" in campaign, false);
  assert.equal("world" in campaign, false);
  assert.equal("combat" in campaign, false);
  assert.equal("events" in campaign, false);
});

test("an existing version-3 campaign without a hero remains structurally unchanged", () => {
  const campaign = createCampaignState();

  assert.deepEqual(
    migrateLegacyGame(structuredClone(campaign), campaign.playerId),
    campaign,
  );
});

test("version-2 and version-3 hero saves retain facts while snapshots normalize", () => {
  const dungeon = {
    ...createDungeonLevel(42),
    level: 3,
    day: 9,
    treasury: 275,
    discovered: ["1,1", "2,1", "2,2"],
    heartReached: true,
    settlementClaimed: true,
  };
  const legacy = {
    version: 2,
    id: "game-legacy",
    playerId: "player-legacy",
    createdAt: "2026-07-01T10:00:00.000Z",
    updatedAt: "2026-07-02T11:00:00.000Z",
    activeBoardId: "settlement",
    setupComplete: true,
    hero: {
      faction: "castle",
      heroClass: "fighter",
      vocation: "diplomat",
      freeAttributes: { ...ZERO_ATTRIBUTES, str: 2 },
      bonusSkill: "removed-skill",
      attributes: { ...ZERO_ATTRIBUTES, int: 99 },
      skills: {
        "close-combat": 2.8,
        "heavy-blow": 1,
        "removed-skill": 9,
      },
      position: { x: 17, y: 8 },
      visionRadius: 1,
    },
    dungeon,
  };

  for (const version of [2, 3]) {
    const migrated = migrateLegacyGame(
      { ...legacy, version },
      "player-fallback",
    );

    assert.equal(migrated.version, 3);
    assert.equal(migrated.id, legacy.id);
    assert.equal(migrated.playerId, legacy.playerId);
    assert.equal(migrated.createdAt, legacy.createdAt);
    assert.equal(migrated.updatedAt, legacy.updatedAt);
    assert.equal(migrated.activeBoardId, legacy.activeBoardId);
    assert.equal(migrated.setupComplete, true);
    assert.deepEqual(migrated.dungeon, dungeon);
    assert.deepEqual(migrated.hero?.position, legacy.hero.position);
    assert.equal(migrated.hero?.visionRadius, legacy.hero.visionRadius);
    assert.equal(migrated.hero?.bonusSkill, "close-combat");
    assert.deepEqual(migrated.hero?.attributes, {
      ...ZERO_ATTRIBUTES,
      str: 3,
      cha: 1,
    });
    assert.equal(
      Object.keys(migrated.hero?.skills ?? {}).length,
      ALL_SKILLS.length,
    );
    assert.equal(migrated.hero?.skills["close-combat"], 2);
    assert.equal(migrated.hero?.skills["heavy-blow"], 1);
    assert.equal("removed-skill" in (migrated.hero?.skills ?? {}), false);
  }
});

test("dungeon generation is deterministic when given an explicit seed", () => {
  const first = createDungeonLevel(987_654_321);
  const second = createDungeonLevel(987_654_321);
  const different = createDungeonLevel(987_654_322);

  assert.deepEqual(second, first);
  assert.notDeepEqual(different.rooms, first.rooms);
  assert.equal(first.seed, 987_654_321);
  assert.equal(first.tiles.length, first.grid.rows);
  assert.ok(first.tiles.every((row) => row.length === first.grid.columns));
});

test("tested engine modules stay independent from UI, browser, and platform code", async () => {
  const moduleUrls = [
    new URL("../../src/game/campaignState.ts", import.meta.url),
    new URL("../../src/game/createGame.ts", import.meta.url),
    new URL("../../src/game/generateDungeon.ts", import.meta.url),
    new URL("../../src/game/skillTrees.ts", import.meta.url),
  ];

  for (const moduleUrl of moduleUrls) {
    const source = await readFile(moduleUrl, "utf8");
    assert.doesNotMatch(source, /from\s+["']react(?:\/[^"']*)?["']/);
    assert.doesNotMatch(source, /from\s+["'][^"']*(?:boards|storage)[^"']*["']/);
    assert.doesNotMatch(source, /\b(?:window|localStorage)\b/);
    assert.doesNotMatch(source, /(?:cloudflare|sites-project|\.openai\/hosting)/i);
  }
});
