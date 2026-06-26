import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from './entities/patient.entity';

@Injectable()
export class PatientSearchService {
  constructor(
    @InjectRepository(Patient)
    private patientsRepository: Repository<Patient>,
  ) {}

  async searchPatients(query: string): Promise<Patient[]> {
    return this.patientsRepository.createQueryBuilder('patient')
      .where('patient.deletedAt IS NULL')
      .andWhere(
        '(patient.firstName ILIKE :query OR patient.lastName ILIKE :query OR patient.middleName ILIKE :query OR patient.mrn ILIKE :query)',
        { query: `%${query}%` }
      )
      .orWhere(
        '(patient.idNumber ILIKE :query OR patient.email ILIKE :query OR patient.phone ILIKE :query)'
      )
      .getMany();
  }

  async findDuplicatePatients(): Promise<Patient[]> {
    // This is a simple duplicate detection
    // For comprehensive duplicate detection, consider using fuzzy matching or ML algorithms
    return this.patientsRepository.createQueryBuilder('patient')
      .where('patient.deletedAt IS NULL')
      .addOrderBy('patient.lastName', 'ASC')
      .addOrderBy('patient.firstName', 'ASC')
      .getMany();
  }
}
