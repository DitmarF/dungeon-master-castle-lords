import type {
  RawStorageReadResult,
  RawStorageWriteResult,
  RegistryStorageAdapter,
  StorageWriteFailureCode,
} from "./persistence";

export const GAME_REGISTRY_STORAGE_KEY = "dmcl.prototype.registry.v1";

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

export const gameStorage: RegistryStorageAdapter = {
  read(): RawStorageReadResult {
    const storage = getLocalStorage();
    if (!storage) return storageUnavailable();
    try {
      return {
        ok: true,
        value: storage.getItem(GAME_REGISTRY_STORAGE_KEY),
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
      storage.setItem(GAME_REGISTRY_STORAGE_KEY, value);
      return { ok: true };
    } catch (error) {
      return { ok: false, code: classifyWriteFailure(error) };
    }
  },

  remove(): RawStorageWriteResult {
    const storage = getLocalStorage();
    if (!storage) return { ok: false, code: "storage-unavailable" };
    try {
      storage.removeItem(GAME_REGISTRY_STORAGE_KEY);
      return { ok: true };
    } catch (error) {
      return { ok: false, code: classifyWriteFailure(error) };
    }
  },
};
