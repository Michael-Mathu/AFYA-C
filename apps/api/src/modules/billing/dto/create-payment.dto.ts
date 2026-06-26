import { IsEnum, IsOptional, IsString, IsUUID, IsDate, IsNumber, IsEmail, IsPhoneNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({ example: 1500.00 })
  @IsNumber({ maxDecimalPlaces: 2 })
  amount?: number;

  @ApiProperty({ example: 'CASH' })
  @IsEnum(['CASH', 'MPESA', 'BANK_TRANSFER', 'CARD', 'INSURANCE'])
  paymentMethod: string;

  @ApiProperty({ example: '+254712345678' })
  @IsPhoneNumber('any')
  @IsOptional()
  mpesaPhone?: string;

  @ApiProperty({ example: 'ref-12345' })
  @IsOptional()
  @IsString()
  referenceNumber?: string;
}
