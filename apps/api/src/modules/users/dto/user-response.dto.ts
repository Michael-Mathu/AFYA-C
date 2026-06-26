import { IsString, IsOptional, IsUUID, IsBoolean, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName?: string;
  phone?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
  role?: {
    id: string;
    name: string;
    description: string;
    isSystem: boolean;
  };
  permissions?: any[];
}
