import { FastifyRequest, FastifyReply, FastifyError } from 'fastify';
import {
  hasZodFastifySchemaValidationErrors,
  isResponseSerializationError,
} from 'fastify-type-provider-zod';
import { z, ZodError } from 'zod';

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

export const apiErrorZodObject = z.object({
  error: z.string(),
  message: z.string().optional(),
  data: z.any().optional(),
});

export async function errorHandler(
  err: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  if (err instanceof UnauthorizedError) {
    return reply.status(401).send({ error: 'Unauthorized' });
  }

  if (err instanceof ZodError) {
    return reply.status(400).send({ error: 'BadRequest', data: err.issues });
  }

  if (hasZodFastifySchemaValidationErrors(err)) {
    return reply.code(400).send({
      error: 'ResponseValidationError',
      message: "Request doesn't match the schema",
      data: {
        issues: err.validation,
        method: request.method,
        url: request.url,
      },
    });
  }

  if (err instanceof BadParamsError) {
    return reply.status(400).send({ error: err.message });
  }

  if (err instanceof AccessDeniedError) {
    return reply.status(403).send({ error: 'AccessDenied' });
  }

  if (err instanceof NotFoundError) {
    return reply.status(404).send({ error: 'NotFound' });
  }

  if (err instanceof AlreadyExistsError) {
    return reply.status(409).send({ error: 'Conflict', message: err.message });
  }

  if (isResponseSerializationError(err)) {
    return reply.code(500).send({
      error: 'InternalServerError',
      data: {
        issues: err.cause.issues,
        method: err.method,
        url: err.url,
      },
    });
  }

  console.error('Unhandled error:', err);
  return reply.status(500).send({ error: 'InternalServerError' });
}
