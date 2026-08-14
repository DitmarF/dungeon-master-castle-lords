"use client";

import { useEffect, useState } from "react";
import { SetupBoard } from "../boards/SetupBoard";
import { StartBoard } from "../boards/StartBoard";
import { getBoardModule } from "../boards/registry";
import { GameIcon } from "../ui/GameIcon";
import { ModalOverlay } from "../ui/ModalOverlay";
import { useGame } from "./GameProvider";
import type { PersistenceFailure } from "./persistence";
import { resolveActiveBoard } from "./navigation";

export function GameApp() {
  const {
    activeGame,
    hydrated,
    hydrationFailure,
    persistenceIssue,
    navigateToBoard,
    replaceIncompatibleLegacy,
    retryPersistence,
    returnToPlayers,
    view,
  } = useGame();
  const [replacementOpen, setReplacementOpen] = useState(false);
  const boardResolution = activeGame?.foundation
    ? resolveActiveBoard(activeGame)
    : null;
  const fallbackBoardId = boardResolution?.usedFallback
    ? boardResolution.descriptor.id
    : null;

  useEffect(() => {
    if (fallbackBoardId) navigateToBoard(fallbackBoardId);
  }, [fallbackBoardId, navigateToBoard]);

  if (hydrationFailure) {
    const incompatible =
      hydrationFailure.code === "incompatible-legacy-campaign";
    const presentation = describeHydrationFailure(hydrationFailure);
    return (
      <main className="recovery-view">
        <section className="recovery-card" role="alert" aria-labelledby="recovery-title">
          <span className="recovery-card__mark">
            <GameIcon name={incompatible ? "grid" : "save"} size={30} />
          </span>
          <span className="section-kicker">{presentation.kicker}</span>
          <h1 id="recovery-title">{presentation.title}</h1>
          <p>{hydrationFailure.message}</p>
          <p className="recovery-card__detail">{presentation.detail}</p>
          <div className="recovery-card__actions">
            <button
              type="button"
              className="button button--secondary"
              onClick={retryPersistence}
            >
              Retry opening saves
            </button>
            {incompatible ? (
              <button
                type="button"
                className="button button--primary"
                onClick={() => setReplacementOpen(true)}
              >
                Start a Castle campaign
              </button>
            ) : null}
          </div>
        </section>

        {replacementOpen ? (
          <ModalOverlay
            panelClassName="confirm-dialog"
            labelledBy="legacy-replacement-title"
            onClose={() => setReplacementOpen(false)}
          >
            <span className="dialog-icon">
              <GameIcon name="castle" size={23} />
            </span>
            <h2 id="legacy-replacement-title">Use the Castle-only campaign path?</h2>
            <p>
              Incompatible Dungeon campaigns will be removed from the preferred
              registry after a verified write. Player profiles and compatible
              campaigns stay available, and the original legacy payload remains
              untouched as recovery evidence.
            </p>
            {persistenceIssue &&
            persistenceIssue.code !== "incompatible-legacy-campaign" ? (
              <p className="dialog-error" role="alert">
                {persistenceIssue.message}
              </p>
            ) : null}
            <div className="dialog-actions">
              <button
                type="button"
                className="button button--ghost"
                onClick={() => setReplacementOpen(false)}
              >
                Keep legacy campaign
              </button>
              <button
                type="button"
                className="button button--primary"
                onClick={() => {
                  const result = replaceIncompatibleLegacy();
                  if (result.ok) setReplacementOpen(false);
                }}
              >
                Confirm fresh start
              </button>
            </div>
          </ModalOverlay>
        ) : null}
      </main>
    );
  }

  if (!hydrated) {
    return (
      <main className="loading-screen" aria-label="Loading player registry">
        <span className="loading-mark"><GameIcon name="castle" size={30} /></span>
        <p>Opening the registry…</p>
      </main>
    );
  }

  if (view !== "game") return <StartBoard />;
  if (!activeGame?.foundation) return <SetupBoard />;
  if (!boardResolution) {
    return (
      <main className="loading-screen" role="alert">
        <span className="loading-mark">
          <GameIcon name="castle" size={30} />
        </span>
        <p>No available game board could be opened.</p>
        <button
          type="button"
          className="button button--secondary"
          onClick={returnToPlayers}
        >
          <GameIcon name="back" size={17} /> Return to players
        </button>
      </main>
    );
  }
  if (boardResolution.usedFallback) {
    return (
      <main className="loading-screen" aria-label="Opening available board">
        <span className="loading-mark">
          <GameIcon name="grid" size={30} />
        </span>
        <p>Opening an available board…</p>
      </main>
    );
  }

  const boardModule = getBoardModule(boardResolution.descriptor.id);
  if (!boardModule) return null;

  const ActiveBoard = boardModule.component;
  return <ActiveBoard />;
}

function describeHydrationFailure(failure: PersistenceFailure): {
  kicker: string;
  title: string;
  detail: string;
} {
  switch (failure.code) {
    case "incompatible-legacy-campaign":
      return {
        kicker: "Legacy campaign",
        title: "This Dungeon campaign cannot become Castle.",
        detail:
          "Nothing was converted or overwritten. You may retry or explicitly begin the Castle-only path.",
      };
    case "parse-failed":
    case "registry-validation-failed":
    case "campaign-validation-failed":
      return {
        kicker: "Corrupt local data",
        title: "The saved data is not safe to open.",
        detail:
          "The unreadable payload was left in place. The app will not replace it with an empty campaign.",
      };
    case "migration-failed":
      return {
        kicker: "Migration stopped",
        title: "The campaign could not be upgraded safely.",
        detail:
          "The original payload remains unchanged and no replacement registry was created.",
      };
    case "quota-exceeded":
    case "write-failed":
    case "serialization-failed":
    case "verification-failed":
      return {
        kicker: "Save transition failed",
        title: "The upgraded campaign is not durable yet.",
        detail:
          "The source save remains available. Free browser storage or retry the verified write.",
      };
    default:
      return {
        kicker: "Local storage unavailable",
        title: "The campaign registry could not be opened.",
        detail:
          "Your stored data was not changed. Restore browser storage access, then retry.",
      };
  }
}
