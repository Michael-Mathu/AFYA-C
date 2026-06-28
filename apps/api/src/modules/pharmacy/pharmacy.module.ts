import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PharmacyController } from './pharmacy.controller';
import { PharmacyService } from './pharmacy.service';
import { Medication } from './entities/medication.entity';
import { StockEntry } from './entities/stock-entry.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Medication,
      StockEntry,
    ]),
  ],
  controllers: [PharmacyController],
  providers: [PharmacyService],
  exports: [PharmacyService],
})
export class PharmacyModule {}