import bcrypt from 'bcrypt';
import { trace } from '@opentelemetry/api';
import { LoginDto, RegisterDto } from '../dto/auth.dto';
import { AuthRepository } from '../repositories/auth.repository';
import { UserService } from './user.service';
import { createSigner } from 'fast-jwt';
import fs from 'fs';
import path from 'path';
import { BadParamsError } from '../common/app.error';

const tracer = trace.getTracer('auth.service');

export class AuthService {
  private readonly jwtSigner;

  constructor(
    private repo: AuthRepository,
    private user: UserService,
    privateKeyPath: string
  ) {
    const privKey = fs.readFileSync(path.resolve(privateKeyPath));
    this.jwtSigner = createSigner({
      algorithm: 'RS256',
      key: privKey,
    });
  }

  public async register(data: RegisterDto) {
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

  public async login(data: LoginDto) {
    return await tracer.startActiveSpan('auth.service.login', async (span) => {
      try {
        const user = await this.user.getByEmail(data.email);
        const passwordHash = await this.repo.getPasswordHash(user.id);

        await comparePasswordHash(data.password, passwordHash);

        return this.jwtSigner({ id: user.id, email: user.email });
      } catch (e) {
        span.recordException(e instanceof Error ? e : String(e));
        throw e;
      } finally {
        span.end();
      }
    });
  }
}

async function comparePasswordHash(password: string, hash: string) {
  const ok = await bcrypt.compare(password, hash);
  if (!ok) throw new BadParamsError('Invalid password');
}
