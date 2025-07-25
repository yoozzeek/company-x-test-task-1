import bcrypt from 'bcrypt';
import { trace } from '@opentelemetry/api';
import { LoginDtoType, RegisterDtoType } from '../dto/auth.dto';
import { AuthRepository } from '../repositories/auth.repository';
import { UserService } from './user.service';
import { NotFoundError } from '../common/app.error';

const tracer = trace.getTracer('auth.service');

export class AuthService {
  constructor(
    private repo: AuthRepository,
    private user: UserService,
    private signJWT: (payload: object) => string
  ) {}

  public async register(data: RegisterDtoType) {
    await tracer.startActiveSpan('user.service.register', async (span) => {
      try {
        const passwordHash = await bcrypt.hash(data.password, 10);
        await this.user.create(data.email, passwordHash);
      } catch (e) {
        span.recordException(e as Error);
        throw e;
      } finally {
        span.end();
      }
    });
  }

  public async login(data: LoginDtoType) {
    await tracer.startActiveSpan('auth.service.login', async (span) => {
      try {
        const user = await this.user.getByEmail(data.email);
        if (!user) throw new Error('Invalid email');

        const passwordHash = await this.repo.getPasswordHash(user.id);
        if (!passwordHash) throw new NotFoundError('User not found');

        const isValid = await bcrypt.compare(data.password, passwordHash);
        if (!isValid) throw new Error('Invalid password');

        return this.signJWT({ id: user.id, email: user.email });
      } finally {
        span.end();
      }
    });
  }
}
