import { createDungeonLevel, discoverAround } from "./generateDungeon";
import {
  EMPTY_ATTRIBUTES,
  type GameSave,
  type HeroAttributes,
  type HeroClass,
  type HeroSetupSelection,
  type HeroVocation,
  type PlayerProfile,
  type SkillId,
} from "./model";

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

export function createId(prefix: string): string {
  const suffix =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return `${prefix}-${suffix}`;
}

export function createPlayerProfile(
  name: string,
  bannerColor: string,
): PlayerProfile {
  return {
    id: createId("player"),
    name: name.trim(),
    bannerColor,
    createdAt: new Date().toISOString(),
    lastPlayedAt: null,
  };
}

export function createNewGame(playerId: string): GameSave {
  const now = new Date().toISOString();

  return {
    version: 2,
    id: createId("game"),
    playerId,
    createdAt: now,
    updatedAt: now,
    activeBoardId: "setup",
    setupComplete: false,
    hero: null,
    dungeon: createDungeonLevel(),
  };
}

function addAttributes(...sources: HeroAttributes[]): HeroAttributes {
  const result = { ...EMPTY_ATTRIBUTES };
  for (const source of sources) {
    (Object.keys(result) as (keyof HeroAttributes)[]).forEach((key) => {
      result[key] += source[key];
    });
  }
  return result;
}

function classBonus(heroClass: HeroClass): HeroAttributes {
  return {
    ...EMPTY_ATTRIBUTES,
    ...(heroClass === "fighter" ? { agy: 1 } : {}),
    ...(heroClass === "ranger" ? { per: 1 } : {}),
    ...(heroClass === "mage" ? { int: 1 } : {}),
  };
}

function vocationBonus(vocation: HeroVocation): HeroAttributes {
  return {
    ...EMPTY_ATTRIBUTES,
    ...(vocation === "general" ? { lead: 1 } : {}),
    ...(vocation === "spy" ? { agy: 1 } : {}),
    ...(vocation === "diplomat" ? { cha: 1 } : {}),
  };
}

export function completeGameSetup(game: GameSave, selection: HeroSetupSelection): GameSave {
  const skills: Record<SkillId, number> = {
    "close-combat": 0,
    "ranged-combat": 0,
    "mage-combat": 0,
    tactics: 0,
    deception: 0,
    diplomacy: 0,
  };
  skills[CLASS_SKILL[selection.heroClass]] += 1;
  skills[VOCATION_SKILL[selection.vocation]] += 1;
  skills[selection.bonusSkill] += 1;

  return {
    ...game,
    setupComplete: true,
    activeBoardId: "dungeon",
    hero: {
      ...selection,
      attributes: addAttributes(
        selection.freeAttributes,
        classBonus(selection.heroClass),
        vocationBonus(selection.vocation),
      ),
      skills,
      position: game.dungeon.start,
      visionRadius: 1,
    },
    dungeon: {
      ...game.dungeon,
      discovered: discoverAround(
        game.dungeon.start,
        game.dungeon.grid.columns,
        game.dungeon.grid.rows,
      ),
    },
    updatedAt: new Date().toISOString(),
  };
}

export function migrateLegacyGame(value: unknown, playerId: string): GameSave {
  if (value && typeof value === "object") {
    const candidate = value as Partial<GameSave>;
    if (candidate.version === 2 && candidate.dungeon && "tiles" in candidate.dungeon) {
      return candidate as GameSave;
    }

    const legacy = value as {
      id?: string;
      playerId?: string;
      createdAt?: string;
      updatedAt?: string;
      dungeon?: { level?: number; day?: number; treasury?: number };
    };
    const migrated = createNewGame(legacy.playerId ?? playerId);
    return {
      ...migrated,
      id: legacy.id ?? migrated.id,
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

  return createNewGame(playerId);
}
