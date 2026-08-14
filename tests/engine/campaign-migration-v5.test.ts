import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  migrateCampaignToV5,
  validateCampaignStateV5,
} from "../../src/game/campaignMigration.ts";
import type { CampaignStateV5 } from "../../src/game/campaignState.ts";
import { generateStartingWorld } from "../../src/game/generateStartingWorld.ts";
import { hydrateRegistry, MemoryRegistryStorage } from "../../src/game/persistence.ts";
import type { GameRegistryV1 } from "../../src/game/model.ts";
import {
  FIXTURE_CAMPAIGN_ID,
  FIXTURE_CAMPAIGN_SEED,
  FIXTURE_CREATED_AT,
  FIXTURE_PLAYER_ID,
  FIXTURE_UPDATED_AT,
  MALFORMED_REGISTRY_FIXTURE,
  completedV4CastleFixture,
  completedV4DungeonFixture,
  malformedCampaignFixture,
  preSetupV4Fixture,
  supportedV2Fixture,
  supportedV3Fixture,
} from "../fixtures/campaignMigrationFixtures.ts";

function requireSuccess(source: unknown): CampaignStateV5 {
  const result = migrateCampaignToV5(source, FIXTURE_PLAYER_ID);
  assert.equal(result.ok, true);
  if (!result.ok) throw new Error(result.failure.message);
  return result.state;
}

test("pre-Setup v4 preserves identity and seed without inventing a foundation", () => {
  const source = preSetupV4Fixture();
  const sourceBytes = JSON.stringify(source);
  const migrated = requireSuccess(source);

  assert.deepEqual(migrated, {
    version: 5,
    id: FIXTURE_CAMPAIGN_ID,
    playerId: FIXTURE_PLAYER_ID,
    campaignSeed: FIXTURE_CAMPAIGN_SEED,
    createdAt: FIXTURE_CREATED_AT,
    updatedAt: FIXTURE_UPDATED_AT,
    activeBoardId: "setup",
    foundation: null,
  });
  assert.equal("setupComplete" in migrated, false);
  assert.equal("hero" in migrated, false);
  assert.equal("dungeon" in migrated, false);
  assert.equal(JSON.stringify(source), sourceBytes);
});

test("completed Castle v4 converts to the minimum authoritative Castle opening", () => {
  const source = completedV4CastleFixture();
  const migrated = requireSuccess(source);
  const foundation = migrated.foundation;
  assert.ok(foundation);
  if (!foundation) return;

  assert.equal(migrated.version, 5);
  assert.equal(migrated.id, source.id);
  assert.equal(migrated.playerId, source.playerId);
  assert.equal(migrated.campaignSeed, source.campaignSeed);
  assert.equal(migrated.createdAt, source.createdAt);
  assert.equal(migrated.updatedAt, source.updatedAt);
  assert.equal(foundation.rootFactionId, "castle");
  assert.equal("faction" in foundation.hero, false);
  assert.deepEqual(foundation.capital, {
    id: "settlement:capital",
    definitionId: "village",
    tier: 1,
    regionId: "region:0,0",
  });
  assert.equal(foundation.world.regions.length, 7);
  assert.equal(foundation.world.sites.length, 3);
  assert.equal(foundation.world.locations.length, 2);
  assert.deepEqual(
    { ...foundation.world, capital: foundation.capital },
    generateStartingWorld(source.campaignSeed),
  );
  assert.deepEqual(validateCampaignStateV5(migrated), []);
});

