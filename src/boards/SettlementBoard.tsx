"use client";

import { useGame } from "../game/GameProvider";
import { GameIcon } from "../ui/GameIcon";
import { Slot } from "../ui/GamePrimitives";
import { GameShell } from "../ui/GameShell";

export function SettlementBoard() {
  const { activeGame, selectedPlayer } = useGame();

  if (!activeGame?.foundation || !selectedPlayer) return null;
  const { capital, world } = activeGame.foundation;

  return (
    <GameShell
      className="settlement-view"
      title="Capital Village"
      subtitle="Castle · Tier 1 foundation"
      icon="castle"
      stats={[
        { label: "Tier", value: capital.tier, icon: "layers" },
        { label: "Regions", value: world.regions.length, icon: "world" },
        { label: "Sites", value: world.sites.length, icon: "target" },
      ]}
    >
      <section className="settlement-board" aria-labelledby="settlement-title">
        <header className="board-summary">
          <div>
            <span className="section-kicker">First domain</span>
            <h1 id="settlement-title">Tier-1 Village</h1>
          </div>
          <span className="status-chip">
            <span className="status-dot" /> Established
          </span>
        </header>

        <div className="settlement-map">
          <div className="settlement-grid" aria-hidden="true" />
          <div className="settlement-empty">
            <span className="settlement-empty__mark">
              <GameIcon name="castle" size={32} />
            </span>
            <span className="section-kicker">Village-first opening</span>
            <h2>Your capital is established.</h2>
            <p>
              The Village and controlled home ring are campaign facts. Economy,
              buildings, and projects remain later work.
            </p>
          </div>
          <Slot label="Future district 01" className="future-slot future-slot--one" />
          <Slot label="Future district 02" className="future-slot future-slot--two" />
          <Slot label="Future district 03" className="future-slot future-slot--three" />
        </div>
      </section>
    </GameShell>
  );
}
