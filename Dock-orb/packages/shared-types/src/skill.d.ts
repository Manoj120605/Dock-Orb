import { DomainType } from './capsule';
export interface SkillDefinition {
    id: string;
    name: string;
    description: string;
    domain: string;
    version: string;
    author: string;
    tags: string[];
    triggers: string[];
    dependencies: string[];
    tools: string[];
    filePath: string;
}
export interface SkillContent extends SkillDefinition {
    body: string;
    sections: SkillSections;
}
export interface SkillSections {
    role?: string;
    goal?: string;
    instructions?: string;
    bestPractices?: string;
    constraints?: string;
    examples?: string;
    expectedOutput?: string;
}
export interface WorkspaceSkillEntry {
    id: string;
    workspaceId: string;
    skillPath: string;
    isEnabled: boolean;
    config: SkillConfig;
    createdAt: string;
}
export interface SkillConfig {
    priority?: number;
    additionalTriggers?: string[];
    additionalInstructions?: string;
    maxTokenBudget?: number;
}
export interface SkillMatch {
    skill: SkillDefinition;
    confidence: number;
    matchedTriggers: string[];
}
export interface SkillSearchInput {
    query?: string;
    domain?: DomainType;
    tags?: string[];
    enabledOnly?: boolean;
}
