import 'reflect-metadata';
import app from './app';
import { AppDataSource } from './database/data-source';
import { config } from './config/env.config';

const startServer = async () => {
  try {
    await AppDataSource.initialize();
    console.log('Conexão com o banco de dados estabelecida!');

    app.listen(config.port, () => {
      console.log(`Servidor executando em http://localhost:${config.port}`);
      console.log(`Documentação disponível em http://localhost:${config.port}/api-docs`);
    });
  } catch (error) {
    console.error('Erro ao iniciar a aplicação:', error);
    process.exit(1);
  }
};

startServer();
