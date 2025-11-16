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

export enum ImageType {
  MAIN = 'MAIN',
  GALLERY = 'GALLERY',
}

@Entity('room_images')
export class RoomImage {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'integer' })
  roomId!: number;

  @ManyToOne(() => Room, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roomId' })
  room!: Room;

  @Column({ type: 'varchar', length: 500 })
  url!: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: ImageType.GALLERY,
  })
  type!: ImageType;

  @Column({ type: 'varchar', length: 255, nullable: true })
  caption?: string;

  @Column({ type: 'integer', default: 0 })
  order!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
