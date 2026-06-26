import { IsString, IsEnum, IsOptional, IsNumber, IsDate, IsJSON, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateSoapNoteDto {
  @ApiProperty({ example: 'Patient presents with fever, cough, and malaise for 3 days. Associated with sore throat and headache. Denies chills and body aches. Past medical history significant for hypertension controlled on lisinopril. No known allergies. Lives alone, occasional alcohol use. Chief complaint: fever and respiratory symptoms.' })
  @IsString()
  freeText: string;

  @ApiProperty({ example: 'uuid-of-patient' })
  @IsString()
  @IsOptional()
  patientId?: string;
}

export class SummarizeHistoryDto {
  @ApiProperty({ example: 'uuid-of-patient' })
  @IsString()
  patientId: string;
}

export class SuggestPrescriptionsDto {
  @ApiProperty({ example: 'uuid-of-patient' })
  @IsString()
  patientId: string;

  @ApiProperty({ type: 'array', items: { type: 'object' } })
  @IsOptional()
  diagnoses?: Array<{ code: string; description: string }>;
}

export class SearchClinicalDto {
  @ApiProperty({ example: 'How to manage hypertension in patients with diabetes?' })
  @IsString()
  query: string;

  @ApiProperty({ example: 'uuid-of-patient' })
  @IsString()
  @IsOptional()
  patientId?: string;
}
