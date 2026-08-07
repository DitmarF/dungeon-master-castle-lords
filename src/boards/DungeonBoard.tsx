"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { cellKey, discoverAround, isWalkable } from "../game/generateDungeon";
import { useGame } from "../game/GameProvider";
import type { BoardId, CellPosition } from "../game/model";
import { BoardNavigation } from "../ui/BoardNavigation";
import { Crest } from "../ui/Crest";
import { GameIcon } from "../ui/GameIcon";
import { HeroSheet } from "../ui/HeroSheet";

const CELL_SIZE = 48;
const DIRECTIONS = {
  w: { x: 0, y: -1, label: "north" },
  a: { x: -1, y: 0, label: "west" },
  s: { x: 0, y: 1, label: "south" },
  d: { x: 1, y: 0, label: "east" },
} as const;

export function DungeonBoard() {
  const { activeGame, selectedPlayer, saveGame, returnToPlayers, updateGame } = useGame();
  const [saved, setSaved] = useState(false);
  const [heroSheetOpen, setHeroSheetOpen] = useState(false);
  const [heartPromptOpen, setHeartPromptOpen] = useState(false);
  const [moveNote, setMoveNote] = useState("Use WASD or the movement pad to explore.");

  useEffect(() => {
    if (!saved) return;
    const timer = window.setTimeout(() => setSaved(false), 1800);
    return () => window.clearTimeout(timer);
  }, [saved]);

  const moveHero = useCallback((delta: CellPosition, direction: string) => {
    if (!activeGame?.hero) return;
    const next = {
      x: activeGame.hero.position.x + delta.x,
      y: activeGame.hero.position.y + delta.y,
    };

    if (!isWalkable(activeGame.dungeon, next)) {
      setMoveNote(`Stone blocks the way ${direction}.`);
      return;
    }

    const visible = discoverAround(
      next,
      activeGame.dungeon.grid.columns,
      activeGame.dungeon.grid.rows,
      activeGame.hero.visionRadius,
    );
    const discovered = Array.from(new Set([...activeGame.dungeon.discovered, ...visible]));
    const reachedHeart = next.x === activeGame.dungeon.heart.x && next.y === activeGame.dungeon.heart.y;

    updateGame((game) => {
      if (!game.hero) return game;
      return {
        ...game,
        hero: { ...game.hero, position: next },
        dungeon: {
          ...game.dungeon,
          discovered,
          heartReached: game.dungeon.heartReached || reachedHeart,
        },
      };
    });

    setMoveNote(reachedHeart ? "The Dungeon Heart answers your touch." : `Moved ${direction}. New ground revealed.`);
    if (reachedHeart) setHeartPromptOpen(true);
  }, [activeGame, updateGame]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (heroSheetOpen || heartPromptOpen) return;
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, textarea, select, button")) return;

      const aliases: Record<string, keyof typeof DIRECTIONS> = {
        arrowup: "w",
        arrowleft: "a",
        arrowdown: "s",
        arrowright: "d",
      };
      const key = (event.key.toLowerCase() in DIRECTIONS
        ? event.key.toLowerCase()
        : aliases[event.key.toLowerCase()]) as keyof typeof DIRECTIONS | undefined;
      if (!key) return;
      event.preventDefault();
      const direction = DIRECTIONS[key];
      moveHero({ x: direction.x, y: direction.y }, direction.label);
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [heartPromptOpen, heroSheetOpen, moveHero]);

  const discovered = useMemo(
    () => new Set(activeGame?.dungeon.discovered ?? []),
    [activeGame?.dungeon.discovered],
  );

  if (!activeGame?.hero || !selectedPlayer) return null;

  const { dungeon, hero } = activeGame;
  const discoveredFloorCount = dungeon.tiles.reduce(
    (count, row, y) => count + [...row].filter((tile, x) => tile === "." && discovered.has(`${x},${y}`)).length,
    0,
  );
  const floorCount = dungeon.tiles.reduce((count, row) => count + [...row].filter((tile) => tile === ".").length, 0);
  const heartVisible = discovered.has(cellKey(dungeon.heart));
  const locationTitle = hero.faction === "dungeon" ? "Dungeon hollow" : "Abandoned castle hall";
  const locationKicker = hero.faction === "dungeon" ? "Buried hollow" : "Ruined keep";

  function handleSave() {
    saveGame();
    setSaved(true);
  }

  function selectBoard(boardId: BoardId) {
    updateGame((game) => ({ ...game, activeBoardId: boardId }));
  }

  function claimSettlement() {
    updateGame((game) => ({
      ...game,
      activeBoardId: "settlement",
      dungeon: { ...game.dungeon, settlementClaimed: true },
    }));
    setHeartPromptOpen(false);
  }

  return (
    <main className="game-board-shell exploration-shell">
      <header className="game-toolbar">
        <button type="button" className="toolbar-back" onClick={returnToPlayers}><GameIcon name="back" size={19} /><span>Players</span></button>
        <div className="toolbar-title"><span className="toolbar-title__mark"><GameIcon name="grid" size={19} /></span><div><strong>{locationTitle}</strong><small>Campaign · {selectedPlayer.name}</small></div></div>
        <div className="game-stats" aria-label="Campaign status">
          <span><GameIcon name="calendar" size={16} /><small>Day</small><strong>{dungeon.day}</strong></span>
          <span><GameIcon name="eye" size={16} /><small>Found</small><strong>{discoveredFloorCount}/{floorCount}</strong></span>
          <span><GameIcon name="layers" size={16} /><small>Level</small><strong>{dungeon.level}</strong></span>
        </div>
        <button type="button" className="hero-button" onClick={() => setHeroSheetOpen(true)}><GameIcon name="user" size={17} /><span>Hero</span></button>
        <div className="toolbar-player"><Crest color={selectedPlayer.bannerColor} size="sm" /><span>{selectedPlayer.name}</span></div>
        <button type="button" className="save-button" onClick={handleSave}><GameIcon name="save" size={18} /> <span>Save</span></button>
      </header>

      <BoardNavigation activeBoardId={activeGame.activeBoardId} settlementClaimed={dungeon.settlementClaimed} onSelect={selectBoard} />

      <section className="dungeon-workspace" aria-labelledby="dungeon-heading">
        <div className="board-heading">
          <div><span className="section-kicker">{locationKicker} · Level {dungeon.level}</span><h1 id="dungeon-heading">{locationTitle}</h1></div>
          <div className="explore-legend" aria-label="Map legend"><span><i className="legend-swatch legend-swatch--known" />Discovered</span><span><i className="legend-swatch legend-swatch--fog" />Unknown</span></div>
          <div className="grid-readout"><span>{dungeon.grid.columns} × {dungeon.grid.rows}</span><small>Connected layout</small></div>
        </div>

        <div className="dungeon-canvas dungeon-canvas--explore">
          <svg className="dungeon-grid dungeon-grid--explore" viewBox={`0 0 ${dungeon.grid.columns * CELL_SIZE} ${dungeon.grid.rows * CELL_SIZE}`} preserveAspectRatio="xMidYMid meet" role="img" aria-label={`${locationTitle}, ${discoveredFloorCount} of ${floorCount} traversable cells discovered`}>
            <rect width="100%" height="100%" className="explore-ground" />
            {dungeon.tiles.flatMap((row, y) => [...row].map((tile, x) => {
              const known = discovered.has(`${x},${y}`);
              const tileClass = known ? (tile === "." ? "map-cell map-cell--floor" : "map-cell map-cell--wall") : "map-cell map-cell--unknown";
              return <rect key={`${x}-${y}`} x={x * CELL_SIZE} y={y * CELL_SIZE} width={CELL_SIZE} height={CELL_SIZE} className={tileClass} />;
            }))}

            {heartVisible ? (
              <g className="heart-token" transform={`translate(${dungeon.heart.x * CELL_SIZE + CELL_SIZE / 2} ${dungeon.heart.y * CELL_SIZE + CELL_SIZE / 2})`}>
                <circle r="17" className="heart-token__aura" />
                <path d="M0-13 12 0 0 13-12 0Z" className="heart-token__core" />
                <circle r="3.5" className="heart-token__center" />
              </g>
            ) : null}

            <g className="hero-token" transform={`translate(${hero.position.x * CELL_SIZE + CELL_SIZE / 2} ${hero.position.y * CELL_SIZE + CELL_SIZE / 2})`}>
              <circle r="16" className="hero-token__ring" />
              <path d="M0-12 11-4 8 11 0 15-8 11-11-4Z" fill={selectedPlayer.bannerColor} />
              <circle cy="-3" r="3" className="hero-token__head" />
              <path d="M-5 8C-4 2 4 2 5 8" className="hero-token__body" />
            </g>
          </svg>

          <button
            type="button"
            className="map-objective"
            onClick={() => setHeartPromptOpen(true)}
            disabled={!dungeon.heartReached}
            aria-label={dungeon.heartReached ? "Open the Dungeon Heart decision" : "Find the Dungeon Heart"}
          >
            <span><GameIcon name="heart" size={17} /></span>
            <div><small>Main objective</small><strong>{dungeon.heartReached ? "Choose the Heart's fate" : "Find the Dungeon Heart"}</strong></div>
          </button>

          <div className="movement-pad" aria-label="Hero movement controls">
            <button type="button" className="move-key move-key--up" onClick={() => moveHero(DIRECTIONS.w, "north")} aria-label="Move north"><b>W</b><span>↑</span></button>
            <button type="button" className="move-key move-key--left" onClick={() => moveHero(DIRECTIONS.a, "west")} aria-label="Move west"><b>A</b><span>←</span></button>
            <button type="button" className="move-key move-key--down" onClick={() => moveHero(DIRECTIONS.s, "south")} aria-label="Move south"><b>S</b><span>↓</span></button>
            <button type="button" className="move-key move-key--right" onClick={() => moveHero(DIRECTIONS.d, "east")} aria-label="Move east"><b>D</b><span>→</span></button>
          </div>

          <div className="canvas-corner canvas-corner--top" aria-hidden="true" />
          <div className="canvas-corner canvas-corner--bottom" aria-hidden="true" />
        </div>

        <footer className="board-statusbar">
          <span><i className="status-dot" /> Autosave active</span>
          <span>Rooms: {dungeon.rooms.length}</span>
          <span>Vision: {hero.visionRadius} cell</span>
          <span className="board-statusbar__tip">{moveNote}</span>
        </footer>
      </section>

      {heroSheetOpen ? <HeroSheet hero={hero} playerName={selectedPlayer.name} onClose={() => setHeroSheetOpen(false)} /> : null}

      {heartPromptOpen ? (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setHeartPromptOpen(false)}>
          <section className="heart-dialog" role="dialog" aria-modal="true" aria-labelledby="heart-title" onMouseDown={(event) => event.stopPropagation()}>
            <span className="heart-dialog__icon"><GameIcon name="heart" size={28} /></span>
            <span className="section-kicker">Objective discovered</span>
            <h2 id="heart-title">The Dungeon Heart awakens.</h2>
            <p>Its pulse binds this level to you. Claim it to establish your first settlement, or leave it untouched and continue exploring.</p>
            <div className="heart-dialog__facts"><span><small>Level</small><strong>{dungeon.level}</strong></span><span><small>Rooms linked</small><strong>{dungeon.rooms.length}</strong></span><span><small>Path</small><strong>Clear</strong></span></div>
            <div className="dialog-actions">
              <button type="button" className="button button--ghost" onClick={() => setHeartPromptOpen(false)}>Continue exploring</button>
              <button type="button" className="button button--primary" onClick={claimSettlement}>Claim settlement <GameIcon name="arrow" size={17} /></button>
            </div>
          </section>
        </div>
      ) : null}

      {saved ? <div className="save-toast" role="status"><GameIcon name="save" size={18} /> Campaign saved</div> : null}
      <div className="portrait-hint" role="status"><GameIcon name="layers" size={18} /> Rotate to landscape for the full game board.</div>
    </main>
  );
}
