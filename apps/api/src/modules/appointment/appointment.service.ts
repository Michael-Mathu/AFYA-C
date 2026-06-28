import { Injectable, NotFoundException, ConflictException, InjectRepository } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from './entities/appointment.entity';
import { AppointmentType } from './entities/appointment-type.entity';
import { Availability } from './entities/availability.entity';
import { User } from '../../core/entities/user.entity';
import { Patient } from '../patient/entities/patient.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AppointmentResponseDto } from './dto/appointment-response.dto';
import { AppointmentFilterDto } from './dto/appointment-filter.dto';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentsRepository: Repository<Appointment>,
    @InjectRepository(AppointmentType)
    private appointmentTypeRepository: Repository<AppointmentType>,
    @InjectRepository(Availability)
    private availabilityRepository: Repository<Availability>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Patient)
    private patientsRepository: Repository<Patient>,
  ) {}

  async findAll(filterDto: AppointmentFilterDto, user: User): Promise<{ data: AppointmentResponseDto[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, status, type, date, patientId } = filterDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.appointmentsRepository.createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.type', 'type')
      .leftJoinAndSelect('appointment.doctor', 'doctor')
      .leftJoinAndSelect('appointment.patient', 'patient')
      .leftJoinAndSelect('appointment.createdBy', 'createdBy')
      .where('appointment.deletedAt IS NULL');

    if (patientId) {
      queryBuilder.andWhere('appointment.patient.id = :patientId', { patientId });
    }

    if (status) {
      queryBuilder.andWhere('appointment.status = :status', { status });
    }

    if (type) {
      queryBuilder.andWhere('type.id = :type', { type });
    }

    if (date) {
      queryBuilder.andWhere('appointment.appointmentDate = :date', { date });
    }

    if (user.role?.name === 'DOCTOR') {
      queryBuilder.andWhere('doctor.id = :doctorId', { doctorId: user.id });
    } else if (user.role?.name === 'PATIENT') {
      queryBuilder.andWhere('patient.id = :patientId', { patientId: user.id });
    }

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('appointment.appointmentDate', 'DESC')
      .getManyAndCount();

    return {
      data: data.map(appointment => this.sanitizeAppointment(appointment)),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string, user: User): Promise<AppointmentResponseDto> {
    const appointment = await this.appointmentsRepository.findOne({
      where: { id, deletedAt: null },
      relations: ['type', 'doctor', 'patient', 'createdBy'],
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    if (user.role?.name === 'DOCTOR' && appointment.doctor.id !== user.id) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    if (user.role?.name === 'PATIENT' && appointment.patient.id !== user.id) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    return this.sanitizeAppointment(appointment);
  }

  async create(
    createAppointmentDto: CreateAppointmentDto,
    createdBy: User
  ): Promise<AppointmentResponseDto> {
    const patient = await this.patientsRepository.findOne({
      where: { id: createAppointmentDto.patientId, deletedAt: null },
    });

    if (!patient) {
      throw new NotFoundException(`Patient with ID ${createAppointmentDto.patientId} not found`);
    }

    const doctor = await this.usersRepository.findOne({
      where: { id: createAppointmentDto.doctorId, deletedAt: null },
      relations: ['role'],
    });

    if (!doctor || doctor.role?.name !== 'DOCTOR') {
      throw new NotFoundException(`Doctor with ID ${createAppointmentDto.doctorId} not found`);
    }

    const appointmentType = await this.appointmentTypeRepository.findOne({
      where: { id: createAppointmentDto.typeId },
    });

    if (!appointmentType) {
      throw new NotFoundException(`Appointment type with ID ${createAppointmentDto.typeId} not found`);
    }

    const appointment = this.appointmentsRepository.create({
      patient,
      doctor,
      type: appointmentType,
      appointmentDate: createAppointmentDto.appointmentDate,
      reason: createAppointmentDto.reason,
      notes: createAppointmentDto.notes,
      status: 'SCHEDULED',
      createdBy,
    });

    const savedAppointment = await this.appointmentsRepository.save(appointment);

    return this.sanitizeAppointment(savedAppointment);
  }

  async update(
    id: string,
    updateAppointmentDto: UpdateAppointmentDto,
    updatedBy: User
  ): Promise<AppointmentResponseDto> {
    const appointment = await this.appointmentsRepository.findOne({
      where: { id, deletedAt: null },
      relations: ['type', 'doctor', 'patient', 'createdBy'],
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    if (appointment.status === 'COMPLETED' || appointment.status === 'CANCELLED') {
      throw new ConflictException(`Cannot update a ${appointment.status} appointment`);
    }

    Object.assign(appointment, updateAppointmentDto);
    appointment.updatedBy = updatedBy;

    const updatedAppointment = await this.appointmentsRepository.save(appointment);

    return this.sanitizeAppointment(updatedAppointment);
  }

  async cancel(
    id: string,
    cancelledBy: User
  ): Promise<{ message: string }> {
    const appointment = await this.appointmentsRepository.findOne({
      where: { id, deletedAt: null },
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    if (appointment.status === 'COMPLETED' || appointment.status === 'CANCELLED') {
      throw new ConflictException(`Appointment is already ${appointment.status.toLowerCase()}`);
    }

    appointment.status = 'CANCELLED';
    appointment.cancelledBy = cancelledBy;
    appointment.cancelledAt = new Date();
    await this.appointmentsRepository.save(appointment);

    return { message: 'Appointment cancelled successfully' };
  }

  async complete(
    id: string,
    completedBy: User
  ): Promise<AppointmentResponseDto> {
    const appointment = await this.appointmentsRepository.findOne({
      where: { id, deletedAt: null },
      relations: ['type', 'doctor', 'patient', 'createdBy'],
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    if (appointment.status !== 'SCHEDULED') {
      throw new ConflictException(`Only scheduled appointments can be completed`);
    }

    appointment.status = 'COMPLETED';
    appointment.completedBy = completedBy;
    appointment.completedAt = new Date();
    await this.appointmentsRepository.save(appointment);

    return this.sanitizeAppointment(appointment);
  }

  async checkAvailability(
    doctorId: string,
    date: string,
    durationMinutes: number
  ): Promise<boolean> {
    const existingAppointments = await this.appointmentsRepository.find({
      where: {
        doctor: { id: doctorId },
        appointmentDate: date,
        status: 'SCHEDULED',
      },
    });

    if (existingAppointments.length === 0) {
      return true;
    }

    const appointmentTimes = existingAppointments.map(a => new Date(a.appointmentDate).getHours() * 60 + new Date(a.appointmentDate).getMinutes());
    const newTime = new Date(date).getHours() * 60 + new Date(date).getMinutes();

    const overlap = appointmentTimes.some(time => Math.abs(time - newTime) < durationMinutes);

    return !overlap;

  private sanitizeAppointment(appointment: Appointment): AppointmentResponseDto {
    const {
      type,
      doctor,
      patient,
      createdBy,
      updatedBy,
      cancelledBy,
      completedBy,
      ...rest
    } = appointment;

    return {
      ...rest,
      type: {
        id: type.id,
        name: type.name,
        durationMinutes: type.durationMinutes,
        price: type.price,
      },
      doctor: {
        id: doctor.id,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        email: doctor.email,
        phone: doctor.phone,
      },
      patient: {
        id: patient.id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        mrn: patient.mrn,
      },
      createdBy: createdBy ? {
        id: createdBy.id,
        firstName: createdBy.firstName,
        lastName: createdBy.lastName,
      } : undefined,
      updatedBy: updatedBy ? {
        id: updatedBy.id,
        firstName: updatedBy.firstName,
        lastName: updatedBy.lastName,
      } : undefined,
      cancelledBy: cancelledBy ? {
        id: cancelledBy.id,
        firstName: cancelledBy.firstName,
        lastName: cancelledBy.lastName,
      } : undefined,
      completedBy: completedBy ? {
        id: completedBy.id,
        firstName: completedBy.firstName,
        lastName: completedBy.lastName,
      } : undefined,
    };
  }
}