import setupOtelInstrumentation from './common/otel/setup';
import { getConfig } from './config';
import type { FastifyInstance } from 'fastify';
import Fastify from 'fastify';
import { Pool } from 'pg';
import { runMigrations } from './common/db/migrations';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { UserRepository } from './repositories/user.repository';
import { UserService } from './services/user.service';
import { initUserRoutes } from './routes/user.routes';
import { AuthRepository } from './repositories/auth.repository';
import { AuthService } from './services/auth.service';
import { initAuthRoutes } from './routes/auth.routes';
import cors from '@fastify/cors';
import jwtPlugin, { JwtPluginOptions } from './plugins/jwt.plugin';
import { fastifyHelmet, FastifyHelmetOptions } from '@fastify/helmet';
import swaggerPlugin from './plugins/swagger.plugin';
import { errorHandler } from './common/app.error';

export default async function bootstrapApp(config: ReturnType<typeof getConfig>) {
  const otelInstrumentation = setupOtelInstrumentation(config.appName);
  const app: FastifyInstance = Fastify({ logger: true });
  const pgPool = new Pool({
    host: config.dbHost,
    port: config.dbPort,
    user: config.dbUser,
    password: config.dbPassword,
    database: config.dbName,
  });

  const client = await pgPool.connect();
  try {
    await runMigrations(client, config.migrationsTable, config.migrationsDir);
  } catch (e) {
    console.error('Running db migrations failed', e);
  } finally {
    client.release();
  }

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  const userRepository = new UserRepository(pgPool);
  const userService = new UserService(userRepository);
  const userRoutes = initUserRoutes(userService);

  const authRepository = new AuthRepository(pgPool);
  const authService = new AuthService(authRepository, userService, {
    secretKey: config.jwtSecretKey,
    privateKeyPath: config.jwtPrivateKeyPath, // has higher priority
  });
  const authRoutes = initAuthRoutes(authService);

  await app.register(otelInstrumentation.fastifyPlugin);
  await app.register(cors, {});

  app.register<JwtPluginOptions>(jwtPlugin, {
    secretKey: config.jwtSecretKey,
    publicKeyPath: config.jwtPublicKeyPath,
  });
  app.register<FastifyHelmetOptions>(fastifyHelmet, { contentSecurityPolicy: false });
  app.register(swaggerPlugin);

  app.register(authRoutes, { prefix: '/v1/auth' });
  app.register(userRoutes, { prefix: '/v1/users' });

  app.setErrorHandler(errorHandler);

  return { app, pgPool };
}
