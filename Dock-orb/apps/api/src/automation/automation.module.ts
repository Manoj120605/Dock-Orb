import { Module } from '@nestjs/common';
import { AutomationController } from './automation.controller';
import { McpService } from './mcp.service';
import { DockerN8nService } from './docker-n8n.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AutomationController],
  providers: [McpService, DockerN8nService],
  exports: [McpService, DockerN8nService],
})
export class AutomationModule {}
