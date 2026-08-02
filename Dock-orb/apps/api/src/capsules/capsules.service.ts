import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { CapsuleType } from '@prisma/client';
import { CreateCapsuleDto, UpdateCapsuleDto } from './dto/capsule.dto';

@Injectable()
export class CapsulesService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  // ---- CRUD ----

  async create(userId: string, dto: CreateCapsuleDto) {
    // Ensure workspace exists
    await this.prisma.workspace.upsert({
      where: { id: dto.workspaceId },
      create: { id: dto.workspaceId, name: 'Default Workspace', settings: {} },
      update: {},
    });

    // Ensure user exists
    await this.prisma.user.upsert({
      where: { id: userId },
      create: { id: userId, email: `${userId}@local.dock-orb`, name: 'Local User', passwordHash: 'local' },
      update: {},
    });

    const capsule = await this.prisma.capsule.create({
      data: {
        userId,
        workspaceId: dto.workspaceId,
        type: dto.type,
        name: dto.name,
        description: dto.description,
        content: (dto.content as any) || {},
        metadata: (dto.metadata as any) || {},
        parentId: dto.parentId,
      },
    });

    // Create initial snapshot
    await this.createSnapshot(capsule.id, 1, capsule.content as any, 'Initial creation');

    // Invalidate cache
    await this.invalidateCache(dto.workspaceId);

    return capsule;
  }

  async findAll(workspaceId: string, type?: CapsuleType) {
    // Check cache first
    const cacheKey = `capsules:${workspaceId}:${type || 'all'}`;
    const cached = await this.redis.getJson(cacheKey);
    if (cached) return cached;

    const capsules = await this.prisma.capsule.findMany({
      where: {
        workspaceId,
        isActive: true,
        ...(type ? { type } : {}),
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        _count: { select: { children: true, snapshots: true } },
      },
    });

    // Cache for 5 minutes
    await this.redis.setJson(cacheKey, capsules, 300);

    return capsules;
  }

  async findOne(id: string) {
    const capsule = await this.prisma.capsule.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        children: { where: { isActive: true }, orderBy: { createdAt: 'desc' } },
        snapshots: { orderBy: { version: 'desc' }, take: 10 },
      },
    });

    if (!capsule) {
      throw new NotFoundException(`Capsule ${id} not found`);
    }

    return capsule;
  }

  async update(id: string, dto: UpdateCapsuleDto) {
    const existing = await this.findOne(id);

    const newVersion = existing.version + 1;

    // Create snapshot of current state before updating
    await this.createSnapshot(
      id,
      existing.version,
      existing.content as any,
      dto.changeLog || `Updated to version ${newVersion}`,
    );

    const updated = await this.prisma.capsule.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.content !== undefined ? { content: dto.content as any } : {}),
        ...(dto.metadata !== undefined ? { metadata: dto.metadata as any } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        version: newVersion,
      },
    });

    // Invalidate cache
    await this.invalidateCache(existing.workspaceId);

    return updated;
  }

  async remove(id: string) {
    const capsule = await this.findOne(id);

    // Soft delete — mark as inactive
    await this.prisma.capsule.update({
      where: { id },
      data: { isActive: false },
    });

    await this.invalidateCache(capsule.workspaceId);

    return { deleted: true };
  }

  // ---- Versioning ----

  async getSnapshots(capsuleId: string) {
    return this.prisma.capsuleSnapshot.findMany({
      where: { capsuleId },
      orderBy: { version: 'desc' },
    });
  }

  async restoreSnapshot(capsuleId: string, version: number) {
    const snapshot = await this.prisma.capsuleSnapshot.findFirst({
      where: { capsuleId, version },
    });

    if (!snapshot) {
      throw new NotFoundException(`Snapshot version ${version} not found`);
    }

    return this.update(capsuleId, {
      content: snapshot.content as any,
      changeLog: `Restored from version ${version}`,
    });
  }

  // ---- Context Retrieval (used by Pipeline) ----

  async getContextForConversation(
    workspaceId: string,
    userId: string,
    capsuleId?: string,
  ): Promise<{ section: string; content: string; capsuleId: string; type: CapsuleType }[]> {
    const contexts: { section: string; content: string; capsuleId: string; type: CapsuleType }[] = [];

    // 1. Get the active project capsule
    if (capsuleId) {
      const capsule = await this.prisma.capsule.findUnique({
        where: { id: capsuleId },
      });
      if (capsule) {
        const content = capsule.content as Record<string, any>;
        // Extract key sections
        for (const [section, value] of Object.entries(content)) {
          if (value && typeof value === 'object') {
            contexts.push({
              section,
              content: JSON.stringify(value, null, 2),
              capsuleId: capsule.id,
              type: capsule.type,
            });
          }
        }
      }
    }

    // 2. Get user capsule
    const userCapsule = await this.prisma.capsule.findFirst({
      where: { workspaceId, userId, type: 'USER', isActive: true },
    });
    if (userCapsule) {
      contexts.push({
        section: 'user_preferences',
        content: JSON.stringify(userCapsule.content, null, 2),
        capsuleId: userCapsule.id,
        type: 'USER',
      });
    }

    // 3. Get active task capsules
    const taskCapsules = await this.prisma.capsule.findMany({
      where: { workspaceId, type: 'TASK', isActive: true },
      take: 3,
      orderBy: { updatedAt: 'desc' },
    });
    for (const task of taskCapsules) {
      contexts.push({
        section: 'active_task',
        content: JSON.stringify(task.content, null, 2),
        capsuleId: task.id,
        type: 'TASK',
      });
    }

    return contexts;
  }

  /** Incrementally update a capsule from conversation insights */
  async updateFromConversation(
    capsuleId: string,
    updates: Record<string, any>,
  ) {
    const capsule = await this.findOne(capsuleId);
    const currentContent = capsule.content as Record<string, any>;

    // Deep merge updates into current content
    const mergedContent = this.deepMerge(currentContent, updates);

    return this.update(capsuleId, {
      content: mergedContent,
      changeLog: 'Auto-updated from conversation insights',
    });
  }

  // ---- Private Helpers ----

  private async createSnapshot(
    capsuleId: string,
    version: number,
    content: any,
    changeLog: string,
  ) {
    await this.prisma.capsuleSnapshot.create({
      data: { capsuleId, version, content, changeLog },
    });
  }

  private async invalidateCache(workspaceId: string) {
    const keys = [
      `capsules:${workspaceId}:all`,
      `capsules:${workspaceId}:PROJECT`,
      `capsules:${workspaceId}:USER`,
      `capsules:${workspaceId}:TASK`,
      `capsules:${workspaceId}:CONVERSATION`,
      `capsules:${workspaceId}:TEAM`,
    ];
    for (const key of keys) {
      await this.redis.del(key);
    }
  }

  private deepMerge(target: any, source: any): any {
    const output = { ...target };
    for (const key in source) {
      if (
        source[key] &&
        typeof source[key] === 'object' &&
        !Array.isArray(source[key])
      ) {
        output[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        output[key] = source[key];
      }
    }
    return output;
  }
}
