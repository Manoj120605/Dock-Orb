import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChatMessage } from '@capsule-ai/shared-types';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async createConversation(workspaceId: string, userId: string, capsuleId?: string, title?: string) {
    return this.prisma.conversation.create({
      data: {
        workspaceId,
        userId,
        capsuleId,
        title: title || 'New Conversation',
      },
    });
  }

  async getConversation(id: string, userId: string) {
    const conv = await this.prisma.conversation.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!conv || conv.userId !== userId) {
      throw new NotFoundException('Conversation not found');
    }

    return conv;
  }

  async getConversations(workspaceId: string, userId: string) {
    return this.prisma.conversation.findMany({
      where: { workspaceId, userId },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    });
  }

  async saveMessage(
    conversationId: string,
    role: 'USER' | 'ASSISTANT' | 'SYSTEM' | 'TOOL',
    content: string,
    metadata?: any
  ) {
    return this.prisma.message.create({
      data: {
        conversationId,
        role,
        content,
        metadata: metadata || {},
        tokensUsed: metadata?.usage?.totalTokens,
        cost: metadata?.cost?.totalCost,
        modelUsed: metadata?.model,
        providerUsed: metadata?.provider,
        cached: metadata?.cached || false,
        skillsUsed: metadata?.skillsUsed || [],
      },
    });
  }

  async updateConversationTitle(id: string, title: string) {
    return this.prisma.conversation.update({
      where: { id },
      data: { title },
    });
  }

  /** Gets history formatted for LLM ingestion */
  async getHistoryForLLM(conversationId: string, limit: number = 20): Promise<ChatMessage[]> {
    const messages = await this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // Reverse to chronological order
    return messages.reverse().map(m => ({
      role: m.role.toLowerCase() as any,
      content: m.content,
    }));
  }
}
