import fp from 'fastify-plugin';
import fastifySwagger from '@fastify/swagger';
import { fastifySwaggerUi } from '@fastify/swagger-ui';
import { jsonSchemaTransform, jsonSchemaTransformObject } from 'fastify-type-provider-zod';
import { FastifyInstance } from 'fastify';

export default fp(async (app: FastifyInstance) => {
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
    transform: jsonSchemaTransform,
    transformObject: jsonSchemaTransformObject,
  });

  await app.register(fastifySwaggerUi, {
    routePrefix: '/docs',
  });

  app.addHook('onReady', async () => {
    await app.swagger();
  });
});
