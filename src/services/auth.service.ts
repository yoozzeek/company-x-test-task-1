import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { trace } from '@opentelemetry/api';
import { LoginDto, RegisterDto } from '../dto/auth.dto';
import { AuthRepository } from '../repositories/auth.repository';
import { UserService } from './user.service';
import { createSigner } from 'fast-jwt';
import fs from 'node:fs';
import path from 'node:path';
import { BadParamsError } from '../common/app.error';
import { SupportedJwtAlgorithms, SupportedJwtAlgorithmType } from '../common/jwt.utils';

const tracer = trace.getTracer('auth.service');

type AuthJwtClaims = {
  email: string;
};

type SignJwtFn = (userId: string, email: string, sessionId: string) => string;

interface JwtSignerOptions {
  secretKey?: string;
  privateKeyPath?: string;
}

function buildSigner(algorithm: SupportedJwtAlgorithmType, key: Buffer | string): SignJwtFn {
  return (userId: string, email: string, sessionId: string) => {
    const signer = createSigner<AuthJwtClaims>({
      key,
      algorithm,
      iss: 'api_service',
      sub: userId,
      expiresIn: '1h',
      notBefore: 60,
      jti: sessionId,
    });

    return signer({ email });
  };
}

export class AuthService {
  private readonly signJwt: SignJwtFn;

  constructor(
    private repo: AuthRepository,
    private user: UserService,
    jwtOptions: JwtSignerOptions
  ) {
    let algorithm: SupportedJwtAlgorithmType;
    let secretKey: string | Buffer;

    if (jwtOptions.privateKeyPath) {
      algorithm = SupportedJwtAlgorithms.RS256;
      secretKey = fs.readFileSync(path.resolve(jwtOptions.privateKeyPath));
    } else if (jwtOptions.secretKey) {
      algorithm = SupportedJwtAlgorithms.HS256;
      secretKey = jwtOptions.secretKey;
    } else {
      throw new Error('Either JWT secret key or RSA private key should be provided for JWT signer');
    }

    this.signJwt = buildSigner(algorithm, secretKey);
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

        // Should be saved in db (auth_sessions table) to revoke tokens after
        const sessionId = uuidv4();

        return this.signJwt(user.id, user.email, sessionId);
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
