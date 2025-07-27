import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { trace } from '@opentelemetry/api';
import { LoginDto, RegisterDto } from '../dto/auth.dto';
import { AuthRepository } from '../repositories/auth.repository';
import { UserService } from './user.service';
import { createSigner } from 'fast-jwt';
import fs from 'fs';
import path from 'path';
import { BadParamsError } from '../common/app.error';

const tracer = trace.getTracer('auth.service');

type AuthJwtClaims = {
  email: string;
};

type SignJwtFn = (userId: string, email: string) => string;

function buildSigner(privKey: Buffer): SignJwtFn {
  return (userId: string, email: string) => {
    const signer = createSigner<AuthJwtClaims>({
      key: privKey,
      algorithm: 'RS256',
      iss: 'api_service',
      sub: userId,
      expiresIn: '1h',
      notBefore: 60,
      // should be provided by caller and saved
      // in db to revoke tokens after.
      jti: uuidv4(),
    });

    return signer({ email });
  };
}

export class AuthService {
  private readonly signJwt: SignJwtFn;

  constructor(
    private repo: AuthRepository,
    private user: UserService,
    privateKeyPath: string
  ) {
    const privKey = fs.readFileSync(path.resolve(privateKeyPath));
    this.signJwt = buildSigner(privKey);
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

        return this.signJwt(user.id, user.email);
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
