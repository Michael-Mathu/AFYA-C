import { Injectable, NotFoundException, ConflictException, InjectRepository } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecursivePartial } from 'src/common/types/recursive-partial.type';
import { Patient } from './entities/patient.entity';
import { PatientHistory } from './entities/patient-history.entity';
import { Allergy } from './entities/allergy.entity';
import { Insurance } from './entities/insurance.entity';
import { EmergencyContact } from './entities/emergency-contact.entity';
import { NextOfKin } from './entities/next-of-kin.entity';
import { User } from '../core/entities/user.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PatientFilterDto } from './dto/patient-filter.dto';
import { PatientResponseDto } from './dto/patient-response.dto';
import { AllergyResponseDto } from './dto/allergy-response.dto';
import { generateMRN } from './utils/mrn-generator';

@Injectable()
export class PatientService {
  constructor(
    @InjectRepository(Patient)
    private patientsRepository: Repository<Patient>,
    @InjectRepository(PatientHistory)
    private patientHistoryRepository: Repository<PatientHistory>,
    @InjectRepository(Allergy)
    private allergiesRepository: Repository<Allergy>,
    @InjectRepository(Insurance)
    private insuranceRepository: Repository<Insurance>,
    @InjectRepository(EmergencyContact)
    private emergencyContactRepository: Repository<EmergencyContact>,
    @InjectRepository(NextOfKin)
    private nextOfKinRepository: Repository<NextOfKin>,
  ) {}

  async create(
    createPatientDto: CreatePatientDto,
    createdBy: User
  ): Promise<PatientResponseDto> {
    // Check for duplicate by ID number
    if (createPatientDto.idNumber) {
      const existingById = await this.patientsRepository.findOne({
        where: { idNumber: createPatientDto.idNumber, deletedAt: null },
      });
      if (existingById) {
        throw new ConflictException(
          `Patient with ID number ${createPatientDto.idNumber} already exists`
        );
      }
    }

    // Generate MRN (Medical Record Number)
    const mrn = await generateMRN(this.patientsRepository);

    // Create patient entity
    const patient = this.patientsRepository.create({
      ...createPatientDto,
      mrn,
      createdBy,
    });

    // Create related entities
    const savedPatient = await this.patientsRepository.save(patient);

    // Create allergy if provided
    if (createPatientDto.allergies?.length) {
      const allergy = this.allergiesRepository.create({
        patient: savedPatient,
        allergen: createPatientDto.allergies[0].allergen,
        reaction: createPatientDto.allergies[0].reaction,
        severity: createPatientDto.allergies[0].severity,
        notes: createPatientDto.allergies[0].notes,
      });
      await this.allergiesRepository.save(allergy);
    }

    // Create insurance if provided
    if (createPatientDto.insurance) {
      const insurance = this.insuranceRepository.create({
        patient: savedPatient,
        provider: createPatientDto.insurance.provider,
        insuranceNumber: createPatientDto.insurance.insuranceNumber,
        validUntil: createPatientDto.insurance.validUntil,
        policyHolderName: createPatientDto.insurance.policyHolderName,
        relationship: createPatientDto.insurance.relationship,
      });
      await this.insuranceRepository.save(insurance);
    }

    // Create emergency contact if provided
    if (createPatientDto.emergencyContact) {
      const emergencyContact = this.emergencyContactRepository.create({
        patient: savedPatient,
        name: createPatientDto.emergencyContact.name,
        phone: createPatientDto.emergencyContact.phone,
        relationship: createPatientDto.emergencyContact.relationship,
        address: createPatientDto.emergencyContact.address,
        email: createPatientDto.emergencyContact.email,
      });
      await this.emergencyContactRepository.save(emergencyContact);
    }

    // Create next of kin if provided
    if (createPatientDto.nextOfKin) {
      const nextOfKin = this.nextOfKinRepository.create({
        patient: savedPatient,
        name: createPatientDto.nextOfKin.name,
        phone: createPatientDto.nextOfKin.phone,
        relationship: createPatientDto.nextOfKin.relationship,
        address: createPatientDto.nextOfKin.address,
        email: createPatientDto.nextOfKin.email,
      });
      await this.nextOfKinRepository.save(nextOfKin);
    }

    return this.sanitizePatient(savedPatient);
  }

  async findAll(
    filterDto: PatientFilterDto,
    user: User
  ): Promise<{ data: PatientResponseDto[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, search, idNumber, mrn, phone } = filterDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.patientsRepository.createQueryBuilder('patient')
      .leftJoinAndSelect('patient.allergies', 'allergies')
      .leftJoinAndSelect('patient.insurance', 'insurance')
      .leftJoinAndSelect('patient.emergencyContact', 'emergencyContact')
      .leftJoinAndSelect('patient.nextOfKin', 'nextOfKin')
      .where('patient.deletedAt IS NULL');

    // Apply filters
    if (search) {
      queryBuilder.andWhere(
        '(patient.firstName LIKE :search OR patient.lastName LIKE :search OR patient.middleName LIKE :search)',
        { search: `%${search}%` }
      );
    }
    
    if (idNumber) {
      queryBuilder.andWhere('patient.idNumber = :idNumber', { idNumber });
    }
    
    if (mrn) {
      queryBuilder.andWhere('patient.mrn = :mrn', { mrn });
    }
    
    if (phone) {
      queryBuilder.andWhere('patient.phone = :phone', { phone });
    }

    // Apply pagination
    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('patient.createdAt', 'DESC')
      .getManyAndCount();

    return {
      data: data.map(patient => this.sanitizePatient(patient)),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string, user: User): Promise<PatientResponseDto> {
    const patient = await this.patientsRepository.findOne({
      where: { id, deletedAt: null },
      relations: ['allergies', 'insurance', 'emergencyContact', 'nextOfKin'],
    });

    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }

    return this.sanitizePatient(patient);
  }

