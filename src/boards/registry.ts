import type { ComponentType } from "react";
import type { BoardId, GameSave } from "../game/model";
import type { IconName } from "../ui/GameIcon";
import { CombatBoard } from "./CombatBoard";
import { DiplomacyBoard } from "./DiplomacyBoard";
import { DungeonBoard } from "./DungeonBoard";
import { HeroBoard } from "./HeroBoard";
import { SettlementBoard } from "./SettlementBoard";
import { WorldBoard } from "./WorldBoard";

export interface BoardModule {
  id: Exclude<BoardId, "setup">;
  label: string;
  shortLabel: string;
  icon: IconName;
  component: ComponentType;
  enabled: boolean;
  isUnlocked: (game: Readonly<GameSave>) => boolean;
}

// E01-T05 scaffolds are navigable only to verify the board architecture.
// This is not a future gameplay unlock rule.
const isArchitectureScaffoldUnlocked = () => true;

export const BOARD_CATALOG = [
  {
    id: "hero",
    label: "Hero board",
    shortLabel: "Hero",
    icon: "user",
    component: HeroBoard,
    enabled: true,
    isUnlocked: isArchitectureScaffoldUnlocked,
  },
  {
    id: "settlement",
    label: "Main settlement",
    shortLabel: "Settle",
    icon: "castle",
    component: SettlementBoard,
    enabled: true,
    isUnlocked: (game: Readonly<GameSave>) =>
      game.dungeon.settlementClaimed,
  },
  {
    id: "world",
    label: "World map",
    shortLabel: "World",
    icon: "world",
    component: WorldBoard,
    enabled: true,
    isUnlocked: isArchitectureScaffoldUnlocked,
  },
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
    id: "combat",
    label: "Tactical combat",
    shortLabel: "Combat",
    icon: "swords",
    component: CombatBoard,
    enabled: true,
    isUnlocked: isArchitectureScaffoldUnlocked,
  },
  {
    id: "diplomacy",
    label: "Diplomacy board",
    shortLabel: "Diplom.",
    icon: "message",
    component: DiplomacyBoard,
    enabled: true,
    isUnlocked: isArchitectureScaffoldUnlocked,
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
