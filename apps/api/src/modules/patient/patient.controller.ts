import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { PatientService } from './patient.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PatientFilterDto } from './dto/patient-filter.dto';
import { PatientResponseDto } from './dto/patient-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('patients')
@Controller('patients')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Post()
  @Roles('RECEPTIONIST', 'ADMIN', 'DOCTOR', 'NURSE')
  @ApiOperation({ summary: 'Create a new patient' })
  @ApiResponse({ status: 201, description: 'Patient created successfully' })
  @ApiBody({ type: CreatePatientDto })
  async create(
    @Body() createPatientDto: CreatePatientDto,
    @Request() req
  ): Promise<PatientResponseDto> {
    return this.patientService.create(createPatientDto, req.user);
  }

  @Get()
  @Roles('RECEPTIONIST', 'ADMIN', 'DOCTOR', 'NURSE')
  @ApiOperation({ summary: 'List patients with pagination and filtering' })
  @ApiResponse({ status: 200, description: 'List of patients' })
  async findAll(
    @Query() filterDto: PatientFilterDto,
    @Request() req
  ): Promise<{ data: PatientResponseDto[]; total: number; page: number; limit: number }> {
    return this.patientService.findAll(filterDto, req.user);
  }

  @Get(':id')
  @Roles('RECEPTIONIST', 'ADMIN', 'DOCTOR', 'NURSE')
  @ApiOperation({ summary: 'Get patient by ID' })
  @ApiResponse({ status: 200, description: 'Patient details' })
  async findOne(
    @Param('id') id: string,
    @Request() req
  ): Promise<PatientResponseDto> {
    return this.patientService.findOne(id, req.user);
  }

  @Put(':id')
  @Roles('RECEPTIONIST', 'ADMIN', 'DOCTOR', 'NURSE')
  @ApiOperation({ summary: 'Update patient' })
  @ApiResponse({ status: 200, description: 'Patient updated successfully' })
  async update(
    @Param('id') id: string,
    @Body() updatePatientDto: UpdatePatientDto,
    @Request() req
  ): Promise<PatientResponseDto> {
    return this.patientService.update(id, updatePatientDto, req.user);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete patient (soft delete)' })
  @ApiResponse({ status: 200, description: 'Patient deleted successfully' })
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id') id: string,
    @Request() req
  ): Promise<{ message: string }> {
    return this.patientService.remove(id, req.user);
  }

  @Get(':id/history')
  @Roles('RECEPTIONIST', 'ADMIN', 'DOCTOR', 'NURSE')
  @ApiOperation({ summary: 'Get patient visit history' })
  @ApiResponse({ status: 200, description: 'Patient visit history' })
  async getHistory(
    @Param('id') id: string,
    @Request() req
  ): Promise<any[]> {
    return this.patientService.getHistory(id, req.user);
  }

  @Get(':id/bills')
  @Roles('RECEPTIONIST', 'ADMIN', 'CASHIER')
  @ApiOperation({ summary: 'Get patient billing history' })
  @ApiResponse({ status: 200, description: 'Patient billing history' })
  async getBills(
    @Param('id') id: string,
    @Request() req
  ): Promise<any[]> {
    return this.patientService.getBills(id, req.user);
  }

  @Post('merge')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Merge duplicate patient records' })
  @ApiResponse({ status: 200, description: 'Patient records merged successfully' })
  async merge(
    @Body() mergeData: { sourcePatientId: string; targetPatientId: string },
    @Request() req
  ): Promise<{ message: string }> {
    return this.patientService.merge(mergeData, req.user);
  }
}
