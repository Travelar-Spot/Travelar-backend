import dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'test') {
  dotenv.config();
}

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  jwtSecret: process.env.JWT_SECRET || 'SUPER_SECRETO_PARA_JWT',
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'developer',
    password: process.env.DB_PASSWORD || 'travelar_pass',
    name: process.env.DB_DATABASE || 'travelar',
  },
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};
