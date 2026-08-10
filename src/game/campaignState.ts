import type { SkillId } from "./skillTrees.ts";

export type { SkillId } from "./skillTrees.ts";

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
  faction: FactionType;
  heroClass: HeroClass;
  vocation: HeroVocation;
  freeAttributes: HeroAttributes;
  bonusSkill: SkillId;
}

export interface HeroState extends HeroSetupSelection {
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

export interface CampaignState {
  version: 3;
  id: string;
  playerId: string;
  createdAt: string;
  updatedAt: string;
  activeBoardId: BoardId;
  setupComplete: boolean;
  hero: HeroState | null;
  dungeon: DungeonState;
}

/** Serialized version-3 compatibility name. */
export type GameSave = CampaignState;

export const EMPTY_ATTRIBUTES: HeroAttributes = {
  str: 0,
  agy: 0,
  per: 0,
  int: 0,
  cha: 0,
  lead: 0,
};
