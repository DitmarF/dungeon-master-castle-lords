import type {
  CampaignStateV5,
  CellPosition,
} from "./campaignState.ts";
import { discoverAround, isWalkable } from "./generateDungeon.ts";
import {
  getBoardAvailabilityV5,
  type RegisteredBoardIdV5,
} from "./navigationV5.ts";
import type { LocationId, RegionId } from "./generateStartingWorld.ts";

export interface TransitionSuccessV5<Details extends object = object> {
  ok: true;
  state: CampaignStateV5;
  details: Details;
}

export interface TransitionFailureV5<Code extends string> {
  ok: false;
  code: Code;
}

export type DungeonMoveDirectionV5 = "north" | "west" | "south" | "east";

export type EnterRegionalDungeonResultV5 =
  | TransitionSuccessV5<{
      locationId: "location:regional-dungeon";
      regionId: RegionId;
      resumed: boolean;
    }>
  | TransitionFailureV5<
      | "hero-not-ready"
      | "location-not-found"
      | "location-not-explorable"
      | "dungeon-context-required"
    >;

const DIRECTION_DELTAS: Record<DungeonMoveDirectionV5, CellPosition> = {
  north: { x: 0, y: -1 },
  west: { x: -1, y: 0 },
  south: { x: 0, y: 1 },
  east: { x: 1, y: 0 },
};

export function enterRegionalDungeon(
  campaign: Readonly<CampaignStateV5>,
  locationId: LocationId,
): EnterRegionalDungeonResultV5 {
  const foundation = campaign.foundation;
  if (!foundation) return { ok: false, code: "hero-not-ready" };
  const location = foundation.world.locations.find(
    (candidate) => candidate.id === locationId,
  );
  if (!location) return { ok: false, code: "location-not-found" };
  if (location.definitionId !== "regional-dungeon") {
    return { ok: false, code: "location-not-explorable" };
  }
  const dungeon = foundation.regionalDungeons[location.id];
  if (!dungeon) return { ok: false, code: "dungeon-context-required" };

  const previousContext = foundation.hero.explorationContext;
  const resumed = previousContext?.locationId === location.id;
  const cell = resumed ? previousContext.cell : dungeon.start;
  const visible = discoverAround(
    cell,
    dungeon.grid.columns,
    dungeon.grid.rows,
  );
  const discovered = Array.from(new Set([...dungeon.discovered, ...visible]));

  return {
    ok: true,
    state: {
      ...campaign,
      activeBoardId: "dungeon",
      foundation: {
        ...foundation,
        hero: {
          ...foundation.hero,
          explorationContext: {
            locationId: location.id,
            cell: { ...cell },
            returnBoardId: "world",
          },
        },
        regionalDungeons: {
          ...foundation.regionalDungeons,
          [location.id]: { ...dungeon, discovered },
        },
      },
    },
    details: {
      locationId: location.id,
      regionId: location.regionId,
      resumed,
    },
  };
}

export type MoveHeroInDungeonResultV5 =
  | TransitionSuccessV5<{
      destination: CellPosition;
      newlyDiscovered: string[];
      reachedHeart: boolean;
    }>
  | TransitionFailureV5<
      | "hero-not-ready"
      | "dungeon-context-required"
      | "dungeon-board-required"
      | "invalid-direction"
      | "blocked"
    >;

export function moveHeroInRegionalDungeon(
  campaign: Readonly<CampaignStateV5>,
  direction: DungeonMoveDirectionV5,
): MoveHeroInDungeonResultV5 {
  const foundation = campaign.foundation;
  if (!foundation) return { ok: false, code: "hero-not-ready" };
  if (campaign.activeBoardId !== "dungeon") {
    return { ok: false, code: "dungeon-board-required" };
  }
  const context = foundation.hero.explorationContext;
  if (!context) return { ok: false, code: "dungeon-context-required" };
  const dungeon = foundation.regionalDungeons[context.locationId];
  if (!dungeon) return { ok: false, code: "dungeon-context-required" };

  const delta = DIRECTION_DELTAS[direction];
  if (!delta) return { ok: false, code: "invalid-direction" };
  const destination = {
    x: context.cell.x + delta.x,
    y: context.cell.y + delta.y,
  };
  if (!isWalkable(dungeon, destination)) {
    return { ok: false, code: "blocked" };
  }

  const visible = discoverAround(
    destination,
    dungeon.grid.columns,
    dungeon.grid.rows,
  );
  const known = new Set(dungeon.discovered);
  const newlyDiscovered = visible.filter((cell) => !known.has(cell));
  const discovered = Array.from(new Set([...dungeon.discovered, ...visible]));
  const reachedHeart =
    destination.x === dungeon.heart.x && destination.y === dungeon.heart.y;
  const nextDungeon = {
    ...dungeon,
    discovered,
    heartReached: dungeon.heartReached || reachedHeart,
  };

  return {
    ok: true,
    state: {
      ...campaign,
      foundation: {
        ...foundation,
        hero: {
          ...foundation.hero,
          explorationContext: { ...context, cell: destination },
        },
        regionalDungeons: {
          ...foundation.regionalDungeons,
          [context.locationId]: nextDungeon,
        },
      },
    },
    details: { destination, newlyDiscovered, reachedHeart },
  };
}

export type NavigateToAvailableBoardResultV5 =
  | TransitionSuccessV5<{ boardId: RegisteredBoardIdV5 }>
  | TransitionFailureV5<
      | "campaign-not-ready"
      | "board-not-registered"
      | "board-disabled"
      | "board-locked"
    >;

export function navigateToAvailableBoardV5(
  campaign: Readonly<CampaignStateV5>,
  boardId: unknown,
): NavigateToAvailableBoardResultV5 {
  if (!campaign.foundation) return { ok: false, code: "campaign-not-ready" };
  const availability = getBoardAvailabilityV5(boardId, campaign);
  if (!availability.registered || !availability.descriptor) {
    return { ok: false, code: "board-not-registered" };
  }
  if (!availability.enabled) return { ok: false, code: "board-disabled" };
  if (!availability.unlocked) return { ok: false, code: "board-locked" };
  return {
    ok: true,
    state:
      campaign.activeBoardId === availability.descriptor.id
        ? campaign
        : { ...campaign, activeBoardId: availability.descriptor.id },
    details: { boardId: availability.descriptor.id },
  };
}

export type RetiredSettlementClaimResult = TransitionFailureV5<"operation-retired">;

export function claimSettlementFromDungeonHeart(): RetiredSettlementClaimResult {
  return { ok: false, code: "operation-retired" };
}
