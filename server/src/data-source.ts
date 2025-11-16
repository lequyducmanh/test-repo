import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { User } from './entities/User';
import { Room } from './entities/Room';
import { Tenant } from './entities/Tenant';
import { Service } from './entities/Service';
import { RoomService } from './entities/RoomService';
import { Contract } from './entities/Contract';
import { ContractTenant } from './entities/ContractTenant';
import { UtilityReading } from './entities/UtilityReading';
import { Maintenance } from './entities/Maintenance';
import { RoomImage } from './entities/RoomImage';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'mydb',
  synchronize: false, // Use migrations instead
  logging: false,
  entities: ['src/entities/**/*.ts'],
  subscribers: [],
  migrations: ['src/migrations/**/*.ts'],
});
