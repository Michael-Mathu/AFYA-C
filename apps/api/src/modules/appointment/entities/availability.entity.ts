import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('availabilities')
export class Availability {
  @PrimaryGeneratedColumn('uuid')
  startTime: string;

  @PrimaryGeneratedColumn('uuid')
  endTime: string;

  @Column()
  weekday: number;

  @Column({ default: true })
  isRecurring: boolean;

  @Column({ nullable: true })
  specificDate: string;
}