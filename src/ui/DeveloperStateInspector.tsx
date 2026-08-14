"use client";

import { useEffect, useState } from "react";
import { useGame } from "../game/GameProvider";
import type { AttributeKey, HeroAttributes } from "../game/model";
import { GameIcon } from "./GameIcon";
import { ModalOverlay } from "./ModalOverlay";

interface DeveloperStateInspectorProps {
  onClose: () => void;
}

type CopyTarget = "campaign seed" | "state JSON";

const ATTRIBUTE_LABELS: Record<AttributeKey, string> = {
  str: "Strength",
  agy: "Agility",
  per: "Perception",
  int: "Intellect",
  cha: "Charisma",
  lead: "Leadership",
};

const ATTRIBUTE_KEYS = Object.keys(ATTRIBUTE_LABELS) as AttributeKey[];

function formatPosition(position: { x: number; y: number } | undefined) {
  return position ? `${position.x}, ${position.y}` : "Not created";
}

function AttributeValues({
  attributes,
}: {
  attributes: HeroAttributes | null;
}) {
  if (!attributes) {
    return (
      <p className="developer-inspector__empty">Available after Hero Setup.</p>
    );
  }

  return (
    <dl className="developer-inspector__attributes">
      {ATTRIBUTE_KEYS.map((key) => (
        <div key={key}>
          <dt title={ATTRIBUTE_LABELS[key]}>{key}</dt>
          <dd>{attributes[key]}</dd>
        </div>
      ))}
    </dl>
  );
}

export function DeveloperStateInspector({
  onClose,
}: DeveloperStateInspectorProps) {
  const { activeGame } = useGame();
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  const heroAttributes =
    activeGame?.foundation?.hero.attributesCompatibility.values ?? null;
  const stateJson = activeGame ? JSON.stringify(activeGame, null, 2) : "";

  useEffect(() => {
    if (!copyMessage) return;
    const timer = window.setTimeout(() => setCopyMessage(null), 1800);
    return () => window.clearTimeout(timer);
  }, [copyMessage]);

  if (!activeGame) return null;

  async function copyValue(value: string, target: CopyTarget) {
    try {
      await navigator.clipboard.writeText(value);
      setCopyMessage(`Copied ${target}.`);
    } catch {
      setCopyMessage(`Could not copy ${target}.`);
    }
  }

  const foundation = activeGame.foundation;
  const hero = foundation?.hero;
  const exploration = hero?.explorationContext;
  const dungeon = foundation?.regionalDungeons["location:regional-dungeon"];
  const facts = [
    ["Schema version", activeGame.version],
    ["Campaign ID", activeGame.id],
    ["Owner / player ID", activeGame.playerId],
    ["Campaign seed", activeGame.campaignSeed],
    ["World seed", foundation?.world.seed ?? "Not generated"],
    ["Dungeon seed", dungeon?.seed ?? "Not generated"],
    ["Active board", activeGame.activeBoardId],
    ["Hero Setup", foundation ? "Complete" : "Incomplete"],
    ["Faction", foundation?.rootFactionId ?? "Not selected"],
    ["Hero class", hero?.heroClass ?? "Not selected"],
    ["Hero vocation", hero?.vocation ?? "Not selected"],
    ["Strategic region", hero?.strategicRegionId ?? "Not created"],
    ["Exploration position", formatPosition(exploration?.cell)],
    ["Dungeon level", dungeon?.level ?? "Not generated"],
    ["Discovered cells", dungeon?.discovered.length ?? 0],
    [
      "Dungeon Heart",
      dungeon?.heartReached ? "Reached" : "Not reached",
    ],
    ["Capital", foundation ? "Tier-1 Village" : "Not created"],
  ] as const;

  return (
    <ModalOverlay
      backdropClassName="settings-sheet-backdrop developer-inspector-backdrop"
      panelClassName="settings-sheet developer-inspector"
      labelledBy="developer-inspector-title"
      onClose={onClose}
    >
      <header className="settings-sheet__header">
        <span className="settings-sheet__mark">
          <GameIcon name="grid" size={23} />
        </span>
        <div>
          <span className="section-kicker">Development only</span>
          <h2 id="developer-inspector-title">Campaign state</h2>
        </div>
        <button
          type="button"
          className="settings-sheet__close"
          onClick={onClose}
          aria-label="Close campaign state inspector"
        >
          ×
        </button>
      </header>

      <div className="developer-inspector__actions">
        <button
          type="button"
          onClick={() =>
            copyValue(String(activeGame.campaignSeed), "campaign seed")
          }
        >
          Copy campaign seed
        </button>
        <button
          type="button"
          onClick={() => copyValue(stateJson, "state JSON")}
        >
          Copy state JSON
        </button>
      </div>

      <p
        className="developer-inspector__copy-status"
        role="status"
        aria-live="polite"
      >
        {copyMessage ??
          "Read-only inspector — campaign mutation is unavailable."}
      </p>

      <section
        className="developer-inspector__section"
        aria-labelledby="campaign-facts-title"
      >
        <h3 id="campaign-facts-title">Authoritative facts</h3>
        <dl className="developer-inspector__facts">
          {facts.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section
        className="developer-inspector__section"
        aria-labelledby="derived-attributes-title"
      >
        <div className="developer-inspector__section-heading">
          <h3 id="derived-attributes-title">Derived Hero attributes</h3>
          <span>Selector authority</span>
        </div>
        <AttributeValues attributes={heroAttributes} />
      </section>

      <details className="developer-inspector__json">
        <summary>Raw authoritative campaign JSON</summary>
        <pre tabIndex={0}>{stateJson}</pre>
      </details>
    </ModalOverlay>
  );
}
