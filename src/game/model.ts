import type {
  CampaignState,
  CampaignStateV4,
  CampaignStateV5,
  PlayerId,
} from "./campaignState.ts";

export { EMPTY_ATTRIBUTES } from "./campaignState.ts";
export type {
  AttributeKey,
  BoardId,
  CampaignId,
  CampaignSeed,
  CampaignState,
  CampaignStateV4,
  CampaignStateV5,
  CampaignFoundationV5,
  CampaignHeroStateV5,
  CampaignWorldStateV5,
  CampaignCapitalStateV5,
  CampaignResumeBoardIdV5,
  CellPosition,
  DungeonRoom,
  DungeonState,
  FactionType,
  GameSave,
  HeroAttributes,
  HeroClass,
  HeroSetupSelection,
  HeroState,
  LegacyHeroSetupSelection,
  HeroExplorationContext,
  HeroAttributesCompatibilitySnapshot,
  HeroAttributesCompatibilityRuleVersion,
  HeroVocation,
  LegacyPrototypeMetadata,
  PlayerId,
  RegionalDungeonStateV5,
  SkillId,
} from "./campaignState.ts";

export interface PlayerProfile {
  id: PlayerId;
  name: string;
  bannerColor: string;
  createdAt: string;
  lastPlayedAt: string | null;
}

export interface GameRegistryV1 {
  version: 1;
  players: PlayerProfile[];
  games: Record<string, CampaignStateV4>;
  lastActivePlayerId: PlayerId | null;
}

export interface GameRegistryV2 {
  version: 2;
  players: PlayerProfile[];
  games: Record<string, CampaignStateV5>;
  lastActivePlayerId: PlayerId | null;
}

export const EMPTY_REGISTRY_V2: GameRegistryV2 = {
  version: 2,
  players: [],
  games: {},
  lastActivePlayerId: null,
};

export type GameRegistry = GameRegistryV2;

export type AppView = "players" | "game";

export interface RuntimeState {
  hydrated: boolean;
  registry: GameRegistry;
  selectedPlayerId: PlayerId | null;
  activeGame: CampaignState | null;
  view: AppView;
}

export const EMPTY_REGISTRY: GameRegistry = {
  version: 2,
  players: [],
  games: {},
  lastActivePlayerId: null,
};
