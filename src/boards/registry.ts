import type { ComponentType } from "react";
import {
  BOARD_DESCRIPTORS,
  type BoardDescriptor,
  type RegisteredBoardId,
} from "../game/navigation";
import { CombatBoard } from "./CombatBoard";
import { DiplomacyBoard } from "./DiplomacyBoard";
import { DungeonBoard } from "./DungeonBoard";
import { HeroBoard } from "./HeroBoard";
import { SettlementBoard } from "./SettlementBoard";
import { WorldBoard } from "./WorldBoard";

export interface BoardModule extends BoardDescriptor {
  component: ComponentType;
}

const BOARD_COMPONENTS = {
  hero: HeroBoard,
  settlement: SettlementBoard,
  world: WorldBoard,
  dungeon: DungeonBoard,
  combat: CombatBoard,
  diplomacy: DiplomacyBoard,
} satisfies Record<RegisteredBoardId, ComponentType>;

export const BOARD_CATALOG: readonly BoardModule[] = BOARD_DESCRIPTORS.map(
  (descriptor) => ({ ...descriptor, component: BOARD_COMPONENTS[descriptor.id] }),
);

export function getBoardModule(boardId: unknown): BoardModule | null {
  return BOARD_CATALOG.find((board) => board.id === boardId) ?? null;
}
