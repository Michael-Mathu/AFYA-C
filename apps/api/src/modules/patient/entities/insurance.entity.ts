import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Patient } from './patient.entity';

@Entity('insurances')
export class Insurance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  patientId: string;

  @Column({ type: 'varchar', length: 255 })
  provider: string; // SHIF, private insurer, etc.

  @Column({ type: 'varchar', length: 100 })
  insuranceNumber: string;

  @Column({ type: 'date', nullable: true })
  validUntil: Date;

  @Column({ type: 'varchar', length: 100 })
  policyHolderName: string;

  @Column({ type: 'varchar', length: 100 })
  relationship: string; // self, spouse, child, etc.

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Patient, patient => patient.insurance)
  @JoinColumn({ name: 'patientId' })
  patient: Patient;
}
