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
import { fastifyHelmet } from '@fastify/helmet';
import cors from '@fastify/cors';
import jwtPlugin from './plugins/jwt.plugin';
import swaggerPlugin from './plugins/swagger.plugin';
import { errorHandler } from './common/app.error';
import setupOtelInstrumentation from './common/otel/setup';

async function main() {
  const otelInstrumentation = setupOtelInstrumentation(config.appName);

  const newSpan = otelInstrumentation.tracer.startSpan('foo');
  newSpan.setAttribute('foo', 'bar');
  newSpan.end();

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
  const authService = new AuthService(authRepository, userService, config.jwtPrivateKeyPath);
  const authRoutes = initAuthRoutes(authService);

  await app.register(otelInstrumentation.fastifyPlugin);
  await app.register(cors, {});

  app.register(jwtPlugin, { publicKeyPath: config.jwtPublicKeyPath });
  app.register(fastifyHelmet, { contentSecurityPolicy: false });
  app.register(swaggerPlugin);

  app.register(authRoutes, { prefix: '/v1/auth' });
  app.register(userRoutes, { prefix: '/v1/users' });

  app.setErrorHandler(errorHandler);

  app.listen({ host: config.appHost, port: config.appPort }, function (err, address) {
    if (err) {
      app.log.error(err);
      process.exit(1);
    }

    console.log(`Server is now listening on ${address}`);
  });

  let isShuttingDown = false;
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
