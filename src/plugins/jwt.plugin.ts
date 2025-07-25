import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { InternalError, UnauthorizedError } from '../common/app.error';

export default function registerJwtPlugin(
  server: FastifyInstance,
  verifyJwt: (token: string) => any
) {
  server.decorate('authenticate', async (request: FastifyRequest<any>, _reply: FastifyReply) => {
    const authHeader = request.headers['authorization'];
    const parts = (authHeader || '')?.split(' ');
    if (!authHeader?.startsWith('Bearer ') || parts?.length !== 2) {
      throw new UnauthorizedError('Invalid authorization header');
    }

    const token = parts[1];
    try {
      request.authPayload = verifyJwt(token);
    } catch (err) {
      console.error('Unable to verify and decode jwt token', err);
      throw new InternalError('Decoding token error');
    }
  });
}
