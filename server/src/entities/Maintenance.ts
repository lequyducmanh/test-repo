import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Room } from './Room';
import { Tenant } from './Tenant';
import { User } from './User';

export enum MaintenanceType {
  REPAIR = 'REPAIR',
  MAINTENANCE = 'MAINTENANCE',
  INSPECTION = 'INSPECTION',
}

export enum MaintenancePriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum MaintenanceStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity('maintenance')
export class Maintenance {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'integer' })
  roomId!: number;

  @ManyToOne(() => Room)
  @JoinColumn({ name: 'roomId' })
  room!: Room;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: MaintenanceType.REPAIR,
  })
  type!: MaintenanceType;

  @Column({
    type: 'varchar',
    length: 20,
    default: MaintenancePriority.MEDIUM,
  })
  priority!: MaintenancePriority;

  @Column({
    type: 'varchar',
    length: 20,
    default: MaintenanceStatus.PENDING,
  })
  status!: MaintenanceStatus;

  @Column({ type: 'integer', nullable: true })
  reportedBy?: number;

  @ManyToOne(() => Tenant, { nullable: true })
  @JoinColumn({ name: 'reportedBy' })
  reporter?: Tenant;

  @Column({ type: 'integer', nullable: true })
  assignedTo?: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assignedTo' })
  assignee?: User;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  cost!: number;

  @Column({ type: 'timestamp', nullable: true })
  scheduledDate?: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedDate?: Date;

  @Column({ type: 'jsonb', nullable: true })
  images?: string[]; // Array of image URLs

  @Column({ type: 'text', nullable: true })
  note?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
