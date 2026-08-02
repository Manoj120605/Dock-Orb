// ============================================================
// Provider Types — Model-Agnostic Provider Abstraction
// ============================================================

/** Supported AI providers */
export type ProviderName =
  | 'openai'
  | 'anthropic'
  | 'gemini'
  | 'nvidia'
  | 'ollama'
  | 'lmstudio'
  | 'groq'
  | 'together'
  | 'openrouter';

/** Provider configuration stored per workspace */
export interface ProviderConfig {
  id: string;
  workspaceId: string;
  provider: ProviderName;
  displayName: string;
  apiKey: string;
  baseUrl?: string;
  models: ModelInfo[];
  isEnabled: boolean;
  priority: number;
  routingRules: RoutingRules;
  createdAt: string;
  updatedAt: string;
}

/** Information about a specific model */
export interface ModelInfo {
  id: string;
  name: string;
  provider: ProviderName;
  capabilities: ModelCapability[];
  contextWindow: number;
  maxOutputTokens: number;
  inputCostPer1k: number;
  outputCostPer1k: number;
  isLocal: boolean;
  supportsStreaming: boolean;
  supportsVision: boolean;
  supportsFunctionCalling: boolean;
}

/** Model capabilities for routing */
export type ModelCapability =
  | 'chat'
  | 'code_generation'
  | 'code_review'
  | 'reasoning'
  | 'vision'
  | 'function_calling'
  | 'long_context'
  | 'fast_inference'
  | 'creative_writing'
  | 'analysis'
  | 'engineering'
  | 'summarization'
  | 'embedding';

/** Routing rules for model selection */
export interface RoutingRules {
  /** Task type to model mapping overrides */
  taskTypeOverrides?: Record<string, string>;

  /** Maximum cost per request in USD */
  maxCostPerRequest?: number;

  /** Preferred models (in order of preference) */
  preferredModels?: string[];

  /** Fallback chain */
  fallbackChain?: string[];

  /** Use local models first when possible */
  preferLocal?: boolean;
}

/** Unified chat completion request (provider-agnostic) */
export interface ChatCompletionRequest {
  model?: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stream?: boolean;
  tools?: ToolDefinition[];
  responseFormat?: 'text' | 'json';
  metadata?: {
    workspaceId: string;
    userId: string;
    conversationId: string;
    skillsUsed: string[];
    intentType: string;
  };
}

/** Unified chat message */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | ContentPart[];
  name?: string;
  toolCallId?: string;
  toolCalls?: ToolCall[];
}

/** Multi-modal content part */
export interface ContentPart {
  type: 'text' | 'image_url';
  text?: string;
  imageUrl?: {
    url: string;
    detail?: 'low' | 'high' | 'auto';
  };
}

/** Tool definition for function calling */
export interface ToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

/** Tool call from assistant */
export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

/** Unified chat completion response */
export interface ChatCompletionResponse {
  id: string;
  model: string;
  provider: ProviderName;
  message: ChatMessage;
  usage: TokenUsage;
  cost: CostBreakdown;
  cached: boolean;
  responseTimeMs: number;
  finishReason: 'stop' | 'length' | 'tool_calls' | 'error';
}

/** Token usage details */
export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cachedTokens?: number;
}

/** Cost breakdown */
export interface CostBreakdown {
  inputCost: number;
  outputCost: number;
  totalCost: number;
  currency: 'USD';
  savings?: number;
}

/** Streaming chunk */
export interface StreamChunk {
  id: string;
  delta: string;
  model: string;
  provider: ProviderName;
  finishReason?: 'stop' | 'length' | 'tool_calls';
  usage?: TokenUsage;
}

/** Provider health status */
export interface ProviderHealth {
  provider: ProviderName;
  status: 'healthy' | 'degraded' | 'down';
  latencyMs: number;
  lastChecked: string;
  errorMessage?: string;
}

/** Usage metrics for analytics */
export interface UsageMetrics {
  period: 'hour' | 'day' | 'week' | 'month';
  startDate: string;
  endDate: string;
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  cacheHitRate: number;
  tokensSaved: number;
  costSaved: number;
  byProvider: Record<ProviderName, ProviderMetrics>;
  byModel: Record<string, ModelMetrics>;
}

export interface ProviderMetrics {
  requests: number;
  tokens: number;
  cost: number;
  avgLatency: number;
  errorRate: number;
}

export interface ModelMetrics {
  requests: number;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  avgLatency: number;
}

/** Input for configuring a new provider */
export interface CreateProviderInput {
  provider: ProviderName;
  displayName: string;
  apiKey: string;
  baseUrl?: string;
  models?: ModelInfo[];
  priority?: number;
  routingRules?: RoutingRules;
}
