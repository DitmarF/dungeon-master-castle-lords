import {
  EMPTY_ATTRIBUTES,
  type CampaignState,
  type CellPosition,
  type HeroClass,
  type HeroSetupSelection,
  type HeroVocation,
} from "./campaignState.ts";
import { discoverAround, isWalkable } from "./generateDungeon.ts";
import {
  getBoardAvailability,
  type RegisteredBoardId,
} from "./navigation.ts";
import {
  SKILL_BY_ID,
  createEmptySkillRanks,
  type SkillId,
} from "./skillTrees.ts";
import {
  getRootFactionDefinition,
  isPlayableNewCampaignFaction,
} from "./openingContent.ts";
import { selectHeroAttributes } from "./selectors.ts";

export interface TransitionSuccess<Details extends object = object> {
  ok: true;
  state: CampaignState;
  details: Details;
}

export interface TransitionFailure<Code extends string> {
  ok: false;
  code: Code;
}

export const CLASS_SKILL: Record<HeroClass, SkillId> = {
  fighter: "close-combat",
  ranger: "ranged-combat",
  mage: "mage-combat",
};

export const VOCATION_SKILL: Record<HeroVocation, SkillId> = {
  general: "tactics",
  spy: "deception",
  diplomat: "diplomacy",
};

const HERO_CLASSES: readonly HeroClass[] = ["fighter", "ranger", "mage"];
const HERO_VOCATIONS: readonly HeroVocation[] = [
  "general",
  "spy",
  "diplomat",
];
const ATTRIBUTE_KEYS = Object.keys(EMPTY_ATTRIBUTES) as (keyof typeof EMPTY_ATTRIBUTES)[];

export function isLegalHeroSetupBonusSkill(
  skillId: SkillId,
  heroClass: HeroClass,
  vocation: HeroVocation,
): boolean {
  const skill = SKILL_BY_ID[skillId];
  return Boolean(
    skill &&
      (skill.treeId === heroClass || skill.treeId === vocation) &&
      skill.tier <= 1,
  );
}

export type HeroSetupValidationCode =
  | "invalid-faction"
  | "unavailable-faction"
  | "invalid-class"
  | "invalid-vocation"
  | "invalid-attributes"
  | "invalid-bonus-skill";

export type HeroSetupValidationResult =
  | { ok: true }
  | TransitionFailure<HeroSetupValidationCode>;

export function validateHeroSetupSelection(
  selection: Readonly<HeroSetupSelection>,
): HeroSetupValidationResult {
  if (!getRootFactionDefinition(selection.faction)) {
    return { ok: false, code: "invalid-faction" };
  }
  if (!isPlayableNewCampaignFaction(selection.faction)) {
    return { ok: false, code: "unavailable-faction" };
  }
  if (!HERO_CLASSES.includes(selection.heroClass)) {
    return { ok: false, code: "invalid-class" };
  }
  if (!HERO_VOCATIONS.includes(selection.vocation)) {
    return { ok: false, code: "invalid-vocation" };
  }

  const attributeValues = ATTRIBUTE_KEYS.map(
    (key) => selection.freeAttributes[key],
  );
  if (
    attributeValues.some(
      (value) => !Number.isInteger(value) || value < 0,
    ) ||
    attributeValues.reduce((sum, value) => sum + value, 0) !== 2
  ) {
    return { ok: false, code: "invalid-attributes" };
  }

  if (
    !isLegalHeroSetupBonusSkill(
      selection.bonusSkill,
      selection.heroClass,
      selection.vocation,
    )
  ) {
    return { ok: false, code: "invalid-bonus-skill" };
  }

  return { ok: true };
}

export type CompleteHeroSetupResult =
  | TransitionSuccess
  | TransitionFailure<
      HeroSetupValidationCode | "setup-already-complete" | "setup-board-required"
    >;

export function completeHeroSetup(
  campaign: Readonly<CampaignState>,
  selection: Readonly<HeroSetupSelection>,
): CompleteHeroSetupResult {
  if (campaign.setupComplete || campaign.hero) {
    return { ok: false, code: "setup-already-complete" };
  }
  if (campaign.activeBoardId !== "setup") {
    return { ok: false, code: "setup-board-required" };
  }

  const validation = validateHeroSetupSelection(selection);
  if (!validation.ok) return validation;

  const skills = createEmptySkillRanks();
  skills[CLASS_SKILL[selection.heroClass]] += 1;
  skills[VOCATION_SKILL[selection.vocation]] += 1;
  skills[selection.bonusSkill] += 1;

  return {
    ok: true,
    state: {
      ...campaign,
      setupComplete: true,
      activeBoardId: "dungeon",
      hero: {
        ...selection,
        freeAttributes: { ...selection.freeAttributes },
        attributes: selectHeroAttributes(selection),
        skills,
        position: { ...campaign.dungeon.start },
        visionRadius: 1,
      },
      dungeon: {
        ...campaign.dungeon,
        discovered: discoverAround(
          campaign.dungeon.start,
          campaign.dungeon.grid.columns,
          campaign.dungeon.grid.rows,
        ),
      },
    },
    details: {},
  };
}

