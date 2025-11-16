import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum TenantStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100 })
  fullName!: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth?: Date;

  @Column({ type: 'varchar', length: 10, nullable: true })
  gender?: Gender;

  @Column({ type: 'varchar', length: 20, unique: true, nullable: true })
  idCard?: string;

  @Column({ type: 'date', nullable: true })
  idCardDate?: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  idCardPlace?: string;

  @Column({ type: 'varchar', length: 20 })
  phone!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  email?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  hometown?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  currentAddress?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  occupation?: string;

  @Column({ type: 'jsonb', nullable: true })
  emergencyContact?: EmergencyContact;

  @Column({
    type: 'varchar',
    length: 20,
    default: TenantStatus.ACTIVE,
  })
  status!: TenantStatus;

  @Column({ type: 'text', nullable: true })
  note?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
