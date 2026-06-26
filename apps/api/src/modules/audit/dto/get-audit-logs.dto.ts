import { IsOptional, IsNumber, IsDate, IsString, IsEnum, IsUUID, IsEmail, IsPhoneNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

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
