export type SkillTreeId =
  | "fighter"
  | "ranger"
  | "mage"
  | "general"
  | "spy"
  | "diplomat";

export type SkillTreeKind = "class" | "vocation";

export interface SkillNodeDefinition {
  id: string;
  name: string;
  sigil: string;
  description: string;
}

export interface SkillBranchDefinition {
  id: string;
  name: string;
  skills: readonly SkillNodeDefinition[];
}

export interface SkillTreeDefinition {
  id: SkillTreeId;
  kind: SkillTreeKind;
  name: string;
  root: SkillNodeDefinition;
  branches: readonly SkillBranchDefinition[];
}

export const SKILL_TREES = {
  fighter: {
    id: "fighter",
    kind: "class",
    name: "Fighter",
    root: {
      id: "close-combat",
      name: "Close Combat",
      sigil: "CC",
      description: "Core training for fighting an enemy at arm's reach.",
    },
    branches: [
      {
        id: "fighter-power",
        name: "Power",
        skills: [
          {
            id: "heavy-blow",
            name: "Heavy Blow",
            sigil: "HB",
            description: "Trade speed for a forceful melee strike.",
          },
          {
            id: "cleaving-strike",
            name: "Cleaving Strike",
            sigil: "CS",
            description: "Carry a melee attack through more than one target.",
          },
          {
            id: "executioner",
            name: "Executioner",
            sigil: "EX",
            description: "Deal decisive damage to a badly wounded enemy.",
          },
        ],
      },
      {
        id: "fighter-guard",
        name: "Guard",
        skills: [
          {
            id: "brace",
            name: "Brace",
            sigil: "BR",
            description: "Set your stance to resist the next close attack.",
          },
          {
            id: "riposte",
            name: "Riposte",
            sigil: "RI",
            description: "Answer a blocked attack with an immediate strike.",
          },
          {
            id: "bulwark",
            name: "Bulwark",
            sigil: "BU",
            description: "Hold ground and protect adjacent allies.",
          },
        ],
      },
      {
        id: "fighter-motion",
        name: "Motion",
        skills: [
          {
            id: "footwork",
            name: "Footwork",
            sigil: "FW",
            description: "Reposition safely while engaged in melee.",
          },
          {
            id: "lunge",
            name: "Lunge",
            sigil: "LU",
            description: "Close a short gap and strike in one action.",
          },
          {
            id: "whirlwind",
            name: "Whirlwind",
            sigil: "WW",
            description: "Sweep every adjacent enemy with one attack.",
          },
        ],
      },
    ],
  },
  ranger: {
    id: "ranger",
    kind: "class",
    name: "Ranger",
    root: {
      id: "ranged-combat",
      name: "Ranged Combat",
      sigil: "RC",
      description: "Core training for accurate attacks from a distance.",
    },
    branches: [
      {
        id: "ranger-precision",
        name: "Precision",
        skills: [
          {
            id: "aimed-shot",
            name: "Aimed Shot",
            sigil: "AS",
            description: "Spend time to make a more accurate ranged attack.",
          },
          {
            id: "weak-spot",
            name: "Weak Spot",
            sigil: "WS",
            description: "Bypass part of a marked target's protection.",
          },
          {
            id: "deadeye",
            name: "Deadeye",
            sigil: "DE",
            description: "Make extreme-range shots without losing precision.",
          },
        ],
      },
      {
        id: "ranger-skirmish",
        name: "Skirmish",
        skills: [
          {
            id: "quickstep",
            name: "Quickstep",
            sigil: "QS",
            description: "Move a short distance after making a ranged attack.",
          },
          {
            id: "skirmisher",
            name: "Skirmisher",
            sigil: "SK",
            description: "Stay accurate while moving through a fight.",
          },
          {
            id: "ghost-trail",
            name: "Ghost Trail",
            sigil: "GT",
            description: "Break pursuit after leaving an enemy's sight.",
          },
        ],
      },
      {
        id: "ranger-volley",
        name: "Volley",
        skills: [
          {
            id: "rapid-shot",
            name: "Rapid Shot",
            sigil: "RS",
            description: "Loose a second, less accurate projectile.",
          },
          {
            id: "split-arrow",
            name: "Split Arrow",
            sigil: "SA",
            description: "Threaten two nearby targets with one action.",
          },
          {
            id: "arrow-storm",
            name: "Arrow Storm",
            sigil: "AR",
            description: "Blanket a small area with ranged attacks.",
          },
        ],
      },
    ],
  },
  mage: {
    id: "mage",
    kind: "class",
    name: "Mage",
    root: {
      id: "mage-combat",
      name: "Mage Combat",
      sigil: "MC",
      description: "Core training for shaping magic under combat pressure.",
    },
    branches: [
      {
        id: "mage-flame",
        name: "Flame",
        skills: [
          {
            id: "ember-bolt",
            name: "Ember Bolt",
            sigil: "EB",
            description: "Hurl a compact bolt of fire at one target.",
          },
          {
            id: "fireball",
            name: "Fireball",
            sigil: "FB",
            description: "Detonate flame across a small area.",
          },
          {
            id: "inferno",
            name: "Inferno",
            sigil: "IN",
            description: "Sustain a dangerous field of intense fire.",
          },
        ],
      },
      {
        id: "mage-frost",
        name: "Frost",
        skills: [
          {
            id: "frost-shard",
            name: "Frost Shard",
            sigil: "FS",
            description: "Damage and briefly slow a target with ice.",
          },
          {
            id: "ice-wall",
            name: "Ice Wall",
            sigil: "IW",
            description: "Raise a temporary barrier across open cells.",
          },
          {
            id: "deep-freeze",
            name: "Deep Freeze",
            sigil: "DF",
            description: "Lock a weakened target in place.",
          },
        ],
      },
      {
        id: "mage-arcane",
        name: "Arcane",
        skills: [
          {
            id: "mana-ward",
            name: "Mana Ward",
            sigil: "MW",
            description: "Turn mana into a short-lived protective ward.",
          },
          {
            id: "blink",
            name: "Blink",
            sigil: "BL",
            description: "Teleport across a short visible distance.",
          },
          {
            id: "arcane-surge",
            name: "Arcane Surge",
            sigil: "AS",
            description: "Empower the next spell at an increased mana cost.",
          },
        ],
      },
    ],
  },
  general: {
    id: "general",
    kind: "vocation",
    name: "General",
    root: {
      id: "tactics",
      name: "Tactics",
      sigil: "TA",
      description: "Read the field and direct allies with purpose.",
    },
    branches: [
      {
        id: "general-command",
        name: "Command",
        skills: [
          {
            id: "rally",
            name: "Rally",
            sigil: "RA",
            description: "Restore the resolve of nearby allies.",
          },
          {
            id: "battle-order",
            name: "Battle Order",
            sigil: "BO",
            description: "Grant one ally an immediate tactical action.",
          },
          {
            id: "supreme-command",
            name: "Supreme Command",
            sigil: "SC",
            description: "Coordinate several units in a single turn.",
          },
        ],
      },
      {
        id: "general-formation",
        name: "Formation",
        skills: [
          {
            id: "hold-line",
            name: "Hold Line",
            sigil: "HL",
            description: "Improve the defense of adjacent allied units.",
          },
          {
            id: "flanking",
            name: "Flanking",
            sigil: "FL",
            description: "Reward allies attacking from opposing sides.",
          },
          {
            id: "encirclement",
            name: "Encirclement",
            sigil: "EN",
            description: "Punish an enemy completely surrounded by allies.",
          },
        ],
      },
      {
        id: "general-logistics",
        name: "Logistics",
        skills: [
          {
            id: "supply-line",
            name: "Supply Line",
            sigil: "SL",
            description: "Reduce the supply cost of a deployed group.",
          },
          {
            id: "forced-march",
            name: "Forced March",
            sigil: "FM",
            description: "Move a group farther at the cost of fatigue.",
          },
          {
            id: "war-machine",
            name: "War Machine",
            sigil: "WM",
            description: "Improve the readiness of the whole army.",
          },
        ],
      },
    ],
  },
  spy: {
    id: "spy",
    kind: "vocation",
    name: "Spy",
    root: {
      id: "deception",
      name: "Deception",
      sigil: "DE",
      description: "Conceal motives, identity, and intent.",
    },
    branches: [
      {
        id: "spy-infiltration",
        name: "Infiltration",
        skills: [
          {
            id: "disguise",
            name: "Disguise",
            sigil: "DI",
            description: "Pass as a member of another group for a short time.",
          },
          {
            id: "shadow-entry",
            name: "Shadow Entry",
            sigil: "SE",
            description: "Enter a guarded location through an indirect route.",
          },
          {
            id: "perfect-cover",
            name: "Perfect Cover",
            sigil: "PC",
            description: "Maintain a false identity under close inspection.",
          },
        ],
      },
      {
        id: "spy-sabotage",
        name: "Sabotage",
        skills: [
          {
            id: "tamper",
            name: "Tamper",
            sigil: "TA",
            description: "Quietly impair a simple device or mechanism.",
          },
          {
            id: "poison-cache",
            name: "Poison Cache",
            sigil: "PC",
            description: "Contaminate a stored resource without detection.",
          },
          {
            id: "demolition",
            name: "Demolition",
            sigil: "DM",
            description: "Destroy a key structure at a chosen moment.",
          },
        ],
      },
      {
        id: "spy-intelligence",
        name: "Intel",
        skills: [
          {
            id: "eavesdrop",
            name: "Eavesdrop",
            sigil: "EA",
            description: "Collect information from a nearby conversation.",
          },
          {
            id: "network",
            name: "Network",
            sigil: "NW",
            description: "Establish informants inside a settlement.",
          },
          {
            id: "mastermind",
            name: "Mastermind",
            sigil: "MM",
            description: "Reveal hidden relationships in gathered intelligence.",
          },
        ],
      },
    ],
  },
  diplomat: {
    id: "diplomat",
    kind: "vocation",
    name: "Diplomat",
    root: {
      id: "diplomacy",
      name: "Diplomacy",
      sigil: "DP",
      description: "Build agreements through language and shared interests.",
    },
    branches: [
      {
        id: "diplomat-influence",
        name: "Influence",
        skills: [
          {
            id: "persuasion",
            name: "Persuasion",
            sigil: "PE",
            description: "Shift a neutral character toward your position.",
          },
          {
            id: "favor",
            name: "Favor",
            sigil: "FA",
            description: "Turn goodwill into a concrete concession.",
          },
          {
            id: "mandate",
            name: "Mandate",
            sigil: "MA",
            description: "Secure broad support for a political action.",
          },
        ],
      },
      {
        id: "diplomat-negotiation",
        name: "Negotiation",
        skills: [
          {
            id: "bargain",
            name: "Bargain",
            sigil: "BA",
            description: "Improve the terms of a trade or exchange.",
          },
          {
            id: "mediation",
            name: "Mediation",
            sigil: "ME",
            description: "Reduce hostility between two opposing groups.",
          },
          {
            id: "grand-accord",
            name: "Grand Accord",
            sigil: "GA",
            description: "Bind several parties to one lasting agreement.",
          },
        ],
      },
      {
        id: "diplomat-statecraft",
        name: "Statecraft",
        skills: [
          {
            id: "protocol",
            name: "Protocol",
            sigil: "PR",
            description: "Avoid penalties when dealing with an unfamiliar court.",
          },
          {
            id: "alliance",
            name: "Alliance",
            sigil: "AL",
            description: "Convert a strong relationship into mutual support.",
          },
          {
            id: "peacekeeper",
            name: "Peacekeeper",
            sigil: "PK",
            description: "Preserve an agreement when conflict threatens it.",
          },
        ],
      },
    ],
  },
} as const satisfies Record<SkillTreeId, SkillTreeDefinition>;

