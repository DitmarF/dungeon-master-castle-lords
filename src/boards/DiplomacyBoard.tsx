import { ScaffoldBoard } from "./ScaffoldBoard";

export function DiplomacyBoard() {
  return (
    <ScaffoldBoard
      boardId="diplomacy"
      title="Diplomacy"
      icon="message"
      futureEpic="later strategic-interaction Epics"
    >
      Campaign relationships and diplomatic interactions belong to later
      strategic-system work.
    </ScaffoldBoard>
  );
}
