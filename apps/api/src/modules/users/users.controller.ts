import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Create user' })
  @ApiResponse({ status: 201, description: 'User created' })
  @ApiBody({ type: CreateUserDto })
  async create(
    @Body() createUserDto: CreateUserDto,
    @Request() req
  ): Promise<UserResponseDto> {
    return this.usersService.create(createUserDto, req.user);
  }

  @Get()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'List users' })
  @ApiResponse({ status: 200, description: 'List of users' })
  async findAll(
    @Request() req
  ): Promise<UserResponseDto[]> {
    return this.usersService.findAll(req.user);
  }

  @Get(':id')
  @Roles('ADMIN', 'SUPER_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'PHARMACIST', 'LAB_TECH', 'CASHIER')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User details' })
  async findOne(
    @Param('id') id: string,
    @Request() req
  ): Promise<UserResponseDto> {
    return this.usersService.findOne(id, req.user);
  }

  @Put(':id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, description: 'User updated' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req
  ): Promise<UserResponseDto> {
    return this.usersService.update(id, updateUserDto, req.user);
  }

  @Delete(':id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Delete user (soft delete)' })
  @ApiResponse({ status: 200, description: 'User deleted' })
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id') id: string,
    @Request() req
  ): Promise<{ message: string }> {
    return this.usersService.remove(id, req.user);
  }

  @Post(':id/assign-role')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Assign role to user' })
  @ApiResponse({ status: 200, description: 'Role assigned' })
  async assignRole(
    @Param('id') id: string,
    @Body() assignRoleDto: AssignRoleDto,
    @Request() req
  ): Promise<{ message: string }> {
    return this.usersService.assignRole(id, assignRoleDto, req.user);
  }

  @Get('roles')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'List all roles with permissions' })
  @ApiResponse({ status: 200, description: 'List of roles' })
  async getAllRoles(
    @Request() req
  ): Promise<any[]> {
    return this.usersService.getAllRoles(req.user);
  }

  @Put('roles/:id/permissions')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Update role permissions' })
  @ApiResponse({ status: 200, description: 'Permissions updated' })
  async updateRolePermissions(
    @Param('id') id: string,
    @Body() permissionsData: { permissions: string[] },
    @Request() req
  ): Promise<{ message: string }> {
    return this.usersService.updateRolePermissions(id, permissionsData, req.user);
  }

  @Get('profile')
  @Roles('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'PHARMACIST', 'LAB_TECH', 'CASHIER')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile' })
  getProfile(@Request() req): UserResponseDto {
    return req.user;
  }

  @Put('profile')
  @Roles('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'PHARMACIST', 'LAB_TECH', 'CASHIER')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'User profile updated' })
  async updateProfile(
    @Body() updateUserDto: UpdateUserDto,
    @Request() req
  ): Promise<UserResponseDto> {
    return this.usersService.update(req.user.id, updateUserDto, req.user);
  }
}
