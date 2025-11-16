import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Room } from './Room';
import { Tenant } from './Tenant';

export enum ContractStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  TERMINATED = 'TERMINATED',
}

export interface ContractTerms {
  [key: string]: any;
}

@Entity('contracts')
export class Contract {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  contractCode!: string;

  @Column({ type: 'integer' })
  roomId!: number;

  @ManyToOne(() => Room)
  @JoinColumn({ name: 'roomId' })
  room!: Room;

  @Column({ type: 'integer' })
  mainTenantId!: number;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'mainTenantId' })
  mainTenant!: Tenant;

  @Column({ type: 'date' })
  startDate!: Date;

  @Column({ type: 'date' })
  endDate!: Date;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  monthlyRent!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  deposit!: number;

  @Column({ type: 'integer', default: 5 })
  paymentDueDay!: number; // 1-31

  @Column({
    type: 'varchar',
    length: 20,
    default: ContractStatus.DRAFT,
  })
  status!: ContractStatus;

  @Column({ type: 'date', nullable: true })
  terminationDate?: Date;

  @Column({ type: 'text', nullable: true })
  terminationReason?: string;

  @Column({ type: 'jsonb', nullable: true })
  terms?: ContractTerms;

  @Column({ type: 'text', nullable: true })
  note?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
