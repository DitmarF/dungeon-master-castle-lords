import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import type {
  AttributeKey,
  HeroAttributes,
  HeroClass,
  HeroVocation,
} from "../../src/game/campaignState.ts";
import {
  selectHeroAttributes,
  selectHeroClassAttributeBonus,
  selectHeroPathBonus,
  selectHeroVocationAttributeBonus,
} from "../../src/game/selectors.ts";

const ZERO_ATTRIBUTES: HeroAttributes = {
  str: 0,
  agy: 0,
  per: 0,
  int: 0,
  cha: 0,
  lead: 0,
};

const CLASS_BONUSES = [
  ["fighter", "str"],
  ["ranger", "per"],
  ["mage", "int"],
] as const satisfies readonly (readonly [HeroClass, AttributeKey])[];

const VOCATION_BONUSES = [
  ["general", "lead"],
  ["spy", "agy"],
  ["diplomat", "cha"],
] as const satisfies readonly (readonly [HeroVocation, AttributeKey])[];

test("current class and vocation bonus definitions have one typed authority", () => {
  for (const [heroClass, attribute] of CLASS_BONUSES) {
    assert.deepEqual(selectHeroClassAttributeBonus(heroClass), {
      attribute,
      amount: 1,
    });
  }
  for (const [vocation, attribute] of VOCATION_BONUSES) {
    assert.deepEqual(selectHeroVocationAttributeBonus(vocation), {
      attribute,
      amount: 1,
    });
  }
  assert.equal(selectHeroClassAttributeBonus(null), null);
  assert.equal(selectHeroVocationAttributeBonus(null), null);
  assert.deepEqual(selectHeroPathBonus(null, null), ZERO_ATTRIBUTES);
});

for (const [heroClass, classAttribute] of CLASS_BONUSES) {
  for (const [vocation, vocationAttribute] of VOCATION_BONUSES) {
    test(`${heroClass} and ${vocation} attributes are deterministic`, () => {
      const freeAttributes = { ...ZERO_ATTRIBUTES, str: 2 };
      const selection = { heroClass, vocation, freeAttributes };
      const snapshot = structuredClone(selection);
      const expected = { ...freeAttributes };
      expected[classAttribute] += 1;
      expected[vocationAttribute] += 1;

      assert.deepEqual(selectHeroAttributes(selection), expected);
      assert.deepEqual(selectHeroAttributes(selection), expected);
      assert.deepEqual(selection, snapshot);
    });
  }
}

test("Hero Setup consumes selectors without parallel mechanical bonus strings", async () => {
  const setupSource = await readFile(
    new URL("../../src/boards/SetupBoard.tsx", import.meta.url),
    "utf8",
  );

  assert.match(setupSource, /selectHeroAttributes/);
  assert.match(setupSource, /selectHeroClassAttributeBonus/);
  assert.match(setupSource, /selectHeroVocationAttributeBonus/);
  assert.doesNotMatch(
    setupSource,
    /\+1 (?:Strength|Perception|Intellect|Leadership|Agility|Charisma)/,
  );
});

test("Hero selectors stay independent from React, boards, browser, and platform code", async () => {
  const source = await readFile(
    new URL("../../src/game/selectors.ts", import.meta.url),
    "utf8",
  );

  assert.doesNotMatch(source, /from\s+["']react(?:\/[^"']*)?["']/);
  assert.doesNotMatch(source, /from\s+["'][^"']*(?:boards|storage)[^"']*["']/);
  assert.doesNotMatch(source, /\b(?:window|localStorage)\b/);
  assert.doesNotMatch(source, /(?:cloudflare|sites-project|\.openai\/hosting)/i);
});
