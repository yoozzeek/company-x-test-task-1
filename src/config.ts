import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: Number(process.env.PORT) || 3000,
  jwtPrivateKeyPath: process.env.JWT_PRIVATE_KEY_PATH || '',
  jwtPublicKeyPath: process.env.JWT_PUBLIC_KEY_PATH || '',
  dbUser: process.env.DATABASE_USER || '',
  dbPassword: process.env.DATABASE_PASSWORD || '',
  dbName: process.env.DATABASE_NAME || '',
};
