import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import { Pool } from 'pg';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { config } from './config';
import { initAuthRoutes } from './routes/auth.routes';
import { initUserRoutes } from './routes/user.routes';
import { AuthService } from './services/auth.service';
import { AuthRepository } from './repositories/auth.repository';
import { UserRepository } from './repositories/user.repository';
import { UserService } from './services/user.service';
import { signJwt, verifyJwt } from './common/jwt.utils';
import { fastifyHelmet } from '@fastify/helmet';
import cors from '@fastify/cors';
import registerJwtPlugin from './plugins/jwt.plugin';
import swaggerPlugin from './plugins/swagger.plugin';
import { errorHandler } from './common/app.error';
import { setupTracing } from './common/tracer.otel';

setupTracing('api_service');

let isShuttingDown = false;

async function main() {
  const app: FastifyInstance = Fastify({
    logger: true,
  });

  const pgPool = new Pool({
    host: config.dbHost,
    user: config.dbUser,
    password: config.dbPassword,
    database: config.dbName,
    port: 5432,
  });

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  const userRepository = new UserRepository(pgPool);
  const userService = new UserService(userRepository);
  const userRoutes = initUserRoutes(userService);

  const authRepository = new AuthRepository(pgPool);
  const authService = new AuthService(authRepository, userService, signJwt);
  const authRoutes = initAuthRoutes(authService);

  await app.register(cors, {});
  app.register(fastifyHelmet, { contentSecurityPolicy: false });
  app.register(swaggerPlugin);

  registerJwtPlugin(app, verifyJwt);

  app.register(authRoutes, { prefix: '/v1/auth' });
  app.register(userRoutes, { prefix: '/v1/users' });

  app.setErrorHandler(errorHandler);

  app.listen({ host: '0.0.0.0', port: config.port }, function (err, address) {
    if (err) {
      app.log.error(err);
      process.exit(1);
    }

    console.log(`Server is now listening on ${address}`);
  });

  ['SIGINT', 'SIGTERM'].forEach((signal) => {
    process.on(signal, async () => {
      if (isShuttingDown) return;
      isShuttingDown = true;
      console.info(`${signal} received. Gracefully shutting down...`);

      const timeout = setTimeout(() => {
        console.warn('Forcefully shutting down after 20 seconds.');
        process.exit(1);
      }, 10000);
      timeout.unref();

      await app.close();
      await pgPool.end();

      console.log('[shutdown] Closed out remaining connections');
      clearTimeout(timeout);
      process.exit(0);
    });
  });
}

void main();
