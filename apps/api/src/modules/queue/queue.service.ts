import { Injectable, NotFoundException, InjectRepository } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QueueEntry } from './entities/queue-entry.entity';
import { QueueStatus } from './entities/queue-status.entity';
import { User } from '../../core/entities/user.entity';
import { Patient } from '../patient/entities/patient.entity';
import { Appointment } from '../appointment/entities/appointment.entity';
import { CreateQueueEntryDto } from './dto/create-queue-entry.dto';
import { QueueEntryResponseDto } from './dto/queue-entry-response.dto';
import { QueueFilterDto } from './dto/queue-filter.dto';

@Injectable()
export class QueueService {
  constructor(
    @InjectRepository(QueueEntry)
    private queueEntriesRepository: Repository<QueueEntry>,
    @InjectRepository(QueueStatus)
    private queueStatusRepository: Repository<QueueStatus>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Patient)
    private patientsRepository: Repository<Patient>,
    @InjectRepository(Appointment)
    private appointmentsRepository: Repository<Appointment>,
  ) {}

  async findAll(filterDto: QueueFilterDto, user: User): Promise<{ data: QueueEntryResponseDto[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, status, department } = filterDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.queueEntriesRepository.createQueryBuilder('queueEntry')
      .leftJoinAndSelect('queueEntry.patient', 'patient')
      .leftJoinAndSelect('queueEntry.doctor', 'doctor')
      .leftJoinAndSelect('queueEntry.status', 'status')
      .leftJoinAndSelect('queueEntry.department', 'department')
      .where('queueEntry.isActive = :isActive', { isActive: true });

    if (status) {
      queryBuilder.andWhere('status.id = :status', { status });
    }

    if (department) {
      queryBuilder.andWhere('department = :department', { department });
    }

    if (user.role?.name === 'DOCTOR') {
      queryBuilder.andWhere('doctor.id = :doctorId', { doctorId: user.id });
    }

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('queueEntry.position', 'ASC')
      .getManyAndCount();

    return {
      data: data.map(queueEntry => this.sanitizeQueueEntry(queueEntry)),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string, user: User): Promise<QueueEntryResponseDto> {
    const queueEntry = await this.queueEntriesRepository.findOne({
      where: { id, isActive: true },
      relations: ['patient', 'doctor', 'status', 'appointment'],
    });

    if (!queueEntry) {
      throw new NotFoundException(`Queue entry with ID ${id} not found`);
    }

    if (user.role?.name === 'DOCTOR' && queueEntry.doctor.id !== user.id) {
      throw new NotFoundException(`Queue entry with ID ${id} not found`);
    }

    return this.sanitizeQueueEntry(queueEntry);
  }

  async create(
    createQueueEntryDto: CreateQueueEntryDto,
    createdBy: User
  ): Promise<QueueEntryResponseDto> {
    const patient = await this.patientsRepository.findOne({
      where: { id: createQueueEntryDto.patientId, deletedAt: null },
    });

    if (!patient) {
      throw new NotFoundException(`Patient with ID ${createQueueEntryDto.patientId} not found`);
    }

    const doctor = await this.usersRepository.findOne({
      where: { id: createQueueEntryDto.doctorId, deletedAt: null },
      relations: ['role'],
    });

    if (!doctor || doctor.role?.name !== 'DOCTOR') {
      throw new NotFoundException(`Doctor with ID ${createQueueEntryDto.doctorId} not found`);
    }

    const status = await this.queueStatusRepository.findOne({
      where: { id: createQueueEntryDto.statusId },
    });

    if (!status) {
      throw new NotFoundException(`Queue status with ID ${createQueueEntryDto.statusId} not found`);
    }

    const queueEntry = this.queueEntriesRepository.create({
      patient,
      doctor,
      status,
      department: createQueueEntryDto.department,
      priority: createQueueEntryDto.priority,
      estimatedWaitTimeMinutes: createQueueEntryDto.estimatedWaitTimeMinutes,
      tokenNumber: await this.generateTokenNumber(),
      position: await this.calculateNextPosition(createQueueEntryDto.doctorId),
      notes: createQueueEntryDto.notes,
      createdBy,
    });

    const savedQueueEntry = await this.queueEntriesRepository.save(queueEntry);

    return this.sanitizeQueueEntry(savedQueueEntry);
  }

  async assignNext(department: string, assignedBy: User): Promise<QueueEntryResponseDto> {
    const nextEntry = await this.queueEntriesRepository.findOne({
      where: {
        department,
        status: { id: 'WAITING' },
        isActive: true,
      },
      order: { position: 'ASC' },
    });

    if (!nextEntry) {
      throw new NotFoundException('No waiting patients in the queue');
    }

    nextEntry.status = await this.queueStatusRepository.findOne({ where: { id: 'IN_PROGRESS' } });
    nextEntry.assignedBy = assignedBy;
    nextEntry.assignedAt = new Date();

    const updatedQueueEntry = await this.queueEntriesRepository.save(nextEntry);

    return this.sanitizeQueueEntry(updatedQueueEntry);
  }

  async complete(id: string, completedBy: User): Promise<{ message: string }> {
    const queueEntry = await this.queueEntriesRepository.findOne({
      where: { id, isActive: true },
    });

    if (!queueEntry) {
      throw new NotFoundException(`Queue entry with ID ${id} not found`);
    }

    queueEntry.status = await this.queueStatusRepository.findOne({ where: { id: 'COMPLETED' } });
    queueEntry.completedBy = completedBy;
    queueEntry.completedAt = new Date();
    await this.queueEntriesRepository.save(queueEntry);

    return { message: 'Patient marked as completed' };
  }

  async cancel(id: string, cancelledBy: User): Promise<{ message: string }> {
    const queueEntry = await this.queueEntriesRepository.findOne({
      where: { id, isActive: true },
    });

    if (!queueEntry) {
      throw new NotFoundException(`Queue entry with ID ${id} not found`);
    }

    queueEntry.isActive = false;
    await this.queueEntriesRepository.save(queueEntry);

    return { message: 'Queue entry removed' };
  }

  private async generateTokenNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const count = await this.queueEntriesRepository.count();
    return `T${year}${month}${day}-${String(count + 1).padStart(4, '0')}`;
  }

  private async calculateNextPosition(doctorId: string): Promise<number> {
    const lastEntry = await this.queueEntriesRepository.findOne({
      where: { doctor: { id: doctorId }, isActive: true },
      order: { position: 'DESC' },
    });

    return lastEntry ? lastEntry.position + 1 : 1;
  }

  private sanitizeQueueEntry(queueEntry: QueueEntry): QueueEntryResponseDto {
    const {
      patient,
      doctor,
      status,
      createdBy,
      assignedBy,
      completedBy,
      ...rest
    } = queueEntry;

    return {
      ...rest,
      patient: {
        id: patient.id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        mrn: patient.mrn,
      },
      doctor: {
        id: doctor.id,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
      },
      status: {
        id: status.id,
        name: status.name,
      },
      createdBy: createdBy ? {
        id: createdBy.id,
        firstName: createdBy.firstName,
        lastName: createdBy.lastName,
      } : undefined,
      assignedBy: assignedBy ? {
        id: assignedBy.id,
        firstName: assignedBy.firstName,
        lastName: assignedBy.lastName,
      } : undefined,
      completedBy: completedBy ? {
        id: completedBy.id,
        firstName: completedBy.firstName,
        lastName: completedBy.lastName,
      } : undefined,
    };
  }
}