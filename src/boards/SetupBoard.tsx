"use client";

import { useMemo, useState } from "react";
import { CLASS_SKILL, VOCATION_SKILL, completeGameSetup } from "../game/createGame";
import { useGame } from "../game/GameProvider";
import {
  EMPTY_ATTRIBUTES,
  type AttributeKey,
  type FactionType,
  type HeroAttributes,
  type HeroClass,
  type HeroVocation,
  type SkillId,
} from "../game/model";
import { Crest } from "../ui/Crest";
import { GameIcon, type IconName } from "../ui/GameIcon";

const FACTIONS: { id: FactionType; name: string; copy: string; icon: IconName }[] = [
  { id: "dungeon", name: "Dungeon", copy: "Monsters · dark dominion", icon: "layers" },
  { id: "castle", name: "Castle", copy: "Humanoids · light realm", icon: "castle" },
];

const CLASSES: { id: HeroClass; name: string; bonus: string; skill: string; icon: IconName }[] = [
  { id: "fighter", name: "Fighter", bonus: "+1 Agility", skill: "Close Combat", icon: "shield" },
  { id: "ranger", name: "Ranger", bonus: "+1 Perception", skill: "Ranged Combat", icon: "target" },
  { id: "mage", name: "Mage", bonus: "+1 Intellect", skill: "Mage Combat", icon: "spark" },
];

const VOCATIONS: { id: HeroVocation; name: string; bonus: string; skill: string; icon: IconName }[] = [
  { id: "general", name: "General", bonus: "+1 Leadership", skill: "Tactics", icon: "flag" },
  { id: "spy", name: "Spy", bonus: "+1 Agility", skill: "Deception", icon: "eye" },
  { id: "diplomat", name: "Diplomat", bonus: "+1 Charisma", skill: "Diplomacy", icon: "message" },
];

const ATTRIBUTES: { id: AttributeKey; name: string }[] = [
  { id: "str", name: "Strength" },
  { id: "agy", name: "Agility" },
  { id: "per", name: "Perception" },
  { id: "int", name: "Intellect" },
  { id: "cha", name: "Charisma" },
  { id: "lead", name: "Leadership" },
];

const SKILLS: { id: SkillId; name: string; branch: string }[] = [
  { id: "close-combat", name: "Close Combat", branch: "Fighter branch" },
  { id: "ranged-combat", name: "Ranged Combat", branch: "Ranger branch" },
  { id: "mage-combat", name: "Mage Combat", branch: "Mage branch" },
  { id: "tactics", name: "Tactics", branch: "General branch" },
  { id: "deception", name: "Deception", branch: "Spy branch" },
  { id: "diplomacy", name: "Diplomacy", branch: "Diplomat branch" },
];

function automaticBonus(heroClass: HeroClass | null, vocation: HeroVocation | null): HeroAttributes {
  const bonus = { ...EMPTY_ATTRIBUTES };
  if (heroClass === "fighter") bonus.agy += 1;
  if (heroClass === "ranger") bonus.per += 1;
  if (heroClass === "mage") bonus.int += 1;
  if (vocation === "general") bonus.lead += 1;
  if (vocation === "spy") bonus.agy += 1;
  if (vocation === "diplomat") bonus.cha += 1;
  return bonus;
}

