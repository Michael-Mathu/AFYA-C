import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  name: string; // e.g., 'SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'NURSE', etc.

  @Column({ type: 'varchar', length: 255 })
  description: string;

  @Column({ type: 'boolean', default: false })
  isSystem: boolean; // System roles cannot be deleted

  @CreateDateColumn()
  createdAt: Date;

  @CreateDateColumn()
  updatedAt: Date;
}
