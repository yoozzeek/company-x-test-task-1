import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { BadParamsError, UnauthorizedError } from '../common/app.error';
import fs from 'node:fs';
import path from 'node:path';
import { createVerifier } from 'fast-jwt';
import fp from 'fastify-plugin';

export default fp(
  async (
    app: FastifyInstance,
    opts: {
      publicKeyPath: string;
    }
  ) => {
    const publicKey = fs.readFileSync(path.resolve(opts.publicKeyPath));
    const verifyJwt = createVerifier({ key: publicKey, algorithms: ['RS256'] });

    app.decorate('authenticate', async (request: FastifyRequest<any>, _reply: FastifyReply) => {
      const authHeader = request.headers['authorization'];
      const parts = (authHeader || '')?.split(' ');
      if (!authHeader?.startsWith('Bearer ') || parts?.length !== 2) {
        throw new UnauthorizedError('Invalid authorization header');
      }

      const token = parts[1];
      try {
        request.authPayload = verifyJwt(token);
      } catch (err) {
        throw new BadParamsError('InvalidToken');
      }
    });
  }
);
