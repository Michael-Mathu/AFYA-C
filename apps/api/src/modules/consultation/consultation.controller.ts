import { Controller, Get, Post, Put, Body, Param, UseGuards, Request, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { ConsultationService } from './consultation.service';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { UpdateConsultationDto } from './dto/update-consultation.dto';
import { AiGenerateSoapDto } from './dto/ai-generate-soap.dto';
import { AiSummarizeHistoryDto } from './dto/ai-summarize-history.dto';
import { AiSuggestPrescriptionDto } from './dto/ai-suggest-prescription.dto';
import { ConsultationResponseDto } from './dto/consultation-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('consultations')
@Controller('consultations')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ConsultationController {
  constructor(private readonly consultationService: ConsultationService) {}

  @Get()
  @Roles('DOCTOR', 'ADMIN', 'NURSE')
  @ApiOperation({ summary: 'List consultations for doctor' })
  @ApiResponse({ status: 200, description: 'List of consultations' })
  async findAll(
    @Request() req
  ): Promise<any[]> {
    return this.consultationService.findAll(req.user);
  }

  @Post()
  @Roles('DOCTOR', 'ADMIN', 'NURSE')
  @ApiOperation({ summary: 'Start new consultation' })
  @ApiResponse({ status: 201, description: 'Consultation created' })
  @ApiBody({ type: CreateConsultationDto })
  async create(
    @Body() createConsultationDto: CreateConsultationDto,
    @Request() req
  ): Promise<ConsultationResponseDto> {
    return this.consultationService.create(createConsultationDto, req.user);
  }

  @Get(':id')
  @Roles('DOCTOR', 'ADMIN', 'NURSE')
  @ApiOperation({ summary: 'Get consultation details' })
  @ApiResponse({ status: 200, description: 'Consultation details' })
  async findOne(
    @Param('id') id: string,
    @Request() req
  ): Promise<ConsultationResponseDto> {
    return this.consultationService.findOne(id, req.user);
  }

  @Put(':id')
  @Roles('DOCTOR', 'ADMIN', 'NURSE')
  @ApiOperation({ summary: 'Update consultation' })
  @ApiResponse({ status: 200, description: 'Consultation updated' })
  async update(
    @Param('id') id: string,
    @Body() updateConsultationDto: UpdateConsultationDto,
    @Request() req
  ): Promise<ConsultationResponseDto> {
    return this.consultationService.update(id, updateConsultationDto, req.user);
  }

  @Put(':id/sign')
  @Roles('DOCTOR', 'ADMIN')
  @ApiOperation({ summary: 'Sign/finalize consultation' })
  @ApiResponse({ status: 200, description: 'Consultation signed' })
  async sign(
    @Param('id') id: string,
    @Request() req
  ): Promise<ConsultationResponseDto> {
    return this.consultationService.sign(id, req.user);
  }

  @Post(':id/ai-generate-soap')
  @Roles('DOCTOR', 'ADMIN', 'NURSE')
  @ApiOperation({ summary: 'AI generates SOAP note from free text' })
  @ApiResponse({ status: 200, description: 'SOAP note generated' })
  async generateSoap(
    @Param('id') id: string,
    @Body() aiGenerateSoapDto: AiGenerateSoapDto,
    @Request() req
  ): Promise<ConsultationResponseDto> {
    return this.consultationService.generateSoap(id, aiGenerateSoapDto, req.user);
  }

  @Post(':id/ai-summarize')
  @Roles('DOCTOR', 'ADMIN', 'NURSE')
  @ApiOperation({ summary: 'AI summarizes patient history' })
  @ApiResponse({ status: 200, description: 'Patient history summarized' })
  async summarizeHistory(
    @Param('id') id: string,
    @Body() aiSummarizeHistoryDto: AiSummarizeHistoryDto,
    @Request() req
  ): Promise<ConsultationResponseDto> {
    return this.consultationService.summarizeHistory(id, aiSummarizeHistoryDto, req.user);
  }

  @Post(':id/ai-suggest-prescription')
  @Roles('DOCTOR', 'ADMIN', 'NURSE')
  @ApiOperation({ summary: 'AI suggests medication for diagnosis' })
  @ApiResponse({ status: 200, description: 'Prescription suggestions generated' })
  async suggestPrescription(
    @Param('id') id: string,
    @Body() aiSuggestPrescriptionDto: AiSuggestPrescriptionDto,
    @Request() req
  ): Promise<ConsultationResponseDto> {
    return this.consultationService.suggestPrescription(id, aiSuggestPrescriptionDto, req.user);
  }
}
