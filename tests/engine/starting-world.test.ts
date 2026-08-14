import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { createDungeonLevel } from "../../src/game/generateDungeon.ts";
import {
  HOME_REGION_COORDINATE,
  WORLD_GENERATOR_VERSION,
  WORLD_SEED_DOMAIN,
  areAxialCoordinatesAdjacent,
  createRegionId,
  deriveWorldSeed,
  generateStartingWorld,
  getFirstRingCoordinates,
  validateStartingWorld,
  type GeneratedStartingWorld,
} from "../../src/game/generateStartingWorld.ts";

const LEGACY_DUNGEON_FIXTURE =
  '{"level":1,"day":1,"treasury":100,"grid":{"columns":20,"rows":12},"seed":987654321,"rooms":[{"id":1,"x":0,"y":8,"width":4,"height":3},{"id":2,"x":4,"y":1,"width":4,"height":3},{"id":3,"x":9,"y":7,"width":3,"height":4},{"id":4,"x":12,"y":1,"width":4,"height":3},{"id":5,"x":16,"y":7,"width":4,"height":4}],"tiles":["####################","####....####....####","##......####.......#","##.#....####....##.#","##.###.#######.###.#","##.###.#######.###.#","##.###.#######.###.#","##.###.##...##.#....","....##.##...##.#....","....................","....#####...####....","####################"],"start":{"x":2,"y":9},"heart":{"x":18,"y":9},"discovered":[],"heartReached":false,"settlementClaimed":false}';

function occupiedRingRegionIds(world: GeneratedStartingWorld): Set<string> {
  return new Set(
    [...world.sites, ...world.locations].map((instance) => instance.regionId),
  );
}

test("the starting World uses the approved home and clockwise six-neighbor topology", () => {
  const world = generateStartingWorld(42);
  const expectedRingCoordinates = [
    { q: 1, r: 0 },
    { q: 1, r: -1 },
    { q: 0, r: -1 },
    { q: -1, r: 0 },
    { q: -1, r: 1 },
    { q: 0, r: 1 },
  ];

  assert.deepEqual(HOME_REGION_COORDINATE, { q: 0, r: 0 });
  assert.deepEqual(getFirstRingCoordinates(), expectedRingCoordinates);
  assert.deepEqual(
    world.regions.map((region) => region.coordinate),
    [{ q: 0, r: 0 }, ...expectedRingCoordinates],
  );
  assert.deepEqual(
    world.regions.map((region) => region.id),
    [
      "region:0,0",
      "region:1,0",
      "region:1,-1",
      "region:0,-1",
      "region:-1,0",
      "region:-1,1",
      "region:0,1",
    ],
  );
  assert.equal(new Set(world.regions.map((region) => region.id)).size, 7);
  assert.equal(
    new Set(
      world.regions.map((region) =>
        `${region.coordinate.q},${region.coordinate.r}`,
      ),
    ).size,
    7,
  );
  assert.ok(
    world.regions
      .slice(1)
      .every((region) =>
        areAxialCoordinatesAdjacent(HOME_REGION_COORDINATE, region.coordinate),
      ),
  );
  assert.ok(world.regions.every((region) => region.controlled));
  assert.ok(
    world.regions.every(
      (region) => region.terrainDefinitionId === "home-ring-terrain",
    ),
  );
  assert.deepEqual(validateStartingWorld(world), []);
});

test("the home region contains the Tier-1 Village capital reference", () => {
  const world = generateStartingWorld(42);

  assert.equal(world.homeRegionId, "region:0,0");
  assert.deepEqual(world.capital, {
    id: "settlement:capital",
    definitionId: "village",
    tier: 1,
    regionId: world.homeRegionId,
  });
});

test("the six neighbors contain exactly the approved opening contents", () => {
  const world = generateStartingWorld(42);
  const ringRegionIds = new Set(
    world.regions.slice(1).map((region) => region.id),
  );

  assert.deepEqual(
    world.sites.map((site) => site.definitionId),
    ["food-site", "wood-site", "stone-site"],
  );
  assert.deepEqual(
    world.locations.map((location) => location.definitionId),
    ["regional-dungeon", "ruin"],
  );
  assert.equal(occupiedRingRegionIds(world).size, 5);
  assert.ok(
    [...world.sites, ...world.locations].every((instance) =>
      ringRegionIds.has(instance.regionId),
    ),
  );
  const terrainOnly = world.regions
    .slice(1)
    .filter((region) => !occupiedRingRegionIds(world).has(region.id));
  assert.deepEqual(
    terrainOnly.map((region) => region.id),
    ["region:-1,1"],
  );
});

test("the approved domain-separated seed and generator fixture are reproducible", () => {
  const first = generateStartingWorld(42);
  const second = generateStartingWorld(42);

  assert.equal(WORLD_SEED_DOMAIN, "world/home-ring/v1");
  assert.equal(WORLD_GENERATOR_VERSION, 1);
  assert.equal(deriveWorldSeed(42), 3_631_972_228);
  assert.equal(first.seed, deriveWorldSeed(42));
  assert.deepEqual(second, first);
  assert.equal(JSON.stringify(second), JSON.stringify(first));
  assert.deepEqual(first.sites, [
    {
      id: "site:food-site",
      definitionId: "food-site",
      regionId: "region:-1,0",
    },
    {
      id: "site:wood-site",
      definitionId: "wood-site",
      regionId: "region:0,-1",
    },
    {
      id: "site:stone-site",
      definitionId: "stone-site",
      regionId: "region:1,-1",
    },
  ]);
  assert.deepEqual(first.locations, [
    {
      id: "location:regional-dungeon",
      definitionId: "regional-dungeon",
      regionId: "region:1,0",
    },
    {
      id: "location:ruin",
      definitionId: "ruin",
      regionId: "region:0,1",
    },
  ]);
});

