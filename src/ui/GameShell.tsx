"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useGame } from "../game/GameProvider";
import type { BoardId } from "../game/model";
import { BoardNavigation } from "./BoardNavigation";
import { Crest } from "./Crest";
import { GameIcon, type IconName } from "./GameIcon";
import { HeroSheet } from "./HeroSheet";
import { SettingsSheet } from "./SettingsSheet";

export interface GameShellStat {
  label: string;
  value: string | number;
  icon: IconName;
}

interface GameShellProps {
  title: string;
  subtitle: string;
  icon: IconName;
  stats: GameShellStat[];
  className?: string;
  children: ReactNode;
}

export function GameShell({
  title,
  subtitle,
  icon,
  stats,
  className = "",
  children,
}: GameShellProps) {
  const {
    activeGame,
    selectedPlayer,
    returnToPlayers,
    saveGame,
    updateGame,
  } = useGame();
  const [heroSheetOpen, setHeroSheetOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!saved) return;
    const timer = window.setTimeout(() => setSaved(false), 1600);
    return () => window.clearTimeout(timer);
  }, [saved]);

  if (!activeGame?.hero || !selectedPlayer) return null;

  function selectBoard(boardId: BoardId) {
    updateGame((game) => ({ ...game, activeBoardId: boardId }));
  }

  function handleSave() {
    saveGame();
    setSaved(true);
  }

  return (
    <main className={`game-view ${className}`.trim()}>
      <header className="game-appbar">
        <button
          type="button"
          className="appbar-button appbar-button--back"
          onClick={returnToPlayers}
          aria-label="Return to players"
        >
          <GameIcon name="back" size={20} />
          <span>Players</span>
        </button>

        <div className="game-appbar__title">
          <span className="game-appbar__mark">
            <GameIcon name={icon} size={19} />
          </span>
          <span>
            <strong>{title}</strong>
            <small>{subtitle}</small>
          </span>
        </div>

        <div className="game-appbar__actions">
          <button
            type="button"
            className="appbar-button"
            onClick={() => setHeroSheetOpen(true)}
            aria-label="Open hero information"
          >
            <GameIcon name="user" size={20} />
            <span>Hero</span>
          </button>
          <button
            type="button"
            className="appbar-button"
            onClick={handleSave}
            aria-label="Save campaign"
          >
            <GameIcon name="save" size={20} />
            <span>Save</span>
          </button>
          <button
            type="button"
            className="appbar-button"
            onClick={() => setSettingsOpen(true)}
            aria-label="Open game settings"
          >
            <GameIcon name="settings" size={20} />
            <span>Settings</span>
          </button>
        </div>
      </header>

      <section className="campaign-strip" aria-label="Campaign status">
        <div className="campaign-player">
          <Crest color={selectedPlayer.bannerColor} size="sm" />
          <span>
            <small>Ruler</small>
            <strong>{selectedPlayer.name}</strong>
          </span>
        </div>
        <div className="campaign-stats">
          {stats.map((stat) => (
            <span key={stat.label}>
              <GameIcon name={stat.icon} size={15} />
              <small>{stat.label}</small>
              <strong>{stat.value}</strong>
            </span>
          ))}
        </div>
      </section>

      <div className="game-view__content">{children}</div>

      <BoardNavigation
        activeBoardId={activeGame.activeBoardId}
        settlementClaimed={activeGame.dungeon.settlementClaimed}
        onSelect={selectBoard}
      />

      {heroSheetOpen ? (
        <HeroSheet
          hero={activeGame.hero}
          playerName={selectedPlayer.name}
          onClose={() => setHeroSheetOpen(false)}
        />
      ) : null}

      {settingsOpen ? (
        <SettingsSheet onClose={() => setSettingsOpen(false)} />
      ) : null}

      {saved ? (
        <div className="save-toast" role="status">
          <GameIcon name="save" size={18} /> Campaign saved
        </div>
      ) : null}
    </main>
  );
}