export function SetupBoard() {
  const { activeGame, selectedPlayer, returnToPlayers, updateGame } = useGame();
  const [faction, setFaction] = useState<FactionType | null>(null);
  const [heroClass, setHeroClass] = useState<HeroClass | null>(null);
  const [vocation, setVocation] = useState<HeroVocation | null>(null);
  const [freeAttributes, setFreeAttributes] = useState<HeroAttributes>({ ...EMPTY_ATTRIBUTES });
  const [bonusSkill, setBonusSkill] = useState<SkillId | null>(null);

  const spentPoints = Object.values(freeAttributes).reduce((total, value) => total + value, 0);
  const remainingPoints = 2 - spentPoints;
  const bonus = useMemo(() => automaticBonus(heroClass, vocation), [heroClass, vocation]);
  const ready = Boolean(faction && heroClass && vocation && bonusSkill && remainingPoints === 0);

  if (!activeGame || !selectedPlayer) return null;

  function changeAttribute(attribute: AttributeKey, delta: number) {
    setFreeAttributes((current) => {
      const nextValue = current[attribute] + delta;
      if (nextValue < 0 || (delta > 0 && remainingPoints <= 0)) return current;
      return { ...current, [attribute]: nextValue };
    });
  }

  function beginCampaign() {
    if (!faction || !heroClass || !vocation || !bonusSkill || remainingPoints !== 0) return;
    updateGame((game) =>
      completeGameSetup(game, { faction, heroClass, vocation, freeAttributes, bonusSkill }),
    );
  }

  const initialSkills = new Set<SkillId>();
  if (heroClass) initialSkills.add(CLASS_SKILL[heroClass]);
  if (vocation) initialSkills.add(VOCATION_SKILL[vocation]);

  return (
    <main className="setup-board">
      <header className="setup-toolbar">
        <button type="button" className="toolbar-back" onClick={returnToPlayers}>
          <GameIcon name="back" size={19} /> <span>Players</span>
        </button>
        <div className="toolbar-title">
          <span className="toolbar-title__mark"><GameIcon name="user" size={19} /></span>
          <div><strong>Main game setup</strong><small>Build your founding hero</small></div>
        </div>
        <div className="setup-player">
          <Crest color={selectedPlayer.bannerColor} size="sm" />
          <span><small>Founding lord</small><strong>{selectedPlayer.name}</strong></span>
        </div>
        <button type="button" className="button button--primary setup-launch" disabled={!ready} onClick={beginCampaign}>
          Enter first level <GameIcon name="arrow" size={18} />
        </button>
      </header>

      <section className="setup-sheet" aria-labelledby="setup-title">
        <div className="setup-sheet__heading">
          <div><span className="section-kicker">Campaign foundation</span><h1 id="setup-title">Choose what rises from the dark.</h1></div>
          <div className={`setup-readiness${ready ? " setup-readiness--ready" : ""}`}>
            <span className="status-dot" /> {ready ? "Ready to begin" : "Complete all choices"}
          </div>
        </div>

        <div className="setup-grid">
          <section className="setup-section setup-section--faction">
            <div className="setup-section__title"><span>01</span><div><h2>Base faction</h2><p>Your first settlement and visual theme.</p></div></div>
            <div className="faction-options">
              {FACTIONS.map((item) => (
                <button key={item.id} type="button" className={`choice-card choice-card--faction${faction === item.id ? " choice-card--selected" : ""}`} onClick={() => setFaction(item.id)} aria-pressed={faction === item.id}>
                  <span className="choice-card__icon"><GameIcon name={item.icon} size={23} /></span>
                  <span><strong>{item.name}</strong><small>{item.copy}</small></span>
                  <i>{faction === item.id ? "Selected" : "Choose"}</i>
                </button>
              ))}
            </div>
          </section>

          <section className="setup-section setup-section--paths">
            <div className="setup-section__title"><span>02</span><div><h2>Hero paths</h2><p>Each path opens a future three-branch skill tree.</p></div></div>
            <span className="choice-label">Class</span>
            <div className="path-options">
              {CLASSES.map((item) => (
                <button key={item.id} type="button" className={`choice-card choice-card--path${heroClass === item.id ? " choice-card--selected" : ""}`} onClick={() => setHeroClass(item.id)} aria-pressed={heroClass === item.id}>
                  <GameIcon name={item.icon} size={20} /><strong>{item.name}</strong><small>{item.bonus}</small><em>{item.skill}</em>
                </button>
              ))}
            </div>
            <span className="choice-label">Vocation</span>
            <div className="path-options">
              {VOCATIONS.map((item) => (
                <button key={item.id} type="button" className={`choice-card choice-card--path${vocation === item.id ? " choice-card--selected" : ""}`} onClick={() => setVocation(item.id)} aria-pressed={vocation === item.id}>
                  <GameIcon name={item.icon} size={20} /><strong>{item.name}</strong><small>{item.bonus}</small><em>{item.skill}</em>
                </button>
              ))}
            </div>
          </section>

          <section className="setup-section setup-section--attributes">
            <div className="setup-section__title"><span>03</span><div><h2>Attributes</h2><p>Base 0 · class and vocation bonuses apply automatically.</p></div></div>
            <div className="point-pool"><strong>{remainingPoints}</strong><span>free points<br />remaining</span></div>
            <div className="attribute-list">
              {ATTRIBUTES.map((attribute) => (
                <div className="attribute-row" key={attribute.id}>
                  <span><b>{attribute.id}</b><small>{attribute.name}</small></span>
                  <i>{bonus[attribute.id] ? `+${bonus[attribute.id]} path` : "base 0"}</i>
                  <button type="button" onClick={() => changeAttribute(attribute.id, -1)} disabled={freeAttributes[attribute.id] === 0} aria-label={`Remove one ${attribute.name} point`}>−</button>
                  <strong>{freeAttributes[attribute.id] + bonus[attribute.id]}</strong>
                  <button type="button" onClick={() => changeAttribute(attribute.id, 1)} disabled={remainingPoints === 0} aria-label={`Add one ${attribute.name} point`}>+</button>
                </div>
              ))}
            </div>
          </section>

          <section className="setup-section setup-section--skill">
            <div className="setup-section__title"><span>04</span><div><h2>Free skill point</h2><p>Choose one focus. A granted skill rises to rank 2.</p></div></div>
            <div className="skill-options">
              {SKILLS.map((skill) => {
                const granted = initialSkills.has(skill.id);
                return (
                  <button key={skill.id} type="button" className={`skill-choice${bonusSkill === skill.id ? " skill-choice--selected" : ""}`} onClick={() => setBonusSkill(skill.id)} aria-pressed={bonusSkill === skill.id}>
                    <span><strong>{skill.name}</strong><small>{skill.branch}</small></span>
                    {granted ? <i>Granted · rank {bonusSkill === skill.id ? 2 : 1}</i> : <i>{bonusSkill === skill.id ? "Rank 1" : "Untrained"}</i>}
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </section>

      <div className="setup-mobile-launch">
        <span>{ready ? "Hero ready" : `${remainingPoints} attribute points left`}</span>
        <button type="button" className="button button--primary" disabled={!ready} onClick={beginCampaign}>Enter level <GameIcon name="arrow" size={17} /></button>
      </div>
      <div className="portrait-hint" role="status"><GameIcon name="layers" size={18} /> Rotate to landscape for the full setup sheet.</div>
    </main>
  );
}
