import { migrateCampaignToV5, validateCampaignStateV5 } from "./campaignMigration.ts";
import type {
  GameRegistryV2,
  PlayerProfile,
} from "./model.ts";
import {
  createPersistenceFailure,
  type PersistenceFailure,
  type RegistryStorageAdapter,
} from "./persistence.ts";

export type RegistryV2HydrationResult =
  | {
      ok: true;
      status: "empty" | "loaded" | "legacy-cutover";
      registry: GameRegistryV2;
    }
  | { ok: false; failure: PersistenceFailure };

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isTimestamp(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
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

function validateContainer(
  value: unknown,
  version: 1 | 2,
): value is {
  version: 1 | 2;
  players: PlayerProfile[];
  games: Record<string, unknown>;
  lastActivePlayerId: string | null;
} {
  if (
    !isRecord(value) ||
    value.version !== version ||
    !Array.isArray(value.players) ||
    !value.players.every(isPlayerProfile) ||
    !isRecord(value.games) ||
    (value.lastActivePlayerId !== null &&
      typeof value.lastActivePlayerId !== "string")
  ) {
    return false;
  }

  const playerIds = value.players.map((player) => player.id);
  return (
    new Set(playerIds).size === playerIds.length &&
    (value.lastActivePlayerId === null ||
      playerIds.includes(value.lastActivePlayerId)) &&
    Object.keys(value.games).every((playerId) => playerIds.includes(playerId))
  );
}

function parse(raw: string):
  | { ok: true; value: unknown }
  | { ok: false; failure: PersistenceFailure } {
  try {
    return { ok: true, value: JSON.parse(raw) };
  } catch {
    return {
      ok: false,
      failure: createPersistenceFailure("parse-failed"),
    };
  }
}

export function decodeRegistryV2(raw: string): RegistryV2HydrationResult {
  const parsed = parse(raw);
  if (!parsed.ok) return parsed;
  if (!validateContainer(parsed.value, 2)) {
    return {
      ok: false,
      failure: createPersistenceFailure("registry-validation-failed"),
    };
  }

  for (const [playerId, campaign] of Object.entries(parsed.value.games)) {
    if (
      validateCampaignStateV5(campaign).length > 0 ||
      !isRecord(campaign) ||
      campaign.playerId !== playerId
    ) {
      return {
        ok: false,
        failure: createPersistenceFailure("campaign-validation-failed"),
      };
    }
  }

  return {
    ok: true,
    status: "loaded",
    registry: structuredClone(parsed.value) as GameRegistryV2,
  };
}

export function decodeLegacyRegistryForV2(
  raw: string,
): RegistryV2HydrationResult {
  const parsed = parse(raw);
  if (!parsed.ok) return parsed;
  if (!validateContainer(parsed.value, 1)) {
    return {
      ok: false,
      failure: createPersistenceFailure("registry-validation-failed"),
    };
  }

  const games: GameRegistryV2["games"] = {};
  for (const [playerId, source] of Object.entries(parsed.value.games)) {
    const migrated = migrateCampaignToV5(source, playerId);
    if (!migrated.ok) {
      return {
        ok: false,
        failure: createPersistenceFailure("migration-failed"),
      };
    }
    games[playerId] = migrated.state;
  }

  return {
    ok: true,
    status: "legacy-cutover",
    registry: {
      version: 2,
      players: structuredClone(parsed.value.players),
      games,
      lastActivePlayerId: parsed.value.lastActivePlayerId,
    } as GameRegistryV2,
  };
}

function preservePrimaryPayload(
  adapter: RegistryStorageAdapter,
  previous: string | null,
): void {
  if (previous === null) adapter.remove();
  else adapter.write(previous);
}

export function persistRegistryV2(
  adapter: RegistryStorageAdapter,
  registry: GameRegistryV2,
): { ok: true } | { ok: false; failure: PersistenceFailure } {
  const previous = adapter.read();
  if (!previous.ok) {
    return {
      ok: false,
      failure: createPersistenceFailure(previous.code),
    };
  }

  let serialized: string;
  try {
    serialized = JSON.stringify(registry);
  } catch {
    return {
      ok: false,
      failure: createPersistenceFailure("serialization-failed"),
    };
  }

  const write = adapter.write(serialized);
  if (!write.ok) {
    return {
      ok: false,
      failure: createPersistenceFailure(write.code),
    };
  }
  const verification = adapter.read();
  if (!verification.ok || verification.value !== serialized) {
    preservePrimaryPayload(adapter, previous.value);
    return {
      ok: false,
      failure: createPersistenceFailure("verification-failed"),
    };
  }
  return { ok: true };
}

export function hydratePreferredRegistryV2(
  primary: RegistryStorageAdapter,
  legacy: RegistryStorageAdapter,
  emptyRegistry: GameRegistryV2,
): RegistryV2HydrationResult {
  const primaryRead = primary.read();
  if (!primaryRead.ok) {
    return {
      ok: false,
      failure: createPersistenceFailure(primaryRead.code),
    };
  }
  if (primaryRead.value !== null) return decodeRegistryV2(primaryRead.value);

  const legacyRead = legacy.read();
  if (!legacyRead.ok) {
    return {
      ok: false,
      failure: createPersistenceFailure(legacyRead.code),
    };
  }
  if (legacyRead.value === null) {
    return {
      ok: true,
      status: "empty",
      registry: structuredClone(emptyRegistry),
    };
  }

  const decoded = decodeLegacyRegistryForV2(legacyRead.value);
  if (!decoded.ok) return decoded;
  const persisted = persistRegistryV2(primary, decoded.registry);
  if (!persisted.ok) return persisted;
  return decoded;
}
