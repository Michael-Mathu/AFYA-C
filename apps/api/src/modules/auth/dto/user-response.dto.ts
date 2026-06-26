import { User } from '../entities/user.entity';

export class UserResponseDto {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName?: string;
  phone?: string;
  isActive: boolean;
  requiresMFA: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function sanitizeUser(user: User): UserResponseDto {
  const { passwordHash, ...rest } = user;
  return rest as UserResponseDto;
}
