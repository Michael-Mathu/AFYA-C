import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { User } from '../../../core/entities/user.entity';
import { Patient } from '../patient/entities/patient.entity';
import { Consultation } from '../consultation/entities/consultation.entity';

@Entity('lab_test_catalogue')
export class LabTestCatalogue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  name: string; // e.g., "Complete Blood Count", "Malaria Parasites"

  @Column({ type: 'varchar', length: 20, nullable: true })
  shortCode: string; // e.g., "CBC", "MP"

  @Column({ type: 'varchar', length: 100 })
  category: string; // e.g., "Hematology", "Microbiology", "Biochemistry"

  @Column({ type: 'varchar', length: 100, nullable: true })
  sampleType: string; // e.g., "Whole Blood", "Urine", "Stool"

  @Column({ type: 'int', nullable: true })
  turnaroundHours: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'boolean', default: false })
  isPanel: boolean; // has child tests

  @Column({ type: 'uuid', nullable: true })
  parentId: string; // self-referencing for panels

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => LabTestCatalogue, test => test.children)
  @JoinColumn({ name: 'parentId' })
  parent: LabTestCatalogue;

  @ManyToMany(() => LabTestCatalogue)
  @JoinTable({
    name: 'lab_test_catalogue_panels',
    joinColumn: { name: 'panel_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'test_id', referencedColumnName: 'id' },
  })
  children: LabTestCatalogue[];

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'addedBy' })
  addedBy: User;
}
