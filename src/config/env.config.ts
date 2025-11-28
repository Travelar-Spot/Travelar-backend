import dotenv from 'dotenv';
import path from 'path';

if (process.env.NODE_ENV === 'test') {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });
} else if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  jwtSecret: process.env.JWT_SECRET || 'SUPER_SECRETO_PARA_JWT',

  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'developer',
    password: process.env.DB_PASSWORD,
    name: process.env.DB_DATABASE || 'travelar',
    ssl: process.env.DB_SSL === 'true',
  },

  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',

  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  },
};
