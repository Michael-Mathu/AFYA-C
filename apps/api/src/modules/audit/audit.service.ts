import { Injectable, NotFoundException, InjectRepository } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../core/entities/user.entity';
import { Audit } from './entities/audit.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(Audit)
    private auditRepository: Repository<Audit>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(
    createAuditLogDto: any,
    user: User
  ): Promise<{ message: string }> {
    const audit = this.auditRepository.create({
      userId: user.id,
      action: createAuditLogDto.action,
      entityType: createAuditLogDto.entityType,
      entityId: createAuditLogDto.entityId,
      oldValues: createAuditLogDto.oldValues || null,
      newValues: createAuditLogDto.newValues || null,
      ipAddress: createAuditLogDto.ipAddress || '127.0.0.1',
      userAgent: createAuditLogDto.userAgent || 'NestJS',
      metadata: createAuditLogDto.metadata || null,
    });

    await this.auditRepository.save(audit);

    return { message: 'Audit log created successfully' };
  }

  async findAll(
    getAuditLogsDto: any,
    requestingUser: User
  ): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, entityType, action, userId, startDate, endDate } = getAuditLogsDto;
    const skip = (page - 1) * limit;

    let queryBuilder = this.auditRepository.createQueryBuilder('audit')
      .leftJoinAndSelect('audit.user', 'user')
      .where('1 = 1');

    // Apply filters
    if (entityType) {
      queryBuilder = queryBuilder.andWhere('audit.entityType = :entityType', { entityType });
    }

    if (action) {
      queryBuilder = queryBuilder.andWhere('audit.action = :action', { action });
    }

    if (userId) {
      queryBuilder = queryBuilder.andWhere('audit.userId = :userId', { userId });
    }

    if (startDate) {
      queryBuilder = queryBuilder.andWhere('audit.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder = queryBuilder.andWhere('audit.createdAt <= :endDate', { endDate });
    }

    // Check permissions: SUPER_ADMIN can see all, others see only their own
    if (requestingUser.role?.name !== 'SUPER_ADMIN') {
      queryBuilder = queryBuilder.andWhere('audit.userId = :requestingUserId', { requestingUserId: requestingUser.id });
    }

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('audit.createdAt', 'DESC')
      .getManyAndCount();

    return {
      data: data.map(audit => this.sanitizeAudit(audit)),
      total,
      page,
      limit,
    };
  }

  async export(
    getAuditLogsDto: any,
    requestingUser: User
  ): Promise<{ fileUrl: string }> {
    // In real implementation, generate CSV/Excel file with audit logs
    // For demo purposes, return a mock file URL
    const fileUrl = `https://afya-c.com/downloads/audit-logs-${Date.now()}.csv`;

    return { fileUrl };
  }

  async getStats(
    startDate?: string,
    endDate?: string,
    requestingUser?: User
  ): Promise<any> {
    let whereClause: any = {};

    if (startDate) {
      whereClause.createdAt = { $gte: startDate };
    }

    if (endDate) {
      whereClause.createdAt = { ...whereClause.createdAt, $lte: endDate };
    }

    if (requestingUser && requestingUser.role?.name !== 'SUPER_ADMIN') {
      whereClause.userId = requestingUser.id;
    }

    const stats = await this.auditRepository
      .createQueryBuilder('audit')
      .select('audit.action', 'action')
      .addSelect('COUNT(*)', 'count')
      .where(whereClause)
      .groupBy('audit.action')
      .getRawMany();

    const entityStats = await this.auditRepository
      .createQueryBuilder('audit')
      .select('audit.entityType', 'entityType')
      .addSelect('COUNT(*)', 'count')
      .where(whereClause)
      .groupBy('audit.entityType')
      .getRawMany();

    const userStats = await this.auditRepository
      .createQueryBuilder('audit')
      .leftJoin('audit.user', 'user')
      .select('user.username', 'username')
      .addSelect('COUNT(*)', 'count')
      .where(whereClause)
      .groupBy('user.username')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    const dailyStats = await this.auditRepository
      .createQueryBuilder('audit')
      .select('DATE(audit.createdAt)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where(whereClause)
      .groupBy('DATE(audit.createdAt)')
      .orderBy('date', 'DESC')
      .limit(30)
      .getRawMany();

    return {
      actionStats: stats,
      entityStats,
      userStats,
      dailyStats,
    };
  }

  private sanitizeAudit(audit: any): any {
    const { user, ...rest } = audit;

    return {
      ...rest,
      user: user ? {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      } : undefined,
    };
  }
}
