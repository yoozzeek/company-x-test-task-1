import type { Pool, DatabaseError } from 'pg';
import { User } from '../models/user.model';
import { AlreadyExistsError, NotFoundError } from '../common/app.error';
import { trace } from '@opentelemetry/api';

const tracer = trace.getTracer('user.repository');

export class UserRepository {
  constructor(private pgPool: Pool) {}

  public async create(email: string, passwordHash: string): Promise<number> {
    return await tracer.startActiveSpan('user.repository.create', async (span) => {
      const client = await this.pgPool.connect();
      try {
        const { rows } = await client.query(
          `
INSERT INTO users (email, password_hash) VALUES ($1, $2)
RETURNING id
`,
          [email, passwordHash]
        );
        return rows[0];
      } catch (e) {
        const err = e as DatabaseError;

        // https://www.postgresql.org/docs/current/errcodes-appendix.html
        if (err.code === '23505') {
          throw new AlreadyExistsError('UserAlreadyExists');
        }
        throw err;
      } finally {
        client.release();
        span.end();
      }
    });
  }

  public async getByEmail(email: string): Promise<User> {
    return await tracer.startActiveSpan('user.repository.getByEmail', async (span) => {
      const client = await this.pgPool.connect();
      try {
        const { rows, rowCount } = await client.query<User>(
          'SELECT id, email, password_hash, created_at FROM users WHERE email = $1',
          [email]
        );

        if (!rowCount) {
          const err = new NotFoundError('User not found');
          span.recordException(err);
          throw err;
        }

        return rows[0];
      } catch (e) {
        throw e;
      } finally {
        client.release();
        span.end();
      }
    });
  }

  public async listAll() {
    return await tracer.startActiveSpan('user.repository.listAll', async (span) => {
      const client = await this.pgPool.connect();
      try {
        const res = await client.query<User>('SELECT id, email, created_at FROM users');
        return res.rows;
      } catch (e) {
        throw e;
      } finally {
        client.release();
        span.end();
      }
    });
  }
}
