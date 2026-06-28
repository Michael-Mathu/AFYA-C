import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { PharmacyService } from './pharmacy.service';
import { CreateMedicationDto } from './dto/create-medication.dto';
import { UpdateMedicationDto } from './dto/update-medication.dto';
import { MedicationResponseDto } from './dto/medication-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('pharmacy')
@Controller('pharmacy')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PharmacyController {
  constructor(private readonly pharmacyService: PharmacyService) {}

  @Get('medications')
  @Roles('PHARMACIST', 'DOCTOR', 'ADMIN')
  @ApiOperation({ summary: 'List all medications' })
  @ApiResponse({ status: 200, description: 'List of medications' })
  async findAllMedications(): Promise<MedicationResponseDto[]> {
    return this.pharmacyService.findAllMedications();
  }

  @Get('medications/:id')
  @Roles('PHARMACIST', 'DOCTOR', 'ADMIN')
  @ApiOperation({ summary: 'Get medication by ID' })
  @ApiResponse({ status: 200, description: 'Medication details' })
  async findOneMedication(@Param('id') id: string): Promise<MedicationResponseDto> {
    return this.pharmacyService.findOneMedication(id);
  }

  @Post('medications')
  @Roles('PHARMACIST', 'ADMIN')
  @ApiOperation({ summary: 'Create a new medication' })
  @ApiResponse({ status: 201, description: 'Medication created successfully' })
  @ApiBody({ type: CreateMedicationDto })
  async createMedication(
    @Body() createMedicationDto: CreateMedicationDto,
    @Request() req
  ): Promise<MedicationResponseDto> {
    return this.pharmacyService.createMedication(createMedicationDto, req.user);
  }

  @Put('medications/:id')
  @Roles('PHARMACIST', 'ADMIN')
  @ApiOperation({ summary: 'Update medication' })
  @ApiResponse({ status: 200, description: 'Medication updated successfully' })
  async updateMedication(
    @Param('id') id: string,
    @Body() updateMedicationDto: UpdateMedicationDto,
    @Request() req
  ): Promise<MedicationResponseDto> {
    return this.pharmacyService.updateMedication(id, updateMedicationDto, req.user);
  }

  @Post('medications/:id/stock')
  @Roles('PHARMACIST', 'ADMIN')
  @ApiOperation({ summary: 'Add stock to medication' })
  @ApiResponse({ status: 200, description: 'Stock added successfully' })
  async addStock(
    @Param('id') id: string,
    @Body() body: { quantity: number; expiryDate: string },
    @Request() req
  ): Promise<{ message: string }> {
    return this.pharmacyService.addStock(id, body.quantity, body.expiryDate, req.user);
  }

  @Get('low-stock')
  @Roles('PHARMACIST', 'ADMIN')
  @ApiOperation({ summary: 'Get medications with low stock' })
  @ApiResponse({ status: 200, description: 'Low stock medications' })
  async getLowStock(): Promise<MedicationResponseDto[]> {
    return this.pharmacyService.getLowStock();
  }
}