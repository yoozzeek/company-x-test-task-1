import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { registerDto, loginDto } from '../dto/auth.dto';
import { AuthService } from '../services/auth.service';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

export function initAuthRoutes(authService: AuthService): FastifyPluginAsync {
  return async function authRoutes(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'POST',
      url: '/register',
      schema: {
        summary: 'Register a new user',
        tags: ['Auth'],
        body: z.object({
          email: z.email(),
          password: z.string().min(6),
        }),
        response: {
          201: z.object({
            ok: z.boolean(),
          }),
          400: z.object({
            error: z.string(),
            data: z.array(z.any()),
          }),
          500: z
            .object({
              error: z.string(),
            })
            .describe('InternalError'),
        },
      },
      handler: async (req, res) => {
        const body = registerDto.parse(req.body);
        await authService.register(body);
        res.status(201).send({ ok: true });
      },
    });

    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'POST',
      url: '/login',
      schema: {
        summary: 'Login and receive JWT',
        tags: ['Auth'],
        body: loginDto,
        response: {
          200: z.object({
            token: z.string(),
          }),
          400: z.object({
            error: z.string(),
            data: z.array(z.any()),
          }),
          500: z
            .object({
              error: z.string(),
            })
            .describe('InternalError'),
        },
      },
      handler: async (req, res) => {
        const body = loginDto.parse(req.body);
        const token = await authService.login(body);
        res.send({ token });
      },
    });
  };
}
