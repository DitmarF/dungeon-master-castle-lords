import type { FactionType } from "./campaignState.ts";

export type RootFactionDefinitionId = FactionType;
export type SettlementDefinitionId = "village";
export type ResourceSiteDefinitionId =
  | "food-site"
  | "wood-site"
  | "stone-site";
export type RegionTerrainDefinitionId = "home-ring-terrain";
export type RegionLocationDefinitionId = "regional-dungeon" | "ruin";

export type NewCampaignAvailability = "playable" | "compatibility-only";
export type FactionPresentationIcon = "castle" | "layers";

interface OrderedDefinition<Id extends string> {
  id: Id;
  catalogOrder: number;
  name: string;
  description: string;
}

export interface RootFactionDefinition
  extends OrderedDefinition<RootFactionDefinitionId> {
  newCampaignAvailability: NewCampaignAvailability;
  capitalSettlementDefinitionId: SettlementDefinitionId | null;
  presentation: {
    icon: FactionPresentationIcon;
    sigil: string;
  };
}

export interface SettlementDefinition
  extends OrderedDefinition<SettlementDefinitionId> {
  rootFactionId: RootFactionDefinitionId;
  tier: 1;
  settlementKind: "village";
}

export interface ResourceSiteDefinition
  extends OrderedDefinition<ResourceSiteDefinitionId> {
  siteKind: "food" | "wood" | "stone";
}

export interface RegionTerrainDefinition
  extends OrderedDefinition<RegionTerrainDefinitionId> {
  terrainKind: "home-ring-baseline";
}

export interface RegionLocationDefinition
  extends OrderedDefinition<RegionLocationDefinitionId> {
  locationKind: "dungeon" | "ruin";
  interaction: "exploration" | "inert";
}

export type HomeRingContentReference =
  | {
      kind: "resource-site";
      definitionId: ResourceSiteDefinitionId;
    }
  | {
      kind: "location";
      definitionId: RegionLocationDefinitionId;
    }
  | {
      kind: "terrain-only";
      definitionId: RegionTerrainDefinitionId;
    };

export interface CastleOpeningDefinition {
  rootFactionId: RootFactionDefinitionId;
  capitalSettlementDefinitionId: SettlementDefinitionId;
  homeRingContents: readonly HomeRingContentReference[];
}

export interface CastleOpeningCatalog {
  rootFactions: readonly RootFactionDefinition[];
  settlements: readonly SettlementDefinition[];
  resourceSites: readonly ResourceSiteDefinition[];
  regionTerrains: readonly RegionTerrainDefinition[];
  regionLocations: readonly RegionLocationDefinition[];
  opening: CastleOpeningDefinition;
}

export const ROOT_FACTION_DEFINITIONS = [
  {
    id: "castle",
    catalogOrder: 0,
    name: "Castle",
    description: "The sole playable root faction for new MVP campaigns.",
    newCampaignAvailability: "playable",
    capitalSettlementDefinitionId: "village",
    presentation: { icon: "castle", sigil: "CA" },
  },
  {
    id: "dungeon",
    catalogOrder: 1,
    name: "Dungeon",
    description:
      "Unavailable for new MVP campaigns · retained compatibility identity.",
    newCampaignAvailability: "compatibility-only",
    capitalSettlementDefinitionId: null,
    presentation: { icon: "layers", sigil: "DU" },
  },
] as const satisfies readonly RootFactionDefinition[];

export const SETTLEMENT_DEFINITIONS = [
  {
    id: "village",
    catalogOrder: 0,
    name: "Village",
    description: "The reusable Tier-1 capital settlement identity.",
    rootFactionId: "castle",
    tier: 1,
    settlementKind: "village",
  },
] as const satisfies readonly SettlementDefinition[];

export const RESOURCE_SITE_DEFINITIONS = [
  {
    id: "food-site",
    catalogOrder: 0,
    name: "Food site",
    description: "A regional site associated with Food.",
    siteKind: "food",
  },
  {
    id: "wood-site",
    catalogOrder: 1,
    name: "Wood site",
    description: "A regional site associated with Wood.",
    siteKind: "wood",
  },
  {
    id: "stone-site",
    catalogOrder: 2,
    name: "Stone site",
    description: "A regional site associated with Stone.",
    siteKind: "stone",
  },
] as const satisfies readonly ResourceSiteDefinition[];

