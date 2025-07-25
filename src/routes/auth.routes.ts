import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { RegisterDto, LoginDto } from '../dto/auth.dto';
import { AuthService } from '../services/auth.service';

export function initAuthRoutes(authService: AuthService): FastifyPluginAsync {
  return async function authRoutes(app: FastifyInstance) {
    app.route({
      method: 'POST',
      url: '/register',
      handler: async (req, res) => {
        const body = RegisterDto.parse(req.body);
        await authService.register(body);
        res.status(201).send({ ok: true });
      },
    });

    app.route({
      method: 'POST',
      url: '/login',
      handler: async (req, res) => {
        const body = LoginDto.parse(req.body);
        const token = await authService.login(body);
        res.send({ token });
      },
    });
  };
}
