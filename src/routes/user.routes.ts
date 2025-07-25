import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { UserService } from '../services/user.service';

export function initUserRoutes(userService: UserService): FastifyPluginAsync {
  return async function userRoutes(server: FastifyInstance) {
    server.route({
      method: 'GET',
      url: '/',
      schema: {
        summary: 'List all users',
        description: 'Returns a list of all users (auth required)',
        tags: ['Users'],
        security: [{ apiKey: [] }],
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                email: { type: 'string', format: 'email' },
              },
            },
          },
          401: {
            description: 'Unauthorized',
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
          500: {
            description: 'InternalError',
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
        },
      },
      onRequest: server.authenticate as any,
      handler: async (req, res) => {
        const users = await userService.search();
        res.send(users);
      },
    });
  };
}
