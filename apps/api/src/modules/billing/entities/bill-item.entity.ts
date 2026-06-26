import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Bill } from './bill.entity';
import { User } from '../core/entities/user.entity';
import { Patient } from '../patient/entities/patient.entity';

@Entity('bill_items')
export class BillItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  billId: string;

  @Column({ type: 'enum', enum: ['CONSULTATION', 'LAB_TEST', 'MEDICATION', 'PROCEDURE', 'OTHER'] })
  itemType: string;

  @Column({ type: 'uuid', nullable: true })
  itemId: string;

  @Column({ type: 'varchar', length: 200 })
  itemName: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalPrice: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Bill, bill => bill.items)
  @JoinColumn({ name: 'billId' })
  bill: Bill;
}
