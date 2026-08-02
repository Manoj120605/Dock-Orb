// ============================================================
// Pipeline Types — AI Request Processing Pipeline
// ============================================================

import { ChatMessage, ChatCompletionResponse, TokenUsage, CostBreakdown } from './provider';
import { SkillMatch } from './skill';
import { CapsuleType } from './capsule';

/** Intent types recognized by the pipeline */
export type IntentType =
  | 'question'
  | 'code_generation'
  | 'code_review'
  | 'debugging'
  | 'refactoring'
  | 'documentation'
  | 'design_review'
  | 'architecture'
  | 'testing'
  | 'analysis'
  | 'engineering_calculation'
  | 'cad_design'
  | 'simulation'
  | 'threat_model'
  | 'research'
  | 'general';

/** Pipeline execution context — flows through all nodes */
export interface PipelineContext {
  /** Unique request ID */
  requestId: string;

  /** Workspace making the request */
  workspaceId: string;

  /** User making the request */
  userId: string;

  /** Conversation this request belongs to */
  conversationId: string;

  /** The original user message */
  userMessage: string;

  /** Detected intent */
  intent?: IntentClassification;

  /** Matched skills to inject */
  matchedSkills: SkillMatch[];

  /** Retrieved capsule context */
  capsuleContext: CapsuleContextItem[];

  /** Retrieved embedding results */
  embeddingResults: EmbeddingResult[];

  /** Optimized messages to send to the LLM */
  optimizedMessages: ChatMessage[];

  /** Selected model for this request */
  selectedModel?: ModelSelection;

  /** The LLM response */
  response?: ChatCompletionResponse;

  /** Token budget remaining */
  tokenBudget: number;

  /** Running cost for this request */
  cost: CostBreakdown;

  /** Usage tracking */
  usage: TokenUsage;

  /** Pipeline execution metadata */
  pipelineMetadata: PipelineMetadata;

  /** Errors encountered during pipeline execution */
  errors: PipelineError[];
}

/** Intent classification result */
export interface IntentClassification {
  type: IntentType;
  confidence: number;
  subType?: string;
  reasoning?: string;
}

/** Capsule context retrieved for a request */
export interface CapsuleContextItem {
  capsuleId: string;
  capsuleType: CapsuleType;
  section: string;
  content: string;
  relevanceScore: number;
  tokenCount: number;
}

/** Embedding search result */
export interface EmbeddingResult {
  id: string;
  content: string;
  score: number;
  source: string;
  metadata: Record<string, unknown>;
}

/** Model selection with reasoning */
export interface ModelSelection {
  modelId: string;
  provider: string;
  reason: string;
  estimatedCost: number;
  isOverride: boolean;
}

/** Pipeline execution metadata */
export interface PipelineMetadata {
  startedAt: string;
  completedAt?: string;
  totalDurationMs?: number;
  nodeTimings: NodeTiming[];
  cacheHit: boolean;
  cacheKey?: string;
  compressionRatio?: number;
  tokensSaved?: number;
}

/** Timing for individual pipeline nodes */
export interface NodeTiming {
  node: PipelineNodeName;
  startedAt: string;
  durationMs: number;
  status: 'success' | 'skipped' | 'error';
  metadata?: Record<string, unknown>;
}

/** All pipeline node names */
export type PipelineNodeName =
  | 'intent_detection'
  | 'skill_injection'
  | 'capsule_retrieval'
  | 'embedding_search'
  | 'context_optimization'
  | 'model_routing'
  | 'cache_check'
  | 'provider_call'
  | 'response_validation'
  | 'capsule_update'
  | 'cache_update';

/** Pipeline error */
export interface PipelineError {
  node: PipelineNodeName;
  message: string;
  code: string;
  timestamp: string;
  recoverable: boolean;
}

/** Pipeline configuration */
export interface PipelineConfig {
  /** Maximum token budget per request */
  maxTokenBudget: number;

  /** Semantic cache similarity threshold (0-1) */
  cacheThreshold: number;

  /** Number of conversation turns before auto-summarization */
  summarizationInterval: number;

  /** Number of embedding results to retrieve */
  embeddingTopK: number;

  /** Minimum relevance score for capsule context */
  minRelevanceScore: number;

  /** Enable/disable specific pipeline nodes */
  enabledNodes: Record<PipelineNodeName, boolean>;

  /** Model routing preference */
  routingPreference: 'cost' | 'quality' | 'speed' | 'balanced';
}

/** Default pipeline configuration */
export const DEFAULT_PIPELINE_CONFIG: PipelineConfig = {
  maxTokenBudget: 4096,
  cacheThreshold: 0.92,
  summarizationInterval: 5,
  embeddingTopK: 5,
  minRelevanceScore: 0.7,
  enabledNodes: {
    intent_detection: true,
    skill_injection: true,
    capsule_retrieval: true,
    embedding_search: true,
    context_optimization: true,
    model_routing: true,
    cache_check: true,
    provider_call: true,
    response_validation: true,
    capsule_update: true,
    cache_update: true,
  },
  routingPreference: 'balanced',
};

/** WebSocket events for real-time communication */
export interface WSEvents {
  /** Client → Server */
  'chat:message': { conversationId: string; content: string; model?: string };
  'chat:cancel': { requestId: string };
  'capsule:subscribe': { capsuleId: string };

  /** Server → Client */
  'chat:stream': StreamEvent;
  'chat:complete': ChatCompleteEvent;
  'chat:error': { requestId: string; error: string };
  'capsule:updated': { capsuleId: string; version: number };
  'pipeline:progress': PipelineProgressEvent;
}

/** Streaming event sent to client */
export interface StreamEvent {
  requestId: string;
  delta: string;
  model: string;
  provider: string;
}

/** Chat completion event */
export interface ChatCompleteEvent {
  requestId: string;
  messageId: string;
  usage: TokenUsage;
  cost: CostBreakdown;
  model: string;
  provider: string;
  cached: boolean;
  skillsUsed: string[];
  pipelineMetadata: PipelineMetadata;
}

/** Pipeline progress event for UI feedback */
export interface PipelineProgressEvent {
  requestId: string;
  node: PipelineNodeName;
  status: 'started' | 'completed' | 'skipped' | 'error';
  message?: string;
}
