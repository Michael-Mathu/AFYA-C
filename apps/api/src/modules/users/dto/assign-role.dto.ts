import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignRoleDto {
  @ApiProperty({ example: 'uuid-of-role' })
  @IsUUID()
  roleId: string;
}
