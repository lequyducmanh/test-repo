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
import { User } from './User';

@Entity('utility_readings')
export class UtilityReading {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'integer' })
  roomId!: number;

  @ManyToOne(() => Room)
  @JoinColumn({ name: 'roomId' })
  room!: Room;

  @Column({ type: 'integer' })
  serviceId!: number;

  @ManyToOne(() => Service)
  @JoinColumn({ name: 'serviceId' })
  service!: Service;

  @Column({ type: 'integer' })
  month!: number; // 1-12

  @Column({ type: 'integer' })
  year!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  previousReading!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  currentReading!: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    generatedType: 'STORED',
    asExpression: '"currentReading" - "previousReading"',
  })
  consumption!: number;

  @Column({ type: 'date' })
  readingDate!: Date;

  @Column({ type: 'integer', nullable: true })
  readBy?: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'readBy' })
  reader?: User;

  @Column({ type: 'jsonb', nullable: true })
  images?: string[]; // Array of image URLs

  @Column({ type: 'text', nullable: true })
  note?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
