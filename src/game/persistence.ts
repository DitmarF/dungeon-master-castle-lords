import type { CampaignStateV4 } from "./campaignState.ts";
import { isCampaignSeed } from "./random.ts";
import type { GameRegistryV1, PlayerProfile } from "./model.ts";

export type StorageReadFailureCode =
  | "storage-unavailable"
  | "storage-read-failed";

export type StorageWriteFailureCode =
  | "storage-unavailable"
  | "quota-exceeded"
  | "write-failed";

export type RawStorageReadResult =
  | { ok: true; value: string | null }
  | { ok: false; code: StorageReadFailureCode };

export type RawStorageWriteResult =
  | { ok: true }
  | { ok: false; code: StorageWriteFailureCode };

export interface RegistryStorageAdapter {
  read(): RawStorageReadResult;
  write(value: string): RawStorageWriteResult;
  remove(): RawStorageWriteResult;
}

export type PersistenceFailureCode =
  | StorageReadFailureCode
  | StorageWriteFailureCode
  | "parse-failed"
  | "registry-validation-failed"
  | "campaign-validation-failed"
  | "incompatible-legacy-campaign"
  | "migration-failed"
  | "serialization-failed"
  | "verification-failed";

export interface PersistenceFailure {
  code: PersistenceFailureCode;
  message: string;
}

const FAILURE_MESSAGES: Record<PersistenceFailureCode, string> = {
  "storage-unavailable":
    "Local campaign storage is unavailable. Your saved data was not changed.",
  "storage-read-failed":
    "The saved campaign could not be read. Your saved data was not changed.",
  "parse-failed":
    "The saved campaign data is malformed and could not be opened safely.",
  "registry-validation-failed":
    "The local player registry is invalid and could not be opened safely.",
  "campaign-validation-failed":
    "A saved campaign is invalid and could not be opened safely.",
  "incompatible-legacy-campaign":
    "A Dungeon-faction campaign cannot be converted into a Castle campaign. The original save was kept.",
  "migration-failed":
    "A saved campaign could not be upgraded safely. The original save was kept.",
  "serialization-failed":
    "The current campaign could not be prepared for local saving.",
  "quota-exceeded":
    "This browser has no space available for the campaign update.",
  "write-failed":
    "The campaign could not be written to local storage.",
  "verification-failed":
    "The campaign write could not be verified, so it was not reported as saved.",
};

export function createPersistenceFailure(
  code: PersistenceFailureCode,
): PersistenceFailure {
  return { code, message: FAILURE_MESSAGES[code] };
}

const failure = createPersistenceFailure;

export interface RegistryMigrationDependencies {
  migrateGame(value: unknown, playerId: string): CampaignStateV4;
}

export type RegistryHydrationResult =
  | { ok: true; status: "empty" | "loaded"; registry: GameRegistryV1 }
  | { ok: false; failure: PersistenceFailure };

export type RegistryWriteResult =
  | { ok: true }
  | { ok: false; failure: PersistenceFailure };

export type RequiredRegistryCommitResult =
  | { ok: true; registry: GameRegistryV1 }
  | {
      ok: false;
      registry: GameRegistryV1;
      failure: PersistenceFailure;
    };

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isInteger(value: unknown): value is number {
  return Number.isInteger(value);
}

