const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.1',
    info: {
      title: 'Travelar API',
      version: '1.0.0',
      description:
        'API do projeto Travelar — Plataforma de aluguel de imóveis (Usuários, Imóveis, Reservas, Avaliações).',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor local de desenvolvimento',
      },
    ],
    tags: [
      { name: 'Usuários (Leitura)', description: 'Operações de consulta de usuários' },
      { name: 'Imóveis', description: 'Cadastro, listagem e gerenciamento de imóveis' },
      { name: 'Reservas', description: 'Criação, consulta e cancelamento de reservas' },
      { name: 'Avaliações', description: 'Envio e leitura de avaliações de hospedagens' },
      { name: 'Upload', description: 'Upload de arquivos para nuvem (Cloudinary)' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: [
    './src/Usuario/routes.ts',
    './src/Imovel/routes.ts',
    './src/Reserva/routes.ts',
    './src/Avaliacao/routes.ts',
    './src/UploadImagens/routes.ts',
  ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