type AnyTree = (typeof SKILL_TREES)[keyof typeof SKILL_TREES];

export type SkillId =
  | AnyTree["root"]["id"]
  | AnyTree["branches"][number]["skills"][number]["id"];

export interface IndexedSkill extends SkillNodeDefinition {
  id: SkillId;
  treeId: SkillTreeId;
  treeName: string;
  branchId: string | null;
  branchName: string | null;
  tier: 0 | 1 | 2 | 3;
}

export const ALL_SKILLS: readonly IndexedSkill[] = Object.values(
  SKILL_TREES,
).flatMap((tree) => [
  {
    ...tree.root,
    id: tree.root.id as SkillId,
    treeId: tree.id,
    treeName: tree.name,
    branchId: null,
    branchName: null,
    tier: 0 as const,
  },
  ...tree.branches.flatMap((branch) =>
    branch.skills.map((skill, index) => ({
      ...skill,
      id: skill.id as SkillId,
      treeId: tree.id,
      treeName: tree.name,
      branchId: branch.id,
      branchName: branch.name,
      tier: (index + 1) as 1 | 2 | 3,
    })),
  ),
]);

export const SKILL_BY_ID = Object.fromEntries(
  ALL_SKILLS.map((skill) => [skill.id, skill]),
) as Record<SkillId, IndexedSkill>;

export function createEmptySkillRanks(): Record<SkillId, number> {
  return Object.fromEntries(ALL_SKILLS.map((skill) => [skill.id, 0])) as Record<
    SkillId,
    number
  >;
}

export function normalizeSkillRanks(value: unknown): Record<SkillId, number> {
  const result = createEmptySkillRanks();
  if (!value || typeof value !== "object") return result;

  for (const skill of ALL_SKILLS) {
    const rank = (value as Record<string, unknown>)[skill.id];
    if (typeof rank === "number" && Number.isFinite(rank) && rank > 0) {
      result[skill.id] = Math.floor(rank);
    }
  }
  return result;
}

export function skillBelongsToTree(
  skillId: SkillId,
  treeId: SkillTreeId,
): boolean {
  return SKILL_BY_ID[skillId]?.treeId === treeId;
}
