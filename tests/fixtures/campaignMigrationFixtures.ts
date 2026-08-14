import type {
  CampaignStateV4,
  HeroAttributes,
  HeroState,
} from "../../src/game/campaignState.ts";
import { createDungeonLevel } from "../../src/game/generateDungeon.ts";
import { createEmptySkillRanks } from "../../src/game/skillTrees.ts";

export const FIXTURE_PLAYER_ID = "player-migration-fixture";
export const FIXTURE_CAMPAIGN_ID = "game-migration-fixture";
export const FIXTURE_CREATED_AT = "2026-08-01T10:00:00.000Z";
export const FIXTURE_UPDATED_AT = "2026-08-02T11:30:00.000Z";
export const FIXTURE_CAMPAIGN_SEED = 987_654_321;

const FREE_ATTRIBUTES: HeroAttributes = {
  str: 1,
  agy: 0,
  per: 0,
  int: 0,
  cha: 1,
  lead: 0,
};

function createHero(faction: "castle" | "dungeon"): HeroState {
  const skills = createEmptySkillRanks();
  skills["close-combat"] = 2;
  skills.diplomacy = 1;
  skills["heavy-blow"] = 1;
  return {
    faction,
    heroClass: "fighter",
    vocation: "diplomat",
    freeAttributes: { ...FREE_ATTRIBUTES },
    bonusSkill: "heavy-blow",
    attributes: {
      str: 2,
      agy: 0,
      per: 0,
      int: 0,
      cha: 2,
      lead: 0,
    },
    skills,
    position: { x: 3, y: 8 },
    visionRadius: 1,
  };
}

export function completedV4CastleFixture(): CampaignStateV4 {
  const dungeon = {
    ...createDungeonLevel(FIXTURE_CAMPAIGN_SEED),
    level: 4,
    day: 18,
    treasury: 730,
    discovered: ["2,8", "3,8", "4,8"],
    heartReached: true,
    settlementClaimed: true,
  };
  return {
    version: 4,
    id: FIXTURE_CAMPAIGN_ID,
    playerId: FIXTURE_PLAYER_ID,
    campaignSeed: FIXTURE_CAMPAIGN_SEED,
    createdAt: FIXTURE_CREATED_AT,
    updatedAt: FIXTURE_UPDATED_AT,
    activeBoardId: "dungeon",
    setupComplete: true,
    hero: createHero("castle"),
    dungeon,
  };
}

export function preSetupV4Fixture(): CampaignStateV4 {
  return {
    version: 4,
    id: FIXTURE_CAMPAIGN_ID,
    playerId: FIXTURE_PLAYER_ID,
    campaignSeed: FIXTURE_CAMPAIGN_SEED,
    createdAt: FIXTURE_CREATED_AT,
    updatedAt: FIXTURE_UPDATED_AT,
    activeBoardId: "setup",
    setupComplete: false,
    hero: null,
    dungeon: createDungeonLevel(FIXTURE_CAMPAIGN_SEED),
  };
}

export function completedV4DungeonFixture(): CampaignStateV4 {
  return {
    ...completedV4CastleFixture(),
    hero: createHero("dungeon"),
  };
}

export function supportedV3Fixture(): unknown {
  const fixture = structuredClone(completedV4CastleFixture()) as Record<
    string,
    unknown
  >;
  fixture.version = 3;
  delete fixture.campaignSeed;
  return fixture;
}

export function supportedV2Fixture(): unknown {
  return { ...(supportedV3Fixture() as Record<string, unknown>), version: 2 };
}

export function malformedCampaignFixture(): unknown {
  const fixture = structuredClone(completedV4CastleFixture()) as unknown as {
    dungeon: { tiles: string[] };
  };
  fixture.dungeon.tiles = ["invalid"];
  return fixture;
}

export const MALFORMED_REGISTRY_FIXTURE = {
  version: 1,
  players: "invalid",
  games: {},
  lastActivePlayerId: null,
};
