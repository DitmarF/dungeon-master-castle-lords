"use client";

import { useState } from "react";
import {
  SKILL_BY_ID,
  SKILL_TREES,
  type IndexedSkill,
  type SkillId,
  type SkillTreeDefinition,
  type SkillTreeId,
} from "../game/skillTrees";
import { GameIcon } from "./GameIcon";

interface SkillTreePickerProps {
  classTreeId: SkillTreeId | null;
  vocationTreeId: SkillTreeId | null;
  selectedSkill: SkillId | null;
  onSelect: (skill: SkillId) => void;
}

interface TreeCardProps {
  kind: "Class" | "Vocation";
  tree: SkillTreeDefinition | null;
  selectedSkill: SkillId | null;
  onInspect: (skill: SkillId) => void;
  onSelect: (skill: SkillId) => void;
}

function EmptyTree({ kind }: { kind: "Class" | "Vocation" }) {
  return (
    <div className="skill-tree skill-tree--empty">
      <span className="skill-tree__kind">{kind} tree</span>
      <span className="skill-tree__empty-root">
        <GameIcon name="lock" size={15} />
      </span>
      <strong>Choose a {kind.toLowerCase()}</strong>
      <small>The matching tree will appear here.</small>
    </div>
  );
}

function TreeCard({
  kind,
  tree,
  selectedSkill,
  onInspect,
  onSelect,
}: TreeCardProps) {
  if (!tree) return <EmptyTree kind={kind} />;

  const selected = selectedSkill ? SKILL_BY_ID[selectedSkill] : null;
  const rootId = tree.root.id as SkillId;
  const rootSelected = selectedSkill === rootId;

  return (
    <div className="skill-tree" data-tree={tree.id}>
      <header className="skill-tree__header">
        <span className="skill-tree__kind">{kind} tree</span>
        <strong>{tree.name}</strong>
      </header>

      <button
        type="button"
        className={`skill-root${rootSelected ? " skill-node--selected" : ""}`}
        onClick={() => {
          onInspect(rootId);
          onSelect(rootId);
        }}
        onFocus={() => onInspect(rootId)}
        aria-pressed={rootSelected}
        aria-label={`${tree.root.name}, initial skill rank ${rootSelected ? 2 : 1}. Tap to ${rootSelected ? "keep" : "upgrade"}.`}
      >
        <span className="skill-root__sigil">{tree.root.sigil}</span>
        <span>
          <strong>{tree.root.name}</strong>
          <small>Initial · rank {rootSelected ? 2 : 1}</small>
        </span>
        <i>{rootSelected ? "+1" : "↑"}</i>
      </button>

      <svg
        className="skill-tree__fanout"
        viewBox="0 0 300 38"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          className={
            selected?.branchId === tree.branches[0].id
              ? "skill-connector--active"
              : undefined
          }
          d="M150 0 C150 17 50 13 50 38"
        />
        <path
          className={
            selected?.branchId === tree.branches[1].id
              ? "skill-connector--active"
              : undefined
          }
          d="M150 0 V38"
        />
        <path
          className={
            selected?.branchId === tree.branches[2].id
              ? "skill-connector--active"
              : undefined
          }
          d="M150 0 C150 17 250 13 250 38"
        />
      </svg>

      <div className="skill-branches">
        {tree.branches.map((branch) => {
          const branchActive = selected?.branchId === branch.id;
          return (
            <div
              className={`skill-branch${
                branchActive ? " skill-branch--active" : ""
              }`}
              key={branch.id}
            >
              <strong>{branch.name}</strong>
              <span className="skill-branch__track" aria-hidden="true" />
              <div className="skill-branch__nodes">
                {branch.skills.map((skill, index) => {
                  const skillId = skill.id as SkillId;
                  const available = index === 0;
                  const isSelected = selectedSkill === skillId;
                  const rank = isSelected ? 1 : 0;
                  const state = available
                    ? isSelected
                      ? "selected at rank 1"
                      : "available to learn"
                    : `locked, requires ${branch.skills[index - 1].name}`;

                  return (
                    <button
                      key={skill.id}
                      type="button"
                      className={`skill-node skill-node--tier-${index + 1}${
                        available ? " skill-node--available" : " skill-node--locked"
                      }${isSelected ? " skill-node--selected" : ""}`}
                      aria-pressed={available ? isSelected : undefined}
                      aria-label={`${skill.name}, ${state}`}
                      title={`${skill.name} · ${state}`}
                      onFocus={() => onInspect(skillId)}
                      onClick={() => {
                        onInspect(skillId);
                        if (available) onSelect(skillId);
                      }}
                    >
                      <span>{skill.sigil}</span>
                      <small>{rank || index + 1}</small>
                      {!available && <GameIcon name="lock" size={9} />}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function detailStatus(skill: IndexedSkill, selectedSkill: SkillId | null) {
  if (skill.id === selectedSkill) {
    return skill.tier === 0 ? "Selected · rank 2" : "Selected · rank 1";
  }
  if (skill.tier === 0) return "Initial · rank 1 · available upgrade";
  if (skill.tier === 1) return "Available · learn at rank 1";
  const tree = SKILL_TREES[skill.treeId];
  const branch = tree.branches.find((item) => item.id === skill.branchId);
  const prerequisite = branch?.skills[skill.tier - 2];
  return `Locked · requires ${prerequisite?.name ?? "previous skill"}`;
}

export function SkillTreePicker({
  classTreeId,
  vocationTreeId,
  selectedSkill,
  onSelect,
}: SkillTreePickerProps) {
  const [inspectedSkill, setInspectedSkill] = useState<SkillId | null>(null);
  const treeIds = [classTreeId, vocationTreeId].filter(
    (treeId): treeId is SkillTreeId => Boolean(treeId),
  );
  const inspected = inspectedSkill ? SKILL_BY_ID[inspectedSkill] : null;
  const selected = selectedSkill ? SKILL_BY_ID[selectedSkill] : null;
  const fallbackRoot = treeIds[0]
    ? SKILL_BY_ID[SKILL_TREES[treeIds[0]].root.id as SkillId]
    : null;
  const detail =
    inspected && treeIds.includes(inspected.treeId)
      ? inspected
      : selected && treeIds.includes(selected.treeId)
        ? selected
        : fallbackRoot;

  return (
    <div className="skill-tree-picker">
      <div className="skill-tree-legend" aria-label="Skill tree legend">
        <span><i className="skill-legend-dot skill-legend-dot--initial" />Initial</span>
        <span><i className="skill-legend-dot skill-legend-dot--open" />Open</span>
        <span><i className="skill-legend-dot skill-legend-dot--locked" />Locked</span>
      </div>

      <div className="skill-tree-pair">
        <TreeCard
          kind="Class"
          tree={classTreeId ? SKILL_TREES[classTreeId] : null}
          selectedSkill={selectedSkill}
          onInspect={setInspectedSkill}
          onSelect={onSelect}
        />
        <TreeCard
          kind="Vocation"
          tree={vocationTreeId ? SKILL_TREES[vocationTreeId] : null}
          selectedSkill={selectedSkill}
          onInspect={setInspectedSkill}
          onSelect={onSelect}
        />
      </div>

      <div className={`skill-detail${detail ? "" : " skill-detail--empty"}`} aria-live="polite">
        {detail ? (
          <>
            <span className="skill-detail__sigil">{detail.sigil}</span>
            <span className="skill-detail__copy">
              <small>
                {detail.treeName}
                {detail.branchName ? ` · ${detail.branchName} · tier ${detail.tier}` : " · root"}
              </small>
              <strong>{detail.name}</strong>
              <p>{detail.description}</p>
            </span>
            <em className={detail.tier > 1 ? "skill-detail__state--locked" : undefined}>
              {detailStatus(detail, selectedSkill)}
            </em>
          </>
        ) : (
          <>
            <GameIcon name="lock" size={17} />
            <span>
              <strong>Choose both hero paths</strong>
              <p>Your class and vocation trees will appear above.</p>
            </span>
          </>
        )}
      </div>
    </div>
  );
}
