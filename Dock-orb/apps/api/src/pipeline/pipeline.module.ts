import { Module } from '@nestjs/common';
import { PipelineService } from './pipeline.service';
import { CapsulesModule } from '../capsules/capsules.module';
import { ProvidersModule } from '../providers/providers.module';
import { OptimizerModule } from '../optimizer/optimizer.module';
import { SkillsModule } from '../skills/skills.module';

@Module({
  imports: [CapsulesModule, ProvidersModule, OptimizerModule, SkillsModule],
  providers: [PipelineService],
  exports: [PipelineService],
})
export class PipelineModule {}
