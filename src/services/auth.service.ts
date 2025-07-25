import bcrypt from 'bcrypt';
import { trace } from '@opentelemetry/api';
import { LoginDtoType, RegisterDtoType } from '../dto/auth.dto';
import { AuthRepository } from '../repositories/auth.repository';
import { UserService } from './user.service';
import { InvalidPasswordError, NotFoundError, UserNotExists } from '../common/app.error';

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
    return await tracer.startActiveSpan('auth.service.login', async (span) => {
      try {
        const user = await this.user.getByEmail(data.email);
        if (!user) throw new UserNotExists('User not found');

        const passwordHash = await this.repo.getPasswordHash(user.id);
        if (!passwordHash) throw new NotFoundError('Password hash not found');

        const isValid = await bcrypt.compare(data.password, passwordHash);
        if (!isValid) throw new InvalidPasswordError('Invalid password');

        return this.signJWT({ id: user.id, email: user.email });
      } catch (e) {
        span.recordException(e instanceof Error ? e : String(e));
        throw e;
      } finally {
        span.end();
      }
    });
  }
}
