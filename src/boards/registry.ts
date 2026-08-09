import type { BoardId } from "../game/model";
import type { IconName } from "../ui/GameIcon";

export interface BoardDefinition {
  id: Exclude<BoardId, "setup">;
  label: string;
  shortLabel: string;
  icon: IconName;
  enabled: boolean;
}

export const BOARD_REGISTRY: BoardDefinition[] = [
  {
    id: "dungeon",
    label: "First level",
    shortLabel: "Explore",
    icon: "grid",
    enabled: true,
  },
  {
    id: "settlement",
    label: "Main settlement",
    shortLabel: "Settlement",
    icon: "castle",
    enabled: true,
  },
  {
    id: "world",
    label: "World map — coming later",
    shortLabel: "World",
    icon: "world",
    enabled: false,
  },
  {
    id: "combat",
    label: "Tactical combat — coming later",
    shortLabel: "Combat",
    icon: "swords",
    enabled: false,
  },
];
