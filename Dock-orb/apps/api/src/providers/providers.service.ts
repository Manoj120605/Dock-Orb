import { Injectable } from '@nestjs/common';
import { LiteLLMClient } from './litellm.client';
import { ModelRouterService } from './model-router.service';
import { ChatCompletionRequest, IntentType } from '@capsule-ai/shared-types';

@Injectable()
export class ProvidersService {
  constructor(
    private litellmClient: LiteLLMClient,
    private modelRouter: ModelRouterService,
  ) {}

  async generateResponse(request: ChatCompletionRequest, intent: IntentType = 'general') {
    // 1. Route to correct model if not explicitly provided
    const selection = this.modelRouter.routeTask(intent, request.model);
    
    // 2. Override model based on routing
    request.model = selection.modelId;

    // 3. Call LiteLLM
    return this.litellmClient.createChatCompletion(request);
  }

  async streamResponse(request: ChatCompletionRequest, intent: IntentType = 'general', onChunk: (chunk: any) => void) {
    const selection = this.modelRouter.routeTask(intent, request.model);
    request.model = selection.modelId;
    return this.litellmClient.streamChatCompletion(request, onChunk);
  }
}
