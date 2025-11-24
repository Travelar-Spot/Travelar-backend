import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerDoc from './swagger/swagger.json';
import passport from './config/passport.config';
import { config } from './config/env.config';

import rotasUsuario from './Usuario/routes';
import rotasImoveis from './Imovel/routes';
import rotasReservas from './Reserva/routes';
import rotasAvaliacoes from './Avaliacao/routes';
import uploadRoutes from './UploadImagens/routes';

const app = express();

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());
app.use(passport.initialize());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
app.use('/usuarios', rotasUsuario);
app.use('/imoveis', rotasImoveis);
app.use('/reservas', rotasReservas);
app.use('/avaliacoes', rotasAvaliacoes);
app.use('/upload', uploadRoutes);

export default app;
