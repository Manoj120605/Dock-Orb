import { IsString, IsEnum, IsOptional, IsObject, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CapsuleType } from '@prisma/client';

export class CreateCapsuleDto {
  @ApiProperty()
  @IsString()
  workspaceId: string;

  @ApiProperty({ enum: ['PROJECT', 'USER', 'TASK', 'CONVERSATION', 'TEAM'] })
  @IsEnum(CapsuleType)
  type: CapsuleType;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: Object })
  @IsObject()
  content: Record<string, any>;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  parentId?: string;
}

export class UpdateCapsuleDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  content?: Record<string, any>;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  changeLog?: string;
}
