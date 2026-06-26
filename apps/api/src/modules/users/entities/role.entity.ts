import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { User } from '../core/entities/user.entity';

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

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToMany(() => User, user => user.roles)
  @JoinTable({
    name: 'role_user',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  users: User[];
}
