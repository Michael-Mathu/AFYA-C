import { IsString, IsUUID, IsNumber, IsEnum, IsOptional, IsDate, IsEmail, IsPhoneNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBillDto {
  @ApiProperty({ example: 'uuid-of-patient' })
  @IsUUID()
  patientId: string;

  @ApiProperty({ type: 'array', items: { type: 'object' } })
  @ValidateNested({ each: true })
  @Type(() => BillItemDto)
  items: BillItemDto[];
}

export class BillItemDto {
  @ApiProperty({ example: 'consultation' })
  @IsEnum(['consultation', 'prescription', 'lab'])
  type: string;

  @ApiProperty({ example: 'uuid-of-service' })
  @IsUUID()
  id: string;
}
