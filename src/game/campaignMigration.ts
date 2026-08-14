import type {
  CampaignFoundationV5,
  CampaignHeroStateV5,
  CampaignResumeBoardIdV5,
  CampaignStateV4,
  CampaignStateV5,
  CellPosition,
  DungeonRoom,
  DungeonState,
  HeroAttributes,
  HeroState,
  RegionalDungeonStateV5,
} from "./campaignState.ts";
import {
  normalizeSupportedCampaignToV4,
  type SupportedLegacyCampaign,
} from "./createGame.ts";
import {
  deriveWorldSeed,
  generateStartingWorld,
  validateStartingWorld,
  type GeneratedStartingWorld,
  type LocationId,
} from "./generateStartingWorld.ts";
import { isCampaignSeed } from "./random.ts";
import { selectHeroAttributes } from "./selectors.ts";
import { SKILL_BY_ID, type SkillId } from "./skillTrees.ts";

const ATTRIBUTE_KEYS = ["str", "agy", "per", "int", "cha", "lead"] as const;
const LEGACY_BOARD_IDS = new Set([
  "setup",
  "hero",
  "settlement",
  "world",
  "dungeon",
  "combat",
  "diplomacy",
]);
const TARGET_BOARD_IDS = new Set<CampaignResumeBoardIdV5>([
  "setup",
  "hero",
  "settlement",
  "world",
  "dungeon",
]);
const HERO_CLASSES = new Set(["fighter", "ranger", "mage"]);
const HERO_VOCATIONS = new Set(["general", "spy", "diplomat"]);
const REGIONAL_DUNGEON_LOCATION_ID: LocationId =
  "location:regional-dungeon";

export type CampaignMigrationFailureCode =
  | "unsupported-version"
  | "invalid-campaign"
  | "incompatible-faction"
  | "generation-failed";

export interface CampaignMigrationFailure {
  code: CampaignMigrationFailureCode;
  message: string;
  path?: string;
  recoverable: true;
}

export type CampaignMigrationResult =
  | {
      ok: true;
      sourceVersion: 2 | 3 | 4 | 5;
      state: CampaignStateV5;
    }
  | { ok: false; failure: CampaignMigrationFailure };

export interface CampaignValidationIssue {
  path: string;
  message: string;
}

