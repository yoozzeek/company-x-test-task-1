import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
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
import { errorHandler } from './common/app.error';
import { Pool } from 'pg';
import { setupTracing } from './common/tracer.otel';

setupTracing('api_service');

async function main() {
  const server: FastifyInstance = Fastify({
    logger: true,
  });

  const pgPool = new Pool({
    user: config.dbUser,
    password: config.dbPassword,
    database: config.dbName,
    port: 5432,
  });

  const userRepository = new UserRepository(pgPool);
  const userService = new UserService(userRepository);
  const userRoutes = initUserRoutes(userService);

  const authRepository = new AuthRepository(pgPool);
  const authService = new AuthService(authRepository, userService, signJwt);
  const authRoutes = initAuthRoutes(authService);

  await server.register(cors, {});
  server.register(fastifyHelmet, { contentSecurityPolicy: false });

  registerJwtPlugin(server, verifyJwt);

  server.register(authRoutes, { prefix: '/v1/auth' });
  server.register(userRoutes, { prefix: '/v1/users' });

  server.setErrorHandler(errorHandler);

  server.listen({ port: config.port }, function (err, address) {
    if (err) {
      server.log.error(err);
      process.exit(1);
    }

    console.log(`Server is now listening on ${address}`);
  });
}

void main();