  async update(
    id: string,
    updatePatientDto: UpdatePatientDto,
    updatedBy: User
  ): Promise<PatientResponseDto> {
    const patient = await this.patientsRepository.findOne({
      where: { id, deletedAt: null },
      relations: ['allergies', 'insurance', 'emergencyContact', 'nextOfKin'],
    });

    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }

    // Update patient
    Object.assign(patient, updatePatientDto);
    patient.updatedBy = updatedBy;

    const updatedPatient = await this.patientsRepository.save(patient);

    return this.sanitizePatient(updatedPatient);
  }

  async remove(id: string, deletedBy: User): Promise<{ message: string }> {
    const patient = await this.patientsRepository.findOne({
      where: { id, deletedAt: null },
    });

    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }

    patient.deletedAt = new Date();
    patient.deletedBy = deletedBy;
    await this.patientsRepository.save(patient);

    return { message: 'Patient deleted successfully' };
  }

  async getHistory(id: string, user: User): Promise<any[]> {
    const patient = await this.patientsRepository.findOne({
      where: { id, deletedAt: null },
    });

    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }

    // Get consultation history
    const history = await this.patientHistoryRepository.find({
      where: { patient: { id } },
      relations: ['consultation', 'consultation.doctor'],
      order: { createdAt: 'DESC' },
    });

    return history.map(record => ({
      id: record.id,
      date: record.createdAt,
      type: 'consultation',
      consultation: {
        id: record.consultation.id,
        date: record.consultation.consultationDate,
        doctor: record.consultation.doctor,
        diagnosis: record.consultation.diagnosis,
        notes: record.consultation.notes,
      },
    }));
  }

  async getBills(id: string, user: User): Promise<any[]> {
    const patient = await this.patientsRepository.findOne({
      where: { id, deletedAt: null },
    });

    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }

    // This would normally fetch bills from billing module
    // For now, return empty array
    return [];
  }

  async merge(
    mergeData: { sourcePatientId: string; targetPatientId: string },
    mergedBy: User
  ): Promise<{ message: string }> {
    const [sourcePatient, targetPatient] = await Promise.all([
      this.patientsRepository.findOne({
        where: { id: mergeData.sourcePatientId, deletedAt: null },
        relations: ['allergies', 'insurance', 'emergencyContact', 'nextOfKin'],
      }),
      this.patientsRepository.findOne({
        where: { id: mergeData.targetPatientId, deletedAt: null },
        relations: ['allergies', 'insurance', 'emergencyContact', 'nextOfKin'],
      }),
    ]);

    if (!sourcePatient || !targetPatient) {
      throw new NotFoundException('One or both patient records not found');
    }

    // Merge allergies
    if (sourcePatient.allergies?.length) {
      for (const allergy of sourcePatient.allergies) {
        const targetAllergy = await this.allergiesRepository.findOne({
          where: {
            patient: { id: targetPatient.id },
            allergen: allergy.allergen,
          },
        });
        
        if (!targetAllergy) {
          const newAllergy = this.allergiesRepository.create({
            ...allergy,
            patient: targetPatient,
          });
          await this.allergiesRepository.save(newAllergy);
        }
      }
    }

    // Merge insurance (prefer target if exists)
    if (sourcePatient.insurance && !targetPatient.insurance) {
      const newInsurance = this.insuranceRepository.create({
        ...sourcePatient.insurance,
        patient: targetPatient,
      });
      await this.insuranceRepository.save(newInsurance);
    }

    // Merge emergency contacts (if target doesn't have one)
    if (sourcePatient.emergencyContact && !targetPatient.emergencyContact) {
      const newEmergencyContact = this.emergencyContactRepository.create({
        ...sourcePatient.emergencyContact,
        patient: targetPatient,
      });
      await this.emergencyContactRepository.save(newEmergencyContact);
    }

    // Merge next of kin (if target doesn't have one)
    if (sourcePatient.nextOfKin && !targetPatient.nextOfKin) {
      const newNextOfKin = this.nextOfKinRepository.create({
        ...sourcePatient.nextOfKin,
        patient: targetPatient,
      });
      await this.nextOfKinRepository.save(newNextOfKin);
    }

    // Soft delete source patient
    sourcePatient.deletedAt = new Date();
    sourcePatient.deletedBy = mergedBy;
    await this.patientsRepository.save(sourcePatient);

    return { message: 'Patient records merged successfully' };
  }

  private sanitizePatient(patient: Patient): PatientResponseDto {
    const {
      allergies,
      insurance,
      emergencyContact,
      nextOfKin,
      ...rest
    } = patient;

    return {
      ...rest,
      allergies: allergies?.map(allergy => ({
        id: allergy.id,
        allergen: allergy.allergen,
        reaction: allergy.reaction,
        severity: allergy.severity,
        notes: allergy.notes,
      })),
      insurance: insurance ? {
        id: insurance.id,
        provider: insurance.provider,
        insuranceNumber: insurance.insuranceNumber,
        validUntil: insurance.validUntil,
        policyHolderName: insurance.policyHolderName,
        relationship: insurance.relationship,
      } : undefined,
      emergencyContact: emergencyContact ? {
        id: emergencyContact.id,
        name: emergencyContact.name,
        phone: emergencyContact.phone,
        relationship: emergencyContact.relationship,
        address: emergencyContact.address,
        email: emergencyContact.email,
      } : undefined,
      nextOfKin: nextOfKin ? {
        id: nextOfKin.id,
        name: nextOfKin.name,
        phone: nextOfKin.phone,
        relationship: nextOfKin.relationship,
        address: nextOfKin.address,
        email: nextOfKin.email,
      } : undefined,
    };
  }
}
