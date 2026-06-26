import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ReportingService } from './reporting.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('reports')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReportingController {
  constructor(private readonly reportingService: ReportingService) {}

  @Get('daily-summary')
  @Roles('ADMIN', 'CASHIER')
  @ApiOperation({ summary: 'Get daily visit summary' })
  @ApiResponse({ status: 200, description: 'Daily summary data' })
  async getDailySummary(
    @Request() req,
    @Query('date') date?: string
  ): Promise<any> {
    return this.reportingService.getDailySummary(req.user, date);
  }

  @Get('revenue/daily')
  @Roles('ADMIN', 'CASHIER')
  @ApiOperation({ summary: 'Get daily revenue' })
  @ApiResponse({ status: 200, description: 'Daily revenue data' })
  async getDailyRevenue(
    @Request() req,
    @Query('date') date?: string
  ): Promise<any> {
    return this.reportingService.getDailyRevenue(req.user, date);
  }

  @Get('revenue/monthly')
  @Roles('ADMIN', 'CASHIER')
  @ApiOperation({ summary: 'Get monthly revenue' })
  @ApiResponse({ status: 200, description: 'Monthly revenue data' })
  async getMonthlyRevenue(
    @Request() req,
    @Query('month') month?: string,
    @Query('year') year?: number
  ): Promise<any> {
    return this.reportingService.getMonthlyRevenue(req.user, month, year);
  }

  @Get('patient-demographics')
  @Roles('ADMIN', 'CASHIER')
  @ApiOperation({ summary: 'Get patient demographics report' })
  @ApiResponse({ status: 200, description: 'Patient demographics data' })
  async getPatientDemographics(
    @Request() req,
    @Query('ageGroup') ageGroup?: string,
    @Query('gender') gender?: string
  ): Promise<any> {
    return this.reportingService.getPatientDemographics(req.user, ageGroup, gender);
  }

  @Get('diagnoses-frequency')
  @Roles('ADMIN', 'DOCTOR', 'NURSE')
  @ApiOperation({ summary: 'Get diagnoses frequency report' })
  @ApiResponse({ status: 200, description: 'Diagnoses frequency data' })
  async getDiagnosesFrequency(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: number
  ): Promise<any> {
    return this.reportingService.getDiagnosesFrequency(req.user, startDate, endDate, limit);
  }

  @Get('revenue-by-department')
  @Roles('ADMIN', 'CASHIER')
  @ApiOperation({ summary: 'Get revenue by department' })
  @ApiResponse({ status: 200, description: 'Revenue by department data' })
  async getRevenueByDepartment(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ): Promise<any> {
    return this.reportingService.getRevenueByDepartment(req.user, startDate, endDate);
  }

  @Get('appointment-adherence')
  @Roles('ADMIN', 'CASHIER', 'RECEPTIONIST')
  @ApiOperation({ summary: 'Get appointment adherence report' })
  @ApiResponse({ status: 200, description: 'Appointment adherence data' })
  async getAppointmentAdherence(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ): Promise<any> {
    return this.reportingService.getAppointmentAdherence(req.user, startDate, endDate);
  }

  @Get('stock-usage')
  @Roles('ADMIN', 'PHARMACIST')
  @ApiOperation({ summary: 'Get stock usage report' })
  @ApiResponse({ status: 200, description: 'Stock usage data' })
  async getStockUsage(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ): Promise<any> {
    return this.reportingService.getStockUsage(req.user, startDate, endDate);
  }

  @Get('patient-visits')
  @Roles('ADMIN', 'DOCTOR', 'NURSE')
  @ApiOperation({ summary: 'Get patient visits report' })
  @ApiResponse({ status: 200, description: 'Patient visits data' })
  async getPatientVisits(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('department') department?: string
  ): Promise<any> {
    return this.reportingService.getPatientVisits(req.user, startDate, endDate, department);
  }
}
