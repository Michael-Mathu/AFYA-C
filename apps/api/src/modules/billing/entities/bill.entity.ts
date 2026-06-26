import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../core/entities/user.entity';
import { Patient } from '../patient/entities/patient.entity';

@Entity('bills')
export class Bill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  patientId: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  billNumber: string;

  @Column({ type: 'date' })
  billDate: Date;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  discount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  taxAmount: number; // VAT in Kenya: 16%

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  netAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  paidAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  balance: number;

  @Column({ type: 'enum', enum: ['PENDING', 'PARTIALLY_PAID', 'PAID', 'CANCELLED', 'REFUNDED'] })
  status: string;

  @Column({ type: 'enum', enum: ['CASH', 'MPESA', 'BANK_TRANSFER', 'CARD', 'INSURANCE'], nullable: true })
  paymentMethod: string;

  @Column({ type: 'timestamp', nullable: true })
  paidAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ type: 'uuid', nullable: true })
  updatedBy: string;

  // Relationships
  @ManyToOne(() => Patient, patient => patient.bills)
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'createdBy' })
  createdByUser: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updatedBy' })
  updatedByUser: User;
}
