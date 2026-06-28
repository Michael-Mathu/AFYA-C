import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AppointmentResponseDto } from './dto/appointment-response.dto';
import { AppointmentFilterDto } from './dto/appointment-filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('appointments')
@Controller('appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Get()
  @Roles('DOCTOR', 'ADMIN', 'PATIENT')
  @ApiOperation({ summary: 'List appointments with pagination and filtering' })
  @ApiResponse({ status: 200, description: 'List of appointments' })
  async findAll(
    @Query() filterDto: AppointmentFilterDto,
    @Request() req
  ): Promise<{ data: AppointmentResponseDto[]; total: number; page: number; limit: number }> {
    return this.appointmentService.findAll(filterDto, req.user);
  }

  @Get(':id')
  @Roles('DOCTOR', 'ADMIN', 'PATIENT')
  @ApiOperation({ summary: 'Get appointment by ID' })
  @ApiResponse({ status: 200, description: 'Appointment details' })
  async findOne(
    @Param('id') id: string,
    @Request() req
  ): Promise<AppointmentResponseDto> {
    return this.appointmentService.findOne(id, req.user);
  }

  @Post()
  @Roles('PATIENT', 'RECEPTIONIST', 'ADMIN')
  @ApiOperation({ summary: 'Create a new appointment' })
  @ApiResponse({ status: 201, description: 'Appointment created successfully' })
  @ApiBody({ type: CreateAppointmentDto })
  async create(
    @Body() createAppointmentDto: CreateAppointmentDto,
    @Request() req
  ): Promise<AppointmentResponseDto> {
    return this.appointmentService.create(createAppointmentDto, req.user);
  }

  @Put(':id')
  @Roles('RECEPTIONIST', 'ADMIN', 'DOCTOR')
  @ApiOperation({ summary: 'Update appointment' })
  @ApiResponse({ status: 200, description: 'Appointment updated successfully' })
  async update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
    @Request() req
  ): Promise<AppointmentResponseDto> {
    return this.appointmentService.update(id, updateAppointmentDto, req.user);
  }

  @Put(':id/cancel')
  @Roles('RECEPTIONIST', 'ADMIN', 'DOCTOR', 'PATIENT')
  @ApiOperation({ summary: 'Cancel appointment' })
  @ApiResponse({ status: 200, description: 'Appointment cancelled successfully' })
  async cancel(
    @Param('id') id: string,
    @Request() req
  ): Promise<{ message: string }> {
    return this.appointmentService.cancel(id, req.user);
  }

  @Put(':id/complete')
  @Roles('RECEPTIONIST', 'ADMIN', 'DOCTOR')
  @ApiOperation({ summary: 'Complete appointment' })
  @ApiResponse({ status: 200, description: 'Appointment completed successfully' })
  async complete(
    @Param('id') id: string,
    @Request() req
  ): Promise<AppointmentResponseDto> {
    return this.appointmentService.complete(id, req.user);
  }

  @Get('doctor/:doctorId/availability')
  @Roles('DOCTOR', 'PATIENT', 'RECEPTIONIST', 'ADMIN')
  @ApiOperation({ summary: 'Check doctor availability' })
  @ApiResponse({ status: 200, description: 'Availability check result' })
  async checkAvailability(
    @Param('doctorId') doctorId: string,
    @Query('date') date: string,
    @Query('duration') durationMinutes: number
  ): Promise<{ available: boolean }> {
    const available = await this.appointmentService.checkAvailability(
      doctorId,
      date,
      durationMinutes
    );
    return { available };
  }
}