"use client";

import { useMemo, useState } from "react";
import {
  CLASS_SKILL,
  VOCATION_SKILL,
  completeGameSetup,
} from "../game/createGame";
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

const FACTIONS: {
  id: FactionType;
  name: string;
  copy: string;
  icon: IconName;
}[] = [
  {
    id: "dungeon",
    name: "Dungeon",
    copy: "Monsters · dark dominion",
    icon: "layers",
  },
  {
    id: "castle",
    name: "Castle",
    copy: "Humanoids · light realm",
    icon: "castle",
  },
];

const CLASSES: {
  id: HeroClass;
  name: string;
  bonus: string;
  skill: string;
  icon: IconName;
}[] = [
  {
    id: "fighter",
    name: "Fighter",
    bonus: "+1 Strength",
    skill: "Close Combat",
    icon: "shield",
  },
  {
    id: "ranger",
    name: "Ranger",
    bonus: "+1 Perception",
    skill: "Ranged Combat",
    icon: "target",
  },
  {
    id: "mage",
    name: "Mage",
    bonus: "+1 Intellect",
    skill: "Mage Combat",
    icon: "spark",
  },
];

const VOCATIONS: {
  id: HeroVocation;
  name: string;
  bonus: string;
  skill: string;
  icon: IconName;
}[] = [
  {
    id: "general",
    name: "General",
    bonus: "+1 Leadership",
    skill: "Tactics",
    icon: "flag",
  },
  {
    id: "spy",
    name: "Spy",
    bonus: "+1 Agility",
    skill: "Deception",
    icon: "eye",
  },
  {
    id: "diplomat",
    name: "Diplomat",
    bonus: "+1 Charisma",
    skill: "Diplomacy",
    icon: "message",
  },
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
  { id: "close-combat", name: "Close Combat", branch: "Fighter" },
  { id: "ranged-combat", name: "Ranged Combat", branch: "Ranger" },
  { id: "mage-combat", name: "Mage Combat", branch: "Mage" },
  { id: "tactics", name: "Tactics", branch: "General" },
  { id: "deception", name: "Deception", branch: "Spy" },
  { id: "diplomacy", name: "Diplomacy", branch: "Diplomat" },
];

