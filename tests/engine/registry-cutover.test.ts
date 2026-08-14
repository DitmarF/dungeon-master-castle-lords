import assert from "node:assert/strict";
import test from "node:test";

import type {
  CampaignStateV5,
  GameRegistryV2,
  HeroSetupSelection,
  PlayerProfile,
} from "../../src/game/model.ts";
import { MemoryRegistryStorage } from "../../src/game/persistence.ts";
import {
  decodeRegistryV2,
  hydratePreferredRegistryV2,
  persistRegistryV2,
} from "../../src/game/registryCutover.ts";
import { completeVillageFirstHeroSetup } from "../../src/game/villageOpening.ts";
import {
  FIXTURE_PLAYER_ID,
  completedV4CastleFixture,
  completedV4DungeonFixture,
} from "../fixtures/campaignMigrationFixtures.ts";

function profile(): PlayerProfile {
  return {
    id: FIXTURE_PLAYER_ID,
    name: "Migration Lord",
    bannerColor: "rgba(59,130,246,1)",
    createdAt: "2026-08-01T10:00:00.000Z",
    lastPlayedAt: null,
  };
}

function legacyRegistry(campaign: unknown) {
  return {
    version: 1,
    players: [profile()],
    games: { [FIXTURE_PLAYER_ID]: campaign },
    lastActivePlayerId: FIXTURE_PLAYER_ID,
  };
}

const EMPTY_V2: GameRegistryV2 = {
  version: 2,
  players: [],
  games: {},
  lastActivePlayerId: null,
};

const SETUP_SELECTION: HeroSetupSelection = {
  heroClass: "fighter",
  vocation: "general",
  freeAttributes: { str: 2, agy: 0, per: 0, int: 0, cha: 0, lead: 0 },
  bonusSkill: "heavy-blow",
};

function completedVillageCampaign(): CampaignStateV5 {
  const result = completeVillageFirstHeroSetup(
    {
      version: 5,
      id: "game-village-save-reload",
      playerId: FIXTURE_PLAYER_ID,
      campaignSeed: 42,
      createdAt: "2026-08-14T10:00:00.000Z",
      updatedAt: "2026-08-14T10:00:00.000Z",
      activeBoardId: "setup",
      foundation: null,
    },
    SETUP_SELECTION,
  );
  if (!result.ok) throw new Error(`Setup failed: ${result.code}`);
  return result.state;
}

test("verified legacy cutover writes v2 and leaves the original v1 bytes untouched", () => {
  const legacyRaw = JSON.stringify(legacyRegistry(completedV4CastleFixture()));
  const legacy = new MemoryRegistryStorage(legacyRaw);
  const primary = new MemoryRegistryStorage();
  const result = hydratePreferredRegistryV2(primary, legacy, EMPTY_V2);

  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.status, "legacy-cutover");
  assert.equal(result.registry.version, 2);
  assert.equal(result.registry.games[FIXTURE_PLAYER_ID].version, 5);
  assert.equal(legacy.value, legacyRaw);
  assert.equal(legacy.writes, 0);
  assert.equal(primary.value, JSON.stringify(result.registry));
  assert.equal(decodeRegistryV2(primary.value ?? "").ok, true);
});

test("an existing valid v2 registry is preferred without consulting v1", () => {
  const first = hydratePreferredRegistryV2(
    new MemoryRegistryStorage(),
    new MemoryRegistryStorage(
      JSON.stringify(legacyRegistry(completedV4CastleFixture())),
    ),
    EMPTY_V2,
  );
  if (!first.ok) throw new Error(first.failure.message);
  const primary = new MemoryRegistryStorage(JSON.stringify(first.registry));
  const legacy = new MemoryRegistryStorage("{not-read");
  const loaded = hydratePreferredRegistryV2(primary, legacy, EMPTY_V2);

  assert.equal(loaded.ok, true);
  if (!loaded.ok) return;
  assert.equal(loaded.status, "loaded");
  assert.equal(legacy.reads, 0);
  assert.equal(primary.writes, 0);
});

test("incompatible Dungeon campaigns are isolated without creating a v2 payload", () => {
  const legacyRaw = JSON.stringify(legacyRegistry(completedV4DungeonFixture()));
  const legacy = new MemoryRegistryStorage(legacyRaw);
  const primary = new MemoryRegistryStorage();
  const result = hydratePreferredRegistryV2(primary, legacy, EMPTY_V2);

  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.status, "loaded-with-campaign-errors");
  assert.deepEqual(result.registry.games, {});
  assert.deepEqual(result.campaignIssues, [
    {
      playerId: FIXTURE_PLAYER_ID,
      failure: {
        code: "incompatible-legacy-campaign",
        message:
          "A Dungeon-faction campaign cannot be converted into a Castle campaign. The original save was kept.",
      },
    },
  ]);
  assert.equal(primary.value, null);
  assert.equal(primary.writes, 0);
  assert.equal(legacy.value, legacyRaw);
  assert.equal(legacy.writes, 0);
});

