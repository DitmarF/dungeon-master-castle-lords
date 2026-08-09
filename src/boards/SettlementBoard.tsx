"use client";

import { useGame } from "../game/GameProvider";
import { GameIcon } from "../ui/GameIcon";
import { GameShell } from "../ui/GameShell";

export function SettlementBoard() {
  const { activeGame, navigateToBoard, selectedPlayer } = useGame();

  if (!activeGame?.hero || !selectedPlayer) return null;
  const { dungeon, hero } = activeGame;
  const settlementType =
    hero.faction === "dungeon" ? "Dungeon stronghold" : "Castle seat";

  return (
    <GameShell
      className="settlement-view"
      title="Main settlement"
      subtitle={`${settlementType} · Foundation`}
      icon="castle"
      stats={[
        { label: "Day", value: dungeon.day, icon: "calendar" },
        { label: "Gold", value: dungeon.treasury, icon: "coin" },
        { label: "Level", value: dungeon.level, icon: "layers" },
      ]}
    >
      <section className="settlement-board" aria-labelledby="settlement-title">
        <header className="board-summary">
          <div>
            <span className="section-kicker">First domain</span>
            <h1 id="settlement-title">{settlementType}</h1>
          </div>
          <span className="status-chip">
            <span className="status-dot" /> Claimed
          </span>
        </header>

        <div className="settlement-map">
          <div className="settlement-grid" aria-hidden="true" />
          <div className="settlement-empty">
            <span className="settlement-empty__mark">
              <GameIcon name="castle" size={32} />
            </span>
            <span className="section-kicker">Board unlocked</span>
            <h2>Your first settlement is under control.</h2>
            <p>
              This board is ready for the next prototype systems: rooms,
              resources, population, and construction.
            </p>
            <button
              type="button"
              className="button button--secondary"
              onClick={() => navigateToBoard("dungeon")}
            >
              <GameIcon name="back" size={17} /> Return to exploration
            </button>
          </div>
          <span className="future-slot future-slot--one">Future district 01</span>
          <span className="future-slot future-slot--two">Future district 02</span>
          <span className="future-slot future-slot--three">Future district 03</span>
        </div>
      </section>
    </GameShell>
  );
}
