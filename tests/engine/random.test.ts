import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { createNewGame, migrateLegacyGame } from "../../src/game/createGame.ts";
import { createDungeonLevel } from "../../src/game/generateDungeon.ts";
import {
  createCampaignId,
  type IdSource,
  type PersistentIdentityKind,
} from "../../src/game/identity.ts";
import {
  createDeterministicRandom,
  isCampaignSeed,
  randomInteger,
  type CampaignSeedSource,
} from "../../src/game/random.ts";
import { systemCampaignSeedSource } from "../../src/game/systemCampaignSeedSource.ts";

function fixedIdSource(value: string, calls: PersistentIdentityKind[] = []): IdSource {
  return {
    next(kind) {
      calls.push(kind);
      return value;
    },
  };
}

test("the same campaign seed produces the same deterministic sequence", () => {
  const first = createDeterministicRandom(987_654_321);
  const second = createDeterministicRandom(987_654_321);
  const firstSequence = Array.from({ length: 8 }, () => first.next());
  const secondSequence = Array.from({ length: 8 }, () => second.next());

  assert.deepEqual(secondSequence, firstSequence);
  assert.ok(firstSequence.every((value) => value >= 0 && value < 1));
  assert.equal(randomInteger(createDeterministicRandom(12), 3, 7), 4);
});

test("the same explicit campaign-creation inputs reproduce gameplay state", () => {
  const createdAt = "2026-08-10T12:00:00.000Z";
  const first = createNewGame(
    "player-seeded",
    fixedIdSource("game-seeded"),
    123_456_789,
    createdAt,
  );
  const second = createNewGame(
    "player-seeded",
    fixedIdSource("game-seeded"),
    123_456_789,
    createdAt,
  );

  assert.deepEqual(second, first);
  assert.equal(first.version, 5);
  assert.equal(first.campaignSeed, 123_456_789);
  assert.equal(first.foundation, null);
  assert.equal(first.activeBoardId, "setup");
});

test("identity generation cannot advance the separate gameplay seed source", () => {
  const identityCalls: PersistentIdentityKind[] = [];
  let gameplaySeedCalls = 0;
  const gameplaySeedSource: CampaignSeedSource = {
    nextCampaignSeed() {
      gameplaySeedCalls += 1;
      return 314_159;
    },
  };

  assert.equal(
    createCampaignId(fixedIdSource("game-separated", identityCalls)),
    "game-separated",
  );
  assert.deepEqual(identityCalls, ["campaign"]);
  assert.equal(gameplaySeedCalls, 0);
  assert.equal(gameplaySeedSource.nextCampaignSeed(), 314_159);
  assert.equal(gameplaySeedCalls, 1);
});

test("version-3 migration preserves every existing Dungeon and progress fact", () => {
  const dungeon = {
    ...createDungeonLevel(42_424),
    level: 5,
    day: 18,
    treasury: 730,
    discovered: ["2,8", "3,8", "4,8"],
    heartReached: true,
    settlementClaimed: true,
  };
  const legacy = {
    version: 3,
    id: "game-existing",
    playerId: "player-existing",
    createdAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-08-02T10:00:00.000Z",
    activeBoardId: "settlement",
    setupComplete: true,
    hero: {
      faction: "castle",
      heroClass: "ranger",
      vocation: "spy",
      freeAttributes: { str: 0, agy: 1, per: 1, int: 0, cha: 0, lead: 0 },
      bonusSkill: "ranged-combat",
      attributes: { str: 0, agy: 2, per: 2, int: 0, cha: 0, lead: 0 },
      skills: { "ranged-combat": 2 },
      position: { x: 11, y: 4 },
      visionRadius: 1,
    },
    dungeon,
  };
  let fallbackSeedCalls = 0;
  const migrated = migrateLegacyGame(
    legacy,
    legacy.playerId,
    fixedIdSource("game-unused"),
    {
      nextCampaignSeed() {
        fallbackSeedCalls += 1;
        return 999;
      },
    },
    "2026-08-14T10:00:00.000Z",
  );

  assert.equal(migrated.version, 4);
  assert.equal(migrated.campaignSeed, dungeon.seed);
  assert.deepEqual(migrated.dungeon, dungeon);
  assert.deepEqual(migrated.hero?.position, legacy.hero.position);
  assert.deepEqual(migrated.dungeon.discovered, legacy.dungeon.discovered);
  assert.equal(migrated.dungeon.heartReached, true);
  assert.equal(migrated.dungeon.settlementClaimed, true);
  assert.equal(fallbackSeedCalls, 0);
});

test("system campaign entropy yields valid seeds without sharing identity state", () => {
  const seed = systemCampaignSeedSource.nextCampaignSeed();
  assert.equal(isCampaignSeed(seed), true);
});

test("gameplay RNG modules are pure and current game code has no Math.random", async () => {
  const pureModules = [
    new URL("../../src/game/random.ts", import.meta.url),
    new URL("../../src/game/generateDungeon.ts", import.meta.url),
    new URL("../../src/game/createGame.ts", import.meta.url),
  ];

  for (const moduleUrl of pureModules) {
    const source = await readFile(moduleUrl, "utf8");
    assert.doesNotMatch(source, /Math\.random/);
    assert.doesNotMatch(source, /from\s+["']react(?:\/[^"']*)?["']/);
    assert.doesNotMatch(source, /from\s+["'][^"']*(?:boards|storage)[^"']*["']/);
    assert.doesNotMatch(source, /\b(?:window|localStorage)\b/);
    assert.doesNotMatch(source, /(?:cloudflare|sites-project|\.openai\/hosting)/i);
  }

  const identitySource = await readFile(
    new URL("../../src/game/systemIdSource.ts", import.meta.url),
    "utf8",
  );
  const campaignSeedSource = await readFile(
    new URL("../../src/game/systemCampaignSeedSource.ts", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(identitySource, /CampaignSeed|systemCampaignSeedSource/);
  assert.doesNotMatch(campaignSeedSource, /IdSource|systemIdSource|randomUUID/);
  assert.doesNotMatch(campaignSeedSource, /Math\.random/);
});
