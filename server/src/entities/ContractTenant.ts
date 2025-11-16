import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Contract } from './Contract';
import { Tenant } from './Tenant';

@Entity('contract_tenants')
export class ContractTenant {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'integer' })
  contractId!: number;

  @ManyToOne(() => Contract, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contractId' })
  contract!: Contract;

  @Column({ type: 'integer' })
  tenantId!: number;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenant!: Tenant;

  @Column({ type: 'boolean', default: false })
  isMainTenant!: boolean;

  @Column({ type: 'date' })
  joinDate!: Date;

  @Column({ type: 'date', nullable: true })
  leaveDate?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
