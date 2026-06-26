import { IsOptional, IsString, IsDate, IsEmail, IsPhoneNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { AllergyDto } from './create-patient.dto';
import { InsuranceDto } from './create-patient.dto';
import { EmergencyContactDto } from './create-patient.dto';
import { NextOfKinDto } from './create-patient.dto';

class AddressDto {
  @ApiProperty({ example: 'Nairobi' })
  @IsOptional()
  @IsString()
  county?: string;

  @ApiProperty({ example: 'Westlands' })
  @IsOptional()
  @IsString()
  subcounty?: string;

  @ApiProperty({ example: 'Parklands' })
  @IsOptional()
  @IsString()
  ward?: string;

  @ApiProperty({ example: 'Village' })
  @IsOptional()
  @IsString()
  village?: string;

  @ApiProperty({ example: 'Estate' })
  @IsOptional()
  @IsString()
  estate?: string;
}

export class UpdatePatientDto {
  @ApiProperty({ example: 'John' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ example: 'Doe' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ example: '1985-06-15' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dateOfBirth?: Date;

  @ApiProperty({ example: 'MALE' })
  @IsOptional()
  @IsEnum(['MALE', 'FEMALE', 'OTHER'])
  gender?: string;

  @ApiProperty({ example: '+254712345678' })
  @IsOptional()
  @IsPhoneNumber('any')
  phone?: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'NATIONAL_ID' })
  @IsOptional()
  @IsEnum(['NATIONAL_ID', 'PASSPORT', 'BIRTH_CERT', 'ALIEN_CARD'])
  idType?: string;

  @ApiProperty({ example: '12345678' })
  @IsOptional()
  @IsString()
  idNumber?: string;

  @ApiProperty({ example: '+254798765432' })
  @IsOptional()
  @IsPhoneNumber('any')
  alternativePhone?: string;

  @ApiProperty({ type: AddressDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  @ApiProperty({ type: [AllergyDto] })
  @IsOptional()
  @Type(() => AllergyDto)
  allergies?: AllergyDto[];

  @ApiProperty({ type: InsuranceDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => InsuranceDto)
  insurance?: InsuranceDto;

  @ApiProperty({ type: EmergencyContactDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => EmergencyContactDto)
  emergencyContact?: EmergencyContactDto;

  @ApiProperty({ type: NextOfKinDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => NextOfKinDto)
  nextOfKin?: NextOfKinDto;
}
