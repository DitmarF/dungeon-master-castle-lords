"use client";

import { useMemo, useState } from "react";
import { useGame } from "../game/GameProvider";
import type {
  GeneratedLocationSnapshot,
  GeneratedRegionSnapshot,
  GeneratedSiteSnapshot,
  RegionId,
} from "../game/generateStartingWorld";
import {
  REGION_LOCATION_DEFINITION_BY_ID,
  REGION_TERRAIN_DEFINITION_BY_ID,
  RESOURCE_SITE_DEFINITION_BY_ID,
} from "../game/openingContent";
import { GameIcon, type IconName } from "../ui/GameIcon";
import { ActionButton, Panel } from "../ui/GamePrimitives";
import { GameShell } from "../ui/GameShell";

interface RegionContents {
  site: GeneratedSiteSnapshot | null;
  location: GeneratedLocationSnapshot | null;
}

function regionSlot(region: GeneratedRegionSnapshot): string {
  const slots: Record<string, string> = {
    "0,0": "home",
    "1,0": "east",
    "1,-1": "north-east",
    "0,-1": "north-west",
    "-1,0": "west",
    "-1,1": "south-west",
    "0,1": "south-east",
  };
  return slots[`${region.coordinate.q},${region.coordinate.r}`] ?? "home";
}

function describeRegion(
  region: GeneratedRegionSnapshot,
  homeRegionId: RegionId,
  contents: RegionContents,
): { label: string; detail: string; icon: IconName; kind: string } {
  if (region.id === homeRegionId) {
    return {
      label: "Capital Village",
      detail: "The authoritative Tier-1 Castle capital in the home region.",
      icon: "castle",
      kind: "Capital",
    };
  }
  if (contents.site) {
    const definition =
      RESOURCE_SITE_DEFINITION_BY_ID[contents.site.definitionId];
    return {
      label: definition.name,
      detail: definition.description,
      icon: "target",
      kind: "Resource site",
    };
  }
  if (contents.location) {
    const definition =
      REGION_LOCATION_DEFINITION_BY_ID[contents.location.definitionId];
    return {
      label: definition.name,
      detail: definition.description,
      icon: definition.locationKind === "dungeon" ? "grid" : "eye",
      kind: definition.locationKind === "dungeon" ? "Location" : "Inert location",
    };
  }
  const terrain =
    REGION_TERRAIN_DEFINITION_BY_ID[region.terrainDefinitionId];
  return {
    label: "Open terrain",
    detail: terrain.description,
    icon: "world",
    kind: "Terrain only",
  };
}