export const REGION_TERRAIN_DEFINITIONS = [
  {
    id: "home-ring-terrain",
    catalogOrder: 0,
    name: "Home-ring terrain",
    description:
      "The neutral terrain reference required by the opening; it defines no biome or gameplay effect.",
    terrainKind: "home-ring-baseline",
  },
] as const satisfies readonly RegionTerrainDefinition[];

export const REGION_LOCATION_DEFINITIONS = [
  {
    id: "regional-dungeon",
    catalogOrder: 0,
    name: "Regional Dungeon",
    description: "An explorable Dungeon location belonging to a World region.",
    locationKind: "dungeon",
    interaction: "exploration",
  },
  {
    id: "ruin",
    catalogOrder: 1,
    name: "Ruin",
    description:
      "A discoverable regional location with no executable EPIC 03 behavior.",
    locationKind: "ruin",
    interaction: "inert",
  },
] as const satisfies readonly RegionLocationDefinition[];

export const CASTLE_OPENING_DEFINITION = {
  rootFactionId: "castle",
  capitalSettlementDefinitionId: "village",
  homeRingContents: [
    { kind: "resource-site", definitionId: "food-site" },
    { kind: "resource-site", definitionId: "wood-site" },
    { kind: "resource-site", definitionId: "stone-site" },
    { kind: "location", definitionId: "regional-dungeon" },
    { kind: "location", definitionId: "ruin" },
    { kind: "terrain-only", definitionId: "home-ring-terrain" },
  ],
} as const satisfies CastleOpeningDefinition;

export const CASTLE_OPENING_CATALOG: CastleOpeningCatalog = {
  rootFactions: ROOT_FACTION_DEFINITIONS,
  settlements: SETTLEMENT_DEFINITIONS,
  resourceSites: RESOURCE_SITE_DEFINITIONS,
  regionTerrains: REGION_TERRAIN_DEFINITIONS,
  regionLocations: REGION_LOCATION_DEFINITIONS,
  opening: CASTLE_OPENING_DEFINITION,
};

function createIndex<Definition extends { id: string }>(
  definitions: readonly Definition[],
): Readonly<Record<string, Definition>> {
  return Object.fromEntries(
    definitions.map((definition) => [definition.id, definition]),
  );
}

export const ROOT_FACTION_DEFINITION_BY_ID = createIndex(
  ROOT_FACTION_DEFINITIONS,
);
export const SETTLEMENT_DEFINITION_BY_ID = createIndex(
  SETTLEMENT_DEFINITIONS,
);
export const RESOURCE_SITE_DEFINITION_BY_ID = createIndex(
  RESOURCE_SITE_DEFINITIONS,
);
export const REGION_TERRAIN_DEFINITION_BY_ID = createIndex(
  REGION_TERRAIN_DEFINITIONS,
);
export const REGION_LOCATION_DEFINITION_BY_ID = createIndex(
  REGION_LOCATION_DEFINITIONS,
);

export const NEW_CAMPAIGN_ROOT_FACTION_DEFINITIONS =
  ROOT_FACTION_DEFINITIONS.filter(
    (definition) => definition.newCampaignAvailability === "playable",
  );

export function getRootFactionDefinition(
  factionId: string,
): RootFactionDefinition | null {
  return ROOT_FACTION_DEFINITION_BY_ID[factionId] ?? null;
}

export function isPlayableNewCampaignFaction(
  factionId: string,
): factionId is "castle" {
  return (
    getRootFactionDefinition(factionId)?.newCampaignAvailability === "playable"
  );
}

export type CatalogValidationIssueCode =
  | "duplicate-id"
  | "non-deterministic-order"
  | "broken-reference"
  | "incompatible-reference"
  | "missing-required-definition"
  | "incompatible-definition";

export interface CatalogValidationIssue {
  code: CatalogValidationIssueCode;
  path: string;
  message: string;
}

function pushIssue(
  issues: CatalogValidationIssue[],
  code: CatalogValidationIssueCode,
  path: string,
  message: string,
): void {
  issues.push({ code, path, message });
}

