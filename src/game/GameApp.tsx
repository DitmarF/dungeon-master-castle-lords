"use client";

import { useEffect } from "react";
import { BoardCatalogProvider } from "../boards/BoardCatalogContext";
import { SetupBoard } from "../boards/SetupBoard";
import { StartBoard } from "../boards/StartBoard";
import {
  BOARD_CATALOG,
  getBoardAvailability,
  resolveActiveBoard,
} from "../boards/registry";
import { GameIcon } from "../ui/GameIcon";
import { useGame } from "./GameProvider";

export function GameApp() {
  const {
    activeGame,
    hydrated,
    navigateToBoard,
    returnToPlayers,
    view,
  } = useGame();
  const boardResolution =
    activeGame?.setupComplete && activeGame.hero
      ? resolveActiveBoard(activeGame)
      : null;
  const fallbackBoardId = boardResolution?.usedFallback
    ? boardResolution.module.id
    : null;

  useEffect(() => {
    if (fallbackBoardId) navigateToBoard(fallbackBoardId);
  }, [fallbackBoardId, navigateToBoard]);

  if (!hydrated) {
    return (
      <main className="loading-screen" aria-label="Loading player registry">
        <span className="loading-mark"><GameIcon name="castle" size={30} /></span>
        <p>Opening the registry…</p>
      </main>
    );
  }

  if (view !== "game") return <StartBoard />;
  if (!activeGame?.setupComplete || !activeGame.hero) return <SetupBoard />;
  if (!boardResolution) {
    return (
      <main className="loading-screen" role="alert">
        <span className="loading-mark">
          <GameIcon name="castle" size={30} />
        </span>
        <p>No available game board could be opened.</p>
        <button
          type="button"
          className="button button--secondary"
          onClick={returnToPlayers}
        >
          <GameIcon name="back" size={17} /> Return to players
        </button>
      </main>
    );
  }
  if (boardResolution.usedFallback) {
    return (
      <main className="loading-screen" aria-label="Opening available board">
        <span className="loading-mark">
          <GameIcon name="grid" size={30} />
        </span>
        <p>Opening an available board…</p>
      </main>
    );
  }

  const ActiveBoard = boardResolution.module.component;
  return (
    <BoardCatalogProvider
      catalog={BOARD_CATALOG}
      getAvailability={getBoardAvailability}
    >
      <ActiveBoard />
    </BoardCatalogProvider>
  );
}
