"use client";

import { useEffect, useState } from "react";
import { useGame } from "../game/GameProvider";
import { BOARD_REGISTRY } from "./registry";
import { Crest } from "../ui/Crest";
import { GameIcon } from "../ui/GameIcon";

export function DungeonBoard() {
  const { activeGame, selectedPlayer, saveGame, returnToPlayers } = useGame();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!saved) return;
    const timer = window.setTimeout(() => setSaved(false), 1800);
    return () => window.clearTimeout(timer);
  }, [saved]);

  if (!activeGame || !selectedPlayer) return null;

  function handleSave() {
    saveGame();
    setSaved(true);
  }

  return (
    <main className="game-board-shell">
      <header className="game-toolbar">
        <button type="button" className="toolbar-back" onClick={returnToPlayers}>
          <GameIcon name="back" size={19} />
          <span>Players</span>
        </button>
        <div className="toolbar-title">
          <span className="toolbar-title__mark"><GameIcon name="castle" size={19} /></span>
          <div><strong>Dungeon Board</strong><small>Campaign · {selectedPlayer.name}</small></div>
        </div>
        <div className="game-stats" aria-label="Campaign status">
          <span><GameIcon name="calendar" size={16} /><small>Day</small><strong>{activeGame.dungeon.day}</strong></span>
          <span><GameIcon name="coin" size={16} /><small>Gold</small><strong>{activeGame.dungeon.treasury}</strong></span>
          <span><GameIcon name="layers" size={16} /><small>Level</small><strong>{activeGame.dungeon.level}</strong></span>
        </div>
        <div className="toolbar-player">
          <Crest color={selectedPlayer.bannerColor} size="sm" />
          <span>{selectedPlayer.name}</span>
        </div>
        <button type="button" className="save-button" onClick={handleSave}>
          <GameIcon name="save" size={18} /> <span>Save</span>
        </button>
      </header>

      <nav className="board-nav" aria-label="Game boards">
        {BOARD_REGISTRY.map((board) => (
          <button
            type="button"
            key={board.id}
            className={board.id === activeGame.activeBoardId ? "board-nav__item board-nav__item--active" : "board-nav__item"}
            disabled={!board.enabled}
            aria-label={board.label}
            aria-current={board.id === activeGame.activeBoardId ? "page" : undefined}
            title={board.label}
          >
            <GameIcon name={board.icon} size={21} />
            <span>{board.shortLabel}</span>
            {!board.enabled ? <i><GameIcon name="lock" size={10} /></i> : null}
          </button>
        ))}
      </nav>

      <section className="dungeon-workspace" aria-labelledby="dungeon-heading">
        <div className="board-heading">
          <div>
            <span className="section-kicker">Lower keep · Level {activeGame.dungeon.level}</span>
            <h1 id="dungeon-heading">Unclaimed depth</h1>
          </div>
          <div className="grid-readout">
            <span>{activeGame.dungeon.grid.columns} × {activeGame.dungeon.grid.rows}</span>
            <small>Square grid</small>
          </div>
        </div>

        <div className="dungeon-canvas">
          <svg
            className="dungeon-grid"
            viewBox="0 0 960 576"
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label="Empty dungeon grid with 20 columns and 12 rows"
          >
            <defs>
              <pattern id="minor-grid" width="48" height="48" patternUnits="userSpaceOnUse">
                <path d="M48 0H0V48" className="minor-grid-line" />
              </pattern>
              <pattern id="major-grid" width="192" height="192" patternUnits="userSpaceOnUse">
                <rect width="192" height="192" fill="url(#minor-grid)" />
                <path d="M192 0H0V192" className="major-grid-line" />
              </pattern>
            </defs>
            <rect width="960" height="576" className="grid-ground" />
            <rect width="960" height="576" fill="url(#major-grid)" />
            <path d="M0 0h960v576H0z" className="grid-outline" />
          </svg>

          <div className="empty-dungeon">
            <span className="empty-dungeon__symbol"><GameIcon name="grid" size={28} /></span>
            <div>
              <h2>The deep is quiet</h2>
              <p>No chambers have been placed on this level.</p>
            </div>
            <span className="empty-dungeon__tag">Board ready</span>
          </div>

          <div className="canvas-corner canvas-corner--top" aria-hidden="true" />
          <div className="canvas-corner canvas-corner--bottom" aria-hidden="true" />
        </div>

        <footer className="board-statusbar">
          <span><i className="status-dot" /> Autosave active</span>
          <span>Rooms: 0</span>
          <span>Selection: none</span>
          <span className="board-statusbar__tip">Pinch or scroll tools will arrive with building mode.</span>
        </footer>
      </section>

      {saved ? (
        <div className="save-toast" role="status">
          <GameIcon name="save" size={18} /> Campaign saved
        </div>
      ) : null}

      <div className="portrait-hint" role="status">
        <GameIcon name="layers" size={18} /> Rotate to landscape for the full game board.
      </div>
    </main>
  );
}
