import { Controller, Get, Post, Put, Body, Param, UseGuards, Request, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { LabService } from './lab.service';
import { CreateLabTestCatalogueDto } from './dto/create-lab-test-catalogue.dto';
import { CreateLabRequestDto } from './dto/create-lab-request.dto';
import { UpdateLabRequestDto } from './dto/update-lab-request.dto';
import { LabTestCatalogueResponseDto } from './dto/lab-test-catalogue-response.dto';
import { LabRequestResponseDto } from './dto/lab-request-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('lab')
@Controller('lab')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class LabController {
  constructor(private readonly labService: LabService) {}

  @Get('tests')
  @Roles('DOCTOR', 'ADMIN', 'NURSE', 'LAB_TECH')
  @ApiOperation({ summary: 'List lab test catalogue' })
  @ApiResponse({ status: 200, description: 'List of lab tests' })
  async getTests(): Promise<LabTestCatalogueResponseDto[]> {
    return this.labService.getTests();
  }

  @Post('requests')
  @Roles('DOCTOR', 'ADMIN', 'NURSE')
  @ApiOperation({ summary: 'Order lab test' })
  @ApiResponse({ status: 201, description: 'Lab test ordered' })
  @ApiBody({ type: CreateLabRequestDto })
  async orderTest(
    @Body() createLabRequestDto: CreateLabRequestDto,
    @Request() req
  ): Promise<LabRequestResponseDto> {
    return this.labService.orderTest(createLabRequestDto, req.user);
  }

  @Get('requests')
  @Roles('LAB_TECH', 'ADMIN')
  @ApiOperation({ summary: 'Get lab worklist' })
  @ApiResponse({ status: 200, description: 'Lab worklist' })
  async getRequests(
    @Request() req
  ): Promise<LabRequestResponseDto[]> {
    return this.labService.getRequests(req.user);
  }

  @Put('requests/:id/collect')
  @Roles('LAB_TECH', 'ADMIN')
  @ApiOperation({ summary: 'Mark sample collected' })
  @ApiResponse({ status: 200, description: 'Sample marked collected' })
  async markSampleCollected(
    @Param('id') id: string,
    @Request() req
  ): Promise<LabRequestResponseDto> {
    return this.labService.markSampleCollected(id, req.user);
  }

  @Put('requests/:id/result')
  @Roles('LAB_TECH', 'ADMIN')
  @ApiOperation({ summary: 'Enter lab result' })
  @ApiResponse({ status: 200, description: 'Result entered' })
  async enterResult(
    @Param('id') id: string,
    @Body() updateLabRequestDto: UpdateLabRequestDto,
    @Request() req
  ): Promise<LabRequestResponseDto> {
    return this.labService.enterResult(id, updateLabRequestDto, req.user);
  }

  @Get('requests/:id')
  @Roles('DOCTOR', 'ADMIN', 'NURSE', 'LAB_TECH')
  @ApiOperation({ summary: 'View lab result' })
  @ApiResponse({ status: 200, description: 'Lab result details' })
  async getResult(
    @Param('id') id: string,
    @Request() req
  ): Promise<LabRequestResponseDto> {
    return this.labService.getResult(id, req.user);
  }
}
