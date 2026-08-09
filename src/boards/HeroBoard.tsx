import { ScaffoldBoard } from "./ScaffoldBoard";

export function HeroBoard() {
  return (
    <ScaffoldBoard
      boardId="hero"
      title="Hero"
      icon="user"
      futureEpic="EPIC 04 — Hero foundation"
    >
      Full character management belongs to later Hero and progression Epics.
      The Hero control in the shared shell remains the quick information view.
    </ScaffoldBoard>
  );
}
