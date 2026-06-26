import { IsEnum, IsOptional, IsString, IsUUID, IsDate, IsNumber, IsBoolean, IsJSON, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLabTestCatalogueDto {
  @ApiProperty({ example: 'Complete Blood Count' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'CBC' })
  @IsOptional()
  @IsString()
  shortCode?: string;

  @ApiProperty({ example: 'Hematology' })
  @IsString()
  category: string;

  @ApiProperty({ example: 'Whole Blood' })
  @IsOptional()
  @IsString()
  sampleType?: string;

  @ApiProperty({ example: 4 })
  @IsOptional()
  @IsNumber()
  turnaroundHours?: number;

  @ApiProperty({ example: 500 })
  @IsNumber({ maxDecimalPlaces: 2 })
  price: number;

  @ApiProperty({ example: false })
  @IsOptional()
  @IsBoolean()
  isPanel?: boolean;

  @ApiProperty({ example: 'uuid-of-panel' })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}

export class UpdateLabRequestDto {
  @ApiProperty({ example: 'ROUTINE' })
  @IsEnum(['ROUTINE', 'URGENT', 'STAT'])
  @IsOptional()
  priority?: string;

  @ApiProperty({ example: 'Patient is febrile' })
  @IsOptional()
  @IsString()
  clinicalNotes?: string;

  @ApiProperty({ example: 'COMPLETED' })
  @IsEnum(['ORDERED', 'SAMPLE_COLLECTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
  @IsOptional()
  status?: string;

  @ApiProperty({ example: 'Blood' })
  @IsOptional()
  @IsString()
  specimenType?: string;

  @ApiProperty({ example: '2024-01-15' })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  specimenCollectedAt?: Date;

  @ApiProperty({ example: 'uuid-of-lab-tech' })
  @IsOptional()
  @IsUUID()
  specimenCollectedBy?: string;

  @ApiProperty({ example: '8.5' })
  @IsOptional()
  @IsString()
  resultValue?: string;

  @ApiProperty({ example: { wbc: 9.5, rbc: 4.8, hgb: 13.5 } })
  @IsOptional()
  @IsJSON()
  resultJson?: any;

  @ApiProperty({ example: 'Normal morphology' })
  @IsOptional()
  @IsString()
  resultNote?: string;

  @ApiProperty({ example: true })
  @IsOptional()
  @IsBoolean()
  isAbnormal?: boolean;
}
