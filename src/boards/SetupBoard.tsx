"use client";

import { useMemo, useState } from "react";
import { useGame } from "../game/GameProvider";
import {
  EMPTY_ATTRIBUTES,
  type AttributeKey,
  type HeroAttributes,
  type HeroClass,
  type HeroVocation,
  type SkillId,
} from "../game/model";
import { skillBelongsToTree } from "../game/skillTrees";
import type { CastleHeroSetupSelection } from "../game/heroSetup";
import {
  selectHeroAttributes,
  selectHeroClassAttributeBonus,
  selectHeroPathBonus,
  selectHeroVocationAttributeBonus,
  type HeroAttributeBonus,
} from "../game/selectors";
import { validateCastleHeroSetupSelection } from "../game/heroSetup";
import { Crest } from "../ui/Crest";
import { GameIcon, type IconName } from "../ui/GameIcon";
import { ActionButton, ProgressBar } from "../ui/GamePrimitives";
import { SettingsSheet } from "../ui/SettingsSheet";
import { SkillTreePicker } from "../ui/SkillTreePicker";

const CLASSES: {
  id: HeroClass;
  name: string;
  skill: string;
  icon: IconName;
}[] = [
  {
    id: "fighter",
    name: "Fighter",
    skill: "Close Combat",
    icon: "shield",
  },
  {
    id: "ranger",
    name: "Ranger",
    skill: "Ranged Combat",
    icon: "target",
  },
  {
    id: "mage",
    name: "Mage",
    skill: "Mage Combat",
    icon: "spark",
  },
];

const VOCATIONS: {
  id: HeroVocation;
  name: string;
  skill: string;
  icon: IconName;
}[] = [
  {
    id: "general",
    name: "General",
    skill: "Tactics",
    icon: "flag",
  },
  {
    id: "spy",
    name: "Spy",
    skill: "Deception",
    icon: "eye",
  },
  {
    id: "diplomat",
    name: "Diplomat",
    skill: "Diplomacy",
    icon: "message",
  },
];

const ATTRIBUTE_NAMES: Record<AttributeKey, string> = {
  str: "Strength",
  agy: "Agility",
  per: "Perception",
  int: "Intellect",
  cha: "Charisma",
  lead: "Leadership",
};

const ATTRIBUTES = (Object.keys(ATTRIBUTE_NAMES) as AttributeKey[]).map(
  (id) => ({ id, name: ATTRIBUTE_NAMES[id] }),
);

function formatAttributeBonus(bonus: HeroAttributeBonus | null): string {
  return bonus
    ? `+${bonus.amount} ${ATTRIBUTE_NAMES[bonus.attribute]}`
    : "";
}

