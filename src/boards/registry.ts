import type { ComponentType } from "react";
import type { BoardId, GameSave } from "../game/model";
import type { IconName } from "../ui/GameIcon";
import { DungeonBoard } from "./DungeonBoard";
import { SettlementBoard } from "./SettlementBoard";

export interface BoardModule {
  id: Exclude<BoardId, "setup">;
  label: string;
  shortLabel: string;
  icon: IconName;
  component: ComponentType;
  enabled: boolean;
  isUnlocked: (game: Readonly<GameSave>) => boolean;
}

export const BOARD_CATALOG = [
  {
    id: "dungeon",
    label: "First level",
    shortLabel: "Explore",
    icon: "grid",
    component: DungeonBoard,
    enabled: true,
    isUnlocked: () => true,
  },
  {
    id: "settlement",
    label: "Main settlement",
    shortLabel: "Settlement",
    icon: "castle",
    component: SettlementBoard,
    enabled: true,
    isUnlocked: (game: Readonly<GameSave>) =>
      game.dungeon.settlementClaimed,
  },
] as const satisfies readonly BoardModule[];

export type RegisteredBoardId = (typeof BOARD_CATALOG)[number]["id"];
export type RegisteredBoardModule = (typeof BOARD_CATALOG)[number];

export interface BoardAvailability {
  registered: boolean;
  enabled: boolean;
  unlocked: boolean;
  active: boolean;
  available: boolean;
  module: RegisteredBoardModule | null;
}

export interface BoardResolution {
  requested: BoardAvailability;
  module: RegisteredBoardModule;
  usedFallback: boolean;
}

export function getBoardModule(boardId: unknown): RegisteredBoardModule | null {
  return BOARD_CATALOG.find((board) => board.id === boardId) ?? null;
}

export function getBoardAvailability(
  boardId: unknown,
  game: Readonly<GameSave>,
): BoardAvailability {
  const module = getBoardModule(boardId);
  const enabled = module?.enabled ?? false;
  const unlocked = module?.isUnlocked(game) ?? false;
  const active = game.activeBoardId === boardId;

  return {
    registered: module !== null,
    enabled,
    unlocked,
    active,
    available: enabled && unlocked,
    module,
  };
}

export function resolveActiveBoard(
  game: Readonly<GameSave>,
): BoardResolution | null {
  const requested = getBoardAvailability(game.activeBoardId, game);
  if (requested.available && requested.module) {
    return { requested, module: requested.module, usedFallback: false };
  }

  const fallback = BOARD_CATALOG.find(
    (board) => board.enabled && board.isUnlocked(game),
  );
  return fallback ? { requested, module: fallback, usedFallback: true } : null;
}
