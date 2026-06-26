import { IsEnum, IsOptional, IsUUID, IsDate, IsString, IsJSON, IsEmail, IsPhoneNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAuditLogDto {
  @ApiProperty({ example: 'CREATE' })
  @IsEnum(['CREATE', 'UPDATE', 'DELETE', 'VIEW', 'LOGIN', 'LOGOUT', 'AI_INTERACTION'])
  action: string;

  @ApiProperty({ example: 'patient' })
  @IsString()
  entityType: string;

  @ApiProperty({ example: 'uuid-of-patient' })
  @IsUUID()
  entityId: string;

  @ApiProperty({ example: { name: 'John Doe' } })
  @IsOptional()
  @IsJSON()
  oldValues?: any;

  @ApiProperty({ example: { name: 'Jane Doe' } })
  @IsOptional()
  @IsJSON()
  newValues?: any;

  @ApiProperty({ example: '192.168.1.1' })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiProperty({ example: 'Mozilla/5.0' })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiProperty({ example: { module: 'patient' } })
  @IsOptional()
  @IsJSON()
  metadata?: any;
}

export class GetAuditLogsDto {
  @ApiProperty({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;

  @ApiProperty({ example: 'patient' })
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiProperty({ example: 'CREATE' })
  @IsOptional()
  @IsEnum(['CREATE', 'UPDATE', 'DELETE', 'VIEW', 'LOGIN', 'LOGOUT', 'AI_INTERACTION'])
  action?: string;

  @ApiProperty({ example: 'uuid-of-user' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty({ example: '2024-01-01' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @ApiProperty({ example: '2024-12-31' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;
}
