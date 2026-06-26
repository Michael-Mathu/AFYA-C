import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

// Core modules
import { CoreConfigModule } from './modules/config/config.module';
import { HealthModule } from './modules/health/health.module';
import { EmailModule } from './modules/email/email.module';
import { FileStorageModule } from './modules/file-storage/file-storage.module';

// Feature modules
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

// Core entities
import { User } from './core/entities/user.entity';
import { Role } from './core/entities/role.entity';
import { Permission } from './core/entities/permission.entity';
import { UserRole } from './core/entities/user-role.entity';
import { Audit } from './core/entities/audit.entity';

// Guards, interceptors, filters
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './modules/auth/guards/roles.guard';
import { SecurityInterceptor } from './common/interceptors/security.interceptor';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { RateLimitingMiddleware } from './common/middleware/rate-limiting.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'afya_c',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV !== 'production',
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'afya-c-secret-key',
      signOptions: { expiresIn: process.env.JWT_EXPIRY || '15m' },
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // Core modules
    CoreConfigModule,
    HealthModule,
    EmailModule,
    FileStorageModule,

    // Feature modules
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
  controllers: [],
  providers: [
    // Global guards
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },

    // Global interceptors
    {
      provide: APP_INTERCEPTOR,
      useClass: SecurityInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },

    // Global exception filter
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },

    // Rate limiting middleware
    RateLimitingMiddleware,
  ],
})
export class AppModule {}