test("an explicit fresh Castle replacement verifies v2 while retaining legacy bytes", () => {
  const legacyRaw = JSON.stringify(legacyRegistry(completedV4DungeonFixture()));
  const legacy = new MemoryRegistryStorage(legacyRaw);
  const primary = new MemoryRegistryStorage();
  const hydrated = hydratePreferredRegistryV2(primary, legacy, EMPTY_V2);
  assert.equal(hydrated.ok, true);
  if (!hydrated.ok) return;
  const freshCampaign = {
    version: 5,
    id: "game-fresh-castle-replacement",
    playerId: FIXTURE_PLAYER_ID,
    campaignSeed: 17,
    createdAt: "2026-08-14T12:00:00.000Z",
    updatedAt: "2026-08-14T12:00:00.000Z",
    activeBoardId: "setup",
    foundation: null,
  } as const;
  const registry: GameRegistryV2 = {
    ...hydrated.registry,
    games: { [FIXTURE_PLAYER_ID]: freshCampaign },
  };
  const result = persistRegistryV2(primary, registry);

  assert.deepEqual(result, { ok: true });
  assert.equal(primary.value, JSON.stringify(registry));
  assert.equal(decodeRegistryV2(primary.value ?? "").ok, true);
  assert.equal(legacy.value, legacyRaw);
  assert.equal(legacy.writes, 0);
});

test("a malformed campaign is isolated while unaffected profiles remain loadable", () => {
  const validPlayer = profile();
  const invalidPlayer: PlayerProfile = {
    ...profile(),
    id: "player-invalid-campaign",
    name: "Broken Lord",
  };
  const validCampaign = completedVillageCampaign();
  const malformedCampaign = structuredClone(validCampaign) as unknown as {
    playerId: string;
    foundation: { world: { locations: unknown[] } };
  };
  malformedCampaign.playerId = invalidPlayer.id;
  malformedCampaign.foundation.world.locations[0] = null;
  const raw = JSON.stringify({
    version: 2,
    players: [validPlayer, invalidPlayer],
    games: {
      [validPlayer.id]: validCampaign,
      [invalidPlayer.id]: malformedCampaign,
    },
    lastActivePlayerId: validPlayer.id,
  });
  const primary = new MemoryRegistryStorage(raw);
  const result = hydratePreferredRegistryV2(
    primary,
    new MemoryRegistryStorage(),
    EMPTY_V2,
  );

  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.status, "loaded-with-campaign-errors");
  assert.deepEqual(Object.keys(result.registry.games), [validPlayer.id]);
  assert.deepEqual(result.registry.games[validPlayer.id], validCampaign);
  assert.deepEqual(result.campaignIssues.map((issue) => issue.playerId), [
    invalidPlayer.id,
  ]);
  assert.equal(result.campaignIssues[0].failure.code, "campaign-validation-failed");
  assert.equal(primary.value, raw);
  assert.equal(primary.writes, 0);
});

test("verified persistence rejects a registry that cannot be decoded", () => {
  const invalidRegistry = {
    version: 2,
    players: [],
    games: { "player-orphan": {} },
    lastActivePlayerId: null,
  } as unknown as GameRegistryV2;
  const primary = new MemoryRegistryStorage();
  const result = persistRegistryV2(primary, invalidRegistry);

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.failure.code, "registry-validation-failed");
  }
  assert.equal(primary.value, null);
  assert.equal(primary.writes, 0);
});

test("explicit unreadable-registry reset verifies an empty v2 replacement", () => {
  const primary = new MemoryRegistryStorage("{malformed-v2");
  const legacyRaw = JSON.stringify(legacyRegistry(completedV4CastleFixture()));
  const legacy = new MemoryRegistryStorage(legacyRaw);
  const result = persistRegistryV2(primary, EMPTY_V2);

  assert.deepEqual(result, { ok: true });
  assert.equal(primary.value, JSON.stringify(EMPTY_V2));
  assert.equal(decodeRegistryV2(primary.value ?? "").ok, true);
  assert.equal(legacy.value, legacyRaw);
  assert.equal(legacy.writes, 0);
});

test("failed v2 write verification preserves both previous primary and legacy source", () => {
  const legacyRaw = JSON.stringify(legacyRegistry(completedV4CastleFixture()));
  const legacy = new MemoryRegistryStorage(legacyRaw);
  const primary = new MemoryRegistryStorage();
  primary.verificationOverride = "mismatch";
  const result = hydratePreferredRegistryV2(primary, legacy, EMPTY_V2);

  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.failure.code, "verification-failed");
  assert.equal(primary.value, null);
  assert.equal(legacy.value, legacyRaw);
  assert.equal(legacy.writes, 0);
});

test("a completed Village-first Setup survives verified v2 save and reload", () => {
  const campaign = completedVillageCampaign();
  const registry: GameRegistryV2 = {
    version: 2,
    players: [profile()],
    games: { [FIXTURE_PLAYER_ID]: campaign },
    lastActivePlayerId: FIXTURE_PLAYER_ID,
  };
  const primary = new MemoryRegistryStorage();

  assert.deepEqual(persistRegistryV2(primary, registry), { ok: true });
  const reloaded = hydratePreferredRegistryV2(
    primary,
    new MemoryRegistryStorage("{must-not-be-read"),
    EMPTY_V2,
  );

  assert.equal(reloaded.ok, true);
  if (!reloaded.ok) return;
  assert.equal(reloaded.status, "loaded");
  assert.deepEqual(reloaded.registry.games[FIXTURE_PLAYER_ID], campaign);
  assert.equal(
    reloaded.registry.games[FIXTURE_PLAYER_ID].foundation?.world.regions.length,
    7,
  );
});
