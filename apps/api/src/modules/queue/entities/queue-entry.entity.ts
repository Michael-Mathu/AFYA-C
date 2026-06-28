import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../../core/entities/user.entity';
import { QueueStatus } from './queue-status.entity';

@Entity('queue_entries')
export class QueueEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  patient: User;

  @ManyToOne(() => User)
  doctor: User;

  @ManyToOne(() => QueueStatus)
  status: QueueStatus;

  @Column()
  department: string;

  @Column({ default: 'NORMAL' })
  priority: string;

  @Column({ default: 0 })
  position: number;

  @Column({ nullable: true })
  estimatedWaitTimeMinutes: number;

  @Column({ unique: true })
  tokenNumber: string;

  @Column({ nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn({ nullable: true })
  updatedAt: Date;

  @ManyToOne(() => User, { nullable: true })
  createdBy: User;

  @ManyToOne(() => User, { nullable: true })
  assignedBy: User;

  @CreateDateColumn({ nullable: true })
  assignedAt: Date;

  @ManyToOne(() => User, { nullable: true })
  completedBy: User;

  @CreateDateColumn({ nullable: true })
  completedAt: Date;

  @Column({ default: true })
  isActive: boolean;
}