import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import type { CampaignState } from "../../src/game/campaignState.ts";
import { createNewGame, createPlayerProfile } from "../../src/game/createGame.ts";
import { createDungeonLevel } from "../../src/game/generateDungeon.ts";
import type { IdSource } from "../../src/game/identity.ts";
import {
  activateCampaign,
  removePlayerAndCampaign,
  selectPlayerInRegistry,
  stampCampaignModification,
} from "../../src/game/lifecycle.ts";
import type { GameRegistry } from "../../src/game/model.ts";
import {
  commitRequiredRegistryChange,
  hydrateRegistry,
  MemoryRegistryStorage,
  persistRegistry,
} from "../../src/game/persistence.ts";

const CREATED_AT = "2026-08-14T10:00:00.000Z";
const ACTIVITY_AT = "2026-08-14T11:00:00.000Z";
const MODIFIED_AT = "2026-08-14T12:00:00.000Z";

function idSource(playerId = "player-persistence", gameId = "game-persistence"): IdSource {
  return {
    next(kind) {
      return kind === "player" ? playerId : gameId;
    },
  };
}

function createRegistry(): GameRegistry {
  const source = idSource();
  const player = createPlayerProfile(
    "Persistent Lord",
    "rgba(59,130,246,1)",
    source,
    CREATED_AT,
  );
  const game = createNewGame(player.id, source, 123_456, CREATED_AT);
  return {
    version: 1,
    players: [player],
    games: { [player.id]: game },
    lastActivePlayerId: player.id,
  };
}

const passthroughMigration = {
  migrateGame(value: unknown): CampaignState {
    return structuredClone(value) as CampaignState;
  },
};

test("successful registry read returns validated campaign data", () => {
  const registry = createRegistry();
  const adapter = new MemoryRegistryStorage(JSON.stringify(registry));
  const result = hydrateRegistry(adapter, passthroughMigration, {
    version: 1,
    players: [],
    games: {},
    lastActivePlayerId: null,
  });

  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.status, "loaded");
  assert.deepEqual(result.registry, registry);
  assert.equal(adapter.writes, 0);
});

test("legitimate empty storage is distinct from a failed read", () => {
  const adapter = new MemoryRegistryStorage();
  const emptyRegistry: GameRegistry = {
    version: 1,
    players: [],
    games: {},
    lastActivePlayerId: null,
  };
  const result = hydrateRegistry(adapter, passthroughMigration, emptyRegistry);

  assert.deepEqual(result, {
    ok: true,
    status: "empty",
    registry: emptyRegistry,
  });
  assert.equal(adapter.writes, 0);

  adapter.readFailure = "storage-unavailable";
  assert.deepEqual(hydrateRegistry(adapter, passthroughMigration, emptyRegistry), {
    ok: false,
    failure: {
      code: "storage-unavailable",
      message:
        "Local campaign storage is unavailable. Your saved data was not changed.",
    },
  });
});

test("malformed JSON is reported and never followed by a destructive write", () => {
  const raw = "{not-json";
  const adapter = new MemoryRegistryStorage(raw);
  const result = hydrateRegistry(adapter, passthroughMigration, createRegistry());

  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.failure.code, "parse-failed");
  assert.equal(adapter.value, raw);
  assert.equal(adapter.writes, 0);
  assert.equal(adapter.removals, 0);
});

test("invalid registry and invalid campaign have separate outcomes", () => {
  const invalidRegistry = new MemoryRegistryStorage(
    JSON.stringify({ version: 1, players: "invalid", games: {} }),
  );
  const registryResult = hydrateRegistry(
    invalidRegistry,
    passthroughMigration,
    createRegistry(),
  );
  assert.equal(registryResult.ok, false);
  if (!registryResult.ok) {
    assert.equal(registryResult.failure.code, "registry-validation-failed");
  }

  const invalidCampaign = createRegistry();
  invalidCampaign.games["player-persistence"] = {
    ...invalidCampaign.games["player-persistence"],
    dungeon: {
      ...createDungeonLevel(123_456),
      tiles: ["invalid"],
    },
  };
  const campaignAdapter = new MemoryRegistryStorage(
    JSON.stringify(invalidCampaign),
  );
  const campaignResult = hydrateRegistry(
    campaignAdapter,
    passthroughMigration,
    createRegistry(),
  );
  assert.equal(campaignResult.ok, false);
  if (!campaignResult.ok) {
    assert.equal(campaignResult.failure.code, "campaign-validation-failed");
  }
  assert.equal(campaignAdapter.writes, 0);
});

test("migration errors are handed off without replacing the source", () => {
  const raw = JSON.stringify(createRegistry());
  const adapter = new MemoryRegistryStorage(raw);
  const result = hydrateRegistry(
    adapter,
    {
      migrateGame() {
        throw new Error("test-only migration failure");
      },
    },
    createRegistry(),
  );

  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.failure.code, "migration-failed");
  assert.equal(adapter.value, raw);
  assert.equal(adapter.writes, 0);
});

test("manual Save succeeds only after verification and changes no timestamps", () => {
  const registry = createRegistry();
  const snapshot = structuredClone(registry);
  const adapter = new MemoryRegistryStorage(JSON.stringify(registry));
  const result = persistRegistry(adapter, registry);

  assert.deepEqual(result, { ok: true });
  assert.deepEqual(registry, snapshot);
  assert.equal(adapter.value, JSON.stringify(registry));
  assert.equal(adapter.writes, 1);
  assert.equal(adapter.reads, 2);
});

