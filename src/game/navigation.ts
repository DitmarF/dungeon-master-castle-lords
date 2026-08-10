import type { BoardId, CampaignState } from "./campaignState.ts";

export type RegisteredBoardId = Exclude<BoardId, "setup">;

export type BoardIconName =
  | "user"
  | "castle"
  | "world"
  | "grid"
  | "swords"
  | "message";

export interface BoardDescriptor {
  id: RegisteredBoardId;
  label: string;
  shortLabel: string;
  icon: BoardIconName;
  enabled: boolean;
  isUnlocked: (campaign: Readonly<CampaignState>) => boolean;
}

// E01-T05 scaffolds remain navigable only to preserve the approved board
// architecture. This is not a future gameplay unlock rule.
const isArchitectureScaffoldUnlocked = () => true;

export const BOARD_DESCRIPTORS = [
  {
    id: "hero",
    label: "Hero board",
    shortLabel: "Hero",
    icon: "user",
    enabled: true,
    isUnlocked: isArchitectureScaffoldUnlocked,
  },
  {
    id: "settlement",
    label: "Main settlement",
    shortLabel: "Settle",
    icon: "castle",
    enabled: true,
    isUnlocked: (campaign: Readonly<CampaignState>) =>
      campaign.dungeon.settlementClaimed,
  },
  {
    id: "world",
    label: "World map",
    shortLabel: "World",
    icon: "world",
    enabled: true,
    isUnlocked: isArchitectureScaffoldUnlocked,
  },
  {
    id: "dungeon",
    label: "First level",
    shortLabel: "Explore",
    icon: "grid",
    enabled: true,
    isUnlocked: () => true,
  },
  {
    id: "combat",
    label: "Tactical combat",
    shortLabel: "Combat",
    icon: "swords",
    enabled: true,
    isUnlocked: isArchitectureScaffoldUnlocked,
  },
  {
    id: "diplomacy",
    label: "Diplomacy board",
    shortLabel: "Diplom.",
    icon: "message",
    enabled: true,
    isUnlocked: isArchitectureScaffoldUnlocked,
  },
] as const satisfies readonly BoardDescriptor[];

export interface BoardAvailability {
  registered: boolean;
  enabled: boolean;
  unlocked: boolean;
  active: boolean;
  available: boolean;
  descriptor: BoardDescriptor | null;
}

export interface BoardResolution {
  requested: BoardAvailability;
  descriptor: BoardDescriptor;
  usedFallback: boolean;
}

export function getBoardDescriptor(boardId: unknown): BoardDescriptor | null {
  return BOARD_DESCRIPTORS.find((board) => board.id === boardId) ?? null;
}

export function isRegisteredBoardId(
  boardId: unknown,
): boardId is RegisteredBoardId {
  return getBoardDescriptor(boardId) !== null;
}

export function getBoardAvailability(
  boardId: unknown,
  campaign: Readonly<CampaignState>,
): BoardAvailability {
  const descriptor = getBoardDescriptor(boardId);
  const enabled = descriptor?.enabled ?? false;
  const unlocked = descriptor?.isUnlocked(campaign) ?? false;
  const active = campaign.activeBoardId === boardId;

  return {
    registered: descriptor !== null,
    enabled,
    unlocked,
    active,
    available: enabled && unlocked,
    descriptor,
  };
}

export function resolveActiveBoard(
  campaign: Readonly<CampaignState>,
): BoardResolution | null {
  const requested = getBoardAvailability(campaign.activeBoardId, campaign);
  if (requested.available && requested.descriptor) {
    return {
      requested,
      descriptor: requested.descriptor,
      usedFallback: false,
    };
  }

  const fallback = BOARD_DESCRIPTORS.find(
    (board) => board.enabled && board.isUnlocked(campaign),
  );
  return fallback
    ? { requested, descriptor: fallback, usedFallback: true }
    : null;
}
