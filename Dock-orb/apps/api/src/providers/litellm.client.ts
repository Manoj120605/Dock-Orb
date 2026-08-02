import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { 
  ChatCompletionRequest, 
  ChatCompletionResponse, 
  TokenUsage, 
  CostBreakdown 
} from '@capsule-ai/shared-types';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LiteLLMClient {
  private readonly logger = new Logger(LiteLLMClient.name);
  private readonly axios: AxiosInstance;

  constructor(private configService: ConfigService) {
    const baseURL = this.configService.get<string>('LITELLM_URL', 'http://localhost:4000');
    const masterKey = this.configService.get<string>('LITELLM_MASTER_KEY');
    
    this.axios = axios.create({
      baseURL,
      headers: {
        'Authorization': `Bearer ${masterKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async createChatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const startTime = Date.now();
    try {
      const response = await this.axios.post('/chat/completions', {
        model: request.model,
        messages: request.messages,
        temperature: request.temperature,
        max_tokens: request.maxTokens,
        top_p: request.topP,
        tools: request.tools,
        metadata: request.metadata,
        stream: false,
      });

      const data = response.data;
      const responseTimeMs = Date.now() - startTime;

      // Extract LiteLLM specific cost/usage fields or calculate defaults
      const usage: TokenUsage = {
        inputTokens: data.usage?.prompt_tokens || 0,
        outputTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
        cachedTokens: data.usage?.prompt_tokens_details?.cached_tokens || 0,
      };

      // LiteLLM injects cost data if configured
      const cost: CostBreakdown = {
        inputCost: data._hidden_params?.response_cost || 0, // Simplified for MVP
        outputCost: 0,
        totalCost: data._hidden_params?.response_cost || 0,
        currency: 'USD',
      };

      const finishReason = data.choices[0]?.finish_reason || 'stop';

      return {
        id: data.id || uuidv4(),
        model: data.model || request.model,
        provider: data._hidden_params?.custom_llm_provider || 'unknown',
        message: data.choices[0]?.message,
        usage,
        cost,
        cached: data._hidden_params?.cache_hit || false,
        responseTimeMs,
        finishReason,
      };
    } catch (error: any) {
      this.logger.error(`Failed to call LiteLLM: ${error.message}`);
      throw error;
    }
  }

  // MVP streaming function
  async streamChatCompletion(request: ChatCompletionRequest, onChunk: (chunk: any) => void): Promise<void> {
    try {
      const response = await this.axios.post('/chat/completions', {
        model: request.model,
        messages: request.messages,
        temperature: request.temperature,
        max_tokens: request.maxTokens,
        stream: true,
        metadata: request.metadata,
      }, {
        responseType: 'stream'
      });

      return new Promise((resolve, reject) => {
        response.data.on('data', (chunk: Buffer) => {
          const lines = chunk.toString().split('\n').filter(line => line.trim() !== '');
          for (const line of lines) {
            if (line === 'data: [DONE]') {
              resolve();
              return;
            }
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                onChunk(data);
              } catch (e) {
                // Ignore parse errors on partial chunks
              }
            }
          }
        });
        
        response.data.on('error', (err: any) => reject(err));
        response.data.on('end', () => resolve());
      });
    } catch (error: any) {
      this.logger.error(`Failed to stream from LiteLLM: ${error.message}`);
      throw error;
    }
  }
}
