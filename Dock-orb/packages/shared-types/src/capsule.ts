// ============================================================
// Capsule Types — Structured Project Memory
// ============================================================

/** All supported capsule types */
export type CapsuleType = 'PROJECT' | 'USER' | 'TASK' | 'CONVERSATION' | 'TEAM';

/** All supported domain types */
export type DomainType =
  | 'software'
  | 'mechanical'
  | 'electrical'
  | 'research'
  | 'cybersecurity'
  | 'general';

// ---- Base Capsule ----

export interface BaseCapsule {
  id: string;
  workspaceId: string;
  userId: string;
  type: CapsuleType;
  name: string;
  description?: string;
  metadata: CapsuleMetadata;
  version: number;
  parentId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CapsuleMetadata {
  domain: DomainType;
  tags: string[];
  lastSummarizedAt?: string;
  embeddingId?: string;
  tokenCount?: number;
}

// ---- Project Capsule ----

export interface ProjectCapsule extends BaseCapsule {
  type: 'PROJECT';
  content: ProjectCapsuleContent;
}

export interface ProjectCapsuleContent {
  project: {
    name: string;
    description: string;
    domain: DomainType;
    language?: string;
    framework?: string;
    repository?: string;
  };
  architecture: {
    overview: string;
    patterns: string[];
    diagrams: string[];
  };
  structure: {
    folders: Record<string, string>;
    importantFiles: ImportantFile[];
  };
  standards: {
    coding: string[];
    naming: string[];
    engineering: string[];
  };
  database?: {
    type: string;
    schema: Record<string, unknown>;
    migrations: string[];
  };
  apis: {
    internal: ApiEndpoint[];
    external: ExternalApi[];
  };
  dependencies: {
    production: Record<string, string>;
    development: Record<string, string>;
  };
  currentWork: {
    feature: string;
    branch?: string;
    status: string;
    blockers: string[];
  };
  history: {
    completedTasks: CompletedTask[];
    decisions: Decision[];
    knownBugs: KnownBug[];
  };
  documentation: {
    readme?: string;
    guides: string[];
    designRationale: string;
  };
}

// ---- User Capsule ----

export interface UserCapsule extends BaseCapsule {
  type: 'USER';
  content: UserCapsuleContent;
}

export interface UserCapsuleContent {
  preferences: {
    language: string;
    framework: string;
    codeStyle: string;
    responseFormat: string;
    verbosity: 'concise' | 'normal' | 'detailed';
  };
  expertise: {
    domains: DomainType[];
    languages: string[];
    frameworks: string[];
    level: 'beginner' | 'intermediate' | 'senior' | 'expert';
  };
  patterns: {
    commonRequests: string[];
    preferredApproaches: string[];
    avoidPatterns: string[];
  };
}

// ---- Task Capsule ----

export interface TaskCapsule extends BaseCapsule {
  type: 'TASK';
  content: TaskCapsuleContent;
}

export interface TaskCapsuleContent {
  task: {
    title: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed' | 'blocked';
    priority: 'low' | 'medium' | 'high' | 'critical';
    assignee?: string;
    dueDate?: string;
  };
  context: {
    relatedFiles: string[];
    relatedCapsules: string[];
    requirements: string[];
    acceptanceCriteria: string[];
  };
  progress: {
    steps: TaskStep[];
    completedSteps: number;
    totalSteps: number;
    blockers: string[];
  };
}

// ---- Conversation Capsule ----

export interface ConversationCapsule extends BaseCapsule {
  type: 'CONVERSATION';
  content: ConversationCapsuleContent;
}

export interface ConversationCapsuleContent {
  summary: string;
  keyTopics: string[];
  decisionsReached: Decision[];
  codeGenerated: CodeArtifact[];
  questionsAnswered: QAPair[];
  unresolved: string[];
  tokensUsed: number;
  costIncurred: number;
}

// ---- Team Capsule ----

export interface TeamCapsule extends BaseCapsule {
  type: 'TEAM';
  content: TeamCapsuleContent;
}

export interface TeamCapsuleContent {
  team: {
    name: string;
    description: string;
    members: string[];
  };
  conventions: {
    coding: string[];
    review: string[];
    deployment: string[];
    communication: string[];
  };
  sharedKnowledge: {
    architecture: string;
    bestPractices: string[];
    commonIssues: string[];
    onboarding: string[];
  };
}

// ---- Mechanical Capsule Extension ----

export interface MechanicalCapsuleContent {
  material: {
    name: string;
    type: string;
    properties: Record<string, number | string>;
    standard: string;
  };
  loadConditions: {
    type: string;
    magnitude: number;
    unit: string;
    direction?: string;
    description: string;
  }[];
  safetyFactor: number;
  manufacturing: {
    process: string;
    tolerances: Record<string, string>;
    surfaceFinish: string;
    dfmNotes: string[];
  };
  simulation: {
    type: string;
    software: string;
    results: Record<string, unknown>;
    maxStress?: number;
    maxDeflection?: number;
    convergence?: boolean;
  }[];
  assembly: {
    components: string[];
    joints: string[];
    constraints: string[];
    bom: BOMItem[];
  };
  standards: string[];
  revisionHistory: Revision[];
}

// ---- Shared Sub-types ----

export interface ImportantFile {
  path: string;
  purpose: string;
  lastModified?: string;
}

export interface ApiEndpoint {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  purpose: string;
  auth?: boolean;
}

export interface ExternalApi {
  name: string;
  baseUrl: string;
  purpose: string;
  docsUrl?: string;
}

export interface CompletedTask {
  task: string;
  date: string;
  outcome: string;
}

export interface Decision {
  decision: string;
  rationale: string;
  date: string;
  reversible?: boolean;
}

export interface KnownBug {
  bug: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'fixed' | 'wontfix';
  workaround?: string;
}

export interface TaskStep {
  step: string;
  status: 'pending' | 'in_progress' | 'completed';
  notes?: string;
}

export interface CodeArtifact {
  filename: string;
  language: string;
  description: string;
  linesChanged: number;
}

export interface QAPair {
  question: string;
  answer: string;
  confidence: number;
}

export interface BOMItem {
  partNumber: string;
  name: string;
  quantity: number;
  material?: string;
  supplier?: string;
  unitCost?: number;
}

export interface Revision {
  version: string;
  date: string;
  author: string;
  changes: string;
  approved?: boolean;
}

/** Union type for all capsule types */
export type Capsule =
  | ProjectCapsule
  | UserCapsule
  | TaskCapsule
  | ConversationCapsule
  | TeamCapsule;

/** Create input (omits server-generated fields) */
export interface CreateCapsuleInput {
  workspaceId: string;
  type: CapsuleType;
  name: string;
  description?: string;
  content: Record<string, unknown>;
  metadata?: Partial<CapsuleMetadata>;
  parentId?: string;
}

/** Update input */
export interface UpdateCapsuleInput {
  name?: string;
  description?: string;
  content?: Record<string, unknown>;
  metadata?: Partial<CapsuleMetadata>;
  isActive?: boolean;
}
