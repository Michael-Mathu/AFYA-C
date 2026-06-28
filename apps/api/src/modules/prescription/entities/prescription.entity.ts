import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../../core/entities/user.entity';
import { Patient } from '../patient/entities/patient.entity';
import { Consultation } from '../consultation/entities/consultation.entity';

@Entity('prescriptions')
export class Prescription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Patient)
  patient: Patient;

  @ManyToOne(() => User)
  prescribedBy: User;

  @ManyToOne(() => Consultation, { nullable: true })
  consultation: Consultation;

  @Column()
  medicationName: string;

  @Column()
  dosage: string;

  @Column()
  frequency: string;

  @Column({ nullable: true })
  route: string;

  @Column({ nullable: true })
  durationDays: number;

  @Column({ nullable: true })
  quantity: number;

  @Column({ type: 'text', nullable: true })
  instructions: string;

  @Column({ default: 'ACTIVE' })
  status: string;

  @Column({ default: false })
  isAiSuggested: boolean;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  aiConfidence: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn({ nullable: true })
  updatedAt: Date;

  @ManyToOne(() => User, { nullable: true })
  updatedBy: User;

  @CreateDateColumn({ nullable: true })
  dispensedAt: Date;

  @ManyToOne(() => User, { nullable: true })
  dispensedBy: User;
}