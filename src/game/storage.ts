import type {
  RawStorageReadResult,
  RawStorageWriteResult,
  RegistryStorageAdapter,
  StorageWriteFailureCode,
} from "./persistence";

export const GAME_REGISTRY_STORAGE_KEY = "dmcl.prototype.registry.v1";
export const GAME_REGISTRY_V2_STORAGE_KEY = "dmcl.prototype.registry.v2";

function storageUnavailable(): RawStorageReadResult {
  return { ok: false, code: "storage-unavailable" };
}

function classifyWriteFailure(error: unknown): StorageWriteFailureCode {
  if (
    error instanceof DOMException &&
    (error.name === "QuotaExceededError" ||
      error.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
      error.code === 22 ||
      error.code === 1014)
  ) {
    return "quota-exceeded";
  }
  if (error instanceof DOMException && error.name === "SecurityError") {
    return "storage-unavailable";
  }
  return "write-failed";
}

function getLocalStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function createLocalRegistryStorage(key: string): RegistryStorageAdapter {
  return {
    read(): RawStorageReadResult {
      const storage = getLocalStorage();
      if (!storage) return storageUnavailable();
      try {
        return {
          ok: true,
          value: storage.getItem(key),
        };
      } catch (error) {
        if (error instanceof DOMException && error.name === "SecurityError") {
          return storageUnavailable();
        }
        return { ok: false, code: "storage-read-failed" };
      }
    },

    write(value: string): RawStorageWriteResult {
      const storage = getLocalStorage();
      if (!storage) return { ok: false, code: "storage-unavailable" };
      try {
        storage.setItem(key, value);
        return { ok: true };
      } catch (error) {
        return { ok: false, code: classifyWriteFailure(error) };
      }
    },

    remove(): RawStorageWriteResult {
      const storage = getLocalStorage();
      if (!storage) return { ok: false, code: "storage-unavailable" };
      try {
        storage.removeItem(key);
        return { ok: true };
      } catch (error) {
        return { ok: false, code: classifyWriteFailure(error) };
      }
    },
  };
}

export const legacyGameStorage = createLocalRegistryStorage(
  GAME_REGISTRY_STORAGE_KEY,
);

export const gameStorageV2 = createLocalRegistryStorage(
  GAME_REGISTRY_V2_STORAGE_KEY,
);

/** @deprecated Version-1 compatibility adapter; new application writes use v2. */
export const gameStorage = legacyGameStorage;
