const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Travelar API',
      version: '1.0.0',
      description: 'API do projeto de aluguel de imóveis.',
    },
    tags: [
      {
        name: 'Contas',
        description: 'Operações relacionadas a contas de usuários',
      },
    ],
  },
  apis: ['./src/Contas/rotas.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
