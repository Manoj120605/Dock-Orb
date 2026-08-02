import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { ISkill, SkillManifest } from '@capsule-ai/skill-core';

@Injectable()
export class SkillRegistryService implements OnModuleInit {
  private readonly logger = new Logger(SkillRegistryService.name);
  private skills: Map<string, ISkill> = new Map();

  async onModuleInit() {
    await this.discoverSkills();
  }

  async discoverSkills() {
    this.logger.log('Discovering executable skills...');
    const skillsRoot = path.join(process.cwd(), '../../skills');
    
    if (!fs.existsSync(skillsRoot)) {
      this.logger.warn(`Skills root not found at ${skillsRoot}`);
      return;
    }

    const categories = fs.readdirSync(skillsRoot);
    for (const category of categories) {
      const categoryPath = path.join(skillsRoot, category);
      if (!fs.statSync(categoryPath).isDirectory()) continue;

      const skillDirs = fs.readdirSync(categoryPath);
      for (const skillDir of skillDirs) {
        const skillPath = path.join(categoryPath, skillDir);
        
        try {
          // Attempt to dynamically import the skill package index
          const modulePath = path.join(skillPath, 'src', 'index.ts');
          if (fs.existsSync(modulePath)) {
            // Using require or import dynamically
            // Note: In a production build, this path resolution would need to target 'dist' or the transpiled files
            const skillModule = await import(skillPath); // Relying on ts-node/Node resolution or just importing from the directory if built
            
            // Assume the default export or named export is an instance of a Skill class or a factory
            if (skillModule.default && skillModule.default.manifest) {
              const skill: ISkill = skillModule.default;
              this.skills.set(skill.manifest.name, skill);
              this.logger.log(`Loaded skill: ${skill.manifest.name}`);
            }
          }
        } catch (error) {
          this.logger.error(`Failed to load skill at ${skillPath}`, error);
        }
      }
    }
  }

  getSkill(name: string): ISkill | undefined {
    return this.skills.get(name);
  }

  getAllSkills(): ISkill[] {
    return Array.from(this.skills.values());
  }
}
