import { EMPTY_REGISTRY, type GameRegistry } from "./model";

const STORAGE_KEY = "dmcl.prototype.registry.v1";

function isRegistry(value: unknown): value is GameRegistry {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<GameRegistry>;
  return (
    candidate.version === 1 &&
    Array.isArray(candidate.players) &&
    typeof candidate.games === "object" &&
    candidate.games !== null
  );
}

export const gameStorage = {
  read(): GameRegistry {
    if (typeof window === "undefined") return EMPTY_REGISTRY;

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return EMPTY_REGISTRY;

      const parsed: unknown = JSON.parse(raw);
      return isRegistry(parsed) ? parsed : EMPTY_REGISTRY;
    } catch {
      return EMPTY_REGISTRY;
    }
  },

  write(registry: GameRegistry): void {
    if (typeof window === "undefined") return;

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(registry));
    } catch {
      // The prototype remains playable if private browsing blocks persistence.
    }
  },
};
