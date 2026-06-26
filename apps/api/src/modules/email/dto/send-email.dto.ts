import { IsEmail, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendEmailDto {
  @ApiProperty({ example: 'patient@example.com' })
  @IsEmail()
  to: string;

  @ApiProperty({ example: 'Appointment Reminder' })
  @IsString()
  subject: string;

  @ApiProperty({ example: 'You have an upcoming appointment...' })
  @IsOptional()
  @IsString()
  text?: string;

  @ApiProperty({ example: '<html>...</html>' })
  @IsOptional()
  @IsString()
  html?: string;
}
