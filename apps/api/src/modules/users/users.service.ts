import { Injectable, NotFoundException, ConflictException, InjectRepository } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../core/entities/user.entity';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { UserRole } from './entities/user-role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,
    @InjectRepository(UserRole)
    private userRolesRepository: Repository<UserRole>,
  ) {}

  async create(
    createUserDto: CreateUserDto,
    createdBy: User
  ): Promise<any> {
    const { password, ...userData } = createUserDto;

    const existingUser = await this.usersRepository.findOne({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Default role is RECEPTIONIST if not specified
    let role: Role | null = null;
    if (createUserDto.roleId) {
      role = await this.rolesRepository.findOne({
        where: { id: createUserDto.roleId },
      });
      if (!role) {
        throw new NotFoundException(`Role with ID ${createUserDto.roleId} not found`);
      }
    } else {
      // Default to RECEPTIONIST role
      role = await this.rolesRepository.findOne({
        where: { name: 'RECEPTIONIST' },
      });
    }

    if (!role) {
      throw new NotFoundException('Default role RECEPTIONIST not found. Please check the database.');
    }

    const user = this.usersRepository.create({
      ...userData,
      passwordHash: hashedPassword,
      role,
      isActive: true,
      createdBy,
    });

    const savedUser = await this.usersRepository.save(user);

    return this.sanitizeUser(savedUser);
  }

  async findAll(user: User): Promise<any[]> {
    // Only SUPER_ADMIN can see all users
    if (user.role?.name !== 'SUPER_ADMIN') {
      throw new ConflictException('Access denied. Only Super Admin can view all users.');
    }

    const users = await this.usersRepository.find({
      relations: ['role', 'role.permissions'],
    });

    return users.map(u => this.sanitizeUser(u));
  }

  async findOne(id: string, requestingUser: User): Promise<any> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['role', 'role.permissions'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Authorization logic:
    // - SUPER_ADMIN can view any user
    // - Users can view their own profile
    // - Admin can view staff
    const canView = 
      requestingUser.role?.name === 'SUPER_ADMIN' ||
      requestingUser.id === user.id ||
      ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'PHARMACIST', 'LAB_TECH', 'CASHIER'].includes(requestingUser.role?.name);

    if (!canView) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.sanitizeUser(user);
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    updatedBy: User
  ): Promise<any> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check permissions: SUPER_ADMIN or updating own profile
    if (updatedBy.role?.name !== 'SUPER_ADMIN' && updatedBy.id !== user.id) {
      throw new ConflictException('Access denied. You can only update your own profile.');
    }

    // If role is being updated, check permissions
    if (updateUserDto.roleId && updateUserDto.roleId !== user.role.id) {
      const newRole = await this.rolesRepository.findOne({
        where: { id: updateUserDto.roleId },
      });
      if (!newRole) {
        throw new NotFoundException(`Role with ID ${updateUserDto.roleId} not found`);
      }

      // SUPER_ADMIN can assign any role
      if (updatedBy.role?.name !== 'SUPER_ADMIN') {
        throw new ConflictException('Access denied. Only Super Admin can assign roles.');
      }
    }

    Object.assign(user, updateUserDto);
    user.updatedBy = updatedBy;

    const updatedUser = await this.usersRepository.save(user);

    return this.sanitizeUser(updatedUser);
  }

  async remove(
    id: string,
    deletedBy: User
  ): Promise<{ message: string }> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Prevent self-deletion
    if (user.id === deletedBy.id) {
      throw new ConflictException('Cannot delete your own account.');
    }

    // Prevent deleting system users
    if (user.role?.isSystem) {
      throw new ConflictException('Cannot delete system users.');
    }

    // Soft delete
    user.deletedAt = new Date();
    user.deletedBy = deletedBy;
    await this.usersRepository.save(user);

    return { message: 'User deleted successfully' };
  }

  async assignRole(
    userId: string,
    assignRoleDto: AssignRoleDto,
    assignedBy: User
  ): Promise<{ message: string }> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const role = await this.rolesRepository.findOne({
      where: { id: assignRoleDto.roleId },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${assignRoleDto.roleId} not found`);
    }

    // Check permissions: SUPER_ADMIN can assign roles
    if (assignedBy.role?.name !== 'SUPER_ADMIN') {
      throw new ConflictException('Access denied. Only Super Admin can assign roles.');
    }

    // Check if role is system role (SUPER_ADMIN, ADMIN)
    if (role.isSystem) {
      throw new ConflictException('Cannot assign system roles.');
    }

    // Remove existing user roles
    await this.userRolesRepository.delete({ userId });

    // Assign new role
    const userRole = this.userRolesRepository.create({
      userId,
      roleId: role.id,
    });

    await this.userRolesRepository.save(userRole);

    // Update user's role
    user.role = role;
    user.updatedBy = assignedBy;
    await this.usersRepository.save(user);

    return { message: 'Role assigned successfully' };
  }

  async getAllRoles(user: User): Promise<any[]> {
    if (user.role?.name !== 'SUPER_ADMIN') {
      throw new ConflictException('Access denied. Only Super Admin can view all roles.');
    }

    const roles = await this.rolesRepository.find({
      relations: ['permissions'],
    });

    return roles.map(role => this.sanitizeRole(role));
  }

  async updateRolePermissions(
    roleId: string,
    permissionsData: { permissions: string[] },
    updatedBy: User
  ): Promise<{ message: string }> {
    if (updatedBy.role?.name !== 'SUPER_ADMIN') {
      throw new ConflictException('Access denied. Only Super Admin can update permissions.');
    }

    const role = await this.rolesRepository.findOne({
      where: { id: roleId },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }

    if (role.isSystem) {
      throw new ConflictException('Cannot modify system roles.');
    }

    // Get permissions
    const permissions = await this.permissionsRepository.find({
      where: { id: In(permissionsData.permissions) },
    });

    // Update role permissions
    role.permissions = permissions;
    await this.rolesRepository.save(role);

    return { message: 'Role permissions updated successfully' };
  }

  private sanitizeUser(user: User): any {
    const { passwordHash, ...rest } = user;

    return {
      ...rest,
      role: user.role ? {
        id: user.role.id,
        name: user.role.name,
        description: user.role.description,
        isSystem: user.role.isSystem,
      } : undefined,
      permissions: user.role?.permissions?.map(permission => ({
        id: permission.id,
        resource: permission.resource,
        action: permission.action,
        description: permission.description,
      })) || [],
    };
  }

  private sanitizeRole(role: any): any {
    const { ...rest } = role;

    return {
      ...rest,
      permissions: role.permissions?.map(permission => ({
        id: permission.id,
        resource: permission.resource,
        action: permission.action,
        description: permission.description,
      })) || [],
    };
  }
}