function isTimestamp(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

function isPosition(value: unknown): boolean {
  return isRecord(value) && isInteger(value.x) && isInteger(value.y);
}

function isAttributes(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return ["str", "agy", "per", "int", "cha", "lead"].every((key) =>
    isFiniteNumber(value[key]),
  );
}

function isDungeon(value: unknown): boolean {
  if (!isRecord(value) || !isRecord(value.grid)) return false;
  if (
    !isInteger(value.level) ||
    !isInteger(value.day) ||
    !isFiniteNumber(value.treasury) ||
    !isInteger(value.grid.columns) ||
    !isInteger(value.grid.rows) ||
    !isCampaignSeed(value.seed) ||
    !Array.isArray(value.rooms) ||
    !Array.isArray(value.tiles) ||
    !value.tiles.every((row) => typeof row === "string") ||
    value.tiles.length !== value.grid.rows ||
    !value.tiles.every((row) => row.length === value.grid.columns) ||
    !value.rooms.every(
      (room) =>
        isRecord(room) &&
        isInteger(room.id) &&
        isInteger(room.x) &&
        isInteger(room.y) &&
        isInteger(room.width) &&
        isInteger(room.height),
    ) ||
    !isPosition(value.start) ||
    !isPosition(value.heart) ||
    !Array.isArray(value.discovered) ||
    !value.discovered.every((cell) => typeof cell === "string") ||
    typeof value.heartReached !== "boolean" ||
    typeof value.settlementClaimed !== "boolean"
  ) {
    return false;
  }
  return true;
}

function isHero(value: unknown): boolean {
  if (!isRecord(value)) return false;
  if (
    (value.faction !== "dungeon" && value.faction !== "castle") ||
    !["fighter", "ranger", "mage"].includes(String(value.heroClass)) ||
    !["general", "spy", "diplomat"].includes(String(value.vocation)) ||
    typeof value.bonusSkill !== "string" ||
    !isAttributes(value.freeAttributes) ||
    !isAttributes(value.attributes) ||
    !isRecord(value.skills) ||
    !Object.values(value.skills).every(isFiniteNumber) ||
    !isPosition(value.position) ||
    !isFiniteNumber(value.visionRadius)
  ) {
    return false;
  }
  return true;
}

const BOARD_IDS = new Set([
  "setup",
  "hero",
  "settlement",
  "world",
  "dungeon",
  "combat",
  "diplomacy",
]);

function isCampaignEnvelope(value: unknown): boolean {
  if (!isRecord(value)) return false;
  if (
    ![2, 3, 4].includes(Number(value.version)) ||
    typeof value.id !== "string" ||
    typeof value.playerId !== "string" ||
    !isTimestamp(value.createdAt) ||
    !isTimestamp(value.updatedAt) ||
    typeof value.activeBoardId !== "string" ||
    !BOARD_IDS.has(value.activeBoardId) ||
    typeof value.setupComplete !== "boolean" ||
    !isDungeon(value.dungeon)
  ) {
    return false;
  }
  if (value.version === 4 && !isCampaignSeed(value.campaignSeed)) return false;
  if (value.setupComplete) {
    return isHero(value.hero);
  }
  return value.hero === null && value.activeBoardId === "setup";
}

function isPlayerProfile(value: unknown): value is PlayerProfile {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    value.id.length > 0 &&
    typeof value.name === "string" &&
    typeof value.bannerColor === "string" &&
    isTimestamp(value.createdAt) &&
    (value.lastPlayedAt === null || isTimestamp(value.lastPlayedAt))
  );
}

function validateRegistryContainer(value: unknown): value is {
  version: 1;
  players: PlayerProfile[];
  games: Record<string, unknown>;
  lastActivePlayerId: string | null;
} {
  if (!isRecord(value)) return false;
  if (
    value.version !== 1 ||
    !Array.isArray(value.players) ||
    !value.players.every(isPlayerProfile) ||
    !isRecord(value.games) ||
    (value.lastActivePlayerId !== null &&
      typeof value.lastActivePlayerId !== "string")
  ) {
    return false;
  }

  const playerIds = value.players.map((player) => player.id);
  if (new Set(playerIds).size !== playerIds.length) return false;
  if (
    value.lastActivePlayerId !== null &&
    !playerIds.includes(value.lastActivePlayerId)
  ) {
    return false;
  }
  return Object.keys(value.games).every((playerId) => playerIds.includes(playerId));
}

