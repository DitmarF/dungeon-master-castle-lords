"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  useGame,
  type PersistenceActionResult,
} from "../game/GameProvider";
import { BoardNavigation } from "./BoardNavigation";
import { Crest } from "./Crest";
import { GameIcon, type IconName } from "./GameIcon";
import { ResourceIndicator, Stat } from "./GamePrimitives";
import { NotificationRegion } from "./NotificationRegion";
import { SettingsSheet } from "./SettingsSheet";

export interface GameShellStat {
  label: string;
  value: string | number;
  icon: IconName;
  kind?: "stat" | "resource";
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
    navigateToBoard,
    persistenceIssue,
  } = useGame();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [saveResult, setSaveResult] =
    useState<PersistenceActionResult | null>(null);

  useEffect(() => {
    if (!saveResult) return;
    const timer = window.setTimeout(() => setSaveResult(null), 2800);
    return () => window.clearTimeout(timer);
  }, [saveResult]);

  if (!activeGame?.foundation || !selectedPlayer) return null;

  function handleSave() {
    setSaveResult(saveGame());
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
            onClick={() => navigateToBoard("hero")}
            aria-label="Open Hero board"
            aria-current={activeGame.activeBoardId === "hero" ? "page" : undefined}
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
          {stats.map((stat) => {
            const Primitive =
              stat.kind === "resource" ? ResourceIndicator : Stat;
            return (
              <Primitive
                key={stat.label}
                label={stat.label}
                value={stat.value}
                icon={<GameIcon name={stat.icon} size={15} />}
              />
            );
          })}
        </div>
      </section>

      <div
        className="game-view__content game-view__viewport"
        role="region"
        aria-label={`${title} board`}
      >
        {children}
      </div>

      <BoardNavigation
        game={activeGame}
        onSelect={navigateToBoard}
      />

      <div className="game-shell__overlay-layer">
        {settingsOpen ? (
          <SettingsSheet onClose={() => setSettingsOpen(false)} />
        ) : null}
      </div>

      <NotificationRegion
        kind={saveResult?.ok === false || persistenceIssue ? "error" : "success"}
      >
        {saveResult ? (
          <>
            <GameIcon name="save" size={18} />{
              saveResult.ok
                ? "Campaign saved"
                : saveResult.error?.message ?? "Campaign was not saved"
            }
          </>
        ) : persistenceIssue ? (
          <>
            <GameIcon name="save" size={18} /> {persistenceIssue.message}
          </>
        ) : null}
      </NotificationRegion>
    </main>
  );
}