export function WorldBoard() {
  const { activeGame, enterDungeon } = useGame();
  const foundation = activeGame?.foundation;
  const [selectedRegionId, setSelectedRegionId] = useState<RegionId | null>(
    foundation?.world.homeRegionId ?? null,
  );
  const [entryMessage, setEntryMessage] = useState<string | null>(null);

  const contentsByRegion = useMemo(() => {
    const contents = new Map<RegionId, RegionContents>();
    if (!foundation) return contents;
    for (const region of foundation.world.regions) {
      contents.set(region.id, { site: null, location: null });
    }
    for (const site of foundation.world.sites) {
      const current = contents.get(site.regionId);
      if (current) current.site = site;
    }
    for (const location of foundation.world.locations) {
      const current = contents.get(location.regionId);
      if (current) current.location = location;
    }
    return contents;
  }, [foundation]);

  if (!activeGame || !foundation) return null;
  const { hero, world } = foundation;
  const selectedRegion =
    world.regions.find((region) => region.id === selectedRegionId) ??
    world.regions[0];
  const selectedContents = contentsByRegion.get(selectedRegion.id) ?? {
    site: null,
    location: null,
  };
  const selectedDescription = describeRegion(
    selectedRegion,
    world.homeRegionId,
    selectedContents,
  );
  const selectedDungeon =
    selectedContents.location?.definitionId === "regional-dungeon"
      ? selectedContents.location
      : null;

  return (
    <GameShell
      className="world-view"
      title="Home Ring"
      subtitle="Castle opening · Stored World snapshot"
      icon="world"
      stats={[
        { label: "Regions", value: world.regions.length, icon: "world" },
        {
          label: "Controlled",
          value: world.regions.filter((region) => region.controlled).length,
          icon: "flag",
        },
        { label: "Sites", value: world.sites.length, icon: "target" },
      ]}
    >
      <section className="world-board" aria-labelledby="world-title">
        <header className="board-summary world-board__summary">
          <div>
            <span className="section-kicker">Starting territory</span>
            <h1 id="world-title">Capital and six-region ring</h1>
          </div>
          <span className="status-chip">
            <span className="status-dot" /> 7 controlled
          </span>
        </header>

        <div className="world-board__layout">
          <div
            className="world-ring"
            role="group"
            aria-label="Seven-region home ring. Choose a region to inspect it."
          >
            {world.regions.map((region) => {
              const contents = contentsByRegion.get(region.id) ?? {
                site: null,
                location: null,
              };
              const description = describeRegion(
                region,
                world.homeRegionId,
                contents,
              );
              const selected = region.id === selectedRegion.id;
              return (
                <button
                  type="button"
                  key={region.id}
                  className={`world-region world-region--${regionSlot(region)}${
                    selected ? " world-region--selected" : ""
                  }`}
                  onClick={() => {
                    setSelectedRegionId(region.id);
                    setEntryMessage(null);
                  }}
                  aria-pressed={selected}
                  aria-label={`${description.label}, controlled region at axial ${region.coordinate.q}, ${region.coordinate.r}`}
                >
                  <span className="world-region__surface">
                    <GameIcon name={description.icon} size={24} />
                    <strong>{description.label}</strong>
                    <small>Controlled</small>
                  </span>
                </button>
              );
            })}
          </div>

          <Panel variant="raised" className="world-region-detail">
            <header>
              <span className="world-region-detail__icon">
                <GameIcon name={selectedDescription.icon} size={25} />
              </span>
              <span>
                <small>{selectedDescription.kind}</small>
                <h2>{selectedDescription.label}</h2>
              </span>
              <span className="controlled-label">
                <GameIcon name="flag" size={13} /> Controlled
              </span>
            </header>
            <dl className="world-region-detail__facts">
              <div>
                <dt>Region</dt>
                <dd>{selectedRegion.id}</dd>
              </div>
              <div>
                <dt>Axial</dt>
                <dd>{selectedRegion.coordinate.q}, {selectedRegion.coordinate.r}</dd>
              </div>
              <div>
                <dt>Strategic Hero</dt>
                <dd>
                  {hero.strategicRegionId === selectedRegion.id
                    ? "Present"
                    : `Anchored at ${hero.strategicRegionId}`}
                </dd>
              </div>
            </dl>
            <p>{selectedDescription.detail}</p>
            {selectedContents.site ? (
              <p className="world-region-detail__boundary">
                Site identity only — yields and improvements are not implemented.
              </p>
            ) : null}
            {selectedContents.location?.definitionId === "ruin" ? (
              <p className="world-region-detail__boundary">
                Discoverable context only — this ruin has no action or reward yet.
              </p>
            ) : null}
            {selectedDungeon ? (
              <ActionButton
                variant="primary"
                endIcon={<GameIcon name="arrow" size={17} />}
                onClick={() => {
                  const result = enterDungeon(selectedDungeon.id);
                  if (result && !result.ok) {
                    setEntryMessage("The regional Dungeon could not be entered.");
                  }
                }}
              >
                {hero.explorationContext?.locationId === selectedDungeon.id
                  ? "Resume regional Dungeon"
                  : "Enter regional Dungeon"}
              </ActionButton>
            ) : null}
            {entryMessage ? (
              <p className="field-error" role="alert">{entryMessage}</p>
            ) : null}
          </Panel>
        </div>
      </section>
    </GameShell>
  );
}
