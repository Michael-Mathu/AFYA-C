#!/bin/bash
set -e

# Simple script to generate the API stub

echo "=== Generating AFYA-C API ==="

echo "\n1. Creating apps/api/src/main.ts..."
cat > apps/api/src/main.ts << 'EOF'
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`AFYA-C API is running on port ${port}`);
}

bootstrap().catch(err => {
  console.error('Error starting AFYA-C API:', err);
  process.exit(1);
});
EOF

echo "2. Creating apps/api/src/app.module.ts..."
cat > apps/api/src/app.module.ts << 'EOF'
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { AuthModule } from './modules/auth/auth.module';
import { PatientModule } from './modules/patient/patient.module';
import { AppointmentModule } from './modules/appointment/appointment.module';
import { ConsultationModule } from './modules/consultation/consultation.module';
import { PrescriptionModule } from './modules/prescription/prescription.module';
import { LabModule } from './modules/lab/lab.module';
import { PharmacyModule } from './modules/pharmacy/pharmacy.module';
import { BillingModule } from './modules/billing/billing.module';
import { UsersModule } from './modules/users/users.module';
import { ReportingModule } from './modules/reporting/reporting.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'password'),
        database: configService.get('DB_NAME', 'afya_c'),
        entities: ['dist/**/*.entity.js'],
        migrations: ['dist/migrations/*.js'],
        synchronize: process.env.NODE_ENV !== 'production',
        autoLoadEntities: true,
      }),
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'afya-c-secret-key',
      signOptions: { expiresIn: '15m' },
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'web', 'dist'),
      exclude: ['/api/(.*)/', '/api'],
    }),
    AuthModule,
    PatientModule,
    AppointmentModule,
    ConsultationModule,
    PrescriptionModule,
    LabModule,
    PharmacyModule,
    BillingModule,
    UsersModule,
    ReportingModule,
  ],
})
export class AppModule {}
EOF

echo "3. Creating apps/api/src/core module packages..."
mkdir -p apps/api/src/core

echo "4. Creating package.json for API..."
cat > apps/api/package.json << 'EOF'
{
  "name": "afya-c-api",
  "version": "1.0.0",
  "description": "AFYA-C Medical Centre Management System - API",
  "main": "dist/main.js",
  "scripts": {
    "start": "node dist/main.js",
    "build": "tsc -p tsconfig.json",
    "watch": "tsc -p tsconfig.json --watch",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage"
  },
  "dependencies": {
    "@nestjs/core": "^10.0.0",
    "@nestjs/common": "^10.0.0",
    "@nestjs/config": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@nestjs/typeorm": "^10.0.0",
    "@nestjs/jwt": "^10.0.0",
    "@nestjs/passport": "^10.0.0",
    "@nestjs/serve-static": "^4.0.0",
    "@prisma/client": "^5.0.0",
    "bcryptjs": "^2.4.3",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1",
    "reflect-metadata": "^0.2.0",
    "rxjs": "^7.8.0",
    "dotenv": "^16.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "ts-node": "^10.9.0",
    "@types/bcryptjs": "^2.4.3",
    "@types/express": "^4.17.0",
    "jest": "^29.0.0",
    "@types/jest": "^29.0.0"
  }
}
EOF

echo "5. Creating web package.json..."
cat > apps/web/package.json << 'EOF'
{
  "name": "afya-c-web",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "start": "webpack-dev-server --mode development --open",
    "build": "webpack --mode production",
    "test": "jest"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.0.0",
    "@ant-design/icons": "^4.0.0",
    "antd": "^4.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "typescript": "^5.0.0",
    "ts-loader": "^9.0.0",
    "webpack": "^5.0.0",
    "webpack-cli": "^5.0.0",
    "webpack-dev-server": "^4.0.0",
    "jest": "^29.0.0",
    "@types/jest": "^29.0.0"
  }
}
EOF

echo "=== AFYA-C API stub generation complete ==="
