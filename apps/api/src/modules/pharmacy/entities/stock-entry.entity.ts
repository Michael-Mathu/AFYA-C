import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../../core/entities/user.entity';
import { Medication } from './medication.entity';

@Entity('stock_entries')
export class StockEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Medication)
  medication: Medication;

  @Column()
  quantity: number;

  @Column({ type: 'date' })
  expiryDate: Date;

  @Column({ nullable: true })
  batchNumber: string;

  @CreateDateColumn()
  addedAt: Date;

  @ManyToOne(() => User)
  addedBy: User;
}