export type DungeonMoveDirection = "north" | "west" | "south" | "east";

const DIRECTION_DELTAS: Record<DungeonMoveDirection, CellPosition> = {
  north: { x: 0, y: -1 },
  west: { x: -1, y: 0 },
  south: { x: 0, y: 1 },
  east: { x: 1, y: 0 },
};

export interface DungeonMoveDetails {
  destination: CellPosition;
  newlyDiscovered: string[];
  reachedHeart: boolean;
}

export type MoveHeroInDungeonResult =
  | TransitionSuccess<DungeonMoveDetails>
  | TransitionFailure<
      | "hero-not-ready"
      | "dungeon-board-required"
      | "invalid-direction"
      | "blocked"
    >;

export function moveHeroInDungeon(
  campaign: Readonly<CampaignState>,
  direction: DungeonMoveDirection,
): MoveHeroInDungeonResult {
  if (!campaign.setupComplete || !campaign.hero) {
    return { ok: false, code: "hero-not-ready" };
  }
  if (campaign.activeBoardId !== "dungeon") {
    return { ok: false, code: "dungeon-board-required" };
  }

  const delta = DIRECTION_DELTAS[direction];
  if (!delta) return { ok: false, code: "invalid-direction" };
  const destination = {
    x: campaign.hero.position.x + delta.x,
    y: campaign.hero.position.y + delta.y,
  };
  if (!isWalkable(campaign.dungeon, destination)) {
    return { ok: false, code: "blocked" };
  }

  const visible = discoverAround(
    destination,
    campaign.dungeon.grid.columns,
    campaign.dungeon.grid.rows,
    campaign.hero.visionRadius,
  );
  const known = new Set(campaign.dungeon.discovered);
  const newlyDiscovered = visible.filter((cell) => !known.has(cell));
  const discovered = Array.from(
    new Set([...campaign.dungeon.discovered, ...visible]),
  );
  const reachedHeart =
    destination.x === campaign.dungeon.heart.x &&
    destination.y === campaign.dungeon.heart.y;

  return {
    ok: true,
    state: {
      ...campaign,
      hero: { ...campaign.hero, position: destination },
      dungeon: {
        ...campaign.dungeon,
        discovered,
        heartReached: campaign.dungeon.heartReached || reachedHeart,
      },
    },
    details: { destination, newlyDiscovered, reachedHeart },
  };
}

export type NavigateToAvailableBoardResult =
  | TransitionSuccess<{ boardId: RegisteredBoardId }>
  | TransitionFailure<
      | "campaign-not-ready"
      | "board-not-registered"
      | "board-disabled"
      | "board-locked"
    >;

export function navigateToAvailableBoard(
  campaign: Readonly<CampaignState>,
  boardId: unknown,
): NavigateToAvailableBoardResult {
  if (!campaign.setupComplete || !campaign.hero) {
    return { ok: false, code: "campaign-not-ready" };
  }

  const availability = getBoardAvailability(boardId, campaign);
  if (!availability.registered || !availability.descriptor) {
    return { ok: false, code: "board-not-registered" };
  }
  if (!availability.enabled) {
    return { ok: false, code: "board-disabled" };
  }
  if (!availability.unlocked) {
    return { ok: false, code: "board-locked" };
  }

  return {
    ok: true,
    state:
      campaign.activeBoardId === availability.descriptor.id
        ? campaign
        : { ...campaign, activeBoardId: availability.descriptor.id },
    details: { boardId: availability.descriptor.id },
  };
}

export type ClaimSettlementResult =
  | TransitionSuccess<{ boardId: "settlement" }>
  | TransitionFailure<
      | "hero-not-ready"
      | "dungeon-board-required"
      | "dungeon-heart-not-reached"
      | "settlement-board-unavailable"
    >;

export function claimSettlement(
  campaign: Readonly<CampaignState>,
): ClaimSettlementResult {
  if (!campaign.setupComplete || !campaign.hero) {
    return { ok: false, code: "hero-not-ready" };
  }
  if (campaign.activeBoardId !== "dungeon") {
    return { ok: false, code: "dungeon-board-required" };
  }
  if (!campaign.dungeon.heartReached) {
    return { ok: false, code: "dungeon-heart-not-reached" };
  }

  const claimed: CampaignState = {
    ...campaign,
    dungeon: { ...campaign.dungeon, settlementClaimed: true },
  };
  const navigation = navigateToAvailableBoard(claimed, "settlement");
  if (!navigation.ok) {
    return { ok: false, code: "settlement-board-unavailable" };
  }

  return {
    ok: true,
    state: navigation.state,
    details: { boardId: "settlement" },
  };
}
