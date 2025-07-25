import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { RegisterDto, LoginDto } from '../dto/auth.dto';
import { AuthService } from '../services/auth.service';

export function initAuthRoutes(authService: AuthService): FastifyPluginAsync {
  return async function authRoutes(app: FastifyInstance) {
    app.route({
      method: 'POST',
      url: '/register',
      schema: {
        summary: 'Register a new user',
        tags: ['Auth'],
        body: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
          },
        },
        response: {
          201: {
            type: 'object',
            properties: {
              ok: { type: 'boolean' },
            },
          },
          400: {
            type: 'object',
            properties: {
              error: { type: 'string' },
              data: { type: 'array' },
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
      handler: async (req, res) => {
        const body = RegisterDto.parse(req.body);
        await authService.register(body);
        res.status(201).send({ ok: true });
      },
    });

    app.route({
      method: 'POST',
      url: '/login',
      schema: {
        summary: 'Login and receive JWT',
        tags: ['Auth'],
        body: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              token: { type: 'string' },
            },
          },
          400: {
            type: 'object',
            properties: {
              error: { type: 'string' },
              data: { type: 'array' },
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
      handler: async (req, res) => {
        const body = LoginDto.parse(req.body);
        const token = await authService.login(body);
        res.send({ token });
      },
    });
  };
}
