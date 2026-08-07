export type BoardId = "dungeon" | "world" | "combat";

export interface PlayerProfile {
  id: string;
  name: string;
  bannerColor: string;
  createdAt: string;
  lastPlayedAt: string | null;
}

export interface DungeonState {
  level: number;
  day: number;
  treasury: number;
  grid: {
    columns: number;
    rows: number;
  };
  rooms: never[];
}

export interface GameSave {
  version: 1;
  id: string;
  playerId: string;
  createdAt: string;
  updatedAt: string;
  activeBoardId: BoardId;
  dungeon: DungeonState;
}

export interface GameRegistry {
  version: 1;
  players: PlayerProfile[];
  games: Record<string, GameSave>;
  lastActivePlayerId: string | null;
}

export type AppView = "players" | "game";

export interface RuntimeState {
  hydrated: boolean;
  registry: GameRegistry;
  selectedPlayerId: string | null;
  activeGame: GameSave | null;
  view: AppView;
}

export const EMPTY_REGISTRY: GameRegistry = {
  version: 1,
  players: [],
  games: {},
  lastActivePlayerId: null,
};
