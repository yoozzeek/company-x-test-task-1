import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { BadParamsError, InternalError, UnauthorizedError } from '../common/app.error';
import fs from 'node:fs';
import { createVerifier, TokenError } from 'fast-jwt';
import fp from 'fastify-plugin';
import { SupportedJwtAlgorithms, SupportedJwtAlgorithmType } from '../common/jwt.utils';

export interface JwtAuthPluginOptions {
  secretKey?: string;
  publicKeyPath?: string;
}

export default fp(async (app: FastifyInstance, opts: JwtAuthPluginOptions) => {
  let algorithm: SupportedJwtAlgorithmType;
  let key: string | Buffer;

  if (!opts.secretKey && !opts.publicKeyPath) {
    throw new Error('Either JWT secret key or RSA public key should be provided for JWT verifier');
  }

  if (opts.publicKeyPath) {
    algorithm = SupportedJwtAlgorithms.RS256;
    key = fs.readFileSync(opts.publicKeyPath);
  } else if (opts.secretKey) {
    algorithm = SupportedJwtAlgorithms.HS256;
    key = opts.secretKey!;
  } else {
    throw new Error('Either JWT secret key or RSA private key should be provided for JWT signer');
  }

  const verifyJwt = createVerifier({
    key,
    algorithms: [algorithm],
    allowedIss: 'api_service',
    requiredClaims: ['email'],
  });

  app.decorate('authenticate', async (request: FastifyRequest<any>, _reply: FastifyReply) => {
    const { tracer } = request.opentelemetry();
    const span = tracer.startSpan('jwt.plugin.authenticate');

    const authHeader = request.headers['authorization'];
    const parts = (authHeader || '')?.split(' ');
    if (!authHeader?.startsWith('Bearer ') || parts?.length !== 2) {
      const err = new UnauthorizedError('Invalid authorization header');
      span.recordException(err);
      span.end();
      throw err;
    }

    const token = parts[1];
    try {
      request.authPayload = verifyJwt(token);
    } catch (err) {
      const { code } = err as TokenError;
      switch (code) {
        case 'FAST_JWT_VERIFY_ERROR':
          throw new InternalError('VerifyError');
        case 'FAST_JWT_EXPIRED':
          throw new BadParamsError('TokenExpired');
        case 'FAST_JWT_INVALID_SIGNATURE':
          throw new BadParamsError('InvalidSignature');
        case 'FAST_JWT_MALFORMED':
          throw new BadParamsError('JwtMalformed');
        default:
          throw new BadParamsError('InvalidToken');
      }
    } finally {
      span.end();
    }
  });
});