test("Hero facts move without duplicate faction or strategic-position authority", () => {
  const source = completedV4CastleFixture();
  const migrated = requireSuccess(source);
  const hero = migrated.foundation?.hero;
  assert.ok(hero);
  if (!hero || !source.hero) return;

  assert.equal(hero.heroClass, source.hero.heroClass);
  assert.equal(hero.vocation, source.hero.vocation);
  assert.deepEqual(hero.freeAttributes, source.hero.freeAttributes);
  assert.equal(hero.bonusSkillId, source.hero.bonusSkill);
  assert.deepEqual(hero.skillRanks, {
    "close-combat": 2,
    "heavy-blow": 1,
    diplomacy: 1,
  });
  assert.deepEqual(hero.attributesCompatibility, {
    ruleVersion: "v4-path-bonus-1",
    values: source.hero.attributes,
  });
  assert.equal(hero.strategicRegionId, "region:0,0");
  assert.deepEqual(hero.explorationContext, {
    locationId: "location:regional-dungeon",
    cell: source.hero.position,
    returnBoardId: "settlement",
  });
  assert.notDeepEqual(hero.explorationContext?.cell, { q: 0, r: 0 });
});

test("the exact Dungeon snapshot is retained under regional context without regeneration", () => {
  const source = completedV4CastleFixture();
  const dungeonBytes = JSON.stringify(source.dungeon);
  const migrated = requireSuccess(source);
  const retained =
    migrated.foundation?.regionalDungeons["location:regional-dungeon"];
  assert.ok(retained);
  if (!retained) return;

  assert.equal(retained.seed, source.dungeon.seed);
  assert.equal(retained.level, source.dungeon.level);
  assert.deepEqual(retained.grid, source.dungeon.grid);
  assert.deepEqual(retained.rooms, source.dungeon.rooms);
  assert.deepEqual(retained.tiles, source.dungeon.tiles);
  assert.deepEqual(retained.start, source.dungeon.start);
  assert.deepEqual(retained.heart, source.dungeon.heart);
  assert.deepEqual(retained.discovered, source.dungeon.discovered);
  assert.equal(retained.heartReached, source.dungeon.heartReached);
  assert.equal(JSON.stringify(source.dungeon), dungeonBytes);
  assert.equal("day" in retained, false);
  assert.equal("treasury" in retained, false);
  assert.equal("settlementClaimed" in retained, false);
});

test("old counters and claim survive only as non-strategic legacy metadata", () => {
  const source = completedV4CastleFixture();
  const migrated = requireSuccess(source);
  const retained =
    migrated.foundation?.regionalDungeons["location:regional-dungeon"];

  assert.deepEqual(retained?.legacyPrototypeMetadata, {
    dungeonDay: 18,
    dungeonTreasury: 730,
    settlementClaimed: true,
  });
  assert.equal(migrated.foundation?.capital.definitionId, "village");
  assert.equal(migrated.foundation?.capital.regionId, "region:0,0");
  assert.equal("day" in migrated, false);
  assert.equal("treasury" in migrated, false);
  assert.equal("gold" in migrated, false);
});

test("v2 and v3 pass through protected v4 meaning before the same v5 result", () => {
  const v2 = migrateCampaignToV5(supportedV2Fixture(), FIXTURE_PLAYER_ID);
  const v3 = migrateCampaignToV5(supportedV3Fixture(), FIXTURE_PLAYER_ID);
  const v4 = migrateCampaignToV5(
    completedV4CastleFixture(),
    FIXTURE_PLAYER_ID,
  );
  assert.equal(v2.ok, true);
  assert.equal(v3.ok, true);
  assert.equal(v4.ok, true);
  if (!v2.ok || !v3.ok || !v4.ok) return;

  assert.equal(v2.sourceVersion, 2);
  assert.equal(v3.sourceVersion, 3);
  assert.equal(v4.sourceVersion, 4);
  assert.deepEqual(v2.state, v4.state);
  assert.deepEqual(v3.state, v4.state);
  assert.equal(v2.state.campaignSeed, completedV4CastleFixture().dungeon.seed);
});

test("Dungeon-faction v4 is recoverably incompatible and never becomes Castle", () => {
  const source = completedV4DungeonFixture();
  const sourceBytes = JSON.stringify(source);
  const result = migrateCampaignToV5(source, FIXTURE_PLAYER_ID);

  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.deepEqual(result.failure, {
    code: "incompatible-faction",
    message:
      "Dungeon-faction prototype campaigns cannot be converted to Castle. The original source must be retained until an explicit verified replacement.",
    path: "hero.faction",
    recoverable: true,
  });
  assert.equal(JSON.stringify(source), sourceBytes);
  assert.equal("state" in result, false);
});

