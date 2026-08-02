// ============================================================
// @capsule-ai/shared-types — Public API
// ============================================================

// Capsule types
export type {
  CapsuleType,
  DomainType,
  BaseCapsule,
  CapsuleMetadata,
  ProjectCapsule,
  ProjectCapsuleContent,
  UserCapsule,
  UserCapsuleContent,
  TaskCapsule,
  TaskCapsuleContent,
  ConversationCapsule,
  ConversationCapsuleContent,
  TeamCapsule,
  TeamCapsuleContent,
  MechanicalCapsuleContent,
  ImportantFile,
  ApiEndpoint,
  ExternalApi,
  CompletedTask,
  Decision,
  KnownBug,
  TaskStep,
  CodeArtifact,
  QAPair,
  BOMItem,
  Revision,
  Capsule,
  CreateCapsuleInput,
  UpdateCapsuleInput,
} from './capsule';

// Skill types
export type {
  SkillDefinition,
  SkillContent,
  SkillSections,
  WorkspaceSkillEntry,
  SkillConfig,
  SkillMatch,
  SkillSearchInput,
} from './skill';

// Provider types
export type {
  ProviderName,
  ProviderConfig,
  ModelInfo,
  ModelCapability,
  RoutingRules,
  ChatCompletionRequest,
  ChatCompletionResponse,
  ChatMessage,
  ContentPart,
  ToolDefinition,
  ToolCall,
  TokenUsage,
  CostBreakdown,
  StreamChunk,
  ProviderHealth,
  UsageMetrics,
  ProviderMetrics,
  ModelMetrics,
  CreateProviderInput,
} from './provider';

// Pipeline types
export type {
  IntentType,
  PipelineContext,
  IntentClassification,
  CapsuleContextItem,
  EmbeddingResult,
  ModelSelection,
  PipelineMetadata,
  NodeTiming,
  PipelineNodeName,
  PipelineError,
  PipelineConfig,
  WSEvents,
  StreamEvent,
  ChatCompleteEvent,
  PipelineProgressEvent,
} from './pipeline';

export { DEFAULT_PIPELINE_CONFIG } from './pipeline';
