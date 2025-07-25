import type { Pool, DatabaseError } from 'pg';
import { User } from '../models/user.model';
import { AlreadyExistsError } from '../common/app.error';
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

  public async getByEmail(email: string): Promise<User | null> {
    return await tracer.startActiveSpan('user.repository.getByEmail', async (span) => {
      const client = await this.pgPool.connect();
      try {
        const res = await client.query<User>(
          `
SELECT * FROM users WHERE email = $1
`,
          [email]
        );
        return res.rows[0] || null;
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
        const res = await client.query(`
SELECT id, email FROM users
`);
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
