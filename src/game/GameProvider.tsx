"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import {
  createNewGame,
  createPlayerProfile,
  migrateLegacyGame,
} from "./createGame";
import { systemClock, type Clock } from "./clock";
import {
  activateCampaign,
  addPlayerToRegistry,
  removePlayerAndCampaign,
  selectPlayerInRegistry,
  stampCampaignModification,
  storeCampaign,
} from "./lifecycle";
import type { RegisteredBoardId } from "./navigation";
import { systemIdSource } from "./systemIdSource";
import { systemCampaignSeedSource } from "./systemCampaignSeedSource";
import {
  EMPTY_REGISTRY,
  type GameRegistry,
  type GameSave,
  type PlayerProfile,
  type PlayerId,
  type RuntimeState,
  type HeroSetupSelection,
} from "./model";
import {
  commitRequiredRegistryChange,
  hydrateRegistry,
  persistRegistry,
  type PersistenceFailure,
  type RegistryStorageAdapter,
} from "./persistence";
import { gameStorage } from "./storage";
import {
  claimSettlement as transitionClaimSettlement,
  completeHeroSetup as transitionCompleteHeroSetup,
  moveHeroInDungeon as transitionMoveHeroInDungeon,
  navigateToAvailableBoard,
  type ClaimSettlementResult,
  type CompleteHeroSetupResult,
  type DungeonMoveDirection,
  type MoveHeroInDungeonResult,
  type NavigateToAvailableBoardResult,
} from "./transitions";

type ThemePreference = "system" | "light" | "dark";

const THEME_STORAGE_KEY = "dmcl.prototype.theme.v1";

function readThemePreference(): ThemePreference {
  if (typeof window === "undefined") return "system";

  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : "system";
  } catch {
    return "system";
  }
}

function systemUsesDarkMode(): boolean {
  return typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
}

type Action =
  | { type: "hydrate"; registry: GameRegistry }
  | {
      type: "setRegistry";
      registry: GameRegistry;
      selectedPlayerId: PlayerId | null;
    }
  | {
      type: "openGame";
      playerId: PlayerId;
      game: GameSave;
      registry: GameRegistry;
    }
  | {
      type: "applyCampaignTransition";
      game: GameSave;
      registry: GameRegistry;
    }
  | { type: "returnToPlayers" };

const INITIAL_STATE: RuntimeState = {
  hydrated: false,
  registry: EMPTY_REGISTRY,
  selectedPlayerId: null,
  activeGame: null,
  view: "players",
};

function reducer(state: RuntimeState, action: Action): RuntimeState {
  switch (action.type) {
    case "hydrate": {
      const selectedPlayerId = action.registry.players.some(
        (player) => player.id === action.registry.lastActivePlayerId,
      )
        ? action.registry.lastActivePlayerId
        : action.registry.players[0]?.id ?? null;

      return {
        ...state,
        hydrated: true,
        registry: action.registry,
        selectedPlayerId,
      };
    }

    case "setRegistry":
      return {
        ...state,
        selectedPlayerId: action.selectedPlayerId,
        registry: action.registry,
      };

    case "openGame": {
      return {
        ...state,
        view: "game",
        selectedPlayerId: action.playerId,
        activeGame: action.game,
        registry: action.registry,
      };
    }

    case "applyCampaignTransition": {
      return {
        ...state,
        activeGame: action.game,
        registry: action.registry,
      };
    }

    case "returnToPlayers":
      return {
        ...state,
        view: "players",
        activeGame: null,
      };
  }
}

export interface PersistenceActionResult {
  ok: boolean;
  error?: PersistenceFailure;
}

interface CreatePlayerResult extends PersistenceActionResult {
  ok: boolean;
  message?: string;
}