test("malformed campaign and owner mismatch return typed failures", () => {
  const malformed = migrateCampaignToV5(
    malformedCampaignFixture(),
    FIXTURE_PLAYER_ID,
  );
  assert.equal(malformed.ok, false);
  if (!malformed.ok) {
    assert.equal(malformed.failure.code, "invalid-campaign");
    assert.equal(malformed.failure.path, "dungeon.tiles");
  }

  const wrongOwner = migrateCampaignToV5(
    completedV4CastleFixture(),
    "player-other",
  );
  assert.equal(wrongOwner.ok, false);
  if (!wrongOwner.ok) {
    assert.equal(wrongOwner.failure.code, "invalid-campaign");
    assert.equal(wrongOwner.failure.path, "playerId");
  }
  const unsupported = migrateCampaignToV5(
    { version: 1 },
    FIXTURE_PLAYER_ID,
  );
  assert.equal(unsupported.ok, false);
  if (!unsupported.ok) {
    assert.equal(unsupported.failure.code, "unsupported-version");
  }
});

test("malformed registry remains a separate typed hydration failure", () => {
  const raw = JSON.stringify(MALFORMED_REGISTRY_FIXTURE);
  const adapter = new MemoryRegistryStorage(raw);
  const result = hydrateRegistry(
    adapter,
    {
      migrateGame(value: unknown) {
        return value as never;
      },
    },
    {
      version: 1,
      players: [],
      games: {},
      lastActivePlayerId: null,
    } satisfies GameRegistryV1,
  );
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.failure.code, "registry-validation-failed");
  }
  assert.equal(adapter.value, raw);
  assert.equal(adapter.writes, 0);
});

test("migration is deterministic and target normalization is idempotent", () => {
  const source = completedV4CastleFixture();
  const first = requireSuccess(source);
  const second = requireSuccess(structuredClone(source));
  assert.deepEqual(second, first);
  assert.equal(JSON.stringify(second), JSON.stringify(first));

  const normalized = migrateCampaignToV5(
    JSON.parse(JSON.stringify(first)),
    FIXTURE_PLAYER_ID,
  );
  assert.equal(normalized.ok, true);
  if (!normalized.ok) return;
  assert.equal(normalized.sourceVersion, 5);
  assert.deepEqual(normalized.state, first);
  assert.equal(JSON.stringify(normalized.state), JSON.stringify(first));
});

test("target roundtrip never rerolls World or duplicates stable instances", () => {
  const migrated = requireSuccess(completedV4CastleFixture());
  const raw = JSON.stringify(migrated);
  const loaded = migrateCampaignToV5(JSON.parse(raw), FIXTURE_PLAYER_ID);
  assert.equal(loaded.ok, true);
  if (!loaded.ok || !loaded.state.foundation || !migrated.foundation) return;

  assert.equal(JSON.stringify(loaded.state), raw);
  assert.deepEqual(loaded.state.foundation.world, migrated.foundation.world);
  assert.deepEqual(loaded.state.foundation.capital, migrated.foundation.capital);
  assert.deepEqual(
    Object.keys(loaded.state.foundation.regionalDungeons),
    ["location:regional-dungeon"],
  );
  assert.deepEqual(
    loaded.state.foundation.world.regions.map((region) => region.id),
    migrated.foundation.world.regions.map((region) => region.id),
  );
});

