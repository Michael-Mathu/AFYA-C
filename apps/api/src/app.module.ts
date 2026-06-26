import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { PatientModule } from './modules/patient/patient.module';
import { AppointmentModule } from './modules/appointment/appointment.module';
import { QueueModule } from './modules/queue/queue.module';
import { ConsultationModule } from './modules/consultation/consultation.module';
import { PrescriptionModule } from './modules/prescription/prescription.module';
import { LabModule } from './modules/lab/lab.module';
import { PharmacyModule } from './modules/pharmacy/pharmacy.module';
import { BillingModule } from './modules/billing/billing.module';
import { UsersModule } from './modules/users/users.module';
import { ReportingModule } from './modules/reporting/reporting.module';
import { AiModule } from './modules/ai/ai.module';
import { AuditModule } from './modules/audit/audit.module';

@Module({
  imports: [
    AuthModule,
    PatientModule,
    AppointmentModule,
    QueueModule,
    ConsultationModule,
    PrescriptionModule,
    LabModule,
    PharmacyModule,
    BillingModule,
    UsersModule,
    ReportingModule,
    AiModule,
    AuditModule,
  ],
})
export class AppModule {}