function automaticBonus(
  heroClass: HeroClass | null,
  vocation: HeroVocation | null,
): HeroAttributes {
  const bonus = { ...EMPTY_ATTRIBUTES };
  if (heroClass === "fighter") bonus.str += 1;
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
  const [freeAttributes, setFreeAttributes] = useState<HeroAttributes>({
    ...EMPTY_ATTRIBUTES,
  });
  const [bonusSkill, setBonusSkill] = useState<SkillId | null>(null);

  const spentPoints = Object.values(freeAttributes).reduce(
    (total, value) => total + value,
    0,
  );
  const remainingPoints = 2 - spentPoints;
  const bonus = useMemo(
    () => automaticBonus(heroClass, vocation),
    [heroClass, vocation],
  );
  const completedChoices = [faction, heroClass, vocation, bonusSkill].filter(
    Boolean,
  ).length;
  const ready = Boolean(
    faction && heroClass && vocation && bonusSkill && remainingPoints === 0,
  );

  if (!activeGame || !selectedPlayer) return null;

  function changeAttribute(attribute: AttributeKey, delta: number) {
    setFreeAttributes((current) => {
      const nextValue = current[attribute] + delta;
      if (nextValue < 0 || (delta > 0 && remainingPoints <= 0)) return current;
      return { ...current, [attribute]: nextValue };
    });
  }

  function beginCampaign() {
    if (
      !faction ||
      !heroClass ||
      !vocation ||
      !bonusSkill ||
      remainingPoints !== 0
    ) {
      return;
    }
    updateGame((game) =>
      completeGameSetup(game, {
        faction,
        heroClass,
        vocation,
        freeAttributes,
        bonusSkill,
      }),
    );
  }

  const initialSkills = new Set<SkillId>();
  if (heroClass) initialSkills.add(CLASS_SKILL[heroClass]);
  if (vocation) initialSkills.add(VOCATION_SKILL[vocation]);

  return (
    <main className="setup-view">
      <header className="setup-appbar">
        <button
          type="button"
          className="appbar-button appbar-button--back"
          onClick={returnToPlayers}
        >
          <GameIcon name="back" size={20} />
          <span>Players</span>
        </button>
        <div className="setup-appbar__title">
          <strong>Hero setup</strong>
          <small>New campaign</small>
        </div>
        <div className="setup-player">
          <Crest color={selectedPlayer.bannerColor} size="sm" />
          <span>{selectedPlayer.name}</span>
        </div>
      </header>

      <div className="setup-scroll">
        <header className="setup-intro">
          <div>
            <span className="section-kicker">Campaign foundation</span>
            <h1>Build your founding hero.</h1>
            <p>Choose a faction, two paths, two attributes, and one skill.</p>
          </div>
          <span className={`readiness-chip${ready ? " readiness-chip--ready" : ""}`}>
            <span className="status-dot" />
            {ready ? "Ready" : `${completedChoices}/4 choices`}
          </span>
        </header>

        <div className="setup-sections">
          <section className="setup-card setup-card--faction">
            <header className="setup-card__heading">
              <span>01</span>
              <div>
                <h2>Base faction</h2>
                <p>Defines your first settlement.</p>
              </div>
            </header>
            <div className="faction-options">
              {FACTIONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`choice-card choice-card--faction${
                    faction === item.id ? " choice-card--selected" : ""
                  }`}
                  onClick={() => setFaction(item.id)}
                  aria-pressed={faction === item.id}
                >
                  <span className="choice-card__icon">
                    <GameIcon name={item.icon} size={23} />
                  </span>
                  <span>
                    <strong>{item.name}</strong>
                    <small>{item.copy}</small>
                  </span>
                  <i>{faction === item.id ? "Selected" : "Choose"}</i>
                </button>
              ))}
            </div>
          </section>

          <section className="setup-card setup-card--paths">
            <header className="setup-card__heading">
              <span>02</span>
              <div>
                <h2>Hero paths</h2>
                <p>Each path grants an attribute and a skill.</p>
              </div>
            </header>

            <div className="path-group">
              <h3>Class</h3>
              <div className="path-options">
                {CLASSES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`choice-card choice-card--path${
                      heroClass === item.id ? " choice-card--selected" : ""
                    }`}
                    onClick={() => setHeroClass(item.id)}
                    aria-pressed={heroClass === item.id}
                  >
                    <GameIcon name={item.icon} size={20} />
                    <strong>{item.name}</strong>
                    <small>{item.bonus}</small>
                    <em>{item.skill}</em>
                  </button>
                ))}
              </div>
            </div>

            <div className="path-group">
              <h3>Vocation</h3>
              <div className="path-options">
                {VOCATIONS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`choice-card choice-card--path${
                      vocation === item.id ? " choice-card--selected" : ""
                    }`}
                    onClick={() => setVocation(item.id)}
                    aria-pressed={vocation === item.id}
                  >
                    <GameIcon name={item.icon} size={20} />
                    <strong>{item.name}</strong>
                    <small>{item.bonus}</small>
                    <em>{item.skill}</em>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="setup-card setup-card--attributes">
            <header className="setup-card__heading">
              <span>03</span>
              <div>
                <h2>Attributes</h2>
                <p>Spend exactly two free points.</p>
              </div>
              <strong className="point-pool">{remainingPoints} left</strong>
            </header>
            <div className="attribute-list">
              {ATTRIBUTES.map((attribute) => (
                <div className="attribute-row" key={attribute.id}>
                  <span className="attribute-row__name">
                    <b>{attribute.id}</b>
                    <small>{attribute.name}</small>
                  </span>
                  <i>
                    {bonus[attribute.id] ? `+${bonus[attribute.id]} path` : "base"}
                  </i>
                  <span className="attribute-stepper">
                    <button
                      type="button"
                      onClick={() => changeAttribute(attribute.id, -1)}
                      disabled={freeAttributes[attribute.id] === 0}
                      aria-label={`Remove one ${attribute.name} point`}
                    >
                      −
                    </button>
                    <strong>{freeAttributes[attribute.id] + bonus[attribute.id]}</strong>
                    <button
                      type="button"
                      onClick={() => changeAttribute(attribute.id, 1)}
                      disabled={remainingPoints === 0}
                      aria-label={`Add one ${attribute.name} point`}
                    >
                      +
                    </button>
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="setup-card setup-card--skill">
            <header className="setup-card__heading">
              <span>04</span>
              <div>
                <h2>Free skill point</h2>
                <p>A granted skill rises to rank 2.</p>
              </div>
            </header>
            <div className="skill-options">
              {SKILLS.map((skill) => {
                const granted = initialSkills.has(skill.id);
                const selected = bonusSkill === skill.id;
                return (
                  <button
                    key={skill.id}
                    type="button"
                    className={`skill-choice${
                      selected ? " skill-choice--selected" : ""
                    }`}
                    onClick={() => setBonusSkill(skill.id)}
                    aria-pressed={selected}
                  >
                    <span>
                      <strong>{skill.name}</strong>
                      <small>{skill.branch} path</small>
                    </span>
                    <i>
                      {granted
                        ? `Granted · rank ${selected ? 2 : 1}`
                        : selected
                          ? "Rank 1"
                          : "Untrained"}
                    </i>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </div>

      <footer className="setup-actionbar">
        <span>
          <strong>{ready ? "Hero ready" : "Complete the setup"}</strong>
          <small>
            {remainingPoints === 0
              ? "Attributes allocated"
              : `${remainingPoints} attribute ${remainingPoints === 1 ? "point" : "points"} left`}
          </small>
        </span>
        <button
          type="button"
          className="button button--primary"
          disabled={!ready}
          onClick={beginCampaign}
        >
          Enter level <GameIcon name="arrow" size={17} />
        </button>
      </footer>
    </main>
  );
}
