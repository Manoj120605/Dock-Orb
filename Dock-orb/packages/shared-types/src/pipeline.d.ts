import { ChatMessage, ChatCompletionResponse, TokenUsage, CostBreakdown } from './provider';
import { SkillMatch } from './skill';
import { CapsuleType } from './capsule';
export type IntentType = 'question' | 'code_generation' | 'code_review' | 'debugging' | 'refactoring' | 'documentation' | 'design_review' | 'architecture' | 'testing' | 'analysis' | 'engineering_calculation' | 'cad_design' | 'simulation' | 'threat_model' | 'research' | 'general';
export interface PipelineContext {
    requestId: string;
    workspaceId: string;
    userId: string;
    conversationId: string;
    userMessage: string;
    intent?: IntentClassification;
    matchedSkills: SkillMatch[];
    capsuleContext: CapsuleContextItem[];
    embeddingResults: EmbeddingResult[];
    optimizedMessages: ChatMessage[];
    selectedModel?: ModelSelection;
    response?: ChatCompletionResponse;
    tokenBudget: number;
    cost: CostBreakdown;
    usage: TokenUsage;
    pipelineMetadata: PipelineMetadata;
    errors: PipelineError[];
}
export interface IntentClassification {
    type: IntentType;
    confidence: number;
    subType?: string;
    reasoning?: string;
}
export interface CapsuleContextItem {
    capsuleId: string;
    capsuleType: CapsuleType;
    section: string;
    content: string;
    relevanceScore: number;
    tokenCount: number;
}
export interface EmbeddingResult {
    id: string;
    content: string;
    score: number;
    source: string;
    metadata: Record<string, unknown>;
}
export interface ModelSelection {
    modelId: string;
    provider: string;
    reason: string;
    estimatedCost: number;
    isOverride: boolean;
}
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
export interface NodeTiming {
    node: PipelineNodeName;
    startedAt: string;
    durationMs: number;
    status: 'success' | 'skipped' | 'error';
    metadata?: Record<string, unknown>;
}
export type PipelineNodeName = 'intent_detection' | 'skill_injection' | 'capsule_retrieval' | 'embedding_search' | 'context_optimization' | 'model_routing' | 'cache_check' | 'provider_call' | 'response_validation' | 'capsule_update' | 'cache_update';
export interface PipelineError {
    node: PipelineNodeName;
    message: string;
    code: string;
    timestamp: string;
    recoverable: boolean;
}
export interface PipelineConfig {
    maxTokenBudget: number;
    cacheThreshold: number;
    summarizationInterval: number;
    embeddingTopK: number;
    minRelevanceScore: number;
    enabledNodes: Record<PipelineNodeName, boolean>;
    routingPreference: 'cost' | 'quality' | 'speed' | 'balanced';
}
export declare const DEFAULT_PIPELINE_CONFIG: PipelineConfig;
export interface WSEvents {
    'chat:message': {
        conversationId: string;
        content: string;
        model?: string;
    };
    'chat:cancel': {
        requestId: string;
    };
    'capsule:subscribe': {
        capsuleId: string;
    };
    'chat:stream': StreamEvent;
    'chat:complete': ChatCompleteEvent;
    'chat:error': {
        requestId: string;
        error: string;
    };
    'capsule:updated': {
        capsuleId: string;
        version: number;
    };
    'pipeline:progress': PipelineProgressEvent;
}
export interface StreamEvent {
    requestId: string;
    delta: string;
    model: string;
    provider: string;
}
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
export interface PipelineProgressEvent {
    requestId: string;
    node: PipelineNodeName;
    status: 'started' | 'completed' | 'skipped' | 'error';
    message?: string;
}
