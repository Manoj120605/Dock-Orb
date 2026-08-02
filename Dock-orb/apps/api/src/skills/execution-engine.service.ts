import { Injectable, Logger } from '@nestjs/common';
import { ISkill, SkillContext, SkillResponse } from '@capsule-ai/skill-core';
import { SkillRegistryService } from './registry.service';

@Injectable()
export class SkillExecutionEngineService {
  private readonly logger = new Logger(SkillExecutionEngineService.name);

  constructor(private readonly registry: SkillRegistryService) {}

  async executeSkill(skillName: string, context: SkillContext): Promise<SkillResponse> {
    const skill = this.registry.getSkill(skillName);
    if (!skill) {
      return {
        status: 'error',
        error: `Skill '${skillName}' not found or not loaded.`
      };
    }

    try {
      this.logger.log(`Executing skill: ${skillName}`);
      // The skill is an executable package, we just call its execute method
      const response = await skill.execute(context);
      return response;
    } catch (error: any) {
      this.logger.error(`Error executing skill ${skillName}`, error.stack);
      return {
        status: 'error',
        error: error.message || 'Internal skill execution error'
      };
    }
  }
}
