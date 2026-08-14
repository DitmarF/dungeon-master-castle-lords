import type { BoardId, CampaignStateV5 } from "./campaignState.ts";

export type BoardIconName =
  | "user"
  | "castle"
  | "world"
  | "grid"
  | "swords"
  | "message";

export type RegisteredBoardIdV5 = Exclude<BoardId, "setup">;

export interface BoardDescriptorV5 {
  id: RegisteredBoardIdV5;
  label: string;
  shortLabel: string;
  icon: BoardIconName;
  enabled: boolean;
  isUnlocked: (campaign: Readonly<CampaignStateV5>) => boolean;
}

const hasFoundation = (campaign: Readonly<CampaignStateV5>) =>
  campaign.foundation !== null;
const hasExplorationContext = (campaign: Readonly<CampaignStateV5>) =>
  campaign.foundation?.hero.explorationContext !== null &&
  campaign.foundation?.hero.explorationContext !== undefined;

export const BOARD_DESCRIPTORS_V5 = [
  {
    id: "hero",
    label: "Hero board",
    shortLabel: "Hero",
    icon: "user",
    enabled: true,
    isUnlocked: hasFoundation,
  },
  {
    id: "settlement",
    label: "Capital Village",
    shortLabel: "Settle",
    icon: "castle",
    enabled: true,
    isUnlocked: hasFoundation,
  },
  {
    id: "world",
    label: "World map",
    shortLabel: "World",
    icon: "world",
    enabled: true,
    isUnlocked: hasFoundation,
  },
  {
    id: "dungeon",
    label: "Regional Dungeon",
    shortLabel: "Explore",
    icon: "grid",
    enabled: true,
    isUnlocked: hasExplorationContext,
  },
  {
    id: "combat",
    label: "Tactical combat",
    shortLabel: "Combat",
    icon: "swords",
    enabled: false,
    isUnlocked: () => false,
  },
  {
    id: "diplomacy",
    label: "Diplomacy board",
    shortLabel: "Diplom.",
    icon: "message",
    enabled: false,
    isUnlocked: () => false,
  },
] as const satisfies readonly BoardDescriptorV5[];

export interface BoardAvailabilityV5 {
  registered: boolean;
  enabled: boolean;
  unlocked: boolean;
  active: boolean;
  available: boolean;
  descriptor: BoardDescriptorV5 | null;
}

export interface BoardResolutionV5 {
  requested: BoardAvailabilityV5;
  descriptor: BoardDescriptorV5;
  usedFallback: boolean;
}

export function getBoardDescriptorV5(
  boardId: unknown,
): BoardDescriptorV5 | null {
  return BOARD_DESCRIPTORS_V5.find((board) => board.id === boardId) ?? null;
}

export function getBoardAvailabilityV5(
  boardId: unknown,
  campaign: Readonly<CampaignStateV5>,
): BoardAvailabilityV5 {
  const descriptor = getBoardDescriptorV5(boardId);
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

export function resolveActiveBoardV5(
  campaign: Readonly<CampaignStateV5>,
): BoardResolutionV5 | null {
  const requested = getBoardAvailabilityV5(campaign.activeBoardId, campaign);
  if (requested.available && requested.descriptor) {
    return { requested, descriptor: requested.descriptor, usedFallback: false };
  }
  const fallback = BOARD_DESCRIPTORS_V5.find(
    (board) => board.enabled && board.isUnlocked(campaign),
  );
  return fallback
    ? { requested, descriptor: fallback, usedFallback: true }
    : null;
}
