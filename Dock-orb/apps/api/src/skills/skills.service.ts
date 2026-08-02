import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SkillMatch } from '@capsule-ai/shared-types';

@Injectable()
export class SkillsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Matches user input against active skills for a workspace.
   * For MVP, this does basic keyword/trigger matching.
   * Phase 2 will use embeddings and vector search.
   */
  async matchSkills(userInput: string, workspaceId: string): Promise<SkillMatch[]> {
    // 1. Fetch enabled skills for the workspace
    const workspaceSkills = await this.prisma.workspaceSkill.findMany({
      where: { workspaceId, isEnabled: true },
    });

    if (workspaceSkills.length === 0) return [];

    const matches: SkillMatch[] = [];
    const lowerInput = userInput.toLowerCase();

    // Mock built-in skills logic for MVP
    const MOCK_SKILLS = [
      { id: 'backend-nestjs', triggers: ['nestjs', 'api', 'backend', 'controller'] },
      { id: 'frontend-react', triggers: ['react', 'nextjs', 'component', 'ui'] },
      { id: 'security-threat', triggers: ['security', 'threat', 'vulnerability', 'auth'] },
      { id: 'mech-fea', triggers: ['fea', 'stress', 'ansys', 'simulation'] },
    ];

    for (const ws of workspaceSkills) {
      // In reality, we'd parse the skill.md here
      // For MVP we mock the matching
      const mockSkill = MOCK_SKILLS.find(s => ws.skillPath.includes(s.id));
      if (!mockSkill) continue;

      let matchCount = 0;
      const matchedTriggers: string[] = [];

      for (const trigger of mockSkill.triggers) {
        if (lowerInput.includes(trigger)) {
          matchCount++;
          matchedTriggers.push(trigger);
        }
      }

      if (matchCount > 0) {
        matches.push({
          skill: {
            id: mockSkill.id,
            name: mockSkill.id,
            description: 'Mocked skill for MVP',
            domain: 'general',
            version: '1.0.0',
            author: 'System',
            tags: [],
            triggers: mockSkill.triggers,
            dependencies: [],
            tools: [],
            filePath: ws.skillPath,
          },
          confidence: Math.min(matchCount * 0.25, 1.0),
          matchedTriggers,
        });
      }
    }

    return matches.sort((a, b) => b.confidence - a.confidence);
  }
}
