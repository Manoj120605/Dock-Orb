export type ProviderName = 'openai' | 'anthropic' | 'gemini' | 'nvidia' | 'ollama' | 'lmstudio' | 'groq' | 'together' | 'openrouter';
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
export type ModelCapability = 'chat' | 'code_generation' | 'code_review' | 'reasoning' | 'vision' | 'function_calling' | 'long_context' | 'fast_inference' | 'creative_writing' | 'analysis' | 'engineering' | 'summarization' | 'embedding';
export interface RoutingRules {
    taskTypeOverrides?: Record<string, string>;
    maxCostPerRequest?: number;
    preferredModels?: string[];
    fallbackChain?: string[];
    preferLocal?: boolean;
}
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
export interface ChatMessage {
    role: 'system' | 'user' | 'assistant' | 'tool';
    content: string | ContentPart[];
    name?: string;
    toolCallId?: string;
    toolCalls?: ToolCall[];
}
export interface ContentPart {
    type: 'text' | 'image_url';
    text?: string;
    imageUrl?: {
        url: string;
        detail?: 'low' | 'high' | 'auto';
    };
}
export interface ToolDefinition {
    type: 'function';
    function: {
        name: string;
        description: string;
        parameters: Record<string, unknown>;
    };
}
export interface ToolCall {
    id: string;
    type: 'function';
    function: {
        name: string;
        arguments: string;
    };
}
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
export interface TokenUsage {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    cachedTokens?: number;
}
export interface CostBreakdown {
    inputCost: number;
    outputCost: number;
    totalCost: number;
    currency: 'USD';
    savings?: number;
}
export interface StreamChunk {
    id: string;
    delta: string;
    model: string;
    provider: ProviderName;
    finishReason?: 'stop' | 'length' | 'tool_calls';
    usage?: TokenUsage;
}
export interface ProviderHealth {
    provider: ProviderName;
    status: 'healthy' | 'degraded' | 'down';
    latencyMs: number;
    lastChecked: string;
    errorMessage?: string;
}
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
export interface CreateProviderInput {
    provider: ProviderName;
    displayName: string;
    apiKey: string;
    baseUrl?: string;
    models?: ModelInfo[];
    priority?: number;
    routingRules?: RoutingRules;
}
