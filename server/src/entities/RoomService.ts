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
import { Service } from './Service';

@Entity('room_services')
export class RoomService {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'integer' })
  roomId!: number;

  @ManyToOne(() => Room, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roomId' })
  room!: Room;

  @Column({ type: 'integer' })
  serviceId!: number;

  @ManyToOne(() => Service, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'serviceId' })
  service!: Service;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  customPrice?: number;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'date', nullable: true })
  startDate?: Date;

  @Column({ type: 'date', nullable: true })
  endDate?: Date;

  @Column({ type: 'text', nullable: true })
  note?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
