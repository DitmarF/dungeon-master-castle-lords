export type PlayerId = `player-${string}`;
export type CampaignId = `game-${string}`;
export type CellKey = `${number},${number}`;

export type PersistentIdentityKind = "player" | "campaign";

export interface IdSource {
  next(kind: PersistentIdentityKind): string;
}

const PLAYER_ID_PATTERN = /^player-[a-z0-9]+(?:-[a-z0-9]+)*$/;
const CAMPAIGN_ID_PATTERN = /^game-[a-z0-9]+(?:-[a-z0-9]+)*$/;
const CELL_KEY_PATTERN = /^-?\d+,-?\d+$/;

export function isPlayerId(value: unknown): value is PlayerId {
  return typeof value === "string" && PLAYER_ID_PATTERN.test(value);
}

export function isCampaignId(value: unknown): value is CampaignId {
  return typeof value === "string" && CAMPAIGN_ID_PATTERN.test(value);
}

export function isCellKey(value: unknown): value is CellKey {
  return typeof value === "string" && CELL_KEY_PATTERN.test(value);
}

function requireGeneratedId(
  kind: PersistentIdentityKind,
  value: string,
): PlayerId | CampaignId {
  const valid = kind === "player" ? isPlayerId(value) : isCampaignId(value);
  if (!valid) {
    throw new Error(`IdSource returned an invalid ${kind} ID.`);
  }
  return value;
}

export function createPlayerId(idSource: IdSource): PlayerId {
  return requireGeneratedId("player", idSource.next("player")) as PlayerId;
}

export function createCampaignId(idSource: IdSource): CampaignId {
  return requireGeneratedId(
    "campaign",
    idSource.next("campaign"),
  ) as CampaignId;
}

export function createCellKey(x: number, y: number): CellKey {
  if (!Number.isInteger(x) || !Number.isInteger(y)) {
    throw new Error("Cell keys require integer coordinates.");
  }
  return `${x},${y}`;
}
