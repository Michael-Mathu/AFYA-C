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
import { AppointmentModule } from '../appointment/appointment.module';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Consultation,
      Vitals,
      Diagnosis,
      Prescription,
      LabRequest,
    ]),
    AppointmentModule,
    QueueModule,
  ],
  controllers: [ConsultationController],
  providers: [ConsultationService, AiService],
  exports: [ConsultationService, AppointmentModule, QueueModule],
})
export class ConsultationModule {}