function failed(
  code: CampaignMigrationFailureCode,
  message: string,
  path?: string,
): CampaignMigrationResult {
  return {
    ok: false,
    failure: { code, message, path, recoverable: true },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isTimestamp(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

function isInteger(value: unknown): value is number {
  return Number.isInteger(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isSkillId(value: string): value is SkillId {
  return value in SKILL_BY_ID;
}

function isDungeonRoom(value: unknown): value is DungeonRoom {
  return (
    isRecord(value) &&
    isInteger(value.id) &&
    isInteger(value.x) &&
    isInteger(value.y) &&
    isInteger(value.width) &&
    value.width > 0 &&
    isInteger(value.height) &&
    value.height > 0
  );
}

function unknownKeys(
  value: Record<string, unknown>,
  allowed: readonly string[],
): string[] {
  const allowedKeys = new Set(allowed);
  return Object.keys(value).filter((key) => !allowedKeys.has(key));
}

function isPosition(value: unknown): value is CellPosition {
  return isRecord(value) && isInteger(value.x) && isInteger(value.y);
}

function isAttributes(value: unknown): value is HeroAttributes {
  return (
    isRecord(value) &&
    ATTRIBUTE_KEYS.every((key) => isFiniteNumber(value[key]))
  );
}

function isValidFreeAttributes(value: unknown): value is HeroAttributes {
  return (
    isAttributes(value) &&
    ATTRIBUTE_KEYS.every((key) => Number.isInteger(value[key]) && value[key] >= 0) &&
    ATTRIBUTE_KEYS.reduce((total, key) => total + value[key], 0) === 2
  );
}

function isPositionInsideDungeon(
  position: CellPosition,
  dungeon: Pick<DungeonState, "grid" | "tiles">,
): boolean {
  return (
    Boolean(dungeon) &&
    Boolean(dungeon.grid) &&
    Array.isArray(dungeon.tiles) &&
    Number.isInteger(dungeon.grid.columns) &&
    Number.isInteger(dungeon.grid.rows) &&
    position.x >= 0 &&
    position.x < dungeon.grid.columns &&
    position.y >= 0 &&
    position.y < dungeon.grid.rows &&
    dungeon.tiles[position.y]?.[position.x] === "."
  );
}

function isCellKeyInsideDungeon(
  value: string,
  dungeon: Pick<DungeonState, "grid">,
): boolean {
  const match = /^(-?\d+),(-?\d+)$/.exec(value);
  if (!match) return false;
  const x = Number(match[1]);
  const y = Number(match[2]);
  return (
    x >= 0 && x < dungeon.grid.columns && y >= 0 && y < dungeon.grid.rows
  );
}

function validateDungeon(value: unknown, path: string): CampaignValidationIssue[] {
  const issues: CampaignValidationIssue[] = [];
  if (!isRecord(value) || !isRecord(value.grid)) {
    return [{ path, message: "Dungeon snapshot must be an object." }];
  }
  if (!isInteger(value.level) || value.level < 1) {
    issues.push({ path: `${path}.level`, message: "Dungeon level must be a positive integer." });
  }
  if (!isInteger(value.day) || value.day < 0) {
    issues.push({ path: `${path}.day`, message: "Legacy Dungeon day must be a non-negative integer." });
  }
  if (!isFiniteNumber(value.treasury)) {
    issues.push({ path: `${path}.treasury`, message: "Legacy Dungeon treasury must be finite." });
  }
  if (
    !isInteger(value.grid.columns) ||
    value.grid.columns < 1 ||
    !isInteger(value.grid.rows) ||
    value.grid.rows < 1
  ) {
    issues.push({ path: `${path}.grid`, message: "Dungeon grid dimensions must be positive integers." });
  }
  if (!isCampaignSeed(value.seed)) {
    issues.push({ path: `${path}.seed`, message: "Dungeon seed must be an unsigned 32-bit integer." });
  }
  if (
    !Array.isArray(value.tiles) ||
    !isInteger(value.grid.rows) ||
    !isInteger(value.grid.columns) ||
    value.tiles.length !== value.grid.rows ||
    !value.tiles.every(
      (row) =>
        typeof row === "string" &&
        row.length === value.grid.columns &&
        /^[#.]+$/.test(row),
    )
  ) {
    issues.push({ path: `${path}.tiles`, message: "Dungeon tiles must match the declared grid and tile vocabulary." });
  }
  if (
    !Array.isArray(value.rooms) ||
    !value.rooms.every(isDungeonRoom)
  ) {
    issues.push({ path: `${path}.rooms`, message: "Dungeon rooms must contain integer geometry." });
  } else if (
    isInteger(value.grid.columns) &&
    isInteger(value.grid.rows) &&
    value.rooms.some(
      (room) =>
        room.x < 0 ||
        room.y < 0 ||
        room.x + room.width > value.grid.columns ||
        room.y + room.height > value.grid.rows,
    )
  ) {
    issues.push({ path: `${path}.rooms`, message: "Dungeon room geometry must remain inside the declared grid." });
  }
  if (!isPosition(value.start)) {
    issues.push({ path: `${path}.start`, message: "Dungeon start must be a cell position." });
  }
  if (!isPosition(value.heart)) {
    issues.push({ path: `${path}.heart`, message: "Dungeon Heart must be a cell position." });
  }
  if (
    Array.isArray(value.tiles) &&
    isInteger(value.grid.columns) &&
    isInteger(value.grid.rows)
  ) {
    const dungeon = value as unknown as Pick<DungeonState, "grid" | "tiles">;
    if (isPosition(value.start) && !isPositionInsideDungeon(value.start, dungeon)) {
      issues.push({ path: `${path}.start`, message: "Dungeon start must be a walkable in-bounds cell." });
    }
    if (isPosition(value.heart) && !isPositionInsideDungeon(value.heart, dungeon)) {
      issues.push({ path: `${path}.heart`, message: "Dungeon Heart must be a walkable in-bounds cell." });
    }
  }
  if (
    !Array.isArray(value.discovered) ||
    !value.discovered.every((cell) => typeof cell === "string") ||
    new Set(value.discovered).size !== value.discovered.length ||
    (isInteger(value.grid.columns) &&
      isInteger(value.grid.rows) &&
      !value.discovered.every((cell) =>
        isCellKeyInsideDungeon(String(cell), value as unknown as Pick<DungeonState, "grid">),
      ))
  ) {
    issues.push({ path: `${path}.discovered`, message: "Discovered cells must be unique in-bounds cell keys." });
  }
  if (typeof value.heartReached !== "boolean") {
    issues.push({ path: `${path}.heartReached`, message: "Dungeon Heart history must be boolean." });
  }
  if (typeof value.settlementClaimed !== "boolean") {
    issues.push({ path: `${path}.settlementClaimed`, message: "Legacy Settlement claim history must be boolean." });
  }
  return issues;
}

function validateLegacyHero(
  value: unknown,
  dungeon: DungeonState,
): CampaignValidationIssue[] {
  const issues: CampaignValidationIssue[] = [];
  if (!isRecord(value)) {
    return [{ path: "hero", message: "Completed legacy Setup requires a Hero object." }];
  }
  if (value.faction !== "castle" && value.faction !== "dungeon") {
    issues.push({ path: "hero.faction", message: "Legacy Hero faction is invalid." });
  }
  if (!HERO_CLASSES.has(String(value.heroClass))) {
    issues.push({ path: "hero.heroClass", message: "Legacy Hero Class is invalid." });
  }
  if (!HERO_VOCATIONS.has(String(value.vocation))) {
    issues.push({ path: "hero.vocation", message: "Legacy Hero Vocation is invalid." });
  }
  if (!isValidFreeAttributes(value.freeAttributes)) {
    issues.push({ path: "hero.freeAttributes", message: "Legacy Hero allocation is invalid." });
  }
  if (!isAttributes(value.attributes)) {
    issues.push({ path: "hero.attributes", message: "Legacy Hero attribute snapshot is invalid." });
  }
  if (typeof value.bonusSkill !== "string") {
    issues.push({ path: "hero.bonusSkill", message: "Legacy bonus skill reference is invalid." });
  }
  if (
    !isRecord(value.skills) ||
    !Object.values(value.skills).every(isFiniteNumber)
  ) {
    issues.push({ path: "hero.skills", message: "Legacy Hero skill ranks are invalid." });
  }
  if (!isPosition(value.position) || !isPositionInsideDungeon(value.position, dungeon)) {
    issues.push({ path: "hero.position", message: "Legacy exploration position must be a walkable Dungeon cell." });
  }
  if (value.visionRadius !== 1) {
    issues.push({ path: "hero.visionRadius", message: "Only the version-4 exploration radius is supported." });
  }
  return issues;
}

function validateLegacyCampaign(
  value: unknown,
  expectedPlayerId: string,
): CampaignValidationIssue[] {
  if (!isRecord(value)) {
    return [{ path: "$", message: "Campaign source must be an object." }];
  }
  const issues: CampaignValidationIssue[] = [];
  if (![2, 3, 4].includes(Number(value.version))) {
    issues.push({ path: "version", message: "Campaign version is unsupported." });
  }
  if (typeof value.id !== "string" || value.id.length === 0) {
    issues.push({ path: "id", message: "Campaign ID must be a non-empty string." });
  }
  if (value.playerId !== expectedPlayerId) {
    issues.push({ path: "playerId", message: "Campaign owner does not match its registry key." });
  }
  if (!isTimestamp(value.createdAt)) {
    issues.push({ path: "createdAt", message: "Campaign creation timestamp is invalid." });
  }
  if (!isTimestamp(value.updatedAt)) {
    issues.push({ path: "updatedAt", message: "Campaign modification timestamp is invalid." });
  }
  if (!LEGACY_BOARD_IDS.has(String(value.activeBoardId))) {
    issues.push({ path: "activeBoardId", message: "Legacy resume board is invalid." });
  }
  if (typeof value.setupComplete !== "boolean") {
    issues.push({ path: "setupComplete", message: "Legacy Setup state is invalid." });
  }
  const dungeonIssues = validateDungeon(value.dungeon, "dungeon");
  issues.push(...dungeonIssues);
  if (value.version === 4 && !isCampaignSeed(value.campaignSeed)) {
    issues.push({ path: "campaignSeed", message: "Version-4 campaign seed is invalid." });
  }
  if (value.setupComplete === false) {
    if (value.hero !== null) {
      issues.push({ path: "hero", message: "Incomplete Setup cannot contain a completed Hero." });
    }
    if (value.activeBoardId !== "setup") {
      issues.push({ path: "activeBoardId", message: "Incomplete Setup must resume on Setup." });
    }
  } else if (value.setupComplete === true && dungeonIssues.length === 0) {
    issues.push(...validateLegacyHero(value.hero, value.dungeon as DungeonState));
  }
  return issues;
}

function positiveSkillRanks(hero: HeroState): Partial<Record<SkillId, number>> {
  const ranks: Partial<Record<SkillId, number>> = {};
  for (const skillId of Object.keys(SKILL_BY_ID) as SkillId[]) {
    const rank = hero.skills[skillId];
    if (Number.isInteger(rank) && rank > 0) ranks[skillId] = rank;
  }
  return ranks;
}

function mapResumeBoard(boardId: CampaignStateV4["activeBoardId"]): Exclude<CampaignResumeBoardIdV5, "setup"> {
  return boardId === "hero" ||
    boardId === "settlement" ||
    boardId === "world" ||
    boardId === "dungeon"
    ? boardId
    : "settlement";
}

function mapReturnBoard(boardId: CampaignStateV4["activeBoardId"]): "world" | "settlement" {
  return boardId === "world" ? "world" : "settlement";
}

function retainDungeon(dungeon: DungeonState): RegionalDungeonStateV5 {
  return {
    dungeonDefinitionId: "regional-dungeon",
    seed: dungeon.seed,
    level: dungeon.level,
    grid: structuredClone(dungeon.grid),
    rooms: structuredClone(dungeon.rooms),
    tiles: [...dungeon.tiles],
    start: { ...dungeon.start },
    heart: { ...dungeon.heart },
    discovered: [...dungeon.discovered],
    heartReached: dungeon.heartReached,
    legacyPrototypeMetadata: {
      dungeonDay: dungeon.day,
      dungeonTreasury: dungeon.treasury,
      settlementClaimed: dungeon.settlementClaimed,
    },
  };
}

function createFoundation(
  source: CampaignStateV4 & { hero: HeroState },
): CampaignFoundationV5 {
  const generated = generateStartingWorld(source.campaignSeed);
  const world = {
    generatorVersion: generated.generatorVersion,
    seed: generated.seed,
    homeRegionId: generated.homeRegionId,
    regions: structuredClone(generated.regions),
    sites: structuredClone(generated.sites),
    locations: structuredClone(generated.locations),
  };
  const hero: CampaignHeroStateV5 = {
    heroClass: source.hero.heroClass,
    vocation: source.hero.vocation,
    freeAttributes: { ...source.hero.freeAttributes },
    bonusSkillId: source.hero.bonusSkill,
    skillRanks: positiveSkillRanks(source.hero),
    attributesCompatibility: {
      ruleVersion: "v4-path-bonus-1",
      values: selectHeroAttributes(source.hero),
    },
    strategicRegionId: generated.homeRegionId,
    explorationContext: {
      locationId: REGIONAL_DUNGEON_LOCATION_ID,
      cell: { ...source.hero.position },
      returnBoardId: mapReturnBoard(source.activeBoardId),
    },
  };
  return {
    rootFactionId: "castle",
    hero,
    capital: structuredClone(generated.capital),
    world,
    regionalDungeons: {
      [REGIONAL_DUNGEON_LOCATION_ID]: retainDungeon(source.dungeon),
    },
  };
}

function convertV4(source: CampaignStateV4): CampaignMigrationResult {
  if (!source.setupComplete || !source.hero) {
    return {
      ok: true,
      sourceVersion: 4,
      state: {
        version: 5,
        id: source.id,
        playerId: source.playerId,
        campaignSeed: source.campaignSeed,
        createdAt: source.createdAt,
        updatedAt: source.updatedAt,
        activeBoardId: "setup",
        foundation: null,
      },
    };
  }
  if (source.hero.faction === "dungeon") {
    return failed(
      "incompatible-faction",
      "Dungeon-faction prototype campaigns cannot be converted to Castle. The original source must be retained until an explicit verified replacement.",
      "hero.faction",
    );
  }

  let foundation: CampaignFoundationV5;
  try {
    foundation = createFoundation(source as CampaignStateV4 & { hero: HeroState });
  } catch {
    return failed(
      "generation-failed",
      "The Castle opening could not be generated deterministically. The original campaign was not changed.",
    );
  }
  const state: CampaignStateV5 = {
    version: 5,
    id: source.id,
    playerId: source.playerId,
    campaignSeed: source.campaignSeed,
    createdAt: source.createdAt,
    updatedAt: source.updatedAt,
    activeBoardId: mapResumeBoard(source.activeBoardId),
    foundation,
  };
  const issues = validateCampaignStateV5(state);
  return issues.length === 0
    ? { ok: true, sourceVersion: 4, state }
    : failed("invalid-campaign", issues[0].message, issues[0].path);
}

function validateRegionalDungeon(
  value: unknown,
  path: string,
): CampaignValidationIssue[] {
  if (!isRecord(value)) {
    return [{ path, message: "Regional Dungeon state must be an object." }];
  }
  const legacyShape = {
    ...value,
    day: 0,
    treasury: 0,
    settlementClaimed: false,
  };
  const issues = validateDungeon(legacyShape, path).filter(
    (issue) =>
      !issue.path.endsWith(".day") &&
      !issue.path.endsWith(".treasury") &&
      !issue.path.endsWith(".settlementClaimed"),
  );
  const extras = unknownKeys(value, [
    "dungeonDefinitionId",
    "seed",
    "level",
    "grid",
    "rooms",
    "tiles",
    "start",
    "heart",
    "discovered",
    "heartReached",
    "legacyPrototypeMetadata",
  ]);
  if (extras.length > 0) {
    issues.push({ path, message: `Regional Dungeon contains unsupported fields: ${extras.join(", ")}.` });
  }
  if (value.dungeonDefinitionId !== "regional-dungeon") {
    issues.push({ path: `${path}.dungeonDefinitionId`, message: "Regional Dungeon definition reference is invalid." });
  }
  if (value.legacyPrototypeMetadata !== undefined) {
    const metadata = value.legacyPrototypeMetadata;
    if (
      !isRecord(metadata) ||
      !isInteger(metadata.dungeonDay) ||
      metadata.dungeonDay < 0 ||
      !isFiniteNumber(metadata.dungeonTreasury) ||
      typeof metadata.settlementClaimed !== "boolean"
    ) {
      issues.push({ path: `${path}.legacyPrototypeMetadata`, message: "Legacy prototype metadata is invalid." });
    }
  }
  return issues;
}

function validateTargetHero(
  value: unknown,
  foundation: CampaignFoundationV5,
  regionalDungeon: RegionalDungeonStateV5,
): CampaignValidationIssue[] {
  if (!isRecord(value)) {
    return [{ path: "foundation.hero", message: "Target Hero must be an object." }];
  }
  const issues: CampaignValidationIssue[] = [];
  const extras = unknownKeys(value, [
    "heroClass",
    "vocation",
    "freeAttributes",
    "bonusSkillId",
    "skillRanks",
    "attributesCompatibility",
    "strategicRegionId",
    "explorationContext",
  ]);
  if (extras.length > 0) {
    issues.push({ path: "foundation.hero", message: `Target Hero contains unsupported or competing fields: ${extras.join(", ")}.` });
  }
  if (!HERO_CLASSES.has(String(value.heroClass))) {
    issues.push({ path: "foundation.hero.heroClass", message: "Target Hero Class is invalid." });
  }
  if (!HERO_VOCATIONS.has(String(value.vocation))) {
    issues.push({ path: "foundation.hero.vocation", message: "Target Hero Vocation is invalid." });
  }
  if (!isValidFreeAttributes(value.freeAttributes)) {
    issues.push({ path: "foundation.hero.freeAttributes", message: "Target Hero allocation is invalid." });
  }
  if (
    typeof value.bonusSkillId !== "string" ||
    !isSkillId(value.bonusSkillId)
  ) {
    issues.push({ path: "foundation.hero.bonusSkillId", message: "Target Hero bonus skill is invalid." });
  }
  if (
    !isRecord(value.skillRanks) ||
    Object.entries(value.skillRanks).some(
      ([skillId, rank]) => !isSkillId(skillId) || !isInteger(rank) || rank <= 0,
    )
  ) {
    issues.push({ path: "foundation.hero.skillRanks", message: "Target Hero ranks must contain only positive ranks for known skills." });
  }
  if (
    !isRecord(value.attributesCompatibility) ||
    value.attributesCompatibility.ruleVersion !== "v4-path-bonus-1" ||
    !isAttributes(value.attributesCompatibility.values)
  ) {
    issues.push({ path: "foundation.hero.attributesCompatibility", message: "Target Hero compatibility attributes are invalid." });
  }
  if (
    typeof value.strategicRegionId !== "string" ||
    !Array.isArray(foundation.world.regions) ||
    !foundation.world.regions.some((region) => region.id === value.strategicRegionId)
  ) {
    issues.push({ path: "foundation.hero.strategicRegionId", message: "Target Hero strategic region is invalid." });
  }
  if (value.explorationContext !== null) {
    const context = value.explorationContext;
    if (
      !isRecord(context) ||
      context.locationId !== REGIONAL_DUNGEON_LOCATION_ID ||
      !isPosition(context.cell) ||
      !isPositionInsideDungeon(context.cell, regionalDungeon as unknown as DungeonState) ||
      (context.returnBoardId !== "world" && context.returnBoardId !== "settlement")
    ) {
      issues.push({ path: "foundation.hero.explorationContext", message: "Target Hero exploration context is invalid." });
    }
  }
  return issues;
}

export function validateCampaignStateV5(
  value: unknown,
): readonly CampaignValidationIssue[] {
  if (!isRecord(value)) {
    return [{ path: "$", message: "Target campaign must be an object." }];
  }
  const issues: CampaignValidationIssue[] = [];
  const topLevelExtras = unknownKeys(value, [
    "version",
    "id",
    "playerId",
    "campaignSeed",
    "createdAt",
    "updatedAt",
    "activeBoardId",
    "foundation",
  ]);
  if (topLevelExtras.length > 0) {
    issues.push({ path: "$", message: `Target campaign contains unsupported fields: ${topLevelExtras.join(", ")}.` });
  }
  if (value.version !== 5) issues.push({ path: "version", message: "Target campaign version must be 5." });
  if (typeof value.id !== "string" || value.id.length === 0) issues.push({ path: "id", message: "Target campaign ID is invalid." });
  if (typeof value.playerId !== "string" || value.playerId.length === 0) issues.push({ path: "playerId", message: "Target player reference is invalid." });
  if (!isCampaignSeed(value.campaignSeed)) issues.push({ path: "campaignSeed", message: "Target campaign seed is invalid." });
  if (!isTimestamp(value.createdAt)) issues.push({ path: "createdAt", message: "Target creation timestamp is invalid." });
  if (!isTimestamp(value.updatedAt)) issues.push({ path: "updatedAt", message: "Target modification timestamp is invalid." });
  if (!TARGET_BOARD_IDS.has(value.activeBoardId as CampaignResumeBoardIdV5)) issues.push({ path: "activeBoardId", message: "Target resume board is invalid." });

  if (value.foundation === null) {
    if (value.activeBoardId !== "setup") issues.push({ path: "activeBoardId", message: "A pre-Setup target campaign must resume on Setup." });
    return issues;
  }
  if (!isRecord(value.foundation)) {
    issues.push({ path: "foundation", message: "Completed target foundation must be an object." });
    return issues;
  }
  if (value.activeBoardId === "setup") issues.push({ path: "activeBoardId", message: "A completed target campaign cannot resume on Setup." });
  const foundation = value.foundation as unknown as CampaignFoundationV5;
  const foundationExtras = unknownKeys(value.foundation, [
    "rootFactionId",
    "hero",
    "capital",
    "world",
    "regionalDungeons",
  ]);
  if (foundationExtras.length > 0) {
    issues.push({ path: "foundation", message: `Target foundation contains unsupported fields: ${foundationExtras.join(", ")}.` });
  }
  if (foundation.rootFactionId !== "castle") issues.push({ path: "foundation.rootFactionId", message: "Castle must own target root-faction authority." });
  if (!isRecord(foundation.capital) || !isRecord(foundation.world)) {
    issues.push({ path: "foundation", message: "Target capital and World snapshots are required." });
    return issues;
  }
  const hasWorldArrays =
    Array.isArray(foundation.world.regions) &&
    Array.isArray(foundation.world.sites) &&
    Array.isArray(foundation.world.locations);
  if (!hasWorldArrays) {
    issues.push({ path: "foundation.world", message: "Target World regions, sites, and locations must be arrays." });
  }
  const capitalExtras = unknownKeys(foundation.capital as unknown as Record<string, unknown>, [
    "id",
    "definitionId",
    "tier",
    "regionId",
  ]);
  if (capitalExtras.length > 0) {
    issues.push({ path: "foundation.capital", message: `Target capital contains unsupported fields: ${capitalExtras.join(", ")}.` });
  }
  const worldExtras = unknownKeys(foundation.world as unknown as Record<string, unknown>, [
    "generatorVersion",
    "seed",
    "homeRegionId",
    "regions",
    "sites",
    "locations",
  ]);
  if (worldExtras.length > 0) {
    issues.push({ path: "foundation.world", message: `Target World contains unsupported fields: ${worldExtras.join(", ")}.` });
  }
  if (
    foundation.capital.id !== "settlement:capital" ||
    foundation.capital.definitionId !== "village" ||
    foundation.capital.tier !== 1 ||
    foundation.capital.regionId !== foundation.world.homeRegionId
  ) {
    issues.push({ path: "foundation.capital", message: "Target capital must be the Tier-1 Village in the home region." });
  }
  if (hasWorldArrays) {
    const generatedView: GeneratedStartingWorld = {
      ...foundation.world,
      capital: foundation.capital,
    };
    try {
      for (const issue of validateStartingWorld(generatedView)) {
        issues.push({ path: `foundation.world.${issue.path}`, message: issue.message });
      }
    } catch {
      issues.push({ path: "foundation.world", message: "Target World snapshot is structurally invalid." });
    }
  }
  if (
    isCampaignSeed(value.campaignSeed) &&
    foundation.world.seed !== deriveWorldSeed(value.campaignSeed)
  ) {
    issues.push({ path: "foundation.world.seed", message: "Target World seed provenance does not match the campaign seed." });
  }
  if (!isRecord(foundation.regionalDungeons)) {
    issues.push({ path: "foundation.regionalDungeons", message: "Regional Dungeon state is required." });
    return issues;
  }
  const dungeonKeys = Object.keys(foundation.regionalDungeons);
  if (
    dungeonKeys.length !== 1 ||
    dungeonKeys[0] !== REGIONAL_DUNGEON_LOCATION_ID
  ) {
    issues.push({ path: "foundation.regionalDungeons", message: "Exactly one regional Dungeon must be keyed by its location ID." });
  }
  const regionalDungeon = foundation.regionalDungeons[
    REGIONAL_DUNGEON_LOCATION_ID
  ];
  if (!regionalDungeon) {
    issues.push({ path: `foundation.regionalDungeons.${REGIONAL_DUNGEON_LOCATION_ID}`, message: "Regional Dungeon snapshot is missing." });
    return issues;
  }
  issues.push(
    ...validateRegionalDungeon(
      regionalDungeon,
      `foundation.regionalDungeons.${REGIONAL_DUNGEON_LOCATION_ID}`,
    ),
  );
  if (
    Array.isArray(foundation.world.locations) &&
    !foundation.world.locations.some(
      (location) =>
        location.id === REGIONAL_DUNGEON_LOCATION_ID &&
        location.definitionId === "regional-dungeon",
    )
  ) {
    issues.push({ path: "foundation.world.locations", message: "The retained Dungeon must belong to the generated regional Dungeon location." });
  }
  issues.push(...validateTargetHero(foundation.hero, foundation, regionalDungeon));
  if (
    value.activeBoardId === "dungeon" &&
    (!isRecord(foundation.hero) || foundation.hero.explorationContext === null)
  ) {
    issues.push({ path: "activeBoardId", message: "Dungeon resume requires a valid exploration context." });
  }
  return issues;
}

export function migrateCampaignToV5(
  value: unknown,
  expectedPlayerId: string,
): CampaignMigrationResult {
  if (!isRecord(value)) {
    return failed("invalid-campaign", "Campaign source must be an object.", "$");
  }
  if (value.version === 5) {
    const issues = validateCampaignStateV5(value);
    if (issues.length > 0) {
      return failed("invalid-campaign", issues[0].message, issues[0].path);
    }
    if (value.playerId !== expectedPlayerId) {
      return failed(
        "invalid-campaign",
        "Campaign owner does not match its registry key.",
        "playerId",
      );
    }
    try {
      return {
        ok: true,
        sourceVersion: 5,
        state: structuredClone(value) as CampaignStateV5,
      };
    } catch {
      return failed(
        "invalid-campaign",
        "The target campaign could not be cloned safely.",
      );
    }
  }
  if (value.version !== 2 && value.version !== 3 && value.version !== 4) {
    return failed(
      "unsupported-version",
      "This campaign version is not supported by the version-5 migration chain.",
      "version",
    );
  }

  const issues = validateLegacyCampaign(value, expectedPlayerId);
  if (issues.length > 0) {
    return failed("invalid-campaign", issues[0].message, issues[0].path);
  }

  let normalized: CampaignStateV4;
  try {
    normalized = normalizeSupportedCampaignToV4(
      structuredClone(value) as SupportedLegacyCampaign,
    );
  } catch {
    return failed(
      "invalid-campaign",
      "The supported legacy campaign could not be normalized safely.",
    );
  }
  const converted = convertV4(normalized);
  return converted.ok
    ? { ...converted, sourceVersion: value.version }
    : converted;
}
