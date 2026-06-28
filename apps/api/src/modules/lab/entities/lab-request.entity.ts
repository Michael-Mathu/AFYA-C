import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Consultation } from '../consultation/entities/consultation.entity';
import { Patient } from '../patient/entities/patient.entity';
import { User } from '../../../core/entities/user.entity';
import { LabTestCatalogue } from './lab-test-catalogue.entity';

@Entity('lab_requests')
export class LabRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  consultationId: string;

  @Column()
  patientId: string;

  @Column()
  doctorId: string;

  @Column()
  labTestCatalogueId: string;

  @Column({ type: 'enum', enum: ['ROUTINE', 'URGENT', 'STAT'] })
  priority: string;

  @Column({ type: 'text', nullable: true })
  clinicalNotes: string;

  @Column({ type: 'enum', enum: ['ORDERED', 'SAMPLE_COLLECTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] })
  status: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  specimenType: string;

  @Column({ type: 'timestamp', nullable: true })
  specimenCollectedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  specimenCollectedBy: string;

  @Column({ type: 'text', nullable: true })
  resultValue: string; // for single-value tests

  @Column({ type: 'jsonb', nullable: true })
  resultJson: any; // for multi-value panels

  @Column({ type: 'text', nullable: true })
  resultNote: string; // pathologist comment

  @Column({ type: 'boolean', nullable: true })
  isAbnormal: boolean;

  @Column({ type: 'uuid', nullable: true })
  resultedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  resultedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Consultation, consultation => consultation.labRequests)
  @JoinColumn({ name: 'consultationId' })
  consultation: Consultation;

  @ManyToOne(() => Patient, patient => patient.labRequests)
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @ManyToOne(() => User, user => user.labRequests)
  @JoinColumn({ name: 'doctorId' })
  doctor: User;

  @ManyToOne(() => LabTestCatalogue, test => test.labRequests)
  @JoinColumn({ name: 'labTestCatalogueId' })
  labTestCatalogue: LabTestCatalogue;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'specimenCollectedBy' })
  specimenCollectedByUser: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'resultedBy' })
  resultedByUser: User;
}
