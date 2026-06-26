import { IsEnum, IsOptional, IsString, IsUUID, IsDate, IsNumber, IsBoolean, IsJSON, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLabRequestDto {
  @ApiProperty({ example: 'uuid-of-consultation' })
  @IsUUID()
  consultationId: string;

  @ApiProperty({ example: 'uuid-of-patient' })
  @IsUUID()
  patientId: string;

  @ApiProperty({ example: 'uuid-of-doctor' })
  @IsUUID()
  doctorId: string;

  @ApiProperty({ example: 'uuid-of-lab-test-catalogue' })
  @IsUUID()
  testCatalogueId: string;

  @ApiProperty({ example: 'ROUTINE' })
  @IsEnum(['ROUTINE', 'URGENT', 'STAT'])
  priority: string;

  @ApiProperty({ example: 'Patient is febrile, suspicious malaria' })
  @IsOptional()
  @IsString()
  clinicalNotes?: string;
}
