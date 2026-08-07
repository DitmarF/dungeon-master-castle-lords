import type { GameSave, PlayerProfile } from "./model";

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
    version: 1,
    id: createId("game"),
    playerId,
    createdAt: now,
    updatedAt: now,
    activeBoardId: "dungeon",
    dungeon: {
      level: 1,
      day: 1,
      treasury: 100,
      grid: {
        columns: 20,
        rows: 12,
      },
      rooms: [],
    },
  };
}
