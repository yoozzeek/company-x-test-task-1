import { IncomingMessage, ServerResponse } from 'node:http';
import { Server } from 'node:net';
import type { onRequestHookHandler } from 'fastify';

declare module 'fastify' {
  export interface FastifyInstance<
    HttpServer = Server,
    HttpRequest = IncomingMessage,
    HttpResponse = ServerResponse,
  > {
    authenticate: onRequestHookHandler;
  }

  export interface FastifyRequest {
    authPayload?: { id: number; email: string };
  }
}
