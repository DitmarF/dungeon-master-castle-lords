"use client";

import { useState } from "react";
import { useGame } from "../game/GameProvider";
import type { BoardId } from "../game/model";
import { BoardNavigation } from "../ui/BoardNavigation";
import { Crest } from "../ui/Crest";
import { GameIcon } from "../ui/GameIcon";
import { HeroSheet } from "../ui/HeroSheet";

export function SettlementBoard() {
  const { activeGame, selectedPlayer, saveGame, returnToPlayers, updateGame } = useGame();
  const [heroSheetOpen, setHeroSheetOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!activeGame?.hero || !selectedPlayer) return null;
  const { dungeon, hero } = activeGame;
  const settlementType = hero.faction === "dungeon" ? "Dungeon stronghold" : "Castle seat";

  function selectBoard(boardId: BoardId) {
    updateGame((game) => ({ ...game, activeBoardId: boardId }));
  }

  function handleSave() {
    saveGame();
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  }

  return (
    <main className="game-board-shell settlement-shell">
      <header className="game-toolbar">
        <button type="button" className="toolbar-back" onClick={returnToPlayers}><GameIcon name="back" size={19} /><span>Players</span></button>
        <div className="toolbar-title"><span className="toolbar-title__mark"><GameIcon name="castle" size={19} /></span><div><strong>Main settlement</strong><small>Campaign · {selectedPlayer.name}</small></div></div>
        <div className="game-stats" aria-label="Settlement status">
          <span><GameIcon name="calendar" size={16} /><small>Day</small><strong>{dungeon.day}</strong></span>
          <span><GameIcon name="coin" size={16} /><small>Gold</small><strong>{dungeon.treasury}</strong></span>
          <span><GameIcon name="layers" size={16} /><small>Level</small><strong>{dungeon.level}</strong></span>
        </div>
        <button type="button" className="hero-button" onClick={() => setHeroSheetOpen(true)}><GameIcon name="user" size={17} /><span>Hero</span></button>
        <div className="toolbar-player"><Crest color={selectedPlayer.bannerColor} size="sm" /><span>{selectedPlayer.name}</span></div>
        <button type="button" className="save-button" onClick={handleSave}><GameIcon name="save" size={18} /><span>Save</span></button>
      </header>

      <BoardNavigation activeBoardId={activeGame.activeBoardId} settlementClaimed={dungeon.settlementClaimed} onSelect={selectBoard} />

      <section className="settlement-workspace" aria-labelledby="settlement-title">
        <div className="board-heading">
          <div><span className="section-kicker">First domain · Foundation</span><h1 id="settlement-title">{settlementType}</h1></div>
          <div className="grid-readout"><span>Claimed</span><small>Settlement status</small></div>
        </div>
        <div className="settlement-canvas">
          <div className="settlement-grid" aria-hidden="true" />
          <div className="settlement-foundation">
            <span className="settlement-foundation__mark"><GameIcon name="castle" size={34} /></span>
            <span className="section-kicker">Board unlocked</span>
            <h2>Your first settlement is under control.</h2>
            <p>The Heart is bound and this management board is ready for its future rooms, resources, population, and construction systems.</p>
            <button type="button" className="button button--secondary" onClick={() => selectBoard("dungeon")}><GameIcon name="back" size={17} /> Return to exploration</button>
          </div>
          <div className="settlement-slot settlement-slot--one"><span>01</span><small>Future district</small></div>
          <div className="settlement-slot settlement-slot--two"><span>02</span><small>Future district</small></div>
          <div className="settlement-slot settlement-slot--three"><span>03</span><small>Future district</small></div>
        </div>
        <footer className="board-statusbar"><span><i className="status-dot" /> Settlement secured</span><span>Districts: 0</span><span>Structures: 0</span><span className="board-statusbar__tip">This board intentionally remains open for the next prototype system.</span></footer>
      </section>

      {heroSheetOpen ? <HeroSheet hero={hero} playerName={selectedPlayer.name} onClose={() => setHeroSheetOpen(false)} /> : null}
      {saved ? <div className="save-toast" role="status"><GameIcon name="save" size={18} /> Campaign saved</div> : null}
      <div className="portrait-hint" role="status"><GameIcon name="layers" size={18} /> Rotate to landscape for the full game board.</div>
    </main>
  );
}
