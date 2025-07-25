import { UserRepository } from '../repositories/user.repository';
import { trace } from '@opentelemetry/api';

const tracer = trace.getTracer('user.service');

export class UserService {
  constructor(private repo: UserRepository) {}

  public async create(email: string, password: string) {
    await tracer.startActiveSpan('user.service.create', async (span) => {
      try {
        await this.repo.create(email, password);
      } catch (e) {
        span.recordException(e as Error);
        throw e;
      } finally {
        span.end();
      }
    });
  }

  public async getById(id: number) {}

  public async getByEmail(email: string) {
    return await tracer.startActiveSpan('user.service.getByEmail', async (span) => {
      try {
        return this.repo.getByEmail(email);
      } catch (e) {
        span.recordException(e as Error);
        throw e;
      } finally {
        span.end();
      }
    });
  }

  public async search() {
    return await tracer.startActiveSpan('user.service.search', async (span) => {
      try {
        return this.repo.listAll();
      } catch (e) {
        span.recordException(e as Error);
        throw e;
      } finally {
        span.end();
      }
    });
  }
}
