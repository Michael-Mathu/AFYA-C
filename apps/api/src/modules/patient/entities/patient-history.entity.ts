import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Patient } from './patient.entity';

@Entity('patient_histories')
export class PatientHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  patientId: string;

  @Column({ type: 'date' })
  visitDate: Date;

  @Column({ type: 'text', nullable: true })
  diagnosis: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  doctorName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  department: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Patient, patient => patient.history)
  @JoinColumn({ name: 'patientId' })
  patient: Patient;
}
