import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { CapsulesModule } from './capsules/capsules.module';
import { ChatModule } from './chat/chat.module';
import { PipelineModule } from './pipeline/pipeline.module';
import { ProvidersModule } from './providers/providers.module';
import { OptimizerModule } from './optimizer/optimizer.module';
import { SkillsModule } from './skills/skills.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),

    // Infrastructure
    PrismaModule,
    RedisModule,

    // Core modules
    AuthModule,
    UsersModule,
    WorkspacesModule,
    CapsulesModule,
    ChatModule,
    PipelineModule,
    ProvidersModule,
    OptimizerModule,
    SkillsModule,
    AnalyticsModule,
  ],
})
export class AppModule {}
