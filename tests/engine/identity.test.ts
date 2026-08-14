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
  createNewGame,
  createPlayerProfile,
  migrateLegacyGame,
} from "../../src/game/createGame.ts";
import { completeHeroSetup } from "../../src/game/transitions.ts";
import { migrateCampaignToV5 } from "../../src/game/campaignMigration.ts";
import { systemIdSource } from "../../src/game/systemIdSource.ts";
import type { CampaignSeedSource } from "../../src/game/random.ts";

const MIGRATION_SEED_SOURCE: CampaignSeedSource = {
  nextCampaignSeed: () => 246_810,
};

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

  const createdAt = "2026-08-14T10:00:00.000Z";
  const player = createPlayerProfile(
    "  The Red Lord  ",
    "red",
    source,
    createdAt,
  );
  const campaign = createNewGame(player.id, source, 123_456, createdAt);

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
    MIGRATION_SEED_SOURCE,
    "2026-08-14T10:00:00.000Z",
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
  const createdAt = "2026-08-14T10:00:00.000Z";
  const player = createPlayerProfile(
    "Regression Lord",
    "blue",
    source,
    createdAt,
  );
  const campaign = createNewGame(player.id, source, 654_321, createdAt);
  const completion = completeHeroSetup(campaign, {
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
  if (!completion.ok) throw new Error(`Setup failed: ${completion.code}`);
  const completed = completion.state;
  const normalized = migrateCampaignToV5(structuredClone(completed), player.id);
  if (!normalized.ok) throw new Error(normalized.message);
  const loaded = normalized.state;

  assert.equal(loaded.id, "game-regression");
  assert.equal(loaded.playerId, "player-regression");
  assert.equal(loaded.foundation !== null, true);
  assert.equal(loaded.activeBoardId, "settlement");
  assert.equal(loaded.foundation?.hero.strategicRegionId, "region:0,0");
  assert.equal(loaded.foundation?.hero.explorationContext, null);
  assert.equal(
    loaded.foundation?.regionalDungeons["location:regional-dungeon"].seed,
    campaign.campaignSeed,
  );
  assert.equal(loaded.campaignSeed, campaign.campaignSeed);
  assert.deepEqual(
    loaded.foundation?.regionalDungeons["location:regional-dungeon"].discovered,
    [],
  );
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
