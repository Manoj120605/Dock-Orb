import { Injectable } from '@nestjs/common';
import { ModelSelection, IntentType } from '@capsule-ai/shared-types';

@Injectable()
export class ModelRouterService {
  // Hardcoded for MVP. In Phase 2, this will be driven by ProviderConfig from DB.
  
  routeTask(intent: IntentType, requestedModel?: string): ModelSelection {
    if (requestedModel) {
      return {
        modelId: requestedModel,
        provider: this.inferProvider(requestedModel),
        reason: 'User explicitly requested this model',
        estimatedCost: 0,
        isOverride: true,
      };
    }

    // Default routing logic based on intent
    switch (intent) {
      case 'code_generation':
      case 'refactoring':
      case 'architecture':
        return {
          modelId: 'gpt-4o', // or claude-sonnet
          provider: 'openai',
          reason: 'Complex coding task requires high reasoning model',
          estimatedCost: 0.01,
          isOverride: false,
        };
      
      case 'question':
      case 'documentation':
      case 'general':
      default:
        return {
          modelId: 'gpt-4o-mini', // or claude-haiku
          provider: 'openai',
          reason: 'Simple task routed to faster/cheaper model',
          estimatedCost: 0.001,
          isOverride: false,
        };
    }
  }

  private inferProvider(model: string): string {
    if (model.includes('gpt')) return 'openai';
    if (model.includes('claude')) return 'anthropic';
    if (model.includes('gemini')) return 'google';
    if (model.includes('llama') && model.includes('groq')) return 'groq';
    if (model.includes('ollama')) return 'ollama';
    return 'unknown';
  }
}
