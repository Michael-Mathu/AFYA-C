import { IsString, IsEnum, IsOptional, IsNumber, IsDate, IsJSON, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SearchClinicalDto {
  @ApiProperty({ example: 'How to manage hypertension in patients with diabetes?' })
  @IsString()
  query: string;

  @ApiProperty({ example: 'uuid-of-patient' })
  @IsString()
  @IsOptional()
  patientId?: string;
}
