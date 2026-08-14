"use client";

import { useEffect } from "react";
import { SetupBoard } from "../boards/SetupBoard";
import { StartBoard } from "../boards/StartBoard";
import { getBoardModule } from "../boards/registry";
import { GameIcon } from "../ui/GameIcon";
import { useGame } from "./GameProvider";
import { resolveActiveBoard } from "./navigation";

export function GameApp() {
  const {
    activeGame,
    hydrated,
    hydrationFailure,
    navigateToBoard,
    retryPersistence,
    returnToPlayers,
    view,
  } = useGame();
  const boardResolution = activeGame?.foundation
    ? resolveActiveBoard(activeGame)
    : null;
  const fallbackBoardId = boardResolution?.usedFallback
    ? boardResolution.descriptor.id
    : null;

  useEffect(() => {
    if (fallbackBoardId) navigateToBoard(fallbackBoardId);
  }, [fallbackBoardId, navigateToBoard]);

  if (hydrationFailure) {
    return (
      <main className="loading-screen" role="alert">
        <span className="loading-mark">
          <GameIcon name="save" size={30} />
        </span>
        <p>{hydrationFailure.message}</p>
        <button
          type="button"
          className="button button--secondary"
          onClick={retryPersistence}
        >
          Retry opening saves
        </button>
      </main>
    );
  }

  if (!hydrated) {
    return (
      <main className="loading-screen" aria-label="Loading player registry">
        <span className="loading-mark"><GameIcon name="castle" size={30} /></span>
        <p>Opening the registry…</p>
      </main>
    );
  }

  if (view !== "game") return <StartBoard />;
  if (!activeGame?.foundation) return <SetupBoard />;
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

  const boardModule = getBoardModule(boardResolution.descriptor.id);
  if (!boardModule) return null;

  const ActiveBoard = boardModule.component;
  return <ActiveBoard />;
}
