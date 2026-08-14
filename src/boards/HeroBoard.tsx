"use client";

import { useGame } from "../game/GameProvider";
import type { SkillId } from "../game/model";
import { SKILL_BY_ID } from "../game/skillTrees";
import { GameIcon } from "../ui/GameIcon";
import { Panel } from "../ui/GamePrimitives";
import { GameShell } from "../ui/GameShell";

const CLASS_NAMES = { fighter: "Fighter", ranger: "Ranger", mage: "Mage" } as const;
const VOCATION_NAMES = { general: "General", spy: "Spy", diplomat: "Diplomat" } as const;
const ATTRIBUTE_NAMES = {
  str: "Strength",
  agy: "Agility",
  per: "Perception",
  int: "Intellect",
  cha: "Charisma",
  lead: "Leadership",
} as const;

export function HeroBoard() {
  const { activeGame, selectedPlayer } = useGame();
  const foundation = activeGame?.foundation;
  if (!foundation || !selectedPlayer) return null;
  const { hero } = foundation;
  const skills = (Object.entries(hero.skillRanks) as [SkillId, number][])
    .filter(([, rank]) => rank > 0);

  return (
    <GameShell
      className="hero-board-view"
      title="Hero"
      subtitle="Castle founder · Current compatibility foundation"
      icon="user"
      stats={[
        { label: "Faction", value: "Castle", icon: "castle" },
        { label: "Class", value: CLASS_NAMES[hero.heroClass], icon: "shield" },
        { label: "Vocation", value: VOCATION_NAMES[hero.vocation], icon: "spark" },
      ]}
    >
      <section className="hero-board" aria-labelledby="hero-board-title">
        <header className="board-summary">
          <div>
            <span className="section-kicker">Founding hero</span>
            <h1 id="hero-board-title">{selectedPlayer.name}</h1>
          </div>
          <span className="status-chip">
            <span className="status-dot" /> Castle
          </span>
        </header>

        <div className="hero-board__grid">
          <Panel variant="raised" className="hero-board__panel">
            <span className="hero-board__panel-icon"><GameIcon name="world" size={24} /></span>
            <small>Strategic region</small>
            <h2>{hero.strategicRegionId}</h2>
            <p>
              This is the Hero&apos;s World-region anchor. It is separate from any
              square-grid Dungeon cell.
            </p>
          </Panel>

          <Panel variant="raised" className="hero-board__panel">
            <span className="hero-board__panel-icon"><GameIcon name="grid" size={24} /></span>
            <small>Exploration context</small>
            <h2>
              {hero.explorationContext ? "Regional Dungeon" : "Not exploring"}
            </h2>
            <p>
              {hero.explorationContext
                ? `${hero.explorationContext.locationId} · cell ${hero.explorationContext.cell.x}, ${hero.explorationContext.cell.y}`
                : "Select the regional Dungeon on the World board to establish a legal exploration context."}
            </p>
          </Panel>

          <Panel
            variant="raised"
            className="hero-board__panel hero-board__panel--attributes"
          >
            <span className="hero-board__panel-icon">
              <GameIcon name="shield" size={24} />
            </span>
            <small>Current attributes</small>
            <h2>{hero.attributesCompatibility.ruleVersion} snapshot</h2>
            <div className="hero-board__attributes">
              {(Object.entries(ATTRIBUTE_NAMES) as [
                keyof typeof ATTRIBUTE_NAMES,
                string,
              ][]).map(([attributeId, name]) => (
                <div key={attributeId}>
                  <span>{attributeId}</span>
                  <strong>
                    {hero.attributesCompatibility.values[attributeId]}
                  </strong>
                  <small>{name}</small>
                </div>
              ))}
            </div>
          </Panel>

          <Panel variant="raised" className="hero-board__panel hero-board__panel--skills">
            <span className="hero-board__panel-icon"><GameIcon name="spark" size={24} /></span>
            <small>Known starting skills</small>
            <h2>{skills.length} learned grants</h2>
            <ul>
              {skills.map(([skillId, rank]) => (
                <li key={skillId}>
                  <span>{SKILL_BY_ID[skillId].name}</span>
                  <strong>Rank {rank}</strong>
                </li>
              ))}
            </ul>
            <p className="hero-board__boundary">
              Level progression and new advancement rules belong to EPIC 06.
            </p>
          </Panel>
        </div>
      </section>
    </GameShell>
  );
}
