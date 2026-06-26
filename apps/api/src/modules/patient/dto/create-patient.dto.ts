import { IsNotEmpty, IsString, IsEmail, IsDate, IsEnum, IsOptional, IsPhoneNumber, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class AllergyDto {
  @ApiProperty({ example: 'Penicillin' })
  @IsString()
  allergen: string;

  @ApiProperty({ example: 'Rash, difficulty breathing' })
  @IsString()
  reaction: string;

  @ApiProperty({ example: 'SEVERE' })
  @IsEnum(['MILD', 'MODERATE', 'SEVERE', 'LIFE_THREATENING'])
  severity: string;

  @ApiProperty({ example: 'Severe reaction requiring emergency treatment' })
  @IsOptional()
  @IsString()
  notes?: string;
}

class InsuranceDto {
  @ApiProperty({ example: 'SHIF' })
  @IsString()
  provider: string;

  @ApiProperty({ example: 'SHIF-1234567' })
  @IsString()
  insuranceNumber: string;

  @ApiProperty({ example: '2024-12-31' })
  @IsDate()
  @Type(() => Date)
  validUntil: Date;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  policyHolderName: string;

  @ApiProperty({ example: 'self' })
  @IsString()
  relationship: string;
}

class EmergencyContactDto {
  @ApiProperty({ example: 'Jane Smith' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '+254712345678' })
  @IsPhoneNumber('any')
  phone: string;

  @ApiProperty({ example: 'Spouse' })
  @IsString()
  @IsNotEmpty()
  relationship: string;

  @ApiProperty({ example: 'Nairobi, Kenya' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 'jane@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;
}

class NextOfKinDto {
  @ApiProperty({ example: 'Jane Smith' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '+254712345678' })
  @IsPhoneNumber('any')
  phone: string;

  @ApiProperty({ example: 'Spouse' })
  @IsString()
  @IsNotEmpty()
  relationship: string;

  @ApiProperty({ example: 'Nairobi, Kenya' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 'jane@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;
}

export class CreatePatientDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: '1985-06-15' })
  @IsDate()
  @Type(() => Date)
  dateOfBirth: Date;

  @ApiProperty({ example: 'MALE' })
  @IsEnum(['MALE', 'FEMALE', 'OTHER'])
  gender: string;

  @ApiProperty({ example: '+254712345678' })
  @IsPhoneNumber('any')
  phone: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'NATIONAL_ID' })
  @IsEnum(['NATIONAL_ID', 'PASSPORT', 'BIRTH_CERT', 'ALIEN_CARD'])
  idType: string;

  @ApiProperty({ example: '12345678' })
  @IsString()
  @IsNotEmpty()
  idNumber: string;

  @ApiProperty({ example: '+254798765432' })
  @IsOptional()
  @IsPhoneNumber('any')
  alternativePhone?: string;

  @ApiProperty({ example: '{"county": "Nairobi", "subcounty": "Westlands", "ward": "Parklands", "village": "Village", "estate": "Estate"}' })
  @IsOptional()
  @ValidateNested()
  @Type(() => Object)
  address?: any;

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
