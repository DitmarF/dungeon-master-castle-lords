import {
  CASTLE_OPENING_DEFINITION,
  REGION_LOCATION_DEFINITION_BY_ID,
  REGION_LOCATION_DEFINITIONS,
  REGION_TERRAIN_DEFINITION_BY_ID,
  RESOURCE_SITE_DEFINITION_BY_ID,
  RESOURCE_SITE_DEFINITIONS,
  SETTLEMENT_DEFINITION_BY_ID,
  type HomeRingContentReference,
  type RegionLocationDefinitionId,
  type RegionTerrainDefinitionId,
  type ResourceSiteDefinitionId,
  type SettlementDefinitionId,
} from "./openingContent.ts";
import {
  createDeterministicRandom,
  isCampaignSeed,
  randomInteger,
  requireCampaignSeed,
  type CampaignSeed,
  type RandomSource,
} from "./random.ts";

declare const worldSeedBrand: unique symbol;

export type WorldSeed = number & { readonly [worldSeedBrand]: true };
export type WorldGeneratorVersion = 1;
export type RegionId = `region:${number},${number}`;
export type SettlementId = "settlement:capital";
export type SiteId = `site:${ResourceSiteDefinitionId}`;
export type LocationId = `location:${RegionLocationDefinitionId}`;

export interface AxialCoordinate {
  q: number;
  r: number;
}

export interface GeneratedRegionSnapshot {
  id: RegionId;
  coordinate: AxialCoordinate;
  terrainDefinitionId: RegionTerrainDefinitionId;
  controlled: true;
}

export interface GeneratedCapitalSnapshot {
  id: SettlementId;
  definitionId: SettlementDefinitionId;
  tier: 1;
  regionId: RegionId;
}

export interface GeneratedSiteSnapshot {
  id: SiteId;
  definitionId: ResourceSiteDefinitionId;
  regionId: RegionId;
}

export interface GeneratedLocationSnapshot {
  id: LocationId;
  definitionId: RegionLocationDefinitionId;
  regionId: RegionId;
}

export interface GeneratedStartingWorld {
  generatorVersion: WorldGeneratorVersion;
  seed: WorldSeed;
  homeRegionId: RegionId;
  capital: GeneratedCapitalSnapshot;
  regions: readonly GeneratedRegionSnapshot[];
  sites: readonly GeneratedSiteSnapshot[];
  locations: readonly GeneratedLocationSnapshot[];
}

export const WORLD_SEED_DOMAIN = "world/home-ring/v1";
export const WORLD_GENERATOR_VERSION: WorldGeneratorVersion = 1;
export const HOME_REGION_COORDINATE: Readonly<AxialCoordinate> = {
  q: 0,
  r: 0,
};

const FIRST_RING_DIRECTIONS: readonly Readonly<AxialCoordinate>[] = [
  { q: 1, r: 0 },
  { q: 1, r: -1 },
  { q: 0, r: -1 },
  { q: -1, r: 0 },
  { q: -1, r: 1 },
  { q: 0, r: 1 },
];

const CAPITAL_ID: SettlementId = "settlement:capital";

function isAxialCoordinate(value: AxialCoordinate): boolean {
  return Number.isInteger(value.q) && Number.isInteger(value.r);
}

function coordinateKey(coordinate: AxialCoordinate): string {
  return `${coordinate.q},${coordinate.r}`;
}

export function createRegionId(coordinate: AxialCoordinate): RegionId {
  if (!isAxialCoordinate(coordinate)) {
    throw new Error("Axial coordinates must use integer q and r values.");
  }
  return `region:${coordinate.q},${coordinate.r}`;
}

export function axialCoordinatesEqual(
  first: AxialCoordinate,
  second: AxialCoordinate,
): boolean {
  return first.q === second.q && first.r === second.r;
}

export function areAxialCoordinatesAdjacent(
  first: AxialCoordinate,
  second: AxialCoordinate,
): boolean {
  if (!isAxialCoordinate(first) || !isAxialCoordinate(second)) return false;
  const qDistance = Math.abs(first.q - second.q);
  const rDistance = Math.abs(first.r - second.r);
  const sDistance = Math.abs(
    -first.q - first.r - (-second.q - second.r),
  );
  return Math.max(qDistance, rDistance, sDistance) === 1;
}

