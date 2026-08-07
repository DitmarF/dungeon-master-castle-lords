"use client";

import { DungeonBoard } from "../boards/DungeonBoard";
import { SettlementBoard } from "../boards/SettlementBoard";
import { SetupBoard } from "../boards/SetupBoard";
import { StartBoard } from "../boards/StartBoard";
import { GameIcon } from "../ui/GameIcon";
import { useGame } from "./GameProvider";

export function GameApp() {
  const { activeGame, hydrated, view } = useGame();

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
  if (activeGame.activeBoardId === "settlement") return <SettlementBoard />;
  return <DungeonBoard />;
}
