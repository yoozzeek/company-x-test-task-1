import { IncomingMessage, ServerResponse } from 'node:http';
import { Server } from 'node:net';
import type { onRequestHookHandler, preHandlerAsyncHookHandler } from 'fastify';

declare module 'fastify' {
  export interface FastifyInstance<
    HttpServer = Server,
    HttpRequest = IncomingMessage,
    HttpResponse = ServerResponse,
  > {
    authenticate: onRequestHookHandler;
  }

  export interface FastifyRequest {
    authUser?: { id: number; email: string };
  }
}
