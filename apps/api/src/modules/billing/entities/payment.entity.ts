import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Bill } from './bill.entity';
import { Patient } from '../patient/entities/patient.entity';
import { User } from '../../../core/entities/user.entity';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  billId: string;

  @Column()
  patientId: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: ['CASH', 'MPESA', 'BANK_TRANSFER', 'CARD', 'INSURANCE'] })
  paymentMethod: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  mpesaTransactionId: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  mpesaPhone: string;

  @Column({ type: 'int', nullable: true })
  mpesaResultCode: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  mpesaResultDesc: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  referenceNumber: string;

  @Column({ type: 'timestamp', nullable: true })
  callbackProcessedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Bill, bill => bill.payments)
  @JoinColumn({ name: 'billId' })
  bill: Bill;

  @ManyToOne(() => Patient, patient => patient.payments)
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'receivedBy' })
  receivedBy: User;
}
