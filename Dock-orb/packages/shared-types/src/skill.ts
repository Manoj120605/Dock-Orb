// ============================================================
// Skill Types — Reusable AI Behaviors
// ============================================================

import { DomainType } from './capsule';

/** Skill definition metadata (parsed from skill.md frontmatter) */
export interface SkillDefinition {
  /** Unique skill identifier (derived from path) */
  id: string;

  /** Human-readable skill name */
  name: string;

  /** Brief description of what this skill does */
  description: string;

  /** Domain this skill belongs to */
  domain: string;

  /** Semantic version */
  version: string;

  /** Author or team */
  author: string;

  /** Searchable tags */
  tags: string[];

  /** Trigger keywords — used for auto-detection */
  triggers: string[];

  /** Other skills this depends on */
  dependencies: string[];

  /** External tools this skill can invoke */
  tools: string[];

  /** File path to the skill.md */
  filePath: string;
}

/** Full skill content including the markdown body */
export interface SkillContent extends SkillDefinition {
  /** The full markdown body (role, goal, instructions, etc.) */
  body: string;

  /** Parsed sections from the markdown body */
  sections: SkillSections;
}

/** Parsed sections from a skill.md body */
export interface SkillSections {
  role?: string;
  goal?: string;
  instructions?: string;
  bestPractices?: string;
  constraints?: string;
  examples?: string;
  expectedOutput?: string;
}

/** Skill registry entry (for the workspace) */
export interface WorkspaceSkillEntry {
  id: string;
  workspaceId: string;
  skillPath: string;
  isEnabled: boolean;
  config: SkillConfig;
  createdAt: string;
}

/** Per-workspace skill configuration overrides */
export interface SkillConfig {
  /** Override priority (higher = more likely to be selected) */
  priority?: number;

  /** Custom trigger additions */
  additionalTriggers?: string[];

  /** Custom instructions to append */
  additionalInstructions?: string;

  /** Max tokens this skill's context can consume */
  maxTokenBudget?: number;
}

/** Skill match result from intent detection */
export interface SkillMatch {
  skill: SkillDefinition;
  confidence: number;
  matchedTriggers: string[];
}

/** Input to search/filter skills */
export interface SkillSearchInput {
  query?: string;
  domain?: DomainType;
  tags?: string[];
  enabledOnly?: boolean;
}
