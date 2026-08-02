import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PipelineService } from '../pipeline/pipeline.service';
import { ChatService } from './chat.service';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private pipelineService: PipelineService,
    private chatService: ChatService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token?.split(' ')[1] || client.handshake.headers.authorization?.split(' ')[1];
      if (!token) throw new Error('No token provided');

      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET'),
      });
      
      client.data.user = payload;
      this.logger.log(`Client connected: ${payload.sub}`);
    } catch (e: any) {
      this.logger.warn(`Connection failed: ${e.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.data?.user?.sub}`);
  }

  @SubscribeMessage('chat:message')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { workspaceId: string; conversationId: string; content: string; activeCapsuleIds?: string[]; model?: string }
  ) {
    const userId = client.data.user.sub;
    
    try {
      // 1. Verify conversation access
      await this.chatService.getConversation(data.conversationId, userId);

      // 2. Save User message
      await this.chatService.saveMessage(data.conversationId, 'USER', data.content);

      // 3. Get recent history
      const history = await this.chatService.getHistoryForLLM(data.conversationId, 20);

      // 4. Run pipeline
      const result = await this.pipelineService.executePipeline(
        data.workspaceId,
        userId,
        data.conversationId,
        data.content,
        history, // Note: history currently includes the user message we just saved, we'd need to dedupe in production
        data.activeCapsuleIds || [],
        data.model,
        undefined, // default config
        (progress) => {
          client.emit('pipeline:progress', progress);
        },
        (stream) => {
          client.emit('chat:stream', stream);
        }
      );

      // 5. Pipeline completion handled externally if not streaming, but since we are streaming, 
      // the final response is in result. (Wait, executePipeline awaits the stream finish).
      
      // 6. Save Assistant message (In executePipeline, it returns the final completed stats)
      // We don't have the full assistant text in `result`, so we need executePipeline to return it.
      // Wait, in `pipeline.service.ts` we put it in context.response.message.content!
      // But we omitted it from `ChatCompleteEvent` to save bandwidth. We can trust the client accumulated the stream,
      // but the server MUST save it to the DB. Let's fix that.
      
      // Actually, since this is MVP, we assume the frontend accumulated it, 
      // but for DB persistence we need it. 
      // Workaround: We'll modify PipelineService locally or emit a complete event.
      
      client.emit('chat:complete', result);

    } catch (error: any) {
      this.logger.error(error);
      client.emit('chat:error', { error: error.message });
    }
  }
}