export function getFirstRingCoordinates(): AxialCoordinate[] {
  return FIRST_RING_DIRECTIONS.map((direction) => ({
    q: HOME_REGION_COORDINATE.q + direction.q,
    r: HOME_REGION_COORDINATE.r + direction.r,
  }));
}

function fnv1a32(value: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export function deriveWorldSeed(campaignSeed: CampaignSeed): WorldSeed {
  const validCampaignSeed = requireCampaignSeed(campaignSeed);
  return fnv1a32(`${WORLD_SEED_DOMAIN}:${validCampaignSeed}`) as WorldSeed;
}

function shuffledHomeRingContents(
  random: RandomSource,
): HomeRingContentReference[] {
  const contents = [...CASTLE_OPENING_DEFINITION.homeRingContents];
  for (let index = contents.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInteger(random, 0, index);
    [contents[index], contents[swapIndex]] = [
      contents[swapIndex],
      contents[index],
    ];
  }
  return contents;
}

function contentKey(reference: HomeRingContentReference): string {
  return `${reference.kind}:${reference.definitionId}`;
}

function createSiteId(definitionId: ResourceSiteDefinitionId): SiteId {
  return `site:${definitionId}`;
}

function createLocationId(
  definitionId: RegionLocationDefinitionId,
): LocationId {
  return `location:${definitionId}`;
}

export function generateStartingWorld(
  campaignSeed: CampaignSeed,
): GeneratedStartingWorld {
  const seed = deriveWorldSeed(campaignSeed);
  const random = createDeterministicRandom(seed);
  const homeCoordinate = { ...HOME_REGION_COORDINATE };
  const ringCoordinates = getFirstRingCoordinates();
  const shuffledContents = shuffledHomeRingContents(random);
  const regionIdByContent = new Map<string, RegionId>();

  shuffledContents.forEach((reference, index) => {
    regionIdByContent.set(
      contentKey(reference),
      createRegionId(ringCoordinates[index]),
    );
  });

  const homeRegionId = createRegionId(homeCoordinate);
  const regions: GeneratedRegionSnapshot[] = [
    {
      id: homeRegionId,
      coordinate: homeCoordinate,
      terrainDefinitionId: "home-ring-terrain",
      controlled: true,
    },
    ...ringCoordinates.map((coordinate) => ({
      id: createRegionId(coordinate),
      coordinate,
      terrainDefinitionId: "home-ring-terrain" as const,
      controlled: true as const,
    })),
  ];

  const capitalDefinition = SETTLEMENT_DEFINITION_BY_ID.village;
  const capital: GeneratedCapitalSnapshot = {
    id: CAPITAL_ID,
    definitionId: capitalDefinition.id,
    tier: capitalDefinition.tier,
    regionId: homeRegionId,
  };

  const sites: GeneratedSiteSnapshot[] = RESOURCE_SITE_DEFINITIONS.map(
    (definition) => ({
      id: createSiteId(definition.id),
      definitionId: definition.id,
      regionId: regionIdByContent.get(`resource-site:${definition.id}`)!,
    }),
  );
  const locations: GeneratedLocationSnapshot[] =
    REGION_LOCATION_DEFINITIONS.map((definition) => ({
      id: createLocationId(definition.id),
      definitionId: definition.id,
      regionId: regionIdByContent.get(`location:${definition.id}`)!,
    }));

  const world: GeneratedStartingWorld = {
    generatorVersion: WORLD_GENERATOR_VERSION,
    seed,
    homeRegionId,
    capital,
    regions,
    sites,
    locations,
  };
  const issues = validateStartingWorld(world);
  if (issues.length > 0) {
    throw new Error(
      `Invalid generated starting World: ${issues
        .map((issue) => `${issue.code}@${issue.path}`)
        .join(", ")}`,
    );
  }
  return world;
}

export type StartingWorldValidationIssueCode =
  | "invalid-generator-metadata"
  | "invalid-topology"
  | "duplicate-coordinate"
  | "duplicate-id"
  | "invalid-order"
  | "invalid-reference"
  | "invalid-control"
  | "invalid-capital"
  | "invalid-content";

export interface StartingWorldValidationIssue {
  code: StartingWorldValidationIssueCode;
  path: string;
  message: string;
}

function addIssue(
  issues: StartingWorldValidationIssue[],
  code: StartingWorldValidationIssueCode,
  path: string,
  message: string,
): void {
  issues.push({ code, path, message });
}

function hasExactOrderedValues(
  actual: readonly string[],
  expected: readonly string[],
): boolean {
  return (
    actual.length === expected.length &&
    actual.every((value, index) => value === expected[index])
  );
}

export function validateStartingWorld(
  world: GeneratedStartingWorld,
): readonly StartingWorldValidationIssue[] {
  const issues: StartingWorldValidationIssue[] = [];
  if (
    world.generatorVersion !== WORLD_GENERATOR_VERSION ||
    !isCampaignSeed(world.seed)
  ) {
    addIssue(
      issues,
      "invalid-generator-metadata",
      "generatorVersion",
      "Starting World metadata must use generator version 1 and a uint32 seed.",
    );
  }

  const expectedCoordinates = [
    { ...HOME_REGION_COORDINATE },
    ...getFirstRingCoordinates(),
  ];
  const expectedRegionIds = expectedCoordinates.map(createRegionId);
  const regionIds = new Set<RegionId>();
  const coordinateKeys = new Set<string>();

  if (world.regions.length !== expectedCoordinates.length) {
    addIssue(
      issues,
      "invalid-topology",
      "regions",
      "The starting World must contain one home region and exactly six neighbors.",
    );
  }

  world.regions.forEach((region, index) => {
    const path = `regions[${index}]`;
    if (!isAxialCoordinate(region.coordinate)) {
      addIssue(
        issues,
        "invalid-topology",
        `${path}.coordinate`,
        "Region coordinates must use integer axial values.",
      );
    } else if (region.id !== createRegionId(region.coordinate)) {
      addIssue(
        issues,
        "invalid-reference",
        `${path}.id`,
        "Region ID must be derived from its coordinate.",
      );
    }
    if (regionIds.has(region.id)) {
      addIssue(issues, "duplicate-id", `${path}.id`, "Duplicate region ID.");
    }
    regionIds.add(region.id);
    const key = coordinateKey(region.coordinate);
    if (coordinateKeys.has(key)) {
      addIssue(
        issues,
        "duplicate-coordinate",
        `${path}.coordinate`,
        "Duplicate region coordinate.",
      );
    }
    coordinateKeys.add(key);
    if (region.controlled !== true) {
      addIssue(
        issues,
        "invalid-control",
        `${path}.controlled`,
        "Every opening region must begin controlled.",
      );
    }
    if (
      region.terrainDefinitionId !== "home-ring-terrain" ||
      !REGION_TERRAIN_DEFINITION_BY_ID[region.terrainDefinitionId]
    ) {
      addIssue(
        issues,
        "invalid-reference",
        `${path}.terrainDefinitionId`,
        "Every opening region must reference the approved neutral terrain.",
      );
    }
  });

  if (
    !hasExactOrderedValues(
      world.regions.map((region) => region.id),
      expectedRegionIds,
    )
  ) {
    addIssue(
      issues,
      "invalid-order",
      "regions",
      "Regions must be ordered home first, then clockwise from east.",
    );
  }

  const homeRegion = world.regions[0];
  if (
    world.homeRegionId !== expectedRegionIds[0] ||
    !homeRegion ||
    homeRegion.id !== world.homeRegionId ||
    !axialCoordinatesEqual(homeRegion.coordinate, HOME_REGION_COORDINATE)
  ) {
    addIssue(
      issues,
      "invalid-topology",
      "homeRegionId",
      "The home region must be region:0,0 at axial origin.",
    );
  }

  const ringRegions = world.regions.slice(1);
  if (
    ringRegions.length !== 6 ||
    ringRegions.some(
      (region) =>
        !areAxialCoordinatesAdjacent(
          HOME_REGION_COORDINATE,
          region.coordinate,
        ),
    )
  ) {
    addIssue(
      issues,
      "invalid-topology",
      "regions",
      "Every first-ring region must be adjacent to the home region.",
    );
  }

  const villageDefinition = SETTLEMENT_DEFINITION_BY_ID.village;
  if (
    world.capital.id !== CAPITAL_ID ||
    world.capital.definitionId !== villageDefinition.id ||
    world.capital.tier !== villageDefinition.tier ||
    world.capital.regionId !== world.homeRegionId
  ) {
    addIssue(
      issues,
      "invalid-capital",
      "capital",
      "The Tier-1 Village capital must belong to the home region.",
    );
  }

  const ringRegionIds = new Set(ringRegions.map((region) => region.id));
  const occupiedRingRegionIds = new Set<RegionId>();
  const siteIds = new Set<SiteId>();
  const expectedSiteDefinitionIds = RESOURCE_SITE_DEFINITIONS.map(
    (definition) => definition.id,
  );
  if (
    !hasExactOrderedValues(
      world.sites.map((site) => site.definitionId),
      expectedSiteDefinitionIds,
    )
  ) {
    addIssue(
      issues,
      "invalid-content",
      "sites",
      "Sites must contain Food, Wood, and Stone once in catalog order.",
    );
  }
  world.sites.forEach((site, index) => {
    const path = `sites[${index}]`;
    if (
      !RESOURCE_SITE_DEFINITION_BY_ID[site.definitionId] ||
      site.id !== createSiteId(site.definitionId)
    ) {
      addIssue(
        issues,
        "invalid-reference",
        path,
        "Site identity and definition reference must be valid.",
      );
    }
    if (siteIds.has(site.id)) {
      addIssue(issues, "duplicate-id", `${path}.id`, "Duplicate site ID.");
    }
    siteIds.add(site.id);
    if (
      !ringRegionIds.has(site.regionId) ||
      occupiedRingRegionIds.has(site.regionId)
    ) {
      addIssue(
        issues,
        "invalid-content",
        `${path}.regionId`,
        "Each required site must occupy a distinct first-ring region.",
      );
    }
    occupiedRingRegionIds.add(site.regionId);
  });

  const locationIds = new Set<LocationId>();
  const expectedLocationDefinitionIds = REGION_LOCATION_DEFINITIONS.map(
    (definition) => definition.id,
  );
  if (
    !hasExactOrderedValues(
      world.locations.map((location) => location.definitionId),
      expectedLocationDefinitionIds,
    )
  ) {
    addIssue(
      issues,
      "invalid-content",
      "locations",
      "Locations must contain the regional Dungeon and ruin once in catalog order.",
    );
  }
  world.locations.forEach((location, index) => {
    const path = `locations[${index}]`;
    if (
      !REGION_LOCATION_DEFINITION_BY_ID[location.definitionId] ||
      location.id !== createLocationId(location.definitionId)
    ) {
      addIssue(
        issues,
        "invalid-reference",
        path,
        "Location identity and definition reference must be valid.",
      );
    }
    if (locationIds.has(location.id)) {
      addIssue(
        issues,
        "duplicate-id",
        `${path}.id`,
        "Duplicate location ID.",
      );
    }
    locationIds.add(location.id);
    if (
      !ringRegionIds.has(location.regionId) ||
      occupiedRingRegionIds.has(location.regionId)
    ) {
      addIssue(
        issues,
        "invalid-content",
        `${path}.regionId`,
        "Each required location must occupy a distinct unused first-ring region.",
      );
    }
    occupiedRingRegionIds.add(location.regionId);
  });

  const terrainOnlyRegionCount = ringRegions.filter(
    (region) => !occupiedRingRegionIds.has(region.id),
  ).length;
  if (
    occupiedRingRegionIds.size !== 5 ||
    terrainOnlyRegionCount !== 1
  ) {
    addIssue(
      issues,
      "invalid-content",
      "regions",
      "Exactly one first-ring region must remain terrain-only.",
    );
  }

  return issues;
}
