import express from 'express';
import rotasContas from './Contas/routes';
import swaggerUi from 'swagger-ui-express';
import swaggerDoc from './swagger.config';

const app = express();
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

app.use('/api/contas', rotasContas);

export default app;
