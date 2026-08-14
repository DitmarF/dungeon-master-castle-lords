import type { CSSProperties } from "react";
import type { CampaignStateV5 } from "../game/model";
import {
  BOARD_DESCRIPTORS,
  getBoardAvailability,
  type RegisteredBoardId,
} from "../game/navigation";
import { GameIcon } from "./GameIcon";

interface BoardNavigationProps {
  game: CampaignStateV5;
  onSelect: (boardId: RegisteredBoardId) => void;
}

export function BoardNavigation({ game, onSelect }: BoardNavigationProps) {
  return (
    <nav
      className="board-nav"
      aria-label="Game boards"
      style={{ "--board-count": BOARD_DESCRIPTORS.length } as CSSProperties}
    >
      {BOARD_DESCRIPTORS.map((board) => {
        const availability = getBoardAvailability(board.id, game);
        const unavailableReason =
          board.id === "dungeon"
            ? "select its World location first"
            : board.id === "combat"
              ? "requires a legal encounter"
              : board.id === "diplomacy"
                ? "requires a legal relationship context"
                : "unavailable";
        const stateLabel = !availability.enabled
          ? `${board.label} — ${unavailableReason}`
          : !availability.unlocked
            ? `${board.label} — ${unavailableReason}`
            : board.label;
        return (
          <button
            type="button"
            key={board.id}
            className={
              availability.active
                ? "board-nav__item board-nav__item--active"
                : "board-nav__item"
            }
            disabled={!availability.available}
            onClick={() => availability.available && onSelect(board.id)}
            aria-label={stateLabel}
            aria-current={availability.active ? "page" : undefined}
            data-board-enabled={availability.enabled}
            data-board-unlocked={availability.unlocked}
            title={stateLabel}
          >
            <GameIcon name={board.icon} size={21} />
            <span>{board.shortLabel}</span>
            {!availability.available ? (
              <i><GameIcon name="lock" size={10} /></i>
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}
