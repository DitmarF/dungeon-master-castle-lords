import type { SkillId } from "./skillTrees.ts";
import type { CampaignId, PlayerId } from "./identity.ts";
import type { CampaignSeed } from "./random.ts";
import type {
  GeneratedCapitalSnapshot,
  GeneratedLocationSnapshot,
  GeneratedRegionSnapshot,
  GeneratedSiteSnapshot,
  LocationId,
  RegionId,
  WorldGeneratorVersion,
  WorldSeed,
} from "./generateStartingWorld.ts";

export type { SkillId } from "./skillTrees.ts";
export type { CampaignId, PlayerId } from "./identity.ts";
export type { CampaignSeed } from "./random.ts";

export type BoardId =
  | "setup"
  | "hero"
  | "settlement"
  | "world"
  | "dungeon"
  | "combat"
  | "diplomacy";

export type FactionType = "dungeon" | "castle";
export type HeroClass = "fighter" | "ranger" | "mage";
export type HeroVocation = "general" | "spy" | "diplomat";
export type AttributeKey = "str" | "agy" | "per" | "int" | "cha" | "lead";

export interface HeroAttributes {
  str: number;
  agy: number;
  per: number;
  int: number;
  cha: number;
  lead: number;
}

export interface CellPosition {
  x: number;
  y: number;
}

export interface HeroSetupSelection {
  heroClass: HeroClass;
  vocation: HeroVocation;
  freeAttributes: HeroAttributes;
  bonusSkill: SkillId;
}

export interface LegacyHeroSetupSelection extends HeroSetupSelection {
  faction: FactionType;
}

export interface HeroState extends LegacyHeroSetupSelection {
  attributes: HeroAttributes;
  skills: Record<SkillId, number>;
  position: CellPosition;
  visionRadius: number;
}

export interface DungeonRoom {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DungeonState {
  level: number;
  day: number;
  treasury: number;
  grid: {
    columns: number;
    rows: number;
  };
  seed: number;
  rooms: DungeonRoom[];
  tiles: string[];
  start: CellPosition;
  heart: CellPosition;
  discovered: string[];
  heartReached: boolean;
  settlementClaimed: boolean;
}

export interface CampaignStateV4 {
  version: 4;
  id: CampaignId;
  playerId: PlayerId;
  campaignSeed: CampaignSeed;
  createdAt: string;
  updatedAt: string;
  activeBoardId: BoardId;
  setupComplete: boolean;
  hero: HeroState | null;
  dungeon: DungeonState;
}

export type CampaignResumeBoardIdV5 =
  | "setup"
  | "hero"
  | "settlement"
  | "world"
  | "dungeon";

export type HeroAttributesCompatibilityRuleVersion = "v4-path-bonus-1";

export interface HeroAttributesCompatibilitySnapshot {
  ruleVersion: HeroAttributesCompatibilityRuleVersion;
  values: HeroAttributes;
}

export interface HeroExplorationContext {
  locationId: LocationId;
  cell: CellPosition;
  returnBoardId: "world" | "settlement";
}

export interface CampaignHeroStateV5 {
  heroClass: HeroClass;
  vocation: HeroVocation;
  freeAttributes: HeroAttributes;
  bonusSkillId: SkillId;
  skillRanks: Partial<Record<SkillId, number>>;
  attributesCompatibility: HeroAttributesCompatibilitySnapshot;
  strategicRegionId: RegionId;
  explorationContext: HeroExplorationContext | null;
}

export type CampaignCapitalStateV5 = GeneratedCapitalSnapshot;

export interface CampaignWorldStateV5 {
  generatorVersion: WorldGeneratorVersion;
  seed: WorldSeed;
  homeRegionId: RegionId;
  regions: readonly GeneratedRegionSnapshot[];
  sites: readonly GeneratedSiteSnapshot[];
  locations: readonly GeneratedLocationSnapshot[];
}

export interface LegacyPrototypeMetadata {
  dungeonDay: number;
  dungeonTreasury: number;
  settlementClaimed: boolean;
}

export interface RegionalDungeonStateV5 {
  dungeonDefinitionId: "regional-dungeon";
  seed: CampaignSeed;
  level: number;
  grid: {
    columns: number;
    rows: number;
  };
  rooms: DungeonRoom[];
  tiles: string[];
  start: CellPosition;
  heart: CellPosition;
  discovered: string[];
  heartReached: boolean;
  legacyPrototypeMetadata?: LegacyPrototypeMetadata;
}

export interface CampaignFoundationV5 {
  rootFactionId: "castle";
  hero: CampaignHeroStateV5;
  capital: CampaignCapitalStateV5;
  world: CampaignWorldStateV5;
  regionalDungeons: Record<
    "location:regional-dungeon",
    RegionalDungeonStateV5
  >;
}

/**
 * Accepted EPIC 03 target payload. E03-T05 owns this schema and its pure
 * migration; E03-T06 owns switching new-game Setup/application transitions to
 * this shape.
 */
export interface CampaignStateV5 {
  version: 5;
  id: CampaignId;
  playerId: PlayerId;
  campaignSeed: CampaignSeed;
  createdAt: string;
  updatedAt: string;
  activeBoardId: CampaignResumeBoardIdV5;
  foundation: CampaignFoundationV5 | null;
}

/** Current application campaign after the E03-T06 Village-first cutover. */
export type CampaignState = CampaignStateV5;

/** Current serialized version-5 compatibility name. */
export type GameSave = CampaignStateV5;

export const EMPTY_ATTRIBUTES: HeroAttributes = {
  str: 0,
  agy: 0,
  per: 0,
  int: 0,
  cha: 0,
  lead: 0,
};
