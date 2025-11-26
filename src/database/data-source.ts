import { DataSource } from 'typeorm';
import { config } from '../config/env.config';
import { Usuario } from '../Usuario/entity';
import { Imovel } from '../Imovel/entity';
import { Reserva } from '../Reserva/entity';
import { Avaliacao } from '../Avaliacao/entity';

const isTest = config.nodeEnv === 'test';
const isProduction = config.nodeEnv === 'production';

const sslConfig = isTest 
  ? false 
  : (config.database.ssl ? { rejectUnauthorized: false } : (isProduction ? { rejectUnauthorized: false } : false));

if (!isTest) {
    console.log(`[Database] Conectando ao banco: ${config.database.name}`);
}

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.name,
  dropSchema: isTest, 
  synchronize: isTest || config.nodeEnv === 'development',
  logging: false,
  entities: [Usuario, Imovel, Reserva, Avaliacao],
  migrations: [],
  subscribers: [],
  ssl: sslConfig,
});