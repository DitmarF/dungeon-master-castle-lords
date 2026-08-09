import { ScaffoldBoard } from "./ScaffoldBoard";

export function CombatBoard() {
  return (
    <ScaffoldBoard
      boardId="combat"
      title="Combat"
      icon="swords"
      futureEpic="EPIC 11 — Tactical combat skeleton"
    >
      Hex-grid squad encounters and tactical combat rules belong to the later
      Combat Epic.
    </ScaffoldBoard>
  );
}
