import { Controller, Get, Post, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { PrescriptionService } from './prescription.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { PrescriptionResponseDto } from './dto/prescription-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('prescriptions')
@Controller('prescriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PrescriptionController {
  constructor(private readonly prescriptionService: PrescriptionService) {}

  @Get()
  @Roles('DOCTOR', 'ADMIN', 'NURSE', 'PATIENT')
  @ApiOperation({ summary: 'List prescriptions' })
  @ApiResponse({ status: 200, description: 'List of prescriptions' })
  async findAll(@Request() req): Promise<PrescriptionResponseDto[]> {
    return this.prescriptionService.findAll(req.user);
  }

  @Get(':id')
  @Roles('DOCTOR', 'ADMIN', 'NURSE', 'PATIENT')
  @ApiOperation({ summary: 'Get prescription by ID' })
  @ApiResponse({ status: 200, description: 'Prescription details' })
  async findOne(
    @Param('id') id: string,
    @Request() req
  ): Promise<PrescriptionResponseDto> {
    return this.prescriptionService.findOne(id, req.user);
  }

  @Post()
  @Roles('DOCTOR', 'ADMIN')
  @ApiOperation({ summary: 'Create a new prescription' })
  @ApiResponse({ status: 201, description: 'Prescription created successfully' })
  @ApiBody({ type: CreatePrescriptionDto })
  async create(
    @Body() createPrescriptionDto: CreatePrescriptionDto,
    @Request() req
  ): Promise<PrescriptionResponseDto> {
    return this.prescriptionService.create(createPrescriptionDto, req.user);
  }

  @Put(':id')
  @Roles('DOCTOR', 'ADMIN')
  @ApiOperation({ summary: 'Update prescription' })
  @ApiResponse({ status: 200, description: 'Prescription updated successfully' })
  async update(
    @Param('id') id: string,
    @Body() updatePrescriptionDto: UpdatePrescriptionDto,
    @Request() req
  ): Promise<PrescriptionResponseDto> {
    return this.prescriptionService.update(id, updatePrescriptionDto, req.user);
  }

  @Put(':id/dispense')
  @Roles('PHARMACIST', 'ADMIN')
  @ApiOperation({ summary: 'Mark prescription as dispensed' })
  @ApiResponse({ status: 200, description: 'Prescription dispensed' })
  async dispense(
    @Param('id') id: string,
    @Request() req
  ): Promise<PrescriptionResponseDto> {
    return this.prescriptionService.dispense(id, req.user);
  }
}