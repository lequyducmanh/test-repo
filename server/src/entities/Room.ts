import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { RoomService } from './RoomService';

export enum RoomStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  MAINTENANCE = 'MAINTENANCE',
  RESERVED = 'RESERVED',
}

export interface RoomAmenities {
  airConditioner?: boolean;
  fridge?: boolean;
  washingMachine?: boolean;
  wifi?: boolean;
  wardrobe?: boolean;
  bed?: boolean;
  privateToilet?: boolean;
  waterHeater?: boolean;
  kitchen?: boolean;
  balcony?: boolean;
}

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 20, unique: true })
  code!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'integer', nullable: true })
  floor?: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  area?: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  deposit?: number;

  @Column({ type: 'integer', default: 2 })
  maxOccupants!: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: RoomStatus.AVAILABLE,
  })
  status!: RoomStatus;

  @Column({ type: 'jsonb', nullable: true })
  amenities?: RoomAmenities;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'text', nullable: true })
  note?: string;

  @OneToMany(() => RoomService, (roomService) => roomService.room)
  services?: RoomService[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
