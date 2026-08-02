import { Injectable } from '@nestjs/common';
import { encodingForModel, TiktokenModel } from 'js-tiktoken';
import { ChatMessage } from '@capsule-ai/shared-types';

@Injectable()
export class TokenCounterService {
  countString(text: string, model: string = 'gpt-4o'): number {
    try {
      // js-tiktoken maps gpt-4o to o200k_base encoding
      const encoder = encodingForModel((model as TiktokenModel) || 'gpt-4');
      const count = encoder.encode(text).length;
      return count;
    } catch {
      // Fallback approximation if model encoding is unknown: ~4 chars per token
      return Math.ceil(text.length / 4);
    }
  }

  countMessages(messages: ChatMessage[], model: string = 'gpt-4o'): number {
    let tokens = 0;
    for (const msg of messages) {
      // rough overhead per message
      tokens += 4; 
      if (typeof msg.content === 'string') {
        tokens += this.countString(msg.content, model);
      } else if (Array.isArray(msg.content)) {
        for (const part of msg.content) {
          if (part.type === 'text' && part.text) {
            tokens += this.countString(part.text, model);
          }
          // Images have fixed token costs depending on model/detail, roughly adding 85 tokens for low detail
          if (part.type === 'image_url') {
            tokens += 85; 
          }
        }
      }
    }
    // reply overhead
    tokens += 3;
    return tokens;
  }
}
