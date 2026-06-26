import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientController } from './patient.controller';
import { PatientService } from './patient.service';
import { PatientSearchService } from './patient-search.service';
import { Patient } from './entities/patient.entity';
import { PatientHistory } from './entities/patient-history.entity';
import { Allergy } from './entities/allergy.entity';
import { Insurance } from './entities/insurance.entity';
import { EmergencyContact } from './entities/emergency-contact.entity';
import { NextOfKin } from './entities/next-of-kin.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Patient,
      PatientHistory,
      Allergy,
      Insurance,
      EmergencyContact,
      NextOfKin,
    ]),
  ],
  controllers: [PatientController],
  providers: [PatientService, PatientSearchService],
  exports: [PatientService],
})
export class PatientModule {}
