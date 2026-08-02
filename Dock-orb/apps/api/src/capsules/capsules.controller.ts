import {
  Controller, Get, Post, Put, Delete, Param, Body, Query,
  UseGuards, Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CapsulesService } from './capsules.service';
import { CreateCapsuleDto, UpdateCapsuleDto } from './dto/capsule.dto';
import { CapsuleType } from '@prisma/client';

@ApiTags('Capsules')
@Controller('capsules')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CapsulesController {
  constructor(private capsulesService: CapsulesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new capsule' })
  async create(@Request() req: any, @Body() dto: CreateCapsuleDto) {
    const capsule = await this.capsulesService.create(req.user.sub, dto);
    return { success: true, data: capsule };
  }

  @Get()
  @ApiOperation({ summary: 'List capsules for a workspace' })
  @ApiQuery({ name: 'workspaceId', required: true })
  @ApiQuery({ name: 'type', required: false, enum: ['PROJECT', 'USER', 'TASK', 'CONVERSATION', 'TEAM'] })
  async findAll(
    @Query('workspaceId') workspaceId: string,
    @Query('type') type?: CapsuleType,
  ) {
    const capsules = await this.capsulesService.findAll(workspaceId, type);
    return { success: true, data: capsules };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a capsule by ID' })
  async findOne(@Param('id') id: string) {
    const capsule = await this.capsulesService.findOne(id);
    return { success: true, data: capsule };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a capsule' })
  async update(@Param('id') id: string, @Body() dto: UpdateCapsuleDto) {
    const capsule = await this.capsulesService.update(id, dto);
    return { success: true, data: capsule };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a capsule' })
  async remove(@Param('id') id: string) {
    const result = await this.capsulesService.remove(id);
    return { success: true, data: result };
  }

  // ---- Versioning ----

  @Get(':id/snapshots')
  @ApiOperation({ summary: 'Get capsule version history' })
  async getSnapshots(@Param('id') id: string) {
    const snapshots = await this.capsulesService.getSnapshots(id);
    return { success: true, data: snapshots };
  }

  @Post(':id/restore/:version')
  @ApiOperation({ summary: 'Restore capsule to a previous version' })
  async restoreSnapshot(
    @Param('id') id: string,
    @Param('version') version: number,
  ) {
    const capsule = await this.capsulesService.restoreSnapshot(id, version);
    return { success: true, data: capsule };
  }
}
