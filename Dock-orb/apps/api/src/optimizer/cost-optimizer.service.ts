import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsageLog } from '@prisma/client';

@Injectable()
export class CostOptimizerService {
  constructor(private prisma: PrismaService) {}

  async recordUsage(
    workspaceId: string,
    userId: string,
    provider: string,
    model: string,
    inputTokens: number,
    outputTokens: number,
    totalTokens: number,
    cost: number,
    cached: boolean,
    responseTime: number,
    skillsUsed: string[],
    intentType?: string,
  ): Promise<UsageLog> {
    return this.prisma.usageLog.create({
      data: {
        workspaceId,
        userId,
        provider,
        model,
        inputTokens,
        outputTokens,
        totalTokens,
        cost,
        cached,
        responseTime,
        skillsUsed,
        intentType,
      },
    });
  }

  async getWorkspaceUsageStats(workspaceId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await this.prisma.usageLog.findMany({
      where: {
        workspaceId,
        createdAt: { gte: startDate },
      },
    });

    const totalCost = logs.reduce((sum, log) => sum + log.cost, 0);
    const totalTokens = logs.reduce((sum, log) => sum + log.totalTokens, 0);
    const cacheHits = logs.filter(log => log.cached).length;
    
    // Rough estimate of savings assuming cache hits saved the input cost
    // For MVP, simplistic calculation
    const estimatedSavings = logs
      .filter(log => log.cached)
      .reduce((sum, log) => sum + (log.inputTokens * 0.000005), 0); // ~avg cost

    return {
      totalCost,
      totalTokens,
      totalRequests: logs.length,
      cacheHitRate: logs.length ? cacheHits / logs.length : 0,
      estimatedSavings,
    };
  }
}
