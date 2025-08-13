import { DataSource } from 'typeorm';
import { Job } from '../modules/jobs/entities/job.entity';
import * as dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USERNAME || 'jobuser',
  password: process.env.DB_PASSWORD || 'jobpass',
  database: process.env.DB_DATABASE || 'jobsdb',
  entities: [Job],
  migrations: ['dist/migrations/*.js'],
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
});