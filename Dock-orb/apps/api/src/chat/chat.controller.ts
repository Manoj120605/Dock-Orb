import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChatService } from './chat.service';

@ApiTags('Chat')
@Controller('chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post('conversations')
  @ApiOperation({ summary: 'Create a new conversation' })
  async createConversation(@Request() req: any, @Body() body: { workspaceId: string; capsuleId?: string; title?: string }) {
    const conv = await this.chatService.createConversation(
      body.workspaceId,
      req.user.sub,
      body.capsuleId,
      body.title
    );
    return { success: true, data: conv };
  }

  @Get('workspaces/:workspaceId/conversations')
  @ApiOperation({ summary: 'List conversations for a workspace' })
  async listConversations(@Request() req: any, @Param('workspaceId') workspaceId: string) {
    const convs = await this.chatService.getConversations(workspaceId, req.user.sub);
    return { success: true, data: convs };
  }

  @Get('conversations/:id')
  @ApiOperation({ summary: 'Get a specific conversation with messages' })
  async getConversation(@Request() req: any, @Param('id') id: string) {
    const conv = await this.chatService.getConversation(id, req.user.sub);
    return { success: true, data: conv };
  }
}
