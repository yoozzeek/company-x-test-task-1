import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { UserService } from '../services/user.service';

export function initUserRoutes(userService: UserService): FastifyPluginAsync {
  return async function userRoutes(server: FastifyInstance) {
    server.route({
      method: 'GET',
      url: '/',
      onRequest: server.authenticate as any,
      handler: async (req, res) => {
        const users = await userService.search();
        res.send(users);
      },
    });
  };
}
