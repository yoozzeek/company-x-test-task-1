import type { Pool } from 'pg';
import { trace } from '@opentelemetry/api';
import { NotFoundError } from '../common/app.error';

const tracer = trace.getTracer('auth.repository');

export class AuthRepository {
  constructor(private pgPool: Pool) {}

  public async getPasswordHash(userId: string): Promise<string> {
    return await tracer.startActiveSpan('auth.repository.getPasswordHash', async (span) => {
      const client = await this.pgPool.connect();
      try {
        const { rows, rowCount } = await client.query<{
          password_hash: string;
        }>('SELECT password_hash FROM users WHERE id = $1', [userId]);

        if (!rowCount) {
          const err = new NotFoundError('Password hash not found');
          span.recordException(err);
          throw err;
        }

        return rows[0].password_hash;
      } catch (e) {
        throw e;
      } finally {
        client.release();
        span.end();
      }
    });
  }
}
