import 'dotenv/config';
import app from './app';
import { AppDataSource } from './database/data-source';

const PORT = process.env.PORT || 3000;

AppDataSource.initialize()
  .then(() => {
    console.log('Conexão com o banco de dados estabelecida!');
    app.listen(PORT, () => {
      console.log(`Servidor executando em http://localhost:${PORT}`);
    });
  })
  .catch((error) => console.log('Erro ao conectar ao banco de dados:', error));
