"use client";

import { DungeonBoard } from "../boards/DungeonBoard";
import { StartBoard } from "../boards/StartBoard";
import { GameIcon } from "../ui/GameIcon";
import { useGame } from "./GameProvider";

export function GameApp() {
  const { hydrated, view } = useGame();

  if (!hydrated) {
    return (
      <main className="loading-screen" aria-label="Loading player registry">
        <span className="loading-mark"><GameIcon name="castle" size={30} /></span>
        <p>Opening the registry…</p>
      </main>
    );
  }

  return view === "game" ? <DungeonBoard /> : <StartBoard />;
}
