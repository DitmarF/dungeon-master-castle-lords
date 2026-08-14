import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function source(path: string): Promise<string> {
  return readFile(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("opening boards render only authoritative version-5 foundation facts", async () => {
  const [world, settlement, hero, shell] = await Promise.all([
    source("src/boards/WorldBoard.tsx"),
    source("src/boards/SettlementBoard.tsx"),
    source("src/boards/HeroBoard.tsx"),
    source("src/ui/GameShell.tsx"),
  ]);

  assert.match(world, /world\.regions\.map/);
  assert.match(world, /RESOURCE_SITE_DEFINITION_BY_ID/);
  assert.match(world, /REGION_LOCATION_DEFINITION_BY_ID/);
  assert.match(world, /Enter regional Dungeon/);
  assert.match(world, /aria-pressed=\{selected\}/);
  assert.match(settlement, /capital\.definitionId/);
  assert.match(settlement, /world\.regions\.length/);
  assert.match(hero, /strategicRegionId/);
  assert.match(hero, /explorationContext/);
  assert.match(hero, /attributesCompatibility\.values/);
  assert.match(shell, /navigateToBoard\("hero"\)/);
  assert.match(shell, /aria-label="Open Hero board"/);
  assert.doesNotMatch(shell, /HeroSheet|activeOverlay.*hero/);

  for (const text of [world, settlement, hero, shell]) {
    assert.doesNotMatch(text, /Dungeon day|Strategic Day|\bGold\b|treasury/i);
  }
  assert.doesNotMatch(world, /Math\.random|localStorage|createDungeonLevel/);
  assert.doesNotMatch(settlement, /claimSettlement|settlementClaimed/);
});

test("locked future boards name the accepted roadmap owners", async () => {
  const combat = await source("src/boards/CombatBoard.tsx");
  const diplomacy = await source("src/boards/DiplomacyBoard.tsx");

  assert.match(combat, /EPIC 07/);
  assert.match(diplomacy, /EPIC 09/);
  assert.doesNotMatch(combat, /EPIC 11/);
});

test("available sub-skills inherit their parent tree accent", async () => {
  const styles = await source("app/globals.css");
  const availableRule = styles.match(/\.skill-node--available \{[\s\S]*?\n\}/)?.[0];

  assert.ok(availableRule);
  assert.match(availableRule, /border-color:[^;]*var\(--tree-accent\)/);
  assert.match(availableRule, /background:[^;]*var\(--tree-accent\)/);
  assert.doesNotMatch(availableRule, /--fs-feedback-success/);
});

test("smallest-phone campaign actions stack as full-width touch targets", async () => {
  const styles = await source("app/globals.css");
  const start = styles.indexOf("@media (max-width: 379px)");
  const end = styles.indexOf("@media (max-width: 520px)", start);

  assert.ok(start >= 0 && end > start);
  const smallestPhoneRules = styles.slice(start, end);
  assert.match(
    smallestPhoneRules,
    /\.campaign-actions \{[\s\S]*?grid-template-columns: minmax\(0, 1fr\)/,
  );
  assert.match(
    smallestPhoneRules,
    /\.campaign-actions \.button \{[\s\S]*?width: 100%[\s\S]*?white-space: nowrap/,
  );
});

test("the home ring uses one edge-sharing axial hex tessellation", async () => {
  const styles = await source("app/globals.css");

  assert.match(styles, /--world-hex-step-x: 84px/);
  assert.match(styles, /--world-hex-half-height: 48\.5px/);
  assert.match(styles, /\.world-region \{[\s\S]*?position: absolute/);
  assert.match(styles, /\.world-region \{[\s\S]*?padding: 0/);
  assert.match(
    styles,
    /\.world-region \{[\s\S]*?clip-path: polygon\(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%\)/,
  );
  assert.match(
    styles,
    /\.world-region \{[\s\S]*?background: var\(--fs-border-strong\)/,
  );
  assert.match(
    styles,
    /\.world-region__surface \{[\s\S]*?width: calc\(100% - 4px\)[\s\S]*?margin: 2px/,
  );
  assert.match(
    styles,
    /\.world-region:focus-visible \{[\s\S]*?background: var\(--fs-border-focus\)/,
  );
  assert.match(
    styles,
    /clip-path: polygon\(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%\)/,
  );
  assert.match(
    styles,
    /\.world-region--east \{[\s\S]*?--world-hex-x: var\(--world-hex-step-x\);[\s\S]*?--world-hex-y: var\(--world-hex-half-height\)/,
  );
  assert.match(
    styles,
    /\.world-region--south-east \{[\s\S]*?--world-hex-y: var\(--world-hex-height\)/,
  );
});

test("recovery and confirmations use typed outcomes and the shared focus-managed dialog", async () => {
  const [app, start, provider] = await Promise.all([
    source("src/game/GameApp.tsx"),
    source("src/boards/StartBoard.tsx"),
    source("src/game/GameProvider.tsx"),
  ]);

  for (const code of [
    "incompatible-legacy-campaign",
    "parse-failed",
    "registry-validation-failed",
    "campaign-validation-failed",
    "migration-failed",
    "quota-exceeded",
    "write-failed",
  ]) {
    assert.match(app, new RegExp(code));
  }
  assert.match(app, /replaceIncompatibleLegacy/);
  assert.match(app, /original legacy payload remains/i);
  assert.match(start, /<ModalOverlay/);
  assert.match(provider, /replaceIncompatibleLegacyRegistry/);
});
