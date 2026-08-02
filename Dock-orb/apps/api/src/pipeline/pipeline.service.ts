import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { 
  PipelineContext, IntentType, PipelineConfig, DEFAULT_PIPELINE_CONFIG, 
  ChatMessage, StreamEvent, ChatCompleteEvent, PipelineProgressEvent
} from '@capsule-ai/shared-types';
import { CapsulesService } from '../capsules/capsules.service';
import { ProvidersService } from '../providers/providers.service';
import { ContextOptimizerService } from '../optimizer/context-optimizer.service';
import { SemanticCacheService } from '../optimizer/cache.service';
import { CostOptimizerService } from '../optimizer/cost-optimizer.service';
import { TokenCounterService } from '../optimizer/token-counter.service';

@Injectable()
export class PipelineService {
  private readonly logger = new Logger(PipelineService.name);

  constructor(
    private capsulesService: CapsulesService,
    private providersService: ProvidersService,
    private contextOptimizer: ContextOptimizerService,
    private cacheService: SemanticCacheService,
    private costOptimizer: CostOptimizerService,
    private tokenCounter: TokenCounterService,
  ) {}

  /**
   * Main entry point for the graph-based pipeline processing.
   * This handles both streaming and non-streaming modes.
   */
  async executePipeline(
    workspaceId: string,
    userId: string,
    conversationId: string,
    userMessage: string,
    history: ChatMessage[],
    activeCapsuleIds: string[],
    requestedModel?: string,
    config: PipelineConfig = DEFAULT_PIPELINE_CONFIG,
    onProgress?: (event: PipelineProgressEvent) => void,
    onStream?: (event: StreamEvent) => void,
  ): Promise<ChatCompleteEvent> {
    const requestId = uuidv4();
    const startTime = Date.now();
    
    // Initialize state
    const context: PipelineContext = {
      requestId,
      workspaceId,
      userId,
      conversationId,
      userMessage,
      matchedSkills: [],
      capsuleContext: [],
      embeddingResults: [],
      optimizedMessages: [],
      tokenBudget: config.maxTokenBudget,
      cost: { inputCost: 0, outputCost: 0, totalCost: 0, currency: 'USD' },
      usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
      pipelineMetadata: { startedAt: new Date().toISOString(), nodeTimings: [], cacheHit: false },
      errors: [],
    };

    try {
      // ---- Node 1: Intent Detection ----
      await this.runNode(context, 'intent_detection', onProgress, async () => {
        // Mocked for MVP - usually calls small local model or rule engine
        context.intent = { type: 'general', confidence: 0.8 };
      });

      // ---- Node 2: Skill Injection ----
      await this.runNode(context, 'skill_injection', onProgress, async () => {
        // Fetch active skills for workspace (Mocked for MVP)
        // context.matchedSkills = await this.skillsService.matchSkills(context.userMessage, workspaceId);
      });

      // ---- Node 3: Capsule Retrieval ----
      await this.runNode(context, 'capsule_retrieval', onProgress, async () => {
        const contexts = await this.capsulesService.getContextForConversation(
          workspaceId, userId, activeCapsuleIds[0]
        );
        context.capsuleContext = contexts.map(c => ({
          capsuleId: c.capsuleId,
          capsuleType: c.type,
          section: c.section,
          content: c.content,
          relevanceScore: 1.0, // Exact match from active capsules
          tokenCount: this.tokenCounter.countString(c.content),
        }));
      });

      // ---- Node 4: Embedding Search ----
      // Skip for MVP unless requested

      // ---- Node 5: Context Optimization ----
      await this.runNode(context, 'context_optimization', onProgress, async () => {
        let systemPrompt = `You are Capsule AI, a domain-agnostic AI workspace assistant.\n\n`;
        
        if (context.capsuleContext.length > 0) {
          systemPrompt += `=== CAPSULE CONTEXT ===\n`;
          context.capsuleContext.forEach(c => {
            systemPrompt += `[${c.capsuleType}] ${c.section}:\n${c.content}\n\n`;
          });
        }

        const currentMsg: ChatMessage = { role: 'user', content: userMessage };
        
        context.optimizedMessages = this.contextOptimizer.optimizeContext(
          systemPrompt,
          history,
          currentMsg,
          context.tokenBudget,
          requestedModel || 'gpt-4o' // default for sizing
        );
      });

      // ---- Node 6: Cache Check ----
      let cacheHit = false;
      await this.runNode(context, 'cache_check', onProgress, async () => {
        const cacheKey = this.cacheService.generateCacheKey(workspaceId, context.optimizedMessages, activeCapsuleIds);
        context.pipelineMetadata.cacheKey = cacheKey;
        
        const cachedResponse = await this.cacheService.getCachedResponse(cacheKey);
        if (cachedResponse) {
          context.response = cachedResponse;
          context.pipelineMetadata.cacheHit = true;
          cacheHit = true;
          
          if (onStream) {
            // Simulate stream if cached
            onStream({
              requestId,
              delta: typeof cachedResponse.message.content === 'string' ? cachedResponse.message.content : '',
              model: cachedResponse.model,
              provider: cachedResponse.provider,
            });
          }
        }
      });

      // ---- Node 7 & 8: Model Routing & Provider Call ----
      if (!cacheHit) {
        await this.runNode(context, 'provider_call', onProgress, async () => {
          if (onStream) {
            let fullContent = '';
            let finalModel = requestedModel || 'unknown';
            let finalProvider = 'unknown';

            await this.providersService.streamResponse(
              {
                model: requestedModel,
                messages: context.optimizedMessages,
                metadata: { workspaceId, userId, conversationId, skillsUsed: [], intentType: context.intent?.type || 'general' }
              },
              context.intent?.type,
              (chunk) => {
                const delta = chunk.choices[0]?.delta?.content || '';
                fullContent += delta;
                finalModel = chunk.model || finalModel;
                finalProvider = chunk._hidden_params?.custom_llm_provider || finalProvider;
                
                onStream({
                  requestId,
                  delta,
                  model: finalModel,
                  provider: finalProvider,
                });
              }
            );

            // Mock usage for streaming (LiteLLM doesn't always return this on stream end depending on config)
            const inputTokens = this.tokenCounter.countMessages(context.optimizedMessages, finalModel);
            const outputTokens = this.tokenCounter.countString(fullContent, finalModel);
            
            context.response = {
              id: uuidv4(),
              model: finalModel,
              provider: finalProvider as any,
              message: { role: 'assistant', content: fullContent },
              usage: { inputTokens, outputTokens, totalTokens: inputTokens + outputTokens },
              cost: { inputCost: 0, outputCost: 0, totalCost: 0, currency: 'USD' },
              cached: false,
              responseTimeMs: Date.now() - startTime,
              finishReason: 'stop',
            };
          } else {
            context.response = await this.providersService.generateResponse(
              {
                model: requestedModel,
                messages: context.optimizedMessages,
                metadata: { workspaceId, userId, conversationId, skillsUsed: [], intentType: context.intent?.type || 'general' }
              },
              context.intent?.type
            );
          }
        });
      }

      // ---- Node 9: Capsule Update ----
      // Scheduled in background or based on turn count. Skipped here for latency.

      // ---- Node 10: Cache Update ----
      if (!cacheHit && context.response && context.pipelineMetadata.cacheKey) {
        // Fire and forget
        this.cacheService.cacheResponse(
          context.pipelineMetadata.cacheKey,
          userMessage,
          context.response
        ).catch(e => this.logger.warn(`Failed to update cache: ${e.message}`));
      }

      context.pipelineMetadata.completedAt = new Date().toISOString();
      context.pipelineMetadata.totalDurationMs = Date.now() - startTime;

      // Log usage
      if (context.response) {
        await this.costOptimizer.recordUsage(
          workspaceId,
          userId,
          context.response.provider,
          context.response.model,
          context.response.usage.inputTokens,
          context.response.usage.outputTokens,
          context.response.usage.totalTokens,
          context.response.cost.totalCost,
          context.response.cached,
          context.response.responseTimeMs,
          context.matchedSkills.map(s => s.skill.id),
          context.intent?.type
        );
      }

      return {
        requestId,
        messageId: context.response!.id,
        usage: context.response!.usage,
        cost: context.response!.cost,
        model: context.response!.model,
        provider: context.response!.provider,
        cached: context.response!.cached,
        skillsUsed: context.matchedSkills.map(s => s.skill.id),
        pipelineMetadata: context.pipelineMetadata,
      };

    } catch (error: any) {
      this.logger.error(`Pipeline failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async runNode(
    context: PipelineContext,
    nodeName: string,
    onProgress: ((event: PipelineProgressEvent) => void) | undefined,
    execute: () => Promise<void>
  ) {
    const start = Date.now();
    if (onProgress) {
      onProgress({ requestId: context.requestId, node: nodeName as any, status: 'started' });
    }

    try {
      await execute();
      const duration = Date.now() - start;
      
      context.pipelineMetadata.nodeTimings.push({
        node: nodeName as any,
        startedAt: new Date(start).toISOString(),
        durationMs: duration,
        status: 'success'
      });

      if (onProgress) {
        onProgress({ requestId: context.requestId, node: nodeName as any, status: 'completed' });
      }
    } catch (error: any) {
      const duration = Date.now() - start;
      context.pipelineMetadata.nodeTimings.push({
        node: nodeName as any,
        startedAt: new Date(start).toISOString(),
        durationMs: duration,
        status: 'error',
        metadata: { error: error.message }
      });
      
      if (onProgress) {
        onProgress({ requestId: context.requestId, node: nodeName as any, status: 'error', message: error.message });
      }
      throw error;
    }
  }
}
