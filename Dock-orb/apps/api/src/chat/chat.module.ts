import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { LlmService } from './llm.service';
import { PipelineModule } from '../pipeline/pipeline.module';
import { AuthModule } from '../auth/auth.module';
import { AutomationModule } from '../automation/automation.module';
import { ChatController } from './chat.controller';

@Module({
  imports: [PipelineModule, AuthModule, AutomationModule],
  providers: [ChatGateway, ChatService, LlmService],
  controllers: [ChatController],
})
export class ChatModule {}
