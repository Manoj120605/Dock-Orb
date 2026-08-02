import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';
import { ChatCompletionResponse } from '@capsule-ai/shared-types';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SemanticCacheService {
  private readonly logger = new Logger(SemanticCacheService.name);
  private readonly aiServicesUrl: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.aiServicesUrl = this.configService.get<string>('AI_SERVICES_URL', 'http://localhost:8000');
  }

  /**
   * Generates a hash for the context + current message.
   * For MVP, we use exact hash matching. 
   * Semantic matching (via embeddings) will be implemented in Python side via Qdrant.
   */
  generateCacheKey(workspaceId: string, messages: any[], activeCapsuleIds: string[]): string {
    const data = JSON.stringify({
      workspaceId,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      activeCapsuleIds: activeCapsuleIds.sort(),
    });
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  async getCachedResponse(queryHash: string): Promise<ChatCompletionResponse | null> {
    const cached = await this.prisma.semanticCache.findUnique({
      where: { queryHash },
    });

    if (!cached || cached.expiresAt < new Date()) {
      if (cached) {
        await this.prisma.semanticCache.delete({ where: { queryHash } });
      }
      return null;
    }

    // Increment hit count
    await this.prisma.semanticCache.update({
      where: { queryHash },
      data: { hitCount: { increment: 1 } },
    });

    const parsedResponse = JSON.parse(cached.response) as ChatCompletionResponse;
    parsedResponse.cached = true;
    return parsedResponse;
  }

  async cacheResponse(
    queryHash: string, 
    queryText: string,
    response: ChatCompletionResponse,
    ttlSeconds: number = 3600 * 24 // 24 hours
  ): Promise<void> {
    try {
      // 1. In background, generate embedding for semantic search via AI service
      // (Mocked for MVP, normally we'd call the FastAPI service)
      const queryEmbeddingId = `mock_vec_${Date.now()}`; 

      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + ttlSeconds);

      await this.prisma.semanticCache.upsert({
        where: { queryHash },
        update: {
          response: JSON.stringify(response),
          expiresAt,
        },
        create: {
          queryHash,
          queryEmbedding: queryEmbeddingId,
          response: JSON.stringify(response),
          expiresAt,
        },
      });
    } catch (e: any) {
      this.logger.error(`Failed to cache response: ${e.message}`);
    }
  }
}
