"use client";

import type { ReactNode } from "react";
import { useGame } from "../game/GameProvider";
import type { BoardId } from "../game/model";
import { GameIcon, type IconName } from "../ui/GameIcon";
import { InfoSheet, Panel } from "../ui/GamePrimitives";
import { GameShell } from "../ui/GameShell";

interface ScaffoldBoardProps {
  boardId: Exclude<BoardId, "setup">;
  title: string;
  icon: IconName;
  futureEpic: string;
  children: ReactNode;
}

function displayLabel(value: string): string {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

export function ScaffoldBoard({
  boardId,
  title,
  icon,
  futureEpic,
  children,
}: ScaffoldBoardProps) {
  const { activeGame } = useGame();
  if (!activeGame?.hero) return null;

  const { hero } = activeGame;

  return (
    <GameShell
      className="scaffold-view"
      title={title}
      subtitle="Board foundation · No gameplay yet"
      icon={icon}
      stats={[
        { label: "Faction", value: displayLabel(hero.faction), icon: "flag" },
        { label: "Class", value: displayLabel(hero.heroClass), icon: "shield" },
        {
          label: "Vocation",
          value: displayLabel(hero.vocation),
          icon: "spark",
        },
      ]}
    >
      <section
        className="scaffold-board"
        aria-labelledby={`${boardId}-board-title`}
      >
        <Panel variant="raised" className="scaffold-board__card">
          <span className="scaffold-board__mark">
            <GameIcon name={icon} size={34} />
          </span>
          <span className="section-kicker">EPIC 01 board foundation</span>
          <h1 id={`${boardId}-board-title`}>{title}</h1>
          <p>{children}</p>
          <div className="scaffold-board__meta">
            <span className="scaffold-board__future">Planned for {futureEpic}</span>
            <InfoSheet
              label={`About the ${title} board foundation`}
              title={`${title} board foundation`}
              summary={`Gameplay is planned for ${futureEpic}.`}
            >
              <p>{children}</p>
              <p>Gameplay for this board belongs to {futureEpic}.</p>
            </InfoSheet>
          </div>
        </Panel>
      </section>
    </GameShell>
  );
}
