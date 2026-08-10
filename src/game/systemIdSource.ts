import type {
  IdSource,
  PersistentIdentityKind,
} from "./identity.ts";

const ID_PREFIX: Record<PersistentIdentityKind, "player" | "game"> = {
  player: "player",
  campaign: "game",
};

export const systemIdSource: IdSource = {
  next(kind) {
    if (typeof globalThis.crypto?.randomUUID !== "function") {
      throw new Error("Secure identity generation is unavailable.");
    }
    return `${ID_PREFIX[kind]}-${globalThis.crypto.randomUUID()}`;
  },
};
