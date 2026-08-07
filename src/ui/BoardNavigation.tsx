import { BOARD_REGISTRY } from "../boards/registry";
import type { BoardId } from "../game/model";
import { GameIcon } from "./GameIcon";

interface BoardNavigationProps {
  activeBoardId: BoardId;
  settlementClaimed: boolean;
  onSelect: (boardId: BoardId) => void;
}

export function BoardNavigation({
  activeBoardId,
  settlementClaimed,
  onSelect,
}: BoardNavigationProps) {
  return (
    <nav className="board-nav" aria-label="Game boards">
      {BOARD_REGISTRY.map((board) => {
        const enabled = board.enabled && (board.id !== "settlement" || settlementClaimed);
        return (
          <button
            type="button"
            key={board.id}
            className={board.id === activeBoardId ? "board-nav__item board-nav__item--active" : "board-nav__item"}
            disabled={!enabled}
            onClick={() => enabled && onSelect(board.id)}
            aria-label={enabled ? board.label : `${board.label} — locked`}
            aria-current={board.id === activeBoardId ? "page" : undefined}
            title={enabled ? board.label : `${board.label} — locked`}
          >
            <GameIcon name={board.icon} size={21} />
            <span>{board.shortLabel}</span>
            {!enabled ? <i><GameIcon name="lock" size={10} /></i> : null}
          </button>
        );
      })}
    </nav>
  );
}
