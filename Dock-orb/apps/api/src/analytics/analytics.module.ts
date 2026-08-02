import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { OptimizerModule } from '../optimizer/optimizer.module';

@Module({
  imports: [OptimizerModule],
  controllers: [AnalyticsController],
})
export class AnalyticsModule {}
