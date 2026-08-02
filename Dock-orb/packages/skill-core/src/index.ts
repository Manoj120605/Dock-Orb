export interface SkillManifest {
  name: string;
  description: string;
  domain: string;
  version: string;
  author: string;
  tags: string[];
  triggers: string[];
  dependencies: string[];
  tools: string[];
}

export interface SkillContext {
  userId?: string;
  capsuleId?: string;
  sessionId?: string;
  payload: any;
  history?: any[];
  [key: string]: any;
}

export interface SkillResponse<T = any> {
  status: 'success' | 'error';
  data?: T;
  error?: string;
  instructions?: string;
}

export interface ISkill {
  manifest: SkillManifest;
  execute(context: SkillContext): Promise<SkillResponse> | SkillResponse;
}