test("malformed target campaigns fail validation without regeneration or repair", () => {
  const target = requireSuccess(completedV4CastleFixture());
  const malformed = structuredClone(target) as unknown as {
    version: 5;
    foundation: { world: { regions: unknown } };
  };
  malformed.foundation.world.regions = "invalid";

  const issues = validateCampaignStateV5(malformed);
  assert.ok(
    issues.some(
      (issue) =>
        issue.path === "foundation.world" &&
        issue.message.includes("must be arrays"),
    ),
  );
  const migrated = migrateCampaignToV5(malformed, FIXTURE_PLAYER_ID);
  assert.equal(migrated.ok, false);
  if (!migrated.ok) {
    assert.equal(migrated.failure.code, "invalid-campaign");
  }

  const duplicateFaction = requireSuccess(completedV4CastleFixture()) as
    CampaignStateV5 & {
      foundation: NonNullable<CampaignStateV5["foundation"]> & {
        hero: NonNullable<CampaignStateV5["foundation"]>["hero"] & {
          faction?: string;
        };
      };
    };
  duplicateFaction.foundation.hero.faction = "dungeon";
  assert.ok(
    validateCampaignStateV5(duplicateFaction).some(
      (issue) =>
        issue.path === "foundation.hero" &&
        issue.message.includes("competing fields"),
    ),
  );

  const malformedLocation = requireSuccess(
    completedV4CastleFixture(),
  ) as unknown as {
    foundation: { world: { locations: unknown[] } };
  };
  malformedLocation.foundation.world.locations[0] = null;
  assert.doesNotThrow(() => validateCampaignStateV5(malformedLocation));
  assert.ok(
    validateCampaignStateV5(malformedLocation).some(
      (issue) =>
        issue.path === "foundation.world" &&
        issue.message.includes("exact approved"),
    ),
  );
});

test("target validation rejects contradictory Hero facts and future state", () => {
  const target = requireSuccess(completedV4CastleFixture()) as unknown as {
    foundation: {
      hero: {
        bonusSkillId: string;
        skillRanks: Record<string, number>;
        attributesCompatibility: { values: { str: number } };
      };
      world: { sites: Array<Record<string, unknown>> };
    };
  };
  target.foundation.hero.bonusSkillId = "mage-combat";
  target.foundation.hero.skillRanks = {};
  target.foundation.hero.attributesCompatibility.values.str = 999;
  target.foundation.world.sites[0].yield = 999;

  const issues = validateCampaignStateV5(target);
  assert.ok(
    issues.some(
      (issue) =>
        issue.path === "foundation.hero.bonusSkillId" &&
        issue.message.includes("does not belong"),
    ),
  );
  assert.ok(
    issues.some((issue) => issue.path.includes("foundation.hero.skillRanks")),
  );
  assert.ok(
    issues.some(
      (issue) =>
        issue.path === "foundation.hero.attributesCompatibility.values",
    ),
  );
  assert.ok(
    issues.some(
      (issue) =>
        issue.path === "foundation.world" &&
        issue.message.includes("exact approved"),
    ),
  );
});

test("resume mapping preserves legal target boards and repairs unsupported scaffolds", () => {
  for (const [sourceBoard, expectedBoard] of [
    ["hero", "hero"],
    ["settlement", "settlement"],
    ["world", "world"],
    ["dungeon", "dungeon"],
    ["combat", "settlement"],
    ["diplomacy", "settlement"],
  ] as const) {
    const source = { ...completedV4CastleFixture(), activeBoardId: sourceBoard };
    const migrated = requireSuccess(source);
    assert.equal(migrated.activeBoardId, expectedBoard, sourceBoard);
  }
});

test("v5 migration and validation stay pure and cannot write persistence", async () => {
  const source = await readFile(
    new URL("../../src/game/campaignMigration.ts", import.meta.url),
    "utf8",
  );
  for (const forbidden of [
    /from\s+["']react(?:\/[^"']*)?["']/,
    /from\s+["'][^"']*(?:boards|storage)[^"']*["']/,
    /\b(?:window|localStorage|crypto|Date\.now|new Date)\b/,
    /Math\.random/,
    /(?:cloudflare|sites-project|\.openai\/hosting)/i,
    /systemIdSource|systemCampaignSeedSource|\.write\(/,
  ]) {
    assert.doesNotMatch(source, forbidden);
  }
});
