import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { User } from '../../../core/entities/user.entity';
import { AppointmentType } from './appointment-type.entity';

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => AppointmentType)
  type: AppointmentType;

  @ManyToOne(() => User)
  doctor: User;

  @ManyToOne(() => User)
  patient: User;

  @Column({ type: 'timestamp' })
  appointmentDate: string;

  @Column({ nullable: true })
  reason: string;

  @Column({ nullable: true })
  notes: string;

  @Column({ default: 'SCHEDULED' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn({ nullable: true })
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => User, { nullable: true })
  createdBy: User;

  @ManyToOne(() => User, { nullable: true })
  updatedBy: User;

  @ManyToOne(() => User, { nullable: true })
  cancelledBy: User;

  @CreateDateColumn({ nullable: true })
  cancelledAt: Date;

  @ManyToOne(() => User, { nullable: true })
  completedBy: User;

  @CreateDateColumn({ nullable: true })
  completedAt: Date;
}