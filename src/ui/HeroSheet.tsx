"use client";

import { useEffect } from "react";
import type { HeroState, SkillId } from "../game/model";
import { SKILL_BY_ID } from "../game/skillTrees";
import { GameIcon } from "./GameIcon";

const CLASS_NAMES = { fighter: "Fighter", ranger: "Ranger", mage: "Mage" } as const;
const VOCATION_NAMES = { general: "General", spy: "Spy", diplomat: "Diplomat" } as const;
const FACTION_NAMES = { dungeon: "Dungeon faction", castle: "Castle faction" } as const;
const ATTRIBUTE_NAMES = {
  str: "Strength",
  agy: "Agility",
  per: "Perception",
  int: "Intellect",
  cha: "Charisma",
  lead: "Leadership",
} as const;
interface HeroSheetProps {
  hero: HeroState;
  playerName: string;
  onClose: () => void;
}

export function HeroSheet({ hero, playerName, onClose }: HeroSheetProps) {
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop hero-sheet-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="hero-sheet" role="dialog" aria-modal="true" aria-labelledby="hero-sheet-title" onMouseDown={(event) => event.stopPropagation()}>
        <header className="hero-sheet__header">
          <span className="hero-sheet__mark"><GameIcon name="user" size={25} /></span>
          <div><span className="section-kicker">Current hero</span><h2 id="hero-sheet-title">{playerName}</h2></div>
          <button type="button" className="hero-sheet__close" onClick={onClose} aria-label="Close hero sheet">×</button>
        </header>

        <div className="hero-identity-grid">
          <div><small>Faction</small><strong>{FACTION_NAMES[hero.faction]}</strong></div>
          <div><small>Class</small><strong>{CLASS_NAMES[hero.heroClass]}</strong></div>
          <div><small>Vocation</small><strong>{VOCATION_NAMES[hero.vocation]}</strong></div>
          <div><small>Vision</small><strong>{hero.visionRadius} cell</strong></div>
        </div>

        <section className="hero-sheet__section">
          <div className="hero-sheet__section-title"><h3>Attributes</h3><span>Base 0 + path + free points</span></div>
          <div className="hero-attributes">
            {(Object.entries(ATTRIBUTE_NAMES) as [keyof typeof ATTRIBUTE_NAMES, string][]).map(([key, name]) => (
              <div key={key}><span>{key}</span><strong>{hero.attributes[key]}</strong><small>{name}</small></div>
            ))}
          </div>
        </section>

        <section className="hero-sheet__section">
          <div className="hero-sheet__section-title"><h3>Known skills</h3><span>Class and vocation trees</span></div>
          <div className="hero-skills">
            {(Object.entries(hero.skills) as [SkillId, number][]).filter(([, rank]) => rank > 0).map(([skill, rank]) => (
              <div key={skill}><span><GameIcon name="spark" size={16} />{SKILL_BY_ID[skill].name}</span><strong>Rank {rank}</strong></div>
            ))}
          </div>
        </section>

        <footer className="hero-sheet__footer">
          <span><GameIcon name="eye" size={15} /> Position {hero.position.x + 1}:{hero.position.y + 1}</span>
          <button type="button" className="button button--primary" onClick={onClose}>Return to map</button>
        </footer>
      </section>
    </div>
  );
}
