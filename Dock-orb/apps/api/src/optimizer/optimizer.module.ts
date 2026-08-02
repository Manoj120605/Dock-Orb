import { Module } from '@nestjs/common';
import { TokenCounterService } from './token-counter.service';
import { CostOptimizerService } from './cost-optimizer.service';
import { ContextOptimizerService } from './context-optimizer.service';
import { SemanticCacheService } from './cache.service';

@Module({
  providers: [
    TokenCounterService,
    CostOptimizerService,
    ContextOptimizerService,
    SemanticCacheService,
  ],
  exports: [
    TokenCounterService,
    CostOptimizerService,
    ContextOptimizerService,
    SemanticCacheService,
  ],
})
export class OptimizerModule {}
