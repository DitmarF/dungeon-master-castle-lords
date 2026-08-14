import { createDungeonLevel } from "./generateDungeon.ts";
import {
  type GameSave,
  type CampaignStateV4,
  type CampaignStateV5,
  type PlayerProfile,
  type PlayerId,
} from "./model.ts";
import {
  createCampaignId,
  createPlayerId,
  type CampaignId,
  type IdSource,
} from "./identity.ts";
import { CLASS_SKILL } from "./heroSetup.ts";
import { selectHeroAttributes } from "./selectors.ts";
import {
  isCampaignSeed,
  requireCampaignSeed,
  type CampaignSeed,
  type CampaignSeedSource,
} from "./random.ts";
import {
  SKILL_BY_ID,
  normalizeSkillRanks,
} from "./skillTrees.ts";

export function createPlayerProfile(
  name: string,
  bannerColor: string,
  idSource: IdSource,
  createdAt: string,
): PlayerProfile {
  return {
    id: createPlayerId(idSource),
    name: name.trim(),
    bannerColor,
    createdAt,
    lastPlayedAt: null,
  };
}

export function createNewGame(
  playerId: PlayerId,
  idSource: IdSource,
  campaignSeed: CampaignSeed,
  createdAt: string,
): GameSave {
  return createNewGameV5(playerId, idSource, campaignSeed, createdAt);
}

export function createNewGameV5(
  playerId: PlayerId,
  idSource: IdSource,
  campaignSeed: CampaignSeed,
  createdAt: string,
): CampaignStateV5 {
  const seed = requireCampaignSeed(campaignSeed);
  return {
    version: 5,
    id: createCampaignId(idSource),
    playerId,
    campaignSeed: seed,
    createdAt,
    updatedAt: createdAt,
    activeBoardId: "setup",
    foundation: null,
  };
}

export type SupportedLegacyCampaign = Omit<
  CampaignStateV4,
  "version" | "campaignSeed"
> & {
  version: 2 | 3 | 4;
  campaignSeed?: unknown;
};

/**
 * Protected v2/v3/v4 compatibility step. Callers must validate the source
 * envelope before narrowing to this type. It never generates a replacement
 * campaign or Dungeon.
 */
export function normalizeSupportedCampaignToV4(
  current: SupportedLegacyCampaign,
): CampaignStateV4 {
  const campaignSeed = isCampaignSeed(current.campaignSeed)
    ? current.campaignSeed
    : requireCampaignSeed(current.dungeon.seed);
  const normalized: CampaignStateV4 = {
    ...current,
    version: 4,
    campaignSeed,
  };
  if (!normalized.hero) return normalized;

  const bonusSkill = SKILL_BY_ID[normalized.hero.bonusSkill]
    ? normalized.hero.bonusSkill
    : CLASS_SKILL[normalized.hero.heroClass];

  return {
    ...normalized,
    hero: {
      ...normalized.hero,
      bonusSkill,
      attributes: selectHeroAttributes(normalized.hero),
      skills: normalizeSkillRanks(normalized.hero.skills),
    },
  };
}

export function migrateLegacyGame(
  value: unknown,
  playerId: string,
  idSource: IdSource,
  campaignSeedSource: CampaignSeedSource,
  fallbackCreatedAt: string,
): CampaignStateV4 {
  if (value && typeof value === "object") {
    const candidate = value as { version?: unknown; dungeon?: unknown };
    if (
      (candidate.version === 2 ||
        candidate.version === 3 ||
        candidate.version === 4) &&
      candidate.dungeon &&
      typeof candidate.dungeon === "object" &&
      "tiles" in candidate.dungeon
    ) {
      return normalizeSupportedCampaignToV4(
        value as SupportedLegacyCampaign,
      );
    }

    const legacy = value as {
      id?: string;
      playerId?: string;
      createdAt?: string;
      updatedAt?: string;
      dungeon?: { level?: number; day?: number; treasury?: number };
    };
    // Legacy saves predate runtime ID validation. Retain their exact strings;
    // only newly generated identities must satisfy the current convention.
    const retainedPlayerId = (legacy.playerId ?? playerId) as PlayerId;
    const fallbackSeed = campaignSeedSource.nextCampaignSeed();
    const migrated: CampaignStateV4 = {
      version: 4,
      id: createCampaignId(idSource),
      playerId: retainedPlayerId,
      campaignSeed: fallbackSeed,
      createdAt: fallbackCreatedAt,
      updatedAt: fallbackCreatedAt,
      activeBoardId: "setup",
      setupComplete: false,
      hero: null,
      dungeon: createDungeonLevel(fallbackSeed),
    };
    return {
      ...migrated,
      id: (legacy.id as CampaignId | undefined) ?? migrated.id,
      createdAt: legacy.createdAt ?? migrated.createdAt,
      updatedAt: legacy.updatedAt ?? migrated.updatedAt,
      dungeon: {
        ...migrated.dungeon,
        level: legacy.dungeon?.level ?? 1,
        day: legacy.dungeon?.day ?? 1,
        treasury: legacy.dungeon?.treasury ?? 100,
      },
    };
  }

  const fallbackSeed = campaignSeedSource.nextCampaignSeed();
  return {
    version: 4,
    id: createCampaignId(idSource),
    playerId: playerId as PlayerId,
    campaignSeed: fallbackSeed,
    createdAt: fallbackCreatedAt,
    updatedAt: fallbackCreatedAt,
    activeBoardId: "setup",
    setupComplete: false,
    hero: null,
    dungeon: createDungeonLevel(fallbackSeed),
  };
}
