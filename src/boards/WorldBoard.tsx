import { ScaffoldBoard } from "./ScaffoldBoard";

export function WorldBoard() {
  return (
    <ScaffoldBoard
      boardId="world"
      title="World"
      icon="world"
      futureEpic="EPIC 08 — Minimal world map"
    >
      The world map, strategic travel, conquest, and supply context belong to
      later World and campaign-system Epics.
    </ScaffoldBoard>
  );
}
