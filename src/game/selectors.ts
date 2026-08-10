import {
  EMPTY_ATTRIBUTES,
  type AttributeKey,
  type HeroAttributes,
  type HeroClass,
  type HeroVocation,
} from "./campaignState.ts";

export interface HeroAttributeBonus {
  readonly attribute: AttributeKey;
  readonly amount: number;
}

const HERO_CLASS_ATTRIBUTE_BONUS: Record<
  HeroClass,
  HeroAttributeBonus
> = {
  fighter: { attribute: "str", amount: 1 },
  ranger: { attribute: "per", amount: 1 },
  mage: { attribute: "int", amount: 1 },
};

const HERO_VOCATION_ATTRIBUTE_BONUS: Record<
  HeroVocation,
  HeroAttributeBonus
> = {
  general: { attribute: "lead", amount: 1 },
  spy: { attribute: "agy", amount: 1 },
  diplomat: { attribute: "cha", amount: 1 },
};

export function selectHeroClassAttributeBonus(
  heroClass: HeroClass | null,
): HeroAttributeBonus | null {
  return heroClass ? HERO_CLASS_ATTRIBUTE_BONUS[heroClass] : null;
}

export function selectHeroVocationAttributeBonus(
  vocation: HeroVocation | null,
): HeroAttributeBonus | null {
  return vocation ? HERO_VOCATION_ATTRIBUTE_BONUS[vocation] : null;
}

export function selectHeroPathBonus(
  heroClass: HeroClass | null,
  vocation: HeroVocation | null,
): HeroAttributes {
  const result = { ...EMPTY_ATTRIBUTES };
  const bonuses = [
    selectHeroClassAttributeBonus(heroClass),
    selectHeroVocationAttributeBonus(vocation),
  ];

  for (const bonus of bonuses) {
    if (bonus) result[bonus.attribute] += bonus.amount;
  }

  return result;
}

export function selectHeroAttributes(selection: {
  readonly freeAttributes: Readonly<HeroAttributes>;
  readonly heroClass: HeroClass | null;
  readonly vocation: HeroVocation | null;
}): HeroAttributes {
  const result = { ...selection.freeAttributes };
  const pathBonus = selectHeroPathBonus(
    selection.heroClass,
    selection.vocation,
  );

  for (const key of Object.keys(EMPTY_ATTRIBUTES) as AttributeKey[]) {
    result[key] += pathBonus[key];
  }

  return result;
}
