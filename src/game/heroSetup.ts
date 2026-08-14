import {
  EMPTY_ATTRIBUTES,
  type HeroClass,
  type HeroSetupSelection,
  type HeroVocation,
} from "./campaignState.ts";
import { SKILL_BY_ID, type SkillId } from "./skillTrees.ts";

export type CastleHeroSetupSelection = HeroSetupSelection;

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
const ATTRIBUTE_KEYS = Object.keys(EMPTY_ATTRIBUTES) as (
  keyof typeof EMPTY_ATTRIBUTES
)[];

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

export type CastleHeroSetupValidationCode =
  | "invalid-class"
  | "invalid-vocation"
  | "invalid-attributes"
  | "invalid-bonus-skill";

export type CastleHeroSetupValidationResult =
  | { ok: true }
  | { ok: false; code: CastleHeroSetupValidationCode };

export function validateCastleHeroSetupSelection(
  selection: Readonly<CastleHeroSetupSelection>,
): CastleHeroSetupValidationResult {
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
