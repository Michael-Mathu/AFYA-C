import { Injectable, NotFoundException, ConflictException, InjectRepository } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '../patient/entities/patient.entity';
import { User } from '../../core/entities/user.entity';
import { Consultation } from '../consultation/entities/consultation.entity';
import { LabTestCatalogue } from './entities/lab-test-catalogue.entity';
import { LabRequest } from './entities/lab-request.entity';

@Injectable()
export class LabService {
  constructor(
    @InjectRepository(Patient)
    private patientsRepository: Repository<Patient>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Consultation)
    private consultationsRepository: Repository<Consultation>,
    @InjectRepository(LabTestCatalogue)
    private labTestCatalogueRepository: Repository<LabTestCatalogue>,
    @InjectRepository(LabRequest)
    private labRequestsRepository: Repository<LabRequest>,
  ) {}

  async getTests(): Promise<any[]> {
    const tests = await this.labTestCatalogueRepository.find({
      where: { deletedAt: null },
      relations: ['parent'],
    });

    return this.sanitizeTestCatalogue(tests);
  }

  async orderTest(
    createLabRequestDto: any,
    user: User
  ): Promise<any> {
    const { consultationId, patientId, testCatalogueId, priority, clinicalNotes } = createLabRequestDto;

    const patient = await this.patientsRepository.findOne({
      where: { id: patientId, deletedAt: null },
    });

    if (!patient) {
      throw new NotFoundException(`Patient with ID ${patientId} not found`);
    }

    const testCatalogue = await this.labTestCatalogueRepository.findOne({
      where: { id: testCatalogueId, deletedAt: null },
    });

    if (!testCatalogue) {
      throw new NotFoundException(`Lab test with ID ${testCatalogueId} not found`);
    }

    const consultation = await this.consultationsRepository.findOne({
      where: { id: consultationId, patient: { id: patientId } },
    });

    if (!consultation) {
      throw new NotFoundException(`Consultation with ID ${consultationId} not found or doesn't belong to patient`);
    }

    const labRequest = this.labRequestsRepository.create({
      consultation,
      patient,
      doctor: user,
      labTestCatalogue: testCatalogue,
      priority,
      clinicalNotes,
      status: 'ORDERED',
    });

    const savedRequest = await this.labRequestsRepository.save(labRequest);

    return this.sanitizeLabRequest(savedRequest);
  }

  async getRequests(user: User): Promise<any[]> {
    let whereClause: any = {};
    
    if (user.role?.name === 'LAB_TECH') {
      whereClause.status = 'ORDERED';
    }

    const requests = await this.labRequestsRepository.find({
      where: whereClause,
      relations: ['patient', 'doctor', 'labTestCatalogue', 'consultation'],
    });

    return requests.map(request => this.sanitizeLabRequest(request));
  }

  async markSampleCollected(
    id: string,
    user: User
  ): Promise<any> {
    const labRequest = await this.labRequestsRepository.findOne({
      where: { id },
      relations: ['patient', 'doctor', 'labTestCatalogue', 'consultation'],
    });

    if (!labRequest) {
      throw new NotFoundException(`Lab request with ID ${id} not found`);
    }

    if (labRequest.status !== 'ORDERED') {
      throw new ConflictException('Sample collection can only be marked for ORDERED requests');
    }

    labRequest.status = 'SAMPLE_COLLECTED';
    labRequest.specimenCollectedAt = new Date();
    labRequest.specimenCollectedBy = user;
    labRequest.updatedBy = user;

    const savedRequest = await this.labRequestsRepository.save(labRequest);

    return this.sanitizeLabRequest(savedRequest);
  }

  async enterResult(
    id: string,
    updateLabRequestDto: any,
    user: User
  ): Promise<any> {
    const labRequest = await this.labRequestsRepository.findOne({
      where: { id },
      relations: ['patient', 'doctor', 'labTestCatalogue', 'consultation'],
    });

    if (!labRequest) {
      throw new NotFoundException(`Lab request with ID ${id} not found`);
    }

    if (!['SAMPLE_COLLECTED', 'IN_PROGRESS'].includes(labRequest.status)) {
      throw new ConflictException('Results can only be entered for collected or in-progress requests');
    }

    // Validate result based on lab test type
    const resultValue = updateLabRequestDto.resultValue;
    const resultJson = updateLabRequestDto.resultJson;
    const resultNote = updateLabRequestDto.resultNote;

    if (updateLabRequestDto.isAbnormal === null) {
      // Simple numeric validation for basic labs
      if (resultValue) {
        const numericResult = parseFloat(resultValue);
        if (!isNaN(numericResult)) {
          // Simple range checking based on test type
          const referenceRanges: Record<string, { min: number; max: number }> = {
            'WBC': { min: 4.0, max: 11.0 },
            'RBC': { min: 4.5, max: 5.9 },
            'HGB': { min: 12.0, max: 16.0 },
            'HCT': { min: 40.0, max: 52.0 },
            'MCV': { min: 80.0, max: 100.0 },
            'MCH': { min: 27.0, max: 33.0 },
            'PLT': { min: 150.0, max: 450.0 },
            'GLUCOSE': { min: 70.0, max: 110.0 },
            'CREAT': { min: 0.6, max: 1.3 },
            'HB': { min: 8.0, max: 20.0 },
          };

          const shortCode = labRequest.labTestCatalogue.shortCode;
          if (referenceRanges[shortCode]) {
            const range = referenceRanges[shortCode];
            const isAbnormal = numericResult < range.min || numericResult > range.max;
            updateLabRequestDto.isAbnormal = isAbnormal;
          }
        }
      }
    }

    Object.assign(labRequest, updateLabRequestDto);
    labRequest.resultedBy = user;
    labRequest.resultedAt = new Date();
    labRequest.updatedBy = user;

    if (updateLabRequestDto.isAbnormal !== null) {
      labRequest.isAbnormal = updateLabRequestDto.isAbnormal;
    }

    const savedRequest = await this.labRequestsRepository.save(labRequest);

    return this.sanitizeLabRequest(savedRequest);
  }

  async getResult(
    id: string,
    user: User
  ): Promise<any> {
    const labRequest = await this.labRequestsRepository.findOne({
      where: { id },
      relations: ['patient', 'doctor', 'labTestCatalogue', 'consultation'],
    });

    if (!labRequest) {
      throw new NotFoundException(`Lab request with ID ${id} not found`);
    }

    // Authorization check - doctor, lab tech, admin, or patient can view results
    const canAccess = 
      user.role?.name === 'ADMIN' ||
      user.id === labRequest.doctor.id ||
      (user.role?.name === 'LAB_TECH' && ['SAMPLE_COLLECTED', 'IN_PROGRESS', 'COMPLETED'].includes(labRequest.status)) ||
      user.role?.name === 'DOCTOR' ||
      user.role?.name === 'NURSE';

    if (!canAccess) {
      throw new NotFoundException(`Lab request with ID ${id} not found`);
    }

    return this.sanitizeLabRequest(labRequest);
  }

  private sanitizeTestCatalogue(test: any): any {
    const {
      parent,
      ...rest
    } = test;

    return {
      ...rest,
      isPanel: test.isPanel,
      parent: parent ? {
        id: parent.id,
        name: parent.name,
        shortCode: parent.shortCode,
      } : undefined,
    };
  }

  private sanitizeLabRequest(request: any): any {
    const { consultation, ...rest } = request;

    return {
      ...rest,
      consultation: consultation ? {
        id: consultation.id,
        consultationDate: consultation.consultationDate,
        doctor: consultation.doctor,
      } : undefined,
    };
  }
}
