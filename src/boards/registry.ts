import type { BoardId } from "../game/model";
import type { IconName } from "../ui/GameIcon";

export interface BoardDefinition {
  id: BoardId;
  label: string;
  shortLabel: string;
  icon: IconName;
  enabled: boolean;
}

export const BOARD_REGISTRY: BoardDefinition[] = [
  {
    id: "dungeon",
    label: "Dungeon board",
    shortLabel: "Dungeon",
    icon: "grid",
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
