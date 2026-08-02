import { Controller, Get, Post, Body, Param, Request } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ChatService } from './chat.service';

import { McpService } from '../automation/mcp.service';
import { LlmService } from './llm.service';

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
  constructor(
    private chatService: ChatService,
    private mcpService: McpService,
    private llmService: LlmService
  ) {}

  @Post('conversations')
  @ApiOperation({ summary: 'Create a new conversation' })
  async createConversation(@Request() req: any, @Body() body: { workspaceId: string; capsuleId?: string; title?: string }) {
    const conv = await this.chatService.createConversation(
      body.workspaceId,
      req.user?.sub || 'default-user',
      body.capsuleId,
      body.title
    );
    return { success: true, data: conv };
  }

  @Get('workspaces/:workspaceId/conversations')
  @ApiOperation({ summary: 'List conversations for a workspace' })
  async listConversations(@Request() req: any, @Param('workspaceId') workspaceId: string) {
    const convs = await this.chatService.getConversations(workspaceId, req.user?.sub || 'default-user');
    return { success: true, data: convs };
  }

  @Get('conversations/:id')
  @ApiOperation({ summary: 'Get a specific conversation with messages' })
  async getConversation(@Request() req: any, @Param('id') id: string) {
    const conv = await this.chatService.getConversation(id, req.user?.sub || 'default-user');
    return { success: true, data: conv };
  }

  @Post('message')
  @ApiOperation({ summary: 'Send a message and get LLM response' })
  async sendMessage(
    @Request() req: any,
    @Body() body: { workspaceId: string; conversationId: string; message: string }
  ) {
    const userId = req.user?.sub || 'default-user';

    // 0. Ensure workspace + user exist (idempotent)
    await (this.chatService as any).prisma.workspace.upsert({
      where: { id: body.workspaceId },
      create: { id: body.workspaceId, name: 'Default Workspace', settings: {} },
      update: {},
    });
    await (this.chatService as any).prisma.user.upsert({
      where: { id: userId },
      create: { id: userId, email: `${userId}@local.dock-orb`, name: 'Local User', passwordHash: 'local' },
      update: {},
    });

    // 1. Ensure conversation exists (upsert pattern)
    try {
      await this.chatService.getConversation(body.conversationId, userId);
    } catch {
      await this.chatService.createConversation(body.workspaceId, userId, undefined, 'New Chat', body.conversationId);
    }

    // 1. Save user message
    await this.chatService.saveMessage(body.conversationId, 'USER', body.message);

    // 2. Build message history for LLM
    const history = (await this.chatService.getHistoryForLLM(body.conversationId)) as any;

    // 3. Get raw (unmasked) credentials
    const rawConfig = await this.mcpService.getRawConfig(body.workspaceId);

    if (!rawConfig.aiApiKey) {
      return {
        success: false,
        message: 'No AI API key configured. Please save your key in the Automations tab.',
      };
    }

    // 4. Call LLM (handles provider detection internally)
    let llmResponse: { response: string; usage?: any };
    try {
      llmResponse = await this.llmService.generateResponse(
        history,
        rawConfig.aiApiKey,
        rawConfig.aiBaseUrl,
        rawConfig.providerHint,
      );
    } catch (e: any) {
      // Return error as a normal response so frontend can display it without crashing
      return {
        success: false,
        message: e.message || 'AI request failed',
      };
    }

    // 5. Save and return AI response
    const aiMessage = await this.chatService.saveMessage(
      body.conversationId,
      'ASSISTANT',
      llmResponse.response,
      { usage: llmResponse.usage },
    );

    return { success: true, data: aiMessage };
  }
}

