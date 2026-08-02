import { ISkill, SkillContext, SkillResponse } from '@capsule-ai/skill-core';
import { manifest } from './manifest';
import { execute } from './handler';

class NestJsExpertSkill implements ISkill {
  public manifest = manifest;

  public async execute(context: SkillContext): Promise<SkillResponse> {
    return execute(context);
  }
}

export default new NestJsExpertSkill();
