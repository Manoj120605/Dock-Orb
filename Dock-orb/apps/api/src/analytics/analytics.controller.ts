import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CostOptimizerService } from '../optimizer/cost-optimizer.service';

@ApiTags('Analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private costOptimizer: CostOptimizerService) {}

  @Get('workspaces/:workspaceId/usage')
  @ApiOperation({ summary: 'Get cost and usage statistics for a workspace' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  async getUsageStats(
    @Param('workspaceId') workspaceId: string,
    @Query('days') days?: string,
  ) {
    const stats = await this.costOptimizer.getWorkspaceUsageStats(
      workspaceId,
      days ? parseInt(days, 10) : 30
    );
    return { success: true, data: stats };
  }
}
