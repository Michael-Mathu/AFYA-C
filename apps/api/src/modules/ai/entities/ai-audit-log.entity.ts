import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../../core/entities/user.entity';
import { Patient } from '../patient/entities/patient.entity';

@Entity('ai_audit_log')
export class AiAuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  patientId: string;

  @Column({ type: 'enum', enum: ['soap_generation', 'history_summary', 'prescription_suggestion', 'clinical_search'] })
  useCase: string;

  @Column({ type: 'text' })
  prompt: string;

  @Column({ type: 'text' })
  response: string;

  @Column({ type: 'varchar', length: 50 })
  model: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  confidence: number;

  @Column({ type: 'int' })
  latencyMs: number;

  @Column({ type: 'jsonb', nullable: true })
  parsedResult: any;

  @Column({ type: 'timestamp', nullable: true })
  acceptedByUser: Date;

  @Column({ type: 'text', nullable: true })
  userModifications: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Patient, { nullable: true })
  @JoinColumn({ name: 'patientId' })
  patient: Patient;
}