interface GameContextValue {
  hydrated: boolean;
  players: PlayerProfile[];
  selectedPlayer: PlayerProfile | null;
  selectedGame: GameSave | null;
  activeGame: GameSave | null;
  view: RuntimeState["view"];
  darkMode: boolean;
  themePreference: ThemePreference;
  hydrationFailure: PersistenceFailure | null;
  persistenceIssue: PersistenceFailure | null;
  setDarkMode: (enabled: boolean) => void;
  useSystemTheme: () => void;
  createPlayer: (name: string, bannerColor: string) => CreatePlayerResult;
  selectPlayer: (playerId: PlayerId) => PersistenceActionResult;
  deletePlayer: (playerId: PlayerId) => PersistenceActionResult;
  startNewGame: (playerId: PlayerId) => PersistenceActionResult;
  loadGame: (playerId: PlayerId) => PersistenceActionResult;
  saveGame: () => PersistenceActionResult;
  retryPersistence: () => PersistenceActionResult;
  completeHeroSetup: (
    selection: HeroSetupSelection,
  ) => CompleteHeroSetupResult | null;
  moveHeroInDungeon: (
    direction: DungeonMoveDirection,
  ) => MoveHeroInDungeonResult | null;
  claimSettlement: () => ClaimSettlementResult | null;
  navigateToBoard: (
    boardId: RegisteredBoardId,
  ) => NavigateToAvailableBoardResult | null;
  returnToPlayers: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

interface GameProviderProps {
  children: ReactNode;
  clock?: Clock;
  storage?: RegistryStorageAdapter;
}

export function GameProvider({
  children,
  clock = systemClock,
  storage = gameStorage,
}: GameProviderProps) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const [hydrationFailure, setHydrationFailure] =
    useState<PersistenceFailure | null>(null);
  const [persistenceIssue, setPersistenceIssue] =
    useState<PersistenceFailure | null>(null);
  const [themePreference, setThemePreference] = useState<ThemePreference>(
    readThemePreference,
  );
  const [systemDarkMode, setSystemDarkMode] = useState(systemUsesDarkMode);
  const darkMode =
    themePreference === "system"
      ? systemDarkMode
      : themePreference === "dark";

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (event: MediaQueryListEvent) => {
      setSystemDarkMode(event.matches);
    };

    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    const theme = darkMode ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [darkMode]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      const hydratedAt = clock.now();
      const result = hydrateRegistry(
        storage,
        {
          migrateGame: (value, playerId) =>
            migrateLegacyGame(
              value,
              playerId,
              systemIdSource,
              systemCampaignSeedSource,
              hydratedAt,
            ),
        },
        EMPTY_REGISTRY,
      );

      if (!result.ok) {
        setHydrationFailure(result.failure);
        setPersistenceIssue(result.failure);
        return;
      }

