import { Injectable, NotFoundException, ConflictException, InjectRepository } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '../patient/entities/patient.entity';
import { User } from '../../core/entities/user.entity';
import { Appointment } from '../appointment/entities/appointment.entity';
import { QueueEntry } from '../queue/entities/queue-entry.entity';
import { Consultation } from './entities/consultation.entity';
import { Vitals } from './entities/vitals.entity';
import { Diagnosis } from './entities/diagnosis.entity';
import { Prescription } from './entities/prescription.entity';
import { LabRequest } from './entities/lab-request.entity';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { UpdateConsultationDto } from './dto/update-consultation.dto';
import { ConsultationResponseDto } from './dto/consultation-response.dto';
import { AiService } from '../ai/ai.service';

@Injectable()
export class ConsultationService {
  constructor(
    @InjectRepository(Patient)
    private patientsRepository: Repository<Patient>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Appointment)
    private appointmentsRepository: Repository<Appointment>,
    @InjectRepository(QueueEntry)
    private queueEntriesRepository: Repository<QueueEntry>,
    @InjectRepository(Consultation)
    private consultationsRepository: Repository<Consultation>,
    @InjectRepository(Vitals)
    private vitalsRepository: Repository<Vitals>,
    @InjectRepository(Diagnosis)
    private diagnosesRepository: Repository<Diagnosis>,
    @InjectRepository(Prescription)
    private prescriptionsRepository: Repository<Prescription>,
    @InjectRepository(LabRequest)
    private labRequestsRepository: Repository<LabRequest>,
    private aiService: AiService,
  ) {}

  async findAll(user: User): Promise<any[]> {
    const whereClause: any = {};
    
    if (user.role?.name === 'DOCTOR') {
      whereClause.doctor = { id: user.id };
    } else if (user.role?.name === 'NURSE') {
      whereClause.nurse = { id: user.id };
    } else {
      whereClause.consultations = {}; // Admin/Receptionist can see all
    }

    const consultations = await this.consultationsRepository.find({
      where: whereClause,
      relations: ['patient', 'doctor', 'appointment', 'queueEntry', 'vitals', 'diagnoses', 'prescriptions', 'labRequests'],
    });

    return consultations.map(consultation => this.sanitizeConsultation(consultation));
  }

  async create(
    createConsultationDto: CreateConsultationDto,
    createdBy: User
  ): Promise<ConsultationResponseDto> {
    const { patientId, appointmentId, queueEntryId, ...consultationData } = createConsultationDto;

    const patient = await this.patientsRepository.findOne({
      where: { id: patientId, deletedAt: null },
    });

    if (!patient) {
      throw new NotFoundException(`Patient with ID ${patientId} not found`);
    }

    let appointment: any = null;
    let queueEntry: any = null;

    if (appointmentId) {
      appointment = await this.appointmentsRepository.findOne({
        where: { id: appointmentId, patient: { id: patientId } },
      });
      if (!appointment) {
        throw new NotFoundException(`Appointment with ID ${appointmentId} not found or doesn't belong to patient`);
      }
    }

    if (queueEntryId) {
      queueEntry = await this.queueEntriesRepository.findOne({
        where: { id: queueEntryId, patient: { id: patientId }, status: 'WAITING' },
      });
      if (!queueEntry) {
        throw new NotFoundException(`Queue entry with ID ${queueEntryId} not found or not in WAITING status`);
      }
    }

    const consultation = this.consultationsRepository.create({
      ...consultationData,
      patient,
      appointment,
      queueEntry,
      doctor: createdBy,
      createdBy,
    });

    const savedConsultation = await this.consultationsRepository.save(consultation);

    return this.sanitizeConsultation(savedConsultation);
  }

  async findOne(id: string, user: User): Promise<ConsultationResponseDto> {
    const consultation = await this.consultationsRepository.findOne({
      where: { id },
      relations: ['patient', 'doctor', 'appointment', 'queueEntry', 'vitals', 'diagnoses', 'prescriptions', 'labRequests'],
    });

    if (!consultation) {
      throw new NotFoundException(`Consultation with ID ${id} not found`);
    }

    // Authorization check
    if (user.role?.name === 'DOCTOR' && consultation.doctor.id !== user.id) {
      throw new NotFoundException(`Consultation with ID ${id} not found`);
    }

    return this.sanitizeConsultation(consultation);
  }

  async update(
    id: string,
    updateConsultationDto: UpdateConsultationDto,
    updatedBy: User
  ): Promise<ConsultationResponseDto> {
    const consultation = await this.consultationsRepository.findOne({
      where: { id },
      relations: ['patient', 'doctor', 'vitals', 'diagnoses', 'prescriptions', 'labRequests'],
    });

    if (!consultation) {
      throw new NotFoundException(`Consultation with ID ${id} not found`);
    }

    // Can only edit if not signed
    if (consultation.status === 'SIGNED') {
      throw new ConflictException('Cannot update a signed consultation');
    }

    Object.assign(consultation, updateConsultationDto);
    consultation.updatedBy = updatedBy;

    const updatedConsultation = await this.consultationsRepository.save(consultation);

    return this.sanitizeConsultation(updatedConsultation);
  }

  async sign(id: string, signedBy: User): Promise<ConsultationResponseDto> {
    const consultation = await this.consultationsRepository.findOne({
      where: { id },
      relations: ['patient', 'doctor', 'vitals', 'diagnoses', 'prescriptions', 'labRequests'],
    });

    if (!consultation) {
      throw new NotFoundException(`Consultation with ID ${id} not found`);
    }

    if (consultation.status === 'SIGNED') {
      throw new ConflictException('Consultation already signed');
    }

    consultation.status = 'SIGNED';
    consultation.signedBy = signedBy;
    consultation.signedAt = new Date();
    consultation.updatedBy = signedBy;

    const savedConsultation = await this.consultationsRepository.save(consultation);

    return this.sanitizeConsultation(savedConsultation);
  }

  async generateSoap(
    id: string,
    aiGenerateSoapDto: AiGenerateSoapDto,
    user: User
  ): Promise<ConsultationResponseDto> {
    const consultation = await this.consultationsRepository.findOne({
      where: { id },
      relations: ['patient', 'doctor'],
    });

    if (!consultation) {
      throw new NotFoundException(`Consultation with ID ${id} not found`);
    }

    // Call AI service to generate SOAP from free text
    const soapResult = await this.aiService.generateSoapNote(
      aiGenerateSoapDto.freeText,
      consultation.patient,
      user
    );

    consultation.subjective = soapResult.subjective;
    consultation.objective = soapResult.objective;
    consultation.assessment = soapResult.assessment;
    consultation.plan = soapResult.plan;
    consultation.aiNotes = JSON.stringify(soapResult.rawResponse);
    consultation.updatedBy = user;

    const savedConsultation = await this.consultationsRepository.save(consultation);

    return this.sanitizeConsultation(savedConsultation);
  }

  async summarizeHistory(
    id: string,
    aiSummarizeHistoryDto: AiSummarizeHistoryDto,
    user: User
  ): Promise<ConsultationResponseDto> {
    const consultation = await this.consultationsRepository.findOne({
      where: { id },
      relations: ['patient', 'doctor'],
    });

    if (!consultation) {
      throw new NotFoundException(`Consultation with ID ${id} not found`);
    }

    // Call AI service to summarize patient history
    const summaryResult = await this.aiService.summarizePatientHistory(
      consultation.patient,
      user
    );

    consultation.patientHistorySummary = summaryResult.summary;
    consultation.updatedBy = user;

    const savedConsultation = await this.consultationsRepository.save(consultation);

    return this.sanitizeConsultation(savedConsultation);
  }

  async suggestPrescription(
    id: string,
    aiSuggestPrescriptionDto: AiSuggestPrescriptionDto,
    user: User
  ): Promise<ConsultationResponseDto> {
    const consultation = await this.consultationsRepository.findOne({
      where: { id },
      relations: ['patient', 'doctor', 'diagnoses'],
    });

    if (!consultation) {
      throw new NotFoundException(`Consultation with ID ${id} not found`);
    }

    // Call AI service to suggest prescriptions based on diagnosis
    const suggestionResult = await this.aiService.suggestPrescriptions(
      consultation.diagnoses,
      consultation.patient,
      user
    );

    // Create prescription suggestions (not auto-saved)
    return {
      ...this.sanitizeConsultation(consultation),
      aiPrescriptionSuggestions: suggestionResult.suggestions,
    };
  }

  private sanitizeConsultation(consultation: Consultation): any {
    const {
      vitals,
      diagnoses,
      prescriptions,
      labRequests,
      ...rest
    } = consultation;

    return {
      ...rest,
      vitals: vitals ? {
        id: vitals.id,
        systolicBP: vitals.systolicBP,
        diastolicBP: vitals.diastolicBP,
        heartRate: vitals.heartRate,
        temperature: vitals.temperature,
        respiratoryRate: vitals.respiratoryRate,
        spo2: vitals.spo2,
        weightKg: vitals.weightKg,
        heightCm: vitals.heightCm,
        bmi: vitals.bmi,
        painScore: vitals.painScore,
        notes: vitals.notes,
        recordedAt: vitals.recordedAt,
      } : undefined,
      diagnoses: diagnoses?.map(diagnosis => ({
        id: diagnosis.id,
        icdCode: diagnosis.icdCode,
        description: diagnosis.description,
        type: diagnosis.type,
        notes: diagnosis.notes,
      })),
      prescriptions: prescriptions?.map(prescription => ({
        id: prescription.id,
        medicationName: prescription.medicationName,
        dosage: prescription.dosage,
        frequency: prescription.frequency,
        route: prescription.route,
        durationDays: prescription.durationDays,
        quantity: prescription.quantity,
        instructions: prescription.instructions,
        status: prescription.status,
        isAiSuggested: prescription.isAiSuggested,
        aiConfidence: prescription.aiConfidence,
      })),
      labRequests: labRequests?.map(request => ({
        id: request.id,
        testCatalogueId: request.testCatalogueId,
        priority: request.priority,
        clinicalNotes: request.clinicalNotes,
        status: request.status,
        specimenType: request.specimenType,
        resultValue: request.resultValue,
        resultJson: request.resultJson,
        resultNote: request.resultNote,
      })),
    };
  }
}
