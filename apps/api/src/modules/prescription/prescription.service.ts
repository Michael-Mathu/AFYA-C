import { Injectable, NotFoundException, InjectRepository } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prescription } from './entities/prescription.entity';
import { User } from '../../core/entities/user.entity';
import { Patient } from '../patient/entities/patient.entity';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { PrescriptionResponseDto } from './dto/prescription-response.dto';

@Injectable()
export class PrescriptionService {
  constructor(
    @InjectRepository(Prescription)
    private prescriptionsRepository: Repository<Prescription>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Patient)
    private patientsRepository: Repository<Patient>,
  ) {}

  async findAll(user: User): Promise<PrescriptionResponseDto[]> {
    const whereClause: any = {};

    if (user.role?.name === 'DOCTOR') {
      whereClause.prescribedBy = { id: user.id };
    } else if (user.role?.name === 'PATIENT') {
      whereClause.patient = { id: user.id };
    }

    const prescriptions = await this.prescriptionsRepository.find({
      where: whereClause,
      relations: ['patient', 'prescribedBy', 'consultation'],
      order: { createdAt: 'DESC' },
    });

    return prescriptions.map(p => this.sanitizePrescription(p));
  }

  async findOne(id: string, user: User): Promise<PrescriptionResponseDto> {
    const prescription = await this.prescriptionsRepository.findOne({
      where: { id },
      relations: ['patient', 'prescribedBy', 'consultation'],
    });

    if (!prescription) {
      throw new NotFoundException(`Prescription with ID ${id} not found`);
    }

    return this.sanitizePrescription(prescription);
  }

  async create(
    createPrescriptionDto: CreatePrescriptionDto,
    createdBy: User
  ): Promise<PrescriptionResponseDto> {
    const patient = await this.patientsRepository.findOne({
      where: { id: createPrescriptionDto.patientId, deletedAt: null },
    });

    if (!patient) {
      throw new NotFoundException(`Patient with ID ${createPrescriptionDto.patientId} not found`);
    }

    const prescription = this.prescriptionsRepository.create({
      patient,
      prescribedBy: createdBy,
      consultation: createPrescriptionDto.consultationId ? { id: createPrescriptionDto.consultationId } : null,
      medicationName: createPrescriptionDto.medicationName,
      dosage: createPrescriptionDto.dosage,
      frequency: createPrescriptionDto.frequency,
      route: createPrescriptionDto.route,
      durationDays: createPrescriptionDto.durationDays,
      quantity: createPrescriptionDto.quantity,
      instructions: createPrescriptionDto.instructions,
      status: 'ACTIVE',
      isAiSuggested: createPrescriptionDto.isAiSuggested || false,
      aiConfidence: createPrescriptionDto.aiConfidence,
    });

    const savedPrescription = await this.prescriptionsRepository.save(prescription);

    return this.sanitizePrescription(savedPrescription);
  }

  async update(
    id: string,
    updatePrescriptionDto: UpdatePrescriptionDto,
    updatedBy: User
  ): Promise<PrescriptionResponseDto> {
    const prescription = await this.prescriptionsRepository.findOne({
      where: { id },
      relations: ['patient', 'prescribedBy', 'consultation'],
    });

    if (!prescription) {
      throw new NotFoundException(`Prescription with ID ${id} not found`);
    }

    Object.assign(prescription, updatePrescriptionDto);
    prescription.updatedBy = updatedBy;

    const updatedPrescription = await this.prescriptionsRepository.save(prescription);

    return this.sanitizePrescription(updatedPrescription);
  }

  async dispense(id: string, dispensedBy: User): Promise<PrescriptionResponseDto> {
    const prescription = await this.prescriptionsRepository.findOne({
      where: { id },
      relations: ['patient', 'prescribedBy', 'consultation'],
    });

    if (!prescription) {
      throw new NotFoundException(`Prescription with ID ${id} not found`);
    }

    prescription.status = 'DISPENSED';
    prescription.dispensedAt = new Date();
    prescription.dispensedBy = dispensedBy;

    const updatedPrescription = await this.prescriptionsRepository.save(prescription);

    return this.sanitizePrescription(updatedPrescription);
  }

  private sanitizePrescription(prescription: Prescription): PrescriptionResponseDto {
    const {
      patient,
      prescribedBy,
      consultation,
      ...rest
    } = prescription;

    return {
      ...rest,
      patient: {
        id: patient.id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        mrn: patient.mrn,
      },
      prescribedBy: {
        id: prescribedBy.id,
        firstName: prescribedBy.firstName,
        lastName: prescribedBy.lastName,
      },
      consultation: consultation ? {
        id: consultation.id,
        consultationDate: consultation.consultationDate,
      } : undefined,
    };
  }
}