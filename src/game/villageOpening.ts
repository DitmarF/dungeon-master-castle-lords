import type {
  CampaignFoundationV5,
  CampaignHeroStateV5,
  CampaignStateV5,
  RegionalDungeonStateV5,
} from "./campaignState.ts";
import { createDungeonLevel } from "./generateDungeon.ts";
import { generateStartingWorld } from "./generateStartingWorld.ts";
import {
  CLASS_SKILL,
  VOCATION_SKILL,
  validateCastleHeroSetupSelection,
  type CastleHeroSetupSelection,
  type CastleHeroSetupValidationCode,
} from "./heroSetup.ts";
import { selectHeroAttributes } from "./selectors.ts";
import type { SkillId } from "./skillTrees.ts";

const REGIONAL_DUNGEON_LOCATION_ID = "location:regional-dungeon" as const;

export type VillageFirstSetupResult =
  | { ok: true; state: CampaignStateV5; details: { boardId: "settlement" } }
  | {
      ok: false;
      code:
        | CastleHeroSetupValidationCode
        | "setup-already-complete"
        | "setup-board-required"
        | "opening-generation-failed";
    };

function createInitialSkillRanks(
  selection: Readonly<CastleHeroSetupSelection>,
): Partial<Record<SkillId, number>> {
  const skillRanks: Partial<Record<SkillId, number>> = {};
  for (const skillId of [
    CLASS_SKILL[selection.heroClass],
    VOCATION_SKILL[selection.vocation],
    selection.bonusSkill,
  ]) {
    skillRanks[skillId] = (skillRanks[skillId] ?? 0) + 1;
  }
  return skillRanks;
}

function createRegionalDungeon(
  campaignSeed: CampaignStateV5["campaignSeed"],
): RegionalDungeonStateV5 {
  const dungeon = createDungeonLevel(campaignSeed);
  return {
    dungeonDefinitionId: "regional-dungeon",
    seed: dungeon.seed,
    level: dungeon.level,
    grid: { ...dungeon.grid },
    rooms: structuredClone(dungeon.rooms),
    tiles: [...dungeon.tiles],
    start: { ...dungeon.start },
    heart: { ...dungeon.heart },
    discovered: [],
    heartReached: false,
  };
}

function createFoundation(
  campaign: Readonly<CampaignStateV5>,
  selection: Readonly<CastleHeroSetupSelection>,
): CampaignFoundationV5 {
  const generated = generateStartingWorld(campaign.campaignSeed);
  const hero: CampaignHeroStateV5 = {
    heroClass: selection.heroClass,
    vocation: selection.vocation,
    freeAttributes: { ...selection.freeAttributes },
    bonusSkillId: selection.bonusSkill,
    skillRanks: createInitialSkillRanks(selection),
    attributesCompatibility: {
      ruleVersion: "v4-path-bonus-1",
      values: selectHeroAttributes(selection),
    },
    strategicRegionId: generated.homeRegionId,
    explorationContext: null,
  };

  return {
    rootFactionId: "castle",
    hero,
    capital: structuredClone(generated.capital),
    world: {
      generatorVersion: generated.generatorVersion,
      seed: generated.seed,
      homeRegionId: generated.homeRegionId,
      regions: structuredClone(generated.regions),
      sites: structuredClone(generated.sites),
      locations: structuredClone(generated.locations),
    },
    regionalDungeons: {
      [REGIONAL_DUNGEON_LOCATION_ID]: createRegionalDungeon(
        campaign.campaignSeed,
      ),
    },
  };
}

export function completeVillageFirstHeroSetup(
  campaign: Readonly<CampaignStateV5>,
  selection: Readonly<CastleHeroSetupSelection>,
): VillageFirstSetupResult {
  if (campaign.foundation) {
    return { ok: false, code: "setup-already-complete" };
  }
  if (campaign.activeBoardId !== "setup") {
    return { ok: false, code: "setup-board-required" };
  }

  const validation = validateCastleHeroSetupSelection(selection);
  if (!validation.ok) return validation;

  try {
    return {
      ok: true,
      state: {
        ...campaign,
        activeBoardId: "settlement",
        foundation: createFoundation(campaign, selection),
      },
      details: { boardId: "settlement" },
    };
  } catch {
    return { ok: false, code: "opening-generation-failed" };
  }
}
