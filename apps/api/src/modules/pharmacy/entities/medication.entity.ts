import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import { User } from '../../../core/entities/user.entity';
import { StockEntry } from './stock-entry.entity';

@Entity('medications')
export class Medication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  genericName: string;

  @Column({ nullable: true })
  category: string;

  @Column({ nullable: true })
  manufacturer: string;

  @Column({ nullable: true })
  strength: string;

  @Column({ nullable: true })
  form: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  unitPrice: number;

  @Column({ default: 0 })
  currentStock: number;

  @Column({ default: 10 })
  minimumStock: number;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => StockEntry, entry => entry.medication)
  stockEntries: StockEntry[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn({ nullable: true })
  updatedAt: Date;

  @ManyToOne(() => User, { nullable: true })
  createdBy: User;

  @ManyToOne(() => User, { nullable: true })
  updatedBy: User;
}