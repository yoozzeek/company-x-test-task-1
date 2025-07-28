import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { UserService } from '../services/user.service';
import { usersListDto } from '../dto/user.dto';
import { apiErrorZodObject } from '../common/app.error';

export function initUserRoutes(userService: UserService): FastifyPluginAsync {
  return async function userRoutes(app: FastifyInstance) {
    app.route({
      method: 'GET',
      url: '/',
      schema: {
        summary: 'List all users',
        description: 'Returns a list of all users (auth required)',
        tags: ['Users'],
        security: [{ apiKey: [] }],
        response: {
          200: usersListDto,
          401: apiErrorZodObject,
          500: apiErrorZodObject,
        },
      },
      onRequest: app.authenticate as any,
      handler: async (req, res) => {
        const users = await userService.search();
        res.send(users);
      },
    });
  };
}