test("manual Save and autosave failures preserve the previous durable payload", () => {
  for (const code of ["write-failed", "quota-exceeded"] as const) {
    const oldRegistry = createRegistry();
    const raw = JSON.stringify(oldRegistry);
    const adapter = new MemoryRegistryStorage(raw);
    adapter.writeFailure = code;
    const candidate = {
      ...oldRegistry,
      lastActivePlayerId: null,
    };
    const result = persistRegistry(adapter, candidate);

    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.failure.code, code);
    assert.equal(adapter.value, raw);
  }
});

test("serialization failure does not attempt a write", () => {
  const registry = createRegistry();
  const cyclic = registry as GameRegistry & { cycle?: unknown };
  cyclic.cycle = cyclic;
  const adapter = new MemoryRegistryStorage(JSON.stringify(createRegistry()));
  const result = persistRegistry(adapter, cyclic);

  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.failure.code, "serialization-failed");
  assert.equal(adapter.writes, 0);
});

test("failed verification rolls back the previous payload", () => {
  const registry = createRegistry();
  const previous = JSON.stringify(registry);
  const adapter = new MemoryRegistryStorage(previous);
  adapter.verificationOverride = "mismatched-readback";
  const candidate = { ...registry, lastActivePlayerId: null };
  const result = persistRegistry(adapter, candidate);

  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.failure.code, "verification-failed");
  assert.equal(adapter.value, previous);
  assert.equal(adapter.writes, 2);
});

test("created, modified, and profile-activity timestamps stay separate", () => {
  const registry = createRegistry();
  const playerId = registry.players[0].id;
  const game = registry.games[playerId];

  const activated = activateCampaign(
    registry,
    playerId,
    game,
    ACTIVITY_AT,
  );
  assert.equal(activated.players[0].lastPlayedAt, ACTIVITY_AT);
  assert.equal(activated.games[playerId].createdAt, CREATED_AT);
  assert.equal(activated.games[playerId].updatedAt, CREATED_AT);

  const selected = selectPlayerInRegistry(activated, playerId);
  assert.equal(selected.players[0].lastPlayedAt, ACTIVITY_AT);
  assert.equal(selected.games[playerId].updatedAt, CREATED_AT);

  const modified = stampCampaignModification(game, MODIFIED_AT);
  assert.equal(modified.createdAt, CREATED_AT);
  assert.equal(modified.updatedAt, MODIFIED_AT);

  const adapter = new MemoryRegistryStorage(JSON.stringify(activated));
  assert.deepEqual(persistRegistry(adapter, activated), { ok: true });
  assert.equal(activated.games[playerId].updatedAt, CREATED_AT);
  assert.equal(activated.players[0].lastPlayedAt, ACTIVITY_AT);
});

test("one campaign per profile replacement and confirmed deletion are atomic", () => {
  const current = createRegistry();
  const playerId = current.players[0].id;
  const replacement = createNewGame(
    playerId,
    idSource("player-unused", "game-replacement"),
    987_654,
    ACTIVITY_AT,
  );
  const replacementRegistry = activateCampaign(
    current,
    playerId,
    replacement,
    ACTIVITY_AT,
  );
  assert.deepEqual(Object.keys(replacementRegistry.games), [playerId]);
  assert.equal(replacementRegistry.games[playerId].id, "game-replacement");

  const failingAdapter = new MemoryRegistryStorage(JSON.stringify(current));
  failingAdapter.writeFailure = "quota-exceeded";
  const failedReplacement = commitRequiredRegistryChange(
    failingAdapter,
    current,
    replacementRegistry,
  );
  assert.equal(failedReplacement.ok, false);
  assert.deepEqual(failedReplacement.registry, current);
  assert.equal(failingAdapter.value, JSON.stringify(current));

  const deletion = removePlayerAndCampaign(current, playerId);
  const failedDeletion = commitRequiredRegistryChange(
    failingAdapter,
    current,
    deletion,
  );
  assert.equal(failedDeletion.ok, false);
  assert.deepEqual(failedDeletion.registry, current);

  const successfulAdapter = new MemoryRegistryStorage(JSON.stringify(current));
  const successfulDeletion = commitRequiredRegistryChange(
    successfulAdapter,
    current,
    deletion,
  );
  assert.equal(successfulDeletion.ok, true);
  assert.deepEqual(successfulDeletion.registry.players, []);
  assert.deepEqual(successfulDeletion.registry.games, {});
});

test("persistence and lifecycle modules stay independent from React and browser APIs", async () => {
  for (const moduleUrl of [
    new URL("../../src/game/clock.ts", import.meta.url),
    new URL("../../src/game/lifecycle.ts", import.meta.url),
    new URL("../../src/game/persistence.ts", import.meta.url),
  ]) {
    const source = await readFile(moduleUrl, "utf8");
    assert.doesNotMatch(source, /from\s+["']react(?:\/[^"']*)?["']/);
    assert.doesNotMatch(source, /\b(?:window|localStorage)\b/);
    assert.doesNotMatch(source, /(?:cloudflare|sites-project|\.openai\/hosting)/i);
  }
});

test("the provider uses the injected clock and explicit verified writes", async () => {
  const source = await readFile(
    new URL("../../src/game/GameProvider.tsx", import.meta.url),
    "utf8",
  );

  assert.doesNotMatch(source, /new Date\(|Date\.now\(/);
  assert.match(source, /clock = systemClock/);
  assert.match(source, /storage = gameStorage/);
  assert.match(source, /hydrateRegistry\(/);
  assert.match(source, /persistRegistry\(/);
  assert.match(source, /return writeRegistry\(state\.registry\)/);
  assert.doesNotMatch(
    source,
    /if \(state\.hydrated\)[\s\S]{0,80}(?:gameStorage|storage)\.write/,
  );
});