function validateOrderedDefinitions(
  family: string,
  definitions: readonly OrderedDefinition<string>[],
  issues: CatalogValidationIssue[],
): void {
  const ids = new Set<string>();
  const orders = new Set<number>();
  let previousOrder = -1;

  definitions.forEach((definition, index) => {
    const path = `${family}[${index}]`;
    if (ids.has(definition.id)) {
      pushIssue(
        issues,
        "duplicate-id",
        `${path}.id`,
        `Duplicate ${family} ID: ${definition.id}`,
      );
    }
    ids.add(definition.id);

    if (
      !Number.isInteger(definition.catalogOrder) ||
      definition.catalogOrder < 0 ||
      orders.has(definition.catalogOrder) ||
      definition.catalogOrder <= previousOrder
    ) {
      pushIssue(
        issues,
        "non-deterministic-order",
        `${path}.catalogOrder`,
        `${family} catalogOrder values must be unique, non-negative, and ascending.`,
      );
    }
    orders.add(definition.catalogOrder);
    previousOrder = definition.catalogOrder;
  });
}

function requireDefinition(
  definitions: Readonly<Record<string, unknown>>,
  id: string,
  path: string,
  issues: CatalogValidationIssue[],
): void {
  if (!definitions[id]) {
    pushIssue(
      issues,
      "missing-required-definition",
      path,
      `Missing required definition: ${id}`,
    );
  }
}

function validateHomeRingReference(
  reference: HomeRingContentReference,
  index: number,
  indexes: {
    resourceSites: Readonly<Record<string, unknown>>;
    regionTerrains: Readonly<Record<string, unknown>>;
    regionLocations: Readonly<Record<string, unknown>>;
  },
  issues: CatalogValidationIssue[],
): void {
  const path = `opening.homeRingContents[${index}].definitionId`;
  const allFamilies = [
    indexes.resourceSites,
    indexes.regionTerrains,
    indexes.regionLocations,
  ];
  const expected =
    reference.kind === "resource-site"
      ? indexes.resourceSites
      : reference.kind === "location"
        ? indexes.regionLocations
        : indexes.regionTerrains;

  if (expected[reference.definitionId]) return;

  const existsInAnotherFamily = allFamilies.some(
    (family) => family !== expected && Boolean(family[reference.definitionId]),
  );
  pushIssue(
    issues,
    existsInAnotherFamily ? "incompatible-reference" : "broken-reference",
    path,
    existsInAnotherFamily
      ? `${reference.definitionId} belongs to a different content family.`
      : `Unknown ${reference.kind} definition: ${reference.definitionId}`,
  );
}