export function decodeRegistry(
  raw: string,
  dependencies: RegistryMigrationDependencies,
): RegistryHydrationResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, failure: failure("parse-failed") };
  }

  if (!validateRegistryContainer(parsed)) {
    return { ok: false, failure: failure("registry-validation-failed") };
  }

  const games: Record<string, CampaignStateV4> = {};
  for (const [playerId, source] of Object.entries(parsed.games)) {
    if (!isCampaignEnvelope(source)) {
      return { ok: false, failure: failure("campaign-validation-failed") };
    }

    let migrated: CampaignStateV4;
    try {
      migrated = dependencies.migrateGame(source, playerId);
    } catch {
      return { ok: false, failure: failure("migration-failed") };
    }

    if (!isCampaignEnvelope(migrated) || migrated.version !== 4) {
      return { ok: false, failure: failure("campaign-validation-failed") };
    }
    if (migrated.playerId !== playerId) {
      return { ok: false, failure: failure("campaign-validation-failed") };
    }
    games[playerId] = migrated;
  }

  return {
    ok: true,
    status: "loaded",
    registry: { ...parsed, games },
  };
}

export function hydrateRegistry(
  adapter: RegistryStorageAdapter,
  dependencies: RegistryMigrationDependencies,
  emptyRegistry: GameRegistryV1,
): RegistryHydrationResult {
  const read = adapter.read();
  if (!read.ok) return { ok: false, failure: failure(read.code) };
  if (read.value === null) {
    return {
      ok: true,
      status: "empty",
      registry: structuredClone(emptyRegistry),
    };
  }
  return decodeRegistry(read.value, dependencies);
}

function restorePreviousPayload(
  adapter: RegistryStorageAdapter,
  previous: string | null,
): void {
  if (previous === null) adapter.remove();
  else adapter.write(previous);
}

export function persistRegistry(
  adapter: RegistryStorageAdapter,
  registry: GameRegistryV1,
): RegistryWriteResult {
  const previous = adapter.read();
  if (!previous.ok) return { ok: false, failure: failure(previous.code) };

  let serialized: string;
  try {
    serialized = JSON.stringify(registry);
  } catch {
    return { ok: false, failure: failure("serialization-failed") };
  }

  const write = adapter.write(serialized);
  if (!write.ok) return { ok: false, failure: failure(write.code) };

  const verification = adapter.read();
  if (!verification.ok || verification.value !== serialized) {
    restorePreviousPayload(adapter, previous.value);
    return { ok: false, failure: failure("verification-failed") };
  }

  return { ok: true };
}

export function commitRequiredRegistryChange(
  adapter: RegistryStorageAdapter,
  current: GameRegistryV1,
  candidate: GameRegistryV1,
): RequiredRegistryCommitResult {
  const result = persistRegistry(adapter, candidate);
  return result.ok
    ? { ok: true, registry: candidate }
    : { ok: false, registry: current, failure: result.failure };
}

export class MemoryRegistryStorage implements RegistryStorageAdapter {
  value: string | null;
  reads = 0;
  writes = 0;
  removals = 0;
  readFailure: StorageReadFailureCode | null = null;
  writeFailure: StorageWriteFailureCode | null = null;
  verificationOverride: string | null | undefined;

  constructor(initialValue: string | null = null) {
    this.value = initialValue;
  }

  read(): RawStorageReadResult {
    this.reads += 1;
    if (this.readFailure) return { ok: false, code: this.readFailure };
    if (this.writes > 0 && this.verificationOverride !== undefined) {
      return { ok: true, value: this.verificationOverride };
    }
    return { ok: true, value: this.value };
  }

  write(value: string): RawStorageWriteResult {
    this.writes += 1;
    if (this.writeFailure) return { ok: false, code: this.writeFailure };
    this.value = value;
    return { ok: true };
  }

  remove(): RawStorageWriteResult {
    this.removals += 1;
    if (this.writeFailure) return { ok: false, code: this.writeFailure };
    this.value = null;
    return { ok: true };
  }
}
