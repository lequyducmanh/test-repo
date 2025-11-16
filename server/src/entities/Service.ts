import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { RoomService } from './RoomService';

export enum ServiceType {
  FIXED = 'FIXED', // Cố định: rác, internet, bảo vệ...
  VARIABLE = 'VARIABLE', // Theo số lượng: xe...
  METERED = 'METERED', // Theo đồng hồ: điện, nước
}

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 20 })
  type!: ServiceType;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price!: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  unit?: string; // kwh, m3, month, person, vehicle

  @Column({ type: 'boolean', default: false })
  isRequired!: boolean;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @OneToMany(() => RoomService, (roomService) => roomService.service)
  rooms?: RoomService[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
