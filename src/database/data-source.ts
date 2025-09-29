import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { ContaUsuario } from '../Contas/entity';

export const AppDataSource = new DataSource({
  type: 'postgres',

  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,

  synchronize: true,
  logging: false,
  entities: [ContaUsuario],
});
