import { Controller, Post, Body, UseGuards, Request, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { GenerateSoapNoteDto } from './dto/generate-soap-note.dto';
import { SummarizeHistoryDto } from './dto/summarize-history.dto';
import { SuggestPrescriptionsDto } from './dto/suggest-prescriptions.dto';
import { SearchClinicalDto } from './dto/search-clinical.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('ai')
@Controller('ai')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate-soap')
  @Roles('DOCTOR', 'ADMIN', 'NURSE')
  @ApiOperation({ summary: 'Generate SOAP note from doctor\'s free-text notes' })
  @ApiResponse({ status: 200, description: 'SOAP note generated' })
  @ApiBody({ type: GenerateSoapNoteDto })
  async generateSoap(
    @Body() generateSoapNoteDto: GenerateSoapNoteDto,
    @Request() req
  ): Promise<any> {
    return this.aiService.generateSoapNote(
      generateSoapNoteDto.freeText,
      req.user,
      req.user.patient || null // Pass patient if available
    );
  }

  @Post('summarize-history')
  @Roles('DOCTOR', 'ADMIN', 'NURSE')
  @ApiOperation({ summary: 'Summarize patient history and visit timeline' })
  @ApiResponse({ status: 200, description: 'Patient history summarized' })
  @ApiBody({ type: SummarizeHistoryDto })
  async summarizeHistory(
    @Body() summarizeHistoryDto: SummarizeHistoryDto,
    @Request() req
  ): Promise<any> {
    // In real implementation, fetch patient based on patientId
    const patient = await this.getPatientById(summarizeHistoryDto.patientId, req.user);
    return this.aiService.summarizePatientHistory(patient, req.user);
  }

  @Post('suggest-prescriptions')
  @Roles('DOCTOR', 'ADMIN', 'NURSE')
  @ApiOperation({ summary: 'Suggest medications based on diagnosis' })
  @ApiResponse({ status: 200, description: 'Prescription suggestions generated' })
  @ApiBody({ type: SuggestPrescriptionsDto })
  async suggestPrescriptions(
    @Body() suggestPrescriptionsDto: SuggestPrescriptionsDto,
    @Request() req
  ): Promise<any> {
    // In real implementation, fetch patient based on patientId
    const patient = await this.getPatientById(suggestPrescriptionsDto.patientId, req.user);
    return this.aiService.suggestPrescriptions(
      suggestPrescriptionsDto.diagnoses,
      patient,
      req.user
    );
  }

  @Post('search-clinical')
  @Roles('DOCTOR', 'ADMIN', 'NURSE')
  @ApiOperation({ summary: 'Search clinical information and guidelines' })
  @ApiResponse({ status: 200, description: 'Clinical information found' })
  @ApiBody({ type: SearchClinicalDto })
  async searchClinical(
    @Body() searchClinicalDto: SearchClinicalDto,
    @Request() req
  ): Promise<any> {
    // In real implementation, fetch patient based on patientId
    const patient = await this.getPatientById(searchClinicalDto.patientId, req.user);
    return this.aiService.searchClinical(
      searchClinicalDto.query,
      patient,
      req.user
    );
  }

  private async getPatientById(patientId: string, user: any): Promise<any> {
    // This would normally fetch from patient service
    // For demo purposes, return a mock patient
    return {
      id: patientId,
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: new Date('1985-06-15'),
      gender: 'MALE',
      mrn: 'MRN-2026-000001',
      idNumber: '12345678',
      allergies: [],
    };
  }
}
