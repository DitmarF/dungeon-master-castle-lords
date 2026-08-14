"use client";

import { useGame } from "../game/GameProvider";
import { GameIcon } from "../ui/GameIcon";
import { Panel } from "../ui/GamePrimitives";
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

        <div className="settlement-summary-grid">
          <Panel variant="raised" className="settlement-capital-card">
            <span className="settlement-empty__mark">
              <GameIcon name="castle" size={32} />
            </span>
            <span>
              <small>Capital reference</small>
              <h2>{capital.id}</h2>
              <p>
                {capital.definitionId} · Tier {capital.tier} · {capital.regionId}
              </p>
            </span>
          </Panel>

          <Panel className="settlement-fact-card">
            <small>Faction authority</small>
            <strong>Castle</strong>
            <p>The campaign owns this root identity; the Hero does not duplicate it.</p>
          </Panel>
          <Panel className="settlement-fact-card">
            <small>Controlled opening</small>
            <strong>{world.regions.length} regions</strong>
            <p>One home region and exactly six adjacent controlled neighbors.</p>
          </Panel>
          <Panel className="settlement-fact-card">
            <small>Starting contents</small>
            <strong>{world.sites.length} sites · {world.locations.length} locations</strong>
            <p>Food, Wood, Stone, a regional Dungeon, one inert ruin, and terrain-only context.</p>
          </Panel>
          <p className="settlement-boundary-note">
            This board shows existing campaign facts only. Production,
            buildings, projects, recruitment, costs, and evolution are not yet
            implemented.
          </p>
        </div>
      </section>
    </GameShell>
  );
}
