import { FastifyRequest, FastifyReply, FastifyError } from 'fastify';
import { ZodError } from 'zod';

export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class InternalError extends AppError {}
export class NotFoundError extends AppError {}
export class AlreadyExistsError extends AppError {}
export class UnauthorizedError extends AppError {}
export class BadParamsError extends AppError {}
export class AccessDeniedError extends AppError {}

export async function errorHandler(err: FastifyError, req: FastifyRequest, res: FastifyReply) {
  if (err instanceof UnauthorizedError) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  if (err instanceof ZodError) {
    return res.status(400).send({ error: 'BadRequest', data: err.message });
  }

  if (err instanceof BadParamsError) {
    return res.status(400).send({ error: err.message });
  }

  if (err instanceof AccessDeniedError) {
    return res.status(403).send({ error: 'AccessDenied' });
  }

  if (err instanceof NotFoundError) {
    return res.status(404).send({ error: 'NotFound' });
  }

  if (err instanceof AlreadyExistsError) {
    return res.status(409).send({ error: 'Conflict', message: err.message });
  }

  console.error('Unhandled error:', err);
  return res.status(500).send({ error: 'InternalServerError' });
}
