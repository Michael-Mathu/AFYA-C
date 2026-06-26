import { Injectable, NotFoundException, ConflictException, InjectRepository } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecursivePartial } from 'src/common/types/recursive-partial.type';
import { User } from '../core/entities/user.entity';
import { Role } from '../core/entities/role.entity';
import { Permission } from '../core/entities/permission.entity';
import { UserRole } from '../core/entities/user-role.entity';
import { Audit } from '../core/entities/audit.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,
    @InjectRepository(UserRole)
    private userRolesRepository: Repository<UserRole>,
    @InjectRepository(Audit)
    private auditRepository: Repository<Audit>,
  ) {}

  async register(createUserDto: any, req): Promise<any> {
    const { password, ...userData } = createUserDto;
    
    const existingUser = await this.usersRepository.findOne({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const user = this.usersRepository.create({
      ...userData,
      passwordHash: await this.hashPassword(password),
      isActive: true,
    });

    const savedUser = await this.usersRepository.save(user);
    
    // Log audit entry
    await this.logAudit('CREATE', 'user', savedUser.id, null, savedUser, req);

    return this.sanitizeUser(savedUser);
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersRepository.findOne({
      where: { email },
      relations: ['role', 'role.permissions'],
    });

    if (user && await this.comparePasswords(password, user.passwordHash)) {
      return this.sanitizeUser(user);
    }

    return null;
  }

  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role?.name,
    };

    return {
      accessToken: this.generateToken(payload),
      refreshToken: this.generateToken(payload, { expiresIn: '7d' }),
      user: this.sanitizeUser(user),
    };
  }

  async refreshToken(user: any, refreshToken: string) {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role?.name,
    };

    return {
      accessToken: this.generateToken(payload),
      refreshToken: this.generateToken(payload, { expiresIn: '7d' }),
    };
  }

  async logout(user: any, req): Promise<{ message: string }> {
    // Log logout
    await this.logAudit('LOGOUT', 'user', user.id, user, null, req);
    return { message: 'Logged out successfully' };
  }

  async hashPassword(password: string): Promise<string> {
    const bcrypt = require('bcryptjs');
    return bcrypt.hash(password, 12);
  }

  async comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
    const bcrypt = require('bcryptjs');
    return bcrypt.compare(password, hashedPassword);
  }

  generateToken(payload: any, options?: any): string {
    const jwt = require('jsonwebtoken');
    const secret = process.env.JWT_SECRET || 'afya-c-secret-key';
    return jwt.sign(payload, secret, options || { expiresIn: '15m' });
  }

  private async logAudit(
    action: string,
    entityType: string,
    entityId: string,
    oldValues: any,
    newValues: any,
    req
  ): Promise<void> {
    const audit = this.auditRepository.create({
      userId: req.user?.id,
      action,
      entityType,
      entityId,
      oldValues,
      newValues,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });
    await this.auditRepository.save(audit);
  }

  private sanitizeUser(user: any): any {
    const { passwordHash, ...rest } = user;
    return rest;
  }
}