test("different valid campaign seeds can vary placement without changing guarantees", () => {
  const first = generateStartingWorld(1);
  const second = generateStartingWorld(2);

  assert.notEqual(first.seed, second.seed);
  assert.notDeepEqual(first.sites, second.sites);
  assert.deepEqual(
    first.regions.map((region) => region.id),
    second.regions.map((region) => region.id),
  );
  assert.deepEqual(validateStartingWorld(first), []);
  assert.deepEqual(validateStartingWorld(second), []);
});

test("bounded seed fixtures preserve every topology and content guarantee", () => {
  for (const seed of [0, 1, 2, 42, 65_535, 123_456_789, 0xffff_ffff]) {
    const world = generateStartingWorld(seed);
    assert.deepEqual(validateStartingWorld(world), [], `seed ${seed}`);
    assert.equal(world.regions.length, 7, `seed ${seed}`);
    assert.equal(world.sites.length, 3, `seed ${seed}`);
    assert.equal(world.locations.length, 2, `seed ${seed}`);
  }
});

test("validation rejects duplicate coordinates and invalid content placement", () => {
  const world = generateStartingWorld(42);
  const duplicateCoordinate: GeneratedStartingWorld = {
    ...world,
    regions: world.regions.map((region, index) =>
      index === 2
        ? {
            ...region,
            id: world.regions[1].id,
            coordinate: { ...world.regions[1].coordinate },
          }
        : region,
    ),
  };
  const topologyIssues = validateStartingWorld(duplicateCoordinate);
  assert.ok(
    topologyIssues.some((issue) => issue.code === "duplicate-coordinate"),
  );
  assert.ok(topologyIssues.some((issue) => issue.code === "duplicate-id"));

  const overlappingContent: GeneratedStartingWorld = {
    ...world,
    locations: world.locations.map((location, index) =>
      index === 0
        ? { ...location, regionId: world.sites[0].regionId }
        : location,
    ),
  };
  assert.ok(
    validateStartingWorld(overlappingContent).some(
      (issue) => issue.code === "invalid-content",
    ),
  );
});

test("validation rejects invalid ordering, control, and catalog references", () => {
  const world = generateStartingWorld(42);
  const invalidRegion = {
    ...world.regions[1],
    controlled: false,
    terrainDefinitionId: "missing-terrain",
  } as unknown as GeneratedStartingWorld["regions"][number];
  const invalidSite = {
    ...world.sites[0],
    definitionId: "missing-site",
  } as unknown as GeneratedStartingWorld["sites"][number];
  const invalidWorld: GeneratedStartingWorld = {
    ...world,
    regions: [invalidRegion, world.regions[0], ...world.regions.slice(2)],
    sites: [invalidSite, ...world.sites.slice(1)],
  };
  const issues = validateStartingWorld(invalidWorld);

  assert.ok(issues.some((issue) => issue.code === "invalid-order"));
  assert.ok(issues.some((issue) => issue.code === "invalid-control"));
  assert.ok(issues.some((issue) => issue.code === "invalid-reference"));
  assert.ok(issues.some((issue) => issue.code === "invalid-content"));
});

test("World generation cannot mutate or reroll the legacy Dungeon fixture", () => {
  const retainedDungeon = {
    ...createDungeonLevel(987_654_321),
    day: 18,
    treasury: 730,
    discovered: ["2,8", "3,8", "4,8"],
    heartReached: true,
    settlementClaimed: true,
  };
  const retainedBytes = JSON.stringify(retainedDungeon);

  generateStartingWorld(987_654_321);

  assert.equal(JSON.stringify(retainedDungeon), retainedBytes);
  assert.equal(
    JSON.stringify(createDungeonLevel(987_654_321)),
    LEGACY_DUNGEON_FIXTURE,
  );
  assert.notEqual(deriveWorldSeed(987_654_321), retainedDungeon.seed);
});

test("coordinate and seed inputs reject invalid values", () => {
  assert.equal(createRegionId({ q: -1, r: 1 }), "region:-1,1");
  assert.throws(() => createRegionId({ q: 0.5, r: 1 }), /integer/);
  assert.throws(() => deriveWorldSeed(-1), /unsigned 32-bit/);
  assert.equal(
    areAxialCoordinatesAdjacent({ q: 0, r: 0 }, { q: 2, r: 0 }),
    false,
  );
});

test("the starting World generator has no UI, platform, clock, or entropy dependency", async () => {
  const source = await readFile(
    new URL("../../src/game/generateStartingWorld.ts", import.meta.url),
    "utf8",
  );

  for (const forbidden of [
    /from\s+["']react(?:\/[^"']*)?["']/,
    /from\s+["'][^"']*(?:boards|storage)[^"']*["']/,
    /\b(?:window|localStorage|crypto|Date)\b/,
    /Math\.random/,
    /(?:cloudflare|sites-project|\.openai\/hosting)/i,
    /systemIdSource|IdSource|randomUUID/,
  ]) {
    assert.doesNotMatch(source, forbidden);
  }
});
