import { Injectable } from '@nestjs/common';
import { ChatMessage } from '@capsule-ai/shared-types';
import { TokenCounterService } from './token-counter.service';

@Injectable()
export class ContextOptimizerService {
  constructor(private tokenCounter: TokenCounterService) {}

  /**
   * Compresses the message history and capsule context to fit within the budget.
   * Basic MVP implementation: truncates older messages if budget exceeded.
   */
  optimizeContext(
    systemPrompt: string,
    history: ChatMessage[],
    currentMessage: ChatMessage,
    budget: number,
    model: string
  ): ChatMessage[] {
    const systemTokens = this.tokenCounter.countString(systemPrompt, model);
    const currentMsgTokens = this.tokenCounter.countMessages([currentMessage], model);
    
    let remainingBudget = budget - systemTokens - currentMsgTokens;
    if (remainingBudget < 0) {
      // Extreme case: current message + system prompt exceed budget
      // Return minimal context
      return [
        { role: 'system', content: systemPrompt },
        currentMessage
      ];
    }

    const optimizedHistory: ChatMessage[] = [];
    
    // Add messages from newest to oldest until budget is reached
    for (let i = history.length - 1; i >= 0; i--) {
      const msg = history[i];
      const msgTokens = this.tokenCounter.countMessages([msg], model);
      if (remainingBudget - msgTokens > 0) {
        optimizedHistory.unshift(msg);
        remainingBudget -= msgTokens;
      } else {
        break; // Budget exhausted
      }
    }

    return [
      { role: 'system', content: systemPrompt },
      ...optimizedHistory,
      currentMessage
    ];
  }
}
