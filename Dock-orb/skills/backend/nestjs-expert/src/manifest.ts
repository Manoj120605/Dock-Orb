import { SkillManifest } from '@capsule-ai/skill-core';

export const manifest: SkillManifest = {
  name: "NestJS Expert",
  description: "Expert guidance for building NestJS REST/GraphQL APIs",
  domain: "software/backend",
  version: "1.0.0",
  author: "Capsule AI",
  tags: ["nestjs", "typescript", "api", "backend"],
  triggers: [
    "nestjs",
    "api endpoint",
    "controller",
    "service",
    "module"
  ],
  dependencies: [],
  tools: []
};
