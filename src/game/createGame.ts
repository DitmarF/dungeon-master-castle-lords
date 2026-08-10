import { createDungeonLevel } from "./generateDungeon.ts";
import {
  type GameSave,
  type PlayerProfile,
  type PlayerId,
} from "./model.ts";
import {
  createCampaignId,
  createPlayerId,
  type CampaignId,
  type IdSource,
} from "./identity.ts";
import { CLASS_SKILL } from "./transitions.ts";
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
): PlayerProfile {
  return {
    id: createPlayerId(idSource),
    name: name.trim(),
    bannerColor,
    createdAt: new Date().toISOString(),
    lastPlayedAt: null,
  };
}

export function createNewGame(
  playerId: PlayerId,
  idSource: IdSource,
  campaignSeed: CampaignSeed,
  createdAt = new Date().toISOString(),
): GameSave {
  const seed = requireCampaignSeed(campaignSeed);

  return {
    version: 4,
    id: createCampaignId(idSource),
    playerId,
    campaignSeed: seed,
    createdAt,
    updatedAt: createdAt,
    activeBoardId: "setup",
    setupComplete: false,
    hero: null,
    dungeon: createDungeonLevel(seed),
  };
}

export function migrateLegacyGame(
  value: unknown,
  playerId: string,
  idSource: IdSource,
  campaignSeedSource: CampaignSeedSource,
): GameSave {
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
      const current = value as Omit<GameSave, "version" | "campaignSeed"> & {
        version: 2 | 3 | 4;
        campaignSeed?: unknown;
      };
      const campaignSeed = isCampaignSeed(current.campaignSeed)
        ? current.campaignSeed
        : requireCampaignSeed(current.dungeon.seed);
      const normalized: GameSave = {
        ...current,
        version: 4,
        campaignSeed,
      };
      if (!normalized.hero) return normalized;

      const bonusSkill = SKILL_BY_ID[normalized.hero.bonusSkill]
        ? normalized.hero.bonusSkill
        : CLASS_SKILL[normalized.hero.heroClass];

      // Rebuild derived attributes from the saved choices so rules fixes also
      // repair existing campaigns, while the skill normalizer adds the new
      // branch nodes without changing already learned ranks.
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
    const migrated = createNewGame(
      retainedPlayerId,
      idSource,
      campaignSeedSource.nextCampaignSeed(),
    );
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

  return createNewGame(
    playerId as PlayerId,
    idSource,
    campaignSeedSource.nextCampaignSeed(),
  );
}
