"use client";

import type { CampaignHeroStateV5, SkillId } from "../game/model";
import { SKILL_BY_ID } from "../game/skillTrees";
import { GameIcon } from "./GameIcon";
import { ModalOverlay } from "./ModalOverlay";

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
interface HeroSheetProps {
  hero: CampaignHeroStateV5;
  playerName: string;
  onClose: () => void;
}

export function HeroSheet({ hero, playerName, onClose }: HeroSheetProps) {
  return (
    <ModalOverlay
      backdropClassName="hero-sheet-backdrop"
      panelClassName="hero-sheet"
      labelledBy="hero-sheet-title"
      onClose={onClose}
    >
        <header className="hero-sheet__header">
          <span className="hero-sheet__mark"><GameIcon name="user" size={25} /></span>
          <div><span className="section-kicker">Current hero</span><h2 id="hero-sheet-title">{playerName}</h2></div>
          <button type="button" className="hero-sheet__close" onClick={onClose} aria-label="Close hero sheet">×</button>
        </header>

        <div className="hero-identity-grid">
          <div><small>Faction</small><strong>Castle faction</strong></div>
          <div><small>Class</small><strong>{CLASS_NAMES[hero.heroClass]}</strong></div>
          <div><small>Vocation</small><strong>{VOCATION_NAMES[hero.vocation]}</strong></div>
          <div><small>Region</small><strong>{hero.strategicRegionId}</strong></div>
        </div>

        <section className="hero-sheet__section">
          <div className="hero-sheet__section-title"><h3>Attributes</h3><span>Base 0 + path + free points</span></div>
          <div className="hero-attributes">
            {(Object.entries(ATTRIBUTE_NAMES) as [keyof typeof ATTRIBUTE_NAMES, string][]).map(([key, name]) => (
              <div key={key}><span>{key}</span><strong>{hero.attributesCompatibility.values[key]}</strong><small>{name}</small></div>
            ))}
          </div>
        </section>

        <section className="hero-sheet__section">
          <div className="hero-sheet__section-title"><h3>Known skills</h3><span>Class and vocation trees</span></div>
          <div className="hero-skills">
            {(Object.entries(hero.skillRanks) as [SkillId, number][]).filter(([, rank]) => rank > 0).map(([skill, rank]) => (
              <div key={skill}><span><GameIcon name="spark" size={16} />{SKILL_BY_ID[skill].name}</span><strong>Rank {rank}</strong></div>
            ))}
          </div>
        </section>

        <footer className="hero-sheet__footer">
          <span><GameIcon name="world" size={15} /> {hero.explorationContext ? `Exploring ${hero.explorationContext.locationId}` : "At the capital Village"}</span>
          <button type="button" className="button button--primary" onClick={onClose}>Return to map</button>
        </footer>
    </ModalOverlay>
  );
}
