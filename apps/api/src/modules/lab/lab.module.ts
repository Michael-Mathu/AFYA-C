import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LabController } from './lab.controller';
import { LabService } from './lab.service';
import { LabTestCatalogue } from './entities/lab-test-catalogue.entity';
import { LabRequest } from './entities/lab-request.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LabTestCatalogue,
      LabRequest,
    ]),
  ],
  controllers: [LabController],
  providers: [LabService],
  exports: [LabService],
})
export class LabModule {}
