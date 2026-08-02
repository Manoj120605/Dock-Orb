import { Module } from '@nestjs/common';
import { ProvidersService } from './providers.service';
import { LiteLLMClient } from './litellm.client';
import { ModelRouterService } from './model-router.service';

@Module({
  providers: [ProvidersService, LiteLLMClient, ModelRouterService],
  exports: [ProvidersService, LiteLLMClient, ModelRouterService],
})
export class ProvidersModule {}
