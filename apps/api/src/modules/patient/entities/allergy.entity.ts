import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Patient } from './patient.entity';

@Entity('allergies')
export class Allergy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  patientId: string;

  @Column({ type: 'varchar', length: 255 })
  allergen: string;

  @Column({ type: 'varchar', length: 255 })
  reaction: string;

  @Column({ type: 'enum', enum: ['MILD', 'MODERATE', 'SEVERE', 'LIFE_THREATENING'] })
  severity: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Patient, patient => patient.allergies)
  @JoinColumn({ name: 'patientId' })
  patient: Patient;
}
