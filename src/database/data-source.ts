import { DataSource } from 'typeorm';
import { config } from '../config/env.config';
import { Usuario } from '../Usuario/entity';
import { Imovel } from '../Imovel/entity';
import { Reserva } from '../Reserva/entity';
import { Avaliacao } from '../Avaliacao/entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.name,
  synchronize:
    config.nodeEnv === 'test' || config.nodeEnv === 'development' || process.env.DB_SYNC === 'true',
  logging: false,
  entities: [Usuario, Imovel, Reserva, Avaliacao],
  migrations: [],
  subscribers: [],
  ssl: {
    rejectUnauthorized: false,
  },
});
