import { Injectable, NotFoundException, InjectRepository } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Medication } from './entities/medication.entity';
import { StockEntry } from './entities/stock-entry.entity';
import { User } from '../../core/entities/user.entity';
import { CreateMedicationDto } from './dto/create-medication.dto';
import { UpdateMedicationDto } from './dto/update-medication.dto';
import { MedicationResponseDto } from './dto/medication-response.dto';

@Injectable()
export class PharmacyService {
  constructor(
    @InjectRepository(Medication)
    private medicationsRepository: Repository<Medication>,
    @InjectRepository(StockEntry)
    private stockEntriesRepository: Repository<StockEntry>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAllMedications(): Promise<MedicationResponseDto[]> {
    const medications = await this.medicationsRepository.find({
      relations: ['stockEntries'],
      order: { name: 'ASC' },
    });

    return medications.map(med => this.sanitizeMedication(med));
  }

  async findOneMedication(id: string): Promise<MedicationResponseDto> {
    const medication = await this.medicationsRepository.findOne({
      where: { id },
      relations: ['stockEntries'],
    });

    if (!medication) {
      throw new NotFoundException(`Medication with ID ${id} not found`);
    }

    return this.sanitizeMedication(medication);
  }

  async createMedication(
    createMedicationDto: CreateMedicationDto,
    createdBy: User
  ): Promise<MedicationResponseDto> {
    const medication = this.medicationsRepository.create({
      ...createMedicationDto,
      createdBy,
    });

    const savedMedication = await this.medicationsRepository.save(medication);

    return this.sanitizeMedication(savedMedication);
  }

  async updateMedication(
    id: string,
    updateMedicationDto: UpdateMedicationDto,
    updatedBy: User
  ): Promise<MedicationResponseDto> {
    const medication = await this.medicationsRepository.findOne({
      where: { id },
      relations: ['stockEntries'],
    });

    if (!medication) {
      throw new NotFoundException(`Medication with ID ${id} not found`);
    }

    Object.assign(medication, updateMedicationDto);
    medication.updatedBy = updatedBy;

    const updatedMedication = await this.medicationsRepository.save(medication);

    return this.sanitizeMedication(updatedMedication);
  }

  async addStock(
    medicationId: string,
    quantity: number,
    expiryDate: string,
    addedBy: User
  ): Promise<{ message: string }> {
    const medication = await this.medicationsRepository.findOne({
      where: { id: medicationId },
    });

    if (!medication) {
      throw new NotFoundException(`Medication with ID ${medicationId} not found`);
    }

    const stockEntry = this.stockEntriesRepository.create({
      medication,
      quantity,
      expiryDate: new Date(expiryDate),
      addedBy,
    });

    await this.stockEntriesRepository.save(stockEntry);

    medication.currentStock = (medication.currentStock || 0) + quantity;
    await this.medicationsRepository.save(medication);

    return { message: 'Stock added successfully' };
  }

  async getLowStock(): Promise<MedicationResponseDto[]> {
    const medications = await this.medicationsRepository.find({
      where: { isActive: true },
      relations: ['stockEntries'],
    });

    return medications
      .filter(med => (med.currentStock || 0) <= (med.minimumStock || 0))
      .map(med => this.sanitizeMedication(med));
  }

  private sanitizeMedication(medication: Medication): MedicationResponseDto {
    const { stockEntries, ...rest } = medication;

    return {
      ...rest,
      totalStock: stockEntries?.reduce((sum, entry) => sum + entry.quantity, 0) || 0,
    };
  }
}