import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const inspectorUrl = new URL(
  "../../src/ui/DeveloperStateInspector.tsx",
  import.meta.url,
);
const settingsUrl = new URL("../../src/ui/SettingsSheet.tsx", import.meta.url);

test("the campaign inspector is development-gated and reuses the shared overlay", async () => {
  const [inspectorSource, settingsSource] = await Promise.all([
    readFile(inspectorUrl, "utf8"),
    readFile(settingsUrl, "utf8"),
  ]);

  assert.match(settingsSource, /import\.meta\.env\.DEV\s*&&\s*activeGame/);
  assert.match(settingsSource, /Campaign state inspector/);
  assert.match(inspectorSource, /<ModalOverlay/);
  assert.match(
    inspectorSource,
    /panelClassName="settings-sheet developer-inspector"/,
  );
  assert.match(inspectorSource, /aria-live="polite"/);
});

test("the inspector reads current version-5 campaign facts and compatibility attributes", async () => {
  const source = await readFile(inspectorUrl, "utf8");

  assert.match(source, /attributesCompatibility\.values/);
  assert.match(source, /JSON\.stringify\(activeGame, null, 2\)/);

  for (const label of [
    "Schema version",
    "Campaign ID",
    "Owner / player ID",
    "Campaign seed",
    "World seed",
    "World generator",
    "Dungeon seed",
    "Active board",
    "Hero Setup",
    "Faction",
    "Hero class",
    "Hero vocation",
    "Strategic region",
    "Exploration location",
    "Exploration cell",
    "Dungeon level",
    "Discovered cells",
    "Dungeon Heart",
    "Capital",
    "World snapshot authority",
    "Stored, not regenerated",
    "Retained regional Dungeon",
    "Legacy metadata",
    "Derived Hero attributes",
    "Raw authoritative campaign JSON",
  ]) {
    assert.match(
      source,
      new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
    );
  }
});

test("the inspector exposes copy only and no campaign mutation surface", async () => {
  const source = await readFile(inspectorUrl, "utf8");

  assert.match(source, /navigator\.clipboard\.writeText/);
  assert.match(source, /Copy campaign seed/);
  assert.match(source, /Copy state JSON/);
  assert.doesNotMatch(
    source,
    /updateGame|dispatch|gameStorage|localStorage|JSON\.parse|completeHeroSetup|moveHeroInDungeon|claimSettlement|navigateToBoard|<textarea|<input/,
  );
});
