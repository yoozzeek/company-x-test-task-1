import fp from 'fastify-plugin';
import fastifySwagger from '@fastify/swagger';
import { fastifySwaggerUi } from '@fastify/swagger-ui';

export default fp(async (app) => {
  await app.register(fastifySwagger, {
    swagger: {
      info: {
        title: 'Auth service API',
        description: 'API documentation',
        version: '0.0.1',
      },
      host: 'localhost:3000',
      schemes: ['http'],
      consumes: ['application/json'],
      produces: ['application/json'],
      securityDefinitions: {
        apiKey: {
          type: 'apiKey',
          name: 'apiKey',
          in: 'header',
        },
      },
    },
  });

  await app.register(fastifySwaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
    staticCSP: true,
  });

  app.addHook('onReady', async () => {
    await app.swagger();
  });
});
