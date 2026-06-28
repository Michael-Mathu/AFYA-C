import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('queue_statuses')
export class QueueStatus {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ default: true })
  isActive: boolean;
}