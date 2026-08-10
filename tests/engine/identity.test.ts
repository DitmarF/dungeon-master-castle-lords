import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  createCampaignId,
  createCellKey,
  createPlayerId,
  isCampaignId,
  isCellKey,
  isPlayerId,
  type IdSource,
  type PersistentIdentityKind,
} from "../../src/game/identity.ts";
import {
  completeGameSetup,
  createNewGame,
  createPlayerProfile,
  migrateLegacyGame,
} from "../../src/game/createGame.ts";
import { systemIdSource } from "../../src/game/systemIdSource.ts";

function sequenceIdSource(
  values: Record<PersistentIdentityKind, string[]>,
  calls: PersistentIdentityKind[] = [],
): IdSource {
  return {
    next(kind) {
      calls.push(kind);
      const value = values[kind].shift();
      if (!value) throw new Error(`Missing test ${kind} ID.`);
      return value;
    },
  };
}

test("current persistent ID categories keep their established prefixes", () => {
  const calls: PersistentIdentityKind[] = [];
  const source = sequenceIdSource(
    {
      player: ["player-local-lord"],
      campaign: ["game-first-campaign"],
    },
    calls,
  );

  assert.equal(createPlayerId(source), "player-local-lord");
  assert.equal(createCampaignId(source), "game-first-campaign");
  assert.deepEqual(calls, ["player", "campaign"]);
});

test("identity narrowing rejects content IDs, labels, and spatial keys", () => {
  assert.equal(isPlayerId("player-550e8400-e29b-41d4-a716-446655440000"), true);
  assert.equal(isCampaignId("game-550e8400-e29b-41d4-a716-446655440000"), true);
  assert.equal(isPlayerId("close-combat"), false);
  assert.equal(isCampaignId("dungeon"), false);
  assert.equal(isPlayerId("Player-The Red Lord"), false);
  assert.equal(isCampaignId("3,4"), false);
  assert.equal(isCellKey("3,4"), true);
  assert.equal(isCellKey("game-3-4"), false);
  assert.equal(createCellKey(3, 4), "3,4");
  assert.throws(() => createCellKey(1.5, 4), /integer coordinates/);
});

test("new ID creation rejects malformed identity-source output", () => {
  const invalidPlayerSource: IdSource = {
    next: () => "player-Display Label",
  };
  const invalidCampaignSource: IdSource = {
    next: () => "campaign-new-game",
  };

  assert.throws(
    () => createPlayerId(invalidPlayerSource),
    /invalid player ID/,
  );
  assert.throws(
    () => createCampaignId(invalidCampaignSource),
    /invalid campaign ID/,
  );
});

test("current profile and campaign creation consume only their ID categories", () => {
  const calls: PersistentIdentityKind[] = [];
  const source = sequenceIdSource(
    {
      player: ["player-created-profile"],
      campaign: ["game-created-campaign"],
    },
    calls,
  );

  const player = createPlayerProfile("  The Red Lord  ", "red", source);
  const campaign = createNewGame(player.id, source);

  assert.equal(player.id, "player-created-profile");
  assert.equal(player.name, "The Red Lord");
  assert.equal(campaign.id, "game-created-campaign");
  assert.equal(campaign.playerId, player.id);
  assert.deepEqual(calls, ["player", "campaign"]);
});

test("legacy migration preserves existing identity strings without rewriting", () => {
  const source = sequenceIdSource({
    player: ["player-unused"],
    campaign: ["game-migration-fallback"],
  });
  const migrated = migrateLegacyGame(
    {
      id: "Legacy Campaign Label",
      playerId: "Legacy Owner Label",
      dungeon: { level: 4, day: 12, treasury: 320 },
    },
    "player-registry-fallback",
    source,
  );

  assert.equal(migrated.id, "Legacy Campaign Label");
  assert.equal(migrated.playerId, "Legacy Owner Label");
  assert.equal(migrated.dungeon.level, 4);
  assert.equal(migrated.dungeon.day, 12);
  assert.equal(migrated.dungeon.treasury, 320);
});

test("identity injection preserves the current creation, setup, and load flow", () => {
  const source = sequenceIdSource({
    player: ["player-regression"],
    campaign: ["game-regression"],
  });
  const player = createPlayerProfile("Regression Lord", "blue", source);
  const campaign = createNewGame(player.id, source);
  const completed = completeGameSetup(campaign, {
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
    bonusSkill: "close-combat",
  });
  const loaded = migrateLegacyGame(
    structuredClone(completed),
    player.id,
    sequenceIdSource({
      player: ["player-unused"],
      campaign: ["game-unused"],
    }),
  );

  assert.equal(loaded.id, "game-regression");
  assert.equal(loaded.playerId, "player-regression");
  assert.equal(loaded.setupComplete, true);
  assert.equal(loaded.activeBoardId, "dungeon");
  assert.deepEqual(loaded.hero?.position, loaded.dungeon.start);
  assert.deepEqual(loaded.dungeon.tiles, campaign.dungeon.tiles);
  assert.equal(loaded.dungeon.seed, campaign.dungeon.seed);
  assert.ok(loaded.dungeon.discovered.length > 0);
});

test("the system source uses crypto identity entropy with no gameplay RNG dependency", async () => {
  const playerId = createPlayerId(systemIdSource);
  const campaignId = createCampaignId(systemIdSource);

  assert.equal(isPlayerId(playerId), true);
  assert.equal(isCampaignId(campaignId), true);

  for (const moduleUrl of [
    new URL("../../src/game/identity.ts", import.meta.url),
    new URL("../../src/game/systemIdSource.ts", import.meta.url),
  ]) {
    const source = await readFile(moduleUrl, "utf8");
    assert.doesNotMatch(source, /Math\.random/);
    assert.doesNotMatch(source, /generateDungeon/);
    assert.doesNotMatch(source, /(?:window|localStorage|cloudflare|sites-project)/i);
  }
});