      setHydrationFailure(null);
      setPersistenceIssue(null);
      dispatch({ type: "hydrate", registry: result.registry });
    });

    return () => {
      cancelled = true;
    };
  }, [clock, storage]);

  const writeRegistry = useCallback(
    (registry: GameRegistry): PersistenceActionResult => {
      const result = persistRegistry(storage, registry);
      if (!result.ok) {
        setPersistenceIssue(result.failure);
        return { ok: false, error: result.failure };
      }
      setPersistenceIssue(null);
      return { ok: true };
    },
    [storage],
  );

  const writeRequiredRegistry = useCallback(
    (registry: GameRegistry): PersistenceActionResult => {
      const result = commitRequiredRegistryChange(
        storage,
        state.registry,
        registry,
      );
      if (!result.ok) {
        setPersistenceIssue(result.failure);
        return { ok: false, error: result.failure };
      }
      setPersistenceIssue(null);
      return { ok: true };
    },
    [state.registry, storage],
  );

  const retryPersistence = useCallback((): PersistenceActionResult => {
    if (hydrationFailure) {
      const hydratedAt = clock.now();
      const result = hydrateRegistry(
        storage,
        {
          migrateGame: (value, playerId) =>
            migrateLegacyGame(
              value,
              playerId,
              systemIdSource,
              systemCampaignSeedSource,
              hydratedAt,
            ),
        },
        EMPTY_REGISTRY,
      );
      if (!result.ok) {
        setHydrationFailure(result.failure);
        setPersistenceIssue(result.failure);
        return { ok: false, error: result.failure };
      }
      setHydrationFailure(null);
      setPersistenceIssue(null);
      dispatch({ type: "hydrate", registry: result.registry });
      return { ok: true };
    }
    return writeRegistry(state.registry);
  }, [clock, hydrationFailure, state.registry, storage, writeRegistry]);

  const createPlayer = useCallback(
    (name: string, bannerColor: string): CreatePlayerResult => {
      const trimmedName = name.trim();
      if (trimmedName.length < 2) {
        return { ok: false, message: "Use at least 2 characters." };
      }
      if (trimmedName.length > 24) {
        return { ok: false, message: "Keep the name under 25 characters." };
      }
      if (
        state.registry.players.some(
          (player) => player.name.toLowerCase() === trimmedName.toLowerCase(),
        )
      ) {
        return { ok: false, message: "That lord already exists." };
      }

      const createdAt = clock.now();
      const player = createPlayerProfile(
        trimmedName,
        bannerColor,
        systemIdSource,
        createdAt,
      );
      const registry = addPlayerToRegistry(state.registry, player);
      const persistence = writeRequiredRegistry(registry);
      if (!persistence.ok) return persistence;
      dispatch({
        type: "setRegistry",
        registry,
        selectedPlayerId: player.id,
      });
      return { ok: true };
    },
    [clock, state.registry, writeRequiredRegistry],
  );

  const selectPlayer = useCallback(
    (playerId: PlayerId): PersistenceActionResult => {
      const registry = selectPlayerInRegistry(state.registry, playerId);
      const persistence = writeRegistry(registry);
      dispatch({ type: "setRegistry", registry, selectedPlayerId: playerId });
      return persistence;
    },
    [state.registry, writeRegistry],
  );

  const deletePlayer = useCallback(
    (playerId: PlayerId): PersistenceActionResult => {
      const registry = removePlayerAndCampaign(state.registry, playerId);
      const persistence = writeRequiredRegistry(registry);
      if (!persistence.ok) return persistence;
      const selectedPlayerId =
        state.selectedPlayerId === playerId
          ? registry.players[0]?.id ?? null
          : state.selectedPlayerId;
      dispatch({ type: "setRegistry", registry, selectedPlayerId });
      return { ok: true };
    },
    [state.registry, state.selectedPlayerId, writeRequiredRegistry],
  );

  const startNewGame = useCallback(
    (playerId: PlayerId): PersistenceActionResult => {
      const createdAt = clock.now();
      const game = createNewGame(
        playerId,
        systemIdSource,
        systemCampaignSeedSource.nextCampaignSeed(),
        createdAt,
      );
      const registry = activateCampaign(
        state.registry,
        playerId,
        game,
        createdAt,
      );
      const persistence = writeRequiredRegistry(registry);
      if (!persistence.ok) return persistence;
      dispatch({ type: "openGame", playerId, game, registry });
      return { ok: true };
    },
    [clock, state.registry, writeRequiredRegistry],
  );

  const loadGame = useCallback(
    (playerId: PlayerId): PersistenceActionResult => {
      const game = state.registry.games[playerId];
      if (!game) return { ok: false };
      const registry = activateCampaign(
        state.registry,
        playerId,
        game,
        clock.now(),
      );
      const persistence = writeRegistry(registry);
      dispatch({ type: "openGame", playerId, game, registry });
      return persistence;
    },
    [clock, state.registry, writeRegistry],
  );

  const saveGame = useCallback((): PersistenceActionResult => {
    if (!state.activeGame) return { ok: false };
    return writeRegistry(state.registry);
  }, [state.activeGame, state.registry, writeRegistry]);

  const commitCampaignTransition = useCallback(
    (transitioned: GameSave): GameSave => {
      const game = stampCampaignModification(transitioned, clock.now());
      const registry = storeCampaign(state.registry, game);
      writeRegistry(registry);
      dispatch({ type: "applyCampaignTransition", game, registry });
      return game;
    },
    [clock, state.registry, writeRegistry],
  );

  const completeHeroSetup = useCallback(
    (selection: HeroSetupSelection): CompleteHeroSetupResult | null => {
      if (!state.activeGame) return null;
      const result = transitionCompleteHeroSetup(state.activeGame, selection);
      if (!result.ok) return result;

      const game = commitCampaignTransition(result.state);
      return { ...result, state: game };
    },
    [commitCampaignTransition, state.activeGame],
  );

  const moveHeroInDungeon = useCallback(
    (direction: DungeonMoveDirection): MoveHeroInDungeonResult | null => {
      if (!state.activeGame) return null;
      const result = transitionMoveHeroInDungeon(state.activeGame, direction);
      if (!result.ok) return result;

      const game = commitCampaignTransition(result.state);
      return { ...result, state: game };
    },
    [commitCampaignTransition, state.activeGame],
  );

  const claimSettlement = useCallback((): ClaimSettlementResult | null => {
    if (!state.activeGame) return null;
    const result = transitionClaimSettlement(state.activeGame);
    if (!result.ok) return result;

    const game = commitCampaignTransition(result.state);
    return { ...result, state: game };
  }, [commitCampaignTransition, state.activeGame]);

  const navigateToBoard = useCallback(
    (
      boardId: RegisteredBoardId,
    ): NavigateToAvailableBoardResult | null => {
      if (!state.activeGame) return null;
      const result = navigateToAvailableBoard(state.activeGame, boardId);
      if (!result.ok || result.state === state.activeGame) return result;

      const game = commitCampaignTransition(result.state);
      return { ...result, state: game };
    },
    [commitCampaignTransition, state.activeGame],
  );

  const returnToPlayers = useCallback(() => {
    dispatch({ type: "returnToPlayers" });
  }, []);

  const setDarkMode = useCallback((enabled: boolean) => {
    const preference: ThemePreference = enabled ? "dark" : "light";
    setThemePreference(preference);

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, preference);
    } catch {
      // The setting still applies for this session if storage is unavailable.
    }
  }, []);

  const useSystemTheme = useCallback(() => {
    setThemePreference("system");

    try {
      window.localStorage.removeItem(THEME_STORAGE_KEY);
    } catch {
      // The setting still applies for this session if storage is unavailable.
    }
  }, []);

  const selectedPlayer =
    state.registry.players.find(
      (player) => player.id === state.selectedPlayerId,
    ) ?? null;
  const selectedGame = selectedPlayer
    ? state.registry.games[selectedPlayer.id] ?? null
    : null;

  const value = useMemo<GameContextValue>(
    () => ({
      hydrated: state.hydrated,
      players: state.registry.players,
      selectedPlayer,
      selectedGame,
      activeGame: state.activeGame,
      view: state.view,
      darkMode,
      themePreference,
      hydrationFailure,
      persistenceIssue,
      setDarkMode,
      useSystemTheme,
      createPlayer,
      selectPlayer,
      deletePlayer,
      startNewGame,
      loadGame,
      saveGame,
      retryPersistence,
      completeHeroSetup,
      moveHeroInDungeon,
      claimSettlement,
      navigateToBoard,
      returnToPlayers,
    }),
    [
      state.hydrated,
      state.registry.players,
      state.activeGame,
      state.view,
      darkMode,
      themePreference,
      hydrationFailure,
      persistenceIssue,
      selectedPlayer,
      selectedGame,
      createPlayer,
      selectPlayer,
      deletePlayer,
      startNewGame,
      loadGame,
      saveGame,
      retryPersistence,
      completeHeroSetup,
      moveHeroInDungeon,
      claimSettlement,
      navigateToBoard,
      returnToPlayers,
      setDarkMode,
      useSystemTheme,
    ],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame must be used inside GameProvider");
  return context;
}