export function SetupBoard() {
  const {
    activeGame,
    completeHeroSetup,
    selectedPlayer,
    returnToPlayers,
  } = useGame();
  const [heroClass, setHeroClass] = useState<HeroClass | null>(null);
  const [vocation, setVocation] = useState<HeroVocation | null>(null);
  const [freeAttributes, setFreeAttributes] = useState<HeroAttributes>({
    ...EMPTY_ATTRIBUTES,
  });
  const [bonusSkill, setBonusSkill] = useState<SkillId | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const spentPoints = Object.values(freeAttributes).reduce(
    (total, value) => total + value,
    0,
  );
  const remainingPoints = 2 - spentPoints;
  const pathBonus = useMemo(
    () => selectHeroPathBonus(heroClass, vocation),
    [heroClass, vocation],
  );
  const previewAttributes = useMemo(
    () => selectHeroAttributes({ freeAttributes, heroClass, vocation }),
    [freeAttributes, heroClass, vocation],
  );
  const completedChoices = [heroClass, vocation, bonusSkill].filter(
    Boolean,
  ).length;
  const selection = useMemo<CastleHeroSetupSelection | null>(
    () =>
      heroClass && vocation && bonusSkill
        ? { heroClass, vocation, freeAttributes, bonusSkill }
        : null,
    [heroClass, vocation, freeAttributes, bonusSkill],
  );
  const ready = selection
    ? validateCastleHeroSetupSelection(selection).ok
    : false;

  if (!activeGame || !selectedPlayer) return null;

  function changeAttribute(attribute: AttributeKey, delta: number) {
    setFreeAttributes((current) => {
      const nextValue = current[attribute] + delta;
      if (nextValue < 0 || (delta > 0 && remainingPoints <= 0)) return current;
      return { ...current, [attribute]: nextValue };
    });
  }

  function chooseClass(nextClass: HeroClass) {
    setHeroClass(nextClass);
    setBonusSkill((current) => {
      if (!current) return current;
      if (skillBelongsToTree(current, nextClass)) return current;
      if (vocation && skillBelongsToTree(current, vocation)) return current;
      return null;
    });
  }

  function chooseVocation(nextVocation: HeroVocation) {
    setVocation(nextVocation);
    setBonusSkill((current) => {
      if (!current) return current;
      if (skillBelongsToTree(current, nextVocation)) return current;
      if (heroClass && skillBelongsToTree(current, heroClass)) return current;
      return null;
    });
  }

  function beginCampaign() {
    if (selection) completeHeroSetup(selection);
  }

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
        <div className="setup-appbar__actions">
          <button
            type="button"
            className="appbar-button"
            onClick={() => setSettingsOpen(true)}
            aria-label="Open game settings"
          >
            <GameIcon name="settings" size={20} />
            <span>Settings</span>
          </button>
          <div className="setup-player">
            <Crest color={selectedPlayer.bannerColor} size="sm" />
            <span>{selectedPlayer.name}</span>
          </div>
        </div>
      </header>

      <div className="setup-scroll">
        <header className="setup-intro">
          <div>
            <span className="section-kicker">Campaign foundation</span>
            <h1>Build your founding hero.</h1>
            <p>Castle is your campaign foundation. Choose two paths, two attributes, and one skill-tree advance.</p>
            <ProgressBar
              className="setup-progress"
              label="Hero setup choices completed"
              value={completedChoices}
              max={3}
              valueText={`${completedChoices} of 3 choices completed`}
            />
          </div>
          <span className={`readiness-chip${ready ? " readiness-chip--ready" : ""}`}>
            <span className="status-dot" />
            {ready ? "Ready" : `${completedChoices}/3 choices`}
          </span>
        </header>

        <div className="setup-sections">
          <div className="setup-column setup-column--primary">
            <section className="setup-card setup-card--faction">
            <header className="setup-card__heading">
              <span>01</span>
              <div>
                <h2>Base faction</h2>
                <p>Defines your first settlement.</p>
              </div>
            </header>
            <div className="faction-options">
              <div className="choice-card choice-card--faction choice-card--selected">
                <span className="choice-card__icon">
                  <GameIcon name="castle" size={23} />
                </span>
                <span>
                  <strong>Castle</strong>
                  <small>The sole playable root faction for new MVP campaigns.</small>
                </span>
                <i>Campaign</i>
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
                      {pathBonus[attribute.id]
                        ? `+${pathBonus[attribute.id]} path`
                        : "base"}
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
                      <strong>{previewAttributes[attribute.id]}</strong>
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
          </div>

          <div className="setup-column setup-column--secondary">
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
                    onClick={() => chooseClass(item.id)}
                    aria-pressed={heroClass === item.id}
                  >
                    <GameIcon name={item.icon} size={20} />
                    <strong>{item.name}</strong>
                    <small>
                      {formatAttributeBonus(
                        selectHeroClassAttributeBonus(item.id),
                      )}
                    </small>
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
                    onClick={() => chooseVocation(item.id)}
                    aria-pressed={vocation === item.id}
                  >
                    <GameIcon name={item.icon} size={20} />
                    <strong>{item.name}</strong>
                    <small>
                      {formatAttributeBonus(
                        selectHeroVocationAttributeBonus(item.id),
                      )}
                    </small>
                    <em>{item.skill}</em>
                  </button>
                ))}
              </div>
            </div>
            </section>

            <section className="setup-card setup-card--skill">
            <header className="setup-card__heading">
              <span>04</span>
              <div>
                <h2>Free skill point</h2>
                <p>Upgrade a root skill or open the first skill of any branch.</p>
              </div>
              <strong className={`skill-point-pool${bonusSkill ? " skill-point-pool--spent" : ""}`}>
                {bonusSkill ? "Spent" : "1 point"}
              </strong>
            </header>
            <SkillTreePicker
              classTreeId={heroClass}
              vocationTreeId={vocation}
              selectedSkill={bonusSkill}
              onSelect={setBonusSkill}
            />
            </section>
          </div>
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
        <ActionButton
          variant="primary"
          disabled={!ready}
          onClick={beginCampaign}
          endIcon={<GameIcon name="arrow" size={17} />}
        >
          Enter Village
        </ActionButton>
      </footer>

      {settingsOpen ? (
        <SettingsSheet onClose={() => setSettingsOpen(false)} />
      ) : null}
    </main>
  );
}
