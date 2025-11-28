import { DataSource } from 'typeorm';
import { config } from '../config/env.config';
import { Usuario } from '../Usuario/entity';
import { Imovel } from '../Imovel/entity';
import { Reserva } from '../Reserva/entity';
import { Avaliacao } from '../Avaliacao/entity';
import path from 'path'; // <--- Necessário para achar as migrations

const isProduction = config.nodeEnv === 'production';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.name,

  synchronize: !isProduction,
  logging: false,
  entities: [Usuario, Imovel, Reserva, Avaliacao],
  migrations: [path.join(__dirname, '/../database/migrations/*.{ts,js}')],
  migrationsRun: isProduction,
  subscribers: [],
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});
