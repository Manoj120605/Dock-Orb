import { Module } from '@nestjs/common';
import { SkillsService } from './skills.service';
import { SkillRegistryService } from './registry.service';
import { SkillExecutionEngineService } from './execution-engine.service';

@Module({
  providers: [SkillsService, SkillRegistryService, SkillExecutionEngineService],
  exports: [SkillsService, SkillRegistryService, SkillExecutionEngineService],
})
export class SkillsModule {}
