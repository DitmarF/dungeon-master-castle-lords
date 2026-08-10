import type { CampaignState, PlayerId } from "./campaignState.ts";

export { EMPTY_ATTRIBUTES } from "./campaignState.ts";
export type {
  AttributeKey,
  BoardId,
  CampaignId,
  CampaignSeed,
  CampaignState,
  CellPosition,
  DungeonRoom,
  DungeonState,
  FactionType,
  GameSave,
  HeroAttributes,
  HeroClass,
  HeroSetupSelection,
  HeroState,
  HeroVocation,
  PlayerId,
  SkillId,
} from "./campaignState.ts";

export interface PlayerProfile {
  id: PlayerId;
  name: string;
  bannerColor: string;
  createdAt: string;
  lastPlayedAt: string | null;
}

export interface GameRegistry {
  version: 1;
  players: PlayerProfile[];
  games: Record<string, CampaignState>;
  lastActivePlayerId: PlayerId | null;
}

export type AppView = "players" | "game";

export interface RuntimeState {
  hydrated: boolean;
  registry: GameRegistry;
  selectedPlayerId: PlayerId | null;
  activeGame: CampaignState | null;
  view: AppView;
}

export const EMPTY_REGISTRY: GameRegistry = {
  version: 1,
  players: [],
  games: {},
  lastActivePlayerId: null,
};
