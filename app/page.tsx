"use client";

import { GameApp } from "../src/game/GameApp";
import { GameProvider } from "../src/game/GameProvider";

export default function Home() {
  return (
    <GameProvider>
      <GameApp />
    </GameProvider>
  );
}
