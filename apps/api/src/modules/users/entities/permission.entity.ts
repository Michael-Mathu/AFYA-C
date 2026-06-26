import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { Role } from './role.entity';

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

  @ManyToMany(() => Role)
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'permission_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Role[];
}
