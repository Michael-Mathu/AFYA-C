import { Controller, Post, Body, UseGuards, Request, Get, Query, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { GetAuditLogsDto } from './dto/get-audit-logs.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('audit')
@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Post()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Create audit log entry' })
  @ApiResponse({ status: 201, description: 'Audit log created' })
  @ApiBody({ type: CreateAuditLogDto })
  async create(
    @Body() createAuditLogDto: CreateAuditLogDto,
    @Request() req
  ): Promise<{ message: string }> {
    return this.auditService.create(createAuditLogDto, req.user);
  }

  @Get()
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Get audit logs with filtering' })
  @ApiResponse({ status: 200, description: 'List of audit logs' })
  async findAll(
    @Query() getAuditLogsDto: GetAuditLogsDto,
    @Request() req
  ): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    return this.auditService.findAll(getAuditLogsDto, req.user);
  }

  @Get('export')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Export audit logs' })
  @ApiResponse({ status: 200, description: 'Audit logs exported' })
  async export(
    @Query() getAuditLogsDto: GetAuditLogsDto,
    @Request() req
  ): Promise<{ fileUrl: string }> {
    return this.auditService.export(getAuditLogsDto, req.user);
  }

  @Get('stats')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Get audit statistics' })
  @ApiResponse({ status: 200, description: 'Audit statistics' })
  async getStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Request() req
  ): Promise<any> {
    return this.auditService.getStats(startDate, endDate, req.user);
  }
}
