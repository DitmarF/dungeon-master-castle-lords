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
): GameSave {
  const now = new Date().toISOString();

  return {
    version: 3,
    id: createCampaignId(idSource),
    playerId,
    createdAt: now,
    updatedAt: now,
    activeBoardId: "setup",
    setupComplete: false,
    hero: null,
    dungeon: createDungeonLevel(),
  };
}

export function migrateLegacyGame(
  value: unknown,
  playerId: string,
  idSource: IdSource,
): GameSave {
  if (value && typeof value === "object") {
    const candidate = value as { version?: unknown; dungeon?: unknown };
    if (
      (candidate.version === 2 || candidate.version === 3) &&
      candidate.dungeon &&
      typeof candidate.dungeon === "object" &&
      "tiles" in candidate.dungeon
    ) {
      const current = value as GameSave & { version: number };
      if (!current.hero) return { ...current, version: 3 };

      const bonusSkill = SKILL_BY_ID[current.hero.bonusSkill]
        ? current.hero.bonusSkill
        : CLASS_SKILL[current.hero.heroClass];

      // Rebuild derived attributes from the saved choices so rules fixes also
      // repair existing campaigns, while the skill normalizer adds the new
      // branch nodes without changing already learned ranks.
      return {
        ...current,
        version: 3,
        hero: {
          ...current.hero,
          bonusSkill,
          attributes: selectHeroAttributes(current.hero),
          skills: normalizeSkillRanks(current.hero.skills),
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
    const migrated = createNewGame(retainedPlayerId, idSource);
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

  return createNewGame(playerId as PlayerId, idSource);
}
