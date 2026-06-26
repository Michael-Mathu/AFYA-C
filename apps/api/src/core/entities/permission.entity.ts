import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  resource: string; // e.g., 'patient', 'appointment', 'prescription'

  @Column({ type: 'enum', enum: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'APPROVE', 'DISPENSE'] })
  action: string;

  @Column({ type: 'varchar', length: 255 })
  description: string;

  @CreateDateColumn()
  createdAt: Date;
}
