"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import { createNewGame, createPlayerProfile } from "./createGame";
import {
  EMPTY_REGISTRY,
  type GameRegistry,
  type GameSave,
  type PlayerProfile,
  type RuntimeState,
} from "./model";
import { gameStorage } from "./storage";

type Action =
  | { type: "hydrate"; registry: GameRegistry }
  | { type: "createPlayer"; player: PlayerProfile }
  | { type: "selectPlayer"; playerId: string }
  | { type: "deletePlayer"; playerId: string }
  | { type: "openGame"; playerId: string; game: GameSave }
  | { type: "saveGame"; game: GameSave }
  | { type: "returnToPlayers"; game: GameSave | null };

const INITIAL_STATE: RuntimeState = {
  hydrated: false,
  registry: EMPTY_REGISTRY,
  selectedPlayerId: null,
  activeGame: null,
  view: "players",
};

function touchPlayer(
  players: PlayerProfile[],
  playerId: string,
  timestamp: string,
): PlayerProfile[] {
  return players.map((player) =>
    player.id === playerId
      ? { ...player, lastPlayedAt: timestamp }
      : player,
  );
}

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

    case "createPlayer":
      return {
        ...state,
        selectedPlayerId: action.player.id,
        registry: {
          ...state.registry,
          players: [...state.registry.players, action.player],
          lastActivePlayerId: action.player.id,
        },
      };

    case "selectPlayer":
      return {
        ...state,
        selectedPlayerId: action.playerId,
        registry: {
          ...state.registry,
          lastActivePlayerId: action.playerId,
        },
      };

    case "deletePlayer": {
      const players = state.registry.players.filter(
        (player) => player.id !== action.playerId,
      );
      const games = { ...state.registry.games };
      delete games[action.playerId];

      const selectedPlayerId =
        state.selectedPlayerId === action.playerId
          ? players[0]?.id ?? null
          : state.selectedPlayerId;

      return {
        ...state,
        selectedPlayerId,
        registry: {
          ...state.registry,
          players,
          games,
          lastActivePlayerId: selectedPlayerId,
        },
      };
    }

    case "openGame": {
      const now = new Date().toISOString();
      const game = { ...action.game, updatedAt: now };

      return {
        ...state,
        view: "game",
        selectedPlayerId: action.playerId,
        activeGame: game,
        registry: {
          ...state.registry,
          players: touchPlayer(state.registry.players, action.playerId, now),
          games: { ...state.registry.games, [action.playerId]: game },
          lastActivePlayerId: action.playerId,
        },
      };
    }

    case "saveGame":
      return {
        ...state,
        activeGame: action.game,
        registry: {
          ...state.registry,
          games: {
            ...state.registry.games,
            [action.game.playerId]: action.game,
          },
        },
      };

    case "returnToPlayers": {
      const games = action.game
        ? { ...state.registry.games, [action.game.playerId]: action.game }
        : state.registry.games;

      return {
        ...state,
        view: "players",
        activeGame: null,
        registry: { ...state.registry, games },
      };
    }
  }
}

interface CreatePlayerResult {
  ok: boolean;
  error?: string;
}

interface GameContextValue {
  hydrated: boolean;
  players: PlayerProfile[];
  selectedPlayer: PlayerProfile | null;
  selectedGame: GameSave | null;
  activeGame: GameSave | null;
  view: RuntimeState["view"];
  createPlayer: (name: string, bannerColor: string) => CreatePlayerResult;
  selectPlayer: (playerId: string) => void;
  deletePlayer: (playerId: string) => void;
  startNewGame: (playerId: string) => void;
  loadGame: (playerId: string) => void;
  saveGame: () => void;
  returnToPlayers: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  useEffect(() => {
    dispatch({ type: "hydrate", registry: gameStorage.read() });
  }, []);

  useEffect(() => {
    if (state.hydrated) gameStorage.write(state.registry);
  }, [state.hydrated, state.registry]);

  const createPlayer = useCallback(
    (name: string, bannerColor: string): CreatePlayerResult => {
      const trimmedName = name.trim();
      if (trimmedName.length < 2) {
        return { ok: false, error: "Use at least 2 characters." };
      }
      if (trimmedName.length > 24) {
        return { ok: false, error: "Keep the name under 25 characters." };
      }
      if (
        state.registry.players.some(
          (player) => player.name.toLowerCase() === trimmedName.toLowerCase(),
        )
      ) {
        return { ok: false, error: "That lord already exists." };
      }

      dispatch({
        type: "createPlayer",
        player: createPlayerProfile(trimmedName, bannerColor),
      });
      return { ok: true };
    },
    [state.registry.players],
  );

  const selectPlayer = useCallback((playerId: string) => {
    dispatch({ type: "selectPlayer", playerId });
  }, []);

  const deletePlayer = useCallback((playerId: string) => {
    dispatch({ type: "deletePlayer", playerId });
  }, []);

  const startNewGame = useCallback((playerId: string) => {
    dispatch({
      type: "openGame",
      playerId,
      game: createNewGame(playerId),
    });
  }, []);

  const loadGame = useCallback(
    (playerId: string) => {
      const game = state.registry.games[playerId];
      if (game) dispatch({ type: "openGame", playerId, game });
    },
    [state.registry.games],
  );

  const saveGame = useCallback(() => {
    if (!state.activeGame) return;
    dispatch({
      type: "saveGame",
      game: { ...state.activeGame, updatedAt: new Date().toISOString() },
    });
  }, [state.activeGame]);

  const returnToPlayers = useCallback(() => {
    const game = state.activeGame
      ? { ...state.activeGame, updatedAt: new Date().toISOString() }
      : null;
    dispatch({ type: "returnToPlayers", game });
  }, [state.activeGame]);

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
      createPlayer,
      selectPlayer,
      deletePlayer,
      startNewGame,
      loadGame,
      saveGame,
      returnToPlayers,
    }),
    [
      state.hydrated,
      state.registry.players,
      state.activeGame,
      state.view,
      selectedPlayer,
      selectedGame,
      createPlayer,
      selectPlayer,
      deletePlayer,
      startNewGame,
      loadGame,
      saveGame,
      returnToPlayers,
    ],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame must be used inside GameProvider");
  return context;
}
