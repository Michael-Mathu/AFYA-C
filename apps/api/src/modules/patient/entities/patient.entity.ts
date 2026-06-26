import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { User } from '../core/entities/user.entity';
import { Allergy } from './entities/allergy.entity';
import { Insurance } from './entities/insurance.entity';
import { EmergencyContact } from './entities/emergency-contact.entity';
import { NextOfKin } from './entities/next-of-kin.entity';
import { PatientHistory } from './entities/patient-history.entity';
import { Bill } from '../billing/entities/bill.entity';

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  mrn: string; // Medical Record Number

  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  middleName: string;

  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Column({ type: 'date' })
  dateOfBirth: Date;

  @Column({ type: 'enum', enum: ['MALE', 'FEMALE', 'OTHER'] })
  gender: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({ type: 'enum', enum: ['NATIONAL_ID', 'PASSPORT', 'BIRTH_CERT', 'ALIEN_CARD'] })
  idType: string;

  @Column({ type: 'varchar', length: 50 })
  idNumber: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  alternativePhone: string;

  @Column({ type: 'jsonb', nullable: true })
  address: any; // Kenya address structure: { county, subcounty, ward, village, estate }

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  deletedBy: string;

  @ManyToOne(() => User, user => user.audits)
  @JoinColumn({ name: 'createdBy' })
  createdBy: User;

  @Column({ type: 'uuid', nullable: true })
  updatedBy: string;

  @ManyToOne(() => User, user => user.audits)
  @JoinColumn({ name: 'updatedBy' })
  updatedByUser: User;

  // Relationships
  @OneToMany(() => Allergy, allergy => allergy.patient)
  allergies: Allergy[];

  @OneToMany(() => Insurance, insurance => insurance.patient)
  insurance: Insurance[];

  @OneToMany(() => EmergencyContact, emergencyContact => emergencyContact.patient)
  emergencyContact: EmergencyContact[];

  @OneToMany(() => NextOfKin, nextOfKin => nextOfKin.patient)
  nextOfKin: NextOfKin[];

  @OneToMany(() => PatientHistory, history => history.patient)
  history: PatientHistory[];

  @OneToMany(() => Bill, bill => bill.patient)
  bills: Bill[];
}