export function validateCastleOpeningCatalog(
  catalog: CastleOpeningCatalog,
): readonly CatalogValidationIssue[] {
  const issues: CatalogValidationIssue[] = [];
  validateOrderedDefinitions("rootFactions", catalog.rootFactions, issues);
  validateOrderedDefinitions("settlements", catalog.settlements, issues);
  validateOrderedDefinitions("resourceSites", catalog.resourceSites, issues);
  validateOrderedDefinitions("regionTerrains", catalog.regionTerrains, issues);
  validateOrderedDefinitions("regionLocations", catalog.regionLocations, issues);

  const factions = createIndex(catalog.rootFactions);
  const settlements = createIndex(catalog.settlements);
  const resourceSites = createIndex(catalog.resourceSites);
  const regionTerrains = createIndex(catalog.regionTerrains);
  const regionLocations = createIndex(catalog.regionLocations);

  requireDefinition(factions, "castle", "rootFactions.castle", issues);
  requireDefinition(factions, "dungeon", "rootFactions.dungeon", issues);
  requireDefinition(settlements, "village", "settlements.village", issues);
  for (const id of ["food-site", "wood-site", "stone-site"]) {
    requireDefinition(resourceSites, id, `resourceSites.${id}`, issues);
  }
  requireDefinition(
    regionTerrains,
    "home-ring-terrain",
    "regionTerrains.home-ring-terrain",
    issues,
  );
  requireDefinition(
    regionLocations,
    "regional-dungeon",
    "regionLocations.regional-dungeon",
    issues,
  );
  requireDefinition(regionLocations, "ruin", "regionLocations.ruin", issues);

  for (const faction of catalog.rootFactions) {
    if (
      faction.capitalSettlementDefinitionId &&
      !settlements[faction.capitalSettlementDefinitionId]
    ) {
      pushIssue(
        issues,
        "broken-reference",
        `rootFactions.${faction.id}.capitalSettlementDefinitionId`,
        `Unknown settlement definition: ${faction.capitalSettlementDefinitionId}`,
      );
    }
  }

  for (const settlement of catalog.settlements) {
    if (!factions[settlement.rootFactionId]) {
      pushIssue(
        issues,
        "broken-reference",
        `settlements.${settlement.id}.rootFactionId`,
        `Unknown root faction definition: ${settlement.rootFactionId}`,
      );
    }
  }

  const castle = factions.castle as RootFactionDefinition | undefined;
  const dungeon = factions.dungeon as RootFactionDefinition | undefined;
  const village = settlements.village as SettlementDefinition | undefined;
  const playableFactions = catalog.rootFactions.filter(
    (definition) => definition.newCampaignAvailability === "playable",
  );
  if (
    !castle ||
    playableFactions.length !== 1 ||
    playableFactions[0]?.id !== "castle" ||
    castle.capitalSettlementDefinitionId !== "village"
  ) {
    pushIssue(
      issues,
      "incompatible-definition",
      "rootFactions.castle",
      "Castle must be the sole playable new-campaign faction and reference Village.",
    );
  }
  if (
    !dungeon ||
    dungeon.newCampaignAvailability !== "compatibility-only" ||
    dungeon.capitalSettlementDefinitionId !== null
  ) {
    pushIssue(
      issues,
      "incompatible-definition",
      "rootFactions.dungeon",
      "Dungeon must remain compatibility-only and must not define a new-campaign capital.",
    );
  }
  if (
    !village ||
    village.rootFactionId !== "castle" ||
    village.tier !== 1 ||
    village.settlementKind !== "village"
  ) {
    pushIssue(
      issues,
      "incompatible-definition",
      "settlements.village",
      "Village must be the Castle Tier-1 settlement definition.",
    );
  }

  if (
    !factions[catalog.opening.rootFactionId] ||
    catalog.opening.rootFactionId !== "castle"
  ) {
    pushIssue(
      issues,
      factions[catalog.opening.rootFactionId]
        ? "incompatible-reference"
        : "broken-reference",
      "opening.rootFactionId",
      "The Castle opening must reference the playable Castle root faction.",
    );
  }
  if (
    !settlements[catalog.opening.capitalSettlementDefinitionId] ||
    catalog.opening.capitalSettlementDefinitionId !== "village"
  ) {
    pushIssue(
      issues,
      settlements[catalog.opening.capitalSettlementDefinitionId]
        ? "incompatible-reference"
        : "broken-reference",
      "opening.capitalSettlementDefinitionId",
      "The Castle opening must reference the Tier-1 Village definition.",
    );
  }

  catalog.opening.homeRingContents.forEach((reference, index) =>
    validateHomeRingReference(
      reference,
      index,
      { resourceSites, regionTerrains, regionLocations },
      issues,
    ),
  );
  const expectedHomeRing = [
    "resource-site:food-site",
    "resource-site:wood-site",
    "resource-site:stone-site",
    "location:regional-dungeon",
    "location:ruin",
    "terrain-only:home-ring-terrain",
  ];
  const actualHomeRing = catalog.opening.homeRingContents.map(
    (reference) => `${reference.kind}:${reference.definitionId}`,
  );
  if (
    actualHomeRing.length !== expectedHomeRing.length ||
    actualHomeRing.some((reference, index) => reference !== expectedHomeRing[index])
  ) {
    pushIssue(
      issues,
      "incompatible-definition",
      "opening.homeRingContents",
      "The home-ring content order must contain Food, Wood, Stone, regional Dungeon, ruin, and terrain-only exactly once.",
    );
  }

  const regionalDungeon = regionLocations["regional-dungeon"] as
    | RegionLocationDefinition
    | undefined;
  const ruin = regionLocations.ruin as RegionLocationDefinition | undefined;
  if (
    !regionalDungeon ||
    regionalDungeon.locationKind !== "dungeon" ||
    regionalDungeon.interaction !== "exploration"
  ) {
    pushIssue(
      issues,
      "incompatible-definition",
      "regionLocations.regional-dungeon",
      "The regional Dungeon must be an explorable Dungeon location.",
    );
  }
  if (!ruin || ruin.locationKind !== "ruin" || ruin.interaction !== "inert") {
    pushIssue(
      issues,
      "incompatible-definition",
      "regionLocations.ruin",
      "The ruin must remain an inert regional location in EPIC 03.",
    );
  }

  return issues;
}

const catalogIssues = validateCastleOpeningCatalog(CASTLE_OPENING_CATALOG);
if (catalogIssues.length > 0) {
  throw new Error(
    `Invalid Castle opening content catalog: ${catalogIssues
      .map((issue) => `${issue.code}@${issue.path}`)
      .join(", ")}`,
  );
}
