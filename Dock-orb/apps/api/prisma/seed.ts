import { PrismaClient, MemberRole, CapsuleType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Create Demo User
  const passwordHash = await bcrypt.hash('password123', 12);

  const user = await prisma.user.upsert({
    where: { email: 'demo@capsule.ai' },
    update: {},
    create: {
      email: 'demo@capsule.ai',
      name: 'Judge Evaluator',
      passwordHash,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Judge',
      preferences: {
        theme: 'dark',
        defaultModel: 'gpt-4o',
      },
    },
  });

  console.log(`👤 User created/updated: ${user.email} (Password: password123)`);

  // 2. Create Demo Workspace
  let workspace = await prisma.workspace.findFirst({
    where: { members: { some: { userId: user.id } } },
  });

  if (!workspace) {
    workspace = await prisma.workspace.create({
      data: {
        name: 'Evaluation Workspace',
        description: 'Default evaluation workspace pre-configured with sample Capsules and Skills.',
        members: {
          create: {
            userId: user.id,
            role: MemberRole.OWNER,
          },
        },
      },
    });
  }

  console.log(`🏢 Workspace ready: ${workspace.name} (${workspace.id})`);

  // 3. Create Sample Capsules
  const projectCapsule = await prisma.capsule.upsert({
    where: { id: 'seed-project-capsule' },
    update: {},
    create: {
      id: 'seed-project-capsule',
      workspaceId: workspace.id,
      userId: user.id,
      type: CapsuleType.PROJECT,
      name: 'Capsule AI Core Architecture',
      description: 'System specifications, design decisions, and component guidelines.',
      content: {
        summary: 'Capsule AI provides domain-agnostic context persistence across AI models.',
        techStack: ['NestJS', 'Next.js', 'FastAPI', 'Qdrant', 'Redis', 'LiteLLM'],
        keyGoals: [
          'Model-neutral context retention',
          'Token cost optimization via semantic caching',
          'Executable MCP skills integration',
        ],
      },
      metadata: { priority: 'high', tags: ['architecture', 'core'] },
    },
  });

  await prisma.capsule.upsert({
    where: { id: 'seed-task-capsule' },
    update: {},
    create: {
      id: 'seed-task-capsule',
      workspaceId: workspace.id,
      userId: user.id,
      type: CapsuleType.TASK,
      parentId: projectCapsule.id,
      name: 'Judge Evaluation Workflow',
      description: 'Steps for judges to evaluate Dock-Orb / Capsule AI.',
      content: {
        steps: [
          'Verify Docker services (PostgreSQL, Redis, Qdrant, LiteLLM, AI-Services)',
          'Test authentication and workspace dashboard',
          'Inspect architecture diagram and persistent capsules',
          'Verify MCP skill execution and LLM routing',
        ],
        status: 'READY_FOR_EVALUATION',
      },
      metadata: { category: 'hackathon' },
    },
  });

  console.log('📦 Sample Capsules created.');

  // 4. Create Sample Provider Configs
  await prisma.providerConfig.upsert({
    where: {
      workspaceId_provider: {
        workspaceId: workspace.id,
        provider: 'litellm',
      },
    },
    update: {},
    create: {
      workspaceId: workspace.id,
      provider: 'litellm',
      displayName: 'LiteLLM Proxy (Unified Router)',
      apiKeyEnc: 'sk-litellm-master-key',
      baseUrl: 'http://localhost:4000',
      isEnabled: true,
      priority: 1,
      models: ['gpt-4o', 'claude-3-5-sonnet', 'llama-3.1-8b', 'gemini-1.5-pro'],
    },
  });

  console.log('🔌 Provider configurations seeded.');
  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
