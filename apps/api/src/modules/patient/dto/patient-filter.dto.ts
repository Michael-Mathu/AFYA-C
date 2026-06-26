import { IsOptional, IsString, IsDate, IsEmail, IsPhoneNumber, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class PatientFilterDto {
  @ApiProperty({ example: 1, description: 'Page number' })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({ example: 10, description: 'Items per page' })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;

  @ApiProperty({ example: 'John', description: 'Search by name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ example: '12345678', description: 'Filter by ID number' })
  @IsOptional()
  @IsString()
  idNumber?: string;

  @ApiProperty({ example: 'MRN-2026-000001', description: 'Filter by MRN' })
  @IsOptional()
  @IsString()
  mrn?: string;

  @ApiProperty({ example: '+254712345678', description: 'Filter by phone number' })
  @IsOptional()
  @IsPhoneNumber('any')
  phone?: string;
}
