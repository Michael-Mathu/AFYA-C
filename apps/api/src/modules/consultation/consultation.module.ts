import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConsultationController } from './consultation.controller';
import { ConsultationService } from './consultation.service';
import { Consultation } from './entities/consultation.entity';
import { Vitals } from './entities/vitals.entity';
import { Diagnosis } from './entities/diagnosis.entity';
import { Prescription } from './entities/prescription.entity';
import { LabRequest } from './entities/lab-request.entity';
import { AiService } from '../ai/ai.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Consultation,
      Vitals,
      Diagnosis,
      Prescription,
      LabRequest,
    ]),
  ],
  controllers: [ConsultationController],
  providers: [ConsultationService, AiService],
  exports: [ConsultationService],
})
export class ConsultationModule {}
